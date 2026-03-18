import { useState, useEffect, useCallback } from 'react'
import { useProfileStore } from '../../stores/profileStore'
import { useMockStore } from '../../stores/mockStore'
import { AlertIcon } from '../ui/Icons'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Card from '../ui/Card'
import type { MockEvaluation, StreamChunk } from '../../types/ipc'

type MockState = 'setup' | 'active' | 'feedback'
type Difficulty = 'easy' | 'medium' | 'hard'
type FocusArea = 'behavioral' | 'technical' | 'system-design' | 'situational'

export default function MockInterviewPage() {
  const profile = useProfileStore((s) => s.profile)
  const mock = useMockStore()
  const [mockState, setMockState] = useState<MockState>('setup')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>(['behavioral'])
  const [questionCount, setQuestionCount] = useState(5)
  const [answerText, setAnswerText] = useState('')

  const toggleFocus = useCallback((area: FocusArea) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }, [])

  // Wire up IPC listeners
  useEffect(() => {
    const unsubQChunk = window.copilot?.mock?.onQuestionChunk?.((data: unknown) => {
      const chunk = data as StreamChunk
      if (!chunk.done) mock.appendQuestionChunk(chunk.text)
    })
    const unsubQReady = window.copilot?.mock?.onQuestionReady?.((data: unknown) => {
      const d = data as { question: string }
      mock.finishQuestionGeneration(d.question)
    })
    const unsubEChunk = window.copilot?.mock?.onEvalChunk?.((data: unknown) => {
      const chunk = data as StreamChunk
      if (!chunk.done) mock.appendEvalChunk(chunk.text)
    })
    const unsubEComplete = window.copilot?.mock?.onEvalComplete?.((data: unknown) => {
      const evaluation = data as MockEvaluation
      mock.finishEvaluation(mock.currentQuestion, answerText, evaluation)
    })
    const unsubError = window.copilot?.mock?.onError?.((error: string) => {
      mock.setError(error)
    })

    return () => {
      unsubQChunk?.()
      unsubQReady?.()
      unsubEChunk?.()
      unsubEComplete?.()
      unsubError?.()
    }
  }, [mock.currentQuestion, answerText]) // eslint-disable-line react-hooks/exhaustive-deps

  const getConfig = useCallback(() => ({
    targetRole: profile.targetRole || 'Software Engineer',
    focusAreas,
    difficulty,
    previousQuestions: mock.feedbackHistory.map((f) => f.question)
  }), [profile.targetRole, focusAreas, difficulty, mock.feedbackHistory])

  const startMock = useCallback(() => {
    setMockState('active')
    mock.reset()
    setAnswerText('')

    mock.startQuestionGeneration()
    window.copilot?.mock?.generateQuestion?.({
      targetRole: profile.targetRole || 'Software Engineer',
      focusAreas,
      difficulty,
      previousQuestions: []
    })
  }, [profile.targetRole, focusAreas, difficulty]) // eslint-disable-line react-hooks/exhaustive-deps

  const submitAnswer = useCallback(() => {
    if (!answerText.trim() || !mock.currentQuestion) return

    mock.startEvaluation()
    window.copilot?.mock?.evaluate?.({
      question: mock.currentQuestion,
      answer: answerText,
      config: getConfig()
    })
  }, [answerText, mock.currentQuestion, getConfig]) // eslint-disable-line react-hooks/exhaustive-deps

  const nextQuestion = useCallback(() => {
    if (mock.feedbackHistory.length >= questionCount) {
      setMockState('feedback')
      return
    }
    setAnswerText('')
    mock.startQuestionGeneration()
    window.copilot?.mock?.generateQuestion?.(getConfig())
  }, [mock.feedbackHistory.length, questionCount, getConfig]) // eslint-disable-line react-hooks/exhaustive-deps

  const endMock = useCallback(() => {
    window.copilot?.mock?.cancel?.()
    if (mock.feedbackHistory.length > 0) {
      setMockState('feedback')
    } else {
      setMockState('setup')
      mock.reset()
    }
  }, [mock.feedbackHistory.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const inputStyle = {
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    transition: 'all 0.2s ease'
  }

  const pillStyle = (active: boolean) => ({
    background: active ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
    color: active ? 'white' : 'var(--text-muted)',
    border: active ? '1px solid transparent' : '1px solid var(--border)',
    boxShadow: active ? 'var(--shadow-glow)' : 'none'
  })

  // Setup Screen
  if (mockState === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
        {!profile.targetRole && (
          <div className="glass-panel p-4 flex items-start gap-3" style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}>
            <AlertIcon size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--warning)' } as React.CSSProperties} />
            <p className="text-xs" style={{ color: 'var(--warning)' }}>
              Set up your profile first (role, resume, JD) for personalized questions.
            </p>
          </div>
        )}

        <section className="glass-panel p-5 space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Difficulty</h3>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button key={d} onClick={() => setDifficulty(d)} className="px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer capitalize transition-all" style={pillStyle(difficulty === d)}>
                {d}
              </button>
            ))}
          </div>
        </section>

        <section className="glass-panel p-5 space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Focus Areas</h3>
          <div className="flex flex-wrap gap-2">
            {(['behavioral', 'technical', 'system-design', 'situational'] as FocusArea[]).map((area) => (
              <button key={area} onClick={() => toggleFocus(area)} className="px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer capitalize transition-all" style={pillStyle(focusAreas.includes(area))}>
                {area.replace('-', ' ')}
              </button>
            ))}
          </div>
        </section>

        <section className="glass-panel p-5 space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Questions</h3>
          <select value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value))} className="px-3 py-2 rounded-xl text-sm" style={inputStyle}>
            <option value={3}>3 questions (~10 min)</option>
            <option value={5}>5 questions (~15 min)</option>
            <option value={8}>8 questions (~25 min)</option>
            <option value={10}>10 questions (~30 min)</option>
          </select>
        </section>

        <Button variant="primary" size="lg" onClick={startMock}>
          Start Mock Interview
        </Button>
      </div>
    )
  }

  // Active Screen
  if (mockState === 'active') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Mock Interview</h2>
          <Button variant="danger" size="sm" onClick={endMock}>End Interview</Button>
        </div>

        <div className="glass-panel p-5">
          <p className="text-[10px] font-semibold mb-2 uppercase tracking-wider gradient-text">
            Question {mock.feedbackHistory.length + 1} of {questionCount}
          </p>
          {mock.isGeneratingQuestion ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulseGlow" style={{ backgroundColor: 'var(--accent)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {mock.questionStreamText || 'Generating question...'}
              </p>
            </div>
          ) : (
            <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              {mock.currentQuestion}
            </p>
          )}
        </div>

        {!mock.isGeneratingQuestion && mock.currentQuestion && (
          <div className="glass-panel p-5 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Your Answer
            </p>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              disabled={mock.isEvaluating}
              className="w-full px-3 py-2 rounded-xl text-sm resize-y"
              style={inputStyle}
            />

            {mock.isEvaluating ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulseGlow" style={{ backgroundColor: 'var(--accent)' }} />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {mock.evalStreamText ? 'Evaluating...' : 'Starting evaluation...'}
                </p>
              </div>
            ) : mock.currentFeedback ? (
              <Button variant="primary" size="md" onClick={nextQuestion}>
                {mock.feedbackHistory.length >= questionCount ? 'View Results' : 'Next Question'}
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={submitAnswer} disabled={!answerText.trim()}>
                Submit Answer
              </Button>
            )}
          </div>
        )}

        {mock.currentFeedback && (
          <div className="glass-panel p-5 space-y-4 animate-slideUp">
            <div className="grid grid-cols-4 gap-4">
              {(['clarity', 'evidence', 'structure', 'authenticity'] as const).map((key) => {
                const score = mock.currentFeedback!.evaluation[key]
                const pct = (score / 10) * 100
                return (
                  <div key={key} className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="2" />
                        <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2" strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" style={{ stroke: 'url(#scoreGradient)' }} />
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {score}
                      </span>
                    </div>
                    <div className="text-[10px] font-medium uppercase tracking-wider capitalize" style={{ color: 'var(--text-muted)' }}>
                      {key}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--success-subtle)' }}>
                <p className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--success)' }}>Strengths</p>
                <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  {mock.currentFeedback.evaluation.strengths.map((s, j) => (
                    <li key={j} className="flex items-start gap-1.5">
                      <span style={{ color: 'var(--success)' }}>+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--warning-subtle)' }}>
                <p className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--warning)' }}>Improvements</p>
                <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  {mock.currentFeedback.evaluation.improvements.map((s, j) => (
                    <li key={j} className="flex items-start gap-1.5">
                      <span style={{ color: 'var(--warning)' }}>-</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {mock.currentFeedback.evaluation.goldAnswer && (
              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <p className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider gradient-text">Ideal Answer</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {mock.currentFeedback.evaluation.goldAnswer}
                </p>
              </div>
            )}
          </div>
        )}

        {mock.error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'var(--danger-subtle)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {mock.error}
          </div>
        )}
      </div>
    )
  }

  // Feedback Summary
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Results</h2>
        <Button variant="primary" size="md" onClick={() => { setMockState('setup'); mock.reset() }}>
          New Mock
        </Button>
      </div>

      <div className="glass-panel p-5 grid grid-cols-4 gap-4">
        {(['clarity', 'evidence', 'structure', 'authenticity'] as const).map((key) => {
          const avg = mock.feedbackHistory.length > 0
            ? mock.feedbackHistory.reduce((sum, f) => sum + f.evaluation[key], 0) / mock.feedbackHistory.length
            : 0
          const pct = (avg / 10) * 100
          return (
            <div key={key} className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="2" />
                  <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2" strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" style={{ stroke: 'url(#scoreGradient)' }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {avg.toFixed(1)}
                </span>
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wider capitalize" style={{ color: 'var(--text-muted)' }}>{key}</div>
            </div>
          )
        })}
      </div>

      {mock.feedbackHistory.map((fb, i) => (
        <Card key={i} padding="lg" header={
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider gradient-text">Question {i + 1}</p>
            <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-primary)' }}>{fb.question}</p>
          </div>
        } collapsible defaultCollapsed={i > 0}>
          <div className="space-y-3">
            <div className="flex gap-2">
              {(['clarity', 'evidence', 'structure', 'authenticity'] as const).map((k) => (
                <Badge key={k} variant={fb.evaluation[k] >= 7 ? 'success' : fb.evaluation[k] >= 4 ? 'warning' : 'danger'} size="md">
                  {k}: {fb.evaluation[k]}
                </Badge>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--success-subtle)' }}>
                <p className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--success)' }}>Strengths</p>
                <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  {fb.evaluation.strengths.map((s, j) => (<li key={j}>+ {s}</li>))}
                </ul>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--warning-subtle)' }}>
                <p className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--warning)' }}>Improvements</p>
                <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  {fb.evaluation.improvements.map((s, j) => (<li key={j}>- {s}</li>))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
