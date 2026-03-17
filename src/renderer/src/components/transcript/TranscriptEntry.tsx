import type { TranscriptEntry as Entry } from '../../types/ipc'

interface Props {
  entry: Entry
}

export default function TranscriptEntry({ entry }: Props) {
  const isUser = entry.speaker === 'user'
  const isQuestion = entry.isQuestion

  return (
    <div
      className="flex gap-3 py-2 px-3 rounded-lg transition-colors"
      style={{
        backgroundColor: isQuestion
          ? 'rgba(99, 102, 241, 0.08)'
          : 'transparent',
        opacity: entry.isFinal ? 1 : 0.6
      }}
    >
      <div className="shrink-0 mt-0.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
          style={{
            backgroundColor: isUser ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: isUser ? 'white' : 'var(--text-secondary)'
          }}
        >
          {isUser ? 'Y' : 'I'}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-xs font-medium"
            style={{ color: isUser ? 'var(--accent)' : 'var(--text-secondary)' }}
          >
            {isUser ? 'You' : 'Interviewer'}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
            {new Date(entry.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
          {isQuestion && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent)' }}
            >
              Question
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {entry.text}
        </p>
      </div>
    </div>
  )
}
