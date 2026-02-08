import { describe, it, expect, beforeEach } from 'vitest'
import { useWorkoutStore } from '../workoutStore'
import type { WorkoutSession, ExerciseSet } from '@/types/workout'

describe('workoutStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useWorkoutStore.setState({
      activeSession: null,
      activeWorkoutDay: null,
      completedSets: {},
      restTimerSeconds: 0,
      restTimerInitialSeconds: 0,
      isRestTimerActive: false
    })
  })

  describe('session management', () => {
    it('sets active session', () => {
      const mockSession: WorkoutSession = {
        id: 'session-1',
        user_id: 'user-1',
        workout_day_id: 'day-1',
        started_at: '2024-01-01T10:00:00Z',
        completed_at: null,
        notes: null,
        is_public: true
      }

      useWorkoutStore.getState().setActiveSession(mockSession)

      expect(useWorkoutStore.getState().activeSession).toEqual(mockSession)
    })

    it('clears active session', () => {
      useWorkoutStore.getState().setActiveSession({
        id: 'session-1',
        user_id: 'user-1',
        workout_day_id: 'day-1',
        started_at: '2024-01-01T10:00:00Z',
        completed_at: null,
        notes: null,
        is_public: true
      })
      useWorkoutStore.getState().setActiveSession(null)

      expect(useWorkoutStore.getState().activeSession).toBe(null)
    })
  })

  describe('completed sets management', () => {
    it('adds a completed set to an exercise', () => {
      const mockSet: ExerciseSet = {
        id: 'set-1',
        session_id: 'session-1',
        plan_exercise_id: 'exercise-1',
        set_number: 1,
        weight_used: 135,
        reps_completed: 10,
        completed: true,
        created_at: '2024-01-01T10:05:00Z'
      }

      useWorkoutStore.getState().addCompletedSet('exercise-1', mockSet)

      const sets = useWorkoutStore.getState().completedSets['exercise-1']
      expect(sets).toHaveLength(1)
      expect(sets![0]).toEqual(mockSet)
    })

    it('adds multiple sets to the same exercise', () => {
      const mockSet1: ExerciseSet = {
        id: 'set-1',
        session_id: 'session-1',
        plan_exercise_id: 'exercise-1',
        set_number: 1,
        weight_used: 135,
        reps_completed: 10,
        completed: true,
        created_at: '2024-01-01T10:05:00Z'
      }
      const mockSet2: ExerciseSet = {
        id: 'set-2',
        session_id: 'session-1',
        plan_exercise_id: 'exercise-1',
        set_number: 2,
        weight_used: 140,
        reps_completed: 8,
        completed: true,
        created_at: '2024-01-01T10:07:00Z'
      }

      useWorkoutStore.getState().addCompletedSet('exercise-1', mockSet1)
      useWorkoutStore.getState().addCompletedSet('exercise-1', mockSet2)

      const sets = useWorkoutStore.getState().completedSets['exercise-1']
      expect(sets).toHaveLength(2)
    })

    it('clears completed sets', () => {
      useWorkoutStore.getState().addCompletedSet('exercise-1', {
        id: 'set-1',
        session_id: 'session-1',
        plan_exercise_id: 'exercise-1',
        set_number: 1,
        weight_used: 135,
        reps_completed: 10,
        completed: true,
        created_at: '2024-01-01T10:05:00Z'
      })
      useWorkoutStore.getState().clearCompletedSets()

      expect(Object.keys(useWorkoutStore.getState().completedSets).length).toBe(0)
    })
  })

  describe('rest timer', () => {
    it('starts rest timer with given seconds', () => {
      useWorkoutStore.getState().startRestTimer(90)

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(90)
      expect(state.restTimerInitialSeconds).toBe(90)
      expect(state.isRestTimerActive).toBe(true)
    })

    it('stops rest timer and resets values', () => {
      useWorkoutStore.getState().startRestTimer(90)
      useWorkoutStore.getState().stopRestTimer()

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(0)
      expect(state.restTimerInitialSeconds).toBe(0)
      expect(state.isRestTimerActive).toBe(false)
    })

    it('pauses rest timer without resetting seconds', () => {
      useWorkoutStore.getState().startRestTimer(90)
      useWorkoutStore.getState().pauseRestTimer()

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(90)
      expect(state.isRestTimerActive).toBe(false)
    })

    it('resets rest timer to initial value', () => {
      useWorkoutStore.getState().startRestTimer(90)
      useWorkoutStore.getState().decrementRestTimer()
      useWorkoutStore.getState().decrementRestTimer()
      useWorkoutStore.getState().resetRestTimer()

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(90)
      expect(state.isRestTimerActive).toBe(true)
    })

    it('decrements rest timer by 1 second', () => {
      useWorkoutStore.getState().startRestTimer(90)
      useWorkoutStore.getState().decrementRestTimer()

      expect(useWorkoutStore.getState().restTimerSeconds).toBe(89)
    })

    it('stops timer when decrementing to 0', () => {
      useWorkoutStore.getState().startRestTimer(1)
      useWorkoutStore.getState().decrementRestTimer()

      const state = useWorkoutStore.getState()
      expect(state.restTimerSeconds).toBe(0)
      expect(state.isRestTimerActive).toBe(false)
    })
  })

  describe('clearWorkout', () => {
    it('resets all workout state', () => {
      // Set up some state
      useWorkoutStore.getState().setActiveSession({
        id: 'session-1',
        user_id: 'user-1',
        workout_day_id: 'day-1',
        started_at: '2024-01-01T10:00:00Z',
        completed_at: null,
        notes: null,
        is_public: true
      })
      useWorkoutStore.getState().addCompletedSet('exercise-1', {
        id: 'set-1',
        session_id: 'session-1',
        plan_exercise_id: 'exercise-1',
        set_number: 1,
        weight_used: 135,
        reps_completed: 10,
        completed: true,
        created_at: '2024-01-01T10:05:00Z'
      })
      useWorkoutStore.getState().startRestTimer(90)

      // Clear everything
      useWorkoutStore.getState().clearWorkout()

      const state = useWorkoutStore.getState()
      expect(state.activeSession).toBe(null)
      expect(state.activeWorkoutDay).toBe(null)
      expect(Object.keys(state.completedSets).length).toBe(0)
      expect(state.restTimerSeconds).toBe(0)
      expect(state.restTimerInitialSeconds).toBe(0)
      expect(state.isRestTimerActive).toBe(false)
    })
  })
})
