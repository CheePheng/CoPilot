import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

export function createOverlayWindow(): BrowserWindow {
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize

  const overlayWindow = new BrowserWindow({
    width: 420,
    height: 500,
    x: screenWidth - 440,
    y: 80,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    hasShadow: false,
    focusable: true,
    title: 'CoPilot Overlay',
    webPreferences: {
      preload: join(__dirname, '../preload/overlay.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  // Click-through when not hovering interactive elements
  overlayWindow.setIgnoreMouseEvents(true, { forward: true })

  overlayWindow.on('ready-to-show', () => {
    overlayWindow.show()
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    overlayWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/overlay.html`)
  } else {
    overlayWindow.loadFile(join(__dirname, '../renderer/overlay.html'))
  }

  return overlayWindow
}
