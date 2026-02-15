import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useOnlineStatus } from './useOnlineStatus'
import { useOfflineStore } from '@/stores/offlineStore'
import { useToastStore } from '@/stores/toastStore'
import { processQueue } from '@/services/syncService'

/**
 * Hook that triggers offline queue processing when connectivity returns.
 * Watches online status + queue length; syncs when both conditions are met.
 */
export function useSyncEngine() {
  const { isOnline } = useOnlineStatus()
  const queue = useOfflineStore((s) => s.queue)
  const isSyncing = useOfflineStore((s) => s.isSyncing)
  const queryClient = useQueryClient()
  const wasOfflineRef = useRef(false)

  const pendingCount = queue.filter(
    (m) => m.status === 'pending' || m.status === 'syncing'
  ).length

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true
      return
    }

    // Only sync if we have pending items and aren't already syncing
    if (pendingCount === 0 || isSyncing) return

    let cancelled = false

    async function sync() {
      // Small delay to let connection stabilize
      await new Promise((r) => setTimeout(r, 1000))
      if (cancelled) return

      const result = await processQueue()
      if (cancelled) return

      // Invalidate all relevant caches after sync
      if (result.synced > 0) {
        queryClient.invalidateQueries({ queryKey: ['active-session'] })
        queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
        queryClient.invalidateQueries({ queryKey: ['session-sets'] })
        queryClient.invalidateQueries({ queryKey: ['exercise-history'] })
        queryClient.invalidateQueries({ queryKey: ['profile'] })
        queryClient.invalidateQueries({ queryKey: ['todays-workout'] })
        queryClient.invalidateQueries({ queryKey: ['active-template-workout'] })
        queryClient.invalidateQueries({ queryKey: ['user-template-workouts'] })
      }

      // Show toast
      if (result.synced > 0 && result.failed === 0) {
        useToastStore.getState().addToast({
          type: 'success',
          message: 'Workout data synced!',
        })
      } else if (result.failed > 0) {
        useToastStore.getState().addToast({
          type: 'warning',
          message: `${result.synced} synced, ${result.failed} couldn't sync`,
        })
      }

      wasOfflineRef.current = false
    }

    sync().catch((err) => {
      console.error('Sync engine error:', err)
    })

    return () => {
      cancelled = true
    }
  }, [isOnline, pendingCount, isSyncing, queryClient])
}
