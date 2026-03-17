import { Tray, Menu, nativeImage, app } from 'electron'
import { windowManager } from './windows/windowManager'

let tray: Tray | null = null

export function setupTray(): void {
  // Create a simple 16x16 tray icon
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)
  tray.setToolTip('CoPilot - AI Interview Assistant')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Main Window',
      click: () => {
        const mainWindow = windowManager.getMainWindow()
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: 'Toggle Overlay',
      accelerator: 'CmdOrCtrl+Shift+O',
      click: () => {
        windowManager.toggleOverlay()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    const mainWindow = windowManager.getMainWindow()
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}
