import { useQuery } from '@tanstack/react-query'
import { searchExerciseByName, type ExerciseDbExercise } from '@/services/exerciseDbService'

interface UseExerciseInfoResult {
  exercise: ExerciseDbExercise | null
  gifUrl: string | null
  instructions: string[]
  isLoading: boolean
  error: Error | null
}

export function useExerciseInfo(exerciseName: string | undefined): UseExerciseInfoResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['exercise-info', exerciseName],
    queryFn: () => searchExerciseByName(exerciseName!),
    enabled: !!exerciseName,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days - exercises don't change
    gcTime: 30 * 24 * 60 * 60 * 1000, // Keep in cache for 30 days
    retry: 2,
    retryDelay: 1000
  })

  return {
    exercise: data ?? null,
    gifUrl: data?.gifUrl ?? null,
    instructions: data?.instructions ?? [],
    isLoading,
    error: error as Error | null
  }
}
