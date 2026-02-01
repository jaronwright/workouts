import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSocialFeed,
  toggleWorkoutPublic,
  type SocialWorkout
} from '@/services/socialService'

export function useSocialFeed(limit = 20) {
  return useQuery<SocialWorkout[]>({
    queryKey: ['social-feed', limit],
    queryFn: () => getSocialFeed(limit),
    staleTime: 1000 * 60 * 2 // 2 minutes
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
    }
  })
}
