import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'

const SCHEMA_VERSION = 1

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
        const parsed = JSON.parse(raw) as Record<string, unknown>
        this.data = parsed
      }
    } catch {
      // Corrupted file — try backup
      const backupPath = this.filePath + '.bak'
      try {
        if (existsSync(backupPath)) {
          const raw = readFileSync(backupPath, 'utf-8')
          this.data = JSON.parse(raw) as Record<string, unknown>
        }
      } catch {
        this.data = {}
      }
    }

    // Ensure schema version
    if (!this.data._schemaVersion) {
      this.data._schemaVersion = SCHEMA_VERSION
    }
  }

  private save(): void {
    try {
      // Ensure directory exists
      const dir = dirname(this.filePath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }

      // Atomic write: write to temp file then rename
      const tmpPath = this.filePath + '.tmp'
      writeFileSync(tmpPath, JSON.stringify(this.data, null, 2), 'utf-8')

      // Create backup of current file before replacing
      if (existsSync(this.filePath)) {
        try {
          const backupPath = this.filePath + '.bak'
          writeFileSync(backupPath, readFileSync(this.filePath))
        } catch {
          // Backup failure is non-critical
        }
      }

      // Atomic rename
      renameSync(tmpPath, this.filePath)
    } catch (error) {
      console.error('StorageService: Failed to save data', error)
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
