import { create } from 'zustand'
import type { AIProviderType, STTProviderType } from '../types/ipc'

interface SettingsState {
  aiProvider: AIProviderType
  sttProvider: STTProviderType
  anthropicKey: string
  deepgramKey: string
  ollamaUrl: string
  ollamaModel: string
  claudeModel: string
  overlayOpacity: number
  theme: 'dark' | 'light'
  setAIProvider: (provider: AIProviderType) => void
  setSTTProvider: (provider: STTProviderType) => void
  setAnthropicKey: (key: string) => void
  setDeepgramKey: (key: string) => void
  setOllamaUrl: (url: string) => void
  setOllamaModel: (model: string) => void
  setClaudeModel: (model: string) => void
  setOverlayOpacity: (opacity: number) => void
  setTheme: (theme: 'dark' | 'light') => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  aiProvider: 'ollama',
  sttProvider: 'web-speech',
  anthropicKey: '',
  deepgramKey: '',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.1:8b',
  claudeModel: 'claude-sonnet-4-20250514',
  overlayOpacity: 0.9,
  theme: 'dark',

  setAIProvider: (provider) => set({ aiProvider: provider }),
  setSTTProvider: (provider) => set({ sttProvider: provider }),
  setAnthropicKey: (key) => set({ anthropicKey: key }),
  setDeepgramKey: (key) => set({ deepgramKey: key }),
  setOllamaUrl: (url) => set({ ollamaUrl: url }),
  setOllamaModel: (model) => set({ ollamaModel: model }),
  setClaudeModel: (model) => set({ claudeModel: model }),
  setOverlayOpacity: (opacity) => set({ overlayOpacity: opacity }),
  setTheme: (theme) => set({ theme })
}))
