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

const Spinner = ({ size }: { size: number }) => (
  <span
    className="inline-block border-2 border-current border-t-transparent rounded-full animate-spin"
    style={{ width: size, height: size }}
  />
)

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading = false, icon, children, disabled, className = '', style, ...props }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center font-semibold cursor-pointer transition-all duration-200 btn-${variant} ${sizeClasses[size]} ${className}`}
        style={{
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          ...style
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
