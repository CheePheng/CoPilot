import { dialog, desktopCapturer } from 'electron'
import { readFileSync, statSync } from 'fs'
import { extname } from 'path'

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

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
    const fileSize = statSync(filePath).size
    if (fileSize > MAX_IMAGE_SIZE_BYTES) {
      throw new Error(`Image file exceeds the 10MB size limit (file is ${(fileSize / 1024 / 1024).toFixed(1)}MB)`)
    }

    const ext = extname(filePath).toLowerCase()
    const mimeType = MIME_MAP[ext] || 'image/png'
    const buffer = readFileSync(filePath)
    const base64 = buffer.toString('base64')

    return { base64, mimeType }
  }

  async captureScreen(): Promise<ImageData | string | null> {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
      })

      if (sources.length === 0) return 'Screen capture failed: no screen sources available'

      const source = sources[0]
      const thumbnail = source.thumbnail

      if (thumbnail.isEmpty()) return 'Screen capture failed: thumbnail was empty'

      const base64 = thumbnail.toPNG().toString('base64')
      return { base64, mimeType: 'image/png' }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('captureScreen failed:', message)
      return `Screen capture failed: ${message}`
    }
  }
}

export const screenshotService = new ScreenshotService()
