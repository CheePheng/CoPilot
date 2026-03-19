import { useState, useEffect } from 'react'
import {
  InterviewIcon,
  CodeIcon,
  PracticeIcon,
  HistoryIcon,
  ProfileIcon,
  SettingsIcon,
  OverlayIcon,
  ShieldIcon
} from '../ui/Icons'

type Page = 'interview' | 'coding' | 'practice' | 'history' | 'profile' | 'settings'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

interface NavSection {
  label: string
  items: { id: Page; label: string; Icon: typeof InterviewIcon }[]
}

const navSections: NavSection[] = [
  {
    label: 'Assist',
    items: [
      { id: 'interview', label: 'Interview', Icon: InterviewIcon },
      { id: 'coding', label: 'Coding', Icon: CodeIcon }
    ]
  },
  {
    label: 'Prepare',
    items: [
      { id: 'practice', label: 'Practice', Icon: PracticeIcon }
    ]
  },
  {
    label: 'You',
    items: [
      { id: 'profile', label: 'Profile', Icon: ProfileIcon },
      { id: 'history', label: 'History', Icon: HistoryIcon }
    ]
  },
  {
    label: 'System',
    items: [
      { id: 'settings', label: 'Settings', Icon: SettingsIcon }
    ]
  }
]

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [ghostMode, setGhostMode] = useState(true)

  useEffect(() => {
    window.copilot?.ghost?.getStatus?.().then(setGhostMode)
    const unsub = window.copilot?.ghost?.onStatusChange?.(setGhostMode)
    return () => unsub?.()
  }, [])

  return (
    <div
      className="w-[220px] flex flex-col py-5 px-3"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)'
      }}
    >
      {/* Logo */}
      <div className="px-3 mb-8">
        <h1
          className="text-xl font-bold gradient-text"
          style={{ filter: 'drop-shadow(0 0 8px rgba(124, 92, 252, 0.3))' }}
        >
          CoPilot
        </h1>
        <p
          className="text-[10px] mt-1.5 font-bold tracking-[0.12em]"
          style={{ color: 'var(--text-muted)' }}
        >
          AI INTERVIEW ASSISTANT
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4">
        {navSections.map((section) => (
          <div key={section.label}>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.1em] px-3 mb-2"
              style={{ color: 'var(--text-muted)', opacity: 0.7 }}
            >
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = currentPage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    data-active={isActive ? 'true' : undefined}
                    className="sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                    style={{
                      backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                      color: isActive ? 'var(--accent-hover)' : 'var(--text-secondary)',
                      borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                      ...(isActive ? {
                        boxShadow: '0 0 24px rgba(124, 92, 252, 0.1), inset 0 0 12px rgba(124, 92, 252, 0.04)',
                        borderColor: 'var(--accent)'
                      } : {})
                    }}
                  >
                    <item.Icon size={18} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="mt-auto pt-4 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
        {/* Ghost mode indicator */}
        <button
          onClick={() => window.copilot?.ghost?.toggle()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all"
          style={{
            color: ghostMode ? 'var(--success)' : 'var(--text-muted)',
            backgroundColor: ghostMode ? 'var(--success-subtle)' : 'transparent'
          }}
        >
          <ShieldIcon size={16} />
          <span>{ghostMode ? 'Ghost Active' : 'Ghost Off'}</span>
          <span className="ml-auto text-[10px] opacity-60">^G</span>
        </button>

        {/* Overlay toggle */}
        <button
          onClick={() => window.copilot?.overlay?.toggle()}
          className="overlay-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all"
          style={{ color: 'var(--text-secondary)' }}
        >
          <OverlayIcon size={16} />
          <span>Toggle Overlay</span>
          <span className="ml-auto text-[10px] opacity-60">^O</span>
        </button>
      </div>
    </div>
  )
}
