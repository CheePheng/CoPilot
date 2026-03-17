import { useEffect, useCallback } from 'react'
import { useSessionStore } from '../stores/sessionStore'
import { useTranscriptStore } from '../stores/transcriptStore'
import type { TranscriptEntry, StreamChunk, AnswerCard, SessionStatus } from '../types/ipc'

export function useSession() {
  const { status, setStatus, appendStreamChunk, setAnswerCard, clearCurrentAnswer } =
    useSessionStore()
  const { addOrUpdateEntry, finalizeEntry, clear: clearTranscript } = useTranscriptStore()

  useEffect(() => {
    const unsubStatus = window.copilot?.session?.onStatusChange?.((s: string) => {
      setStatus(s as SessionStatus)
    })

    const unsubTranscript = window.copilot?.audio?.onTranscriptUpdate?.((data: unknown) => {
      addOrUpdateEntry(data as TranscriptEntry)
    })

    const unsubFinal = window.copilot?.audio?.onTranscriptFinal?.((data: unknown) => {
      finalizeEntry(data as TranscriptEntry)
    })

    const unsubChunk = window.copilot?.ai?.onStreamChunk?.((data: unknown) => {
      const chunk = data as StreamChunk
      if (chunk.done) return
      appendStreamChunk(chunk)
    })

    const unsubAnswer = window.copilot?.ai?.onAnswerComplete?.((data: unknown) => {
      setAnswerCard(data as AnswerCard)
    })

    return () => {
      unsubStatus?.()
      unsubTranscript?.()
      unsubFinal?.()
      unsubChunk?.()
      unsubAnswer?.()
    }
  }, [setStatus, addOrUpdateEntry, finalizeEntry, appendStreamChunk, setAnswerCard])

  const startSession = useCallback(async () => {
    clearCurrentAnswer()
    clearTranscript()
    const result = await window.copilot?.session?.start?.()
    return result as { success: boolean; error?: string } | undefined
  }, [clearCurrentAnswer, clearTranscript])

  const stopSession = useCallback(async () => {
    await window.copilot?.session?.stop?.()
  }, [])

  const pauseSession = useCallback(async () => {
    await window.copilot?.session?.pause?.()
  }, [])

  const resumeSession = useCallback(async () => {
    await window.copilot?.session?.resume?.()
  }, [])

  return { status, startSession, stopSession, pauseSession, resumeSession }
}
