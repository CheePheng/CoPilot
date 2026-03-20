import { create } from 'zustand'
import type { MockEvaluation } from '../types/ipc'

interface MockFeedback {
  question: string
  answer: string
  evaluation: MockEvaluation
}

interface MockState {
  currentQuestion: string
  questionStreamText: string
  isGeneratingQuestion: boolean
  isEvaluating: boolean
  evalStreamText: string
  currentFeedback: MockFeedback | null
  feedbackHistory: MockFeedback[]
  error: string | null

  setCurrentQuestion: (q: string) => void
  appendQuestionChunk: (text: string) => void
  startQuestionGeneration: () => void
  finishQuestionGeneration: (question: string) => void
  startEvaluation: () => void
  appendEvalChunk: (text: string) => void
  finishEvaluation: (question: string, answer: string, evaluation: MockEvaluation) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useMockStore = create<MockState>((set) => ({
  currentQuestion: '',
  questionStreamText: '',
  isGeneratingQuestion: false,
  isEvaluating: false,
  evalStreamText: '',
  currentFeedback: null,
  feedbackHistory: [],
  error: null,

  setCurrentQuestion: (q) => set({ currentQuestion: q }),
  appendQuestionChunk: (text) => set((s) => ({ questionStreamText: s.questionStreamText + text })),
  startQuestionGeneration: () => set({
    isGeneratingQuestion: true,
    questionStreamText: '',
    currentQuestion: '',
    error: null
  }),
  finishQuestionGeneration: (question) => set({
    isGeneratingQuestion: false,
    currentQuestion: question,
    questionStreamText: ''
  }),
  startEvaluation: () => set({ isEvaluating: true, evalStreamText: '', currentFeedback: null, error: null }),
  appendEvalChunk: (text) => set((s) => ({ evalStreamText: s.evalStreamText + text })),
  finishEvaluation: (question, answer, evaluation) => set((s) => {
    const feedback: MockFeedback = { question, answer, evaluation }
    return {
      isEvaluating: false,
      evalStreamText: '',
      currentFeedback: feedback,
      feedbackHistory: [...s.feedbackHistory, feedback]
    }
  }),
  setError: (error) => set({ error, isGeneratingQuestion: false, isEvaluating: false }),

  reset: () => set({
    currentQuestion: '',
    questionStreamText: '',
    isGeneratingQuestion: false,
    isEvaluating: false,
    evalStreamText: '',
    currentFeedback: null,
    feedbackHistory: [],
    error: null
  })
}))
