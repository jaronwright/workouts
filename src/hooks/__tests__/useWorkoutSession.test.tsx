import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
  useActiveSession,
  useUserSessions,
  useSessionSets,
  useStartWorkout,
  useCompleteWorkout,
  useLogSet,
} from '../useWorkoutSession'
import { useAuthStore } from '@/stores/authStore'
import { useWorkoutStore } from '@/stores/workoutStore'
import * as workoutService from '@/services/workoutService'

// Mock dependencies
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/stores/workoutStore', () => ({
  useWorkoutStore: vi.fn(),
}))

vi.mock('@/services/workoutService', () => ({
  getActiveSession: vi.fn(),
  getUserSessions: vi.fn(),
  getSessionSets: vi.fn(),
  startWorkoutSession: vi.fn(),
  completeWorkoutSession: vi.fn(),
  logExerciseSet: vi.fn(),
  getExerciseHistory: vi.fn(),
  getLastWeightForExercise: vi.fn(),
  getSessionExerciseDetails: vi.fn(),
  deleteWorkoutSession: vi.fn(),
  updateWorkoutSession: vi.fn(),
  updateExerciseSet: vi.fn(),
  deleteExerciseSet: vi.fn(),
  getWorkoutSession: vi.fn(),
}))

describe('useWorkoutSession hooks', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }
  const mockSetActiveSession = vi.fn()
  const mockClearWorkout = vi.fn()
  const mockAddCompletedSet = vi.fn()

  let queryClient: QueryClient

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    })

    // Default: authenticated user
    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = { user: mockUser }
      if (typeof selector === 'function') {
        return selector(state as Parameters<typeof selector>[0])
      }
      return state
    })

    // Default: workout store with mocked actions
    vi.mocked(useWorkoutStore).mockImplementation((selector) => {
      const state = {
        setActiveSession: mockSetActiveSession,
        clearWorkout: mockClearWorkout,
        addCompletedSet: mockAddCompletedSet,
      }
      if (typeof selector === 'function') {
        return selector(state as Parameters<typeof selector>[0])
      }
      return state
    })
  })

  // ============================================
  // useActiveSession
  // ============================================

  describe('useActiveSession', () => {
    it('fetches active session when user is authenticated', async () => {
      const mockSession: workoutService.SessionWithDay = {
        id: 'session-1',
        user_id: 'user-123',
        workout_day_id: 'day-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: null,
        notes: null,
        created_at: '2024-01-15T10:00:00Z',
        workout_day: null,
      }
      vi.mocked(workoutService.getActiveSession).mockResolvedValue(mockSession)

      const { result } = renderHook(() => useActiveSession(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(workoutService.getActiveSession).toHaveBeenCalledWith('user-123')
      expect(result.current.data).toEqual(mockSession)
    })

    it('does not fetch when user is not authenticated', () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = { user: null }
        if (typeof selector === 'function') {
          return selector(state as Parameters<typeof selector>[0])
        }
        return state
      })

      const { result } = renderHook(() => useActiveSession(), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(workoutService.getActiveSession).not.toHaveBeenCalled()
    })

    it('returns null when no active session exists', async () => {
      vi.mocked(workoutService.getActiveSession).mockResolvedValue(null)

      const { result } = renderHook(() => useActiveSession(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeNull()
    })
  })

  // ============================================
  // useUserSessions
  // ============================================

  describe('useUserSessions', () => {
    it('fetches user sessions when user is authenticated', async () => {
      const mockSessions: workoutService.SessionWithDay[] = [
        {
          id: 'session-1',
          user_id: 'user-123',
          workout_day_id: 'day-1',
          started_at: '2024-01-15T10:00:00Z',
          completed_at: '2024-01-15T11:00:00Z',
          notes: null,
          created_at: '2024-01-15T10:00:00Z',
          workout_day: null,
        },
      ]
      vi.mocked(workoutService.getUserSessions).mockResolvedValue(mockSessions)

      const { result } = renderHook(() => useUserSessions(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(workoutService.getUserSessions).toHaveBeenCalledWith('user-123')
      expect(result.current.data).toEqual(mockSessions)
    })

    it('does not fetch when user is not authenticated', () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = { user: null }
        if (typeof selector === 'function') {
          return selector(state as Parameters<typeof selector>[0])
        }
        return state
      })

      const { result } = renderHook(() => useUserSessions(), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(workoutService.getUserSessions).not.toHaveBeenCalled()
    })
  })

  // ============================================
  // useSessionSets
  // ============================================

  describe('useSessionSets', () => {
    it('fetches session sets when sessionId is provided', async () => {
      const mockSets = [
        {
          id: 'set-1',
          session_id: 'session-1',
          plan_exercise_id: 'exercise-1',
          set_number: 1,
          reps_completed: 10,
          weight_used: 135,
          completed: true,
          created_at: '2024-01-15T10:05:00Z',
        },
      ]
      vi.mocked(workoutService.getSessionSets).mockResolvedValue(mockSets)

      const { result } = renderHook(() => useSessionSets('session-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(workoutService.getSessionSets).toHaveBeenCalledWith('session-1')
      expect(result.current.data).toEqual(mockSets)
    })

    it('does not fetch when sessionId is undefined', () => {
      const { result } = renderHook(() => useSessionSets(undefined), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(workoutService.getSessionSets).not.toHaveBeenCalled()
    })
  })

  // ============================================
  // useStartWorkout
  // ============================================

  describe('useStartWorkout', () => {
    it('calls startWorkoutSession and sets active session in store', async () => {
      const mockSession = {
        id: 'session-new',
        user_id: 'user-123',
        workout_day_id: 'day-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: null,
        notes: null,
        created_at: '2024-01-15T10:00:00Z',
      }
      vi.mocked(workoutService.startWorkoutSession).mockResolvedValue(mockSession)

      const { result } = renderHook(() => useStartWorkout(), { wrapper })

      await result.current.mutateAsync('day-1')

      expect(workoutService.startWorkoutSession).toHaveBeenCalledWith('user-123', 'day-1')
      expect(mockSetActiveSession).toHaveBeenCalledWith(mockSession)
    })

    it('invalidates relevant queries on success', async () => {
      const mockSession = {
        id: 'session-new',
        user_id: 'user-123',
        workout_day_id: 'day-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: null,
        notes: null,
        created_at: '2024-01-15T10:00:00Z',
      }
      vi.mocked(workoutService.startWorkoutSession).mockResolvedValue(mockSession)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useStartWorkout(), { wrapper })

      await result.current.mutateAsync('day-1')

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['active-session'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user-sessions'] })
    })
  })

  // ============================================
  // useCompleteWorkout
  // ============================================

  describe('useCompleteWorkout', () => {
    it('calls completeWorkoutSession and clears workout in store', async () => {
      const mockCompletedSession = {
        id: 'session-1',
        user_id: 'user-123',
        workout_day_id: 'day-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: '2024-01-15T11:00:00Z',
        notes: 'Good workout',
        created_at: '2024-01-15T10:00:00Z',
      }
      vi.mocked(workoutService.completeWorkoutSession).mockResolvedValue(mockCompletedSession)

      const { result } = renderHook(() => useCompleteWorkout(), { wrapper })

      await result.current.mutateAsync({ sessionId: 'session-1', notes: 'Good workout' })

      expect(workoutService.completeWorkoutSession).toHaveBeenCalledWith(
        'session-1',
        'Good workout'
      )
      expect(mockClearWorkout).toHaveBeenCalled()
    })

    it('invalidates relevant queries on success', async () => {
      vi.mocked(workoutService.completeWorkoutSession).mockResolvedValue({
        id: 'session-1',
        user_id: 'user-123',
        workout_day_id: 'day-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: '2024-01-15T11:00:00Z',
        notes: null,
        created_at: '2024-01-15T10:00:00Z',
      })
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useCompleteWorkout(), { wrapper })

      await result.current.mutateAsync({ sessionId: 'session-1' })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['active-session'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user-sessions'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todays-workout'] })
    })
  })

  // ============================================
  // useLogSet
  // ============================================

  describe('useLogSet', () => {
    it('calls logExerciseSet and adds completed set to store', async () => {
      const mockSet = {
        id: 'set-1',
        session_id: 'session-1',
        plan_exercise_id: 'exercise-1',
        set_number: 1,
        reps_completed: 10,
        weight_used: 135,
        completed: true,
        created_at: '2024-01-15T10:05:00Z',
      }
      vi.mocked(workoutService.logExerciseSet).mockResolvedValue(mockSet)

      const { result } = renderHook(() => useLogSet(), { wrapper })

      await result.current.mutateAsync({
        sessionId: 'session-1',
        planExerciseId: 'exercise-1',
        setNumber: 1,
        repsCompleted: 10,
        weightUsed: 135,
      })

      expect(workoutService.logExerciseSet).toHaveBeenCalledWith(
        'session-1',
        'exercise-1',
        1,
        10,
        135
      )
      expect(mockAddCompletedSet).toHaveBeenCalledWith('exercise-1', mockSet)
    })

    it('handles null reps and weight', async () => {
      const mockSet = {
        id: 'set-2',
        session_id: 'session-1',
        plan_exercise_id: 'exercise-1',
        set_number: 2,
        reps_completed: null,
        weight_used: null,
        completed: true,
        created_at: '2024-01-15T10:06:00Z',
      }
      vi.mocked(workoutService.logExerciseSet).mockResolvedValue(mockSet)

      const { result } = renderHook(() => useLogSet(), { wrapper })

      await result.current.mutateAsync({
        sessionId: 'session-1',
        planExerciseId: 'exercise-1',
        setNumber: 2,
        repsCompleted: null,
        weightUsed: null,
      })

      expect(workoutService.logExerciseSet).toHaveBeenCalledWith(
        'session-1',
        'exercise-1',
        2,
        null,
        null
      )
    })

    it('invalidates relevant queries on success', async () => {
      const mockSet = {
        id: 'set-1',
        session_id: 'session-1',
        plan_exercise_id: 'exercise-1',
        set_number: 1,
        reps_completed: 10,
        weight_used: 135,
        completed: true,
        created_at: '2024-01-15T10:05:00Z',
      }
      vi.mocked(workoutService.logExerciseSet).mockResolvedValue(mockSet)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useLogSet(), { wrapper })

      await result.current.mutateAsync({
        sessionId: 'session-1',
        planExerciseId: 'exercise-1',
        setNumber: 1,
        repsCompleted: 10,
        weightUsed: 135,
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['session-sets'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['exercise-history'] })
    })
  })
})
