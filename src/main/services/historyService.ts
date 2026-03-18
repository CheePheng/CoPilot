import { EventEmitter } from 'events'
import { storageService } from './storageService'

const HISTORY_KEY = 'sessionHistory'

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

class HistoryService extends EventEmitter {
  private currentSessionId: string | null = null
  private currentSessionType: 'interview' | 'coding' = 'interview'
  private startTime: number = 0
  private detectedQuestions: Array<{ question: string; answer: string; type: string }> = []
  private transcriptEntries: Array<{ speaker: string; text: string; timestamp: number }> = []

  beginSession(type: 'interview' | 'coding'): void {
    this.currentSessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    this.currentSessionType = type
    this.startTime = Date.now()
    this.detectedQuestions = []
    this.transcriptEntries = []
  }

  recordQuestion(question: string, answer: string, type: string): void {
    if (!this.currentSessionId) return
    this.detectedQuestions.push({ question, answer, type })
  }

  recordTranscript(speaker: string, text: string, timestamp: number): void {
    if (!this.currentSessionId) return
    this.transcriptEntries.push({ speaker, text, timestamp })
  }

  endSession(): SessionRecord | null {
    if (!this.currentSessionId) return null

    const duration = Math.floor((Date.now() - this.startTime) / 1000)

    const typeBreakdown: Record<string, number> = {}
    for (const q of this.detectedQuestions) {
      typeBreakdown[q.type] = (typeBreakdown[q.type] || 0) + 1
    }

    const record: SessionRecord = {
      id: this.currentSessionId,
      type: this.currentSessionType,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      duration,
      questionCount: this.detectedQuestions.length,
      questions: [...this.detectedQuestions],
      transcript: [...this.transcriptEntries],
      metrics: {
        questionTypeBreakdown: typeBreakdown
      }
    }

    const history = this.getHistory()
    history.unshift(record)
    if (history.length > 100) history.length = 100
    storageService.set(HISTORY_KEY, history)

    this.currentSessionId = null
    this.detectedQuestions = []
    this.transcriptEntries = []

    return record
  }

  getHistory(): SessionRecord[] {
    const data = storageService.get(HISTORY_KEY)
    return Array.isArray(data) ? (data as SessionRecord[]) : []
  }

  deleteSession(id: string): void {
    const history = this.getHistory().filter((s) => s.id !== id)
    storageService.set(HISTORY_KEY, history)
  }

  clearHistory(): void {
    storageService.set(HISTORY_KEY, [])
  }
}

export const historyService = new HistoryService()
