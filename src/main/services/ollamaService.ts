import { EventEmitter } from 'events'
import { buildSystemPrompt, buildAnswerPrompt } from './promptBuilder'
import type { UserProfile } from './promptBuilder'
import type { DetectedQuestion } from './questionDetector'
import type { AIProvider, AnswerResult } from './types'
import { extractJson } from './jsonParser'

const JSON_INSTRUCTION = `

IMPORTANT: You must respond with ONLY valid JSON in this exact format (no markdown, no code blocks, no extra text):
{"answer_type":"behavioral|technical|situational|general","key_points":["point1","point2","point3"],"suggested_answer":"your full answer here","follow_up_prep":["follow-up question 1","follow-up question 2"]}`

export class OllamaService extends EventEmitter implements AIProvider {
  private baseUrl: string = 'http://localhost:11434'
  private model: string = 'llama3.1:8b'
  private currentAbortController: AbortController | null = null

  setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, '')
  }

  setModel(model: string): void {
    this.model = model
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  getModel(): string {
    return this.model
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      if (!response.ok) return []
      const data = (await response.json()) as { models: Array<{ name: string }> }
      return data.models?.map((m) => m.name) || []
    } catch {
      return []
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      return response.ok
    } catch {
      return false
    }
  }

  async streamAnswer(
    question: DetectedQuestion,
    recentContext: string,
    profile: UserProfile | null
  ): Promise<void> {
    this.cancelCurrent()
    this.currentAbortController = new AbortController()

    const systemPrompt = buildSystemPrompt(profile)
    const userMessage = buildAnswerPrompt(question, recentContext) + JSON_INSTRUCTION

    try {
      this.emit('status', 'generating')

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          stream: true,
          options: {
            temperature: 0.7,
            num_predict: 1024
          }
        }),
        signal: this.currentAbortController.signal
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ollama error ${response.status}: ${errorText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullText = ''

      // Stream timeout: abort if no chunk received in 30s
      let timeoutTimer: ReturnType<typeof setTimeout> | null = null
      const resetTimeout = () => {
        if (timeoutTimer) clearTimeout(timeoutTimer)
        timeoutTimer = setTimeout(() => {
          this.currentAbortController?.abort()
        }, 30000)
      }

      try {
        resetTimeout()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          resetTimeout()

          const chunk = decoder.decode(value, { stream: true })
          // Ollama streams NDJSON (one JSON object per line)
          const lines = chunk.split('\n').filter((l) => l.trim())

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line) as {
                message?: { content: string }
                done: boolean
              }
              if (parsed.message?.content) {
                fullText += parsed.message.content
                this.emit('stream-chunk', { text: parsed.message.content, done: false })
              }
            } catch {
              // Skip malformed lines
            }
          }
        }
      } finally {
        if (timeoutTimer) clearTimeout(timeoutTimer)
        reader.releaseLock()
      }

      // Try to parse structured JSON from the full response
      const result = this.parseAnswerResult(fullText, question.type)
      this.emit('answer-complete', result)
      this.emit('stream-chunk', { text: '', done: true })
      this.emit('status', 'idle')
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        this.emit('error', new Error('Stream timed out — no response from Ollama in 30 seconds'))
        this.emit('status', 'error')
        return
      }
      this.emit('error', error)
      this.emit('status', 'error')
    } finally {
      this.currentAbortController = null
    }
  }

  private parseAnswerResult(text: string, fallbackType: string): AnswerResult {
    try {
      const jsonStr = extractJson(text)
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr) as Record<string, unknown>
        return {
          answerType: (parsed.answer_type as string) || fallbackType,
          keyPoints: Array.isArray(parsed.key_points) ? (parsed.key_points as string[]) : [],
          suggestedAnswer: (parsed.suggested_answer as string) || text,
          followUpPrep: Array.isArray(parsed.follow_up_prep)
            ? (parsed.follow_up_prep as string[])
            : [],
          relevantStory: parsed.relevant_story as string | undefined,
          riskFlags: Array.isArray(parsed.risk_flags) ? (parsed.risk_flags as string[]) : undefined
        }
      }
    } catch {
      // JSON parsing failed, use raw text
    }

    return {
      answerType: fallbackType,
      keyPoints: [],
      suggestedAnswer: text.trim(),
      followUpPrep: []
    }
  }

  cancelCurrent(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort()
      this.currentAbortController = null
    }
  }

  isConfigured(): boolean {
    return true // Ollama doesn't need an API key
  }
}

export const ollamaService = new OllamaService()
