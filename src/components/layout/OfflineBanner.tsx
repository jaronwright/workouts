import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useOfflineStore } from '@/stores/offlineStore'

export function OfflineBanner() {
  const { isOnline } = useOnlineStatus()
  const pendingCount = useOfflineStore((s) =>
    s.queue.filter((m) => m.status === 'pending' || m.status === 'syncing').length
  )
  const [showReconnected, setShowReconnected] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true)
      setShowReconnected(false)
    } else if (wasOffline) {
      setShowReconnected(true)
      const timer = setTimeout(() => {
        setShowReconnected(false)
        setWasOffline(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  if (isOnline && !showReconnected) return null

  if (showReconnected) {
    return (
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Wifi className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            Back online
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
      <div className="max-w-4xl mx-auto flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <p className="flex-1 text-sm text-amber-700 dark:text-amber-300 font-medium">
          You're offline — changes saved locally
          {pendingCount > 0 && (
            <span className="text-amber-600 dark:text-amber-400 font-normal">
              {' '}({pendingCount} pending)
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
