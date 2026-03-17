import { useState, useCallback } from 'react'
import { useProfileStore } from '../../stores/profileStore'
import { AlertIcon } from '../ui/Icons'

type MockState = 'setup' | 'active' | 'feedback'
type Difficulty = 'easy' | 'medium' | 'hard'
type FocusArea = 'behavioral' | 'technical' | 'system-design' | 'situational'

interface MockFeedback {
  question: string
  scores: { clarity: number; evidence: number; structure: number; authenticity: number }
  strengths: string[]
  improvements: string[]
  goldAnswer: string
}

export default function MockInterviewPage() {
  const profile = useProfileStore((s) => s.profile)
  const [mockState, setMockState] = useState<MockState>('setup')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>(['behavioral'])
  const [questionCount, setQuestionCount] = useState(5)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [feedbackHistory, setFeedbackHistory] = useState<MockFeedback[]>([])

  const toggleFocus = useCallback((area: FocusArea) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }, [])

  const startMock = useCallback(() => {
    setMockState('active')
    setFeedbackHistory([])
    setCurrentQuestion(
      'Tell me about a challenging project you worked on recently. What was your role and what was the outcome?'
    )
  }, [])

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

  if (mockState === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
        {!profile.targetRole && (
          <div
            className="glass-panel p-4 flex items-start gap-3"
            style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}
          >
            <AlertIcon size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--warning)' } as React.CSSProperties} />
            <p className="text-xs" style={{ color: 'var(--warning)' }}>
              Set up your profile first (role, resume, JD) for personalized questions.
            </p>
          </div>
        )}

        {/* Difficulty */}
        <section className="glass-panel p-5 space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Difficulty
          </h3>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer capitalize transition-all"
                style={pillStyle(difficulty === d)}
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        {/* Focus Areas */}
        <section className="glass-panel p-5 space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Focus Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {(['behavioral', 'technical', 'system-design', 'situational'] as FocusArea[]).map(
              (area) => (
                <button
                  key={area}
                  onClick={() => toggleFocus(area)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer capitalize transition-all"
                  style={pillStyle(focusAreas.includes(area))}
                >
                  {area.replace('-', ' ')}
                </button>
              )
            )}
          </div>
        </section>

        {/* Question Count */}
        <section className="glass-panel p-5 space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Questions
          </h3>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="px-3 py-2 rounded-xl text-sm"
            style={inputStyle}
          >
            <option value={3}>3 questions (~10 min)</option>
            <option value={5}>5 questions (~15 min)</option>
            <option value={8}>8 questions (~25 min)</option>
            <option value={10}>10 questions (~30 min)</option>
          </select>
        </section>

        <button
          onClick={startMock}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
          style={{ background: 'var(--accent-gradient)', color: 'white', boxShadow: 'var(--shadow-glow)' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          Start Mock Interview
        </button>
      </div>
    )
  }

  if (mockState === 'active') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Mock Interview
          </h2>
          <button
            onClick={() => setMockState('setup')}
            className="px-4 py-1.5 rounded-xl text-xs font-medium cursor-pointer"
            style={{ backgroundColor: 'var(--danger-subtle)', color: 'var(--danger)' }}
          >
            End Interview
          </button>
        </div>

        <div className="glass-panel p-5">
          <p className="text-[10px] font-semibold mb-2 uppercase tracking-wider gradient-text">
            Question {feedbackHistory.length + 1} of {questionCount}
          </p>
          <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            {currentQuestion}
          </p>
        </div>

        <div className="glass-panel p-5 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Your Answer
          </p>
          <textarea
            placeholder="Type your answer here..."
            rows={6}
            className="w-full px-3 py-2 rounded-xl text-sm resize-y"
            style={inputStyle}
          />
          <button
            onClick={() => {
              setFeedbackHistory((prev) => [
                ...prev,
                {
                  question: currentQuestion,
                  scores: { clarity: 4, evidence: 3, structure: 4, authenticity: 5 },
                  strengths: ['Clear structure', 'Good specific example'],
                  improvements: ['Add more metrics', 'Mention the business impact'],
                  goldAnswer: 'A polished version would be generated by AI.'
                }
              ])
              if (feedbackHistory.length + 1 >= questionCount) {
                setMockState('feedback')
              } else {
                setCurrentQuestion('How do you handle disagreements with teammates about technical decisions?')
              }
            }}
            className="px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer"
            style={{ background: 'var(--accent-gradient)', color: 'white' }}
          >
            Submit Answer
          </button>
        </div>
      </div>
    )
  }

  // Feedback view
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          Results
        </h2>
        <button
          onClick={() => setMockState('setup')}
          className="px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer"
          style={{ background: 'var(--accent-gradient)', color: 'white' }}
        >
          New Mock
        </button>
      </div>

      {/* Score summary */}
      <div className="glass-panel p-5 grid grid-cols-4 gap-4">
        {['Clarity', 'Evidence', 'Structure', 'Authenticity'].map((label) => {
          const avgScore =
            feedbackHistory.reduce((sum, f) => {
              const key = label.toLowerCase() as keyof typeof f.scores
              return sum + f.scores[key]
            }, 0) / feedbackHistory.length

          const pct = (avgScore / 5) * 100

          return (
            <div key={label} className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="2" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none" strokeWidth="2"
                    strokeDasharray={`${pct} ${100 - pct}`}
                    strokeLinecap="round"
                    style={{ stroke: 'url(#scoreGradient)' }}
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {avgScore.toFixed(1)}
                </span>
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Per-question feedback */}
      {feedbackHistory.map((fb, i) => (
        <div key={i} className="glass-panel p-5 space-y-3 animate-slideUp">
          <p className="text-[10px] font-semibold uppercase tracking-wider gradient-text">
            Question {i + 1}
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {fb.question}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--success-subtle)' }}>
              <p className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--success)' }}>
                Strengths
              </p>
              <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                {fb.strengths.map((s, j) => (
                  <li key={j} className="flex items-start gap-1.5">
                    <span style={{ color: 'var(--success)' }}>+</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--warning-subtle)' }}>
              <p className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--warning)' }}>
                Improvements
              </p>
              <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                {fb.improvements.map((s, j) => (
                  <li key={j} className="flex items-start gap-1.5">
                    <span style={{ color: 'var(--warning)' }}>-</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
