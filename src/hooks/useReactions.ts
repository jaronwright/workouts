import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { addReaction, removeReaction } from '@/services/reactionService'
import { createReactionNotification } from '@/services/notificationService'
import { FEED_PAGE_SIZE } from '@/config/communityConfig'
import type { FeedWorkout, ReactionType, PaginatedFeed } from '@/types/community'
import { useAuthStore } from '@/stores/authStore'

// Helper: update a workout inside paginated infinite data
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
    // Optimistic update for infinite query data shape
    onMutate: async ({ workout, reactionType }) => {
      await queryClient.cancelQueries({ queryKey: ['social-feed'] })
      const previousFeed = queryClient.getQueryData<InfiniteData<PaginatedFeed>>(['social-feed', FEED_PAGE_SIZE])

      if (previousFeed && user) {
        queryClient.setQueryData<InfiniteData<PaginatedFeed>>(
          ['social-feed', FEED_PAGE_SIZE],
          old => updateFeedWorkout(old, workout.id, w => ({
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

      return { previousFeed }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['social-feed', FEED_PAGE_SIZE], context.previousFeed)
      }
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
      const previousFeed = queryClient.getQueryData<InfiniteData<PaginatedFeed>>(['social-feed', FEED_PAGE_SIZE])

      if (previousFeed && user) {
        queryClient.setQueryData<InfiniteData<PaginatedFeed>>(
          ['social-feed', FEED_PAGE_SIZE],
          old => updateFeedWorkout(old, workout.id, w => ({
            ...w,
            reactions: w.reactions.filter(r => r.user_id !== user.id),
          }))
        )
      }

      return { previousFeed }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['social-feed', FEED_PAGE_SIZE], context.previousFeed)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] })
    },
  })
}
