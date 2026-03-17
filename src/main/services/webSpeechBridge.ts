import { EventEmitter } from 'events'
import { ipcMain } from 'electron'
import type { STTProvider, TranscriptResult } from './types'

/**
 * Web Speech API runs in the renderer (Chromium browser context).
 * This bridge receives transcript results via IPC and emits them
 * as events matching the STTProvider interface.
 */
export class WebSpeechBridge extends EventEmitter implements STTProvider {
  private connected = false
  private registered = false

  registerIpc(): void {
    if (this.registered) return
    this.registered = true

    ipcMain.on('stt:web-speech-result', (_event, data: TranscriptResult) => {
      this.emit('transcript', data)

      if (data.isFinal) {
        this.emit('utterance-end', data)
      }
    })

    ipcMain.on('stt:web-speech-status', (_event, status: string) => {
      if (status === 'started') {
        this.connected = true
        this.emit('status', 'connected')
      } else if (status === 'stopped') {
        this.connected = false
        this.emit('status', 'disconnected')
      } else if (status === 'error') {
        this.emit('error', new Error('Web Speech API error'))
      }
    })
  }

  async startStreaming(): Promise<void> {
    // The renderer will start Web Speech API when it receives session:status = 'listening'
    // We just mark ourselves as connected
    this.connected = true
    this.emit('status', 'connected')
  }

  sendAudio(_chunk: Buffer): void {
    // Web Speech API handles its own audio capture in the browser
    // No audio chunks need to be sent
  }

  async stopStreaming(): Promise<void> {
    this.connected = false
    this.emit('status', 'disconnected')
  }

  isConnected(): boolean {
    return this.connected
  }
}

export const webSpeechBridge = new WebSpeechBridge()
