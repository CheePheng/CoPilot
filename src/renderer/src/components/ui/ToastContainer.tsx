import { useToastStore } from '../../stores/toastStore'

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" style={{ maxWidth: '380px' }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          aria-live="assertive"
          className="rounded-xl px-4 py-3 shadow-lg flex items-start gap-3 toast-enter"
          style={{
            backgroundColor:
              toast.type === 'error'
                ? 'rgba(239, 68, 68, 0.15)'
                : toast.type === 'success'
                  ? 'rgba(34, 197, 94, 0.15)'
                  : 'rgba(99, 102, 241, 0.15)',
            border: `1px solid ${
              toast.type === 'error'
                ? 'rgba(239, 68, 68, 0.3)'
                : toast.type === 'success'
                  ? 'rgba(34, 197, 94, 0.3)'
                  : 'rgba(99, 102, 241, 0.3)'
            }`,
            backdropFilter: 'blur(12px)'
          }}
        >
          <span className="text-sm shrink-0 mt-0.5">
            {toast.type === 'error' ? '!' : toast.type === 'success' ? '\u2713' : 'i'}
          </span>
          <p className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss"
            className="text-xs shrink-0 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            \u2715
          </button>
        </div>
      ))}
    </div>
  )
}
