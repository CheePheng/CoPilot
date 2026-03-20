interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function SkeletonLine({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`rounded-md animate-shimmer ${className}`}
      style={{
        height: '12px',
        backgroundColor: 'var(--bg-tertiary)',
        ...style
      }}
    />
  )
}

export function SkeletonBlock({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`rounded-xl animate-shimmer ${className}`}
      style={{
        height: '80px',
        backgroundColor: 'var(--bg-tertiary)',
        ...style
      }}
    />
  )
}

export function SkeletonCode({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`rounded-xl p-4 space-y-2 ${className}`}
      style={{ backgroundColor: 'var(--bg-tertiary)', ...style }}
    >
      <div className="rounded animate-shimmer" style={{ height: '10px', width: '40%', backgroundColor: 'var(--bg-elevated)' }} />
      <div className="rounded animate-shimmer" style={{ height: '10px', width: '75%', backgroundColor: 'var(--bg-elevated)' }} />
      <div className="rounded animate-shimmer" style={{ height: '10px', width: '60%', backgroundColor: 'var(--bg-elevated)' }} />
      <div className="rounded animate-shimmer" style={{ height: '10px', width: '85%', backgroundColor: 'var(--bg-elevated)' }} />
      <div className="rounded animate-shimmer" style={{ height: '10px', width: '50%', backgroundColor: 'var(--bg-elevated)' }} />
    </div>
  )
}

export function SkeletonCard({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{ borderRadius: 'var(--radius-md)', padding: '16px', ...style }}
    >
      <div style={{ height: 16, width: '60%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 12 }} />
      <div style={{ height: 12, width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ height: 12, width: '80%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ height: 12, width: '90%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
    </div>
  )
}

export function SkeletonStats({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`grid grid-cols-4 gap-3 ${className}`}
      style={style}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="skeleton-shimmer"
          style={{ borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'center' }}
        >
          <div style={{ height: 28, width: '50%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, margin: '0 auto 8px' }} />
          <div style={{ height: 10, width: '70%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 4, margin: '0 auto' }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTimeline({ rows = 4, className = '', style }: SkeletonProps & { rows?: number }) {
  return (
    <div className={`space-y-3 ${className}`} style={style}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton-shimmer"
          style={{
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 13, width: i % 2 === 0 ? '55%' : '40%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 10, width: i % 2 === 0 ? '80%' : '65%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
