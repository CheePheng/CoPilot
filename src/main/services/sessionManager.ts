import { EventEmitter } from 'events'
import { audioCaptureService } from './audioCapture'
import { questionDetector, type DetectedQuestion } from './questionDetector'
import type { UserProfile } from './promptBuilder'
import type { AIProvider, STTProvider, TranscriptResult } from './types'
import { windowManager } from '../windows/windowManager'

export type SessionState = 'idle' | 'active' | 'paused'

export class SessionManager extends EventEmitter {
  private state: SessionState = 'idle'
  private profile: UserProfile | null = null
  private transcriptHistory: TranscriptResult[] = []
  private aiProvider: AIProvider | null = null
  private sttProvider: STTProvider | null = null

  setProfile(profile: UserProfile | null): void {
    this.profile = profile
  }

  setAIProvider(provider: AIProvider): void {
    this.aiProvider = provider
  }

  setSTTProvider(provider: STTProvider): void {
    this.sttProvider = provider
  }

  async startSession(): Promise<void> {
    if (this.state === 'active') return
    if (!this.aiProvider) throw new Error('No AI provider configured')
    if (!this.sttProvider) throw new Error('No STT provider configured')

    this.state = 'active'
    this.transcriptHistory = []
    questionDetector.reset()

    this.setupPipeline()
    audioCaptureService.start()
    await this.sttProvider.startStreaming()

    this.broadcastStatus('listening')
  }

  async stopSession(): Promise<void> {
    this.state = 'idle'

    audioCaptureService.stop()
    await this.sttProvider?.stopStreaming()
    this.aiProvider?.cancelCurrent()
    questionDetector.reset()

    this.removeAllPipelineListeners()
    this.broadcastStatus('idle')
  }

  pauseSession(): void {
    if (this.state !== 'active') return
    this.state = 'paused'
    this.broadcastStatus('paused')
  }

  resumeSession(): void {
    if (this.state !== 'paused') return
    this.state = 'active'
    this.broadcastStatus('listening')
  }

  getState(): SessionState {
    return this.state
  }

  getTranscriptHistory(): TranscriptResult[] {
    return this.transcriptHistory
  }

  private setupPipeline(): void {
    this.removeAllPipelineListeners()

    const stt = this.sttProvider!
    const ai = this.aiProvider!

    // Prevent MaxListeners warnings
    audioCaptureService.setMaxListeners(20)
    stt.setMaxListeners(20)
    questionDetector.setMaxListeners(20)
    ai.setMaxListeners(20)

    // Audio chunks → STT provider
    audioCaptureService.on('audio-chunk', (chunk: Buffer) => {
      if (this.state === 'active') {
        stt.sendAudio(chunk)
      }
    })

    // STT transcripts → question detector + UI
    stt.on('transcript', (result: TranscriptResult) => {
      this.transcriptHistory.push(result)
      questionDetector.addTranscript(result)

      const entry = {
        id: result.id,
        speaker: result.speaker === 0 ? 'interviewer' : 'user',
        text: result.text,
        timestamp: result.timestamp,
        isFinal: result.isFinal,
        isQuestion: false
      }
      windowManager.sendToAll('transcript:update', entry)

      if (result.isFinal) {
        windowManager.sendToAll('transcript:final', entry)
      }
    })

    // Utterance end → question detection
    stt.on('utterance-end', (result: TranscriptResult) => {
      questionDetector.onUtteranceEnd(result)
    })

    // Detected question → AI provider
    questionDetector.on('question', async (question: DetectedQuestion) => {
      const entry = {
        id: question.id,
        speaker: 'interviewer',
        text: question.text,
        timestamp: question.timestamp,
        isFinal: true,
        isQuestion: true
      }
      windowManager.sendToAll('transcript:update', entry)
      this.broadcastStatus('processing')

      const recentContext = questionDetector.getRecentContext()
      await ai.streamAnswer(question, recentContext, this.profile)
    })

    // AI stream → UI
    ai.on('stream-chunk', (data: { text: string; done: boolean }) => {
      windowManager.sendToAll('ai:stream-chunk', data)
    })

    ai.on('answer-complete', (answer: unknown) => {
      windowManager.sendToAll('ai:answer-complete', answer)
      this.broadcastStatus('listening')
    })

    ai.on('status', (status: string) => {
      if (status === 'generating') {
        this.broadcastStatus('answering')
      }
    })
  }

  private removeAllPipelineListeners(): void {
    audioCaptureService.removeAllListeners('audio-chunk')
    this.sttProvider?.removeAllListeners('transcript')
    this.sttProvider?.removeAllListeners('utterance-end')
    questionDetector.removeAllListeners('question')
    this.aiProvider?.removeAllListeners('stream-chunk')
    this.aiProvider?.removeAllListeners('answer-complete')
    this.aiProvider?.removeAllListeners('status')
  }

  private broadcastStatus(status: string): void {
    windowManager.sendToAll('session:status', status)
    this.emit('status', status)
  }
}

export const sessionManager = new SessionManager()
