import { ipcMain } from 'electron'
import { windowManager } from '../windows/windowManager'
import { registerAudioIpc } from './audioIpc'
import { registerSessionIpc } from './sessionIpc'
import { registerAiIpc } from './aiIpc'
import { storageService } from '../services/storageService'
import { sessionManager } from '../services/sessionManager'
import { codingService, type CodingRequest } from '../services/codingService'
import { historyService } from '../services/historyService'
import { mockService, type MockConfig } from '../services/mockService'
import { screenshotService } from '../services/screenshotService'

export function registerIpcHandlers(): void {
  // Overlay controls
  ipcMain.handle('overlay:toggle', () => {
    windowManager.toggleOverlay()
  })

  ipcMain.handle('overlay:set-opacity', (_event, opacity: number) => {
    const clamped = Math.min(1, Math.max(0, Number(opacity) || 0))
    windowManager.setOverlayOpacity(clamped)
  })

  ipcMain.handle('overlay:set-click-through', (_event, enabled: boolean) => {
    windowManager.setOverlayClickThrough(enabled)
  })

  // Mouse events for overlay interactivity
  ipcMain.on('overlay:mouse-enter', () => {
    windowManager.setOverlayClickThrough(false)
  })

  ipcMain.on('overlay:mouse-leave', () => {
    windowManager.setOverlayClickThrough(true)
  })

  // Ghost mode
  ipcMain.handle('ghost:toggle', () => {
    const enabled = windowManager.toggleGhostMode()
    windowManager.sendToAll('ghost:status', enabled)
    return enabled
  })

  ipcMain.handle('ghost:get-status', () => {
    return windowManager.isGhostMode()
  })

  ipcMain.handle('ghost:set', (_event, enabled: boolean) => {
    windowManager.setGhostMode(enabled)
    windowManager.sendToAll('ghost:status', enabled)
    return enabled
  })

  // Storage persistence
  ipcMain.handle('storage:get', (_event, key: string) => {
    return storageService.get(key)
  })

  ipcMain.handle('storage:set', (_event, key: string, value: unknown) => {
    const payload = JSON.stringify(value)
    if (payload.length > 5 * 1024 * 1024) {
      return { success: false, error: 'Payload exceeds 5MB limit' }
    }
    storageService.set(key, value)
    return { success: true }
  })

  ipcMain.handle('storage:get-all', () => {
    return storageService.getAll()
  })

  // Profile sync to main process
  ipcMain.handle('profile:sync', (_event, profile: unknown) => {
    sessionManager.setProfile(profile as Parameters<typeof sessionManager.setProfile>[0])
    return { success: true }
  })

  // Coding mode
  ipcMain.handle('coding:generate', async (_event, request: CodingRequest) => {
    if (!request?.language || typeof request.language !== 'string' || request.language.trim() === '') {
      return { success: false, error: 'Invalid request: language must be a non-empty string' }
    }

    // Sync provider setting
    const settings = storageService.get('settings') as Record<string, unknown> | undefined
    const provider = (settings?.aiProvider as string) || 'ollama'
    codingService.setProvider(provider as 'ollama' | 'claude')
    if (settings?.claudeModel) codingService.setClaudeModel(settings.claudeModel as string)

    // Wire up events for this request
    const onChunk = (data: { text: string; done: boolean }) => {
      windowManager.sendToAll('coding:stream-chunk', data)
    }
    const onComplete = (result: unknown) => {
      windowManager.sendToAll('coding:complete', result)
    }
    const onError = (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      windowManager.sendToAll('coding:error', message)
    }

    codingService.on('stream-chunk', onChunk)
    codingService.on('coding-complete', onComplete)
    codingService.on('error', onError)

    try {
      await codingService.generateCode(request)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      windowManager.sendToAll('coding:error', message)
      return { success: false, error: message }
    } finally {
      codingService.removeListener('stream-chunk', onChunk)
      codingService.removeListener('coding-complete', onComplete)
      codingService.removeListener('error', onError)
    }
  })

  ipcMain.handle('coding:cancel', () => {
    codingService.cancelCurrent()
    return { success: true }
  })

  // History
  ipcMain.handle('history:get', () => historyService.getHistory())
  ipcMain.handle('history:delete', (_e, id: string) => {
    historyService.deleteSession(id)
    return { success: true }
  })
  ipcMain.handle('history:clear', () => {
    historyService.clearHistory()
    return { success: true }
  })

  // Mock interview
  ipcMain.handle('mock:generate-question', async (_event, config: MockConfig) => {
    const validDifficulties = ['easy', 'medium', 'hard']
    if (!config?.difficulty || !validDifficulties.includes(config.difficulty)) {
      return { success: false, error: `Invalid difficulty: must be one of ${validDifficulties.join(', ')}` }
    }

    const settings = storageService.get('settings') as Record<string, unknown> | undefined
    const provider = (settings?.aiProvider as string) || 'ollama'
    mockService.setProvider(provider as 'ollama' | 'claude')
    if (settings?.claudeModel) mockService.setClaudeModel(settings.claudeModel as string)

    const onChunk = (data: { text: string; done: boolean }): void => {
      windowManager.sendToAll('mock:question-chunk', data)
    }
    const onReady = (data: { question: string }): void => {
      windowManager.sendToAll('mock:question-ready', data)
    }
    const onError = (error: string): void => {
      windowManager.sendToAll('mock:error', error)
    }

    mockService.on('mock:question-chunk', onChunk)
    mockService.on('mock:question-ready', onReady)
    mockService.on('mock:error', onError)

    try {
      await mockService.generateQuestion(config)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      windowManager.sendToAll('mock:error', message)
      return { success: false, error: message }
    } finally {
      mockService.removeListener('mock:question-chunk', onChunk)
      mockService.removeListener('mock:question-ready', onReady)
      mockService.removeListener('mock:error', onError)
    }
  })

  ipcMain.handle('mock:evaluate', async (_event, data: { question: string; answer: string; config: MockConfig }) => {
    const settings = storageService.get('settings') as Record<string, unknown> | undefined
    const provider = (settings?.aiProvider as string) || 'ollama'
    mockService.setProvider(provider as 'ollama' | 'claude')
    if (settings?.claudeModel) mockService.setClaudeModel(settings.claudeModel as string)

    const onChunk = (chunkData: { text: string; done: boolean }): void => {
      windowManager.sendToAll('mock:eval-chunk', chunkData)
    }
    const onComplete = (evaluation: unknown): void => {
      windowManager.sendToAll('mock:eval-complete', evaluation)
    }
    const onError = (error: string): void => {
      windowManager.sendToAll('mock:error', error)
    }

    mockService.on('mock:eval-chunk', onChunk)
    mockService.on('mock:eval-complete', onComplete)
    mockService.on('mock:error', onError)

    try {
      await mockService.evaluateAnswer(data.question, data.answer, data.config)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      windowManager.sendToAll('mock:error', message)
      return { success: false, error: message }
    } finally {
      mockService.removeListener('mock:eval-chunk', onChunk)
      mockService.removeListener('mock:eval-complete', onComplete)
      mockService.removeListener('mock:error', onError)
    }
  })

  ipcMain.handle('mock:compare', async (_event, data: {
    question: string
    prevAnswer: string
    currAnswer: string
    prevScores: Record<string, number>
    currScores: Record<string, number>
    config: MockConfig
  }) => {
    const settings = storageService.get('settings') as Record<string, unknown> | undefined
    const provider = (settings?.aiProvider as string) || 'ollama'
    mockService.setProvider(provider as 'ollama' | 'claude')
    if (settings?.claudeModel) mockService.setClaudeModel(settings.claudeModel as string)

    const onChunk = (chunkData: { text: string; done: boolean }): void => {
      windowManager.sendToAll('mock:comparison-chunk', chunkData)
    }
    const onComplete = (comparison: unknown): void => {
      windowManager.sendToAll('mock:comparison-complete', comparison)
    }
    const onError = (error: string): void => {
      windowManager.sendToAll('mock:error', error)
    }

    mockService.on('mock:comparison-chunk', onChunk)
    mockService.on('mock:comparison-complete', onComplete)
    mockService.on('mock:error', onError)

    try {
      await mockService.compareAnswers(
        data.question,
        data.prevAnswer,
        data.currAnswer,
        data.prevScores,
        data.currScores,
        data.config
      )
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      windowManager.sendToAll('mock:error', message)
      return { success: false, error: message }
    } finally {
      mockService.removeListener('mock:comparison-chunk', onChunk)
      mockService.removeListener('mock:comparison-complete', onComplete)
      mockService.removeListener('mock:error', onError)
    }
  })

  ipcMain.handle('mock:cancel', () => {
    mockService.cancelCurrent()
    return { success: true }
  })

  // Screenshot / image
  ipcMain.handle('coding:pick-image', async () => {
    return screenshotService.pickImageFile()
  })

  ipcMain.handle('coding:capture-screen', async () => {
    return screenshotService.captureScreen()
  })

  ipcMain.handle('coding:generate-from-image', async (_event, request: CodingRequest & { image: { base64: string; mimeType: string } }) => {
    const settings = storageService.get('settings') as Record<string, unknown> | undefined
    const provider = (settings?.aiProvider as string) || 'ollama'
    codingService.setProvider(provider as 'ollama' | 'claude')
    if (settings?.claudeModel) codingService.setClaudeModel(settings.claudeModel as string)

    const onChunk = (data: { text: string; done: boolean }): void => {
      windowManager.sendToAll('coding:stream-chunk', data)
    }
    const onComplete = (result: unknown): void => {
      windowManager.sendToAll('coding:complete', result)
    }
    const onError = (error: unknown): void => {
      const message = error instanceof Error ? error.message : String(error)
      windowManager.sendToAll('coding:error', message)
    }

    codingService.on('stream-chunk', onChunk)
    codingService.on('coding-complete', onComplete)
    codingService.on('error', onError)

    try {
      await codingService.generateCodeFromImage(request, request.image.base64, request.image.mimeType)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      windowManager.sendToAll('coding:error', message)
      return { success: false, error: message }
    } finally {
      codingService.removeListener('stream-chunk', onChunk)
      codingService.removeListener('coding-complete', onComplete)
      codingService.removeListener('error', onError)
    }
  })

  // Register module-specific IPC handlers
  registerAudioIpc()
  registerSessionIpc()
  registerAiIpc()
}
