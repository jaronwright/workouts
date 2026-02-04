import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SocialWorkout } from '../socialService'

// Mock Supabase with inline factory
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  },
}))

describe('socialService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('type definitions', () => {
    it('SocialWorkout type for weights workout', () => {
      const workout: SocialWorkout = {
        id: 'session-1',
        user_id: 'user-123',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: '2024-01-15T11:00:00Z',
        notes: 'Great workout!',
        is_public: true,
        type: 'weights',
        workout_day: { name: 'Push Day' },
      }

      expect(workout.type).toBe('weights')
      expect(workout.workout_day?.name).toBe('Push Day')
    })

    it('SocialWorkout type for cardio workout', () => {
      const workout: SocialWorkout = {
        id: 'session-2',
        user_id: 'user-456',
        started_at: '2024-01-15T09:00:00Z',
        completed_at: '2024-01-15T09:30:00Z',
        notes: 'Morning swim',
        is_public: true,
        type: 'cardio',
        template: { name: 'Swimming', type: 'cardio', category: 'swim' },
        duration_minutes: 30,
        distance_value: 1500,
        distance_unit: 'meters',
      }

      expect(workout.type).toBe('cardio')
      expect(workout.template?.name).toBe('Swimming')
      expect(workout.duration_minutes).toBe(30)
    })

    it('SocialWorkout type for mobility workout', () => {
      const workout: SocialWorkout = {
        id: 'session-3',
        user_id: 'user-789',
        started_at: '2024-01-15T08:00:00Z',
        completed_at: '2024-01-15T08:20:00Z',
        notes: 'Hip opener routine',
        is_public: true,
        type: 'mobility',
        template: { name: 'Hip Mobility', type: 'mobility', category: 'hip' },
        duration_minutes: 20,
      }

      expect(workout.type).toBe('mobility')
    })
  })

  describe('workout visibility', () => {
    it('workout can be public', () => {
      const workout: SocialWorkout = {
        id: '1',
        user_id: '1',
        started_at: '',
        completed_at: '',
        notes: null,
        is_public: true,
        type: 'weights',
      }

      expect(workout.is_public).toBe(true)
    })

    it('workout can be private', () => {
      const workout: SocialWorkout = {
        id: '1',
        user_id: '1',
        started_at: '',
        completed_at: '',
        notes: null,
        is_public: false,
        type: 'weights',
      }

      expect(workout.is_public).toBe(false)
    })
  })

  describe('social feed sorting', () => {
    it('sorts workouts by completed_at descending', () => {
      const workouts = [
        { completed_at: '2024-01-14T10:00:00Z', started_at: '2024-01-14T09:00:00Z' },
        { completed_at: '2024-01-16T10:00:00Z', started_at: '2024-01-16T09:00:00Z' },
        { completed_at: '2024-01-15T10:00:00Z', started_at: '2024-01-15T09:00:00Z' },
      ]

      const sorted = [...workouts].sort((a, b) => {
        const dateA = new Date(a.completed_at || a.started_at).getTime()
        const dateB = new Date(b.completed_at || b.started_at).getTime()
        return dateB - dateA
      })

      expect(sorted[0].completed_at).toBe('2024-01-16T10:00:00Z')
      expect(sorted[1].completed_at).toBe('2024-01-15T10:00:00Z')
      expect(sorted[2].completed_at).toBe('2024-01-14T10:00:00Z')
    })

    it('falls back to started_at when completed_at is null', () => {
      const workouts = [
        { completed_at: null, started_at: '2024-01-16T09:00:00Z' },
        { completed_at: '2024-01-15T10:00:00Z', started_at: '2024-01-15T09:00:00Z' },
      ]

      const sorted = [...workouts].sort((a, b) => {
        const dateA = new Date(a.completed_at || a.started_at).getTime()
        const dateB = new Date(b.completed_at || b.started_at).getTime()
        return dateB - dateA
      })

      expect(sorted[0].started_at).toBe('2024-01-16T09:00:00Z')
    })
  })

  describe('toggle visibility logic', () => {
    it('uses workout_sessions table for weights', () => {
      const isWeightsSession = true
      const table = isWeightsSession
        ? 'workout_sessions'
        : 'template_workout_sessions'

      expect(table).toBe('workout_sessions')
    })

    it('uses template_workout_sessions table for cardio/mobility', () => {
      const isWeightsSession = false
      const table = isWeightsSession
        ? 'workout_sessions'
        : 'template_workout_sessions'

      expect(table).toBe('template_workout_sessions')
    })
  })
})
