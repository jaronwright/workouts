import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useAuthStore } from '@/stores/authStore'
import {
  startWorkoutSession,
  completeWorkoutSession,
  logExerciseSet,
  getSessionSets,
  getUserSessions,
  getActiveSession,
  getExerciseHistory,
  getLastWeightForExercise,
  getSessionExerciseDetails,
  deleteWorkoutSession,
  type SessionWithDay
} from '@/services/workoutService'
import { advanceCycleDay } from '@/services/profileService'
import type { ExerciseSet } from '@/types/workout'

export function useActiveSession() {
  const user = useAuthStore((s) => s.user)

  return useQuery<SessionWithDay | null>({
    queryKey: ['active-session', user?.id],
    queryFn: () => getActiveSession(user!.id),
    enabled: !!user?.id
  })
}

export function useUserSessions() {
  const user = useAuthStore((s) => s.user)

  return useQuery<SessionWithDay[]>({
    queryKey: ['user-sessions', user?.id],
    queryFn: () => getUserSessions(user!.id),
    enabled: !!user?.id
  })
}

export function useSessionSets(sessionId: string | undefined) {
  return useQuery<ExerciseSet[]>({
    queryKey: ['session-sets', sessionId],
    queryFn: () => getSessionSets(sessionId!),
    enabled: !!sessionId
  })
}

export function useExerciseHistory(planExerciseId: string | undefined) {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['exercise-history', user?.id, planExerciseId],
    queryFn: () => getExerciseHistory(user!.id, planExerciseId!),
    enabled: !!user?.id && !!planExerciseId
  })
}

export function useLastWeight(planExerciseId: string | undefined) {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['last-weight', user?.id, planExerciseId],
    queryFn: () => getLastWeightForExercise(user!.id, planExerciseId!),
    enabled: !!user?.id && !!planExerciseId
  })
}

export function useSessionExerciseDetails(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session-exercise-details', sessionId],
    queryFn: () => getSessionExerciseDetails(sessionId!),
    enabled: !!sessionId
  })
}

export function useStartWorkout() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const { setActiveSession } = useWorkoutStore()

  return useMutation({
    mutationFn: (workoutDayId: string) => startWorkoutSession(user!.id, workoutDayId),
    onSuccess: (session) => {
      setActiveSession(session)
      queryClient.invalidateQueries({ queryKey: ['active-session'] })
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    }
  })
}

export function useCompleteWorkout() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const { clearWorkout } = useWorkoutStore()

  return useMutation({
    mutationFn: async ({ sessionId, notes }: { sessionId: string; notes?: string }) => {
      const session = await completeWorkoutSession(sessionId, notes)
      // Advance to next day in cycle after completing workout
      if (user?.id) {
        await advanceCycleDay(user.id)
      }
      return session
    },
    onSuccess: () => {
      clearWorkout()
      queryClient.invalidateQueries({ queryKey: ['active-session'] })
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] })
    }
  })
}

export function useLogSet() {
  const queryClient = useQueryClient()
  const { addCompletedSet } = useWorkoutStore()

  return useMutation({
    mutationFn: ({
      sessionId,
      planExerciseId,
      setNumber,
      repsCompleted,
      weightUsed
    }: {
      sessionId: string
      planExerciseId: string
      setNumber: number
      repsCompleted: number | null
      weightUsed: number | null
    }) => logExerciseSet(sessionId, planExerciseId, setNumber, repsCompleted, weightUsed),
    onSuccess: (set, variables) => {
      addCompletedSet(variables.planExerciseId, set)
      queryClient.invalidateQueries({ queryKey: ['session-sets'] })
      queryClient.invalidateQueries({ queryKey: ['exercise-history'] })
    }
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => deleteWorkoutSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['active-session'] })
    }
  })
}
