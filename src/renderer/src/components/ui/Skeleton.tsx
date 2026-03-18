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
