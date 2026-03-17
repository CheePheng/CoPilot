import { EventEmitter } from 'events'
import type { TranscriptResult } from './types'

export interface DetectedQuestion {
  id: string
  text: string
  confidence: 'high' | 'medium' | 'low'
  type: 'behavioral' | 'technical' | 'situational' | 'general'
  timestamp: number
}

const INTERROGATIVE_PATTERNS = [
  /^(what|how|why|when|where|who|which|whose|whom)\b/i,
  /^(can|could|would|should|do|does|did|is|are|was|were|will|have|has|had)\b.*\?$/i,
  /^(tell me about|describe|explain|walk me through|give me an example)/i,
  /^(have you ever|what would you|how would you|what do you think)/i
]

const BEHAVIORAL_PATTERNS = [
  /tell me about a time/i,
  /give me an example of/i,
  /describe a situation/i,
  /have you ever (had to|dealt with|faced|experienced)/i,
  /what would you do if/i,
  /how (did|do|would) you (handle|deal with|approach|manage|resolve)/i,
  /walk me through/i,
  /what('s| is| was) (your|a) (biggest|greatest|most|worst)/i
]

const TECHNICAL_PATTERNS = [
  /\b(algorithm|data structure|complexity|big o|time complexity|space complexity)\b/i,
  /\b(design|architect|implement|build|code|debug|optimize)\b/i,
  /\b(api|database|sql|system design|microservice|cache|scalab)/i,
  /\b(javascript|typescript|python|java|react|node|aws|docker|kubernetes)\b/i,
  /\b(difference between|compare|trade.?off|pros and cons)\b/i
]

export class QuestionDetector extends EventEmitter {
  private recentTranscripts: TranscriptResult[] = []
  private debounceTimer: NodeJS.Timeout | null = null
  private lastDetectedText: string = ''

  addTranscript(transcript: TranscriptResult): void {
    if (!transcript.isFinal) return

    this.recentTranscripts.push(transcript)

    // Keep only last 30 seconds of transcripts
    const cutoff = Date.now() - 30000
    this.recentTranscripts = this.recentTranscripts.filter((t) => t.timestamp > cutoff)
  }

  onUtteranceEnd(transcript: TranscriptResult): void {
    // Debounce to avoid rapid-fire detection
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      this.detectQuestion(transcript)
    }, 300)
  }

  private detectQuestion(transcript: TranscriptResult): void {
    const text = transcript.text.trim()
    if (!text || text.length < 10) return
    if (text === this.lastDetectedText) return

    const confidence = this.getConfidence(text)
    if (confidence === 'none') return

    this.lastDetectedText = text
    const type = this.classifyQuestion(text)

    const question: DetectedQuestion = {
      id: `q-${Date.now()}`,
      text,
      confidence,
      type,
      timestamp: Date.now()
    }

    this.emit('question', question)
  }

  private getConfidence(text: string): 'high' | 'medium' | 'low' | 'none' {
    // High: explicit question mark
    if (text.endsWith('?')) {
      return 'high'
    }

    // Medium: interrogative patterns without question mark
    for (const pattern of INTERROGATIVE_PATTERNS) {
      if (pattern.test(text)) {
        return 'medium'
      }
    }

    // Medium: behavioral interview patterns
    for (const pattern of BEHAVIORAL_PATTERNS) {
      if (pattern.test(text)) {
        return 'medium'
      }
    }

    return 'none'
  }

  private classifyQuestion(text: string): DetectedQuestion['type'] {
    for (const pattern of BEHAVIORAL_PATTERNS) {
      if (pattern.test(text)) return 'behavioral'
    }

    for (const pattern of TECHNICAL_PATTERNS) {
      if (pattern.test(text)) return 'technical'
    }

    if (/what would you do|how would you (handle|approach|deal)/i.test(text)) {
      return 'situational'
    }

    return 'general'
  }

  getRecentContext(): string {
    return this.recentTranscripts.map((t) => t.text).join(' ')
  }

  reset(): void {
    this.recentTranscripts = []
    this.lastDetectedText = ''
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }
}

export const questionDetector = new QuestionDetector()
