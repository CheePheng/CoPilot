import { BrowserWindow } from 'electron'

class WindowManager {
  private mainWindow: BrowserWindow | null = null
  private overlayWindow: BrowserWindow | null = null
  private ghostModeEnabled: boolean = true

  setMainWindow(win: BrowserWindow): void {
    this.mainWindow = win
    win.setContentProtection(this.ghostModeEnabled)
    win.on('closed', () => {
      this.mainWindow = null
    })
  }

  setOverlayWindow(win: BrowserWindow): void {
    this.overlayWindow = win
    win.setContentProtection(this.ghostModeEnabled)
    win.on('closed', () => {
      this.overlayWindow = null
    })
  }

  setGhostMode(enabled: boolean): void {
    this.ghostModeEnabled = enabled
    this.mainWindow?.setContentProtection(enabled)
    this.overlayWindow?.setContentProtection(enabled)
  }

  toggleGhostMode(): boolean {
    this.setGhostMode(!this.ghostModeEnabled)
    return this.ghostModeEnabled
  }

  isGhostMode(): boolean {
    return this.ghostModeEnabled
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  getOverlayWindow(): BrowserWindow | null {
    return this.overlayWindow
  }

  toggleOverlay(): void {
    if (!this.overlayWindow) return
    if (this.overlayWindow.isVisible()) {
      this.overlayWindow.hide()
    } else {
      this.overlayWindow.show()
    }
  }

  setOverlayClickThrough(enabled: boolean): void {
    if (!this.overlayWindow) return
    this.overlayWindow.setIgnoreMouseEvents(enabled, { forward: true })
  }

  setOverlayOpacity(opacity: number): void {
    if (!this.overlayWindow) return
    this.overlayWindow.setOpacity(Math.max(0.1, Math.min(1, opacity)))
  }

  sendToMain(channel: string, ...args: unknown[]): void {
    this.mainWindow?.webContents.send(channel, ...args)
  }

  sendToOverlay(channel: string, ...args: unknown[]): void {
    this.overlayWindow?.webContents.send(channel, ...args)
  }

  sendToAll(channel: string, ...args: unknown[]): void {
    this.sendToMain(channel, ...args)
    this.sendToOverlay(channel, ...args)
  }
}

export const windowManager = new WindowManager()
