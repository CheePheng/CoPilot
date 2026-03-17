import type { AnswerCard as AnswerCardType } from '../../types/ipc'
import { SparklesIcon } from '../ui/Icons'

interface Props {
  card: AnswerCardType
}

const typeBadgeColors: Record<string, { bg: string; text: string }> = {
  behavioral: { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa' },
  technical: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' },
  situational: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
  general: { bg: 'rgba(124, 92, 252, 0.15)', text: 'var(--accent)' }
}

export default function AnswerCard({ card }: Props) {
  const badge = typeBadgeColors[card.answerType] || typeBadgeColors.general

  return (
    <div
      className="rounded-xl p-4 space-y-3 animate-slideUp"
      style={{
        background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.06), rgba(139, 92, 246, 0.03))',
        border: '1px solid rgba(124, 92, 252, 0.12)',
        boxShadow: '0 0 24px rgba(124, 92, 252, 0.04)'
      }}
    >
      {/* Type badge */}
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider"
          style={{ backgroundColor: badge.bg, color: badge.text }}
        >
          {card.answerType}
        </span>
      </div>

      {/* Key Points */}
      {card.keyPoints.length > 0 && (
        <div>
          <h4
            className="text-[10px] font-semibold mb-2 uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <SparklesIcon size={12} />
            Key Points
          </h4>
          <ul className="space-y-1.5">
            {card.keyPoints.map((point, i) => (
              <li
                key={i}
                className="text-sm flex items-start gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <span
                  className="w-1 h-1 rounded-full mt-2 shrink-0"
                  style={{ background: 'var(--accent-gradient)' }}
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Answer */}
      <div>
        <h4
          className="text-[10px] font-semibold mb-2 uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          Suggested Answer
        </h4>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--text-primary)', lineHeight: '1.7' }}
        >
          {card.suggestedAnswer}
        </p>
      </div>

      {/* Follow-up Prep */}
      {card.followUpPrep.length > 0 && (
        <div
          className="rounded-lg p-3"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderLeft: '2px solid var(--accent)'
          }}
        >
          <h4
            className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Prepare For
          </h4>
          <ul className="space-y-1">
            {card.followUpPrep.map((q, i) => (
              <li
                key={i}
                className="text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                {i + 1}. {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
