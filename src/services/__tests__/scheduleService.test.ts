import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getWorkoutTemplates,
  getWorkoutTemplatesByType,
  getMobilityTemplatesByCategory,
  getMobilityCategories,
  getUserSchedule,
  getScheduleDayWorkouts,
  deleteScheduleDay,
  saveScheduleDayWorkouts,
  clearUserSchedule,
  initializeDefaultSchedule,
  type WorkoutTemplate,
  type ScheduleDay,
  type ScheduleWorkoutItem,
} from '../scheduleService'

// ---------------------------------------------------------------------------
// Supabase mock - a queue-based approach where each `.from()` call pops
// the next pre-configured response off a queue.
// ---------------------------------------------------------------------------

let responseQueue: Array<{ data: unknown; error: unknown }> = []

function makeChainable(response: { data: unknown; error: unknown }) {
  const obj: Record<string, unknown> = {}
  const methods = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'neq', 'order', 'limit', 'single', 'maybeSingle']
  for (const m of methods) {
    obj[m] = vi.fn().mockReturnValue(obj)
  }
  // Make it thenable so `await` resolves to the response
  obj.then = (resolve: (v: unknown) => void, reject: (v: unknown) => void) => {
    return Promise.resolve(response).then(resolve, reject)
  }
  return obj
}

const mockFrom = vi.fn().mockImplementation(() => {
  const response = responseQueue.shift() ?? { data: null, error: null }
  return makeChainable(response)
})

vi.mock('../supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}))

vi.mock('@/config/planConstants', () => ({
  FULL_BODY_PLAN_ID: '00000000-0000-0000-0000-000000000004',
  BRO_SPLIT_PLAN_ID: '00000000-0000-0000-0000-000000000005',
  ARNOLD_SPLIT_PLAN_ID: '00000000-0000-0000-0000-000000000006',
  GLUTE_HYPERTROPHY_PLAN_ID: '00000000-0000-0000-0000-000000000007',
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function queueResponse(data: unknown, error: unknown = null) {
  responseQueue.push({ data, error })
}

function queueError(message: string, code?: string) {
  responseQueue.push({
    data: null,
    error: { message, code: code ?? 'ERROR' },
  })
}

function makeTemplate(overrides: Partial<WorkoutTemplate> = {}): WorkoutTemplate {
  return {
    id: 'template-1',
    name: 'Swimming',
    type: 'cardio',
    category: 'swim',
    description: 'Pool laps',
    icon: 'waves',
    duration_minutes: 30,
    workout_day_id: null,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeScheduleDay(overrides: Partial<ScheduleDay> = {}): ScheduleDay {
  return {
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
    workout_day: { id: 'day-1', name: 'Push', day_number: 1 },
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('scheduleService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    responseQueue = []
  })

  // =========================================================================
  // getWorkoutTemplates
  // =========================================================================
  describe('getWorkoutTemplates', () => {
    it('returns templates on success', async () => {
      const templates = [
        makeTemplate({ id: 't1', name: 'Running', type: 'cardio' }),
        makeTemplate({ id: 't2', name: 'Hip Flow', type: 'mobility' }),
      ]
      queueResponse(templates)

      const result = await getWorkoutTemplates()
      expect(result).toEqual(templates)
      expect(mockFrom).toHaveBeenCalledWith('workout_templates')
    })

    it('returns empty array on error', async () => {
      queueError('Database connection failed')
      const result = await getWorkoutTemplates()
      expect(result).toEqual([])
    })

    it('returns empty array when data is empty', async () => {
      queueResponse([])
      const result = await getWorkoutTemplates()
      expect(result).toEqual([])
    })
  })

  // =========================================================================
  // getWorkoutTemplatesByType
  // =========================================================================
  describe('getWorkoutTemplatesByType', () => {
    it('returns templates filtered by cardio type', async () => {
      const cardioTemplates = [
        makeTemplate({ id: 't1', name: 'Running', type: 'cardio' }),
        makeTemplate({ id: 't2', name: 'Swimming', type: 'cardio' }),
      ]
      queueResponse(cardioTemplates)

      const result = await getWorkoutTemplatesByType('cardio')
      expect(result).toEqual(cardioTemplates)
      expect(mockFrom).toHaveBeenCalledWith('workout_templates')
    })

    it('returns templates filtered by mobility type', async () => {
      const mobilityTemplates = [
        makeTemplate({ id: 't3', name: 'Hip Flow', type: 'mobility', category: 'hip_knee_ankle' }),
      ]
      queueResponse(mobilityTemplates)

      const result = await getWorkoutTemplatesByType('mobility')
      expect(result).toEqual(mobilityTemplates)
    })

    it('returns templates filtered by weights type', async () => {
      const weightsTemplates = [
        makeTemplate({ id: 't4', name: 'Push Day', type: 'weights' }),
      ]
      queueResponse(weightsTemplates)

      const result = await getWorkoutTemplatesByType('weights')
      expect(result).toEqual(weightsTemplates)
    })

    it('throws on error', async () => {
      queueError('Query failed')
      await expect(getWorkoutTemplatesByType('cardio')).rejects.toEqual(
        expect.objectContaining({ message: 'Query failed' })
      )
    })

    it('returns empty array when no templates match type', async () => {
      queueResponse([])
      const result = await getWorkoutTemplatesByType('weights')
      expect(result).toEqual([])
    })
  })

  // =========================================================================
  // getMobilityTemplatesByCategory
  // =========================================================================
  describe('getMobilityTemplatesByCategory', () => {
    it('returns mobility templates for a given category', async () => {
      const templates = [
        makeTemplate({ id: 't1', name: 'Short Hip Flow', type: 'mobility', category: 'hip_knee_ankle', duration_minutes: 10 }),
        makeTemplate({ id: 't2', name: 'Long Hip Flow', type: 'mobility', category: 'hip_knee_ankle', duration_minutes: 25 }),
      ]
      queueResponse(templates)

      const result = await getMobilityTemplatesByCategory('hip_knee_ankle')
      expect(result).toEqual(templates)
      expect(mockFrom).toHaveBeenCalledWith('workout_templates')
    })

    it('throws on error', async () => {
      queueError('Category not found')
      await expect(getMobilityTemplatesByCategory('nonexistent')).rejects.toEqual(
        expect.objectContaining({ message: 'Category not found' })
      )
    })

    it('returns empty array when no templates in category', async () => {
      queueResponse([])
      const result = await getMobilityTemplatesByCategory('spine')
      expect(result).toEqual([])
    })
  })

  // =========================================================================
  // getMobilityCategories
  // =========================================================================
  describe('getMobilityCategories', () => {
    it('returns unique categories with their first template', async () => {
      const templates = [
        makeTemplate({ id: 't1', name: 'Hip Flow A', type: 'mobility', category: 'hip_knee_ankle' }),
        makeTemplate({ id: 't2', name: 'Hip Flow B', type: 'mobility', category: 'hip_knee_ankle' }),
        makeTemplate({ id: 't3', name: 'Spine Stretch', type: 'mobility', category: 'spine' }),
      ]
      queueResponse(templates)

      const result = await getMobilityCategories()
      expect(result).toHaveLength(2)
      expect(result[0].category).toBe('hip_knee_ankle')
      expect(result[0].template.id).toBe('t1')
      expect(result[1].category).toBe('spine')
      expect(result[1].template.id).toBe('t3')
    })

    it('skips templates with null category', async () => {
      const templates = [
        makeTemplate({ id: 't1', name: 'No Category', type: 'mobility', category: null }),
        makeTemplate({ id: 't2', name: 'Hip Flow', type: 'mobility', category: 'hip_knee_ankle' }),
      ]
      queueResponse(templates)

      const result = await getMobilityCategories()
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('hip_knee_ankle')
    })

    it('returns empty array when no mobility templates exist', async () => {
      queueResponse([])
      const result = await getMobilityCategories()
      expect(result).toEqual([])
    })

    it('throws on error', async () => {
      queueError('DB error')
      await expect(getMobilityCategories()).rejects.toEqual(
        expect.objectContaining({ message: 'DB error' })
      )
    })

    it('handles all templates having the same category', async () => {
      const templates = [
        makeTemplate({ id: 't1', name: 'A', type: 'mobility', category: 'hip_knee_ankle' }),
        makeTemplate({ id: 't2', name: 'B', type: 'mobility', category: 'hip_knee_ankle' }),
      ]
      queueResponse(templates)

      const result = await getMobilityCategories()
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('hip_knee_ankle')
      expect(result[0].template.id).toBe('t1')
    })
  })

  // =========================================================================
  // getUserSchedule
  // =========================================================================
  describe('getUserSchedule', () => {
    it('returns schedule days for a user', async () => {
      const schedule = [
        makeScheduleDay({ id: 's1', day_number: 1, sort_order: 0 }),
        makeScheduleDay({ id: 's2', day_number: 2, sort_order: 0 }),
      ]
      queueResponse(schedule)

      const result = await getUserSchedule('user-1')
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('s1')
      expect(result[1].id).toBe('s2')
      expect(mockFrom).toHaveBeenCalledWith('user_schedules')
    })

    it('returns empty array on error', async () => {
      queueError('Permission denied')
      const result = await getUserSchedule('user-1')
      expect(result).toEqual([])
    })

    it('returns empty array when user has no schedule', async () => {
      queueResponse([])
      const result = await getUserSchedule('user-1')
      expect(result).toEqual([])
    })

    it('returns empty array when data is null', async () => {
      queueResponse(null)
      const result = await getUserSchedule('user-1')
      expect(result).toEqual([])
    })

    it('defaults sort_order to 0 when null', async () => {
      const schedule = [
        { ...makeScheduleDay({ id: 's1' }), sort_order: null },
        { ...makeScheduleDay({ id: 's2' }), sort_order: 2 },
      ]
      queueResponse(schedule)

      const result = await getUserSchedule('user-1')
      expect(result[0].sort_order).toBe(0)
      expect(result[1].sort_order).toBe(2)
    })
  })

  // =========================================================================
  // getScheduleDayWorkouts
  // =========================================================================
  describe('getScheduleDayWorkouts', () => {
    it('returns workouts for a specific day', async () => {
      const workouts = [
        makeScheduleDay({ id: 's1', day_number: 1, sort_order: 0 }),
        makeScheduleDay({ id: 's2', day_number: 1, sort_order: 1, template_id: 'template-1', workout_day_id: null }),
      ]
      queueResponse(workouts)

      const result = await getScheduleDayWorkouts('user-1', 1)
      expect(result).toHaveLength(2)
      expect(mockFrom).toHaveBeenCalledWith('user_schedules')
    })

    it('returns empty array on error', async () => {
      queueError('Query failed')
      const result = await getScheduleDayWorkouts('user-1', 1)
      expect(result).toEqual([])
    })

    it('returns empty array when no workouts on that day', async () => {
      queueResponse([])
      const result = await getScheduleDayWorkouts('user-1', 3)
      expect(result).toEqual([])
    })

    it('returns empty array when data is null', async () => {
      queueResponse(null)
      const result = await getScheduleDayWorkouts('user-1', 1)
      expect(result).toEqual([])
    })

    it('defaults sort_order to 0 when null', async () => {
      const workouts = [
        { ...makeScheduleDay({ id: 's1', day_number: 1 }), sort_order: null },
      ]
      queueResponse(workouts)

      const result = await getScheduleDayWorkouts('user-1', 1)
      expect(result[0].sort_order).toBe(0)
    })
  })

  // =========================================================================
  // deleteScheduleDay
  // =========================================================================
  describe('deleteScheduleDay', () => {
    it('deletes schedule entries for a user and day', async () => {
      queueResponse(null)

      await expect(deleteScheduleDay('user-1', 3)).resolves.toBeUndefined()
      expect(mockFrom).toHaveBeenCalledWith('user_schedules')
    })

    it('throws on error', async () => {
      queueError('Delete failed')
      await expect(deleteScheduleDay('user-1', 3)).rejects.toEqual(
        expect.objectContaining({ message: 'Delete failed' })
      )
    })
  })

  // =========================================================================
  // saveScheduleDayWorkouts
  // =========================================================================
  describe('saveScheduleDayWorkouts', () => {
    it('inserts rest day when workouts is empty', async () => {
      // deleteScheduleDay
      queueResponse(null)
      // insert rest day (empty workouts now inserts rest day to prevent orphaned schedule)
      const restDay = makeScheduleDay({ is_rest_day: true, workout_day_id: null, template_id: null })
      queueResponse([restDay])

      const result = await saveScheduleDayWorkouts('user-1', 1, [])
      expect(result).toHaveLength(1)
      expect(result[0].is_rest_day).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('user_schedules')
    })

    it('inserts a rest day when type is rest', async () => {
      // deleteScheduleDay
      queueResponse(null)
      // insert rest day
      const restDay = makeScheduleDay({ is_rest_day: true, workout_day_id: null, template_id: null })
      queueResponse([restDay])

      const workouts: ScheduleWorkoutItem[] = [{ type: 'rest' }]
      const result = await saveScheduleDayWorkouts('user-1', 1, workouts)
      expect(result).toHaveLength(1)
      expect(result[0].is_rest_day).toBe(true)
    })

    it('inserts weights workout with workout_day_id', async () => {
      // deleteScheduleDay
      queueResponse(null)
      // insert workout
      const saved = makeScheduleDay({ workout_day_id: 'day-1', template_id: null })
      queueResponse([saved])

      const workouts: ScheduleWorkoutItem[] = [{ type: 'weights', id: 'day-1' }]
      const result = await saveScheduleDayWorkouts('user-1', 1, workouts)
      expect(result).toHaveLength(1)
      expect(result[0].workout_day_id).toBe('day-1')
    })

    it('inserts cardio workout with template_id', async () => {
      // deleteScheduleDay
      queueResponse(null)
      // insert workout
      const saved = makeScheduleDay({ template_id: 'template-1', workout_day_id: null })
      queueResponse([saved])

      const workouts: ScheduleWorkoutItem[] = [{ type: 'cardio', id: 'template-1' }]
      const result = await saveScheduleDayWorkouts('user-1', 1, workouts)
      expect(result).toHaveLength(1)
      expect(result[0].template_id).toBe('template-1')
    })

    it('inserts mobility workout with template_id', async () => {
      // deleteScheduleDay
      queueResponse(null)
      // insert
      const saved = makeScheduleDay({ template_id: 'mob-1', workout_day_id: null })
      queueResponse([saved])

      const workouts: ScheduleWorkoutItem[] = [{ type: 'mobility', id: 'mob-1' }]
      const result = await saveScheduleDayWorkouts('user-1', 1, workouts)
      expect(result).toHaveLength(1)
    })

    it('inserts multiple workouts with correct sort_order', async () => {
      // deleteScheduleDay
      queueResponse(null)
      // insert multiple
      const saved = [
        makeScheduleDay({ id: 's1', workout_day_id: 'day-1', sort_order: 0 }),
        makeScheduleDay({ id: 's2', template_id: 'template-1', workout_day_id: null, sort_order: 1 }),
      ]
      queueResponse(saved)

      const workouts: ScheduleWorkoutItem[] = [
        { type: 'weights', id: 'day-1' },
        { type: 'cardio', id: 'template-1' },
      ]
      const result = await saveScheduleDayWorkouts('user-1', 1, workouts)
      expect(result).toHaveLength(2)
      expect(result[0].sort_order).toBe(0)
      expect(result[1].sort_order).toBe(1)
    })

    it('throws when delete fails', async () => {
      queueError('Delete permission denied')

      const workouts: ScheduleWorkoutItem[] = [{ type: 'weights', id: 'day-1' }]
      await expect(saveScheduleDayWorkouts('user-1', 1, workouts)).rejects.toThrow(
        'Failed to clear existing schedule'
      )
    })

    it('throws when rest day insert fails', async () => {
      // Delete succeeds
      queueResponse(null)
      // Insert fails
      queueError('Insert failed')

      const workouts: ScheduleWorkoutItem[] = [{ type: 'rest' }]
      await expect(saveScheduleDayWorkouts('user-1', 1, workouts)).rejects.toThrow(
        'Failed to save rest day'
      )
    })

    it('throws generic error when insert fails with non-migration error', async () => {
      // Delete succeeds
      queueResponse(null)
      // Insert fails with generic error
      responseQueue.push({ data: null, error: { message: 'Unknown error', code: 'XXXXX' } })

      const workouts: ScheduleWorkoutItem[] = [{ type: 'weights', id: 'day-1' }]
      await expect(saveScheduleDayWorkouts('user-1', 1, workouts)).rejects.toThrow(
        'Failed to save schedule: Unknown error'
      )
    })

    it('falls back to single insert on sort_order column error with one workout', async () => {
      // Delete succeeds
      queueResponse(null)
      // First insert fails with sort_order error
      responseQueue.push({
        data: null,
        error: { message: 'column sort_order does not exist', code: 'PGRST204' },
      })
      // Fallback insert succeeds
      const saved = [makeScheduleDay({ id: 's1', workout_day_id: 'day-1' })]
      queueResponse(saved)

      const workouts: ScheduleWorkoutItem[] = [{ type: 'weights', id: 'day-1' }]
      const result = await saveScheduleDayWorkouts('user-1', 1, workouts)
      expect(result).toHaveLength(1)
    })

    it('throws migration error when multi-workout insert fails with constraint error', async () => {
      // Delete succeeds
      queueResponse(null)
      // Insert fails with unique constraint
      responseQueue.push({
        data: null,
        error: { message: 'unique constraint violation', code: '23505' },
      })

      const workouts: ScheduleWorkoutItem[] = [
        { type: 'weights', id: 'day-1' },
        { type: 'cardio', id: 'template-1' },
      ]
      await expect(saveScheduleDayWorkouts('user-1', 1, workouts)).rejects.toThrow(
        'Multiple workouts per day requires a database migration'
      )
    })

    it('throws when fallback single insert also fails', async () => {
      // Delete succeeds
      queueResponse(null)
      // First insert fails with sort_order error
      responseQueue.push({
        data: null,
        error: { message: 'sort_order not found', code: 'PGRST204' },
      })
      // Fallback insert also fails
      queueError('Fallback failed too')

      const workouts: ScheduleWorkoutItem[] = [{ type: 'weights', id: 'day-1' }]
      await expect(saveScheduleDayWorkouts('user-1', 1, workouts)).rejects.toThrow(
        'Failed to save schedule: Fallback failed too'
      )
    })

    it('defaults sort_order to 0 for returned data with null sort_order', async () => {
      // Delete succeeds
      queueResponse(null)
      // Insert returns data with null sort_order
      const saved = [{ ...makeScheduleDay({ id: 's1' }), sort_order: null }]
      queueResponse(saved)

      const workouts: ScheduleWorkoutItem[] = [{ type: 'weights', id: 'day-1' }]
      const result = await saveScheduleDayWorkouts('user-1', 1, workouts)
      expect(result[0].sort_order).toBe(0)
    })

    it('logs warning for more than 3 workouts (overtraining)', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      // Delete succeeds
      queueResponse(null)
      // Insert succeeds
      queueResponse([
        makeScheduleDay({ sort_order: 0 }),
        makeScheduleDay({ sort_order: 1 }),
        makeScheduleDay({ sort_order: 2 }),
        makeScheduleDay({ sort_order: 3 }),
      ])

      const workouts: ScheduleWorkoutItem[] = [
        { type: 'weights', id: 'day-1' },
        { type: 'cardio', id: 'template-1' },
        { type: 'mobility', id: 'mob-1' },
        { type: 'cardio', id: 'template-2' },
      ]
      await saveScheduleDayWorkouts('user-1', 1, workouts)
      expect(warnSpy).toHaveBeenCalledWith(
        'Overtraining risk: User scheduling',
        4,
        'workouts on day',
        1
      )
      warnSpy.mockRestore()
    })

    it('throws when rest day insert fails for empty workouts', async () => {
      // Delete succeeds
      queueResponse(null)
      // Rest day insert fails
      queueError('Insert failed')

      await expect(saveScheduleDayWorkouts('user-1', 1, [])).rejects.toThrow(
        'Failed to save rest day'
      )
    })

    it('returns empty array when insert returns null data for rest day', async () => {
      // Delete succeeds
      queueResponse(null)
      // Insert returns null data
      queueResponse(null)

      const workouts: ScheduleWorkoutItem[] = [{ type: 'rest' }]
      const result = await saveScheduleDayWorkouts('user-1', 1, workouts)
      expect(result).toEqual([])
    })

    it('returns empty array when insert returns null data for workouts', async () => {
      // Delete succeeds
      queueResponse(null)
      // Insert returns null data
      queueResponse(null)

      const workouts: ScheduleWorkoutItem[] = [{ type: 'weights', id: 'day-1' }]
      const result = await saveScheduleDayWorkouts('user-1', 1, workouts)
      expect(result).toEqual([])
    })

    it('handles fallback returning null data', async () => {
      // Delete succeeds
      queueResponse(null)
      // First insert fails with sort_order error
      responseQueue.push({
        data: null,
        error: { message: 'sort_order not found', code: 'PGRST204' },
      })
      // Fallback insert returns null data
      queueResponse(null)

      const workouts: ScheduleWorkoutItem[] = [{ type: 'weights', id: 'day-1' }]
      const result = await saveScheduleDayWorkouts('user-1', 1, workouts)
      expect(result).toEqual([])
    })
  })

  // =========================================================================
  // clearUserSchedule
  // =========================================================================
  describe('clearUserSchedule', () => {
    it('deletes all schedule entries for a user', async () => {
      queueResponse(null)
      await expect(clearUserSchedule('user-1')).resolves.toBeUndefined()
      expect(mockFrom).toHaveBeenCalledWith('user_schedules')
    })

    it('throws on error', async () => {
      queueError('Permission denied')
      await expect(clearUserSchedule('user-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Permission denied' })
      )
    })
  })

  // =========================================================================
  // initializeDefaultSchedule
  // =========================================================================
  describe('initializeDefaultSchedule', () => {
    const mockWorkoutDays = [
      { id: 'wd-1', day_number: 1, plan_id: 'plan-1' },
      { id: 'wd-2', day_number: 2, plan_id: 'plan-1' },
      { id: 'wd-3', day_number: 3, plan_id: 'plan-1' },
    ]

    it('creates PPL schedule by default (3 workout days)', async () => {
      queueResponse(mockWorkoutDays)
      const schedule = Array.from({ length: 7 }, (_, i) =>
        makeScheduleDay({ id: `s${i + 1}`, day_number: i + 1 })
      )
      queueResponse(schedule)

      const result = await initializeDefaultSchedule('user-1')
      expect(result).toHaveLength(7)
      // Verify both from calls
      expect(mockFrom).toHaveBeenCalledWith('workout_days')
      expect(mockFrom).toHaveBeenCalledWith('user_schedules')
    })

    it('creates Full Body schedule (3 on, 4 off)', async () => {
      queueResponse(mockWorkoutDays)
      const schedule = Array.from({ length: 7 }, (_, i) =>
        makeScheduleDay({ id: `s${i + 1}`, day_number: i + 1 })
      )
      queueResponse(schedule)

      const result = await initializeDefaultSchedule(
        'user-1',
        '00000000-0000-0000-0000-000000000004'
      )
      expect(result).toHaveLength(7)
    })

    it('creates Bro Split schedule (5 on, 2 off)', async () => {
      const broWorkoutDays = [
        { id: 'wd-1', day_number: 1, plan_id: 'bro' },
        { id: 'wd-2', day_number: 2, plan_id: 'bro' },
        { id: 'wd-3', day_number: 3, plan_id: 'bro' },
        { id: 'wd-4', day_number: 4, plan_id: 'bro' },
        { id: 'wd-5', day_number: 5, plan_id: 'bro' },
      ]
      queueResponse(broWorkoutDays)
      const schedule = Array.from({ length: 7 }, (_, i) =>
        makeScheduleDay({ id: `s${i + 1}`, day_number: i + 1 })
      )
      queueResponse(schedule)

      const result = await initializeDefaultSchedule(
        'user-1',
        '00000000-0000-0000-0000-000000000005'
      )
      expect(result).toHaveLength(7)
    })

    it('creates Arnold Split schedule (3-day cycle x2 + rest)', async () => {
      queueResponse(mockWorkoutDays)
      const schedule = Array.from({ length: 7 }, (_, i) =>
        makeScheduleDay({ id: `s${i + 1}`, day_number: i + 1 })
      )
      queueResponse(schedule)

      const result = await initializeDefaultSchedule(
        'user-1',
        '00000000-0000-0000-0000-000000000006'
      )
      expect(result).toHaveLength(7)
    })

    it('creates Glute Hypertrophy schedule', async () => {
      const gluteWorkoutDays = [
        { id: 'wd-1', day_number: 1, plan_id: 'glute' },
        { id: 'wd-2', day_number: 2, plan_id: 'glute' },
        { id: 'wd-3', day_number: 3, plan_id: 'glute' },
        { id: 'wd-4', day_number: 4, plan_id: 'glute' },
        { id: 'wd-5', day_number: 5, plan_id: 'glute' },
      ]
      queueResponse(gluteWorkoutDays)
      const schedule = Array.from({ length: 7 }, (_, i) =>
        makeScheduleDay({ id: `s${i + 1}`, day_number: i + 1 })
      )
      queueResponse(schedule)

      const result = await initializeDefaultSchedule(
        'user-1',
        '00000000-0000-0000-0000-000000000007'
      )
      expect(result).toHaveLength(7)
    })

    it('creates Upper/Lower schedule when 2 workout days', async () => {
      const upperLowerDays = [
        { id: 'wd-1', day_number: 1, plan_id: 'ul' },
        { id: 'wd-2', day_number: 2, plan_id: 'ul' },
      ]
      queueResponse(upperLowerDays)
      const schedule = Array.from({ length: 7 }, (_, i) =>
        makeScheduleDay({ id: `s${i + 1}`, day_number: i + 1 })
      )
      queueResponse(schedule)

      const result = await initializeDefaultSchedule(
        'user-1',
        'some-other-plan-id'
      )
      expect(result).toHaveLength(7)
    })

    it('throws when fetching workout days fails', async () => {
      queueError('DB connection error')

      await expect(
        initializeDefaultSchedule('user-1', 'plan-1')
      ).rejects.toEqual(expect.objectContaining({ message: 'DB connection error' }))
    })

    it('throws when inserting schedule fails', async () => {
      queueResponse(mockWorkoutDays)
      queueError('Insert constraint violation')

      await expect(initializeDefaultSchedule('user-1')).rejects.toEqual(
        expect.objectContaining({ message: 'Insert constraint violation' })
      )
    })

    it('handles null data from insert (returns empty array)', async () => {
      queueResponse(mockWorkoutDays)
      queueResponse(null)

      const result = await initializeDefaultSchedule('user-1')
      expect(result).toEqual([])
    })

    it('handles empty workout days gracefully (falls through to PPL default)', async () => {
      queueResponse([])
      const schedule = Array.from({ length: 7 }, (_, i) =>
        makeScheduleDay({ id: `s${i + 1}`, day_number: i + 1 })
      )
      queueResponse(schedule)

      const result = await initializeDefaultSchedule('user-1')
      expect(result).toHaveLength(7)
    })

    it('handles null workout days array', async () => {
      queueResponse(null)
      const schedule = Array.from({ length: 7 }, (_, i) =>
        makeScheduleDay({ id: `s${i + 1}`, day_number: i + 1 })
      )
      queueResponse(schedule)

      const result = await initializeDefaultSchedule('user-1')
      expect(result).toHaveLength(7)
    })

    it('defaults sort_order to 0 when null in returned data', async () => {
      queueResponse(mockWorkoutDays)
      const schedule = [{ ...makeScheduleDay({ id: 's1', day_number: 1 }), sort_order: null }]
      queueResponse(schedule)

      const result = await initializeDefaultSchedule('user-1')
      expect(result[0].sort_order).toBe(0)
    })
  })

  // =========================================================================
  // Type definitions (preserved from original tests)
  // =========================================================================
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
        workout_day_id: null,
        created_at: '2024-01-01T00:00:00Z',
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
          day_number: 1,
        },
      }

      expect(scheduleDay.day_number).toBe(1)
      expect(scheduleDay.is_rest_day).toBe(false)
      expect(scheduleDay.workout_day?.name).toBe('Push')
    })

    it('ScheduleWorkoutItem supports all types', () => {
      const rest: ScheduleWorkoutItem = { type: 'rest' }
      const weights: ScheduleWorkoutItem = { type: 'weights', id: 'day-1' }
      const cardio: ScheduleWorkoutItem = { type: 'cardio', id: 'template-1' }
      const mobility: ScheduleWorkoutItem = { type: 'mobility', id: 'mob-1' }

      expect(rest.type).toBe('rest')
      expect(rest.id).toBeUndefined()
      expect(weights.type).toBe('weights')
      expect(weights.id).toBe('day-1')
      expect(cardio.type).toBe('cardio')
      expect(mobility.type).toBe('mobility')
    })
  })

  // =========================================================================
  // WorkoutTemplate types (preserved from original tests)
  // =========================================================================
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
        workout_day_id: null,
        created_at: '2024-01-01T00:00:00Z',
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
        workout_day_id: null,
        created_at: '2024-01-01T00:00:00Z',
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
        workout_day_id: '00000000-0000-0000-0000-000000000032',
        created_at: '2024-01-01T00:00:00Z',
      }
      expect(template.type).toBe('mobility')
    })
  })
})
