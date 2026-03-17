import { EventEmitter } from 'events'
import type { DetectedQuestion } from './questionDetector'
import type { UserProfile } from './promptBuilder'

export interface TranscriptResult {
  id: string
  text: string
  speaker: number
  isFinal: boolean
  timestamp: number
  confidence: number
}

export interface AnswerResult {
  answerType: string
  clarifyingQuestion?: string
  keyPoints: string[]
  suggestedAnswer: string
  followUpPrep: string[]
  relevantStory?: string
  riskFlags?: string[]
}

// Events: 'stream-chunk', 'answer-complete', 'status', 'error'
export interface AIProvider extends EventEmitter {
  streamAnswer(
    question: DetectedQuestion,
    recentContext: string,
    profile: UserProfile | null
  ): Promise<void>
  cancelCurrent(): void
  isConfigured(): boolean
}

// Events: 'transcript', 'utterance-end', 'utterance-boundary', 'status', 'error'
export interface STTProvider extends EventEmitter {
  startStreaming(): Promise<void>
  sendAudio(chunk: Buffer): void
  stopStreaming(): Promise<void>
  isConnected(): boolean
}

export type AIProviderType = 'ollama' | 'claude'
export type STTProviderType = 'web-speech' | 'deepgram'
