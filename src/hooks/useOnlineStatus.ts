import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  return true
}

/**
 * React hook for tracking network connectivity.
 * Uses useSyncExternalStore for tear-free reads of browser online state.
 */
export function useOnlineStatus() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return { isOnline }
}

/** Standalone getter for non-React contexts (e.g. sync engine). */
export function getIsOnline(): boolean {
  return navigator.onLine
}
