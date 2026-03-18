import { useState, useEffect } from 'react'
import { useHistoryStore } from '../../stores/historyStore'
import Card, { SectionHeader } from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { HistoryIcon, InterviewIcon, CodeIcon, ChevronRightIcon, BarChartIcon, TrashIcon } from '../ui/Icons'

export default function HistoryPage() {
  const { sessions, analytics, isLoading, loadHistory, deleteSession, clearHistory } = useHistoryStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'interview' | 'coding'>('all')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const filtered = sessions.filter(
    (s) => filter === 'all' || s.type === filter
  )

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span
          className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin"
          style={{ color: 'var(--accent)' }}
        />
      </div>
    )
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
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Start an interview or coding session to build your history.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Sessions', value: analytics.totalSessions, color: 'var(--accent)' },
          { label: 'Questions', value: analytics.totalQuestions, color: 'var(--success)' },
          { label: 'Avg Duration', value: formatDuration(analytics.avgDuration), color: 'var(--warning)' },
          { label: 'Types', value: Object.keys(analytics.typeBreakdown).length, color: '#6366f1' }
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-4 text-center">
            <p className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Question Type Breakdown */}
      {Object.keys(analytics.typeBreakdown).length > 0 && (
        <Card padding="lg" header={
          <div className="flex items-center gap-2">
            <BarChartIcon size={14} className="gradient-text" />
            <SectionHeader>Question Types</SectionHeader>
          </div>
        } collapsible defaultCollapsed>
          <div className="space-y-2">
            {Object.entries(analytics.typeBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => {
                const maxCount = Math.max(...Object.values(analytics.typeBreakdown))
                const pct = (count / maxCount) * 100
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-xs font-medium capitalize w-24" style={{ color: 'var(--text-secondary)' }}>
                      {type}
                    </span>
                    <div className="flex-1 h-5 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{ width: `${pct}%`, background: 'var(--accent-gradient)' }}
                      />
                    </div>
                    <span className="text-xs font-bold w-8 text-right" style={{ color: 'var(--text-primary)' }}>
                      {count}
                    </span>
                  </div>
                )
              })}
          </div>
        </Card>
      )}

      {/* Filter + Clear */}
      <div className="flex items-center gap-2">
        <Button variant={filter === 'all' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>
          All
        </Button>
        <Button variant={filter === 'interview' ? 'primary' : 'ghost'} size="sm" icon={<InterviewIcon size={12} />} onClick={() => setFilter('interview')}>
          Interview
        </Button>
        <Button variant={filter === 'coding' ? 'primary' : 'ghost'} size="sm" icon={<CodeIcon size={12} />} onClick={() => setFilter('coding')}>
          Coding
        </Button>
        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} session{filtered.length !== 1 ? 's' : ''}
        </span>
        {showClearConfirm ? (
          <div className="flex items-center gap-1">
            <Button variant="danger" size="sm" onClick={() => { clearHistory(); setShowClearConfirm(false) }}>
              Confirm
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" icon={<TrashIcon size={12} />} onClick={() => setShowClearConfirm(true)}>
            Clear
          </Button>
        )}
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

            {isExpanded && (
              <div
                className="px-5 pb-4 space-y-3 animate-fadeIn"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                {session.questions.length > 0 && (
                  <>
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
                        {q.answer && (
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {q.answer}
                          </p>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {session.transcript && session.transcript.length > 0 && (
                  <>
                    <SectionHeader>Transcript</SectionHeader>
                    <div
                      className="rounded-xl p-3 space-y-1.5 max-h-48 overflow-auto"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    >
                      {session.transcript.map((t, i) => (
                        <p key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span className="font-semibold capitalize" style={{ color: t.speaker === 'interviewer' ? 'var(--accent)' : 'var(--success)' }}>
                            {t.speaker}:
                          </span>{' '}
                          {t.text}
                        </p>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex justify-end pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<TrashIcon size={12} />}
                    onClick={(e) => { e.stopPropagation(); deleteSession(session.id) }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
