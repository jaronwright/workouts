import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useAuthStore } from '@/stores/authStore'
import { useOfflineStore } from '@/stores/offlineStore'
import {
  isNetworkError,
  generateClientId,
  buildOptimisticSet,
  buildOptimisticSession,
} from '@/utils/offlineUtils'
import {
  startWorkoutSession,
  completeWorkoutSession,
  logExerciseSet,
  logMultipleExerciseSets,
  getSessionSets,
  getUserSessions,
  getActiveSession,
  getExerciseHistory,
  getLastWeightForExercise,
  getSessionExerciseDetails,
  deleteWorkoutSession,
  updateWorkoutSession,
  updateExerciseSet,
  deleteExerciseSet,
  getWorkoutSession,
  type SessionWithDay
} from '@/services/workoutService'
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
    mutationFn: async (workoutDayId: string) => {
      try {
        return await startWorkoutSession(user!.id, workoutDayId)
      } catch (err) {
        if (isNetworkError(err)) {
          const clientId = generateClientId()
          useOfflineStore.getState().enqueue({
            type: 'start-session',
            payload: { userId: user!.id, workoutDayId },
            clientId,
          })
          return buildOptimisticSession({
            clientId,
            userId: user!.id,
            workoutDayId,
          })
        }
        throw err
      }
    },
    onSuccess: (session) => {
      setActiveSession(session)
      queryClient.invalidateQueries({ queryKey: ['active-session'] })
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    }
  })
}

export function useCompleteWorkout() {
  const queryClient = useQueryClient()
  const { clearWorkout } = useWorkoutStore()

  return useMutation({
    mutationFn: async ({ sessionId, notes }: { sessionId: string; notes?: string }) => {
      const resolvedId = useOfflineStore.getState().resolveId(sessionId)
      try {
        return await completeWorkoutSession(resolvedId, notes)
      } catch (err) {
        if (isNetworkError(err)) {
          const clientId = generateClientId()
          useOfflineStore.getState().enqueue({
            type: 'complete-session',
            payload: { sessionId, notes },
            clientId,
          })
          return {
            id: resolvedId,
            completed_at: new Date().toISOString(),
            notes: notes ?? null,
          }
        }
        throw err
      }
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
    mutationFn: async ({
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
    }) => {
      const resolvedSessionId = useOfflineStore.getState().resolveId(sessionId)
      try {
        return await logExerciseSet(resolvedSessionId, planExerciseId, setNumber, repsCompleted, weightUsed)
      } catch (err) {
        if (isNetworkError(err)) {
          const clientId = generateClientId()
          useOfflineStore.getState().enqueue({
            type: 'log-set',
            payload: { sessionId, planExerciseId, setNumber, repsCompleted, weightUsed },
            clientId,
          })
          return buildOptimisticSet({
            clientId,
            sessionId,
            planExerciseId,
            setNumber,
            repsCompleted,
            weightUsed,
          })
        }
        throw err
      }
    },
    onSuccess: (set, variables) => {
      addCompletedSet(variables.planExerciseId, set)
      queryClient.invalidateQueries({ queryKey: ['session-sets'] })
      queryClient.invalidateQueries({ queryKey: ['exercise-history'] })
    }
  })
}

export function useLogMultipleSets() {
  const queryClient = useQueryClient()
  const { addCompletedSet } = useWorkoutStore()

  return useMutation({
    mutationFn: async ({
      sessionId,
      planExerciseId,
      totalSets,
      repsCompleted,
      weightUsed
    }: {
      sessionId: string
      planExerciseId: string
      totalSets: number
      repsCompleted: number | null
      weightUsed: number | null
    }) => {
      const resolvedSessionId = useOfflineStore.getState().resolveId(sessionId)
      try {
        return await logMultipleExerciseSets(resolvedSessionId, planExerciseId, totalSets, repsCompleted, weightUsed)
      } catch (err) {
        if (isNetworkError(err)) {
          // Queue individual sets for offline sync
          const optimisticSets: ExerciseSet[] = []
          for (let i = 1; i <= totalSets; i++) {
            const clientId = generateClientId()
            useOfflineStore.getState().enqueue({
              type: 'log-set',
              payload: { sessionId, planExerciseId, setNumber: i, repsCompleted, weightUsed },
              clientId,
            })
            optimisticSets.push(buildOptimisticSet({
              clientId,
              sessionId,
              planExerciseId,
              setNumber: i,
              repsCompleted,
              weightUsed,
            }))
          }
          return optimisticSets
        }
        throw err
      }
    },
    onSuccess: (sets, variables) => {
      sets.forEach(set => addCompletedSet(variables.planExerciseId, set))
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

// ============================================
// Session CRUD Hooks
// ============================================

export function useSession(sessionId: string | undefined) {
  return useQuery<SessionWithDay | null>({
    queryKey: ['session', sessionId],
    queryFn: () => getWorkoutSession(sessionId!),
    enabled: !!sessionId
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, notes }: { sessionId: string; notes?: string | null }) =>
      updateWorkoutSession(sessionId, { notes }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session', variables.sessionId] })
      queryClient.invalidateQueries({ queryKey: ['session-detail', variables.sessionId] })
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    }
  })
}

// ============================================
// Exercise Set CRUD Hooks
// ============================================

export function useUpdateSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      setId,
      updates
    }: {
      setId: string
      updates: {
        reps_completed?: number | null
        weight_used?: number | null
        completed?: boolean
      }
    }) => {
      const resolvedId = useOfflineStore.getState().resolveId(setId)
      try {
        return await updateExerciseSet(resolvedId, updates)
      } catch (err) {
        if (isNetworkError(err)) {
          const clientId = generateClientId()
          useOfflineStore.getState().enqueue({
            type: 'update-set',
            payload: { setId, updates },
            clientId,
          })
          return { id: resolvedId, ...updates } as ExerciseSet
        }
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-sets'] })
      queryClient.invalidateQueries({ queryKey: ['session-detail'] })
      queryClient.invalidateQueries({ queryKey: ['session-exercise-details'] })
      queryClient.invalidateQueries({ queryKey: ['exercise-history'] })
    }
  })
}

export function useDeleteSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (setId: string) => {
      // If the set was created offline (exists in queue), just remove it from the queue
      const offlineState = useOfflineStore.getState()
      const queuedEntry = offlineState.queue.find(
        (m) => m.type === 'log-set' && m.clientId === setId
      )
      if (queuedEntry) {
        offlineState.dequeue(queuedEntry.id)
        return
      }

      const resolvedId = offlineState.resolveId(setId)
      try {
        return await deleteExerciseSet(resolvedId)
      } catch (err) {
        if (isNetworkError(err)) {
          const clientId = generateClientId()
          offlineState.enqueue({
            type: 'delete-set',
            payload: { setId },
            clientId,
          })
          return
        }
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-sets'] })
      queryClient.invalidateQueries({ queryKey: ['session-detail'] })
      queryClient.invalidateQueries({ queryKey: ['session-exercise-details'] })
      queryClient.invalidateQueries({ queryKey: ['exercise-history'] })
    }
  })
}
