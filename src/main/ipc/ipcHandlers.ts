import { ipcMain } from 'electron'
import { windowManager } from '../windows/windowManager'
import { registerAudioIpc } from './audioIpc'
import { registerSessionIpc } from './sessionIpc'
import { registerAiIpc } from './aiIpc'
import { storageService } from '../services/storageService'
import { sessionManager } from '../services/sessionManager'

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

  // Register module-specific IPC handlers
  registerAudioIpc()
  registerSessionIpc()
  registerAiIpc()
}
