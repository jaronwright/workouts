/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  getWorkoutDisplayName,
  getWeightsStyleByName,
  getCategoryLabel,
  WEIGHTS_CONFIG,
  CATEGORY_DEFAULTS,
  WORKOUT_DISPLAY_NAMES,
} from '@/config/workoutConfig'
import { useWorkoutStore } from '@/stores/workoutStore'
import type { ExerciseSet, WorkoutSession } from '@/types/workout'

// Mock dependencies for hook tests
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

import { useAuthStore } from '@/stores/authStore'
import * as workoutService from '@/services/workoutService'
import {
  useStartWorkout,
  useCompleteWorkout,
  useLogSet,
  useUpdateSet,
} from '@/hooks/useWorkoutSession'

// ============================================
// Test helpers
// ============================================

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

function makeExerciseSet(overrides: Partial<ExerciseSet> = {}): ExerciseSet {
  return {
    id: 'set-1',
    session_id: 'session-1',
    plan_exercise_id: 'exercise-1',
    set_number: 1,
    reps_completed: 10,
    weight_used: 135,
    completed: true,
    created_at: '2024-01-15T10:05:00Z',
    ...overrides,
  }
}

function makeSession(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 'session-1',
    user_id: 'user-123',
    workout_day_id: 'day-1',
    started_at: '2024-01-15T10:00:00Z',
    completed_at: null,
    notes: null,
    is_public: true,
    ...overrides,
  }
}

// ============================================
// getWorkoutDisplayName - display name mapping
// ============================================

describe('getWorkoutDisplayName', () => {
  it('maps "PUSH (Chest, Shoulders, Triceps)" to "Push"', () => {
    expect(getWorkoutDisplayName('PUSH (Chest, Shoulders, Triceps)')).toBe('Push')
  })

  it('maps "Pull (Back, Biceps, Rear Delts)" to "Pull"', () => {
    expect(getWorkoutDisplayName('Pull (Back, Biceps, Rear Delts)')).toBe('Pull')
  })

  it('maps "LEGS (Quads, Hamstrings, Calves)" to "Legs"', () => {
    expect(getWorkoutDisplayName('LEGS (Quads, Hamstrings, Calves)')).toBe('Legs')
  })

  it('maps "Upper (Chest, Back, Shoulders, Arms)" to "Upper"', () => {
    expect(getWorkoutDisplayName('Upper (Chest, Back, Shoulders, Arms)')).toBe('Upper')
  })

  it('maps "Lower (Quads, Glutes, Hamstrings, Calves)" to "Lower"', () => {
    expect(getWorkoutDisplayName('Lower (Quads, Glutes, Hamstrings, Calves)')).toBe('Lower')
  })

  it('maps null to "Workout"', () => {
    expect(getWorkoutDisplayName(null)).toBe('Workout')
  })

  it('maps undefined to "Workout"', () => {
    expect(getWorkoutDisplayName(undefined)).toBe('Workout')
  })

  it('maps empty string to "Workout"', () => {
    expect(getWorkoutDisplayName('')).toBe('Workout')
  })

  it('maps exact lowercase cardio names correctly', () => {
    expect(getWorkoutDisplayName('cycling')).toBe('Cycling')
    expect(getWorkoutDisplayName('running')).toBe('Running')
    expect(getWorkoutDisplayName('swimming')).toBe('Swimming')
  })

  it('maps exact lowercase mobility names correctly', () => {
    expect(getWorkoutDisplayName('core stability')).toBe('Core Stability')
    expect(getWorkoutDisplayName('spine mobility')).toBe('Spine Mobility')
    expect(getWorkoutDisplayName('shoulder prehab')).toBe('Shoulder Prehab')
  })

  it('maps multi-word split names like "Chest & Back"', () => {
    expect(getWorkoutDisplayName('Chest & Back')).toBe('Chest & Back')
    expect(getWorkoutDisplayName('Shoulders & Arms')).toBe('Shoulders & Arms')
  })

  it('maps bro split day names', () => {
    expect(getWorkoutDisplayName('Chest')).toBe('Chest')
    expect(getWorkoutDisplayName('Back')).toBe('Back')
    expect(getWorkoutDisplayName('Arms')).toBe('Arms')
    expect(getWorkoutDisplayName('Shoulders')).toBe('Shoulders')
  })

  it('maps full body workout day names', () => {
    expect(getWorkoutDisplayName('Full Body A')).toBe('Full Body A')
    expect(getWorkoutDisplayName('Full Body B')).toBe('Full Body B')
    expect(getWorkoutDisplayName('Full Body C')).toBe('Full Body C')
  })

  it('falls back to title-cased first word for unknown names', () => {
    expect(getWorkoutDisplayName('Mystery Workout')).toBe('Mystery')
    expect(getWorkoutDisplayName('custom routine')).toBe('Custom')
  })

  it('is case-insensitive for exact matches', () => {
    expect(getWorkoutDisplayName('CYCLING')).toBe('Cycling')
    expect(getWorkoutDisplayName('Running')).toBe('Running')
    expect(getWorkoutDisplayName('CORE STABILITY')).toBe('Core Stability')
  })
})

// ============================================
// Additional config helper tests
// ============================================

describe('getWeightsStyleByName', () => {
  it('returns correct style for full DB name with parenthetical description', () => {
    const style = getWeightsStyleByName('PUSH (Chest, Shoulders, Triceps)')
    expect(style).toBe(WEIGHTS_CONFIG.push)
  })

  it('returns default style for completely unrecognized names', () => {
    expect(getWeightsStyleByName('Yoga Flow')).toBe(CATEGORY_DEFAULTS.weights)
  })

  it('matches direct lookup keys before keyword fallback', () => {
    // "chest & back" has a direct entry in WEIGHTS_CONFIG
    const style = getWeightsStyleByName('Chest & Back')
    expect(style).toBe(WEIGHTS_CONFIG['chest & back'])
  })
})

describe('getCategoryLabel', () => {
  it('maps "weights" to "Weights"', () => {
    expect(getCategoryLabel('weights')).toBe('Weights')
  })

  it('maps "rest" to "Rest Day"', () => {
    expect(getCategoryLabel('rest')).toBe('Rest Day')
  })

  it('returns input unchanged for unknown categories', () => {
    expect(getCategoryLabel('stretching')).toBe('stretching')
  })
})

describe('WORKOUT_DISPLAY_NAMES completeness', () => {
  it('has entries for all PPL workout types', () => {
    expect(WORKOUT_DISPLAY_NAMES['push']).toBeDefined()
    expect(WORKOUT_DISPLAY_NAMES['pull']).toBeDefined()
    expect(WORKOUT_DISPLAY_NAMES['legs']).toBeDefined()
  })

  it('has entries for upper/lower split', () => {
    expect(WORKOUT_DISPLAY_NAMES['upper']).toBeDefined()
    expect(WORKOUT_DISPLAY_NAMES['lower']).toBeDefined()
  })

  it('has entries for all cardio types', () => {
    expect(WORKOUT_DISPLAY_NAMES['cycling']).toBe('Cycling')
    expect(WORKOUT_DISPLAY_NAMES['running']).toBe('Running')
    expect(WORKOUT_DISPLAY_NAMES['boxing']).toBe('Boxing')
    expect(WORKOUT_DISPLAY_NAMES['rower']).toBe('Rower')
    expect(WORKOUT_DISPLAY_NAMES['stair stepper']).toBe('Stair Stepper')
    expect(WORKOUT_DISPLAY_NAMES['swimming']).toBe('Swimming')
  })

  it('has entries for all mobility types', () => {
    expect(WORKOUT_DISPLAY_NAMES['core stability']).toBe('Core Stability')
    expect(WORKOUT_DISPLAY_NAMES['hip, knee & ankle flow']).toBe('Hip, Knee & Ankle Flow')
    expect(WORKOUT_DISPLAY_NAMES['spine mobility']).toBe('Spine Mobility')
    expect(WORKOUT_DISPLAY_NAMES['upper body flow']).toBe('Upper Body Flow')
    expect(WORKOUT_DISPLAY_NAMES['full body recovery']).toBe('Full Body Recovery')
    expect(WORKOUT_DISPLAY_NAMES['shoulder prehab']).toBe('Shoulder Prehab')
  })
})

// ============================================
// Weighted workout flow: start -> log sets -> complete
// ============================================

describe('Weighted workout flow', () => {
  const mockSetActiveSession = vi.fn()
  const mockClearWorkout = vi.fn()
  const mockAddCompletedSet = vi.fn()

  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()

    queryClient = createQueryClient()

    vi.mocked(useAuthStore).mockImplementation((selector: any) =>
      selector({ user: { id: 'user-123' } })
    )

    vi.mocked(useWorkoutStore).mockImplementation((selector?: any) => {
      const state = {
        setActiveSession: mockSetActiveSession,
        clearWorkout: mockClearWorkout,
        addCompletedSet: mockAddCompletedSet,
      }
      if (typeof selector === 'function') {
        return selector(state)
      }
      return state
    })
  })

  it('starts a session and stores it in workoutStore', async () => {
    const session = makeSession()
    vi.mocked(workoutService.startWorkoutSession).mockResolvedValue(session)

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useStartWorkout(), { wrapper })

    await result.current.mutateAsync('day-1')

    expect(workoutService.startWorkoutSession).toHaveBeenCalledWith('user-123', 'day-1')
    expect(mockSetActiveSession).toHaveBeenCalledWith(session)
  })

  it('logs a set with weight and reps, then stores completed set', async () => {
    const set = makeExerciseSet({ weight_used: 185, reps_completed: 8 })
    vi.mocked(workoutService.logExerciseSet).mockResolvedValue(set)

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useLogSet(), { wrapper })

    await result.current.mutateAsync({
      sessionId: 'session-1',
      planExerciseId: 'exercise-1',
      setNumber: 1,
      repsCompleted: 8,
      weightUsed: 185,
    })

    expect(workoutService.logExerciseSet).toHaveBeenCalledWith(
      'session-1',
      'exercise-1',
      1,
      8,
      185
    )
    expect(mockAddCompletedSet).toHaveBeenCalledWith('exercise-1', set)
  })

  it('logs multiple sets for the same exercise sequentially', async () => {
    const set1 = makeExerciseSet({ id: 'set-1', set_number: 1, weight_used: 135, reps_completed: 10 })
    const set2 = makeExerciseSet({ id: 'set-2', set_number: 2, weight_used: 135, reps_completed: 9 })
    const set3 = makeExerciseSet({ id: 'set-3', set_number: 3, weight_used: 135, reps_completed: 8 })

    vi.mocked(workoutService.logExerciseSet)
      .mockResolvedValueOnce(set1)
      .mockResolvedValueOnce(set2)
      .mockResolvedValueOnce(set3)

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useLogSet(), { wrapper })

    await result.current.mutateAsync({
      sessionId: 'session-1',
      planExerciseId: 'exercise-1',
      setNumber: 1,
      repsCompleted: 10,
      weightUsed: 135,
    })

    await result.current.mutateAsync({
      sessionId: 'session-1',
      planExerciseId: 'exercise-1',
      setNumber: 2,
      repsCompleted: 9,
      weightUsed: 135,
    })

    await result.current.mutateAsync({
      sessionId: 'session-1',
      planExerciseId: 'exercise-1',
      setNumber: 3,
      repsCompleted: 8,
      weightUsed: 135,
    })

    expect(workoutService.logExerciseSet).toHaveBeenCalledTimes(3)
    expect(mockAddCompletedSet).toHaveBeenCalledTimes(3)
    expect(mockAddCompletedSet).toHaveBeenNthCalledWith(1, 'exercise-1', set1)
    expect(mockAddCompletedSet).toHaveBeenNthCalledWith(2, 'exercise-1', set2)
    expect(mockAddCompletedSet).toHaveBeenNthCalledWith(3, 'exercise-1', set3)
  })

  it('completes a workout session and clears store state', async () => {
    const completedSession = makeSession({
      completed_at: '2024-01-15T11:00:00Z',
      notes: 'Great push day',
    })
    vi.mocked(workoutService.completeWorkoutSession).mockResolvedValue(completedSession)

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useCompleteWorkout(), { wrapper })

    await result.current.mutateAsync({ sessionId: 'session-1', notes: 'Great push day' })

    expect(workoutService.completeWorkoutSession).toHaveBeenCalledWith('session-1', 'Great push day')
    expect(mockClearWorkout).toHaveBeenCalled()
  })

  it('completes a workout without notes', async () => {
    const completedSession = makeSession({ completed_at: '2024-01-15T11:00:00Z' })
    vi.mocked(workoutService.completeWorkoutSession).mockResolvedValue(completedSession)

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useCompleteWorkout(), { wrapper })

    await result.current.mutateAsync({ sessionId: 'session-1' })

    expect(workoutService.completeWorkoutSession).toHaveBeenCalledWith('session-1', undefined)
    expect(mockClearWorkout).toHaveBeenCalled()
  })

  it('invalidates session-related queries after completing workout', async () => {
    vi.mocked(workoutService.completeWorkoutSession).mockResolvedValue(
      makeSession({ completed_at: '2024-01-15T11:00:00Z' })
    )
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useCompleteWorkout(), { wrapper })

    await result.current.mutateAsync({ sessionId: 'session-1' })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['active-session'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user-sessions'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todays-workout'] })
  })
})

// ============================================
// Exercise completion toggle via updateSet
// ============================================

describe('Exercise completion toggle', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()

    queryClient = createQueryClient()

    vi.mocked(useAuthStore).mockImplementation((selector: any) =>
      selector({ user: { id: 'user-123' } })
    )

    vi.mocked(useWorkoutStore).mockImplementation((selector?: any) => {
      const state = {
        setActiveSession: vi.fn(),
        clearWorkout: vi.fn(),
        addCompletedSet: vi.fn(),
      }
      if (typeof selector === 'function') {
        return selector(state)
      }
      return state
    })
  })

  it('marks a set as completed', async () => {
    const updatedSet = makeExerciseSet({ completed: true })
    vi.mocked(workoutService.updateExerciseSet).mockResolvedValue(updatedSet)

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useUpdateSet(), { wrapper })

    await result.current.mutateAsync({
      setId: 'set-1',
      updates: { completed: true },
    })

    expect(workoutService.updateExerciseSet).toHaveBeenCalledWith('set-1', { completed: true })
  })

  it('marks a set as uncompleted', async () => {
    const updatedSet = makeExerciseSet({ completed: false })
    vi.mocked(workoutService.updateExerciseSet).mockResolvedValue(updatedSet)

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useUpdateSet(), { wrapper })

    await result.current.mutateAsync({
      setId: 'set-1',
      updates: { completed: false },
    })

    expect(workoutService.updateExerciseSet).toHaveBeenCalledWith('set-1', { completed: false })
  })

  it('re-completes a previously uncompleted set', async () => {
    vi.mocked(workoutService.updateExerciseSet)
      .mockResolvedValueOnce(makeExerciseSet({ completed: false }))
      .mockResolvedValueOnce(makeExerciseSet({ completed: true }))

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useUpdateSet(), { wrapper })

    // Uncomplete
    await result.current.mutateAsync({
      setId: 'set-1',
      updates: { completed: false },
    })

    // Re-complete
    await result.current.mutateAsync({
      setId: 'set-1',
      updates: { completed: true },
    })

    expect(workoutService.updateExerciseSet).toHaveBeenCalledTimes(2)
    expect(workoutService.updateExerciseSet).toHaveBeenNthCalledWith(1, 'set-1', { completed: false })
    expect(workoutService.updateExerciseSet).toHaveBeenNthCalledWith(2, 'set-1', { completed: true })
  })

  it('invalidates session and exercise queries after toggle', async () => {
    vi.mocked(workoutService.updateExerciseSet).mockResolvedValue(makeExerciseSet())
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useUpdateSet(), { wrapper })

    await result.current.mutateAsync({
      setId: 'set-1',
      updates: { completed: true },
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['session-sets'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['session-detail'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['session-exercise-details'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['exercise-history'] })
  })
})

// ============================================
// Weight input validation via logExerciseSet
// ============================================

describe('Weight input validation', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()

    queryClient = createQueryClient()

    vi.mocked(useAuthStore).mockImplementation((selector: any) =>
      selector({ user: { id: 'user-123' } })
    )

    vi.mocked(useWorkoutStore).mockImplementation((selector?: any) => {
      const state = {
        setActiveSession: vi.fn(),
        clearWorkout: vi.fn(),
        addCompletedSet: vi.fn(),
      }
      if (typeof selector === 'function') {
        return selector(state)
      }
      return state
    })
  })

  it('passes integer weight correctly to the service', async () => {
    vi.mocked(workoutService.logExerciseSet).mockResolvedValue(
      makeExerciseSet({ weight_used: 225 })
    )

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useLogSet(), { wrapper })

    await result.current.mutateAsync({
      sessionId: 'session-1',
      planExerciseId: 'exercise-1',
      setNumber: 1,
      repsCompleted: 5,
      weightUsed: 225,
    })

    expect(workoutService.logExerciseSet).toHaveBeenCalledWith(
      'session-1', 'exercise-1', 1, 5, 225
    )
  })

  it('passes decimal weight correctly to the service', async () => {
    vi.mocked(workoutService.logExerciseSet).mockResolvedValue(
      makeExerciseSet({ weight_used: 22.5 })
    )

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useLogSet(), { wrapper })

    await result.current.mutateAsync({
      sessionId: 'session-1',
      planExerciseId: 'exercise-1',
      setNumber: 1,
      repsCompleted: 12,
      weightUsed: 22.5,
    })

    expect(workoutService.logExerciseSet).toHaveBeenCalledWith(
      'session-1', 'exercise-1', 1, 12, 22.5
    )
  })

  it('passes null weight when no weight is provided (bodyweight exercise)', async () => {
    vi.mocked(workoutService.logExerciseSet).mockResolvedValue(
      makeExerciseSet({ weight_used: null })
    )

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useLogSet(), { wrapper })

    await result.current.mutateAsync({
      sessionId: 'session-1',
      planExerciseId: 'exercise-1',
      setNumber: 1,
      repsCompleted: 15,
      weightUsed: null,
    })

    expect(workoutService.logExerciseSet).toHaveBeenCalledWith(
      'session-1', 'exercise-1', 1, 15, null
    )
  })

  it('passes null reps when no reps provided', async () => {
    vi.mocked(workoutService.logExerciseSet).mockResolvedValue(
      makeExerciseSet({ reps_completed: null })
    )

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useLogSet(), { wrapper })

    await result.current.mutateAsync({
      sessionId: 'session-1',
      planExerciseId: 'exercise-1',
      setNumber: 1,
      repsCompleted: null,
      weightUsed: 100,
    })

    expect(workoutService.logExerciseSet).toHaveBeenCalledWith(
      'session-1', 'exercise-1', 1, null, 100
    )
  })

  it('passes both null reps and null weight for timed exercises', async () => {
    vi.mocked(workoutService.logExerciseSet).mockResolvedValue(
      makeExerciseSet({ reps_completed: null, weight_used: null })
    )

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useLogSet(), { wrapper })

    await result.current.mutateAsync({
      sessionId: 'session-1',
      planExerciseId: 'exercise-1',
      setNumber: 1,
      repsCompleted: null,
      weightUsed: null,
    })

    expect(workoutService.logExerciseSet).toHaveBeenCalledWith(
      'session-1', 'exercise-1', 1, null, null
    )
  })

  it('can update weight on an existing set', async () => {
    vi.mocked(workoutService.updateExerciseSet).mockResolvedValue(
      makeExerciseSet({ weight_used: 140 })
    )

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useUpdateSet(), { wrapper })

    await result.current.mutateAsync({
      setId: 'set-1',
      updates: { weight_used: 140 },
    })

    expect(workoutService.updateExerciseSet).toHaveBeenCalledWith('set-1', { weight_used: 140 })
  })

  it('can update reps on an existing set', async () => {
    vi.mocked(workoutService.updateExerciseSet).mockResolvedValue(
      makeExerciseSet({ reps_completed: 12 })
    )

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useUpdateSet(), { wrapper })

    await result.current.mutateAsync({
      setId: 'set-1',
      updates: { reps_completed: 12 },
    })

    expect(workoutService.updateExerciseSet).toHaveBeenCalledWith('set-1', { reps_completed: 12 })
  })

  it('passes zero weight correctly (not treated as null)', async () => {
    vi.mocked(workoutService.logExerciseSet).mockResolvedValue(
      makeExerciseSet({ weight_used: 0 })
    )

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useLogSet(), { wrapper })

    await result.current.mutateAsync({
      sessionId: 'session-1',
      planExerciseId: 'exercise-1',
      setNumber: 1,
      repsCompleted: 20,
      weightUsed: 0,
    })

    expect(workoutService.logExerciseSet).toHaveBeenCalledWith(
      'session-1', 'exercise-1', 1, 20, 0
    )
  })
})
