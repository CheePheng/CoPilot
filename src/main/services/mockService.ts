import { EventEmitter } from 'events'
import { ollamaService } from './ollamaService'
import { claudeService } from './claudeService'
import { buildMockQuestionPrompt, buildMockEvaluationPrompt } from './promptBuilder'

export interface MockConfig {
  targetRole: string
  focusAreas: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  previousQuestions: string[]
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

export class MockService extends EventEmitter {
  private currentAbortController: AbortController | null = null
  private currentProvider: 'ollama' | 'claude' = 'ollama'

  setProvider(provider: 'ollama' | 'claude'): void {
    this.currentProvider = provider
  }

  async generateQuestion(config: MockConfig): Promise<void> {
    this.cancelCurrent()
    this.currentAbortController = new AbortController()

    const prompt = buildMockQuestionPrompt(
      config.targetRole,
      config.focusAreas,
      config.difficulty,
      config.previousQuestions
    )

    try {
      this.emit('status', 'generating-question')
      const fullText = await this.streamPrompt(
        'Generate an interview question.',
        prompt,
        'mock:question-chunk'
      )
      this.emit('mock:question-ready', { question: fullText.trim() })
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return
      this.emit('mock:error', error instanceof Error ? error.message : String(error))
    } finally {
      this.currentAbortController = null
    }
  }

  async evaluateAnswer(question: string, answer: string, config: MockConfig): Promise<void> {
    this.cancelCurrent()
    this.currentAbortController = new AbortController()

    const prompt = buildMockEvaluationPrompt(question, answer, config.targetRole)

    try {
      this.emit('status', 'evaluating')
      const fullText = await this.streamPrompt(
        'You are an expert interview evaluator.',
        prompt,
        'mock:eval-chunk'
      )
      const evaluation = this.parseEvalResult(fullText)
      this.emit('mock:eval-complete', evaluation)
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return
      this.emit('mock:error', error instanceof Error ? error.message : String(error))
    } finally {
      this.currentAbortController = null
    }
  }

  private async streamPrompt(systemPrompt: string, userPrompt: string, chunkEvent: string): Promise<string> {
    if (this.currentProvider === 'ollama') {
      return this.streamOllama(systemPrompt, userPrompt, chunkEvent)
    } else {
      return this.streamClaude(systemPrompt, userPrompt, chunkEvent)
    }
  }

  private async streamOllama(systemPrompt: string, userPrompt: string, chunkEvent: string): Promise<string> {
    const baseUrl = ollamaService.getBaseUrl()
    const model = ollamaService.getModel()

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: true,
        options: { temperature: 0.7, num_predict: 1024 }
      }),
      signal: this.currentAbortController!.signal
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Ollama error ${response.status}: ${errorText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let fullText = ''

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
        const lines = chunk.split('\n').filter((l) => l.trim())

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line) as { message?: { content: string }; done: boolean }
            if (parsed.message?.content) {
              fullText += parsed.message.content
              this.emit(chunkEvent, { text: parsed.message.content, done: false })
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

    return fullText
  }

  private async streamClaude(systemPrompt: string, userPrompt: string, chunkEvent: string): Promise<string> {
    if (!claudeService.isConfigured()) {
      throw new Error('Claude API key not set')
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeService.getApiKey() || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        stream: true
      }),
      signal: this.currentAbortController!.signal
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Claude error ${response.status}: ${errorText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let fullText = ''

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
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6)) as {
              type: string
              delta?: { text?: string }
            }
            if (data.type === 'content_block_delta' && data.delta?.text) {
              fullText += data.delta.text
              this.emit(chunkEvent, { text: data.delta.text, done: false })
            }
          } catch {
            // Skip malformed
          }
        }
      }
    } finally {
      if (timeoutTimer) clearTimeout(timeoutTimer)
      reader.releaseLock()
    }

    return fullText
  }

  private parseEvalResult(text: string): MockEvaluation {
    try {
      const jsonStr = this.extractJson(text)
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr) as Record<string, unknown>
        return {
          clarity: Number(parsed.clarity) || 0,
          evidence: Number(parsed.evidence) || 0,
          structure: Number(parsed.structure) || 0,
          authenticity: Number(parsed.authenticity) || 0,
          strengths: Array.isArray(parsed.strengths) ? (parsed.strengths as string[]) : [],
          improvements: Array.isArray(parsed.improvements) ? (parsed.improvements as string[]) : [],
          goldAnswer: (parsed.gold_answer as string) || ''
        }
      }
    } catch {
      // Fallback
    }

    return {
      clarity: 5, evidence: 5, structure: 5, authenticity: 5,
      strengths: ['Answer provided'], improvements: ['Could not parse AI evaluation'],
      goldAnswer: ''
    }
  }

  private extractJson(text: string): string | null {
    try {
      JSON.parse(text.trim())
      return text.trim()
    } catch {
      // Not pure JSON
    }

    const start = text.indexOf('{')
    if (start === -1) return null

    let depth = 0
    let inString = false
    let escape = false

    for (let i = start; i < text.length; i++) {
      const ch = text[i]
      if (escape) { escape = false; continue }
      if (ch === '\\' && inString) { escape = true; continue }
      if (ch === '"') { inString = !inString; continue }
      if (inString) continue
      if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) return text.slice(start, i + 1)
      }
    }
    return null
  }

  cancelCurrent(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort()
      this.currentAbortController = null
    }
  }
}

export const mockService = new MockService()
