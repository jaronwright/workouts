import { useState, useEffect } from 'react'
import { WifiSlash, WifiHigh } from '@phosphor-icons/react'
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
      <div className="bg-[var(--color-success-muted)] border-b border-[var(--color-success)]/20 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <WifiHigh className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-success)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
            Back online
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--color-warning-muted)] border-b border-[var(--color-warning)]/20 px-4 py-2">
      <div className="max-w-4xl mx-auto flex items-center gap-2">
        <WifiSlash className="w-4 h-4 text-[var(--color-warning)] flex-shrink-0" />
        <p className="flex-1 text-sm text-[var(--color-warning)] font-medium">
          You're offline — changes saved locally
          {pendingCount > 0 && (
            <span className="text-[var(--color-warning)] opacity-80 font-normal">
              {' '}({pendingCount} pending)
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
