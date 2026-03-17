import { useState, useEffect } from 'react'
import {
  InterviewIcon,
  PracticeIcon,
  HistoryIcon,
  ProfileIcon,
  SettingsIcon,
  OverlayIcon,
  ShieldIcon
} from '../ui/Icons'

type Page = 'interview' | 'practice' | 'history' | 'profile' | 'settings'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const navItems: { id: Page; label: string; Icon: typeof InterviewIcon }[] = [
  { id: 'interview', label: 'Interview', Icon: InterviewIcon },
  { id: 'practice', label: 'Practice', Icon: PracticeIcon },
  { id: 'history', label: 'History', Icon: HistoryIcon },
  { id: 'profile', label: 'Profile', Icon: ProfileIcon },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon }
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
        <h1 className="text-xl font-bold gradient-text">CoPilot</h1>
        <p className="text-[11px] mt-1 font-medium tracking-wide" style={{ color: 'var(--text-muted)' }}>
          AI INTERVIEW ASSISTANT
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
              style={{
                backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                color: isActive ? 'var(--accent-hover)' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                ...(isActive ? { boxShadow: '0 0 20px rgba(124, 92, 252, 0.08)' } : {})
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                  e.currentTarget.style.transform = 'translateX(2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.transform = 'translateX(0)'
                }
              }}
            >
              <item.Icon size={18} />
              {item.label}
            </button>
          )
        })}
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
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <OverlayIcon size={16} />
          <span>Toggle Overlay</span>
          <span className="ml-auto text-[10px] opacity-60">^O</span>
        </button>
      </div>
    </div>
  )
}
