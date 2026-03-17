import { app, BrowserWindow } from 'electron'
import { createMainWindow } from './windows/mainWindow'
import { createOverlayWindow } from './windows/overlayWindow'
import { windowManager } from './windows/windowManager'
import { registerIpcHandlers } from './ipc/ipcHandlers'
import { setupTray } from './tray'
import { registerGlobalShortcuts, unregisterGlobalShortcuts } from './globalShortcuts'

app.whenReady().then(() => {
  registerIpcHandlers()

  const mainWindow = createMainWindow()
  const overlayWindow = createOverlayWindow()

  windowManager.setMainWindow(mainWindow)
  windowManager.setOverlayWindow(overlayWindow)

  setupTray()
  registerGlobalShortcuts()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const mw = createMainWindow()
      windowManager.setMainWindow(mw)
    }
  })
})

app.on('will-quit', () => {
  unregisterGlobalShortcuts()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
