import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranscriptStore } from '../../stores/transcriptStore'
import TranscriptEntry from './TranscriptEntry'
import { MicrophoneIcon, SearchIcon } from '../ui/Icons'
import Badge from '../ui/Badge'

export default function TranscriptTimeline() {
  const entries = useTranscriptStore((s) => s.entries)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!searchQuery) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [entries, searchQuery])

  const displayEntries = useMemo(() => {
    const visible = entries.filter((e) => e.isFinal || entries.indexOf(e) === entries.length - 1)
    if (!searchQuery.trim()) return visible
    const q = searchQuery.toLowerCase()
    return visible.filter((e) => e.text.toLowerCase().includes(q))
  }, [entries, searchQuery])

  const matchCount = searchQuery.trim() ? displayEntries.length : 0

  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulseGlow"
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
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search bar */}
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <div className="relative flex-1">
          <SearchIcon
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' } as React.CSSProperties}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcript..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
        {searchQuery.trim() && (
          <Badge variant="accent" size="sm">{matchCount} match{matchCount !== 1 ? 'es' : ''}</Badge>
        )}
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-auto space-y-1 pr-1">
        {displayEntries.map((entry) => (
          <TranscriptEntry key={entry.id} entry={entry} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
