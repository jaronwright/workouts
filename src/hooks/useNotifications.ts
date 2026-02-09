import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  saveSubscription,
  removeSubscription,
  getSubscriptions,
  getNotificationPreferences,
  upsertNotificationPreferences,
  type NotificationPreferences
} from '@/services/pushService'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function useNotificationPreferences() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: () => getNotificationPreferences(user!.id),
    enabled: !!user
  })
}

export function useUpdateNotificationPreferences() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      prefs: Partial<Pick<NotificationPreferences, 'workout_reminders' | 'reminder_time' | 'pr_celebrations' | 'rest_timer_alerts'>>
    ) => upsertNotificationPreferences(user!.id, prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
    }
  })
}

export function usePushSubscriptions() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['push-subscriptions', user?.id],
    queryFn: () => getSubscriptions(user!.id),
    enabled: !!user
  })
}

export function useSubscribePush() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')
      if (!VAPID_PUBLIC_KEY) throw new Error('VAPID key not configured')
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications not supported')
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      await saveSubscription(user.id, subscription)
      return subscription
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['push-subscriptions'] })
    }
  })
}

export function useUnsubscribePush() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!('serviceWorker' in navigator)) return

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await removeSubscription(subscription.endpoint)
        await subscription.unsubscribe()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['push-subscriptions'] })
    }
  })
}

export function usePushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    !!VAPID_PUBLIC_KEY
  )
}
