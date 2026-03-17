type Page = 'interview' | 'practice' | 'history' | 'profile' | 'settings'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: 'interview', label: 'Interview', icon: '🎯' },
  { id: 'practice', label: 'Practice', icon: '📝' },
  { id: 'history', label: 'History', icon: '📋' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
]

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <div
      className="w-[220px] flex flex-col py-4 px-3"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)'
      }}
    >
      {/* Logo */}
      <div className="px-3 mb-8">
        <h1 className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
          CoPilot
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          AI Interview Assistant
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: currentPage === item.id ? 'var(--bg-tertiary)' : 'transparent',
              color: currentPage === item.id ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Overlay Toggle */}
      <div className="mt-auto pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => window.copilot?.overlay?.toggle()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span className="text-lg">🪟</span>
          Toggle Overlay
        </button>
        <p className="text-xs px-3 mt-1" style={{ color: 'var(--text-secondary)' }}>
          Ctrl+Shift+O
        </p>
      </div>
    </div>
  )
}
