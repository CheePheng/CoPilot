import { useEffect, useCallback, useState } from 'react'
import { useCodingStore } from '../../stores/codingStore'
import { useToastStore } from '../../stores/toastStore'
import Button from '../ui/Button'
import Card, { SectionHeader } from '../ui/Card'
import Badge from '../ui/Badge'
import { SkeletonCode } from '../ui/Skeleton'
import { CodeIcon, SparklesIcon, ClipboardIcon, TerminalIcon, StopIcon, FileUpIcon, MonitorIcon, ImageIcon } from '../ui/Icons'
import LanguageSelector from './LanguageSelector'
import CodeDisplay from './CodeDisplay'
import ComplexityBadge from './ComplexityBadge'
import type { CodingResponse, StreamChunk } from '../../types/ipc'

type InputTab = 'paste' | 'file' | 'capture'

export default function CodingPage() {
  const {
    question, language, generatedCode, explanation,
    timeComplexity, spaceComplexity, streamText, isStreaming, error, imagePreview,
    setQuestion, setLanguage, startGeneration, setImagePreview,
    appendStreamChunk, setResult, setError, reset
  } = useCodingStore()
  const addToast = useToastStore((s) => s.addToast)
  const [inputTab, setInputTab] = useState<InputTab>('paste')

  useEffect(() => {
    const unsubChunk = window.copilot?.coding?.onStreamChunk?.((data: unknown) => {
      const chunk = data as StreamChunk
      if (!chunk.done) appendStreamChunk(chunk.text)
    })
    const unsubComplete = window.copilot?.coding?.onComplete?.((data: unknown) => {
      const result = data as CodingResponse
      setResult({ code: result.code, explanation: result.explanation, timeComplexity: result.timeComplexity, spaceComplexity: result.spaceComplexity })
    })
    const unsubError = window.copilot?.coding?.onError?.((errMsg: string) => {
      setError(errMsg)
      addToast('error', `Code generation failed: ${errMsg}`)
    })
    return () => { unsubChunk?.(); unsubComplete?.(); unsubError?.() }
  }, [appendStreamChunk, setResult, setError, addToast])

  const handleGenerate = useCallback(async () => {
    if (imagePreview) {
      startGeneration()
      const result = await window.copilot?.coding?.generateFromImage?.({
        questionText: question || 'Solve the coding problem shown in the image',
        language,
        inputMethod: 'screenshot' as const,
        image: imagePreview
      })
      if (result && !result.success) setError(result.error || 'Generation failed')
    } else {
      if (!question.trim()) { addToast('error', 'Enter a coding question first'); return }
      startGeneration()
      const result = await window.copilot?.coding?.generate?.({ questionText: question, language, inputMethod: 'paste' })
      if (result && !result.success) setError(result.error || 'Generation failed')
    }
  }, [question, language, imagePreview, startGeneration, setError, addToast])

  const handleCancel = useCallback(async () => {
    await window.copilot?.coding?.cancel?.()
    setError('Cancelled')
  }, [setError])

  const handlePickImage = useCallback(async () => {
    const img = await window.copilot?.coding?.pickImage?.()
    if (img) setImagePreview(img as { base64: string; mimeType: string })
  }, [setImagePreview])

  const handleCaptureScreen = useCallback(async () => {
    const img = await window.copilot?.coding?.captureScreen?.()
    if (img) setImagePreview(img as { base64: string; mimeType: string })
    else addToast('error', 'Screen capture failed')
  }, [setImagePreview, addToast])

  const hasResult = generatedCode || explanation
  const canGenerate = imagePreview || question.trim()

  const tabStyle = (active: boolean) => ({
    background: active ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
    color: active ? 'white' : 'var(--text-muted)',
    border: active ? '1px solid transparent' : '1px solid var(--border)',
    boxShadow: active ? 'var(--shadow-glow)' : 'none'
  })

  return (
    <div className="flex flex-col gap-4 h-full animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-subtle)', boxShadow: 'var(--shadow-glow)' }}>
            <CodeIcon size={20} className="gradient-text" />
          </div>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Coding Mode</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Paste, upload, or capture a coding question</p>
          </div>
        </div>
        {hasResult && <Button variant="ghost" size="sm" onClick={() => { reset(); setInputTab('paste') }}>New Question</Button>}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex gap-2">
            {([
              { id: 'paste' as InputTab, label: 'Paste', Icon: ClipboardIcon },
              { id: 'file' as InputTab, label: 'File', Icon: FileUpIcon },
              { id: 'capture' as InputTab, label: 'Capture', Icon: MonitorIcon }
            ]).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => { setInputTab(id); setImagePreview(null) }}
                className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                style={tabStyle(inputTab === id)}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          <Card padding="lg">
            <div className="space-y-3">
              {inputTab === 'paste' && (
                <>
                  <div className="flex items-center gap-2">
                    <SectionHeader>Question</SectionHeader>
                    <Badge variant="accent" size="sm">
                      <ClipboardIcon size={9} className="mr-1" />Paste
                    </Badge>
                  </div>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Paste your coding question here...&#10;&#10;e.g., Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
                    rows={8}
                    disabled={isStreaming}
                    className="w-full px-3 py-2.5 rounded-xl text-sm resize-none"
                    style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", lineHeight: '1.6' }}
                  />
                </>
              )}

              {inputTab === 'file' && (
                <>
                  <div className="flex items-center gap-2">
                    <SectionHeader>Upload Image</SectionHeader>
                    <Badge variant="accent" size="sm">
                      <FileUpIcon size={9} className="mr-1" />File
                    </Badge>
                  </div>
                  {imagePreview ? (
                    <div className="space-y-2">
                      <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                        <img
                          src={`data:${imagePreview.mimeType};base64,${imagePreview.base64}`}
                          alt="Uploaded question"
                          className="w-full max-h-64 object-contain"
                          style={{ backgroundColor: 'var(--bg-tertiary)' }}
                        />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setImagePreview(null)}>Remove</Button>
                    </div>
                  ) : (
                    <button
                      onClick={handlePickImage}
                      disabled={isStreaming}
                      className="w-full py-12 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center gap-3"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-subtle)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <ImageIcon size={32} />
                      <span className="text-sm font-medium">Click to select an image</span>
                      <span className="text-xs">PNG, JPG, WebP, BMP</span>
                    </button>
                  )}
                </>
              )}

              {inputTab === 'capture' && (
                <>
                  <div className="flex items-center gap-2">
                    <SectionHeader>Screen Capture</SectionHeader>
                    <Badge variant="accent" size="sm">
                      <MonitorIcon size={9} className="mr-1" />Capture
                    </Badge>
                  </div>
                  {imagePreview ? (
                    <div className="space-y-2">
                      <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                        <img
                          src={`data:${imagePreview.mimeType};base64,${imagePreview.base64}`}
                          alt="Screen capture"
                          className="w-full max-h-64 object-contain"
                          style={{ backgroundColor: 'var(--bg-tertiary)' }}
                        />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setImagePreview(null)}>Remove</Button>
                    </div>
                  ) : (
                    <button
                      onClick={handleCaptureScreen}
                      disabled={isStreaming}
                      className="w-full py-12 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center gap-3"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-subtle)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <MonitorIcon size={32} />
                      <span className="text-sm font-medium">Capture your screen</span>
                      <span className="text-xs">Takes a screenshot of your primary display</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </Card>

          <Card padding="lg">
            <div className="space-y-3">
              <SectionHeader>Language</SectionHeader>
              <LanguageSelector selected={language} onSelect={setLanguage} disabled={isStreaming} />
            </div>
          </Card>

          <div className="flex gap-2">
            {isStreaming ? (
              <Button variant="danger" size="lg" icon={<StopIcon size={14} />} onClick={handleCancel}>Cancel</Button>
            ) : (
              <Button variant="primary" size="lg" icon={<SparklesIcon size={14} />} onClick={handleGenerate} disabled={!canGenerate}>
                {imagePreview ? 'Extract & Solve' : 'Generate Solution'}
              </Button>
            )}
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'var(--danger-subtle)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}
        </div>

        <div className="w-[480px] flex flex-col gap-3 overflow-auto">
          {isStreaming && !generatedCode && (
            <Card padding="lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulseGlow" style={{ backgroundColor: 'var(--accent)' }} />
                  <SectionHeader>Generating...</SectionHeader>
                </div>
                <div className="p-3 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', maxHeight: '300px', overflow: 'auto' }}>
                  {streamText || <SkeletonCode />}
                  <span className="inline-block w-1.5 h-4 ml-0.5 animate-breathe" style={{ backgroundColor: 'var(--accent)' }} />
                </div>
              </div>
            </Card>
          )}

          {generatedCode && (
            <>
              <CodeDisplay code={generatedCode} language={language} />
              {(timeComplexity || spaceComplexity) && (
                <Card padding="md">
                  <div className="flex items-center gap-4">
                    <ComplexityBadge label="Time" value={timeComplexity} />
                    <ComplexityBadge label="Space" value={spaceComplexity} />
                  </div>
                </Card>
              )}
              {explanation && (
                <Card padding="lg" header={
                  <div className="flex items-center gap-2">
                    <TerminalIcon size={14} className="gradient-text" />
                    <SectionHeader>Explanation</SectionHeader>
                  </div>
                } collapsible>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{explanation}</p>
                </Card>
              )}
            </>
          )}

          {!isStreaming && !hasResult && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-subtle)', boxShadow: 'var(--shadow-glow)' }}>
                    <TerminalIcon size={24} className="gradient-text" />
                  </div>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Ready to solve</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Paste, upload, or capture a question</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
