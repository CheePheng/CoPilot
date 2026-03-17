import { ipcMain } from 'electron'
import { sessionManager } from '../services/sessionManager'

export function registerSessionIpc(): void {
  ipcMain.handle('session:start', async () => {
    try {
      await sessionManager.startSession()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('session:stop', async () => {
    try {
      await sessionManager.stopSession()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('session:pause', () => {
    try {
      sessionManager.pauseSession()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('session:resume', () => {
    try {
      sessionManager.resumeSession()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('session:state', () => {
    return sessionManager.getState()
  })
}
