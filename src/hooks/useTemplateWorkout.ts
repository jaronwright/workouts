import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useOfflineStore } from '@/stores/offlineStore'
import {
  isNetworkError,
  generateClientId,
  buildOptimisticTemplateSession,
  buildOptimisticCompletedTemplateSession,
} from '@/utils/offlineUtils'
import {
  startTemplateWorkout,
  completeTemplateWorkout,
  quickLogTemplateWorkout,
  getUserTemplateWorkouts,
  getActiveTemplateWorkout,
  getLastCompletedTemplateSession,
  getTemplateById,
  type TemplateWorkoutSession,
  type CompleteTemplateWorkoutData
} from '@/services/templateWorkoutService'
import type { WorkoutTemplate } from '@/services/scheduleService'

export function useTemplate(templateId: string | undefined) {
  return useQuery<WorkoutTemplate | null>({
    queryKey: ['template', templateId],
    queryFn: () => getTemplateById(templateId!),
    enabled: !!templateId
  })
}

export function useLastTemplateSession(templateId: string | undefined) {
  const user = useAuthStore((s) => s.user)

  return useQuery<TemplateWorkoutSession | null>({
    queryKey: ['last-template-session', user?.id, templateId],
    queryFn: () => getLastCompletedTemplateSession(user!.id, templateId!),
    enabled: !!user?.id && !!templateId
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
    mutationFn: async (templateId: string) => {
      try {
        return await startTemplateWorkout(user!.id, templateId)
      } catch (err) {
        if (isNetworkError(err)) {
          const clientId = generateClientId()
          useOfflineStore.getState().enqueue({
            type: 'start-template',
            payload: { userId: user!.id, templateId },
            clientId,
          })
          return buildOptimisticTemplateSession({
            clientId,
            userId: user!.id,
            templateId,
          })
        }
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-template-workout'] })
      queryClient.invalidateQueries({ queryKey: ['user-template-workouts'] })
    }
  })
}

export function useCompleteTemplateWorkout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ sessionId, ...data }: CompleteTemplateWorkoutData) => {
      const resolvedId = useOfflineStore.getState().resolveId(sessionId)
      try {
        return await completeTemplateWorkout(resolvedId, data)
      } catch (err) {
        if (isNetworkError(err)) {
          const clientId = generateClientId()
          useOfflineStore.getState().enqueue({
            type: 'complete-template',
            payload: { sessionId, ...data },
            clientId,
          })
          return {
            id: resolvedId,
            completed_at: new Date().toISOString(),
            duration_minutes: data.durationMinutes ?? null,
            distance_value: data.distanceValue ?? null,
            distance_unit: data.distanceUnit ?? null,
            notes: data.notes ?? null,
          } as TemplateWorkoutSession
        }
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-template-workout'] })
      queryClient.invalidateQueries({ queryKey: ['user-template-workouts'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] })
    }
  })
}

export function useQuickLogTemplateWorkout() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (params: {
      templateId: string
      durationMinutes?: number
      distanceValue?: number
      distanceUnit?: string
    }) => {
      try {
        return await quickLogTemplateWorkout(user!.id, params.templateId, {
          durationMinutes: params.durationMinutes,
          distanceValue: params.distanceValue,
          distanceUnit: params.distanceUnit
        })
      } catch (err) {
        if (isNetworkError(err)) {
          const clientId = generateClientId()
          useOfflineStore.getState().enqueue({
            type: 'quick-log-template',
            payload: {
              userId: user!.id,
              templateId: params.templateId,
              durationMinutes: params.durationMinutes,
              distanceValue: params.distanceValue,
              distanceUnit: params.distanceUnit,
            },
            clientId,
          })
          return buildOptimisticCompletedTemplateSession({
            clientId,
            userId: user!.id,
            templateId: params.templateId,
            durationMinutes: params.durationMinutes,
            distanceValue: params.distanceValue,
            distanceUnit: params.distanceUnit,
          })
        }
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-template-workout'] })
      queryClient.invalidateQueries({ queryKey: ['user-template-workouts'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] })
    }
  })
}
