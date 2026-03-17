interface Props {
  level: number // 0-1
}

export default function AudioMeter({ level }: Props) {
  const bars = 12
  const activeBars = Math.round(level * bars)

  return (
    <div className="flex items-center gap-0.5 h-5">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full transition-all duration-75"
          style={{
            height: `${40 + (i / bars) * 60}%`,
            backgroundColor:
              i < activeBars
                ? i < bars * 0.6
                  ? 'var(--success)'
                  : i < bars * 0.85
                    ? 'var(--warning)'
                    : 'var(--danger)'
                : 'var(--bg-tertiary)',
            opacity: i < activeBars ? 1 : 0.3
          }}
        />
      ))}
    </div>
  )
}
