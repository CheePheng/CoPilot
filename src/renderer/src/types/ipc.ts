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
export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp'

export interface CodingRequest {
  questionText: string
  language: SupportedLanguage
  inputMethod: 'paste' | 'manual' | 'screenshot'
  context?: string
}

export interface CodingResponse {
  code: string
  explanation: string
  timeComplexity: string
  spaceComplexity: string
  language: SupportedLanguage
}

export interface SessionRecord {
  id: string
  type: 'interview' | 'coding'
  date: string
  duration: number
  questionCount: number
  questions: Array<{ question: string; answer: string; type: string }>
  transcript: Array<{ speaker: string; text: string; timestamp: number }>
  metrics: {
    avgScore?: number
    questionTypeBreakdown: Record<string, number>
  }
}

export interface MockEvaluation {
  clarity: number
  evidence: number
  structure: number
  authenticity: number
  strengths: string[]
  improvements: string[]
  goldAnswer: string
}

export interface MockConfig {
  targetRole: string
  focusAreas: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  previousQuestions: string[]
}

export interface ImageData {
  base64: string
  mimeType: string
}

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
      ghost: {
        toggle: () => Promise<boolean>
        getStatus: () => Promise<boolean>
        set: (enabled: boolean) => Promise<boolean>
        onStatusChange: (callback: (enabled: boolean) => void) => () => void
      }
      storage: {
        get: (key: string) => Promise<unknown>
        set: (key: string, value: unknown) => Promise<{ success: boolean }>
        getAll: () => Promise<Record<string, unknown>>
      }
      profile: {
        sync: (profile: unknown) => Promise<{ success: boolean }>
      }
      coding: {
        generate: (request: CodingRequest) => Promise<{ success: boolean }>
        cancel: () => Promise<{ success: boolean }>
        onStreamChunk: (callback: (data: StreamChunk) => void) => () => void
        onComplete: (callback: (data: CodingResponse) => void) => () => void
        onError: (callback: (error: string) => void) => () => void
        pickImage: () => Promise<ImageData | null>
        captureScreen: () => Promise<ImageData | null>
        generateFromImage: (request: CodingRequest & { image: ImageData }) => Promise<{ success: boolean }>
      }
      history: {
        get: () => Promise<SessionRecord[]>
        delete: (id: string) => Promise<void>
        clear: () => Promise<void>
      }
      mock: {
        generateQuestion: (config: MockConfig) => Promise<{ success: boolean }>
        evaluate: (data: { question: string; answer: string; config: MockConfig }) => Promise<{ success: boolean }>
        cancel: () => Promise<{ success: boolean }>
        onQuestionChunk: (callback: (data: StreamChunk) => void) => () => void
        onQuestionReady: (callback: (data: { question: string }) => void) => () => void
        onEvalChunk: (callback: (data: StreamChunk) => void) => () => void
        onEvalComplete: (callback: (data: MockEvaluation) => void) => () => void
        onError: (callback: (error: string) => void) => () => void
      }
      transcript?: {
        onUpdate: (callback: (data: TranscriptEntry) => void) => () => void
        onFinal: (callback: (data: TranscriptEntry) => void) => () => void
      }
    }
  }
}
