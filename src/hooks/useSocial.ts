import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSocialFeed,
  toggleWorkoutPublic,
  getPublicProfile,
} from '@/services/socialService'
import type { PublicProfile, PaginatedFeed } from '@/types/community'
import { FEED_STALE_TIME, FEED_PAGE_SIZE } from '@/config/communityConfig'

export function useSocialFeed(limit = FEED_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: ['social-feed', limit],
    queryFn: ({ pageParam }) => getSocialFeed(limit, pageParam),
    getNextPageParam: (lastPage: PaginatedFeed) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
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
