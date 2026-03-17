import { useState, useEffect } from 'react'
import { useSessionStore } from '../../stores/sessionStore'
import { ShieldIcon } from '../ui/Icons'

export default function StatusBar() {
  const status = useSessionStore((s) => s.status)
  const [ghostMode, setGhostMode] = useState(true)

  useEffect(() => {
    window.copilot?.ghost?.getStatus?.().then(setGhostMode)
    const unsub = window.copilot?.ghost?.onStatusChange?.(setGhostMode)
    return () => unsub?.()
  }, [])

  const statusConfig: Record<string, { label: string; color: string }> = {
    idle: { label: 'Ready', color: 'var(--text-muted)' },
    listening: { label: 'Listening', color: 'var(--success)' },
    processing: { label: 'Processing', color: 'var(--warning)' },
    answering: { label: 'Generating', color: 'var(--accent)' },
    paused: { label: 'Paused', color: 'var(--warning)' }
  }

  const { label, color } = statusConfig[status] || statusConfig.idle

  return (
    <footer
      className="h-8 flex items-center justify-between px-4 text-[11px] shrink-0"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-muted)'
      }}
    >
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: status !== 'idle' ? `0 0 8px ${color}` : 'none'
            }}
          />
          <span style={{ color }}>{label}</span>
        </span>

        {ghostMode && (
          <span className="flex items-center gap-1" style={{ color: 'var(--success)' }}>
            <ShieldIcon size={11} />
            <span>Ghost</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
        <span>v1.0.0</span>
      </div>
    </footer>
  )
}
