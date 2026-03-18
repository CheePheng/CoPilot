import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react'

const baseStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  transition: 'all 0.2s ease'
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: ReactNode
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, hint, className = '', style, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-3 py-2 rounded-xl text-sm ${className}`}
        style={{ ...baseStyle, ...style }}
        {...props}
      />
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
      {hint && !error && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  )
)
TextInput.displayName = 'TextInput'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: ReactNode
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, className = '', style, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`w-full px-3 py-2 rounded-xl text-sm resize-none ${className}`}
        style={{ ...baseStyle, ...style }}
        {...props}
      />
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
      {hint && !error && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  )
)
TextArea.displayName = 'TextArea'

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: ReactNode
  options: Array<{ value: string; label: string }>
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, error, hint, options, className = '', style, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-3 py-2 rounded-xl text-sm ${className}`}
        style={{ ...baseStyle, ...style }}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
      {hint && !error && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  )
)
SelectInput.displayName = 'SelectInput'
