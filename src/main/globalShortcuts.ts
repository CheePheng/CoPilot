import { globalShortcut } from 'electron'
import { windowManager } from './windows/windowManager'

export function registerGlobalShortcuts(): void {
  // Toggle overlay visibility
  globalShortcut.register('CmdOrCtrl+Shift+O', () => {
    windowManager.toggleOverlay()
  })

  // Quick hide overlay (panic button)
  globalShortcut.register('CmdOrCtrl+Shift+H', () => {
    const overlay = windowManager.getOverlayWindow()
    if (overlay?.isVisible()) {
      overlay.hide()
    }
  })
}
