import { contextBridge, ipcRenderer } from 'electron'

const overlayApi = {
  overlay: {
    mouseEnter: () => ipcRenderer.send('overlay:mouse-enter'),
    mouseLeave: () => ipcRenderer.send('overlay:mouse-leave'),
    toggle: () => ipcRenderer.invoke('overlay:toggle'),
    setOpacity: (opacity: number) => ipcRenderer.invoke('overlay:set-opacity', opacity)
  },
  ai: {
    onStreamChunk: (callback: (data: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data)
      ipcRenderer.on('ai:stream-chunk', handler)
      return () => ipcRenderer.removeListener('ai:stream-chunk', handler)
    },
    onAnswerComplete: (callback: (data: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data)
      ipcRenderer.on('ai:answer-complete', handler)
      return () => ipcRenderer.removeListener('ai:answer-complete', handler)
    }
  },
  transcript: {
    onUpdate: (callback: (data: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data)
      ipcRenderer.on('transcript:update', handler)
      return () => ipcRenderer.removeListener('transcript:update', handler)
    },
    onFinal: (callback: (data: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data)
      ipcRenderer.on('transcript:final', handler)
      return () => ipcRenderer.removeListener('transcript:final', handler)
    }
  },
  session: {
    onStatusChange: (callback: (status: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, status: string) => callback(status)
      ipcRenderer.on('session:status', handler)
      return () => ipcRenderer.removeListener('session:status', handler)
    }
  }
}

contextBridge.exposeInMainWorld('copilot', overlayApi)

export type OverlayAPI = typeof overlayApi
