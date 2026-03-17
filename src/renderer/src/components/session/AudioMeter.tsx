interface Props {
  level: number // 0-1
}

export default function AudioMeter({ level }: Props) {
  const bars = 20
  const activeBars = Math.round(level * bars)

  return (
    <div className="flex items-end gap-[2px] h-6 px-1">
      {Array.from({ length: bars }).map((_, i) => {
        const isActive = i < activeBars
        const ratio = i / bars
        // Gradient from accent to success
        const hue = 260 - ratio * 100 // purple to green
        const height = 30 + Math.sin((i / bars) * Math.PI) * 70

        return (
          <div
            key={i}
            className="w-[3px] rounded-full"
            style={{
              height: `${height}%`,
              backgroundColor: isActive
                ? `hsl(${hue}, 70%, 60%)`
                : 'var(--border)',
              opacity: isActive ? 1 : 0.25,
              boxShadow: isActive ? `0 0 6px hsl(${hue}, 70%, 60%, 0.4)` : 'none',
              transition: 'all 0.08s ease'
            }}
          />
        )
      })}
    </div>
  )
}
