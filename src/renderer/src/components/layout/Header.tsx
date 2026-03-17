import { useSessionStore } from '../../stores/sessionStore'
import { useSettingsStore } from '../../stores/settingsStore'

type Page = 'interview' | 'practice' | 'history' | 'profile' | 'settings'

const pageLabels: Record<Page, string> = {
  interview: 'Live Interview',
  practice: 'Practice Mode',
  history: 'Session History',
  profile: 'Profile',
  settings: 'Settings'
}

interface HeaderProps {
  currentPage: Page
}

export default function Header({ currentPage }: HeaderProps) {
  const status = useSessionStore((s) => s.status)
  const aiProvider = useSettingsStore((s) => s.aiProvider)
  const sttProvider = useSettingsStore((s) => s.sttProvider)
  const sessionStartTime = useSessionStore((s) => s.sessionStartTime)

  const isActive = status !== 'idle'

  return (
    <header
      className="h-14 flex items-center justify-between px-6 shrink-0"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {pageLabels[currentPage]}
        </h2>
        {isActive && sessionStartTime && (
          <SessionTimer startTime={sessionStartTime} />
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Provider badges */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent)'
            }}
          >
            {aiProvider}
          </span>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-muted)'
            }}
          >
            {sttProvider === 'web-speech' ? 'Web STT' : 'Deepgram'}
          </span>
        </div>
      </div>
    </header>
  )
}

function SessionTimer({ startTime }: { startTime: number }) {
  const elapsed = useSessionStore((s) => s.elapsedTime)

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60

  return (
    <span
      className="text-xs font-mono px-2 py-0.5 rounded-lg"
      style={{
        backgroundColor: 'var(--success-subtle)',
        color: 'var(--success)'
      }}
    >
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  )
}
