import { dialog, desktopCapturer } from 'electron'
import { readFileSync } from 'fs'
import { extname } from 'path'

export interface ImageData {
  base64: string
  mimeType: string
}

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp'
}

class ScreenshotService {
  async pickImageFile(): Promise<ImageData | null> {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'] }
      ]
    })

    if (result.canceled || result.filePaths.length === 0) return null

    const filePath = result.filePaths[0]
    const ext = extname(filePath).toLowerCase()
    const mimeType = MIME_MAP[ext] || 'image/png'
    const buffer = readFileSync(filePath)
    const base64 = buffer.toString('base64')

    return { base64, mimeType }
  }

  async captureScreen(): Promise<ImageData | null> {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
      })

      if (sources.length === 0) return null

      const source = sources[0]
      const thumbnail = source.thumbnail

      if (thumbnail.isEmpty()) return null

      const base64 = thumbnail.toPNG().toString('base64')
      return { base64, mimeType: 'image/png' }
    } catch {
      return null
    }
  }
}

export const screenshotService = new ScreenshotService()
