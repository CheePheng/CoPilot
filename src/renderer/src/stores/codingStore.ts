import { create } from 'zustand'

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp'
export type InputMethod = 'paste' | 'manual' | 'screenshot'

interface CodingState {
  question: string
  language: SupportedLanguage
  inputMethod: InputMethod
  generatedCode: string
  explanation: string
  timeComplexity: string
  spaceComplexity: string
  streamText: string
  isStreaming: boolean
  error: string | null
  imagePreview: { base64: string; mimeType: string } | null

  setQuestion: (q: string) => void
  setLanguage: (l: SupportedLanguage) => void
  setInputMethod: (m: InputMethod) => void
  startGeneration: () => void
  appendStreamChunk: (text: string) => void
  setResult: (result: {
    code: string
    explanation: string
    timeComplexity: string
    spaceComplexity: string
  }) => void
  setError: (error: string) => void
  setImagePreview: (img: { base64: string; mimeType: string } | null) => void
  reset: () => void
}

export const useCodingStore = create<CodingState>((set) => ({
  question: '',
  language: 'python',
  inputMethod: 'paste',
  generatedCode: '',
  explanation: '',
  timeComplexity: '',
  spaceComplexity: '',
  streamText: '',
  isStreaming: false,
  error: null,
  imagePreview: null,

  setQuestion: (question) => set({ question }),
  setLanguage: (language) => set({ language }),
  setInputMethod: (inputMethod) => set({ inputMethod }),
  setImagePreview: (imagePreview) => set({ imagePreview }),

  startGeneration: () =>
    set({
      isStreaming: true,
      streamText: '',
      generatedCode: '',
      explanation: '',
      timeComplexity: '',
      spaceComplexity: '',
      error: null
    }),

  appendStreamChunk: (text) =>
    set((state) => ({ streamText: state.streamText + text })),

  setResult: (result) =>
    set({
      generatedCode: result.code,
      explanation: result.explanation,
      timeComplexity: result.timeComplexity,
      spaceComplexity: result.spaceComplexity,
      isStreaming: false
    }),

  setError: (error) => set({ error, isStreaming: false }),

  reset: () =>
    set({
      question: '',
      generatedCode: '',
      explanation: '',
      timeComplexity: '',
      spaceComplexity: '',
      streamText: '',
      isStreaming: false,
      error: null,
      imagePreview: null
    })
}))
