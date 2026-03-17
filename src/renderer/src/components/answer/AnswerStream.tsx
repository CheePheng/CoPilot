import { useSessionStore } from '../../stores/sessionStore'

export default function AnswerStream() {
  const currentAnswer = useSessionStore((s) => s.currentAnswer)
  const status = useSessionStore((s) => s.status)

  if (!currentAnswer && status !== 'answering') {
    return null
  }

  return (
    <div
      className="rounded-lg p-3 mb-3"
      style={{
        backgroundColor: 'rgba(99, 102, 241, 0.04)',
        border: '1px solid rgba(99, 102, 241, 0.1)'
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--accent)' }}
        />
        <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
          Generating answer...
        </span>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
        {currentAnswer}
        {status === 'answering' && <span className="animate-pulse">▊</span>}
      </p>
    </div>
  )
}
