import type { AnswerCard as AnswerCardType } from '../../types/ipc'

interface Props {
  card: AnswerCardType
}

export default function AnswerCard({ card }: Props) {
  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        backgroundColor: 'rgba(99, 102, 241, 0.06)',
        border: '1px solid rgba(99, 102, 241, 0.15)'
      }}
    >
      {/* Type badge */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--accent)'
          }}
        >
          {card.answerType}
        </span>
      </div>

      {/* Key Points */}
      {card.keyPoints.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            Key Points
          </h4>
          <ul className="space-y-1">
            {card.keyPoints.map((point, i) => (
              <li
                key={i}
                className="text-sm flex items-start gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <span style={{ color: 'var(--accent)' }}>•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Answer */}
      <div>
        <h4 className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          Suggested Answer
        </h4>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {card.suggestedAnswer}
        </p>
      </div>

      {/* Follow-up Prep */}
      {card.followUpPrep.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            Likely Follow-ups
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
