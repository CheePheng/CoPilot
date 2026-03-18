import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-[10px]',
  md: 'px-5 py-2.5 text-[13px] gap-2 rounded-xl',
  lg: 'px-7 py-3 text-sm gap-2.5 rounded-xl'
}

const variantStyles: Record<ButtonVariant, {
  base: React.CSSProperties
  hover: React.CSSProperties
}> = {
  primary: {
    base: {
      background: 'var(--accent-gradient)',
      color: 'white',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      boxShadow: '0 0 20px rgba(124, 92, 252, 0.15), 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      letterSpacing: '0.01em'
    },
    hover: {
      transform: 'translateY(-1px)',
      boxShadow: '0 0 30px rgba(124, 92, 252, 0.25), 0 4px 16px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
    }
  },
  secondary: {
    base: {
      backgroundColor: 'var(--bg-tertiary)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-xs), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
    },
    hover: {
      backgroundColor: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-hover)',
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow-sm), 0 0 16px rgba(124, 92, 252, 0.06)'
    }
  },
  ghost: {
    base: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent'
    },
    hover: {
      backgroundColor: 'rgba(124, 92, 252, 0.06)',
      color: 'var(--text-primary)',
      borderColor: 'rgba(124, 92, 252, 0.1)'
    }
  },
  danger: {
    base: {
      backgroundColor: 'var(--danger-subtle)',
      color: 'var(--danger)',
      border: '1px solid rgba(239, 68, 68, 0.15)',
      boxShadow: 'var(--shadow-xs)'
    },
    hover: {
      backgroundColor: 'rgba(239, 68, 68, 0.18)',
      borderColor: 'rgba(239, 68, 68, 0.25)',
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow-sm), 0 0 16px rgba(239, 68, 68, 0.08)'
    }
  },
  success: {
    base: {
      backgroundColor: 'var(--success-subtle)',
      color: 'var(--success)',
      border: '1px solid rgba(16, 185, 129, 0.15)',
      boxShadow: 'var(--shadow-xs)'
    },
    hover: {
      backgroundColor: 'rgba(16, 185, 129, 0.18)',
      borderColor: 'rgba(16, 185, 129, 0.25)',
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow-sm), 0 0 16px rgba(16, 185, 129, 0.08)'
    }
  },
  warning: {
    base: {
      backgroundColor: 'var(--warning-subtle)',
      color: 'var(--warning)',
      border: '1px solid rgba(245, 158, 11, 0.15)',
      boxShadow: 'var(--shadow-xs)'
    },
    hover: {
      backgroundColor: 'rgba(245, 158, 11, 0.18)',
      borderColor: 'rgba(245, 158, 11, 0.25)',
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow-sm), 0 0 16px rgba(245, 158, 11, 0.08)'
    }
  }
}

const Spinner = ({ size }: { size: number }) => (
  <span
    className="inline-block border-2 border-current border-t-transparent rounded-full animate-spin"
    style={{ width: size, height: size }}
  />
)

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading = false, icon, children, disabled, className = '', style, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const styles = variantStyles[variant]
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center font-semibold cursor-pointer transition-all duration-200 ${sizeClasses[size]} ${className}`}
        style={{
          ...styles.base,
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          ...style
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            Object.assign(e.currentTarget.style, styles.hover)
          }
          onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          Object.assign(e.currentTarget.style, styles.base, style)
          onMouseLeave?.(e)
        }}
        {...props}
      >
        {loading ? <Spinner size={size === 'sm' ? 12 : 14} /> : icon}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
