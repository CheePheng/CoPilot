import { useEffect, useRef, useCallback, useState } from 'react'

// Web Speech API types (not in all TS libs)
interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

export function useWebSpeech(enabled: boolean, language: string = 'en-US') {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const [isListening, setIsListening] = useState(false)

  const sendResult = useCallback(
    (text: string, isFinal: boolean, confidence: number) => {
      const result = {
        id: `ws-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text,
        speaker: 0,
        isFinal,
        timestamp: Date.now(),
        confidence
      }

      // Send to main process via IPC
      window.copilot?.stt?.sendWebSpeechResult?.(result)
    },
    []
  )

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error('Web Speech API not supported')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language

    recognition.onstart = () => {
      setIsListening(true)
      window.copilot?.stt?.sendWebSpeechStatus?.('started')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const alt = result[0]
        if (alt.transcript.trim()) {
          sendResult(alt.transcript.trim(), result.isFinal, alt.confidence)
        }
      }
    }

    recognition.onerror = (event: { error: string }) => {
      // 'no-speech' and 'aborted' are expected during normal usage
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error)
        window.copilot?.stt?.sendWebSpeechStatus?.('error')
      }
    }

    recognition.onend = () => {
      // Auto-restart if still enabled (Web Speech API stops after silence)
      if (enabled && isListening) {
        try {
          recognition.start()
        } catch {
          setIsListening(false)
          window.copilot?.stt?.sendWebSpeechStatus?.('stopped')
        }
      } else {
        setIsListening(false)
        window.copilot?.stt?.sendWebSpeechStatus?.('stopped')
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [language, enabled, isListening, sendResult])

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort()
      recognitionRef.current = null
      setIsListening(false)
    }
  }, [])

  // Auto-start/stop based on enabled prop
  useEffect(() => {
    if (enabled && !isListening) {
      start()
    } else if (!enabled && isListening) {
      stop()
    }

    return () => {
      stop()
    }
  }, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return { isListening, start, stop }
}
