import { ipcMain } from 'electron'
import { sessionManager } from '../services/sessionManager'

export function registerSessionIpc(): void {
  ipcMain.handle('session:start', async () => {
    await sessionManager.startSession()
    return { success: true }
  })

  ipcMain.handle('session:stop', async () => {
    await sessionManager.stopSession()
    return { success: true }
  })

  ipcMain.handle('session:pause', () => {
    sessionManager.pauseSession()
    return { success: true }
  })

  ipcMain.handle('session:resume', () => {
    sessionManager.resumeSession()
    return { success: true }
  })

  ipcMain.handle('session:state', () => {
    return sessionManager.getState()
  })
}
