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
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-2.5 text-sm gap-2 rounded-xl'
}

const variantStyles: Record<ButtonVariant, {
  base: React.CSSProperties
  hover: React.CSSProperties
}> = {
  primary: {
    base: {
      background: 'var(--accent-gradient)',
      color: 'white',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-glow)'
    },
    hover: {
      transform: 'scale(1.02)',
      boxShadow: '0 0 32px rgba(124, 92, 252, 0.3)'
    }
  },
  secondary: {
    base: {
      backgroundColor: 'var(--bg-tertiary)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)'
    },
    hover: {
      backgroundColor: 'var(--bg-elevated)',
      color: 'var(--text-primary)'
    }
  },
  ghost: {
    base: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent'
    },
    hover: {
      backgroundColor: 'var(--bg-tertiary)',
      color: 'var(--text-primary)'
    }
  },
  danger: {
    base: {
      backgroundColor: 'var(--danger-subtle)',
      color: 'var(--danger)',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    },
    hover: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      borderColor: 'rgba(239, 68, 68, 0.3)'
    }
  },
  success: {
    base: {
      backgroundColor: 'var(--success-subtle)',
      color: 'var(--success)',
      border: '1px solid rgba(16, 185, 129, 0.2)'
    },
    hover: {
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderColor: 'rgba(16, 185, 129, 0.3)'
    }
  },
  warning: {
    base: {
      backgroundColor: 'var(--warning-subtle)',
      color: 'var(--warning)',
      border: '1px solid rgba(245, 158, 11, 0.2)'
    },
    hover: {
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      borderColor: 'rgba(245, 158, 11, 0.3)'
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
        className={`inline-flex items-center justify-center font-semibold cursor-pointer transition-all ${sizeClasses[size]} ${className}`}
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
