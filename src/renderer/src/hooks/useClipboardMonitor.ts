import { useState, useEffect, useCallback, useRef } from 'react'

const QUESTION_PATTERNS = /^(what|how|why|when|where|who|which|can|could|would|should|is|are|do|does|did|have|has|tell|describe|explain|walk|give)/i

function looksLikeQuestion(text: string): boolean {
  if (text.length < 20 || text.length > 2000) return false
  if (QUESTION_PATTERNS.test(text.trim())) return true
  if (text.trim().endsWith('?')) return true
  return false
}

export function useClipboardMonitor(enabled: boolean) {
  const [detectedText, setDetectedText] = useState<string | null>(null)
  const lastClipboard = useRef<string>('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const dismiss = useCallback(() => {
    setDetectedText(null)
  }, [])

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(async () => {
      if (!document.hasFocus()) return
      try {
        const text = await navigator.clipboard.readText()
        if (text && text !== lastClipboard.current) {
          lastClipboard.current = text
          if (looksLikeQuestion(text)) {
            setDetectedText(text)
          }
        }
      } catch {
        // Clipboard access denied — expected
      }
    }, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [enabled])

  return { detectedText, dismiss }
}
