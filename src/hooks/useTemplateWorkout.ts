import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  startTemplateWorkout,
  completeTemplateWorkout,
  getUserTemplateWorkouts,
  getActiveTemplateWorkout,
  getTemplateById,
  type TemplateWorkoutSession,
  type CompleteTemplateWorkoutData
} from '@/services/templateWorkoutService'
import { advanceCycleDay } from '@/services/profileService'
import type { WorkoutTemplate } from '@/services/scheduleService'

export function useTemplate(templateId: string | undefined) {
  return useQuery<WorkoutTemplate | null>({
    queryKey: ['template', templateId],
    queryFn: () => getTemplateById(templateId!),
    enabled: !!templateId
  })
}

export function useActiveTemplateWorkout() {
  const user = useAuthStore((s) => s.user)

  return useQuery<TemplateWorkoutSession | null>({
    queryKey: ['active-template-workout', user?.id],
    queryFn: () => getActiveTemplateWorkout(user!.id),
    enabled: !!user?.id
  })
}

export function useUserTemplateWorkouts() {
  const user = useAuthStore((s) => s.user)

  return useQuery<TemplateWorkoutSession[]>({
    queryKey: ['user-template-workouts', user?.id],
    queryFn: () => getUserTemplateWorkouts(user!.id),
    enabled: !!user?.id
  })
}

export function useStartTemplateWorkout() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (templateId: string) => startTemplateWorkout(user!.id, templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-template-workout'] })
      queryClient.invalidateQueries({ queryKey: ['user-template-workouts'] })
    }
  })
}

export function useCompleteTemplateWorkout() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ sessionId, ...data }: CompleteTemplateWorkoutData) => {
      const session = await completeTemplateWorkout(sessionId, data)
      // Advance to next day in cycle after completing workout
      if (user?.id) {
        await advanceCycleDay(user.id)
      }
      return session
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-template-workout'] })
      queryClient.invalidateQueries({ queryKey: ['user-template-workouts'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] })
    }
  })
}
