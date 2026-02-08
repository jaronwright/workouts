import { useQuery } from '@tanstack/react-query'
import {
  getMobilityCategories,
  getMobilityTemplatesByCategory,
  type WorkoutTemplate
} from '@/services/scheduleService'

export function useMobilityCategories() {
  return useQuery<{ category: string; template: WorkoutTemplate }[]>({
    queryKey: ['mobility-categories'],
    queryFn: () => getMobilityCategories()
  })
}

export function useMobilityVariants(category: string) {
  return useQuery<WorkoutTemplate[]>({
    queryKey: ['mobility-variants', category],
    queryFn: () => getMobilityTemplatesByCategory(category),
    enabled: !!category
  })
}
