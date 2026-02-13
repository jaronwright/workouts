import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  getUnreadCount,
  markNotificationsRead,
} from '@/services/notificationService'
import type { CommunityNotification } from '@/types/community'
import { useAuthStore } from '@/stores/authStore'

export function useCommunityNotifications(limit = 50) {
  const user = useAuthStore(s => s.user)

  return useQuery<CommunityNotification[]>({
    queryKey: ['community-notifications', user?.id, limit],
    queryFn: () => (user ? getNotifications(user.id, limit) : []),
    enabled: !!user,
    staleTime: 30 * 1000,
  })
}

export function useUnreadNotificationCount() {
  const user = useAuthStore(s => s.user)

  return useQuery<number>({
    queryKey: ['notification-unread-count', user?.id],
    queryFn: () => (user ? getUnreadCount(user.id) : 0),
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Poll every 60 seconds
  })
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient()
  const user = useAuthStore(s => s.user)

  return useMutation({
    mutationFn: () => {
      if (!user) throw new Error('Not authenticated')
      return markNotificationsRead(user.id)
    },
    onSuccess: () => {
      queryClient.setQueryData(['notification-unread-count', user?.id], 0)
      queryClient.invalidateQueries({ queryKey: ['community-notifications'] })
    },
  })
}
