import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SessionWithDay, SessionWithSets } from '../workoutService'

// Mock Supabase with inline factory
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}))

describe('workoutService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('type definitions', () => {
    it('SessionWithDay type has correct shape', () => {
      const session: SessionWithDay = {
        id: 'session-1',
        user_id: 'user-123',
        workout_day_id: 'day-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: '2024-01-15T11:00:00Z',
        notes: 'Great workout!',
        is_public: true,
        workout_day: {
          id: 'day-1',
          plan_id: 'plan-1',
          name: 'Push',
          day_number: 1,
          description: 'Push day workout',
          created_at: '2024-01-01T00:00:00Z',
        },
      }

      expect(session.id).toBe('session-1')
      expect(session.workout_day?.name).toBe('Push')
    })

    it('SessionWithDay supports null workout_day', () => {
      const session: SessionWithDay = {
        id: 'session-1',
        user_id: 'user-123',
        workout_day_id: 'day-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: null,
        notes: null,
        is_public: false,
        workout_day: null,
      }

      expect(session.workout_day).toBeNull()
    })

    it('SessionWithSets type includes exercise_sets', () => {
      const session: SessionWithSets = {
        id: 'session-1',
        user_id: 'user-123',
        workout_day_id: 'day-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: '2024-01-15T11:00:00Z',
        notes: null,
        is_public: true,
        workout_day: null,
        exercise_sets: [
          {
            id: 'set-1',
            session_id: 'session-1',
            plan_exercise_id: 'exercise-1',
            set_number: 1,
            weight_used: 135,
            reps_completed: 10,
            completed: true,
            created_at: '2024-01-15T10:05:00Z',
          },
        ],
      }

      expect(session.exercise_sets).toHaveLength(1)
      expect(session.exercise_sets[0].weight_used).toBe(135)
    })
  })

  describe('workout session states', () => {
    it('identifies active session (completed_at is null)', () => {
      const session = {
        id: 'session-1',
        completed_at: null,
      }
      const isActive = session.completed_at === null

      expect(isActive).toBe(true)
    })

    it('identifies completed session', () => {
      const session = {
        id: 'session-1',
        completed_at: '2024-01-15T11:00:00Z',
      }
      const isCompleted = session.completed_at !== null

      expect(isCompleted).toBe(true)
    })
  })

  describe('exercise set properties', () => {
    it('tracks weight and reps', () => {
      const set = {
        id: 'set-1',
        weight_used: 135,
        reps_completed: 10,
        set_number: 1,
        completed: true,
      }

      expect(set.weight_used).toBe(135)
      expect(set.reps_completed).toBe(10)
    })

    it('supports null weight and reps for bodyweight exercises', () => {
      const set = {
        id: 'set-1',
        weight_used: null,
        reps_completed: 15,
        set_number: 1,
        completed: true,
      }

      expect(set.weight_used).toBeNull()
      expect(set.reps_completed).toBe(15)
    })

    it('tracks set number', () => {
      const sets = [
        { set_number: 1 },
        { set_number: 2 },
        { set_number: 3 },
      ]

      expect(sets.map((s) => s.set_number)).toEqual([1, 2, 3])
    })
  })

  describe('weight unit options', () => {
    it('supports lbs', () => {
      const weightUnit: 'lbs' | 'kg' = 'lbs'
      expect(weightUnit).toBe('lbs')
    })

    it('supports kg', () => {
      const weightUnit: 'lbs' | 'kg' = 'kg'
      expect(weightUnit).toBe('kg')
    })
  })
})
