import { useRef } from 'react'
import { useSessionStore } from '../../stores/sessionStore'
import { SparklesIcon } from '../ui/Icons'

type ConfidenceLevel = 'high' | 'medium' | 'low' | null

function parseConfidence(text: string): ConfidenceLevel {
  const match = text.match(/\[confidence:\s*(high|medium|low)\]/i)
  if (!match) return null
  return match[1].toLowerCase() as ConfidenceLevel
}

function ConfidenceDot({ level }: { level: ConfidenceLevel }) {
  if (!level) return null
  const colors: Record<NonNullable<ConfidenceLevel>, string> = {
    high: '#22c55e',
    medium: '#eab308',
    low: '#ef4444'
  }
  return (
    <span
      className="inline-block w-2 h-2 rounded-full ml-1 shrink-0"
      style={{ backgroundColor: colors[level] }}
      title={`Confidence: ${level}`}
    />
  )
}

export default function AnswerStream() {
  const currentAnswer = useSessionStore((s) => s.currentAnswer)
  const status = useSessionStore((s) => s.status)
  const prevLengthRef = useRef(0)

  if (!currentAnswer && status !== 'answering') {
    prevLengthRef.current = 0
    return null
  }

  const rawText = currentAnswer ?? ''
  const confidence = parseConfidence(rawText)
  // Strip the confidence tag from displayed text
  const displayText = rawText.replace(/\[confidence:\s*(?:high|medium|low)\]/gi, '').trim()

  // Split into words and mark words beyond previous length as "new"
  const words = displayText.split(/(\s+)/)
  const prevLength = prevLengthRef.current
  let charCount = 0
  const renderedWords = words.map((segment, i) => {
    const segStart = charCount
    charCount += segment.length
    const isNew = segStart >= prevLength && segment.trim().length > 0
    if (isNew) {
      return <span key={i} className="word-new">{segment}</span>
    }
    return segment
  })
  prevLengthRef.current = rawText.length

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
        {confidence && (
          <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
            <ConfidenceDot level={confidence} />
            {confidence} confidence
          </span>
        )}
        <div className="flex-1 h-px animate-shimmer rounded" />
      </div>
      <p
        className="text-sm leading-relaxed whitespace-pre-wrap"
        style={{ color: 'var(--text-primary)', lineHeight: '1.7' }}
      >
        {renderedWords}
        {status === 'answering' && (
          <span className="inline-block w-1.5 h-4 ml-0.5 rounded-sm animate-breathe" style={{ backgroundColor: 'var(--accent)' }} />
        )}
      </p>
    </div>
  )
}
