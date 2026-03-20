import { EventEmitter } from 'events'
import { ollamaService } from './ollamaService'
import { claudeService } from './claudeService'
import type { UserProfile } from './promptBuilder'
import { extractJson } from './jsonParser'
import { withRetry } from './retryHelper'

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp'

export interface CodingRequest {
  questionText: string
  language: SupportedLanguage
  inputMethod: 'paste' | 'manual' | 'screenshot'
  context?: string
}

export interface CodingResult {
  code: string
  explanation: string
  timeComplexity: string
  spaceComplexity: string
  language: SupportedLanguage
}

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++'
}

const CODING_SYSTEM_PROMPT = `You are an expert software engineer and algorithm specialist helping with coding interview questions.

Output rules:
- Write clean, efficient, production-quality code
- Include comments explaining key logic
- Always analyze time and space complexity
- Explain the approach step by step before the code
- Be concise but thorough

You MUST respond with ONLY valid JSON in this exact format (no markdown, no code blocks, no extra text):
{"code":"// your code here","explanation":"Step-by-step explanation","time_complexity":"O(n)","space_complexity":"O(1)"}`

export class CodingService extends EventEmitter {
  private currentAbortController: AbortController | null = null
  private currentProvider: 'ollama' | 'claude' = 'ollama'
  private profile: UserProfile | null = null
  private claudeModel: string = 'claude-sonnet-4-20250514'
  private ollamaVisionModel: string = 'llava'

  setProvider(provider: 'ollama' | 'claude'): void {
    this.currentProvider = provider
  }

  setProfile(profile: UserProfile | null): void {
    this.profile = profile
  }

  setClaudeModel(model: string): void {
    this.claudeModel = model
  }

  setOllamaVisionModel(model: string): void {
    this.ollamaVisionModel = model
  }

  async generateCode(request: CodingRequest): Promise<void> {
    this.cancelCurrent()
    this.currentAbortController = new AbortController()

    const languageLabel = LANGUAGE_LABELS[request.language]
    const userPrompt = this.buildUserPrompt(request, languageLabel)

    try {
      this.emit('status', 'generating')

      if (this.currentProvider === 'ollama') {
        await this.streamOllama(userPrompt, request.language)
      } else {
        await this.streamClaude(userPrompt, request.language)
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return
      this.emit('error', error)
      this.emit('status', 'error')
    } finally {
      this.currentAbortController = null
    }
  }

  private buildUserPrompt(request: CodingRequest, languageLabel: string): string {
    let prompt = `<coding_question>
<language>${languageLabel}</language>
<question>${request.questionText}</question>
</coding_question>`

    if (request.context) {
      prompt += `\n\n<additional_context>${request.context}</additional_context>`
    }

    if (this.profile?.targetRole) {
      prompt += `\n\n<candidate_context>Target role: ${this.profile.targetRole}, Seniority: ${this.profile.seniority}</candidate_context>`
    }

    prompt += `\n\nSolve this coding problem in ${languageLabel}. Provide an optimal solution.`
    return prompt
  }

  private async streamOllama(userPrompt: string, language: SupportedLanguage): Promise<void> {
    const baseUrl = ollamaService.getBaseUrl()
    const model = ollamaService.getModel()

    const response = await withRetry(
      () => fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: CODING_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          stream: true,
          options: { temperature: 0.4, num_predict: 2048 }
        }),
        signal: this.currentAbortController!.signal
      }),
      { signal: this.currentAbortController!.signal }
    )

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

    const result = this.parseResult(fullText, language)
    this.emit('coding-complete', result)
    this.emit('stream-chunk', { text: '', done: true })
    this.emit('status', 'idle')
  }

  private async streamClaude(userPrompt: string, language: SupportedLanguage): Promise<void> {
    const apiKey = claudeService.getApiKey()
    if (!apiKey) throw new Error('Claude API key not configured')

    const response = await withRetry(
      () => fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2025-01-01'
        },
        body: JSON.stringify({
          model: this.claudeModel,
          max_tokens: 2048,
          system: CODING_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
          stream: true
        }),
        signal: this.currentAbortController!.signal
      }),
      { signal: this.currentAbortController!.signal }
    )

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
              this.emit('stream-chunk', { text: data.delta.text, done: false })
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

    const result = this.parseResult(fullText, language)
    this.emit('coding-complete', result)
    this.emit('stream-chunk', { text: '', done: true })
    this.emit('status', 'idle')
  }

  private parseResult(text: string, language: SupportedLanguage): CodingResult {
    try {
      const jsonStr = extractJson(text)
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr) as Record<string, unknown>
        return {
          code: (parsed.code as string) || text,
          explanation: (parsed.explanation as string) || '',
          timeComplexity: (parsed.time_complexity as string) || 'Unknown',
          spaceComplexity: (parsed.space_complexity as string) || 'Unknown',
          language
        }
      }
    } catch {
      // Fallback
    }

    // Extract code block if present
    const codeMatch = text.match(/```[\w]*\n([\s\S]*?)```/)
    const code = codeMatch ? codeMatch[1].trim() : text.trim()

    return {
      code,
      explanation: text.replace(/```[\s\S]*?```/g, '').trim(),
      timeComplexity: 'See explanation',
      spaceComplexity: 'See explanation',
      language
    }
  }

  async generateCodeFromImage(
    request: CodingRequest,
    imageBase64: string,
    imageMimeType: string
  ): Promise<void> {
    this.cancelCurrent()
    this.currentAbortController = new AbortController()

    const languageLabel = LANGUAGE_LABELS[request.language]

    try {
      this.emit('status', 'generating')

      if (this.currentProvider === 'ollama') {
        await this.streamOllamaWithImage(imageBase64, languageLabel, request.language)
      } else {
        await this.streamClaudeWithImage(imageBase64, imageMimeType, languageLabel, request.language)
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return
      this.emit('error', error)
      this.emit('status', 'error')
    } finally {
      this.currentAbortController = null
    }
  }

  private async streamOllamaWithImage(
    imageBase64: string,
    languageLabel: string,
    language: SupportedLanguage
  ): Promise<void> {
    const baseUrl = ollamaService.getBaseUrl()

    const response = await withRetry(
      () => fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.ollamaVisionModel,
          messages: [
            { role: 'system', content: CODING_SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Look at this coding question image and solve it in ${languageLabel}. Provide an optimal solution.`,
              images: [imageBase64]
            }
          ],
          stream: true,
          options: { temperature: 0.4, num_predict: 2048 }
        }),
        signal: this.currentAbortController!.signal
      }),
      { signal: this.currentAbortController!.signal }
    )

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
      timeoutTimer = setTimeout(() => { this.currentAbortController?.abort() }, 30000)
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
              this.emit('stream-chunk', { text: parsed.message.content, done: false })
            }
          } catch { /* skip */ }
        }
      }
    } finally {
      if (timeoutTimer) clearTimeout(timeoutTimer)
      reader.releaseLock()
    }

    const result = this.parseResult(fullText, language)
    this.emit('coding-complete', result)
    this.emit('stream-chunk', { text: '', done: true })
    this.emit('status', 'idle')
  }

  private async streamClaudeWithImage(
    imageBase64: string,
    imageMimeType: string,
    languageLabel: string,
    language: SupportedLanguage
  ): Promise<void> {
    const apiKey = claudeService.getApiKey()
    if (!apiKey) throw new Error('Claude API key not configured')

    const response = await withRetry(
      () => fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2025-01-01'
        },
        body: JSON.stringify({
          model: this.claudeModel,
          max_tokens: 2048,
          system: CODING_SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: imageMimeType,
                  data: imageBase64
                }
              },
              {
                type: 'text',
                text: `Look at this coding question and solve it in ${languageLabel}. Provide an optimal solution.`
              }
            ]
          }],
          stream: true
        }),
        signal: this.currentAbortController!.signal
      }),
      { signal: this.currentAbortController!.signal }
    )

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
      timeoutTimer = setTimeout(() => { this.currentAbortController?.abort() }, 30000)
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
            const data = JSON.parse(line.slice(6)) as { type: string; delta?: { text?: string } }
            if (data.type === 'content_block_delta' && data.delta?.text) {
              fullText += data.delta.text
              this.emit('stream-chunk', { text: data.delta.text, done: false })
            }
          } catch { /* skip */ }
        }
      }
    } finally {
      if (timeoutTimer) clearTimeout(timeoutTimer)
      reader.releaseLock()
    }

    const result = this.parseResult(fullText, language)
    this.emit('coding-complete', result)
    this.emit('stream-chunk', { text: '', done: true })
    this.emit('status', 'idle')
  }

  cancelCurrent(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort()
      this.currentAbortController = null
    }
  }
}

export const codingService = new CodingService()
