import { useState, useCallback } from 'react'
import { useProfileStore } from '../../stores/profileStore'

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
    // In full implementation, this would call Claude to start a mock interview session
    setCurrentQuestion(
      'Tell me about a challenging project you worked on recently. What was your role and what was the outcome?'
    )
  }, [])

  const inputStyle = {
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)'
  }

  if (mockState === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Mock Interview
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Practice with an AI interviewer and get instant feedback on your answers.
          </p>
        </div>

        {!profile.targetRole && (
          <div
            className="p-4 rounded-lg text-sm"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              color: 'var(--warning)'
            }}
          >
            Set up your profile first (role, resume, JD) for more personalized questions.
          </div>
        )}

        {/* Difficulty */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            Difficulty
          </h3>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer capitalize"
                style={{
                  backgroundColor: difficulty === d ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: difficulty === d ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border)'
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        {/* Focus Areas */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            Focus Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {(['behavioral', 'technical', 'system-design', 'situational'] as FocusArea[]).map(
              (area) => (
                <button
                  key={area}
                  onClick={() => toggleFocus(area)}
                  className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer capitalize"
                  style={{
                    backgroundColor: focusAreas.includes(area) ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: focusAreas.includes(area) ? 'white' : 'var(--text-secondary)',
                    border: '1px solid var(--border)'
                  }}
                >
                  {area.replace('-', ' ')}
                </button>
              )
            )}
          </div>
        </section>

        {/* Question Count */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            Number of Questions
          </h3>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg text-sm"
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
          className="px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          Start Mock Interview
        </button>
      </div>
    )
  }

  if (mockState === 'active') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Mock Interview in Progress
          </h2>
          <button
            onClick={() => setMockState('setup')}
            className="px-4 py-1.5 rounded-lg text-sm cursor-pointer"
            style={{ color: 'var(--danger)' }}
          >
            End Interview
          </button>
        </div>

        {/* Current Question */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
            Question {feedbackHistory.length + 1} of {questionCount}
          </p>
          <p className="text-lg" style={{ color: 'var(--text-primary)' }}>
            {currentQuestion}
          </p>
        </div>

        {/* Answer area */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            Your Answer
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Speak your answer into the microphone, or type it below. In a full session, your answer
            will be transcribed in real-time.
          </p>
          <textarea
            placeholder="Type your answer here..."
            rows={6}
            className="w-full mt-3 px-3 py-2 rounded-lg text-sm resize-y"
            style={inputStyle}
          />
          <button
            onClick={() => {
              // In full implementation, this would send to Claude for evaluation
              setFeedbackHistory((prev) => [
                ...prev,
                {
                  question: currentQuestion,
                  scores: { clarity: 4, evidence: 3, structure: 4, authenticity: 5 },
                  strengths: ['Clear structure', 'Good specific example'],
                  improvements: ['Add more metrics', 'Mention the business impact'],
                  goldAnswer: 'A polished version of the answer would be generated here by Claude.'
                }
              ])
              if (feedbackHistory.length + 1 >= questionCount) {
                setMockState('feedback')
              } else {
                setCurrentQuestion('How do you handle disagreements with teammates about technical decisions?')
              }
            }}
            className="mt-3 px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            Submit Answer
          </button>
        </div>
      </div>
    )
  }

  // Feedback view
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Mock Interview Results
        </h2>
        <button
          onClick={() => setMockState('setup')}
          className="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          Start New Mock
        </button>
      </div>

      {/* Score summary */}
      <div
        className="rounded-xl p-5 grid grid-cols-4 gap-4"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        {['Clarity', 'Evidence', 'Structure', 'Authenticity'].map((label, i) => {
          const avgScore =
            feedbackHistory.reduce((sum, f) => {
              const key = label.toLowerCase() as keyof typeof f.scores
              return sum + f.scores[key]
            }, 0) / feedbackHistory.length

          return (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                {avgScore.toFixed(1)}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Per-question feedback */}
      {feedbackHistory.map((fb, i) => (
        <div
          key={i}
          className="rounded-xl p-5 space-y-3"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
            Question {i + 1}
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {fb.question}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--success)' }}>
                Strengths
              </p>
              <ul className="text-xs space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                {fb.strengths.map((s, j) => (
                  <li key={j}>+ {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--warning)' }}>
                Improvements
              </p>
              <ul className="text-xs space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                {fb.improvements.map((s, j) => (
                  <li key={j}>- {s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
