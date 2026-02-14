import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserBadges, checkAndAwardBadges } from '@/services/badgeService'
import { useAuthStore } from '@/stores/authStore'

export function useUserBadges(userId: string | null) {
  return useQuery({
    queryKey: ['user-badges', userId],
    queryFn: () => getUserBadges(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useMyBadges() {
  const user = useAuthStore(s => s.user)
  return useUserBadges(user?.id ?? null)
}

export function useCheckBadges() {
  const queryClient = useQueryClient()
  const user = useAuthStore(s => s.user)

  return useMutation({
    mutationFn: () => {
      if (!user) return Promise.resolve([])
      return checkAndAwardBadges(user.id)
    },
    onSuccess: (awarded) => {
      if (awarded.length > 0 && user) {
        queryClient.invalidateQueries({ queryKey: ['user-badges', user.id] })
      }
    },
  })
}
