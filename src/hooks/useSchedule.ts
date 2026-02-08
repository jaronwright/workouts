import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  getUserSchedule,
  getScheduleDay,
  getScheduleDayWorkouts,
  upsertScheduleDay,
  saveScheduleDayWorkouts,
  deleteScheduleDay,
  initializeDefaultSchedule,
  clearUserSchedule,
  getWorkoutTemplates,
  getWorkoutTemplatesByType,
  getTodaysScheduledWorkout,
  type ScheduleDay,
  type WorkoutTemplate,
  type UpdateScheduleDayData,
  type ScheduleWorkoutItem
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

export function useScheduleDayWorkouts(dayNumber: number) {
  const user = useAuthStore((s) => s.user)

  return useQuery<ScheduleDay[]>({
    queryKey: ['schedule-day-workouts', user?.id, dayNumber],
    queryFn: () => getScheduleDayWorkouts(user!.id, dayNumber),
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
      queryClient.invalidateQueries({ queryKey: ['schedule-day-workouts'] })
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] })
    }
  })
}

export function useSaveScheduleDayWorkouts() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: ({ dayNumber, workouts }: { dayNumber: number; workouts: ScheduleWorkoutItem[] }) =>
      saveScheduleDayWorkouts(user!.id, dayNumber, workouts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['schedule-day'] })
      queryClient.invalidateQueries({ queryKey: ['schedule-day-workouts'] })
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] })
    },
    onError: (error) => {
      console.error('Schedule save mutation failed:', error)
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
      queryClient.invalidateQueries({ queryKey: ['schedule-day-workouts'] })
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] })
    }
  })
}

export function useInitializeSchedule() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (planId?: string) => initializeDefaultSchedule(user!.id, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['schedule-day'] })
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] })
    }
  })
}

export function useClearSchedule() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: () => clearUserSchedule(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['schedule-day'] })
      queryClient.invalidateQueries({ queryKey: ['schedule-day-workouts'] })
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] })
    }
  })
}
