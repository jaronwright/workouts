import { useQuery } from '@tanstack/react-query'
import { getWorkoutPlans, getWorkoutDays, getWorkoutDayWithSections, getAllWorkoutDays } from '@/services/workoutService'
import { useProfile } from './useProfile'

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

// Returns workout days for the user's selected plan (split)
export function useSelectedPlanDays() {
  const { data: profile, isLoading: profileLoading } = useProfile()
  const planId = profile?.selected_plan_id || undefined

  return useQuery({
    queryKey: ['workout-days', planId || 'none'],
    queryFn: () => getWorkoutDays(planId!),
    enabled: !profileLoading && !!planId
  })
}
