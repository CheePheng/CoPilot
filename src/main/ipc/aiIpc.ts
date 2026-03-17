import { ipcMain } from 'electron'
import { claudeService } from '../services/claudeService'
import { deepgramService } from '../services/deepgramService'
import { ollamaService } from '../services/ollamaService'
import { webSpeechBridge } from '../services/webSpeechBridge'
import { sessionManager } from '../services/sessionManager'
import type { AIProviderType, STTProviderType } from '../services/types'

let currentAIProvider: AIProviderType = 'ollama'
let currentSTTProvider: STTProviderType = 'web-speech'

// Initialize with free defaults
function initDefaults(): void {
  sessionManager.setAIProvider(ollamaService)
  sessionManager.setSTTProvider(webSpeechBridge)
  webSpeechBridge.registerIpc()
}

export function registerAiIpc(): void {
  initDefaults()

  // Provider selection
  ipcMain.handle('ai:set-provider', (_event, provider: AIProviderType) => {
    currentAIProvider = provider
    if (provider === 'ollama') {
      sessionManager.setAIProvider(ollamaService)
    } else {
      sessionManager.setAIProvider(claudeService)
    }
    return { success: true }
  })

  ipcMain.handle('stt:set-provider', (_event, provider: STTProviderType) => {
    currentSTTProvider = provider
    if (provider === 'web-speech') {
      sessionManager.setSTTProvider(webSpeechBridge)
    } else {
      sessionManager.setSTTProvider(deepgramService)
    }
    return { success: true }
  })

  ipcMain.handle('ai:get-providers', () => {
    return { ai: currentAIProvider, stt: currentSTTProvider }
  })

  // Claude-specific
  ipcMain.handle('ai:set-api-key', (_event, key: string) => {
    claudeService.setApiKey(key)
    return { success: true }
  })

  ipcMain.handle('ai:set-model', (_event, model: string) => {
    if (currentAIProvider === 'claude') {
      claudeService.setModel(model)
    } else {
      ollamaService.setModel(model)
    }
    return { success: true }
  })

  ipcMain.handle('ai:is-configured', () => {
    if (currentAIProvider === 'ollama') {
      return ollamaService.isConfigured()
    }
    return claudeService.isConfigured()
  })

  // Deepgram-specific
  ipcMain.handle('stt:set-api-key', (_event, key: string) => {
    deepgramService.setApiKey(key)
    return { success: true }
  })

  // Ollama-specific
  ipcMain.handle('ollama:set-url', (_event, url: string) => {
    ollamaService.setBaseUrl(url)
    return { success: true }
  })

  ipcMain.handle('ollama:list-models', async () => {
    return ollamaService.listModels()
  })

  ipcMain.handle('ollama:check-connection', async () => {
    return ollamaService.checkConnection()
  })

  ipcMain.handle('ai:cancel', () => {
    if (currentAIProvider === 'ollama') {
      ollamaService.cancelCurrent()
    } else {
      claudeService.cancelCurrent()
    }
    return { success: true }
  })
}
