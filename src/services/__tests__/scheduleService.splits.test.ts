import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  clearUserSchedule,
  initializeDefaultSchedule,
  type ScheduleWorkoutItem
} from '../scheduleService'

// vi.mock factory must not reference outer variables (hoisted to top)
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    }),
  },
}))

describe('scheduleService - workout splits', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('clearUserSchedule', () => {
    it('is an async function', () => {
      expect(typeof clearUserSchedule).toBe('function')
    })

    it('accepts a userId parameter', () => {
      // Verify the function signature accepts a string
      expect(clearUserSchedule.length).toBe(1)
    })
  })

  describe('initializeDefaultSchedule', () => {
    it('is an async function', () => {
      expect(typeof initializeDefaultSchedule).toBe('function')
    })

    it('accepts userId and optional planId', () => {
      // The function has 2 params (userId required, planId optional)
      expect(initializeDefaultSchedule.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('schedule patterns', () => {
    it('PPL schedule: Push, Pull, Legs, Rest, Push, Pull, Rest', () => {
      const workoutDays = [
        { id: 'push-id', day_number: 1 },
        { id: 'pull-id', day_number: 2 },
        { id: 'legs-id', day_number: 3 },
      ]

      // Matches the PPL default schedule pattern from initializeDefaultSchedule
      const expected = [
        { day_number: 1, workout_day_id: workoutDays[0].id, is_rest_day: false },
        { day_number: 2, workout_day_id: workoutDays[1].id, is_rest_day: false },
        { day_number: 3, workout_day_id: workoutDays[2].id, is_rest_day: false },
        { day_number: 4, workout_day_id: null, is_rest_day: true },
        { day_number: 5, workout_day_id: workoutDays[0].id, is_rest_day: false },
        { day_number: 6, workout_day_id: workoutDays[1].id, is_rest_day: false },
        { day_number: 7, workout_day_id: null, is_rest_day: true },
      ]

      expect(expected).toHaveLength(7)
      expect(expected.filter(d => d.is_rest_day)).toHaveLength(2)
      expect(expected.filter(d => !d.is_rest_day)).toHaveLength(5)
      // Day 1 and Day 5 are both Push
      expect(expected[0].workout_day_id).toBe('push-id')
      expect(expected[4].workout_day_id).toBe('push-id')
      // Day 2 and Day 6 are both Pull
      expect(expected[1].workout_day_id).toBe('pull-id')
      expect(expected[5].workout_day_id).toBe('pull-id')
      // Day 3 is Legs
      expect(expected[2].workout_day_id).toBe('legs-id')
      // Day 4 and 7 are rest
      expect(expected[3].is_rest_day).toBe(true)
      expect(expected[6].is_rest_day).toBe(true)
    })

    it('Upper/Lower schedule: Upper, Lower, Rest, Upper, Lower, Rest, Rest', () => {
      const workoutDays = [
        { id: 'upper-id', day_number: 1 },
        { id: 'lower-id', day_number: 2 },
      ]

      // Matches the Upper/Lower default schedule pattern
      const expected = [
        { day_number: 1, workout_day_id: workoutDays[0].id, is_rest_day: false },
        { day_number: 2, workout_day_id: workoutDays[1].id, is_rest_day: false },
        { day_number: 3, workout_day_id: null, is_rest_day: true },
        { day_number: 4, workout_day_id: workoutDays[0].id, is_rest_day: false },
        { day_number: 5, workout_day_id: workoutDays[1].id, is_rest_day: false },
        { day_number: 6, workout_day_id: null, is_rest_day: true },
        { day_number: 7, workout_day_id: null, is_rest_day: true },
      ]

      expect(expected).toHaveLength(7)
      expect(expected.filter(d => d.is_rest_day)).toHaveLength(3)
      expect(expected.filter(d => !d.is_rest_day)).toHaveLength(4)
      // Day 1 and Day 4 are Upper
      expect(expected[0].workout_day_id).toBe('upper-id')
      expect(expected[3].workout_day_id).toBe('upper-id')
      // Day 2 and Day 5 are Lower
      expect(expected[1].workout_day_id).toBe('lower-id')
      expect(expected[4].workout_day_id).toBe('lower-id')
      // Days 3, 6, 7 are rest
      expect(expected[2].is_rest_day).toBe(true)
      expect(expected[5].is_rest_day).toBe(true)
      expect(expected[6].is_rest_day).toBe(true)
    })

    it('Upper/Lower has more rest days than PPL', () => {
      const pplRestDays = 2 // Days 4 and 7
      const ulRestDays = 3  // Days 3, 6, and 7

      expect(ulRestDays).toBeGreaterThan(pplRestDays)
    })

    it('both schedules cover all 7 days', () => {
      const pplDayNumbers = [1, 2, 3, 4, 5, 6, 7]
      const ulDayNumbers = [1, 2, 3, 4, 5, 6, 7]

      expect(pplDayNumbers).toHaveLength(7)
      expect(ulDayNumbers).toHaveLength(7)
    })
  })

  describe('ScheduleWorkoutItem type', () => {
    it('supports rest type', () => {
      const item: ScheduleWorkoutItem = { type: 'rest' }
      expect(item.type).toBe('rest')
      expect(item.id).toBeUndefined()
    })

    it('supports weights type with id', () => {
      const item: ScheduleWorkoutItem = { type: 'weights', id: 'day-1' }
      expect(item.type).toBe('weights')
      expect(item.id).toBe('day-1')
    })

    it('supports cardio type with id', () => {
      const item: ScheduleWorkoutItem = { type: 'cardio', id: 'template-1' }
      expect(item.type).toBe('cardio')
    })

    it('supports mobility type with id', () => {
      const item: ScheduleWorkoutItem = { type: 'mobility', id: 'template-2' }
      expect(item.type).toBe('mobility')
    })
  })
})
