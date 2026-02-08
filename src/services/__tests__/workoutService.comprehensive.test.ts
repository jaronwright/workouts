import { describe, it, expect, vi, beforeEach } from 'vitest'

// Build a chainable mock where every method returns `this` by default.
// Terminal methods (single, maybeSingle) are overridden per-test via
// mockResolvedValueOnce so we can control data / error payloads.
const mockChain = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  neq: vi.fn(),
  is: vi.fn(),
  not: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
}

// Every chainable method returns the chain itself
for (const key of Object.keys(mockChain) as (keyof typeof mockChain)[]) {
  mockChain[key].mockReturnValue(mockChain)
}

const mockFrom = vi.fn().mockReturnValue(mockChain)

vi.mock('../supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}))

// Import after mock registration
import {
  getWorkoutPlans,
  getWorkoutDays,
  getAllWorkoutDays,
  getWorkoutDayWithSections,
  startWorkoutSession,
  completeWorkoutSession,
  logExerciseSet,
  updateExerciseSet,
  getSessionSets,
  getUserSessions,
  getActiveSession,
  getExerciseHistory,
  getLastWeightForExercise,
  getSessionWithSets,
  getSessionExerciseDetails,
  deleteWorkoutSession,
  updateExerciseWeightUnit,
  updateWorkoutSession,
  getWorkoutSession,
  deleteExerciseSet,
  getExerciseSet,
} from '../workoutService'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resetChain() {
  for (const key of Object.keys(mockChain) as (keyof typeof mockChain)[]) {
    mockChain[key].mockClear()
    mockChain[key].mockReturnValue(mockChain)
  }
  mockFrom.mockClear()
  mockFrom.mockReturnValue(mockChain)
}

/** Make the *last* method in a typical chain resolve with {data, error}. */
function resolveChainWith(data: unknown, error: unknown = null) {
  // For queries that end without single/maybeSingle the await is on `order`/`limit`/`eq`/etc.
  // We override the whole chain's implicit promise resolution.
  // Since the chain object is returned from every method, we just need the
  // chain itself to act as a thenable that resolves with {data, error}.
  // However, Supabase returns a plain object from await, not a thenable.
  // The simplest approach: make `order`, `limit`, `eq`, `select`, `delete`, `neq`, `not` return
  // a promise-like chain that has `then` so `await` works.
  const result = { data, error }
  // Override every chainable method to return an object that can be awaited
  for (const key of Object.keys(mockChain) as (keyof typeof mockChain)[]) {
    mockChain[key].mockReturnValue({
      ...mockChain,
      then: (resolve: (v: unknown) => void) => resolve(result),
    })
  }
  mockFrom.mockReturnValue({
    ...mockChain,
    then: (resolve: (v: unknown) => void) => resolve(result),
  })
}

/**
 * Make `single()` resolve with {data, error}.
 * Useful for queries ending in `.single()`.
 */
function resolveSingleWith(data: unknown, error: unknown = null) {
  mockChain.single.mockReturnValue({
    then: (resolve: (v: unknown) => void) => resolve({ data, error }),
  })
}

/**
 * Make `maybeSingle()` resolve with {data, error}.
 */
function resolveMaybeSingleWith(data: unknown, error: unknown = null) {
  mockChain.maybeSingle.mockReturnValue({
    then: (resolve: (v: unknown) => void) => resolve({ data, error }),
  })
}

// ---------------------------------------------------------------------------
// Mock data factories
// ---------------------------------------------------------------------------

const makePlan = (overrides = {}) => ({
  id: 'plan-1',
  name: 'PPL',
  description: 'Push Pull Legs',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

const makeDay = (overrides = {}) => ({
  id: 'day-1',
  plan_id: 'plan-1',
  name: 'Push',
  day_number: 1,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

const makeSection = (overrides = {}) => ({
  id: 'section-1',
  workout_day_id: 'day-1',
  name: 'Main Lifts',
  duration_minutes: null,
  sort_order: 1,
  ...overrides,
})

const makeExercise = (overrides = {}) => ({
  id: 'exercise-1',
  section_id: 'section-1',
  name: 'Bench Press',
  sets: 3,
  reps_min: 8,
  reps_max: 12,
  reps_unit: 'reps',
  is_per_side: false,
  target_weight: 135,
  weight_unit: 'lbs' as const,
  notes: null,
  sort_order: 1,
  ...overrides,
})

const makeSession = (overrides = {}) => ({
  id: 'session-1',
  user_id: 'user-123',
  workout_day_id: 'day-1',
  started_at: '2024-01-15T10:00:00Z',
  completed_at: null as string | null,
  notes: null as string | null,
  is_public: false,
  ...overrides,
})

const makeSet = (overrides = {}) => ({
  id: 'set-1',
  session_id: 'session-1',
  plan_exercise_id: 'exercise-1',
  set_number: 1,
  reps_completed: 10,
  weight_used: 135,
  completed: true,
  created_at: '2024-01-15T10:05:00Z',
  ...overrides,
})

const makeError = (message = 'DB error', code = 'PGRST000') => ({
  message,
  code,
  details: '',
  hint: '',
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('workoutService (comprehensive)', () => {
  beforeEach(() => {
    resetChain()
  })

  // ─── getWorkoutPlans ─────────────────────────────────────

  describe('getWorkoutPlans', () => {
    it('returns an array of plans on success', async () => {
      const plans = [makePlan(), makePlan({ id: 'plan-2', name: 'Upper/Lower' })]
      resolveChainWith(plans)

      const result = await getWorkoutPlans()

      expect(mockFrom).toHaveBeenCalledWith('workout_plans')
      expect(mockChain.select).toHaveBeenCalledWith('*')
      expect(mockChain.order).toHaveBeenCalledWith('created_at')
      expect(result).toEqual(plans)
    })

    it('throws on Supabase error', async () => {
      resolveChainWith(null, makeError('Plans fetch failed'))

      await expect(getWorkoutPlans()).rejects.toEqual(
        expect.objectContaining({ message: 'Plans fetch failed' })
      )
    })

    it('returns empty array when no plans exist', async () => {
      resolveChainWith([])

      const result = await getWorkoutPlans()
      expect(result).toEqual([])
    })
  })

  // ─── getWorkoutDays ──────────────────────────────────────

  describe('getWorkoutDays', () => {
    it('returns days filtered by planId', async () => {
      const days = [makeDay(), makeDay({ id: 'day-2', name: 'Pull', day_number: 2 })]
      resolveChainWith(days)

      const result = await getWorkoutDays('plan-1')

      expect(mockFrom).toHaveBeenCalledWith('workout_days')
      expect(mockChain.eq).toHaveBeenCalledWith('plan_id', 'plan-1')
      expect(mockChain.order).toHaveBeenCalledWith('day_number')
      expect(result).toEqual(days)
    })

    it('throws on Supabase error', async () => {
      resolveChainWith(null, makeError('Days fetch failed'))

      await expect(getWorkoutDays('plan-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Days fetch failed' })
      )
    })

    it('returns empty array when plan has no days', async () => {
      resolveChainWith([])

      const result = await getWorkoutDays('plan-empty')
      expect(result).toEqual([])
    })
  })

  // ─── getAllWorkoutDays ────────────────────────────────────

  describe('getAllWorkoutDays', () => {
    it('returns all days excluding plan 3 (mobility)', async () => {
      const days = [makeDay(), makeDay({ id: 'day-2', plan_id: 'plan-2' })]
      resolveChainWith(days)

      const result = await getAllWorkoutDays()

      expect(mockFrom).toHaveBeenCalledWith('workout_days')
      expect(mockChain.neq).toHaveBeenCalledWith('plan_id', '00000000-0000-0000-0000-000000000003')
      expect(mockChain.order).toHaveBeenCalledWith('day_number')
      expect(result).toEqual(days)
    })

    it('throws on Supabase error', async () => {
      resolveChainWith(null, makeError('All days fetch failed'))

      await expect(getAllWorkoutDays()).rejects.toEqual(
        expect.objectContaining({ message: 'All days fetch failed' })
      )
    })
  })

  // ─── getWorkoutDayWithSections ───────────────────────────

  describe('getWorkoutDayWithSections', () => {
    it('returns day with nested sections and exercises', async () => {
      const day = makeDay()
      const section = makeSection()
      const exercise = makeExercise()

      // First call: fetch day (.single())
      resolveSingleWith(day)
      // We need to handle the three sequential Supabase calls.
      // After the first call resolves via single(), the function resets the chain
      // for sections. We simulate this by tracking call order.

      let callCount = 0
      mockFrom.mockImplementation((table: string) => {
        callCount++
        if (table === 'workout_days') {
          // Return a chain whose .single() resolves with the day
          return {
            ...mockChain,
            select: vi.fn().mockReturnValue({
              ...mockChain,
              eq: vi.fn().mockReturnValue({
                ...mockChain,
                single: vi.fn().mockReturnValue({
                  then: (resolve: (v: unknown) => void) => resolve({ data: day, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'exercise_sections') {
          return {
            ...mockChain,
            select: vi.fn().mockReturnValue({
              ...mockChain,
              eq: vi.fn().mockReturnValue({
                ...mockChain,
                order: vi.fn().mockReturnValue({
                  then: (resolve: (v: unknown) => void) => resolve({ data: [section], error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'plan_exercises') {
          return {
            ...mockChain,
            select: vi.fn().mockReturnValue({
              ...mockChain,
              eq: vi.fn().mockReturnValue({
                ...mockChain,
                order: vi.fn().mockReturnValue({
                  then: (resolve: (v: unknown) => void) => resolve({ data: [exercise], error: null }),
                }),
              }),
            }),
          }
        }
        return mockChain
      })

      const result = await getWorkoutDayWithSections('day-1')

      expect(result).toEqual({
        ...day,
        sections: [
          {
            ...section,
            exercises: [exercise],
          },
        ],
      })
    })

    it('throws when day fetch fails', async () => {
      mockFrom.mockImplementation(() => ({
        ...mockChain,
        select: vi.fn().mockReturnValue({
          ...mockChain,
          eq: vi.fn().mockReturnValue({
            ...mockChain,
            single: vi.fn().mockReturnValue({
              then: (resolve: (v: unknown) => void) =>
                resolve({ data: null, error: makeError('Day not found') }),
            }),
          }),
        }),
      }))

      await expect(getWorkoutDayWithSections('nonexistent')).rejects.toEqual(
        expect.objectContaining({ message: 'Day not found' })
      )
    })

    it('returns null when day data is null without error', async () => {
      mockFrom.mockImplementation(() => ({
        ...mockChain,
        select: vi.fn().mockReturnValue({
          ...mockChain,
          eq: vi.fn().mockReturnValue({
            ...mockChain,
            single: vi.fn().mockReturnValue({
              then: (resolve: (v: unknown) => void) => resolve({ data: null, error: null }),
            }),
          }),
        }),
      }))

      const result = await getWorkoutDayWithSections('missing-day')
      expect(result).toBeNull()
    })

    it('throws when sections fetch fails', async () => {
      const day = makeDay()
      mockFrom.mockImplementation((table: string) => {
        if (table === 'workout_days') {
          return {
            ...mockChain,
            select: vi.fn().mockReturnValue({
              ...mockChain,
              eq: vi.fn().mockReturnValue({
                ...mockChain,
                single: vi.fn().mockReturnValue({
                  then: (resolve: (v: unknown) => void) => resolve({ data: day, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'exercise_sections') {
          return {
            ...mockChain,
            select: vi.fn().mockReturnValue({
              ...mockChain,
              eq: vi.fn().mockReturnValue({
                ...mockChain,
                order: vi.fn().mockReturnValue({
                  then: (resolve: (v: unknown) => void) =>
                    resolve({ data: null, error: makeError('Sections fetch failed') }),
                }),
              }),
            }),
          }
        }
        return mockChain
      })

      await expect(getWorkoutDayWithSections('day-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Sections fetch failed' })
      )
    })

    it('throws when exercises fetch fails for a section', async () => {
      const day = makeDay()
      const section = makeSection()
      mockFrom.mockImplementation((table: string) => {
        if (table === 'workout_days') {
          return {
            ...mockChain,
            select: vi.fn().mockReturnValue({
              ...mockChain,
              eq: vi.fn().mockReturnValue({
                ...mockChain,
                single: vi.fn().mockReturnValue({
                  then: (resolve: (v: unknown) => void) => resolve({ data: day, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'exercise_sections') {
          return {
            ...mockChain,
            select: vi.fn().mockReturnValue({
              ...mockChain,
              eq: vi.fn().mockReturnValue({
                ...mockChain,
                order: vi.fn().mockReturnValue({
                  then: (resolve: (v: unknown) => void) => resolve({ data: [section], error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'plan_exercises') {
          return {
            ...mockChain,
            select: vi.fn().mockReturnValue({
              ...mockChain,
              eq: vi.fn().mockReturnValue({
                ...mockChain,
                order: vi.fn().mockReturnValue({
                  then: (resolve: (v: unknown) => void) =>
                    resolve({ data: null, error: makeError('Exercises fetch failed') }),
                }),
              }),
            }),
          }
        }
        return mockChain
      })

      await expect(getWorkoutDayWithSections('day-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Exercises fetch failed' })
      )
    })

    it('handles day with empty sections array', async () => {
      const day = makeDay()
      mockFrom.mockImplementation((table: string) => {
        if (table === 'workout_days') {
          return {
            ...mockChain,
            select: vi.fn().mockReturnValue({
              ...mockChain,
              eq: vi.fn().mockReturnValue({
                ...mockChain,
                single: vi.fn().mockReturnValue({
                  then: (resolve: (v: unknown) => void) => resolve({ data: day, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'exercise_sections') {
          return {
            ...mockChain,
            select: vi.fn().mockReturnValue({
              ...mockChain,
              eq: vi.fn().mockReturnValue({
                ...mockChain,
                order: vi.fn().mockReturnValue({
                  then: (resolve: (v: unknown) => void) => resolve({ data: [], error: null }),
                }),
              }),
            }),
          }
        }
        return mockChain
      })

      const result = await getWorkoutDayWithSections('day-1')
      expect(result).toEqual({ ...day, sections: [] })
    })
  })

  // ─── startWorkoutSession ─────────────────────────────────

  describe('startWorkoutSession', () => {
    it('inserts and returns a new session', async () => {
      const session = makeSession()
      resolveSingleWith(session)

      const result = await startWorkoutSession('user-123', 'day-1')

      expect(mockFrom).toHaveBeenCalledWith('workout_sessions')
      expect(mockChain.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        workout_day_id: 'day-1',
      })
      expect(result).toEqual(session)
    })

    it('throws on Supabase error', async () => {
      resolveSingleWith(null, makeError('Insert failed'))

      await expect(startWorkoutSession('user-123', 'day-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Insert failed' })
      )
    })
  })

  // ─── completeWorkoutSession ──────────────────────────────

  describe('completeWorkoutSession', () => {
    it('updates session with completed_at and optional notes', async () => {
      const session = makeSession({ completed_at: '2024-01-15T11:00:00Z', notes: 'Good workout' })
      resolveSingleWith(session)

      const result = await completeWorkoutSession('session-1', 'Good workout')

      expect(mockFrom).toHaveBeenCalledWith('workout_sessions')
      expect(mockChain.update).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Good workout' })
      )
      expect(result).toEqual(session)
    })

    it('works without notes', async () => {
      const session = makeSession({ completed_at: '2024-01-15T11:00:00Z' })
      resolveSingleWith(session)

      const result = await completeWorkoutSession('session-1')

      expect(mockChain.update).toHaveBeenCalledWith(
        expect.objectContaining({ notes: undefined })
      )
      expect(result).toEqual(session)
    })

    it('throws on Supabase error', async () => {
      resolveSingleWith(null, makeError('Complete failed'))

      await expect(completeWorkoutSession('session-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Complete failed' })
      )
    })
  })

  // ─── logExerciseSet ──────────────────────────────────────

  describe('logExerciseSet', () => {
    it('inserts a new set and returns it', async () => {
      const set = makeSet()
      resolveSingleWith(set)

      const result = await logExerciseSet('session-1', 'exercise-1', 1, 10, 135)

      expect(mockFrom).toHaveBeenCalledWith('exercise_sets')
      expect(mockChain.insert).toHaveBeenCalledWith({
        session_id: 'session-1',
        plan_exercise_id: 'exercise-1',
        set_number: 1,
        reps_completed: 10,
        weight_used: 135,
        completed: true,
      })
      expect(result).toEqual(set)
    })

    it('supports null weight (bodyweight exercises)', async () => {
      const set = makeSet({ weight_used: null })
      resolveSingleWith(set)

      const result = await logExerciseSet('session-1', 'exercise-1', 1, 15, null)

      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ weight_used: null })
      )
      expect(result.weight_used).toBeNull()
    })

    it('supports null reps', async () => {
      const set = makeSet({ reps_completed: null })
      resolveSingleWith(set)

      const result = await logExerciseSet('session-1', 'exercise-1', 1, null, 135)

      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ reps_completed: null })
      )
      expect(result.reps_completed).toBeNull()
    })

    it('throws on Supabase error', async () => {
      resolveSingleWith(null, makeError('Log set failed'))

      await expect(logExerciseSet('session-1', 'exercise-1', 1, 10, 135)).rejects.toEqual(
        expect.objectContaining({ message: 'Log set failed' })
      )
    })
  })

  // ─── updateExerciseSet ───────────────────────────────────

  describe('updateExerciseSet', () => {
    it('updates a set and returns it', async () => {
      const set = makeSet({ reps_completed: 12, weight_used: 140 })
      resolveSingleWith(set)

      const result = await updateExerciseSet('set-1', { reps_completed: 12, weight_used: 140 })

      expect(mockFrom).toHaveBeenCalledWith('exercise_sets')
      expect(mockChain.update).toHaveBeenCalledWith({ reps_completed: 12, weight_used: 140 })
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'set-1')
      expect(result).toEqual(set)
    })

    it('throws on Supabase error', async () => {
      resolveSingleWith(null, makeError('Update set failed'))

      await expect(updateExerciseSet('set-1', { completed: false })).rejects.toEqual(
        expect.objectContaining({ message: 'Update set failed' })
      )
    })
  })

  // ─── deleteExerciseSet ───────────────────────────────────

  describe('deleteExerciseSet', () => {
    it('deletes a set by id', async () => {
      resolveChainWith(null)

      await deleteExerciseSet('set-1')

      expect(mockFrom).toHaveBeenCalledWith('exercise_sets')
      expect(mockChain.delete).toHaveBeenCalled()
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'set-1')
    })

    it('throws on Supabase error', async () => {
      resolveChainWith(null, makeError('Delete set failed'))

      await expect(deleteExerciseSet('set-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Delete set failed' })
      )
    })
  })

  // ─── getSessionSets ──────────────────────────────────────

  describe('getSessionSets', () => {
    it('returns sets for a session', async () => {
      const sets = [makeSet(), makeSet({ id: 'set-2', set_number: 2 })]
      resolveChainWith(sets)

      const result = await getSessionSets('session-1')

      expect(mockFrom).toHaveBeenCalledWith('exercise_sets')
      expect(mockChain.eq).toHaveBeenCalledWith('session_id', 'session-1')
      expect(mockChain.order).toHaveBeenCalledWith('created_at')
      expect(result).toEqual(sets)
    })

    it('returns empty array when no sets exist', async () => {
      resolveChainWith([])

      const result = await getSessionSets('session-empty')
      expect(result).toEqual([])
    })

    it('throws on Supabase error', async () => {
      resolveChainWith(null, makeError('Get sets failed'))

      await expect(getSessionSets('session-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Get sets failed' })
      )
    })
  })

  // ─── getActiveSession ────────────────────────────────────

  describe('getActiveSession', () => {
    it('returns the active session for a user', async () => {
      const session = makeSession({ workout_day: makeDay() })
      resolveMaybeSingleWith(session)

      const result = await getActiveSession('user-123')

      expect(mockFrom).toHaveBeenCalledWith('workout_sessions')
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(mockChain.is).toHaveBeenCalledWith('completed_at', null)
      expect(result).toEqual(session)
    })

    it('returns null when no active session', async () => {
      resolveMaybeSingleWith(null)

      const result = await getActiveSession('user-123')
      expect(result).toBeNull()
    })

    it('throws on Supabase error', async () => {
      resolveMaybeSingleWith(null, makeError('Active session query failed'))

      await expect(getActiveSession('user-123')).rejects.toEqual(
        expect.objectContaining({ message: 'Active session query failed' })
      )
    })
  })

  // ─── getUserSessions ─────────────────────────────────────

  describe('getUserSessions', () => {
    it('returns all sessions with workout_day join', async () => {
      const sessions = [
        makeSession({ workout_day: makeDay() }),
        makeSession({ id: 'session-2', completed_at: '2024-01-14T11:00:00Z', workout_day: makeDay({ id: 'day-2', name: 'Pull' }) }),
      ]
      resolveChainWith(sessions)

      const result = await getUserSessions('user-123')

      expect(mockFrom).toHaveBeenCalledWith('workout_sessions')
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(mockChain.order).toHaveBeenCalledWith('started_at', { ascending: false })
      expect(result).toEqual(sessions)
    })

    it('returns empty array for user with no sessions', async () => {
      resolveChainWith([])

      const result = await getUserSessions('user-new')
      expect(result).toEqual([])
    })

    it('throws on Supabase error', async () => {
      resolveChainWith(null, makeError('User sessions failed'))

      await expect(getUserSessions('user-123')).rejects.toEqual(
        expect.objectContaining({ message: 'User sessions failed' })
      )
    })
  })

  // ─── getSessionExerciseDetails ───────────────────────────

  describe('getSessionExerciseDetails', () => {
    it('returns sets with nested plan_exercise and section', async () => {
      const detail = {
        ...makeSet(),
        plan_exercise: {
          ...makeExercise(),
          section: { name: 'Main Lifts', sort_order: 1 },
        },
      }
      resolveChainWith([detail])

      const result = await getSessionExerciseDetails('session-1')

      expect(mockFrom).toHaveBeenCalledWith('exercise_sets')
      expect(mockChain.eq).toHaveBeenCalledWith('session_id', 'session-1')
      expect(result).toEqual([detail])
    })

    it('throws on Supabase error', async () => {
      resolveChainWith(null, makeError('Details fetch failed'))

      await expect(getSessionExerciseDetails('session-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Details fetch failed' })
      )
    })
  })

  // ─── getExerciseHistory ──────────────────────────────────

  describe('getExerciseHistory', () => {
    it('returns exercise history with session join', async () => {
      const history = [
        { ...makeSet(), session: { user_id: 'user-123', started_at: '2024-01-15T10:00:00Z' } },
      ]
      resolveChainWith(history)

      const result = await getExerciseHistory('user-123', 'exercise-1')

      expect(mockFrom).toHaveBeenCalledWith('exercise_sets')
      expect(result).toEqual(history)
    })

    it('respects custom limit parameter', async () => {
      resolveChainWith([])

      await getExerciseHistory('user-123', 'exercise-1', 5)

      expect(mockChain.limit).toHaveBeenCalledWith(5)
    })

    it('defaults to limit of 10', async () => {
      resolveChainWith([])

      await getExerciseHistory('user-123', 'exercise-1')

      expect(mockChain.limit).toHaveBeenCalledWith(10)
    })

    it('throws on Supabase error', async () => {
      resolveChainWith(null, makeError('History fetch failed'))

      await expect(getExerciseHistory('user-123', 'exercise-1')).rejects.toEqual(
        expect.objectContaining({ message: 'History fetch failed' })
      )
    })
  })

  // ─── getLastWeightForExercise ────────────────────────────

  describe('getLastWeightForExercise', () => {
    it('returns last weight used for exercise', async () => {
      const data = {
        weight_used: 145,
        session: { user_id: 'user-123', started_at: '2024-01-15T10:00:00Z' },
      }
      resolveMaybeSingleWith(data)

      const result = await getLastWeightForExercise('user-123', 'exercise-1')

      expect(mockFrom).toHaveBeenCalledWith('exercise_sets')
      expect(result).toBe(145)
    })

    it('returns null when no previous weight data', async () => {
      resolveMaybeSingleWith(null)

      const result = await getLastWeightForExercise('user-123', 'exercise-1')
      expect(result).toBeNull()
    })

    it('throws on Supabase error', async () => {
      resolveMaybeSingleWith(null, makeError('Last weight failed'))

      await expect(getLastWeightForExercise('user-123', 'exercise-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Last weight failed' })
      )
    })
  })

  // ─── getSessionWithSets ──────────────────────────────────

  describe('getSessionWithSets', () => {
    it('returns session with workout_day and exercise_sets', async () => {
      const session = makeSession({ workout_day: makeDay() })
      const sets = [makeSet(), makeSet({ id: 'set-2', set_number: 2 })]

      let callNum = 0
      mockFrom.mockImplementation((table: string) => {
        callNum++
        if (table === 'workout_sessions') {
          return {
            ...mockChain,
            select: vi.fn().mockReturnValue({
              ...mockChain,
              eq: vi.fn().mockReturnValue({
                ...mockChain,
                single: vi.fn().mockReturnValue({
                  then: (resolve: (v: unknown) => void) => resolve({ data: session, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'exercise_sets') {
          return {
            ...mockChain,
            select: vi.fn().mockReturnValue({
              ...mockChain,
              eq: vi.fn().mockReturnValue({
                ...mockChain,
                order: vi.fn().mockReturnValue({
                  then: (resolve: (v: unknown) => void) => resolve({ data: sets, error: null }),
                }),
              }),
            }),
          }
        }
        return mockChain
      })

      const result = await getSessionWithSets('session-1')

      expect(result).toEqual({
        ...session,
        exercise_sets: sets,
      })
    })

    it('returns null when session not found', async () => {
      mockFrom.mockImplementation(() => ({
        ...mockChain,
        select: vi.fn().mockReturnValue({
          ...mockChain,
          eq: vi.fn().mockReturnValue({
            ...mockChain,
            single: vi.fn().mockReturnValue({
              then: (resolve: (v: unknown) => void) => resolve({ data: null, error: null }),
            }),
          }),
        }),
      }))

      const result = await getSessionWithSets('nonexistent')
      expect(result).toBeNull()
    })

    it('throws when session query errors', async () => {
      mockFrom.mockImplementation(() => ({
        ...mockChain,
        select: vi.fn().mockReturnValue({
          ...mockChain,
          eq: vi.fn().mockReturnValue({
            ...mockChain,
            single: vi.fn().mockReturnValue({
              then: (resolve: (v: unknown) => void) =>
                resolve({ data: null, error: makeError('Session fetch failed') }),
            }),
          }),
        }),
      }))

      await expect(getSessionWithSets('session-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Session fetch failed' })
      )
    })

    it('throws when sets query errors', async () => {
      const session = makeSession({ workout_day: makeDay() })
      mockFrom.mockImplementation((table: string) => {
        if (table === 'workout_sessions') {
          return {
            ...mockChain,
            select: vi.fn().mockReturnValue({
              ...mockChain,
              eq: vi.fn().mockReturnValue({
                ...mockChain,
                single: vi.fn().mockReturnValue({
                  then: (resolve: (v: unknown) => void) => resolve({ data: session, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'exercise_sets') {
          return {
            ...mockChain,
            select: vi.fn().mockReturnValue({
              ...mockChain,
              eq: vi.fn().mockReturnValue({
                ...mockChain,
                order: vi.fn().mockReturnValue({
                  then: (resolve: (v: unknown) => void) =>
                    resolve({ data: null, error: makeError('Sets fetch failed') }),
                }),
              }),
            }),
          }
        }
        return mockChain
      })

      await expect(getSessionWithSets('session-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Sets fetch failed' })
      )
    })
  })

  // ─── deleteWorkoutSession ────────────────────────────────

  describe('deleteWorkoutSession', () => {
    it('deletes exercise_sets first then the session', async () => {
      const callOrder: string[] = []
      mockFrom.mockImplementation((table: string) => {
        callOrder.push(table)
        return {
          ...mockChain,
          delete: vi.fn().mockReturnValue({
            ...mockChain,
            eq: vi.fn().mockReturnValue({
              then: (resolve: (v: unknown) => void) => resolve({ data: null, error: null }),
            }),
          }),
        }
      })

      await deleteWorkoutSession('session-1')

      expect(callOrder).toEqual(['exercise_sets', 'workout_sessions'])
    })

    it('throws when deleting sets fails', async () => {
      mockFrom.mockImplementation(() => ({
        ...mockChain,
        delete: vi.fn().mockReturnValue({
          ...mockChain,
          eq: vi.fn().mockReturnValue({
            then: (resolve: (v: unknown) => void) =>
              resolve({ data: null, error: makeError('Delete sets failed') }),
          }),
        }),
      }))

      await expect(deleteWorkoutSession('session-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Delete sets failed' })
      )
    })

    it('throws when deleting session fails', async () => {
      let callNum = 0
      mockFrom.mockImplementation(() => {
        callNum++
        return {
          ...mockChain,
          delete: vi.fn().mockReturnValue({
            ...mockChain,
            eq: vi.fn().mockReturnValue({
              then: (resolve: (v: unknown) => void) =>
                resolve({
                  data: null,
                  error: callNum === 1 ? null : makeError('Delete session failed'),
                }),
            }),
          }),
        }
      })

      await expect(deleteWorkoutSession('session-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Delete session failed' })
      )
    })
  })

  // ─── updateExerciseWeightUnit ────────────────────────────

  describe('updateExerciseWeightUnit', () => {
    it('updates weight unit and returns the exercise', async () => {
      const exercise = makeExercise({ weight_unit: 'kg' })

      // First call: update with count
      // Second call: select to get updated row
      let callNum = 0
      mockFrom.mockImplementation(() => {
        callNum++
        if (callNum === 1) {
          // update call
          return {
            ...mockChain,
            update: vi.fn().mockReturnValue({
              ...mockChain,
              eq: vi.fn().mockReturnValue({
                then: (resolve: (v: unknown) => void) =>
                  resolve({ count: 1, error: null }),
              }),
            }),
          }
        }
        // select call
        return {
          ...mockChain,
          select: vi.fn().mockReturnValue({
            ...mockChain,
            eq: vi.fn().mockReturnValue({
              ...mockChain,
              maybeSingle: vi.fn().mockReturnValue({
                then: (resolve: (v: unknown) => void) => resolve({ data: exercise, error: null }),
              }),
            }),
          }),
        }
      })

      const result = await updateExerciseWeightUnit('exercise-1', 'kg')
      expect(result).toEqual(exercise)
    })

    it('returns null when update count is 0 (RLS restriction)', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mockFrom.mockImplementation(() => ({
        ...mockChain,
        update: vi.fn().mockReturnValue({
          ...mockChain,
          eq: vi.fn().mockReturnValue({
            then: (resolve: (v: unknown) => void) =>
              resolve({ count: 0, error: null }),
          }),
        }),
      }))

      const result = await updateExerciseWeightUnit('exercise-1', 'kg')
      expect(result).toBeNull()

      consoleSpy.mockRestore()
    })

    it('returns null and warns on update error', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mockFrom.mockImplementation(() => ({
        ...mockChain,
        update: vi.fn().mockReturnValue({
          ...mockChain,
          eq: vi.fn().mockReturnValue({
            then: (resolve: (v: unknown) => void) =>
              resolve({ count: null, error: makeError('RLS blocked') }),
          }),
        }),
      }))

      const result = await updateExerciseWeightUnit('exercise-1', 'kg')
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Could not persist weight unit preference:',
        'RLS blocked'
      )

      consoleSpy.mockRestore()
    })
  })

  // ─── updateWorkoutSession ────────────────────────────────

  describe('updateWorkoutSession', () => {
    it('updates session notes and returns updated session', async () => {
      const session = makeSession({ notes: 'Updated notes' })
      resolveSingleWith(session)

      const result = await updateWorkoutSession('session-1', { notes: 'Updated notes' })

      expect(mockFrom).toHaveBeenCalledWith('workout_sessions')
      expect(mockChain.update).toHaveBeenCalledWith({ notes: 'Updated notes' })
      expect(result).toEqual(session)
    })

    it('can set notes to null', async () => {
      const session = makeSession({ notes: null })
      resolveSingleWith(session)

      const result = await updateWorkoutSession('session-1', { notes: null })

      expect(mockChain.update).toHaveBeenCalledWith({ notes: null })
      expect(result.notes).toBeNull()
    })

    it('throws on Supabase error', async () => {
      resolveSingleWith(null, makeError('Update session failed'))

      await expect(updateWorkoutSession('session-1', { notes: 'fail' })).rejects.toEqual(
        expect.objectContaining({ message: 'Update session failed' })
      )
    })
  })

  // ─── getWorkoutSession ───────────────────────────────────

  describe('getWorkoutSession', () => {
    it('returns a session with workout_day', async () => {
      const session = makeSession({ workout_day: makeDay() })
      resolveSingleWith(session)

      const result = await getWorkoutSession('session-1')

      expect(mockFrom).toHaveBeenCalledWith('workout_sessions')
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'session-1')
      expect(result).toEqual(session)
    })

    it('returns null when not found (PGRST116)', async () => {
      resolveSingleWith(null, { message: 'Not found', code: 'PGRST116', details: '', hint: '' })

      const result = await getWorkoutSession('nonexistent')
      expect(result).toBeNull()
    })

    it('throws on non-PGRST116 errors', async () => {
      resolveSingleWith(null, makeError('Unexpected error'))

      await expect(getWorkoutSession('session-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Unexpected error' })
      )
    })
  })

  // ─── getExerciseSet ──────────────────────────────────────

  describe('getExerciseSet', () => {
    it('returns an exercise set', async () => {
      const set = makeSet()
      resolveSingleWith(set)

      const result = await getExerciseSet('set-1')

      expect(mockFrom).toHaveBeenCalledWith('exercise_sets')
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'set-1')
      expect(result).toEqual(set)
    })

    it('returns null when not found (PGRST116)', async () => {
      resolveSingleWith(null, { message: 'Not found', code: 'PGRST116', details: '', hint: '' })

      const result = await getExerciseSet('nonexistent')
      expect(result).toBeNull()
    })

    it('throws on non-PGRST116 errors', async () => {
      resolveSingleWith(null, makeError('Unexpected'))

      await expect(getExerciseSet('set-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Unexpected' })
      )
    })
  })
})
