import { ipcMain } from 'electron'
import { windowManager } from '../windows/windowManager'
import { registerAudioIpc } from './audioIpc'
import { registerSessionIpc } from './sessionIpc'
import { registerAiIpc } from './aiIpc'

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

  // Register module-specific IPC handlers
  registerAudioIpc()
  registerSessionIpc()
  registerAiIpc()
}
