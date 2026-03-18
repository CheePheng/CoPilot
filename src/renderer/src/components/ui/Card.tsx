import { useState, type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  header?: ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5'
}

export default function Card({
  children,
  className = '',
  style,
  header,
  collapsible = false,
  defaultCollapsed = false,
  padding = 'lg'
}: CardProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <div
      className={`glass-panel ${paddingClasses[padding]} ${className}`}
      style={style}
    >
      {header && (
        <div
          className={`flex items-center justify-between ${collapsible ? 'cursor-pointer select-none' : ''} ${collapsed ? '' : 'mb-4'}`}
          onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        >
          {header}
          {collapsible && (
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform"
              style={{
                color: 'var(--text-muted)',
                transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)'
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
      )}
      <div
        className="transition-[grid-template-rows] duration-200 ease-out"
        style={{
          display: 'grid',
          gridTemplateRows: collapsed ? '0fr' : '1fr'
        }}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

export function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
      {children}
    </h3>
  )
}
