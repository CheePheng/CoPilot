import { useState, useEffect } from 'react'
import Card, { SectionHeader } from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { HistoryIcon, InterviewIcon, CodeIcon, ChevronRightIcon } from '../ui/Icons'

interface SessionRecord {
  id: string
  type: 'interview' | 'coding'
  date: string
  duration: number // seconds
  questionCount: number
  questions: Array<{
    question: string
    answer: string
    type: string
  }>
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'interview' | 'coding'>('all')

  useEffect(() => {
    // Load session history from storage
    window.copilot?.storage?.get?.('sessionHistory').then((data) => {
      if (Array.isArray(data)) {
        setSessions(data as SessionRecord[])
      }
    })
  }, [])

  const filtered = sessions.filter(
    (s) => filter === 'all' || s.type === filter
  )

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fadeIn">
          <div className="mb-4 flex justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--accent-subtle)', boxShadow: 'var(--shadow-glow)' }}
            >
              <HistoryIcon size={28} className="gradient-text" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            No sessions yet
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Start an interview or coding session to build your history.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'interview' ? 'primary' : 'ghost'}
          size="sm"
          icon={<InterviewIcon size={12} />}
          onClick={() => setFilter('interview')}
        >
          Interview
        </Button>
        <Button
          variant={filter === 'coding' ? 'primary' : 'ghost'}
          size="sm"
          icon={<CodeIcon size={12} />}
          onClick={() => setFilter('coding')}
        >
          Coding
        </Button>
        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} session{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Session List */}
      {filtered.map((session) => {
        const isExpanded = expandedId === session.id
        return (
          <Card key={session.id} padding="none">
            <button
              className="w-full px-5 py-4 flex items-center gap-4 cursor-pointer transition-all"
              onClick={() => setExpandedId(isExpanded ? null : session.id)}
              style={{ background: 'transparent' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: session.type === 'coding' ? 'rgba(99, 102, 241, 0.12)' : 'var(--accent-subtle)'
                }}
              >
                {session.type === 'coding' ? (
                  <CodeIcon size={16} style={{ color: '#6366f1' }} />
                ) : (
                  <InterviewIcon size={16} style={{ color: 'var(--accent)' }} />
                )}
              </div>

              <div className="flex-1 text-left">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {session.type === 'coding' ? 'Coding Session' : 'Interview Session'}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {session.date}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="default" size="md">
                  {session.questionCount} Q{session.questionCount !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="accent" size="md">
                  {formatDuration(session.duration)}
                </Badge>
                <ChevronRightIcon
                  size={14}
                  className="transition-transform"
                  style={{
                    color: 'var(--text-muted)',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                  }}
                />
              </div>
            </button>

            {isExpanded && session.questions.length > 0 && (
              <div
                className="px-5 pb-4 space-y-3 animate-fadeIn"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <div className="pt-3">
                  <SectionHeader>Questions & Answers</SectionHeader>
                </div>
                {session.questions.map((q, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-3 space-y-2"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    <div className="flex items-start gap-2">
                      <Badge variant="accent" size="sm">{q.type}</Badge>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                        {q.question}
                      </p>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {q.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
