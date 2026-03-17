import { desktopCapturer } from 'electron'
import { EventEmitter } from 'events'

export interface AudioCaptureOptions {
  sampleRate?: number
  channelCount?: number
}

export class AudioCaptureService extends EventEmitter {
  private isCapturing = false

  async getAvailableSources() {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window']
    })
    return sources.map((s) => ({ id: s.id, name: s.name }))
  }

  start(): void {
    this.isCapturing = true
    this.emit('status', 'capturing')
  }

  stop(): void {
    this.isCapturing = false
    this.emit('status', 'stopped')
  }

  getIsCapturing(): boolean {
    return this.isCapturing
  }

  // Audio chunks from renderer are forwarded here via IPC
  handleAudioChunk(chunk: Buffer): void {
    if (!this.isCapturing) return
    this.emit('audio-chunk', chunk)
  }
}

export const audioCaptureService = new AudioCaptureService()
