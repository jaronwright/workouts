import { useQuery } from '@tanstack/react-query'
import { getWorkoutPlans, getWorkoutDays, getWorkoutDayWithSections, getAllWorkoutDays } from '@/services/workoutService'

export function useWorkoutPlans() {
  return useQuery({
    queryKey: ['workout-plans'],
    queryFn: getWorkoutPlans
  })
}

export function useWorkoutDays(planId?: string) {
  return useQuery({
    queryKey: ['workout-days', planId || 'all'],
    queryFn: () => planId ? getWorkoutDays(planId) : getAllWorkoutDays(),
  })
}

export function useWorkoutDay(dayId: string | undefined) {
  return useQuery({
    queryKey: ['workout-day', dayId],
    queryFn: () => getWorkoutDayWithSections(dayId!),
    enabled: !!dayId
  })
}
