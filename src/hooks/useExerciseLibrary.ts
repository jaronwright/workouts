import { useQuery } from '@tanstack/react-query'
import {
  fetchBodyPartList,
  fetchTargetList,
  fetchEquipmentList,
  fetchExercisesByBodyPart,
  fetchExercisesByTarget,
  fetchExercisesByEquipment,
  searchExerciseByName,
  type ExerciseDbExercise,
} from '@/services/exerciseDbService'

const LONG_STALE = 30 * 24 * 60 * 60 * 1000 // 30 days for category lists
const MEDIUM_STALE = 7 * 24 * 60 * 60 * 1000 // 7 days for exercise results

/** Fetch the list of body part categories */
export function useBodyPartList() {
  return useQuery({
    queryKey: ['exercise-library', 'bodyPartList'],
    queryFn: fetchBodyPartList,
    staleTime: LONG_STALE,
    gcTime: LONG_STALE,
  })
}

/** Fetch the list of target muscle groups */
export function useTargetList() {
  return useQuery({
    queryKey: ['exercise-library', 'targetList'],
    queryFn: fetchTargetList,
    staleTime: LONG_STALE,
    gcTime: LONG_STALE,
  })
}

/** Fetch the list of equipment types */
export function useEquipmentList() {
  return useQuery({
    queryKey: ['exercise-library', 'equipmentList'],
    queryFn: fetchEquipmentList,
    staleTime: LONG_STALE,
    gcTime: LONG_STALE,
  })
}

export type BrowseCategory = 'bodyPart' | 'target' | 'equipment'

/** Fetch exercises filtered by a specific category value */
export function useExercisesByCategory(
  category: BrowseCategory | null,
  value: string | null,
  limit = 20,
  offset = 0
) {
  return useQuery<ExerciseDbExercise[]>({
    queryKey: ['exercise-library', 'exercises', category, value, limit, offset],
    queryFn: () => {
      if (!category || !value) return Promise.resolve([])
      switch (category) {
        case 'bodyPart':
          return fetchExercisesByBodyPart(value, limit, offset)
        case 'target':
          return fetchExercisesByTarget(value, limit, offset)
        case 'equipment':
          return fetchExercisesByEquipment(value, limit, offset)
      }
    },
    enabled: !!category && !!value,
    staleTime: MEDIUM_STALE,
    gcTime: MEDIUM_STALE,
  })
}

/** Search for a single exercise by name (for library detail view) */
export function useExerciseSearch(searchTerm: string | null) {
  return useQuery<ExerciseDbExercise | null>({
    queryKey: ['exercise-library', 'search', searchTerm],
    queryFn: () => searchExerciseByName(searchTerm!),
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: MEDIUM_STALE,
    gcTime: MEDIUM_STALE,
    retry: 1,
  })
}
