import { create } from 'zustand'

export interface Toast {
  id: string
  type: 'error' | 'success' | 'info'
  message: string
  duration: number
}

interface ToastState {
  toasts: Toast[]
  addToast: (type: Toast['type'], message: string, duration?: number) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (type, message, duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration }]
    }))
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }))
      }, duration)
    }
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  }
}))
