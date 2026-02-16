import { useState } from 'react'
import { Bell, BellSlash } from '@phosphor-icons/react'
import { Card, CardContent, Button } from '@/components/ui'
import {
  usePushSupported,
  usePushSubscriptions,
  useSubscribePush,
  useUnsubscribePush,
  useNotificationPreferences,
  useUpdateNotificationPreferences
} from '@/hooks/useNotifications'
import { useToast } from '@/hooks/useToast'

export function NotificationSettings() {
  const pushSupported = usePushSupported()
  const { data: subscriptions } = usePushSubscriptions()
  const { data: preferences } = useNotificationPreferences()
  const subscribe = useSubscribePush()
  const unsubscribe = useUnsubscribePush()
  const updatePrefs = useUpdateNotificationPreferences()
  const toast = useToast()
  const [permissionDenied, setPermissionDenied] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'denied'
  )

  const isSubscribed = (subscriptions?.length ?? 0) > 0

  const handleToggle = async () => {
    if (isSubscribed) {
      unsubscribe.mutate(undefined, {
        onSuccess: () => toast.success('Notifications disabled'),
        onError: () => toast.error('Failed to disable notifications')
      })
    } else {
      // Check permission first
      if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
        setPermissionDenied(true)
        toast.error('Notification permission was denied. Please enable it in your browser settings.')
        return
      }

      subscribe.mutate(undefined, {
        onSuccess: () => toast.success('Notifications enabled'),
        onError: (err) => {
          if (err instanceof Error && err.message.includes('not supported')) {
            toast.error('Push notifications are not supported on this device')
          } else {
            toast.error('Failed to enable notifications')
          }
        }
      })
    }
  }

  if (!pushSupported) return null

  return (
    <Card>
      <CardContent className="py-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--color-primary-muted)] rounded-full flex items-center justify-center">
            {isSubscribed ? (
              <Bell className="w-5 h-5 text-[var(--color-primary)]" />
            ) : (
              <BellSlash className="w-5 h-5 text-[var(--color-primary)]" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--color-text)]">Notifications</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              {isSubscribed ? 'Push notifications are enabled' : 'Enable push notifications'}
            </p>
          </div>
          <Button
            size="sm"
            variant={isSubscribed ? 'secondary' : 'primary'}
            onClick={handleToggle}
            loading={subscribe.isPending || unsubscribe.isPending}
          >
            {isSubscribed ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {permissionDenied && (
          <p className="text-xs text-[var(--color-danger)]">
            Permission denied. Go to your browser settings to allow notifications for this site.
          </p>
        )}

        {isSubscribed && preferences !== undefined && (
          <div className="space-y-3 pt-3 border-t border-[var(--color-border)]">
            <label className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text)]">Workout reminders</span>
              <input
                type="checkbox"
                checked={preferences?.workout_reminders ?? true}
                onChange={(e) => updatePrefs.mutate({ workout_reminders: e.target.checked })}
                className="w-5 h-5 accent-[var(--color-primary)]"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text)]">PR celebrations</span>
              <input
                type="checkbox"
                checked={preferences?.pr_celebrations ?? true}
                onChange={(e) => updatePrefs.mutate({ pr_celebrations: e.target.checked })}
                className="w-5 h-5 accent-[var(--color-primary)]"
              />
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
