import { create } from 'zustand'
import type { SessionRecord } from '../types/ipc'

interface HistoryAnalytics {
  totalSessions: number
  totalQuestions: number
  avgDuration: number
  typeBreakdown: Record<string, number>
}

interface HistoryState {
  sessions: SessionRecord[]
  analytics: HistoryAnalytics
  isLoading: boolean

  loadHistory: () => Promise<void>
  deleteSession: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
}

function computeAnalytics(sessions: SessionRecord[]): HistoryAnalytics {
  const totalSessions = sessions.length
  const totalQuestions = sessions.reduce((sum, s) => sum + s.questionCount, 0)
  const avgDuration = totalSessions > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions)
    : 0

  const typeBreakdown: Record<string, number> = {}
  for (const s of sessions) {
    for (const q of s.questions) {
      typeBreakdown[q.type] = (typeBreakdown[q.type] || 0) + 1
    }
  }

  return { totalSessions, totalQuestions, avgDuration, typeBreakdown }
}

export const useHistoryStore = create<HistoryState>((set) => ({
  sessions: [],
  analytics: { totalSessions: 0, totalQuestions: 0, avgDuration: 0, typeBreakdown: {} },
  isLoading: false,

  loadHistory: async () => {
    set({ isLoading: true })
    const data = await window.copilot?.history?.get?.()
    const sessions = Array.isArray(data) ? (data as SessionRecord[]) : []
    set({ sessions, analytics: computeAnalytics(sessions), isLoading: false })
  },

  deleteSession: async (id: string) => {
    await window.copilot?.history?.delete?.(id)
    set((state) => {
      const sessions = state.sessions.filter((s) => s.id !== id)
      return { sessions, analytics: computeAnalytics(sessions) }
    })
  },

  clearHistory: async () => {
    await window.copilot?.history?.clear?.()
    set({
      sessions: [],
      analytics: { totalSessions: 0, totalQuestions: 0, avgDuration: 0, typeBreakdown: {} }
    })
  }
}))
