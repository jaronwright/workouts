import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getDayName,
  type WorkoutTemplate,
  type ScheduleDay,
  type UpdateScheduleDayData
} from '../scheduleService'

// Mock Supabase
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis()
    })
  }
}))

describe('scheduleService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDayName', () => {
    it('returns "Day 1" for day number 1', () => {
      expect(getDayName(1)).toBe('Day 1')
    })

    it('returns "Day 7" for day number 7', () => {
      expect(getDayName(7)).toBe('Day 7')
    })

    it('returns correct format for any day number', () => {
      for (let i = 1; i <= 7; i++) {
        expect(getDayName(i)).toBe(`Day ${i}`)
      }
    })
  })

  describe('type definitions', () => {
    it('WorkoutTemplate type has correct shape', () => {
      const template: WorkoutTemplate = {
        id: 'template-1',
        name: 'Swimming',
        type: 'cardio',
        category: 'swim',
        description: 'Pool laps',
        icon: 'waves',
        duration_minutes: 30,
        created_at: '2024-01-01T00:00:00Z'
      }

      expect(template.id).toBeDefined()
      expect(template.name).toBeDefined()
      expect(template.type).toBe('cardio')
    })

    it('ScheduleDay type has correct shape', () => {
      const scheduleDay: ScheduleDay = {
        id: 'schedule-1',
        user_id: 'user-1',
        day_number: 1,
        template_id: null,
        workout_day_id: 'day-1',
        is_rest_day: false,
        sort_order: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        template: null,
        workout_day: {
          id: 'day-1',
          name: 'Push',
          day_number: 1
        }
      }

      expect(scheduleDay.day_number).toBe(1)
      expect(scheduleDay.is_rest_day).toBe(false)
      expect(scheduleDay.workout_day?.name).toBe('Push')
    })

    it('UpdateScheduleDayData type supports rest day', () => {
      const restDayData: UpdateScheduleDayData = {
        is_rest_day: true
      }

      expect(restDayData.is_rest_day).toBe(true)
    })

    it('UpdateScheduleDayData type supports workout day', () => {
      const workoutData: UpdateScheduleDayData = {
        workout_day_id: 'day-1',
        is_rest_day: false
      }

      expect(workoutData.workout_day_id).toBe('day-1')
    })

    it('UpdateScheduleDayData type supports template', () => {
      const templateData: UpdateScheduleDayData = {
        template_id: 'template-1',
        is_rest_day: false
      }

      expect(templateData.template_id).toBe('template-1')
    })
  })

  describe('WorkoutTemplate types', () => {
    it('supports weights type', () => {
      const template: WorkoutTemplate = {
        id: '1',
        name: 'Push Day',
        type: 'weights',
        category: 'push',
        description: null,
        icon: null,
        duration_minutes: null,
        created_at: '2024-01-01T00:00:00Z'
      }
      expect(template.type).toBe('weights')
    })

    it('supports cardio type', () => {
      const template: WorkoutTemplate = {
        id: '2',
        name: 'Running',
        type: 'cardio',
        category: 'run',
        description: 'Outdoor run',
        icon: 'footprints',
        duration_minutes: 30,
        created_at: '2024-01-01T00:00:00Z'
      }
      expect(template.type).toBe('cardio')
    })

    it('supports mobility type', () => {
      const template: WorkoutTemplate = {
        id: '3',
        name: 'Hip Mobility',
        type: 'mobility',
        category: 'hip_knee_ankle',
        description: 'Lower body mobility',
        icon: 'activity',
        duration_minutes: 15,
        created_at: '2024-01-01T00:00:00Z'
      }
      expect(template.type).toBe('mobility')
    })
  })
})
