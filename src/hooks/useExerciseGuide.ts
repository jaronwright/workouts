import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getExerciseGuide,
  getCachedExercise,
  getUsageStats,
  type ExerciseGuideResult,
} from '@/services/exerciseGuideService'

/**
 * Check if an exercise is already cached in Supabase.
 * Returns instantly — no edge function or API calls.
 * Used to decide whether to show guide content immediately or a "View Guide" button.
 */
export function useCachedExercise(exerciseName: string | undefined) {
  return useQuery({
    queryKey: ['exercise-cache', exerciseName?.toLowerCase()],
    queryFn: () => getCachedExercise(exerciseName!),
    enabled: !!exerciseName,
    staleTime: 1000 * 60 * 60 * 24 * 7, // 7 days — cached data doesn't change
    gcTime: 1000 * 60 * 60 * 24 * 30, // 30 days
  })
}

/**
 * Fetch exercise guide on demand (user taps "View Exercise Guide").
 * Uses a mutation because this is an explicit user action, not an auto-fetch.
 * The mutation checks cache first, then calls the edge function if needed.
 */
export function useFetchExerciseGuide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (exerciseName: string): Promise<ExerciseGuideResult> =>
      getExerciseGuide(exerciseName),
    onSuccess: (result, exerciseName) => {
      if (result.exercise) {
        // Update the cache query so subsequent opens are instant
        queryClient.setQueryData(
          ['exercise-cache', exerciseName.toLowerCase()],
          result.exercise
        )
      }
      // Invalidate usage stats since we may have made an API call
      queryClient.invalidateQueries({ queryKey: ['exercisedb-usage'] })
    },
  })
}

/**
 * Fetch ExerciseDB API usage stats for the settings screen.
 */
export function useExerciseUsageStats() {
  return useQuery({
    queryKey: ['exercisedb-usage'],
    queryFn: getUsageStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
