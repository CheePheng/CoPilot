export interface TranscriptEntry {
  id: string
  speaker: 'user' | 'interviewer' | 'unknown'
  text: string
  timestamp: number
  isFinal: boolean
  isQuestion: boolean
}

export interface AnswerCard {
  answerType: 'behavioral' | 'technical' | 'situational' | 'general'
  keyPoints: string[]
  suggestedAnswer: string
  followUpPrep: string[]
  relevantStory?: string
  codeSnippet?: string
}

export interface StreamChunk {
  text: string
  done: boolean
}

export type SessionStatus = 'idle' | 'listening' | 'processing' | 'answering' | 'paused'
export type AIProviderType = 'ollama' | 'claude'
export type STTProviderType = 'web-speech' | 'deepgram'

declare global {
  interface Window {
    copilot: {
      overlay: {
        toggle: () => Promise<void>
        setOpacity: (opacity: number) => Promise<void>
        setClickThrough?: (enabled: boolean) => Promise<void>
        mouseEnter?: () => void
        mouseLeave?: () => void
      }
      session: {
        start: () => Promise<{ success: boolean }>
        stop: () => Promise<{ success: boolean }>
        pause: () => Promise<{ success: boolean }>
        resume: () => Promise<{ success: boolean }>
        getState: () => Promise<string>
        onStatusChange: (callback: (status: string) => void) => () => void
      }
      audio: {
        sendChunk: (chunk: ArrayBuffer) => void
        getSources: () => Promise<Array<{ id: string; name: string }>>
        onTranscriptUpdate: (callback: (data: TranscriptEntry) => void) => () => void
        onTranscriptFinal: (callback: (data: TranscriptEntry) => void) => () => void
      }
      ai: {
        setProvider: (provider: AIProviderType) => Promise<{ success: boolean }>
        setApiKey: (key: string) => Promise<{ success: boolean }>
        setModel: (model: string) => Promise<{ success: boolean }>
        isConfigured: () => Promise<boolean>
        getProviders: () => Promise<{ ai: AIProviderType; stt: STTProviderType }>
        cancel: () => Promise<{ success: boolean }>
        onStreamChunk: (callback: (data: StreamChunk) => void) => () => void
        onAnswerComplete: (callback: (data: AnswerCard) => void) => () => void
      }
      stt: {
        setProvider: (provider: STTProviderType) => Promise<{ success: boolean }>
        setApiKey: (key: string) => Promise<{ success: boolean }>
        sendWebSpeechResult: (result: unknown) => void
        sendWebSpeechStatus: (status: string) => void
      }
      ollama: {
        setUrl: (url: string) => Promise<{ success: boolean }>
        listModels: () => Promise<string[]>
        checkConnection: () => Promise<boolean>
      }
      transcript?: {
        onUpdate: (callback: (data: TranscriptEntry) => void) => () => void
        onFinal: (callback: (data: TranscriptEntry) => void) => () => void
      }
    }
  }
}
