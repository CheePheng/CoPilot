import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

class StorageService {
  private filePath: string
  private data: Record<string, unknown> = {}

  constructor() {
    this.filePath = join(app.getPath('userData'), 'copilot-data.json')
    this.load()
  }

  private load(): void {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8')
        this.data = JSON.parse(raw) as Record<string, unknown>
      }
    } catch {
      this.data = {}
    }
  }

  private save(): void {
    try {
      writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch {
      // Silent fail — data directory may not exist yet on first run
    }
  }

  get(key: string): unknown {
    return this.data[key]
  }

  set(key: string, value: unknown): void {
    this.data[key] = value
    this.save()
  }

  getAll(): Record<string, unknown> {
    return { ...this.data }
  }

  setAll(data: Record<string, unknown>): void {
    this.data = { ...this.data, ...data }
    this.save()
  }

  remove(key: string): void {
    delete this.data[key]
    this.save()
  }
}

export const storageService = new StorageService()
