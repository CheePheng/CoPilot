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
    color: 'var(--text-muted)',
    border: '1px solid var(--border)'
  },
  accent: {
    backgroundColor: 'var(--accent-subtle)',
    color: 'var(--accent)',
    border: '1px solid rgba(124, 92, 252, 0.2)'
  },
  success: {
    backgroundColor: 'var(--success-subtle)',
    color: 'var(--success)',
    border: '1px solid rgba(16, 185, 129, 0.2)'
  },
  warning: {
    backgroundColor: 'var(--warning-subtle)',
    color: 'var(--warning)',
    border: '1px solid rgba(245, 158, 11, 0.2)'
  },
  danger: {
    backgroundColor: 'var(--danger-subtle)',
    color: 'var(--danger)',
    border: '1px solid rgba(239, 68, 68, 0.2)'
  },
  gradient: {
    background: 'var(--accent-gradient)',
    color: 'white',
    border: '1px solid transparent'
  }
}

const sizeClasses = {
  sm: 'text-[9px] px-1.5 py-0.5',
  md: 'text-[10px] px-2 py-0.5'
}

export default function Badge({ variant = 'default', children, className = '', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md ${sizeClasses[size]} ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  )
}
