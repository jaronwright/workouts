import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { addReaction, removeReaction } from '@/services/reactionService'
import { createReactionNotification } from '@/services/notificationService'
import type { FeedWorkout, ReactionType, PaginatedFeed } from '@/types/community'
import { useAuthStore } from '@/stores/authStore'

// Helper: update a workout across all paginated feed queries
function updateFeedWorkout(
  old: InfiniteData<PaginatedFeed> | undefined,
  workoutId: string,
  updater: (workout: FeedWorkout) => FeedWorkout
): InfiniteData<PaginatedFeed> | undefined {
  if (!old) return old
  return {
    ...old,
    pages: old.pages.map(page => ({
      ...page,
      items: page.items.map(w => w.id === workoutId ? updater(w) : w),
    })),
  }
}

export function useAddReaction() {
  const queryClient = useQueryClient()
  const user = useAuthStore(s => s.user)

  return useMutation({
    mutationFn: async ({
      workout,
      reactionType,
    }: {
      workout: FeedWorkout
      reactionType: ReactionType
    }) => {
      if (!user) throw new Error('Not authenticated')

      const isWeights = workout.type === 'weights'
      const result = await addReaction(user.id, {
        sessionId: isWeights ? workout.id : undefined,
        templateSessionId: !isWeights ? workout.id : undefined,
        reactionType,
      })

      // Create notification for workout owner
      await createReactionNotification(
        user.id,
        workout.user_id,
        result.id,
        isWeights ? workout.id : undefined,
        !isWeights ? workout.id : undefined,
      )

      return result
    },
    // Optimistic update: update all social feed queries matching the prefix
    onMutate: async ({ workout, reactionType }) => {
      await queryClient.cancelQueries({ queryKey: ['social-feed'] })
      const previousQueries = queryClient.getQueriesData<InfiniteData<PaginatedFeed>>({ queryKey: ['social-feed'] })

      if (user) {
        queryClient.setQueriesData<InfiniteData<PaginatedFeed>>(
          { queryKey: ['social-feed'] },
          (old) => updateFeedWorkout(old, workout.id, w => ({
            ...w,
            reactions: [
              ...w.reactions.filter(r => r.user_id !== user.id),
              {
                id: 'optimistic',
                user_id: user.id,
                reaction_type: reactionType,
                created_at: new Date().toISOString(),
                user_profile: null,
              },
            ],
          }))
        )
      }

      return { previousQueries }
    },
    onError: (_err, _vars, context) => {
      // Restore all feed queries on error
      context?.previousQueries?.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] })
    },
  })
}

export function useRemoveReaction() {
  const queryClient = useQueryClient()
  const user = useAuthStore(s => s.user)

  return useMutation({
    mutationFn: async ({ workout }: { workout: FeedWorkout }) => {
      if (!user) throw new Error('Not authenticated')

      const isWeights = workout.type === 'weights'
      await removeReaction(
        user.id,
        isWeights ? workout.id : undefined,
        !isWeights ? workout.id : undefined,
      )
    },
    onMutate: async ({ workout }) => {
      await queryClient.cancelQueries({ queryKey: ['social-feed'] })
      const previousQueries = queryClient.getQueriesData<InfiniteData<PaginatedFeed>>({ queryKey: ['social-feed'] })

      if (user) {
        queryClient.setQueriesData<InfiniteData<PaginatedFeed>>(
          { queryKey: ['social-feed'] },
          (old) => updateFeedWorkout(old, workout.id, w => ({
            ...w,
            reactions: w.reactions.filter(r => r.user_id !== user.id),
          }))
        )
      }

      return { previousQueries }
    },
    onError: (_err, _vars, context) => {
      context?.previousQueries?.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] })
    },
  })
}
