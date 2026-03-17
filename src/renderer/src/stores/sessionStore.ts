import { create } from 'zustand'
import type { SessionStatus, AnswerCard, StreamChunk } from '../types/ipc'

interface SessionState {
  status: SessionStatus
  currentAnswer: string
  currentAnswerCard: AnswerCard | null
  answerHistory: AnswerCard[]
  sessionStartTime: number | null
  elapsedTime: number
  setStatus: (status: SessionStatus) => void
  appendStreamChunk: (chunk: StreamChunk) => void
  setAnswerCard: (card: AnswerCard) => void
  clearCurrentAnswer: () => void
  startTimer: () => void
  stopTimer: () => void
  tickTimer: () => void
}

let timerInterval: ReturnType<typeof setInterval> | null = null

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'idle',
  currentAnswer: '',
  currentAnswerCard: null,
  answerHistory: [],
  sessionStartTime: null,
  elapsedTime: 0,

  setStatus: (status) => {
    set({ status })
    if (status === 'listening' && !get().sessionStartTime) {
      get().startTimer()
    } else if (status === 'idle') {
      get().stopTimer()
    }
  },

  appendStreamChunk: (chunk) =>
    set((state) => {
      if (chunk.done) return state
      return { currentAnswer: state.currentAnswer + chunk.text }
    }),

  setAnswerCard: (card) =>
    set((state) => ({
      currentAnswerCard: card,
      answerHistory: [...state.answerHistory, card]
    })),

  clearCurrentAnswer: () => set({ currentAnswer: '', currentAnswerCard: null }),

  startTimer: () => {
    if (timerInterval) clearInterval(timerInterval)
    const startTime = Date.now()
    set({ sessionStartTime: startTime, elapsedTime: 0 })
    timerInterval = setInterval(() => {
      set({ elapsedTime: Math.floor((Date.now() - startTime) / 1000) })
    }, 1000)
  },

  stopTimer: () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    set({ sessionStartTime: null, elapsedTime: 0 })
  },

  tickTimer: () => {
    const start = get().sessionStartTime
    if (start) {
      set({ elapsedTime: Math.floor((Date.now() - start) / 1000) })
    }
  }
}))
