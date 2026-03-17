import { useSessionStore } from '../../stores/sessionStore'

export default function StatusBar() {
  const status = useSessionStore((s) => s.status)

  const statusColors: Record<string, string> = {
    idle: 'var(--text-secondary)',
    listening: 'var(--success)',
    processing: 'var(--warning)',
    answering: 'var(--accent)',
    paused: 'var(--warning)'
  }

  const statusLabels: Record<string, string> = {
    idle: 'Idle',
    listening: 'Listening',
    processing: 'Processing',
    answering: 'Generating',
    paused: 'Paused'
  }

  return (
    <footer
      className="h-8 flex items-center justify-between px-4 text-xs shrink-0"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-secondary)'
      }}
    >
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColors[status] || statusColors.idle }}
          />
          {statusLabels[status] || 'Idle'}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>Ctrl+Shift+O: Toggle Overlay</span>
        <span>CoPilot v1.0.0</span>
      </div>
    </footer>
  )
}
