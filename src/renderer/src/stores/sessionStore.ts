import { create } from 'zustand'
import type { SessionStatus, AnswerCard, StreamChunk } from '../types/ipc'

interface SessionState {
  status: SessionStatus
  currentAnswer: string
  currentAnswerCard: AnswerCard | null
  answerHistory: AnswerCard[]
  setStatus: (status: SessionStatus) => void
  appendStreamChunk: (chunk: StreamChunk) => void
  setAnswerCard: (card: AnswerCard) => void
  clearCurrentAnswer: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  status: 'idle',
  currentAnswer: '',
  currentAnswerCard: null,
  answerHistory: [],

  setStatus: (status) => set({ status }),

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

  clearCurrentAnswer: () => set({ currentAnswer: '', currentAnswerCard: null })
}))
