import { useCallback } from 'react'
import { useToastStore, type ToastType } from '@/stores/toastStore'

export function useToast() {
  const addToast = useToastStore((state) => state.addToast)
  const removeToast = useToastStore((state) => state.removeToast)
  const clearToasts = useToastStore((state) => state.clearToasts)

  const toast = useCallback(
    (message: string, type: ToastType = 'info', duration?: number) => {
      return addToast({ message, type, duration })
    },
    [addToast]
  )

  const success = useCallback(
    (message: string, duration?: number) => {
      return addToast({ message, type: 'success', duration })
    },
    [addToast]
  )

  const error = useCallback(
    (message: string, duration?: number) => {
      return addToast({ message, type: 'error', duration })
    },
    [addToast]
  )

  const warning = useCallback(
    (message: string, duration?: number) => {
      return addToast({ message, type: 'warning', duration })
    },
    [addToast]
  )

  const info = useCallback(
    (message: string, duration?: number) => {
      return addToast({ message, type: 'info', duration })
    },
    [addToast]
  )

  return {
    toast,
    success,
    error,
    warning,
    info,
    remove: removeToast,
    clear: clearToasts
  }
}
