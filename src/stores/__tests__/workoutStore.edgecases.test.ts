import { describe, it, expect, beforeEach } from 'vitest'
import { useWorkoutStore } from '../workoutStore'
import type { WorkoutSession, ExerciseSet, WorkoutDayWithSections } from '@/types/workout'

// Helpers to create mock data
function mockSession(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: 'session-1',
    user_id: 'user-1',
    workout_day_id: 'day-1',
    started_at: '2024-01-15T10:00:00Z',
    completed_at: null,
    notes: null,
    is_public: true,
    ...overrides,
  }
}

function mockExerciseSet(overrides: Partial<ExerciseSet> = {}): ExerciseSet {
  return {
    id: 'set-1',
    session_id: 'session-1',
    plan_exercise_id: 'ex-1',
    set_number: 1,
    reps_completed: 10,
    weight_used: 135,
    completed: true,
    created_at: '2024-01-15T10:05:00Z',
    ...overrides,
  }
}

function mockWorkoutDay(overrides: Partial<WorkoutDayWithSections> = {}): WorkoutDayWithSections {
  return {
    id: 'day-1',
    plan_id: 'plan-1',
    name: 'Push Day',
    day_number: 1,
    sections: [],
    ...overrides,
  }
}

describe('workoutStore - edge cases', () => {
  beforeEach(() => {
    useWorkoutStore.getState().clearWorkout()
  })

  describe('setActiveSession edge cases', () => {
    it('replaces an existing active session with a new one', () => {
      const session1 = mockSession({ id: 'session-1' })
      const session2 = mockSession({ id: 'session-2', workout_day_id: 'day-2' })

      useWorkoutStore.getState().setActiveSession(session1)
      expect(useWorkoutStore.getState().activeSession?.id).toBe('session-1')

      useWorkoutStore.getState().setActiveSession(session2)
      expect(useWorkoutStore.getState().activeSession?.id).toBe('session-2')
    })

    it('setting null when already null is safe', () => {
      useWorkoutStore.getState().setActiveSession(null)
      expect(useWorkoutStore.getState().activeSession).toBeNull()
    })

    it('preserves session with all fields populated', () => {
      const session = mockSession({
        id: 'session-full',
        completed_at: '2024-01-15T11:00:00Z',
        notes: 'Great workout!',
        is_public: false,
      })

      useWorkoutStore.getState().setActiveSession(session)
      const stored = useWorkoutStore.getState().activeSession!
      expect(stored.completed_at).toBe('2024-01-15T11:00:00Z')
      expect(stored.notes).toBe('Great workout!')
      expect(stored.is_public).toBe(false)
    })
  })

  describe('setActiveWorkoutDay edge cases', () => {
    it('replaces an existing workout day', () => {
      const day1 = mockWorkoutDay({ id: 'day-1', name: 'Push' })
      const day2 = mockWorkoutDay({ id: 'day-2', name: 'Pull' })

      useWorkoutStore.getState().setActiveWorkoutDay(day1)
      expect(useWorkoutStore.getState().activeWorkoutDay?.name).toBe('Push')

      useWorkoutStore.getState().setActiveWorkoutDay(day2)
      expect(useWorkoutStore.getState().activeWorkoutDay?.name).toBe('Pull')
    })

    it('setting null when already null is safe', () => {
      useWorkoutStore.getState().setActiveWorkoutDay(null)
      expect(useWorkoutStore.getState().activeWorkoutDay).toBeNull()
    })

    it('preserves workout day with sections data', () => {
      const day = mockWorkoutDay({
        sections: [
          {
            id: 'section-1',
            workout_day_id: 'day-1',
            name: 'Main Lifts',
            display_order: 1,
            exercises: [
              {
                id: 'ex-1',
                section_id: 'section-1',
                exercise_name: 'Bench Press',
                display_order: 1,
                sets: 3,
                reps: '8-10',
                notes: null,
              },
            ],
          },
        ],
      })

      useWorkoutStore.getState().setActiveWorkoutDay(day)
      const stored = useWorkoutStore.getState().activeWorkoutDay!
      expect(stored.sections).toHaveLength(1)
      expect(stored.sections[0].exercises).toHaveLength(1)
      expect(stored.sections[0].exercises[0].exercise_name).toBe('Bench Press')
    })
  })

  describe('addCompletedSet edge cases', () => {
    it('adds a set with null weight and reps', () => {
      const set = mockExerciseSet({
        weight_used: null,
        reps_completed: null,
        completed: false,
      })

      useWorkoutStore.getState().addCompletedSet('ex-1', set)
      const stored = useWorkoutStore.getState().completedSets['ex-1']
      expect(stored).toHaveLength(1)
      expect(stored[0].weight_used).toBeNull()
      expect(stored[0].reps_completed).toBeNull()
    })

    it('adds sets for many different exercises', () => {
      for (let i = 0; i < 50; i++) {
        useWorkoutStore.getState().addCompletedSet(
          `ex-${i}`,
          mockExerciseSet({ id: `set-${i}`, plan_exercise_id: `ex-${i}` })
        )
      }

      const completedSets = useWorkoutStore.getState().completedSets
      expect(Object.keys(completedSets)).toHaveLength(50)
    })

    it('adds many sets to the same exercise', () => {
      for (let i = 0; i < 20; i++) {
        useWorkoutStore.getState().addCompletedSet(
          'ex-1',
          mockExerciseSet({ id: `set-${i}`, set_number: i + 1 })
        )
      }

      const sets = useWorkoutStore.getState().completedSets['ex-1']
      expect(sets).toHaveLength(20)
      expect(sets[0].set_number).toBe(1)
      expect(sets[19].set_number).toBe(20)
    })

    it('does not mutate previously stored sets when adding new ones', () => {
      const set1 = mockExerciseSet({ id: 'set-1', set_number: 1 })
      useWorkoutStore.getState().addCompletedSet('ex-1', set1)

      const firstSnapshot = useWorkoutStore.getState().completedSets['ex-1']

      const set2 = mockExerciseSet({ id: 'set-2', set_number: 2 })
      useWorkoutStore.getState().addCompletedSet('ex-1', set2)

      // The original snapshot should still have length 1 (immutable update)
      expect(firstSnapshot).toHaveLength(1)
      expect(useWorkoutStore.getState().completedSets['ex-1']).toHaveLength(2)
    })

    it('can add sets after clearing completed sets', () => {
      useWorkoutStore.getState().addCompletedSet('ex-1', mockExerciseSet())
      useWorkoutStore.getState().clearCompletedSets()
      useWorkoutStore.getState().addCompletedSet('ex-2', mockExerciseSet({ id: 'set-new' }))

      expect(useWorkoutStore.getState().completedSets['ex-1']).toBeUndefined()
      expect(useWorkoutStore.getState().completedSets['ex-2']).toHaveLength(1)
    })
  })

  describe('removeCompletedSets edge cases', () => {
    it('removes sets for one exercise without affecting others', () => {
      useWorkoutStore.getState().addCompletedSet('ex-1', mockExerciseSet({ id: 'set-1' }))
      useWorkoutStore.getState().addCompletedSet('ex-2', mockExerciseSet({ id: 'set-2' }))
      useWorkoutStore.getState().addCompletedSet('ex-3', mockExerciseSet({ id: 'set-3' }))

      useWorkoutStore.getState().removeCompletedSets('ex-2')

      expect(useWorkoutStore.getState().completedSets['ex-1']).toHaveLength(1)
      expect(useWorkoutStore.getState().completedSets['ex-2']).toBeUndefined()
      expect(useWorkoutStore.getState().completedSets['ex-3']).toHaveLength(1)
    })

    it('removes non-existent exercise id safely when other data exists', () => {
      useWorkoutStore.getState().addCompletedSet('ex-1', mockExerciseSet())

      useWorkoutStore.getState().removeCompletedSets('non-existent')

      expect(useWorkoutStore.getState().completedSets['ex-1']).toHaveLength(1)
    })

    it('calling removeCompletedSets twice for the same exercise is safe', () => {
      useWorkoutStore.getState().addCompletedSet('ex-1', mockExerciseSet())

      useWorkoutStore.getState().removeCompletedSets('ex-1')
      useWorkoutStore.getState().removeCompletedSets('ex-1')

      expect(useWorkoutStore.getState().completedSets['ex-1']).toBeUndefined()
    })

    it('removing all exercises one by one results in empty object', () => {
      useWorkoutStore.getState().addCompletedSet('ex-1', mockExerciseSet({ id: 'set-1' }))
      useWorkoutStore.getState().addCompletedSet('ex-2', mockExerciseSet({ id: 'set-2' }))

      useWorkoutStore.getState().removeCompletedSets('ex-1')
      useWorkoutStore.getState().removeCompletedSets('ex-2')

      expect(useWorkoutStore.getState().completedSets).toEqual({})
    })
  })

  describe('clearCompletedSets edge cases', () => {
    it('clearing when already empty is safe', () => {
      useWorkoutStore.getState().clearCompletedSets()
      expect(useWorkoutStore.getState().completedSets).toEqual({})
    })

    it('clearing multiple times in a row is safe', () => {
      useWorkoutStore.getState().addCompletedSet('ex-1', mockExerciseSet())
      useWorkoutStore.getState().clearCompletedSets()
      useWorkoutStore.getState().clearCompletedSets()
      expect(useWorkoutStore.getState().completedSets).toEqual({})
    })

    it('does not affect other state fields', () => {
      const session = mockSession()
      const day = mockWorkoutDay()

      useWorkoutStore.getState().setActiveSession(session)
      useWorkoutStore.getState().setActiveWorkoutDay(day)
      useWorkoutStore.getState().addCompletedSet('ex-1', mockExerciseSet())
      useWorkoutStore.getState().startRestTimer(60)

      useWorkoutStore.getState().clearCompletedSets()

      expect(useWorkoutStore.getState().completedSets).toEqual({})
      // Other state should be untouched
      expect(useWorkoutStore.getState().activeSession).toEqual(session)
      expect(useWorkoutStore.getState().activeWorkoutDay).toEqual(day)
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(60)
      expect(useWorkoutStore.getState().isRestTimerActive).toBe(true)
    })
  })

  describe('rest timer edge cases', () => {
    it('starting timer when one is already active replaces it', () => {
      useWorkoutStore.getState().startRestTimer(90)
      useWorkoutStore.getState().startRestTimer(120)

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(120)
      expect(state.restTimerInitialSeconds).toBe(120)
      expect(state.isRestTimerActive).toBe(true)
    })

    it('starting timer with 0 seconds', () => {
      useWorkoutStore.getState().startRestTimer(0)

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(0)
      expect(state.restTimerInitialSeconds).toBe(0)
      expect(state.isRestTimerActive).toBe(true)
    })

    it('starting timer with very large number of seconds', () => {
      useWorkoutStore.getState().startRestTimer(99999)

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(99999)
      expect(state.restTimerInitialSeconds).toBe(99999)
    })

    it('stopping when timer is not active is safe', () => {
      useWorkoutStore.getState().stopRestTimer()

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(0)
      expect(state.restTimerInitialSeconds).toBe(0)
      expect(state.isRestTimerActive).toBe(false)
    })

    it('pausing when timer is not active does not change state unexpectedly', () => {
      useWorkoutStore.getState().pauseRestTimer()

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(0)
      expect(state.isRestTimerActive).toBe(false)
    })

    it('pausing a paused timer is safe', () => {
      useWorkoutStore.getState().startRestTimer(60)
      useWorkoutStore.getState().pauseRestTimer()
      useWorkoutStore.getState().pauseRestTimer()

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(60)
      expect(state.isRestTimerActive).toBe(false)
    })

    it('reset after pause restores initial seconds and activates', () => {
      useWorkoutStore.getState().startRestTimer(45)
      useWorkoutStore.getState().decrementRestTimer() // 44
      useWorkoutStore.getState().pauseRestTimer()
      useWorkoutStore.getState().resetRestTimer()

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(45)
      expect(state.isRestTimerActive).toBe(true)
    })

    it('reset when timer was never started resets to 0 and activates', () => {
      useWorkoutStore.getState().resetRestTimer()

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(0) // initial is 0
      expect(state.isRestTimerActive).toBe(true) // activates even with 0
    })

    it('reset after stop resets to 0 since initial was cleared', () => {
      useWorkoutStore.getState().startRestTimer(90)
      useWorkoutStore.getState().stopRestTimer() // clears initial
      useWorkoutStore.getState().resetRestTimer()

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(0)
      expect(state.isRestTimerActive).toBe(true)
    })

    it('decrementing from 0 stays at 0 and deactivates', () => {
      // Timer at default state (0)
      useWorkoutStore.getState().decrementRestTimer()

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(0)
      expect(state.isRestTimerActive).toBe(false)
    })

    it('multiple decrements count down correctly', () => {
      useWorkoutStore.getState().startRestTimer(5)

      useWorkoutStore.getState().decrementRestTimer() // 4
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(4)
      expect(useWorkoutStore.getState().isRestTimerActive).toBe(true)

      useWorkoutStore.getState().decrementRestTimer() // 3
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(3)
      expect(useWorkoutStore.getState().isRestTimerActive).toBe(true)

      useWorkoutStore.getState().decrementRestTimer() // 2
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(2)
      expect(useWorkoutStore.getState().isRestTimerActive).toBe(true)

      useWorkoutStore.getState().decrementRestTimer() // 1
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(1)
      expect(useWorkoutStore.getState().isRestTimerActive).toBe(true)

      useWorkoutStore.getState().decrementRestTimer() // 0 -> stops
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(0)
      expect(useWorkoutStore.getState().isRestTimerActive).toBe(false)
    })

    it('decrement after pause still decrements (timer state is separate)', () => {
      useWorkoutStore.getState().startRestTimer(10)
      useWorkoutStore.getState().pauseRestTimer()

      // Decrement while paused
      useWorkoutStore.getState().decrementRestTimer()

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(9)
      // Note: decrement does not change isRestTimerActive (it only stops at 0)
      // Since we paused, isRestTimerActive is still false
      expect(state.isRestTimerActive).toBe(false)
    })

    it('preserves restTimerInitialSeconds through decrements', () => {
      useWorkoutStore.getState().startRestTimer(30)
      useWorkoutStore.getState().decrementRestTimer()
      useWorkoutStore.getState().decrementRestTimer()

      expect(useWorkoutStore.getState().restTimerInitialSeconds).toBe(30)
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(28)
    })
  })

  describe('clearWorkout edge cases', () => {
    it('clearing when already in initial state is safe', () => {
      useWorkoutStore.getState().clearWorkout()

      const state = useWorkoutStore.getState()
      expect(state.activeSession).toBeNull()
      expect(state.activeWorkoutDay).toBeNull()
      expect(state.completedSets).toEqual({})
      expect(state.restTimerSeconds).toBe(0)
      expect(state.restTimerInitialSeconds).toBe(0)
      expect(state.isRestTimerActive).toBe(false)
    })

    it('clearing twice in a row is safe', () => {
      useWorkoutStore.getState().setActiveSession(mockSession())
      useWorkoutStore.getState().addCompletedSet('ex-1', mockExerciseSet())

      useWorkoutStore.getState().clearWorkout()
      useWorkoutStore.getState().clearWorkout()

      expect(useWorkoutStore.getState().activeSession).toBeNull()
      expect(useWorkoutStore.getState().completedSets).toEqual({})
    })

    it('state can be populated after clear', () => {
      useWorkoutStore.getState().setActiveSession(mockSession({ id: 'old-session' }))
      useWorkoutStore.getState().clearWorkout()

      const newSession = mockSession({ id: 'new-session' })
      useWorkoutStore.getState().setActiveSession(newSession)
      useWorkoutStore.getState().addCompletedSet('ex-1', mockExerciseSet())
      useWorkoutStore.getState().startRestTimer(45)

      const state = useWorkoutStore.getState()
      expect(state.activeSession?.id).toBe('new-session')
      expect(state.completedSets['ex-1']).toHaveLength(1)
      expect(state.restTimerSeconds).toBe(45)
      expect(state.isRestTimerActive).toBe(true)
    })

    it('clears all state even when only some fields are populated', () => {
      // Only set session and timer, no workout day or sets
      useWorkoutStore.getState().setActiveSession(mockSession())
      useWorkoutStore.getState().startRestTimer(60)

      useWorkoutStore.getState().clearWorkout()

      const state = useWorkoutStore.getState()
      expect(state.activeSession).toBeNull()
      expect(state.activeWorkoutDay).toBeNull()
      expect(state.completedSets).toEqual({})
      expect(state.restTimerSeconds).toBe(0)
      expect(state.isRestTimerActive).toBe(false)
    })
  })

  describe('combined operations / interleaved actions', () => {
    it('full workout flow: set session -> add sets -> start timer -> clear', () => {
      const session = mockSession()
      const day = mockWorkoutDay()

      // Start workout
      useWorkoutStore.getState().setActiveSession(session)
      useWorkoutStore.getState().setActiveWorkoutDay(day)

      // Log some sets
      useWorkoutStore.getState().addCompletedSet('ex-1', mockExerciseSet({ id: 'set-1', set_number: 1 }))
      useWorkoutStore.getState().addCompletedSet('ex-1', mockExerciseSet({ id: 'set-2', set_number: 2 }))

      // Start rest timer
      useWorkoutStore.getState().startRestTimer(90)
      useWorkoutStore.getState().decrementRestTimer()
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(89)

      // Log more sets for a different exercise
      useWorkoutStore.getState().addCompletedSet('ex-2', mockExerciseSet({ id: 'set-3', plan_exercise_id: 'ex-2' }))

      // Verify mid-workout state
      expect(useWorkoutStore.getState().activeSession?.id).toBe('session-1')
      expect(useWorkoutStore.getState().completedSets['ex-1']).toHaveLength(2)
      expect(useWorkoutStore.getState().completedSets['ex-2']).toHaveLength(1)

      // Clear workout
      useWorkoutStore.getState().clearWorkout()

      const state = useWorkoutStore.getState()
      expect(state.activeSession).toBeNull()
      expect(state.activeWorkoutDay).toBeNull()
      expect(state.completedSets).toEqual({})
      expect(state.restTimerSeconds).toBe(0)
      expect(state.isRestTimerActive).toBe(false)
    })

    it('removing sets while timer is running does not affect timer', () => {
      useWorkoutStore.getState().addCompletedSet('ex-1', mockExerciseSet())
      useWorkoutStore.getState().startRestTimer(60)

      useWorkoutStore.getState().removeCompletedSets('ex-1')

      expect(useWorkoutStore.getState().completedSets['ex-1']).toBeUndefined()
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(60)
      expect(useWorkoutStore.getState().isRestTimerActive).toBe(true)
    })

    it('changing session does not affect completed sets', () => {
      useWorkoutStore.getState().setActiveSession(mockSession({ id: 'session-1' }))
      useWorkoutStore.getState().addCompletedSet('ex-1', mockExerciseSet())

      useWorkoutStore.getState().setActiveSession(mockSession({ id: 'session-2' }))

      expect(useWorkoutStore.getState().completedSets['ex-1']).toHaveLength(1)
    })

    it('timer pause -> decrement -> reset cycle', () => {
      useWorkoutStore.getState().startRestTimer(30)
      useWorkoutStore.getState().decrementRestTimer() // 29
      useWorkoutStore.getState().pauseRestTimer()

      expect(useWorkoutStore.getState().restTimerSeconds).toBe(29)
      expect(useWorkoutStore.getState().isRestTimerActive).toBe(false)

      useWorkoutStore.getState().decrementRestTimer() // 28 (decrement works even while paused)
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(28)

      useWorkoutStore.getState().resetRestTimer()
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(30)
      expect(useWorkoutStore.getState().isRestTimerActive).toBe(true)
    })
  })

  describe('store subscription', () => {
    it('notifies on setActiveSession', () => {
      const listener = vi.fn()
      const unsub = useWorkoutStore.subscribe(listener)

      useWorkoutStore.getState().setActiveSession(mockSession())
      expect(listener).toHaveBeenCalledTimes(1)

      unsub()
    })

    it('notifies on addCompletedSet', () => {
      const listener = vi.fn()
      const unsub = useWorkoutStore.subscribe(listener)

      useWorkoutStore.getState().addCompletedSet('ex-1', mockExerciseSet())
      expect(listener).toHaveBeenCalledTimes(1)

      unsub()
    })

    it('notifies on each decrement', () => {
      useWorkoutStore.getState().startRestTimer(5)

      const listener = vi.fn()
      const unsub = useWorkoutStore.subscribe(listener)

      useWorkoutStore.getState().decrementRestTimer()
      useWorkoutStore.getState().decrementRestTimer()
      useWorkoutStore.getState().decrementRestTimer()

      expect(listener).toHaveBeenCalledTimes(3)

      unsub()
    })
  })
})
