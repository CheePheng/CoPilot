import type { TranscriptEntry as Entry } from '../../types/ipc'

interface Props {
  entry: Entry
}

export default function TranscriptEntry({ entry }: Props) {
  const isUser = entry.speaker === 'user'
  const isQuestion = entry.isQuestion

  return (
    <div
      className="flex gap-3 py-2.5 px-3 rounded-xl transition-all animate-fadeIn"
      style={{
        backgroundColor: isQuestion
          ? 'rgba(124, 92, 252, 0.06)'
          : 'transparent',
        borderLeft: isQuestion ? '2px solid var(--accent)' : '2px solid transparent',
        opacity: entry.isFinal ? 1 : 0.5
      }}
    >
      <div className="shrink-0 mt-0.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{
            background: isUser ? 'var(--accent-gradient)' : 'var(--bg-elevated)',
            color: isUser ? 'white' : 'var(--text-muted)',
            boxShadow: isUser ? '0 0 12px rgba(124, 92, 252, 0.2)' : 'none'
          }}
        >
          {isUser ? 'Y' : 'I'}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-[11px] font-semibold"
            style={{ color: isUser ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            {isUser ? 'You' : 'Interviewer'}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
            {new Date(entry.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
          {isQuestion && (
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
              style={{
                background: 'var(--accent-gradient)',
                color: 'white'
              }}
            >
              Question
            </span>
          )}
        </div>
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {entry.text}
        </p>
      </div>
    </div>
  )
}
