import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'
import type { LiveClient } from '@deepgram/sdk'
import { EventEmitter } from 'events'
import type { STTProvider, TranscriptResult } from './types'

export { type TranscriptResult } from './types'

export class DeepgramService extends EventEmitter implements STTProvider {
  private client: ReturnType<typeof createClient> | null = null
  private connection: LiveClient | null = null
  private apiKey: string = ''

  setApiKey(key: string): void {
    this.apiKey = key
    this.client = createClient(key)
  }

  async startStreaming(): Promise<void> {
    if (!this.client) {
      throw new Error('Deepgram API key not set')
    }

    this.connection = this.client.listen.live({
      model: 'nova-2',
      language: 'en',
      smart_format: true,
      punctuate: true,
      interim_results: true,
      utterance_end_ms: 1200,
      vad_events: true,
      diarize: true,
      encoding: 'linear16',
      sample_rate: 16000,
      channels: 1
    })

    this.connection.on(LiveTranscriptionEvents.Open, () => {
      this.emit('status', 'connected')
    })

    this.connection.on(LiveTranscriptionEvents.Transcript, (data: unknown) => {
      const result = data as {
        is_final: boolean
        speech_final: boolean
        channel: {
          alternatives: Array<{
            transcript: string
            confidence: number
            words: Array<{
              word: string
              speaker: number
              start: number
              end: number
            }>
          }>
        }
      }

      const alternative = result.channel?.alternatives?.[0]
      if (!alternative?.transcript) return

      const speaker = alternative.words?.[0]?.speaker ?? 0

      const transcriptResult: TranscriptResult = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: alternative.transcript,
        speaker,
        isFinal: result.is_final,
        timestamp: Date.now(),
        confidence: alternative.confidence
      }

      this.emit('transcript', transcriptResult)

      if (result.speech_final) {
        this.emit('utterance-end', transcriptResult)
      }
    })

    this.connection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
      this.emit('utterance-boundary')
    })

    this.connection.on(LiveTranscriptionEvents.Error, (error: unknown) => {
      this.emit('error', error)
    })

    this.connection.on(LiveTranscriptionEvents.Close, () => {
      this.emit('status', 'disconnected')
    })
  }

  sendAudio(chunk: Buffer): void {
    if (this.connection) {
      this.connection.send(chunk)
    }
  }

  async stopStreaming(): Promise<void> {
    if (this.connection) {
      this.connection.requestClose()
      this.connection = null
    }
  }

  isConnected(): boolean {
    return this.connection !== null
  }
}

export const deepgramService = new DeepgramService()
