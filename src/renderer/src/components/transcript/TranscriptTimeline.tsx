import { useEffect, useRef } from 'react'
import { useTranscriptStore } from '../../stores/transcriptStore'
import TranscriptEntry from './TranscriptEntry'

export default function TranscriptTimeline() {
  const entries = useTranscriptStore((s) => s.entries)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🎙️</div>
          <p className="text-lg">Ready to start</p>
          <p className="text-sm mt-2">Click "Start Session" to begin capturing audio</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto space-y-2 pr-2">
      {entries
        .filter((e) => e.isFinal || entries.indexOf(e) === entries.length - 1)
        .map((entry) => (
          <TranscriptEntry key={entry.id} entry={entry} />
        ))}
      <div ref={bottomRef} />
    </div>
  )
}
