import { useSessionStore } from '../../stores/sessionStore'
import { SparklesIcon } from '../ui/Icons'

export default function AnswerStream() {
  const currentAnswer = useSessionStore((s) => s.currentAnswer)
  const status = useSessionStore((s) => s.status)

  if (!currentAnswer && status !== 'answering') {
    return null
  }

  return (
    <div
      className="rounded-xl p-4 mb-3 animate-fadeIn"
      style={{
        background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.06), rgba(139, 92, 246, 0.03))',
        border: '1px solid rgba(124, 92, 252, 0.15)',
        boxShadow: '0 0 24px rgba(124, 92, 252, 0.06)'
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="animate-pulseGlow rounded-full p-0.5">
          <SparklesIcon size={14} className="gradient-text" />
        </span>
        <span className="text-xs font-semibold gradient-text">
          Generating answer...
        </span>
        <div className="flex-1 h-px animate-shimmer rounded" />
      </div>
      <p
        className="text-sm leading-relaxed whitespace-pre-wrap"
        style={{ color: 'var(--text-primary)', lineHeight: '1.7' }}
      >
        {currentAnswer}
        {status === 'answering' && (
          <span className="inline-block w-1.5 h-4 ml-0.5 rounded-sm animate-breathe" style={{ backgroundColor: 'var(--accent)' }} />
        )}
      </p>
    </div>
  )
}
