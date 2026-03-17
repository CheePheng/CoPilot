import { create } from 'zustand'
import type { TranscriptEntry } from '../types/ipc'

interface TranscriptState {
  entries: TranscriptEntry[]
  addOrUpdateEntry: (entry: TranscriptEntry) => void
  finalizeEntry: (entry: TranscriptEntry) => void
  clear: () => void
}

export const useTranscriptStore = create<TranscriptState>((set) => ({
  entries: [],

  addOrUpdateEntry: (entry) =>
    set((state) => {
      // For interim results, update the last matching speaker entry
      if (!entry.isFinal) {
        const lastIndex = state.entries.findLastIndex(
          (e) => !e.isFinal && e.speaker === entry.speaker
        )
        if (lastIndex >= 0) {
          const updated = [...state.entries]
          updated[lastIndex] = entry
          return { entries: updated }
        }
      }
      return { entries: [...state.entries, entry] }
    }),

  finalizeEntry: (entry) =>
    set((state) => {
      // Replace the last interim entry with the final one
      const lastInterimIndex = state.entries.findLastIndex((e) => !e.isFinal)
      if (lastInterimIndex >= 0) {
        const updated = [...state.entries]
        updated[lastInterimIndex] = { ...entry, isFinal: true }
        return { entries: updated }
      }
      return { entries: [...state.entries, { ...entry, isFinal: true }] }
    }),

  clear: () => set({ entries: [] })
}))
