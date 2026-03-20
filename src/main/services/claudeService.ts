import Anthropic from '@anthropic-ai/sdk'
import { EventEmitter } from 'events'
import { buildSystemPrompt, buildAnswerPrompt, ANSWER_TOOL_SCHEMA } from './promptBuilder'
import type { UserProfile } from './promptBuilder'
import type { DetectedQuestion } from './questionDetector'
import type { AIProvider, AnswerResult } from './types'
import { sessionContext } from './sessionContext'

export { type AnswerResult } from './types'

export class ClaudeService extends EventEmitter implements AIProvider {
  private client: Anthropic | null = null
  private currentAbortController: AbortController | null = null
  private model: string = 'claude-sonnet-4-20250514'

  setApiKey(key: string): void {
    this.client = new Anthropic({ apiKey: key })
  }

  setModel(model: string): void {
    this.model = model
  }

  async streamAnswer(
    question: DetectedQuestion,
    recentContext: string,
    profile: UserProfile | null
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Claude API key not set')
    }

    this.cancelCurrent()
    this.currentAbortController = new AbortController()
    const systemPrompt = buildSystemPrompt(profile)
    const contextSummary = sessionContext.getSummary() || undefined
    const userMessage = buildAnswerPrompt(question, recentContext, 45, contextSummary)

    try {
      this.emit('status', 'generating')

      const stream = this.client.messages.stream(
        {
          model: this.model,
          max_tokens: 1024,
          system: [
            {
              type: 'text',
              text: systemPrompt,
              cache_control: { type: 'ephemeral' }
            }
          ],
          messages: [{ role: 'user', content: userMessage }],
          tools: [ANSWER_TOOL_SCHEMA as Anthropic.Tool]
        },
        { signal: this.currentAbortController.signal }
      )

      let fullText = ''

      stream.on('text', (text: string) => {
        fullText += text
        this.emit('stream-chunk', { text, done: false })
      })

      const finalMessage = await stream.finalMessage()

      const toolUseBlock = finalMessage.content.find(
        (block) => block.type === 'tool_use'
      )

      if (toolUseBlock && toolUseBlock.type === 'tool_use') {
        const input = toolUseBlock.input as Record<string, unknown>
        const result: AnswerResult = {
          answerType: (input.answer_type as string) || 'general',
          clarifyingQuestion: input.clarifying_question as string | undefined,
          keyPoints: (input.key_points as string[]) || [],
          suggestedAnswer: (input.suggested_answer as string) || fullText,
          followUpPrep: (input.follow_up_prep as string[]) || [],
          relevantStory: input.relevant_story as string | undefined,
          riskFlags: input.risk_flags as string[] | undefined
        }
        this.emit('answer-complete', result)
      } else {
        const result: AnswerResult = {
          answerType: question.type,
          keyPoints: [],
          suggestedAnswer: fullText,
          followUpPrep: []
        }
        this.emit('answer-complete', result)
      }

      this.emit('stream-chunk', { text: '', done: true })
      this.emit('status', 'idle')
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      this.emit('error', error)
      this.emit('status', 'error')
    } finally {
      this.currentAbortController = null
    }
  }

  cancelCurrent(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort()
      this.currentAbortController = null
    }
  }

  getApiKey(): string | null {
    return this.client ? (this.client.apiKey as string) : null
  }

  isConfigured(): boolean {
    return this.client !== null
  }
}

export const claudeService = new ClaudeService()
