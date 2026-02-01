import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  getProgressionSuggestion,
  type ProgressionSuggestion
} from '@/services/progressionService'

export function useProgressionSuggestion(
  exerciseId: string | undefined,
  exerciseName: string,
  targetReps: number | null
) {
  const user = useAuthStore((s) => s.user)

  return useQuery<ProgressionSuggestion | null>({
    queryKey: ['progression-suggestion', user?.id, exerciseId],
    queryFn: () => getProgressionSuggestion(user!.id, exerciseId!, exerciseName, targetReps!),
    enabled: !!user?.id && !!exerciseId && !!targetReps
  })
}
