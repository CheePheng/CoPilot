/**
 * Shared JSON extractor used by ollamaService, codingService, and mockService.
 * Uses brace-counting to find the first complete JSON object in streaming text.
 */
export function extractJson(text: string): string | null {
  // Try full text first
  try {
    JSON.parse(text.trim())
    return text.trim()
  } catch {
    // Not pure JSON, try to extract
  }

  // Find the first { and use brace counting to find the matching }
  const start = text.indexOf('{')
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escape = false

  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escape) {
      escape = false
      continue
    }
    if (ch === '\\' && inString) {
      escape = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        return text.slice(start, i + 1)
      }
    }
  }
  return null
}
