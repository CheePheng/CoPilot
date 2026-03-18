import { ipcMain } from 'electron'
import { windowManager } from '../windows/windowManager'
import { registerAudioIpc } from './audioIpc'
import { registerSessionIpc } from './sessionIpc'
import { registerAiIpc } from './aiIpc'
import { storageService } from '../services/storageService'
import { sessionManager } from '../services/sessionManager'
import { codingService, type CodingRequest } from '../services/codingService'

export function registerIpcHandlers(): void {
  // Overlay controls
  ipcMain.handle('overlay:toggle', () => {
    windowManager.toggleOverlay()
  })

  ipcMain.handle('overlay:set-opacity', (_event, opacity: number) => {
    windowManager.setOverlayOpacity(opacity)
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
    // Sync provider setting
    const settings = storageService.get('settings') as Record<string, unknown> | undefined
    const provider = (settings?.aiProvider as string) || 'ollama'
    codingService.setProvider(provider as 'ollama' | 'claude')

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

  // Register module-specific IPC handlers
  registerAudioIpc()
  registerSessionIpc()
  registerAiIpc()
}
