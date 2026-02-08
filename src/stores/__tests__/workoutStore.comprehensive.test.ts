import { describe, it, expect, beforeEach } from 'vitest'
import { useWorkoutStore } from '@/stores/workoutStore'
import type { ExerciseSet, WorkoutSession, WorkoutDayWithSections } from '@/types/workout'

const mockSession: WorkoutSession = {
  id: 'session-1',
  user_id: 'user-1',
  workout_day_id: 'day-1',
  started_at: '2024-01-15T10:00:00Z',
  completed_at: null,
  duration_minutes: null
}

const mockSet: ExerciseSet = {
  id: 'set-1',
  session_id: 'session-1',
  plan_exercise_id: 'ex-1',
  set_number: 1,
  reps_completed: 10,
  weight_used: 135,
  created_at: '2024-01-15T10:05:00Z'
}

const mockWorkoutDay: WorkoutDayWithSections = {
  id: 'day-1',
  plan_id: 'plan-1',
  name: 'Push',
  day_number: 1,
  sections: []
}

describe('workoutStore', () => {
  beforeEach(() => {
    useWorkoutStore.getState().clearWorkout()
  })

  describe('initial state', () => {
    it('starts with null activeSession', () => {
      expect(useWorkoutStore.getState().activeSession).toBeNull()
    })

    it('starts with null activeWorkoutDay', () => {
      expect(useWorkoutStore.getState().activeWorkoutDay).toBeNull()
    })

    it('starts with empty completedSets', () => {
      expect(useWorkoutStore.getState().completedSets).toEqual({})
    })

    it('starts with rest timer at 0', () => {
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(0)
    })

    it('starts with rest timer inactive', () => {
      expect(useWorkoutStore.getState().isRestTimerActive).toBe(false)
    })
  })

  describe('setActiveSession', () => {
    it('sets active session', () => {
      useWorkoutStore.getState().setActiveSession(mockSession)
      expect(useWorkoutStore.getState().activeSession).toEqual(mockSession)
    })

    it('clears active session with null', () => {
      useWorkoutStore.getState().setActiveSession(mockSession)
      useWorkoutStore.getState().setActiveSession(null)
      expect(useWorkoutStore.getState().activeSession).toBeNull()
    })
  })

  describe('setActiveWorkoutDay', () => {
    it('sets active workout day', () => {
      useWorkoutStore.getState().setActiveWorkoutDay(mockWorkoutDay)
      expect(useWorkoutStore.getState().activeWorkoutDay).toEqual(mockWorkoutDay)
    })

    it('clears workout day with null', () => {
      useWorkoutStore.getState().setActiveWorkoutDay(mockWorkoutDay)
      useWorkoutStore.getState().setActiveWorkoutDay(null)
      expect(useWorkoutStore.getState().activeWorkoutDay).toBeNull()
    })
  })

  describe('completedSets', () => {
    it('adds a completed set for a new exercise', () => {
      useWorkoutStore.getState().addCompletedSet('ex-1', mockSet)
      expect(useWorkoutStore.getState().completedSets['ex-1']).toEqual([mockSet])
    })

    it('appends sets to existing exercise', () => {
      const set2: ExerciseSet = { ...mockSet, id: 'set-2', set_number: 2 }
      useWorkoutStore.getState().addCompletedSet('ex-1', mockSet)
      useWorkoutStore.getState().addCompletedSet('ex-1', set2)
      expect(useWorkoutStore.getState().completedSets['ex-1']).toHaveLength(2)
    })

    it('tracks sets for multiple exercises independently', () => {
      const set2: ExerciseSet = { ...mockSet, id: 'set-2', plan_exercise_id: 'ex-2' }
      useWorkoutStore.getState().addCompletedSet('ex-1', mockSet)
      useWorkoutStore.getState().addCompletedSet('ex-2', set2)
      expect(Object.keys(useWorkoutStore.getState().completedSets)).toHaveLength(2)
      expect(useWorkoutStore.getState().completedSets['ex-1']).toHaveLength(1)
      expect(useWorkoutStore.getState().completedSets['ex-2']).toHaveLength(1)
    })

    it('removes completed sets for an exercise', () => {
      useWorkoutStore.getState().addCompletedSet('ex-1', mockSet)
      useWorkoutStore.getState().addCompletedSet('ex-2', { ...mockSet, id: 'set-2' })
      useWorkoutStore.getState().removeCompletedSets('ex-1')
      expect(useWorkoutStore.getState().completedSets['ex-1']).toBeUndefined()
      expect(useWorkoutStore.getState().completedSets['ex-2']).toBeDefined()
    })

    it('clears all completed sets', () => {
      useWorkoutStore.getState().addCompletedSet('ex-1', mockSet)
      useWorkoutStore.getState().addCompletedSet('ex-2', { ...mockSet, id: 'set-2' })
      useWorkoutStore.getState().clearCompletedSets()
      expect(useWorkoutStore.getState().completedSets).toEqual({})
    })

    it('removeCompletedSets is safe for non-existent exercise', () => {
      useWorkoutStore.getState().removeCompletedSets('non-existent')
      expect(useWorkoutStore.getState().completedSets).toEqual({})
    })
  })

  describe('rest timer', () => {
    it('starts timer with given seconds', () => {
      useWorkoutStore.getState().startRestTimer(90)
      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(90)
      expect(state.restTimerInitialSeconds).toBe(90)
      expect(state.isRestTimerActive).toBe(true)
    })

    it('stops timer and resets all timer state', () => {
      useWorkoutStore.getState().startRestTimer(90)
      useWorkoutStore.getState().stopRestTimer()
      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(0)
      expect(state.restTimerInitialSeconds).toBe(0)
      expect(state.isRestTimerActive).toBe(false)
    })

    it('pauses timer without resetting seconds', () => {
      useWorkoutStore.getState().startRestTimer(90)
      useWorkoutStore.getState().decrementRestTimer() // 89
      useWorkoutStore.getState().pauseRestTimer()
      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(89)
      expect(state.isRestTimerActive).toBe(false)
    })

    it('resets timer to initial value and resumes', () => {
      useWorkoutStore.getState().startRestTimer(90)
      useWorkoutStore.getState().decrementRestTimer() // 89
      useWorkoutStore.getState().decrementRestTimer() // 88
      useWorkoutStore.getState().resetRestTimer()
      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(90)
      expect(state.isRestTimerActive).toBe(true)
    })

    it('decrements timer by 1 second', () => {
      useWorkoutStore.getState().startRestTimer(60)
      useWorkoutStore.getState().decrementRestTimer()
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(59)
    })

    it('auto-stops when timer reaches 0', () => {
      useWorkoutStore.getState().startRestTimer(1)
      useWorkoutStore.getState().decrementRestTimer()
      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(0)
      expect(state.isRestTimerActive).toBe(false)
    })

    it('decrement at 0 stays at 0', () => {
      useWorkoutStore.getState().startRestTimer(0)
      useWorkoutStore.getState().decrementRestTimer()
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(0)
    })
  })

  describe('clearWorkout', () => {
    it('resets all workout state', () => {
      // Set up various state
      useWorkoutStore.getState().setActiveSession(mockSession)
      useWorkoutStore.getState().setActiveWorkoutDay(mockWorkoutDay)
      useWorkoutStore.getState().addCompletedSet('ex-1', mockSet)
      useWorkoutStore.getState().startRestTimer(120)

      // Clear everything
      useWorkoutStore.getState().clearWorkout()

      const state = useWorkoutStore.getState()
      expect(state.activeSession).toBeNull()
      expect(state.activeWorkoutDay).toBeNull()
      expect(state.completedSets).toEqual({})
      expect(state.restTimerSeconds).toBe(0)
      expect(state.restTimerInitialSeconds).toBe(0)
      expect(state.isRestTimerActive).toBe(false)
    })
  })

  describe('completedSets is JSON-serializable (Record, not Map)', () => {
    it('serializes and deserializes correctly', () => {
      useWorkoutStore.getState().addCompletedSet('ex-1', mockSet)
      const json = JSON.stringify(useWorkoutStore.getState().completedSets)
      const parsed = JSON.parse(json)
      expect(parsed['ex-1']).toHaveLength(1)
      expect(parsed['ex-1'][0].id).toBe('set-1')
    })
  })
})
