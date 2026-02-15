import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getActiveChallenges,
  joinChallenge,
  refreshChallengeProgress,
  getChallengeLeaderboard,
} from '@/services/challengeService'
import { useAuthStore } from '@/stores/authStore'

export function useActiveChallenges() {
  const user = useAuthStore(s => s.user)

  return useQuery({
    queryKey: ['challenges', 'active', user?.id],
    queryFn: () => getActiveChallenges(user?.id),
    staleTime: 2 * 60 * 1000,
  })
}

export function useJoinChallenge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: joinChallenge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] })
    },
  })
}

export function useRefreshChallengeProgress() {
  const queryClient = useQueryClient()
  const user = useAuthStore(s => s.user)

  return useMutation({
    mutationFn: () => {
      if (!user) return Promise.resolve()
      return refreshChallengeProgress(user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] })
    },
  })
}

export function useChallengeLeaderboard(challengeId: string | null, limit = 10) {
  return useQuery({
    queryKey: ['challenge-leaderboard', challengeId, limit],
    queryFn: () => getChallengeLeaderboard(challengeId!, limit),
    enabled: !!challengeId,
    staleTime: 60 * 1000,
  })
}
