import { useState, useCallback, useRef } from 'react'

export function useAudioCapture() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const streamRef = useRef<MediaStream | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const contextRef = useRef<AudioContext | null>(null)

  const enumerateDevices = useCallback(async () => {
    const allDevices = await navigator.mediaDevices.enumerateDevices()
    const audioInputs = allDevices.filter((d) => d.kind === 'audioinput')
    setDevices(audioInputs)
    if (audioInputs.length > 0 && !selectedDevice) {
      setSelectedDevice(audioInputs[0].deviceId)
    }
  }, [selectedDevice])

  const startCapture = useCallback(
    async (deviceId?: string) => {
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: deviceId || selectedDevice ? { exact: deviceId || selectedDevice } : undefined,
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      const audioContext = new AudioContext({ sampleRate: 16000 })
      contextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)

      // Use ScriptProcessorNode for audio chunk extraction
      // (AudioWorklet would be better for production but this is simpler for MVP)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256

      source.connect(analyser)
      analyser.connect(processor)
      processor.connect(audioContext.destination)

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0)

        // Calculate audio level for meter
        let sum = 0
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i]
        }
        const rms = Math.sqrt(sum / inputData.length)
        setAudioLevel(Math.min(1, rms * 10))

        // Convert float32 to int16 PCM
        const pcm16 = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]))
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
        }

        // Send to main process
        window.copilot?.audio?.sendChunk?.(pcm16.buffer)
      }

      setIsCapturing(true)
    },
    [selectedDevice]
  )

  const stopCapture = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    if (contextRef.current) {
      contextRef.current.close()
      contextRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
    setAudioLevel(0)
  }, [])

  return {
    isCapturing,
    audioLevel,
    devices,
    selectedDevice,
    setSelectedDevice,
    enumerateDevices,
    startCapture,
    stopCapture
  }
}
