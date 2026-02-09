import { useEffect, useRef } from 'react'

/**
 * Keeps the screen awake while `enabled` is true.
 * Re-acquires the lock when the tab becomes visible again
 * (browsers release wake locks when a tab is hidden).
 */
export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return

    let cancelled = false

    const acquire = async () => {
      try {
        if (!cancelled && document.visibilityState === 'visible') {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch {
        // Wake lock request can fail (e.g. low battery)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !cancelled) {
        acquire()
      }
    }

    acquire()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      wakeLockRef.current?.release()
      wakeLockRef.current = null
    }
  }, [enabled])
}
