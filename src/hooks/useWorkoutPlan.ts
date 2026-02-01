import { useQuery } from '@tanstack/react-query'
import { getWorkoutPlans, getWorkoutDays, getWorkoutDayWithSections } from '@/services/workoutService'

export function useWorkoutPlans() {
  return useQuery({
    queryKey: ['workout-plans'],
    queryFn: getWorkoutPlans
  })
}

export function useWorkoutDays(planId: string | undefined) {
  return useQuery({
    queryKey: ['workout-days', planId],
    queryFn: () => getWorkoutDays(planId!),
    enabled: !!planId
  })
}

export function useWorkoutDay(dayId: string | undefined) {
  return useQuery({
    queryKey: ['workout-day', dayId],
    queryFn: () => getWorkoutDayWithSections(dayId!),
    enabled: !!dayId
  })
}
