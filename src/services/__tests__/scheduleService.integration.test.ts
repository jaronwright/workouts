/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Build a chainable mock that tracks calls and returns configurable data
function createMockChain() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}

  // The final resolved value - tests set this before calling the service function
  let resolvedValue: { data: unknown; error: unknown } = { data: null, error: null }

  const reset = () => {
    resolvedValue = { data: null, error: null }
    for (const key of Object.keys(chain)) {
      if (typeof chain[key]?.mockClear === 'function') {
        chain[key].mockClear()
      }
    }
  }

  const setResolved = (val: { data: unknown; error: unknown }) => {
    resolvedValue = val
  }

  // Every chaining method returns `chain` so you can call .select().eq().order()
  // The terminal methods (maybeSingle, single, or the chain itself used with await)
  // resolve to `resolvedValue`.
  const handler: ProxyHandler<Record<string, ReturnType<typeof vi.fn>>> = {
    get(_target, prop: string) {
      if (prop === 'then') {
        // Make the chain thenable so `await supabase.from(...).select()...` works
        return (resolve: (v: unknown) => void) => resolve(resolvedValue)
      }
      if (prop === '__setResolved') return setResolved
      if (prop === '__reset') return reset
      if (!chain[prop]) {
        chain[prop] = vi.fn().mockReturnValue(new Proxy(chain, handler))
      }
      return chain[prop]
    }
  }

  return new Proxy(chain, handler)
}

const mockChain = createMockChain()
const fromFn = vi.fn(() => mockChain)

vi.mock('../supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => fromFn(...args)
  }
}))

// Must import AFTER mocking
import {
  getUserSchedule,
  getScheduleDayWorkouts,
  saveScheduleDayWorkouts,
  clearUserSchedule,
  getWorkoutTemplates,
  getWorkoutTemplatesByType,
  deleteScheduleDay,
  getScheduleDay,
  type ScheduleWorkoutItem,
} from '../scheduleService'

const USER_ID = 'user-test-123'

describe('scheduleService integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(mockChain as any).__reset()
    // Restore default fromFn behavior (mockImplementation overrides from previous tests leak)
    fromFn.mockImplementation(() => mockChain)
  })

  // ─── getUserSchedule ───────────────────────────────────────────────

  describe('getUserSchedule', () => {
    it('returns empty array when no schedules exist', async () => {
      ;(mockChain as any).__setResolved({ data: [], error: null })

      const result = await getUserSchedule(USER_ID)

      expect(fromFn).toHaveBeenCalledWith('user_schedules')
      expect(result).toEqual([])
    })

    it('returns schedule days with sort_order defaulted to 0', async () => {
      const row = {
        id: 'sched-1',
        user_id: USER_ID,
        day_number: 1,
        template_id: null,
        workout_day_id: 'wd-1',
        is_rest_day: false,
        sort_order: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        template: null,
        workout_day: { id: 'wd-1', name: 'Push', day_number: 1 }
      }
      ;(mockChain as any).__setResolved({ data: [row], error: null })

      const result = await getUserSchedule(USER_ID)

      expect(result).toHaveLength(1)
      expect(result[0].sort_order).toBe(0) // null coalesced to 0
      expect(result[0].workout_day?.name).toBe('Push')
    })

    it('returns empty array and logs warning on error', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      ;(mockChain as any).__setResolved({ data: null, error: { message: 'RLS denied' } })

      const result = await getUserSchedule(USER_ID)

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching user schedule:', 'RLS denied')
      consoleSpy.mockRestore()
    })
  })

  // ─── getScheduleDayWorkouts ────────────────────────────────────────

  describe('getScheduleDayWorkouts', () => {
    it('returns workouts for a specific day', async () => {
      const rows = [
        {
          id: 'sched-1', user_id: USER_ID, day_number: 3,
          template_id: null, workout_day_id: 'wd-push',
          is_rest_day: false, sort_order: 0,
          created_at: '', updated_at: '',
          template: null,
          workout_day: { id: 'wd-push', name: 'Push', day_number: 1 }
        },
        {
          id: 'sched-2', user_id: USER_ID, day_number: 3,
          template_id: 'tmpl-cardio', workout_day_id: null,
          is_rest_day: false, sort_order: 1,
          created_at: '', updated_at: '',
          template: { id: 'tmpl-cardio', name: 'Running', type: 'cardio' },
          workout_day: null
        },
      ]
      ;(mockChain as any).__setResolved({ data: rows, error: null })

      const result = await getScheduleDayWorkouts(USER_ID, 3)

      expect(fromFn).toHaveBeenCalledWith('user_schedules')
      expect(result).toHaveLength(2)
      expect(result[0].sort_order).toBe(0)
      expect(result[1].sort_order).toBe(1)
    })

    it('returns empty array on error', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      ;(mockChain as any).__setResolved({ data: null, error: { message: 'fail' } })

      const result = await getScheduleDayWorkouts(USER_ID, 1)

      expect(result).toEqual([])
      consoleSpy.mockRestore()
    })
  })

  // ─── getScheduleDay (legacy) ──────────────────────────────────────

  describe('getScheduleDay', () => {
    it('returns first workout when multiple exist', async () => {
      const rows = [
        { id: 'a', user_id: USER_ID, day_number: 1, is_rest_day: false, sort_order: 0, template_id: null, workout_day_id: 'wd-1', created_at: '', updated_at: '', template: null, workout_day: null },
        { id: 'b', user_id: USER_ID, day_number: 1, is_rest_day: false, sort_order: 1, template_id: null, workout_day_id: 'wd-2', created_at: '', updated_at: '', template: null, workout_day: null },
      ]
      ;(mockChain as any).__setResolved({ data: rows, error: null })

      const result = await getScheduleDay(USER_ID, 1)

      expect(result).not.toBeNull()
      expect(result!.id).toBe('a')
    })

    it('returns null when no workouts exist', async () => {
      ;(mockChain as any).__setResolved({ data: [], error: null })

      const result = await getScheduleDay(USER_ID, 5)

      expect(result).toBeNull()
    })
  })

  // ─── saveScheduleDayWorkouts ──────────────────────────────────────

  describe('saveScheduleDayWorkouts', () => {
    it('handles rest day - inserts is_rest_day true with null ids', async () => {
      const restRow = {
        id: 'new-1', user_id: USER_ID, day_number: 2,
        is_rest_day: true, template_id: null, workout_day_id: null,
        sort_order: null, created_at: '', updated_at: '',
        template: null, workout_day: null
      }
      // deleteScheduleDay resolves first, then insert resolves
      ;(mockChain as any).__setResolved({ data: null, error: null })
      // We need two calls: delete then insert. The proxy resolves the same value for both.
      // Override: set up sequential resolution
      let callCount = 0
      fromFn.mockImplementation(() => {
        callCount++
        if (callCount <= 1) {
          // delete call
          ;(mockChain as any).__setResolved({ data: null, error: null })
        } else {
          // insert call
          ;(mockChain as any).__setResolved({ data: [restRow], error: null })
        }
        return mockChain
      })

      const workouts: ScheduleWorkoutItem[] = [{ type: 'rest' }]
      const result = await saveScheduleDayWorkouts(USER_ID, 2, workouts)

      expect(result).toHaveLength(1)
      expect(result[0].is_rest_day).toBe(true)
      expect(result[0].template_id).toBeNull()
      expect(result[0].workout_day_id).toBeNull()
    })

    it('handles weights day - sets workout_day_id', async () => {
      const weightsRow = {
        id: 'new-2', user_id: USER_ID, day_number: 1,
        is_rest_day: false, template_id: null, workout_day_id: 'wd-push',
        sort_order: 0, created_at: '', updated_at: '',
        template: null, workout_day: { id: 'wd-push', name: 'Push', day_number: 1 }
      }
      let callCount = 0
      fromFn.mockImplementation(() => {
        callCount++
        if (callCount <= 1) {
          ;(mockChain as any).__setResolved({ data: null, error: null })
        } else {
          ;(mockChain as any).__setResolved({ data: [weightsRow], error: null })
        }
        return mockChain
      })

      const workouts: ScheduleWorkoutItem[] = [{ type: 'weights', id: 'wd-push' }]
      const result = await saveScheduleDayWorkouts(USER_ID, 1, workouts)

      expect(result).toHaveLength(1)
      expect(result[0].workout_day_id).toBe('wd-push')
      expect(result[0].is_rest_day).toBe(false)
    })

    it('handles multiple workouts per day', async () => {
      const rows = [
        {
          id: 'new-a', user_id: USER_ID, day_number: 1,
          is_rest_day: false, template_id: null, workout_day_id: 'wd-push',
          sort_order: 0, created_at: '', updated_at: '',
          template: null, workout_day: null
        },
        {
          id: 'new-b', user_id: USER_ID, day_number: 1,
          is_rest_day: false, template_id: 'tmpl-cardio', workout_day_id: null,
          sort_order: 1, created_at: '', updated_at: '',
          template: { id: 'tmpl-cardio', name: 'Running', type: 'cardio' }, workout_day: null
        },
      ]
      let callCount = 0
      fromFn.mockImplementation(() => {
        callCount++
        if (callCount <= 1) {
          ;(mockChain as any).__setResolved({ data: null, error: null })
        } else {
          ;(mockChain as any).__setResolved({ data: rows, error: null })
        }
        return mockChain
      })

      const workouts: ScheduleWorkoutItem[] = [
        { type: 'weights', id: 'wd-push' },
        { type: 'cardio', id: 'tmpl-cardio' },
      ]
      const result = await saveScheduleDayWorkouts(USER_ID, 1, workouts)

      expect(result).toHaveLength(2)
      expect(result[0].sort_order).toBe(0)
      expect(result[1].sort_order).toBe(1)
    })

    it('handles cardio template - sets template_id instead of workout_day_id', async () => {
      const cardioRow = {
        id: 'new-c', user_id: USER_ID, day_number: 4,
        is_rest_day: false, template_id: 'tmpl-cycling', workout_day_id: null,
        sort_order: 0, created_at: '', updated_at: '',
        template: { id: 'tmpl-cycling', name: 'Cycling', type: 'cardio' }, workout_day: null
      }
      let callCount = 0
      fromFn.mockImplementation(() => {
        callCount++
        if (callCount <= 1) {
          ;(mockChain as any).__setResolved({ data: null, error: null })
        } else {
          ;(mockChain as any).__setResolved({ data: [cardioRow], error: null })
        }
        return mockChain
      })

      const workouts: ScheduleWorkoutItem[] = [{ type: 'cardio', id: 'tmpl-cycling' }]
      const result = await saveScheduleDayWorkouts(USER_ID, 4, workouts)

      expect(result).toHaveLength(1)
      expect(result[0].template_id).toBe('tmpl-cycling')
      expect(result[0].workout_day_id).toBeNull()
    })

    it('returns empty array when workouts list is empty (clears day)', async () => {
      ;(mockChain as any).__setResolved({ data: null, error: null })

      const result = await saveScheduleDayWorkouts(USER_ID, 5, [])

      expect(result).toEqual([])
    })

    it('logs overtraining warning when more than 3 workouts', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const rows = Array.from({ length: 4 }, (_, i) => ({
        id: `new-${i}`, user_id: USER_ID, day_number: 1,
        is_rest_day: false, template_id: null, workout_day_id: `wd-${i}`,
        sort_order: i, created_at: '', updated_at: '',
        template: null, workout_day: null
      }))
      let callCount = 0
      fromFn.mockImplementation(() => {
        callCount++
        if (callCount <= 1) {
          ;(mockChain as any).__setResolved({ data: null, error: null })
        } else {
          ;(mockChain as any).__setResolved({ data: rows, error: null })
        }
        return mockChain
      })

      const workouts: ScheduleWorkoutItem[] = Array.from({ length: 4 }, (_, i) => ({
        type: 'weights' as const,
        id: `wd-${i}`
      }))

      await saveScheduleDayWorkouts(USER_ID, 1, workouts)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Overtraining risk: User scheduling', 4, 'workouts on day', 1
      )
      consoleSpy.mockRestore()
    })

    it('throws on insert error', async () => {
      let callCount = 0
      fromFn.mockImplementation(() => {
        callCount++
        if (callCount <= 1) {
          ;(mockChain as any).__setResolved({ data: null, error: null })
        } else {
          ;(mockChain as any).__setResolved({ data: null, error: { message: 'insert failed', code: '42000' } })
        }
        return mockChain
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(
        saveScheduleDayWorkouts(USER_ID, 1, [{ type: 'weights', id: 'wd-1' }])
      ).rejects.toThrow('Failed to save schedule: insert failed')

      consoleSpy.mockRestore()
    })
  })

  // ─── clearUserSchedule ────────────────────────────────────────────

  describe('clearUserSchedule', () => {
    it('deletes all user schedules without error', async () => {
      ;(mockChain as any).__setResolved({ data: null, error: null })

      await expect(clearUserSchedule(USER_ID)).resolves.toBeUndefined()
      expect(fromFn).toHaveBeenCalledWith('user_schedules')
    })

    it('throws when supabase returns an error', async () => {
      ;(mockChain as any).__setResolved({ data: null, error: { message: 'permission denied' } })

      await expect(clearUserSchedule(USER_ID)).rejects.toEqual({ message: 'permission denied' })
    })
  })

  // ─── deleteScheduleDay ────────────────────────────────────────────

  describe('deleteScheduleDay', () => {
    it('deletes schedules for a specific day', async () => {
      ;(mockChain as any).__setResolved({ data: null, error: null })

      await expect(deleteScheduleDay(USER_ID, 3)).resolves.toBeUndefined()
      expect(fromFn).toHaveBeenCalledWith('user_schedules')
    })

    it('throws on error', async () => {
      ;(mockChain as any).__setResolved({ data: null, error: { message: 'not found' } })

      await expect(deleteScheduleDay(USER_ID, 99)).rejects.toEqual({ message: 'not found' })
    })
  })

  // ─── getWorkoutTemplates ──────────────────────────────────────────

  describe('getWorkoutTemplates', () => {
    it('returns all templates ordered by type and name', async () => {
      const templates = [
        { id: 't1', name: 'Cycling', type: 'cardio', category: 'cycle', description: null, icon: null, duration_minutes: 30, workout_day_id: null, created_at: '' },
        { id: 't2', name: 'Running', type: 'cardio', category: 'run', description: null, icon: null, duration_minutes: 30, workout_day_id: null, created_at: '' },
        { id: 't3', name: 'Core', type: 'mobility', category: 'core', description: null, icon: null, duration_minutes: 15, workout_day_id: null, created_at: '' },
      ]
      ;(mockChain as any).__setResolved({ data: templates, error: null })

      const result = await getWorkoutTemplates()

      expect(fromFn).toHaveBeenCalledWith('workout_templates')
      expect(result).toHaveLength(3)
      expect(result[0].name).toBe('Cycling')
      expect(result[2].type).toBe('mobility')
    })

    it('returns empty array and logs warning on error', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      ;(mockChain as any).__setResolved({ data: null, error: { message: 'table missing' } })

      const result = await getWorkoutTemplates()

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching workout templates:', 'table missing')
      consoleSpy.mockRestore()
    })
  })

  // ─── getWorkoutTemplatesByType ────────────────────────────────────

  describe('getWorkoutTemplatesByType', () => {
    it('filters templates by cardio type', async () => {
      const cardioTemplates = [
        { id: 't1', name: 'Cycling', type: 'cardio', category: 'cycle', description: null, icon: null, duration_minutes: 30, workout_day_id: null, created_at: '' },
      ]
      ;(mockChain as any).__setResolved({ data: cardioTemplates, error: null })

      const result = await getWorkoutTemplatesByType('cardio')

      expect(fromFn).toHaveBeenCalledWith('workout_templates')
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('cardio')
    })

    it('filters templates by mobility type', async () => {
      const mobilityTemplates = [
        { id: 't3', name: 'Core', type: 'mobility', category: 'core', description: null, icon: null, duration_minutes: 15, workout_day_id: null, created_at: '' },
        { id: 't4', name: 'Spine', type: 'mobility', category: 'spine', description: null, icon: null, duration_minutes: 20, workout_day_id: null, created_at: '' },
      ]
      ;(mockChain as any).__setResolved({ data: mobilityTemplates, error: null })

      const result = await getWorkoutTemplatesByType('mobility')

      expect(result).toHaveLength(2)
      expect(result.every(t => t.type === 'mobility')).toBe(true)
    })

    it('throws on error instead of returning empty array', async () => {
      ;(mockChain as any).__setResolved({ data: null, error: { message: 'db error' } })

      await expect(getWorkoutTemplatesByType('weights')).rejects.toEqual({ message: 'db error' })
    })
  })
})
