import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'gradient'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
  size?: 'sm' | 'md'
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-xs)'
  },
  accent: {
    backgroundColor: 'var(--accent-subtle)',
    color: 'var(--accent-hover)',
    border: '1px solid rgba(124, 92, 252, 0.15)',
    boxShadow: '0 0 12px rgba(124, 92, 252, 0.06)'
  },
  success: {
    backgroundColor: 'var(--success-subtle)',
    color: 'var(--success)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    boxShadow: '0 0 12px rgba(16, 185, 129, 0.06)'
  },
  warning: {
    backgroundColor: 'var(--warning-subtle)',
    color: 'var(--warning)',
    border: '1px solid rgba(245, 158, 11, 0.15)',
    boxShadow: '0 0 12px rgba(245, 158, 11, 0.06)'
  },
  danger: {
    backgroundColor: 'var(--danger-subtle)',
    color: 'var(--danger)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    boxShadow: '0 0 12px rgba(239, 68, 68, 0.06)'
  },
  gradient: {
    background: 'var(--accent-gradient)',
    color: 'white',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    boxShadow: '0 0 12px rgba(124, 92, 252, 0.1), var(--shadow-xs)'
  }
}

const sizeClasses = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-[11px] px-2.5 py-1'
}

export default function Badge({ variant = 'default', children, className = '', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg ${sizeClasses[size]} ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  )
}
