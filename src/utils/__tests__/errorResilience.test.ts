/* eslint-disable @typescript-eslint/no-explicit-any, no-constant-binary-expression */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock zustand persist middleware as a passthrough to avoid localStorage issues in tests
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual<typeof import('zustand/middleware')>('zustand/middleware')
  return {
    ...actual,
    persist: (fn: unknown) => fn,
  }
})

import {
  getWorkoutDisplayName,
  getWeightsStyleByName,
  getWeightsStyleByDayNumber,
  getCardioStyle,
  getMobilityStyle,
  getCategoryLabel,
  CATEGORY_DEFAULTS
} from '@/config/workoutConfig'
import { formatDuration, formatReps } from '@/utils/formatters'
import { convertWeight, formatWeightWithUnit } from '@/stores/settingsStore'

// ──────────────────────────────────────────────────────
// Network failure simulation
// ──────────────────────────────────────────────────────

vi.mock('@/services/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    }
  }
}))

describe('Network error handling', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('workoutService.getWorkoutPlans throws on supabase error', async () => {
    const { supabase } = await import('@/services/supabase')
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'network error', code: 'NETWORK_ERROR', details: '', hint: '' }
        })
      })
    } as any)

    const { getWorkoutPlans } = await import('@/services/workoutService')
    await expect(getWorkoutPlans()).rejects.toMatchObject({ message: 'network error' })
  })

  it('profileService.getProfile returns null for PGRST116 (no rows found)', async () => {
    const { supabase } = await import('@/services/supabase')
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'not found', code: 'PGRST116', details: '', hint: '' }
          })
        })
      })
    } as any)

    const { getProfile } = await import('@/services/profileService')
    const result = await getProfile('user-123')
    expect(result).toBeNull()
  })

  it('profileService.getProfile throws for permission denied (42501)', async () => {
    const { supabase } = await import('@/services/supabase')
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'permission denied', code: '42501', details: '', hint: '' }
          })
        })
      })
    } as any)

    const { getProfile } = await import('@/services/profileService')
    await expect(getProfile('user-123')).rejects.toMatchObject({
      message: 'permission denied'
    })
  })

  it('workoutService.getWorkoutSession returns null for PGRST116', async () => {
    const { supabase } = await import('@/services/supabase')
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'not found', code: 'PGRST116', details: '', hint: '' }
          })
        })
      })
    } as any)

    const { getWorkoutSession } = await import('@/services/workoutService')
    const result = await getWorkoutSession('nonexistent-id')
    expect(result).toBeNull()
  })
})

// ──────────────────────────────────────────────────────
// Input validation edge cases (workoutConfig helpers)
// ──────────────────────────────────────────────────────

describe('Input validation', () => {
  it('getWorkoutDisplayName handles empty string, undefined, and null', () => {
    expect(getWorkoutDisplayName('')).toBe('Workout')
    expect(getWorkoutDisplayName(undefined)).toBe('Workout')
    expect(getWorkoutDisplayName(null)).toBe('Workout')
  })

  it('getWorkoutDisplayName falls back to title-cased first word for unknowns', () => {
    expect(getWorkoutDisplayName('Zumba Advanced Class')).toBe('Zumba')
  })

  it('getWorkoutDisplayName extracts name from parenthesized format', () => {
    expect(getWorkoutDisplayName('PUSH (Chest, Shoulders, Triceps)')).toBe('Push')
    expect(getWorkoutDisplayName('Pull (Back, Biceps, Rear Delts)')).toBe('Pull')
  })

  it('getWeightsStyleByName returns default for unknown and empty inputs', () => {
    const unknown = getWeightsStyleByName('totally unknown workout')
    expect(unknown).toEqual(CATEGORY_DEFAULTS.weights)
    expect(unknown.color).toBeDefined()

    const empty = getWeightsStyleByName('')
    expect(empty).toEqual(CATEGORY_DEFAULTS.weights)
  })

  it('getWeightsStyleByDayNumber returns default for out-of-range values', () => {
    expect(getWeightsStyleByDayNumber(99)).toEqual(CATEGORY_DEFAULTS.weights)
    expect(getWeightsStyleByDayNumber(0)).toEqual(CATEGORY_DEFAULTS.weights)
    expect(getWeightsStyleByDayNumber(-1)).toEqual(CATEGORY_DEFAULTS.weights)
  })

  it('getCardioStyle handles null, empty, and unknown categories', () => {
    expect(getCardioStyle(null)).toEqual(CATEGORY_DEFAULTS.cardio)
    expect(getCardioStyle('')).toEqual(CATEGORY_DEFAULTS.cardio)
    expect(getCardioStyle('skydiving')).toEqual(CATEGORY_DEFAULTS.cardio)
  })

  it('getMobilityStyle handles null, empty, and unknown categories', () => {
    expect(getMobilityStyle(null)).toEqual(CATEGORY_DEFAULTS.mobility)
    expect(getMobilityStyle('')).toEqual(CATEGORY_DEFAULTS.mobility)
    expect(getMobilityStyle('underwater_yoga')).toEqual(CATEGORY_DEFAULTS.mobility)
  })

  it('getCategoryLabel returns input for unknowns and is case-insensitive', () => {
    expect(getCategoryLabel('unknown')).toBe('unknown')
    expect(getCategoryLabel('')).toBe('')
    expect(getCategoryLabel('WEIGHTS')).toBe('Weights')
    expect(getCategoryLabel('Cardio')).toBe('Cardio')
  })
})

// ──────────────────────────────────────────────────────
// Falsy value handling (nullish coalescing vs OR)
// ──────────────────────────────────────────────────────

describe('Falsy value handling (nullish coalescing)', () => {
  it('numeric 0 is preserved by ?? but lost with ||', () => {
    const duration = 0
    expect(duration ?? null).toBe(0)     // ?? preserves 0
    expect(duration || null).toBe(null)  // || converts 0 to null (bug pattern!)
  })

  it('0 reps and duration format correctly (not treated as null)', () => {
    expect(formatReps(0)).toBe('0')
    expect(formatDuration(0)).toBe('0:00')
  })

  it('null and undefined pass through both operators', () => {
    expect(null ?? null).toBe(null)
    expect(undefined ?? null).toBe(null)
    expect(null || null).toBe(null)
    expect(undefined || null).toBe(null)
  })

  it('empty string notes become null via || (correct for strings)', () => {
    expect('' || null).toBe(null)
  })
})

// ──────────────────────────────────────────────────────
// Weight conversion edge cases
// ──────────────────────────────────────────────────────

describe('Weight conversion edge cases', () => {
  it('convertWeight returns same value for identical units', () => {
    expect(convertWeight(100, 'lbs', 'lbs')).toBe(100)
    expect(convertWeight(100, 'kg', 'kg')).toBe(100)
  })

  it('convertWeight handles 0 and round-trip is approximately equal', () => {
    expect(convertWeight(0, 'lbs', 'kg')).toBe(0)
    const inKg = convertWeight(100, 'lbs', 'kg')
    const backToLbs = convertWeight(inKg, 'kg', 'lbs')
    expect(backToLbs).toBeCloseTo(100, 0)
  })

  it('formatWeightWithUnit handles null and 0', () => {
    expect(formatWeightWithUnit(null, 'lbs')).toBe('—')
    expect(formatWeightWithUnit(0, 'kg')).toBe('0 kg')
  })
})

// ──────────────────────────────────────────────────────
// Store edge cases
// ──────────────────────────────────────────────────────

describe('Store edge cases', () => {
  describe('workoutStore', () => {
    beforeEach(async () => {
      const { useWorkoutStore } = await import('@/stores/workoutStore')
      useWorkoutStore.getState().clearWorkout()
    })

    it('clearWorkout resets all state', async () => {
      const { useWorkoutStore } = await import('@/stores/workoutStore')
      const store = useWorkoutStore.getState()

      store.setActiveSession({ id: 'test-session' } as any)
      store.setActiveWorkoutDay({ id: 'test-day' } as any)
      store.addCompletedSet('exercise-1', { id: 'set-1' } as any)
      store.startRestTimer(60)

      store.clearWorkout()
      const state = useWorkoutStore.getState()
      expect(state.activeSession).toBeNull()
      expect(state.activeWorkoutDay).toBeNull()
      expect(state.completedSets).toEqual({})
      expect(state.restTimerSeconds).toBe(0)
      expect(state.restTimerInitialSeconds).toBe(0)
      expect(state.isRestTimerActive).toBe(false)
    })

    it('addCompletedSet accumulates and removeCompletedSets targets correctly', async () => {
      const { useWorkoutStore } = await import('@/stores/workoutStore')
      const store = useWorkoutStore.getState()

      store.addCompletedSet('exercise-1', { id: 'set-1' } as any)
      store.addCompletedSet('exercise-1', { id: 'set-2' } as any)
      store.addCompletedSet('exercise-2', { id: 'set-3' } as any)
      expect(useWorkoutStore.getState().completedSets['exercise-1']).toHaveLength(2)

      store.removeCompletedSets('exercise-1')
      expect(useWorkoutStore.getState().completedSets['exercise-1']).toBeUndefined()
      expect(useWorkoutStore.getState().completedSets['exercise-2']).toHaveLength(1)
    })

    it('decrementRestTimer stops at 0 and resetRestTimer restores initial', async () => {
      const { useWorkoutStore } = await import('@/stores/workoutStore')
      const store = useWorkoutStore.getState()

      store.startRestTimer(2)
      store.decrementRestTimer() // 2 -> 1
      store.decrementRestTimer() // 1 -> 0, timer stops
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(0)
      expect(useWorkoutStore.getState().isRestTimerActive).toBe(false)

      store.startRestTimer(90)
      store.decrementRestTimer()
      store.resetRestTimer()
      expect(useWorkoutStore.getState().restTimerSeconds).toBe(90)
      expect(useWorkoutStore.getState().isRestTimerActive).toBe(true)
    })
  })

  describe('settingsStore', () => {
    it('preserves weight unit preference across changes', async () => {
      const { useSettingsStore } = await import('@/stores/settingsStore')
      expect(useSettingsStore.getState().weightUnit).toBe('lbs')

      useSettingsStore.getState().setWeightUnit('kg')
      expect(useSettingsStore.getState().weightUnit).toBe('kg')

      useSettingsStore.getState().setWeightUnit('lbs')
      expect(useSettingsStore.getState().weightUnit).toBe('lbs')
    })
  })

  describe('toastStore', () => {
    beforeEach(async () => {
      const { useToastStore } = await import('@/stores/toastStore')
      useToastStore.getState().clearToasts()
    })

    it('addToast returns unique ids and removeToast targets correctly', async () => {
      const { useToastStore } = await import('@/stores/toastStore')
      const store = useToastStore.getState()

      const id1 = store.addToast({ type: 'success', message: 'Keep', duration: 0 })
      const id2 = store.addToast({ type: 'error', message: 'Remove', duration: 0 })
      expect(id1).not.toBe(id2)
      expect(useToastStore.getState().toasts).toHaveLength(2)

      store.removeToast(id2)
      expect(useToastStore.getState().toasts).toHaveLength(1)
      expect(useToastStore.getState().toasts[0].id).toBe(id1)
    })

    it('clearToasts removes all and removeToast with bad id does not crash', async () => {
      const { useToastStore } = await import('@/stores/toastStore')
      const store = useToastStore.getState()

      store.addToast({ type: 'success', message: 'One', duration: 0 })
      store.addToast({ type: 'info', message: 'Two', duration: 0 })
      store.clearToasts()
      expect(useToastStore.getState().toasts).toHaveLength(0)

      store.addToast({ type: 'warning', message: 'Three', duration: 0 })
      expect(() => store.removeToast('nonexistent-id')).not.toThrow()
      expect(useToastStore.getState().toasts).toHaveLength(1)
    })
  })
})
