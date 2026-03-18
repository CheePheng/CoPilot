import Badge from '../ui/Badge'
import { ComplexityIcon } from '../ui/Icons'

interface Props {
  label: string
  value: string
}

export default function ComplexityBadge({ label, value }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <Badge variant="accent" size="md">
        <ComplexityIcon size={10} className="mr-1" />
        {value}
      </Badge>
    </div>
  )
}
