import type { SupportedLanguage } from '../../stores/codingStore'
import Button from '../ui/Button'

const LANGUAGES: Array<{ value: SupportedLanguage; label: string; short: string }> = [
  { value: 'javascript', label: 'JavaScript', short: 'JS' },
  { value: 'typescript', label: 'TypeScript', short: 'TS' },
  { value: 'python', label: 'Python', short: 'PY' },
  { value: 'java', label: 'Java', short: 'JV' },
  { value: 'cpp', label: 'C++', short: 'C++' }
]

interface Props {
  selected: SupportedLanguage
  onSelect: (lang: SupportedLanguage) => void
  disabled?: boolean
}

export default function LanguageSelector({ selected, onSelect, disabled }: Props) {
  return (
    <div className="flex gap-1.5">
      {LANGUAGES.map((lang) => (
        <Button
          key={lang.value}
          variant={selected === lang.value ? 'primary' : 'ghost'}
          size="sm"
          disabled={disabled}
          onClick={() => onSelect(lang.value)}
        >
          {lang.label}
        </Button>
      ))}
    </div>
  )
}
