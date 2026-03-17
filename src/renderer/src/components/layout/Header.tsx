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
  return (
    <header
      className="h-14 flex items-center justify-between px-6 shrink-0"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
        {pageLabels[currentPage]}
      </h2>
    </header>
  )
}
