import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSocialFeed,
  toggleWorkoutPublic,
  getPublicProfile,
} from '@/services/socialService'
import type { FeedWorkout, PublicProfile } from '@/types/community'
import { FEED_STALE_TIME } from '@/config/communityConfig'

export function useSocialFeed(limit = 20) {
  return useQuery<FeedWorkout[]>({
    queryKey: ['social-feed', limit],
    queryFn: () => getSocialFeed(limit),
    staleTime: FEED_STALE_TIME,
  })
}

export function usePublicProfile(userId: string | null) {
  return useQuery<PublicProfile | null>({
    queryKey: ['public-profile', userId],
    queryFn: () => (userId ? getPublicProfile(userId) : null),
    enabled: !!userId,
    staleTime: FEED_STALE_TIME,
  })
}

export function useToggleWorkoutPublic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, isWeightsSession, isPublic }: { sessionId: string; isWeightsSession: boolean; isPublic: boolean }) =>
      toggleWorkoutPublic(sessionId, isWeightsSession, isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] })
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['user-template-workouts'] })
    },
  })
}
