import { useState } from 'react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { CopyIcon, CheckIcon } from '../ui/Icons'
import type { SupportedLanguage } from '../../stores/codingStore'

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++'
}

interface Props {
  code: string
  language: SupportedLanguage
  isStreaming?: boolean
}

export default function CodeDisplay({ code, language, isStreaming = false }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <Badge variant="gradient" size="md">
          {LANGUAGE_LABELS[language]}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          icon={copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
          onClick={handleCopy}
          style={copied ? { color: 'var(--success)' } : undefined}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      {/* Code */}
      <pre
        className="p-4 overflow-auto text-sm leading-relaxed"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          margin: 0,
          maxHeight: '400px'
        }}
      >
        <code>{code}{isStreaming && <span className="code-cursor-blink" />}</code>
      </pre>
    </div>
  )
}
