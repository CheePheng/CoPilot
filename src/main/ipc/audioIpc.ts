import { ipcMain } from 'electron'
import { audioCaptureService } from '../services/audioCapture'

export function registerAudioIpc(): void {
  ipcMain.on('audio:chunk', (_event, chunk: Buffer) => {
    audioCaptureService.handleAudioChunk(Buffer.from(chunk))
  })

  ipcMain.handle('audio:sources', async () => {
    return audioCaptureService.getAvailableSources()
  })
}
