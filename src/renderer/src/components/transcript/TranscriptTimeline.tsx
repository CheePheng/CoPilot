import { useEffect, useRef } from 'react'
import { useTranscriptStore } from '../../stores/transcriptStore'
import TranscriptEntry from './TranscriptEntry'
import { MicrophoneIcon } from '../ui/Icons'

export default function TranscriptTimeline() {
  const entries = useTranscriptStore((s) => s.entries)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'var(--accent-subtle)',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <MicrophoneIcon size={28} className="gradient-text" />
            </div>
          </div>
          <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Ready to listen
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Start a session to begin capturing audio
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto space-y-1 pr-1">
      {entries
        .filter((e) => e.isFinal || entries.indexOf(e) === entries.length - 1)
        .map((entry) => (
          <TranscriptEntry key={entry.id} entry={entry} />
        ))}
      <div ref={bottomRef} />
    </div>
  )
}
