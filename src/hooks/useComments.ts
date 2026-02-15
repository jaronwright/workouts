import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addComment,
  deleteComment,
  getCommentsForSession,
} from '@/services/commentService'
import { createCommentNotification } from '@/services/notificationService'
import { useAuthStore } from '@/stores/authStore'
import type { ActivityComment } from '@/types/community'

export function useComments(sessionId?: string, templateSessionId?: string) {
  return useQuery<ActivityComment[]>({
    queryKey: ['comments', sessionId ?? null, templateSessionId ?? null],
    queryFn: () => getCommentsForSession(sessionId, templateSessionId),
    enabled: !!(sessionId || templateSessionId),
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()
  const user = useAuthStore(s => s.user)

  return useMutation({
    mutationFn: async ({
      content,
      sessionId,
      templateSessionId,
      workoutOwnerId,
    }: {
      content: string
      sessionId?: string
      templateSessionId?: string
      workoutOwnerId: string
    }) => {
      const comment = await addComment(content, sessionId, templateSessionId)
      // Send notification to workout owner
      if (user && workoutOwnerId !== user.id) {
        await createCommentNotification(user.id, workoutOwnerId, sessionId, templateSessionId)
      }
      return comment
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.sessionId ?? null, variables.templateSessionId ?? null],
      })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      commentId,
    }: {
      commentId: string
      sessionId?: string
      templateSessionId?: string
    }) => deleteComment(commentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.sessionId ?? null, variables.templateSessionId ?? null],
      })
    },
  })
}
