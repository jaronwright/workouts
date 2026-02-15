import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  fetchBodyPartList,
  fetchTargetMuscleList,
  fetchEquipmentList,
  fetchExercisesByBodyPart,
  fetchExercisesByMuscle,
  fetchExercisesByEquipment,
  searchExercises,
  fetchExerciseById,
  fetchAlternativeExercises,
  type ExerciseDbExercise,
  type ExerciseBrowseResult,
} from '@/services/exerciseDbService'

const LONG_STALE = 7 * 24 * 60 * 60 * 1000 // 7 days
const VERY_LONG_STALE = 30 * 24 * 60 * 60 * 1000 // 30 days

// --- Category lists ---

export function useBodyPartList() {
  return useQuery({
    queryKey: ['exercise-bodyparts'],
    queryFn: fetchBodyPartList,
    staleTime: VERY_LONG_STALE,
    gcTime: VERY_LONG_STALE,
  })
}

export function useTargetMuscleList() {
  return useQuery({
    queryKey: ['exercise-muscles'],
    queryFn: fetchTargetMuscleList,
    staleTime: VERY_LONG_STALE,
    gcTime: VERY_LONG_STALE,
  })
}

export function useEquipmentList() {
  return useQuery({
    queryKey: ['exercise-equipment'],
    queryFn: fetchEquipmentList,
    staleTime: VERY_LONG_STALE,
    gcTime: VERY_LONG_STALE,
  })
}

// --- Browse by category with pagination ---

type CategoryType = 'bodyPart' | 'muscle' | 'equipment'

function fetchByCategory(type: CategoryType, value: string, offset: number, limit: number): Promise<ExerciseBrowseResult> {
  switch (type) {
    case 'bodyPart':
      return fetchExercisesByBodyPart(value, offset, limit)
    case 'muscle':
      return fetchExercisesByMuscle(value, offset, limit)
    case 'equipment':
      return fetchExercisesByEquipment(value, offset, limit)
  }
}

export function useExerciseBrowse(type: CategoryType, value: string | undefined, pageSize = 20) {
  return useInfiniteQuery<ExerciseBrowseResult>({
    queryKey: ['exercise-browse', type, value, pageSize],
    queryFn: ({ pageParam }) => {
      const offset = (pageParam as number) * pageSize
      return fetchByCategory(type, value!, offset, pageSize)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.pagination.nextPage) {
        return (lastPageParam as number) + 1
      }
      return undefined
    },
    enabled: !!value,
    staleTime: LONG_STALE,
    gcTime: LONG_STALE,
  })
}

// --- Search ---

export function useExerciseSearch(query: string, pageSize = 20) {
  const trimmed = query.trim()
  return useInfiniteQuery<ExerciseBrowseResult>({
    queryKey: ['exercise-search', trimmed, pageSize],
    queryFn: ({ pageParam }) => {
      const offset = (pageParam as number) * pageSize
      return searchExercises(trimmed, offset, pageSize)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.pagination.nextPage) {
        return (lastPageParam as number) + 1
      }
      return undefined
    },
    enabled: trimmed.length >= 2,
    staleTime: LONG_STALE,
    gcTime: LONG_STALE,
  })
}

// --- Single exercise by ID ---

export function useExerciseDetail(exerciseId: string | undefined) {
  return useQuery({
    queryKey: ['exercise-detail', exerciseId],
    queryFn: () => fetchExerciseById(exerciseId!),
    enabled: !!exerciseId,
    staleTime: LONG_STALE,
    gcTime: VERY_LONG_STALE,
  })
}

// --- Alternatives ---

export function useExerciseAlternatives(
  targetMuscle: string | undefined,
  excludeId?: string,
  limit = 10
) {
  return useQuery<ExerciseDbExercise[]>({
    queryKey: ['exercise-alternatives', targetMuscle, excludeId],
    queryFn: () => fetchAlternativeExercises(targetMuscle!, excludeId, limit),
    enabled: !!targetMuscle,
    staleTime: LONG_STALE,
    gcTime: LONG_STALE,
  })
}
