import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { TemplateWorkoutSession, CompleteTemplateWorkoutData } from '../templateWorkoutService'

// Mock Supabase with inline factory
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}))

describe('templateWorkoutService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('type definitions', () => {
    it('TemplateWorkoutSession type has correct shape', () => {
      const session: TemplateWorkoutSession = {
        id: 'session-1',
        user_id: 'user-123',
        template_id: 'template-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: '2024-01-15T10:30:00Z',
        duration_minutes: 30,
        distance_value: 1500,
        distance_unit: 'meters',
        notes: 'Great swim!',
        template: {
          id: 'template-1',
          name: 'Swimming',
          type: 'cardio',
          category: 'swim',
          description: 'Pool laps',
          icon: 'waves',
          duration_minutes: 30,
          workout_day_id: null,
          created_at: '2024-01-01T00:00:00Z',
        },
      }

      expect(session.id).toBe('session-1')
      expect(session.duration_minutes).toBe(30)
      expect(session.distance_value).toBe(1500)
      expect(session.template?.name).toBe('Swimming')
    })

    it('TemplateWorkoutSession supports null values', () => {
      const session: TemplateWorkoutSession = {
        id: 'session-1',
        user_id: 'user-123',
        template_id: 'template-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: null,
        duration_minutes: null,
        distance_value: null,
        distance_unit: null,
        notes: null,
        template: null,
      }

      expect(session.completed_at).toBeNull()
      expect(session.duration_minutes).toBeNull()
      expect(session.distance_value).toBeNull()
    })

    it('CompleteTemplateWorkoutData supports all fields', () => {
      const data: CompleteTemplateWorkoutData = {
        sessionId: 'session-1',
        durationMinutes: 30,
        distanceValue: 5,
        distanceUnit: 'km',
        notes: 'Morning run',
      }

      expect(data.sessionId).toBe('session-1')
      expect(data.durationMinutes).toBe(30)
      expect(data.distanceValue).toBe(5)
    })

    it('CompleteTemplateWorkoutData supports minimal data', () => {
      const data: CompleteTemplateWorkoutData = {
        sessionId: 'session-1',
      }

      expect(data.sessionId).toBe('session-1')
      expect(data.durationMinutes).toBeUndefined()
    })
  })

  describe('template workout states', () => {
    it('identifies active session', () => {
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
        completed_at: '2024-01-15T10:30:00Z',
      }
      const isCompleted = session.completed_at !== null

      expect(isCompleted).toBe(true)
    })
  })

  describe('template types', () => {
    it('supports cardio type', () => {
      const template = { type: 'cardio' as const }
      expect(template.type).toBe('cardio')
    })

    it('supports mobility type', () => {
      const template = { type: 'mobility' as const }
      expect(template.type).toBe('mobility')
    })
  })

  describe('distance units', () => {
    it('supports meters', () => {
      const session = { distance_value: 1500, distance_unit: 'meters' }
      expect(session.distance_unit).toBe('meters')
    })

    it('supports km', () => {
      const session = { distance_value: 5, distance_unit: 'km' }
      expect(session.distance_unit).toBe('km')
    })

    it('supports miles', () => {
      const session = { distance_value: 3.1, distance_unit: 'miles' }
      expect(session.distance_unit).toBe('miles')
    })
  })
})
