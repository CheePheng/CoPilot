import { useEffect, useCallback } from 'react'
import { useCodingStore } from '../../stores/codingStore'
import { useToastStore } from '../../stores/toastStore'
import Button from '../ui/Button'
import Card, { SectionHeader } from '../ui/Card'
import Badge from '../ui/Badge'
import { SkeletonCode } from '../ui/Skeleton'
import { CodeIcon, SparklesIcon, ClipboardIcon, TerminalIcon, StopIcon } from '../ui/Icons'
import LanguageSelector from './LanguageSelector'
import CodeDisplay from './CodeDisplay'
import ComplexityBadge from './ComplexityBadge'
import type { CodingResponse } from '../../types/ipc'
import type { StreamChunk } from '../../types/ipc'

export default function CodingPage() {
  const {
    question, language, generatedCode, explanation,
    timeComplexity, spaceComplexity, streamText, isStreaming, error,
    setQuestion, setLanguage, startGeneration,
    appendStreamChunk, setResult, setError, reset
  } = useCodingStore()
  const addToast = useToastStore((s) => s.addToast)

  // Wire up IPC listeners
  useEffect(() => {
    const unsubChunk = window.copilot?.coding?.onStreamChunk?.((data: unknown) => {
      const chunk = data as StreamChunk
      if (!chunk.done) {
        appendStreamChunk(chunk.text)
      }
    })

    const unsubComplete = window.copilot?.coding?.onComplete?.((data: unknown) => {
      const result = data as CodingResponse
      setResult({
        code: result.code,
        explanation: result.explanation,
        timeComplexity: result.timeComplexity,
        spaceComplexity: result.spaceComplexity
      })
    })

    const unsubError = window.copilot?.coding?.onError?.((errMsg: string) => {
      setError(errMsg)
      addToast('error', `Code generation failed: ${errMsg}`)
    })

    return () => {
      unsubChunk?.()
      unsubComplete?.()
      unsubError?.()
    }
  }, [appendStreamChunk, setResult, setError, addToast])

  const handleGenerate = useCallback(async () => {
    if (!question.trim()) {
      addToast('error', 'Enter a coding question first')
      return
    }

    startGeneration()

    const result = await window.copilot?.coding?.generate?.({
      questionText: question,
      language,
      inputMethod: 'paste'
    })

    if (result && !result.success) {
      setError(result.error || 'Generation failed')
    }
  }, [question, language, startGeneration, setError, addToast])

  const handleCancel = useCallback(async () => {
    await window.copilot?.coding?.cancel?.()
    setError('Cancelled')
  }, [setError])

  const hasResult = generatedCode || explanation

  return (
    <div className="flex flex-col gap-4 h-full animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent-subtle)', boxShadow: 'var(--shadow-glow)' }}
          >
            <CodeIcon size={20} className="gradient-text" />
          </div>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Coding Mode
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Paste a coding question and get an optimal solution
            </p>
          </div>
        </div>
        {hasResult && (
          <Button variant="ghost" size="sm" onClick={reset}>
            New Question
          </Button>
        )}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Input Panel */}
        <div className="flex-1 flex flex-col gap-3">
          <Card padding="lg">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <SectionHeader>Question</SectionHeader>
                <Badge variant="accent" size="sm">
                  <ClipboardIcon size={9} className="mr-1" />
                  Paste
                </Badge>
              </div>

              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Paste your coding question here...&#10;&#10;e.g., Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
                rows={8}
                disabled={isStreaming}
                className="w-full px-3 py-2.5 rounded-xl text-sm resize-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: '1.6'
                }}
              />
            </div>
          </Card>

          <Card padding="lg">
            <div className="space-y-3">
              <SectionHeader>Language</SectionHeader>
              <LanguageSelector
                selected={language}
                onSelect={setLanguage}
                disabled={isStreaming}
              />
            </div>
          </Card>

          <div className="flex gap-2">
            {isStreaming ? (
              <Button
                variant="danger"
                size="lg"
                icon={<StopIcon size={14} />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                icon={<SparklesIcon size={14} />}
                onClick={handleGenerate}
                disabled={!question.trim()}
              >
                Generate Solution
              </Button>
            )}
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                backgroundColor: 'var(--danger-subtle)',
                color: 'var(--danger)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="w-[480px] flex flex-col gap-3 overflow-auto">
          {isStreaming && !generatedCode && (
            <>
              <Card padding="lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full animate-pulseGlow"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                    <SectionHeader>Generating...</SectionHeader>
                  </div>
                  <div
                    className="p-3 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-secondary)',
                      maxHeight: '300px',
                      overflow: 'auto'
                    }}
                  >
                    {streamText || <SkeletonCode />}
                    <span className="inline-block w-1.5 h-4 ml-0.5 animate-breathe" style={{ backgroundColor: 'var(--accent)' }} />
                  </div>
                </div>
              </Card>
            </>
          )}

          {generatedCode && (
            <>
              <CodeDisplay code={generatedCode} language={language} />

              {/* Complexity */}
              {(timeComplexity || spaceComplexity) && (
                <Card padding="md">
                  <div className="flex items-center gap-4">
                    <ComplexityBadge label="Time" value={timeComplexity} />
                    <ComplexityBadge label="Space" value={spaceComplexity} />
                  </div>
                </Card>
              )}

              {/* Explanation */}
              {explanation && (
                <Card
                  padding="lg"
                  header={
                    <div className="flex items-center gap-2">
                      <TerminalIcon size={14} className="gradient-text" />
                      <SectionHeader>Explanation</SectionHeader>
                    </div>
                  }
                  collapsible
                >
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {explanation}
                  </p>
                </Card>
              )}
            </>
          )}

          {!isStreaming && !hasResult && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--accent-subtle)', boxShadow: 'var(--shadow-glow)' }}
                  >
                    <TerminalIcon size={24} className="gradient-text" />
                  </div>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Ready to solve
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Paste a question and generate an optimal solution
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
