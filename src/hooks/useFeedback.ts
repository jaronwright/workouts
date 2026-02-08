import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { submitFeedback, getUserFeedback } from '@/services/feedbackService'

export function useSubmitFeedback() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: ({ type, message }: { type: 'bug' | 'feature'; message: string }) =>
      submitFeedback(user!.id, type, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', user?.id] })
    },
  })
}

export function useUserFeedback() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['feedback', user?.id],
    queryFn: () => getUserFeedback(user!.id),
    enabled: !!user?.id,
  })
}
