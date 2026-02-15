import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { searchExerciseByName } from '@/services/exerciseDbService'

/**
 * Prefetches exercise data for all exercises in a workout.
 * Called when a workout page loads to warm the cache so exercise
 * details and GIF thumbnails are ready when users need them.
 */
export function useExercisePrefetch(exerciseNames: string[]) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (exerciseNames.length === 0) return

    // Prefetch each exercise into the React Query cache.
    // The underlying service has its own serial queue + throttling,
    // so these won't overwhelm the API.
    for (const name of exerciseNames) {
      queryClient.prefetchQuery({
        queryKey: ['exercise-info', name],
        queryFn: () => searchExerciseByName(name),
        staleTime: 7 * 24 * 60 * 60 * 1000, // Match the hook's staleTime
      })
    }
  }, [exerciseNames, queryClient])
}
