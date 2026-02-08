import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.mock factory is hoisted, so we use vi.fn() inline and access mocks
// through the imported supabase object after import
vi.mock('../supabase', () => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
  return {
    supabase: {
      from: vi.fn().mockReturnValue(chain),
      __chain: chain,
    },
  }
})

import { supabase } from '../supabase'
import {
  getTemplateById,
  completeTemplateWorkout,
  getUserTemplateWorkouts,
  getActiveTemplateWorkout,
  quickLogTemplateWorkout,
  startTemplateWorkout,
} from '../templateWorkoutService'

// Access the mock chain through the mocked module
const mockChain = (supabase as unknown as { __chain: Record<string, ReturnType<typeof vi.fn>> }).__chain

// Helper to reset all mock chain methods to default returnThis behavior
function resetChain() {
  mockChain.select.mockReturnThis()
  mockChain.insert.mockReturnThis()
  mockChain.update.mockReturnThis()
  mockChain.eq.mockReturnThis()
  mockChain.is.mockReturnThis()
  mockChain.order.mockReturnThis()
  mockChain.limit.mockReturnThis()
  mockChain.single.mockResolvedValue({ data: null, error: null })
  mockChain.maybeSingle.mockResolvedValue({ data: null, error: null })
}

describe('templateWorkoutService integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetChain()
  })

  // ============================================
  // getTemplateById
  // ============================================

  describe('getTemplateById', () => {
    it('returns template data on success', async () => {
      const mockTemplate = {
        id: 'template-1',
        name: 'Morning Run',
        type: 'cardio',
        category: 'running',
        description: 'A 5k morning run',
        icon: 'running',
        duration_minutes: 30,
        workout_day_id: null,
        created_at: '2024-01-01T00:00:00Z',
      }
      mockChain.maybeSingle.mockResolvedValue({ data: mockTemplate, error: null })

      const result = await getTemplateById('template-1')

      expect(supabase.from).toHaveBeenCalledWith('workout_templates')
      expect(mockChain.select).toHaveBeenCalledWith('*')
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'template-1')
      expect(result).toEqual(mockTemplate)
    })

    it('returns null when no template found (maybeSingle returns null data)', async () => {
      mockChain.maybeSingle.mockResolvedValue({ data: null, error: null })

      const result = await getTemplateById('nonexistent')

      expect(result).toBeNull()
    })

    it('returns null for PGRST116 error (row not found)', async () => {
      mockChain.maybeSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' },
      })

      const result = await getTemplateById('missing-id')

      expect(result).toBeNull()
    })

    it('returns null for 42P01 error (missing table)', async () => {
      mockChain.maybeSingle.mockResolvedValue({
        data: null,
        error: { code: '42P01', message: 'relation "workout_templates" does not exist' },
      })

      const result = await getTemplateById('any-id')

      expect(result).toBeNull()
    })

    it('returns null when error message includes "does not exist"', async () => {
      mockChain.maybeSingle.mockResolvedValue({
        data: null,
        error: { code: 'UNKNOWN', message: 'relation "workout_templates" does not exist' },
      })

      const result = await getTemplateById('any-id')

      expect(result).toBeNull()
    })

    it('throws for other unhandled errors', async () => {
      const dbError = { code: '42501', message: 'permission denied for table workout_templates' }
      mockChain.maybeSingle.mockResolvedValue({ data: null, error: dbError })

      await expect(getTemplateById('any-id')).rejects.toEqual(dbError)
    })

    it('throws for network errors', async () => {
      const networkError = { code: 'NETWORK', message: 'fetch failed' }
      mockChain.maybeSingle.mockResolvedValue({ data: null, error: networkError })

      await expect(getTemplateById('any-id')).rejects.toEqual(networkError)
    })
  })

  // ============================================
  // completeTemplateWorkout
  // ============================================

  describe('completeTemplateWorkout', () => {
    it('sends correct update payload with all fields', async () => {
      const mockSession = {
        id: 'session-1',
        user_id: 'user-123',
        template_id: 'template-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: '2024-01-15T10:30:00Z',
        duration_minutes: 30,
        distance_value: 5.0,
        distance_unit: 'km',
        notes: 'Great run',
      }
      mockChain.single.mockResolvedValue({ data: mockSession, error: null })

      const result = await completeTemplateWorkout('session-1', {
        durationMinutes: 30,
        distanceValue: 5.0,
        distanceUnit: 'km',
        notes: 'Great run',
      })

      expect(supabase.from).toHaveBeenCalledWith('template_workout_sessions')
      expect(mockChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          duration_minutes: 30,
          distance_value: 5.0,
          distance_unit: 'km',
          notes: 'Great run',
          completed_at: expect.any(String),
        })
      )
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'session-1')
      expect(result).toEqual(mockSession)
    })

    it('preserves durationMinutes of 0 via nullish coalescing (not falsy check)', async () => {
      const mockSession = {
        id: 'session-1',
        user_id: 'user-123',
        template_id: 'template-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: '2024-01-15T10:30:00Z',
        duration_minutes: 0,
        distance_value: null,
        distance_unit: null,
        notes: null,
      }
      mockChain.single.mockResolvedValue({ data: mockSession, error: null })

      await completeTemplateWorkout('session-1', {
        durationMinutes: 0,
      })

      // The critical assertion: 0 ?? null === 0, not null
      // If the code used `|| null`, 0 would become null (bug)
      // With `?? null`, 0 is preserved (correct)
      expect(mockChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          duration_minutes: 0,
        })
      )

      // Verify 0 specifically was NOT converted to null
      const updateArg = mockChain.update.mock.calls[0][0]
      expect(updateArg.duration_minutes).toBe(0)
      expect(updateArg.duration_minutes).not.toBeNull()
    })

    it('preserves distanceValue of 0 via nullish coalescing (not falsy check)', async () => {
      const mockSession = {
        id: 'session-1',
        user_id: 'user-123',
        template_id: 'template-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: '2024-01-15T10:30:00Z',
        duration_minutes: null,
        distance_value: 0,
        distance_unit: 'km',
        notes: null,
      }
      mockChain.single.mockResolvedValue({ data: mockSession, error: null })

      await completeTemplateWorkout('session-1', {
        distanceValue: 0,
        distanceUnit: 'km',
      })

      // The critical assertion: 0 ?? null === 0, not null
      expect(mockChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          distance_value: 0,
        })
      )

      const updateArg = mockChain.update.mock.calls[0][0]
      expect(updateArg.distance_value).toBe(0)
      expect(updateArg.distance_value).not.toBeNull()
    })

    it('converts undefined durationMinutes to null via nullish coalescing', async () => {
      mockChain.single.mockResolvedValue({
        data: { id: 'session-1' },
        error: null,
      })

      await completeTemplateWorkout('session-1', {})

      const updateArg = mockChain.update.mock.calls[0][0]
      expect(updateArg.duration_minutes).toBeNull()
      expect(updateArg.distance_value).toBeNull()
    })

    it('converts undefined distanceValue to null via nullish coalescing', async () => {
      mockChain.single.mockResolvedValue({
        data: { id: 'session-1' },
        error: null,
      })

      await completeTemplateWorkout('session-1', {
        durationMinutes: 45,
      })

      const updateArg = mockChain.update.mock.calls[0][0]
      expect(updateArg.duration_minutes).toBe(45)
      expect(updateArg.distance_value).toBeNull()
    })

    it('uses || null for distanceUnit (empty string becomes null)', async () => {
      mockChain.single.mockResolvedValue({
        data: { id: 'session-1' },
        error: null,
      })

      await completeTemplateWorkout('session-1', {
        distanceUnit: '',
      })

      const updateArg = mockChain.update.mock.calls[0][0]
      // distanceUnit uses || null, so empty string becomes null
      expect(updateArg.distance_unit).toBeNull()
    })

    it('uses || null for notes (empty string becomes null)', async () => {
      mockChain.single.mockResolvedValue({
        data: { id: 'session-1' },
        error: null,
      })

      await completeTemplateWorkout('session-1', {
        notes: '',
      })

      const updateArg = mockChain.update.mock.calls[0][0]
      expect(updateArg.notes).toBeNull()
    })

    it('sets completed_at to a valid ISO timestamp', async () => {
      mockChain.single.mockResolvedValue({
        data: { id: 'session-1' },
        error: null,
      })

      const beforeCall = new Date().toISOString()
      await completeTemplateWorkout('session-1', {})
      const afterCall = new Date().toISOString()

      const updateArg = mockChain.update.mock.calls[0][0]
      expect(updateArg.completed_at).toBeDefined()
      expect(updateArg.completed_at >= beforeCall).toBe(true)
      expect(updateArg.completed_at <= afterCall).toBe(true)
    })

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' }
      mockChain.single.mockResolvedValue({ data: null, error: dbError })

      await expect(
        completeTemplateWorkout('session-1', { durationMinutes: 30 })
      ).rejects.toEqual(dbError)
    })

    it('includes select with template join after update', async () => {
      mockChain.single.mockResolvedValue({
        data: { id: 'session-1' },
        error: null,
      })

      await completeTemplateWorkout('session-1', {})

      expect(mockChain.select).toHaveBeenCalledWith(
        expect.stringContaining('template:workout_templates(*)')
      )
    })
  })

  // ============================================
  // getUserTemplateWorkouts
  // ============================================

  describe('getUserTemplateWorkouts', () => {
    it('returns array of sessions on success', async () => {
      const mockSessions = [
        { id: 'session-1', template_id: 'template-1', started_at: '2024-01-15T10:00:00Z' },
        { id: 'session-2', template_id: 'template-2', started_at: '2024-01-14T10:00:00Z' },
      ]
      // getUserTemplateWorkouts ends at .order() which is the terminal call
      mockChain.order.mockResolvedValue({ data: mockSessions, error: null })

      const result = await getUserTemplateWorkouts('user-123')

      expect(supabase.from).toHaveBeenCalledWith('template_workout_sessions')
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(mockChain.order).toHaveBeenCalledWith('started_at', { ascending: false })
      expect(result).toEqual(mockSessions)
    })

    it('returns empty array for 42P01 error (missing table)', async () => {
      mockChain.order.mockResolvedValue({
        data: null,
        error: { code: '42P01', message: 'relation "template_workout_sessions" does not exist' },
      })

      const result = await getUserTemplateWorkouts('user-123')

      expect(result).toEqual([])
    })

    it('returns empty array when error message includes "does not exist"', async () => {
      mockChain.order.mockResolvedValue({
        data: null,
        error: { code: 'UNKNOWN', message: 'relation "template_workout_sessions" does not exist' },
      })

      const result = await getUserTemplateWorkouts('user-123')

      expect(result).toEqual([])
    })

    it('throws for other errors', async () => {
      const dbError = { code: '42501', message: 'permission denied' }
      mockChain.order.mockResolvedValue({ data: null, error: dbError })

      await expect(getUserTemplateWorkouts('user-123')).rejects.toEqual(dbError)
    })

    it('includes template join in select', async () => {
      mockChain.order.mockResolvedValue({ data: [], error: null })

      await getUserTemplateWorkouts('user-123')

      expect(mockChain.select).toHaveBeenCalledWith(
        expect.stringContaining('template:workout_templates(*)')
      )
    })
  })

  // ============================================
  // getActiveTemplateWorkout
  // ============================================

  describe('getActiveTemplateWorkout', () => {
    it('returns active session when found', async () => {
      const mockSession = {
        id: 'session-1',
        user_id: 'user-123',
        template_id: 'template-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: null,
      }
      mockChain.maybeSingle.mockResolvedValue({ data: mockSession, error: null })

      const result = await getActiveTemplateWorkout('user-123')

      expect(supabase.from).toHaveBeenCalledWith('template_workout_sessions')
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(mockChain.is).toHaveBeenCalledWith('completed_at', null)
      expect(mockChain.order).toHaveBeenCalledWith('started_at', { ascending: false })
      expect(mockChain.limit).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockSession)
    })

    it('returns null when no active session exists', async () => {
      mockChain.maybeSingle.mockResolvedValue({ data: null, error: null })

      const result = await getActiveTemplateWorkout('user-123')

      expect(result).toBeNull()
    })

    it('returns null for 42P01 error (missing table)', async () => {
      mockChain.maybeSingle.mockResolvedValue({
        data: null,
        error: { code: '42P01', message: 'relation "template_workout_sessions" does not exist' },
      })

      const result = await getActiveTemplateWorkout('user-123')

      expect(result).toBeNull()
    })

    it('returns null when error message includes "does not exist"', async () => {
      mockChain.maybeSingle.mockResolvedValue({
        data: null,
        error: { code: 'UNKNOWN', message: 'table does not exist in schema' },
      })

      const result = await getActiveTemplateWorkout('user-123')

      expect(result).toBeNull()
    })

    it('throws for other errors', async () => {
      const dbError = { code: '42501', message: 'permission denied' }
      mockChain.maybeSingle.mockResolvedValue({ data: null, error: dbError })

      await expect(getActiveTemplateWorkout('user-123')).rejects.toEqual(dbError)
    })
  })

  // ============================================
  // startTemplateWorkout
  // ============================================

  describe('startTemplateWorkout', () => {
    it('throws "Template not found" when template does not exist', async () => {
      // getTemplateById calls maybeSingle, which returns null
      mockChain.maybeSingle.mockResolvedValue({ data: null, error: null })

      await expect(startTemplateWorkout('user-123', 'nonexistent')).rejects.toThrow(
        'Template not found'
      )
    })

    it('creates session and returns it when template exists', async () => {
      const mockTemplate = {
        id: 'template-1',
        name: 'Morning Run',
        type: 'cardio',
        category: 'running',
        description: null,
        icon: 'running',
        duration_minutes: 30,
        workout_day_id: null,
        created_at: '2024-01-01T00:00:00Z',
      }

      const mockSession = {
        id: 'session-new',
        user_id: 'user-123',
        template_id: 'template-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: null,
        duration_minutes: null,
        distance_value: null,
        distance_unit: null,
        notes: null,
        template: mockTemplate,
      }

      // First call: getTemplateById -> maybeSingle returns template
      // Second call: insert -> single returns session
      mockChain.maybeSingle.mockResolvedValueOnce({ data: mockTemplate, error: null })
      mockChain.single.mockResolvedValueOnce({ data: mockSession, error: null })

      const result = await startTemplateWorkout('user-123', 'template-1')

      expect(result).toEqual(mockSession)
      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          template_id: 'template-1',
          started_at: expect.any(String),
        })
      )
    })
  })

  // ============================================
  // quickLogTemplateWorkout
  // ============================================

  describe('quickLogTemplateWorkout', () => {
    it('calls startTemplateWorkout then completeTemplateWorkout', async () => {
      const mockTemplate = {
        id: 'template-1',
        name: 'Quick Jog',
        type: 'cardio',
        category: 'running',
        description: null,
        icon: 'running',
        duration_minutes: 15,
        workout_day_id: null,
        created_at: '2024-01-01T00:00:00Z',
      }

      const mockStartedSession = {
        id: 'session-new',
        user_id: 'user-123',
        template_id: 'template-1',
        started_at: '2024-01-15T10:00:00Z',
        completed_at: null,
        duration_minutes: null,
        distance_value: null,
        distance_unit: null,
        notes: null,
      }

      const mockCompletedSession = {
        ...mockStartedSession,
        completed_at: '2024-01-15T10:15:00Z',
        duration_minutes: 15,
        distance_value: 2.5,
        distance_unit: 'km',
      }

      // First: getTemplateById via maybeSingle
      mockChain.maybeSingle.mockResolvedValueOnce({ data: mockTemplate, error: null })
      // Second: startTemplateWorkout insert -> single
      mockChain.single.mockResolvedValueOnce({ data: mockStartedSession, error: null })
      // Third: completeTemplateWorkout update -> single
      mockChain.single.mockResolvedValueOnce({ data: mockCompletedSession, error: null })

      const result = await quickLogTemplateWorkout('user-123', 'template-1', {
        durationMinutes: 15,
        distanceValue: 2.5,
        distanceUnit: 'km',
      })

      expect(result).toEqual(mockCompletedSession)

      // Verify it called from() for the template lookup and session operations
      expect(supabase.from).toHaveBeenCalledWith('workout_templates')
      expect(supabase.from).toHaveBeenCalledWith('template_workout_sessions')
    })

    it('passes duration and distance data through to complete', async () => {
      const mockTemplate = {
        id: 'template-1',
        name: 'Swim',
        type: 'cardio',
        category: 'swim',
        description: null,
        icon: 'waves',
        duration_minutes: 45,
        workout_day_id: null,
        created_at: '2024-01-01T00:00:00Z',
      }

      const mockStarted = { id: 'session-1' }
      const mockCompleted = { id: 'session-1', duration_minutes: 45, distance_value: 1500 }

      mockChain.maybeSingle.mockResolvedValueOnce({ data: mockTemplate, error: null })
      mockChain.single.mockResolvedValueOnce({ data: mockStarted, error: null })
      mockChain.single.mockResolvedValueOnce({ data: mockCompleted, error: null })

      await quickLogTemplateWorkout('user-123', 'template-1', {
        durationMinutes: 45,
        distanceValue: 1500,
        distanceUnit: 'meters',
      })

      // Verify the update call includes the data from quickLog
      expect(mockChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          duration_minutes: 45,
          distance_value: 1500,
          distance_unit: 'meters',
        })
      )
    })

    it('propagates error from startTemplateWorkout', async () => {
      // Template not found
      mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null })

      await expect(
        quickLogTemplateWorkout('user-123', 'nonexistent', { durationMinutes: 30 })
      ).rejects.toThrow('Template not found')
    })
  })
})
