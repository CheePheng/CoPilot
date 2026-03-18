import { contextBridge, ipcRenderer } from 'electron'

const api = {
  overlay: {
    toggle: () => ipcRenderer.invoke('overlay:toggle'),
    setOpacity: (opacity: number) => ipcRenderer.invoke('overlay:set-opacity', opacity),
    setClickThrough: (enabled: boolean) =>
      ipcRenderer.invoke('overlay:set-click-through', enabled)
  },
  session: {
    start: () => ipcRenderer.invoke('session:start'),
    stop: () => ipcRenderer.invoke('session:stop'),
    pause: () => ipcRenderer.invoke('session:pause'),
    resume: () => ipcRenderer.invoke('session:resume'),
    getState: () => ipcRenderer.invoke('session:state'),
    onStatusChange: (callback: (status: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, status: string) => callback(status)
      ipcRenderer.on('session:status', handler)
      return () => ipcRenderer.removeListener('session:status', handler)
    }
  },
  audio: {
    sendChunk: (chunk: ArrayBuffer) => ipcRenderer.send('audio:chunk', Buffer.from(chunk)),
    getSources: () => ipcRenderer.invoke('audio:sources'),
    onTranscriptUpdate: (callback: (data: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data)
      ipcRenderer.on('transcript:update', handler)
      return () => ipcRenderer.removeListener('transcript:update', handler)
    },
    onTranscriptFinal: (callback: (data: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data)
      ipcRenderer.on('transcript:final', handler)
      return () => ipcRenderer.removeListener('transcript:final', handler)
    }
  },
  ai: {
    setProvider: (provider: string) => ipcRenderer.invoke('ai:set-provider', provider),
    setApiKey: (key: string) => ipcRenderer.invoke('ai:set-api-key', key),
    setModel: (model: string) => ipcRenderer.invoke('ai:set-model', model),
    isConfigured: () => ipcRenderer.invoke('ai:is-configured'),
    getProviders: () => ipcRenderer.invoke('ai:get-providers'),
    cancel: () => ipcRenderer.invoke('ai:cancel'),
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
  stt: {
    setProvider: (provider: string) => ipcRenderer.invoke('stt:set-provider', provider),
    setApiKey: (key: string) => ipcRenderer.invoke('stt:set-api-key', key),
    sendWebSpeechResult: (result: unknown) =>
      ipcRenderer.send('stt:web-speech-result', result),
    sendWebSpeechStatus: (status: string) =>
      ipcRenderer.send('stt:web-speech-status', status)
  },
  ollama: {
    setUrl: (url: string) => ipcRenderer.invoke('ollama:set-url', url),
    listModels: () => ipcRenderer.invoke('ollama:list-models'),
    checkConnection: () => ipcRenderer.invoke('ollama:check-connection')
  },
  ghost: {
    toggle: () => ipcRenderer.invoke('ghost:toggle'),
    getStatus: () => ipcRenderer.invoke('ghost:get-status'),
    set: (enabled: boolean) => ipcRenderer.invoke('ghost:set', enabled),
    onStatusChange: (callback: (enabled: boolean) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, enabled: boolean) => callback(enabled)
      ipcRenderer.on('ghost:status', handler)
      return () => ipcRenderer.removeListener('ghost:status', handler)
    }
  },
  storage: {
    get: (key: string) => ipcRenderer.invoke('storage:get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('storage:set', key, value),
    getAll: () => ipcRenderer.invoke('storage:get-all')
  },
  profile: {
    sync: (profile: unknown) => ipcRenderer.invoke('profile:sync', profile)
  },
  coding: {
    generate: (request: unknown) => ipcRenderer.invoke('coding:generate', request),
    cancel: () => ipcRenderer.invoke('coding:cancel'),
    onStreamChunk: (callback: (data: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data)
      ipcRenderer.on('coding:stream-chunk', handler)
      return () => ipcRenderer.removeListener('coding:stream-chunk', handler)
    },
    onComplete: (callback: (data: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data)
      ipcRenderer.on('coding:complete', handler)
      return () => ipcRenderer.removeListener('coding:complete', handler)
    },
    onError: (callback: (error: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, error: string) => callback(error)
      ipcRenderer.on('coding:error', handler)
      return () => ipcRenderer.removeListener('coding:error', handler)
    },
    pickImage: () => ipcRenderer.invoke('coding:pick-image'),
    captureScreen: () => ipcRenderer.invoke('coding:capture-screen'),
    generateFromImage: (request: unknown) => ipcRenderer.invoke('coding:generate-from-image', request),
  },
  history: {
    get: () => ipcRenderer.invoke('history:get'),
    delete: (id: string) => ipcRenderer.invoke('history:delete', id),
    clear: () => ipcRenderer.invoke('history:clear')
  },
  mock: {
    generateQuestion: (config: unknown) => ipcRenderer.invoke('mock:generate-question', config),
    evaluate: (data: unknown) => ipcRenderer.invoke('mock:evaluate', data),
    cancel: () => ipcRenderer.invoke('mock:cancel'),
    onQuestionChunk: (callback: (data: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data)
      ipcRenderer.on('mock:question-chunk', handler)
      return () => ipcRenderer.removeListener('mock:question-chunk', handler)
    },
    onQuestionReady: (callback: (data: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data)
      ipcRenderer.on('mock:question-ready', handler)
      return () => ipcRenderer.removeListener('mock:question-ready', handler)
    },
    onEvalChunk: (callback: (data: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data)
      ipcRenderer.on('mock:eval-chunk', handler)
      return () => ipcRenderer.removeListener('mock:eval-chunk', handler)
    },
    onEvalComplete: (callback: (data: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data)
      ipcRenderer.on('mock:eval-complete', handler)
      return () => ipcRenderer.removeListener('mock:eval-complete', handler)
    },
    onError: (callback: (error: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, error: string) => callback(error)
      ipcRenderer.on('mock:error', handler)
      return () => ipcRenderer.removeListener('mock:error', handler)
    }
  },
}

contextBridge.exposeInMainWorld('copilot', api)

export type CopilotAPI = typeof api
