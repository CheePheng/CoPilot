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
  ghostMode: boolean
  theme: 'dark' | 'light'
  initialized: boolean
  setAIProvider: (provider: AIProviderType) => void
  setSTTProvider: (provider: STTProviderType) => void
  setAnthropicKey: (key: string) => void
  setDeepgramKey: (key: string) => void
  setOllamaUrl: (url: string) => void
  setOllamaModel: (model: string) => void
  setClaudeModel: (model: string) => void
  setOverlayOpacity: (opacity: number) => void
  setGhostMode: (enabled: boolean) => void
  setTheme: (theme: 'dark' | 'light') => void
  loadFromDisk: () => Promise<void>
}

const SETTINGS_KEY = 'settings'

let saveTimer: ReturnType<typeof setTimeout> | null = null

function debouncedSave(state: SettingsState): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const data = {
      aiProvider: state.aiProvider,
      sttProvider: state.sttProvider,
      anthropicKey: state.anthropicKey,
      deepgramKey: state.deepgramKey,
      ollamaUrl: state.ollamaUrl,
      ollamaModel: state.ollamaModel,
      claudeModel: state.claudeModel,
      overlayOpacity: state.overlayOpacity,
      ghostMode: state.ghostMode,
      theme: state.theme
    }
    window.copilot?.storage?.set(SETTINGS_KEY, data)
  }, 500)
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  aiProvider: 'ollama',
  sttProvider: 'web-speech',
  anthropicKey: '',
  deepgramKey: '',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.1:8b',
  claudeModel: 'claude-sonnet-4-20250514',
  overlayOpacity: 0.9,
  ghostMode: true,
  theme: 'dark',
  initialized: false,

  setAIProvider: (provider) => {
    set({ aiProvider: provider })
    debouncedSave(get())
  },
  setSTTProvider: (provider) => {
    set({ sttProvider: provider })
    debouncedSave(get())
  },
  setAnthropicKey: (key) => {
    set({ anthropicKey: key })
    debouncedSave(get())
  },
  setDeepgramKey: (key) => {
    set({ deepgramKey: key })
    debouncedSave(get())
  },
  setOllamaUrl: (url) => {
    set({ ollamaUrl: url })
    debouncedSave(get())
  },
  setOllamaModel: (model) => {
    set({ ollamaModel: model })
    debouncedSave(get())
  },
  setClaudeModel: (model) => {
    set({ claudeModel: model })
    debouncedSave(get())
  },
  setOverlayOpacity: (opacity) => {
    set({ overlayOpacity: opacity })
    debouncedSave(get())
  },
  setGhostMode: (enabled) => {
    set({ ghostMode: enabled })
    debouncedSave(get())
  },
  setTheme: (theme) => {
    set({ theme })
    debouncedSave(get())
  },
  loadFromDisk: async () => {
    try {
      const data = (await window.copilot?.storage?.get(SETTINGS_KEY)) as Record<
        string,
        unknown
      > | null
      if (data) {
        set({
          aiProvider: (data.aiProvider as AIProviderType) || 'ollama',
          sttProvider: (data.sttProvider as STTProviderType) || 'web-speech',
          anthropicKey: (data.anthropicKey as string) || '',
          deepgramKey: (data.deepgramKey as string) || '',
          ollamaUrl: (data.ollamaUrl as string) || 'http://localhost:11434',
          ollamaModel: (data.ollamaModel as string) || 'llama3.1:8b',
          claudeModel: (data.claudeModel as string) || 'claude-sonnet-4-20250514',
          overlayOpacity: (data.overlayOpacity as number) ?? 0.9,
          ghostMode: (data.ghostMode as boolean) ?? true,
          theme: (data.theme as 'dark' | 'light') || 'dark',
          initialized: true
        })
      } else {
        set({ initialized: true })
      }
    } catch {
      set({ initialized: true })
    }
  }
}))
