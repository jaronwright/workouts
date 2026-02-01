import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  getUserSchedule,
  getScheduleDay,
  upsertScheduleDay,
  deleteScheduleDay,
  initializeDefaultSchedule,
  getWorkoutTemplates,
  getWorkoutTemplatesByType,
  getTodaysScheduledWorkout,
  type ScheduleDay,
  type WorkoutTemplate,
  type UpdateScheduleDayData
} from '@/services/scheduleService'

export function useWorkoutTemplates() {
  return useQuery<WorkoutTemplate[]>({
    queryKey: ['workout-templates'],
    queryFn: () => getWorkoutTemplates()
  })
}

export function useWorkoutTemplatesByType(type: 'weights' | 'cardio' | 'mobility') {
  return useQuery<WorkoutTemplate[]>({
    queryKey: ['workout-templates', type],
    queryFn: () => getWorkoutTemplatesByType(type)
  })
}

export function useUserSchedule() {
  const user = useAuthStore((s) => s.user)

  return useQuery<ScheduleDay[]>({
    queryKey: ['user-schedule', user?.id],
    queryFn: () => getUserSchedule(user!.id),
    enabled: !!user?.id
  })
}

export function useScheduleDay(dayNumber: number) {
  const user = useAuthStore((s) => s.user)

  return useQuery<ScheduleDay | null>({
    queryKey: ['schedule-day', user?.id, dayNumber],
    queryFn: () => getScheduleDay(user!.id, dayNumber),
    enabled: !!user?.id
  })
}

export function useTodaysWorkout(currentCycleDay: number) {
  const user = useAuthStore((s) => s.user)

  return useQuery<ScheduleDay | null>({
    queryKey: ['todays-workout', user?.id, currentCycleDay],
    queryFn: () => getTodaysScheduledWorkout(user!.id, currentCycleDay),
    enabled: !!user?.id && currentCycleDay > 0
  })
}

export function useUpsertScheduleDay() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: ({ dayNumber, data }: { dayNumber: number; data: UpdateScheduleDayData }) =>
      upsertScheduleDay(user!.id, dayNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['schedule-day'] })
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] })
    }
  })
}

export function useDeleteScheduleDay() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (dayNumber: number) => deleteScheduleDay(user!.id, dayNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['schedule-day'] })
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] })
    }
  })
}

export function useInitializeSchedule() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: () => initializeDefaultSchedule(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['schedule-day'] })
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] })
    }
  })
}
