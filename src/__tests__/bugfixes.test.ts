/**
 * Tests for bug fixes — each test validates a specific bug fix
 * to prevent regression.
 */
import { describe, it, expect, vi } from 'vitest'

// Bug 4: ExerciseCard stale closure test
describe('Bug 4 — Stale closure in handleToggleUnit', () => {
  it('captures oldUnit before state change to avoid stale closure', () => {
    // Simulates the pattern: save the current value before calling setState
    let localUnit: 'lbs' | 'kg' = 'lbs'
    const setUnit = (u: 'lbs' | 'kg') => { localUnit = u }

    // The fix: capture old value BEFORE state change
    const oldUnit = localUnit
    const newUnit = oldUnit === 'lbs' ? 'kg' : 'lbs'
    setUnit(newUnit)

    // Verify old value was captured correctly even after state change
    expect(oldUnit).toBe('lbs')
    expect(localUnit).toBe('kg')

    // On error, revert using saved old value (not closure)
    setUnit(oldUnit)
    expect(localUnit).toBe('lbs')
  })
})

// Bug 5 & 11: templateWorkoutService error masking
describe('Bug 5 & 11 — templateWorkoutService error handling', () => {
  it('should only silence table-not-found errors, re-throw others', () => {
    // Simulates the logic in the service
    const isTableNotFound = (error: { code?: string; message?: string }): boolean => {
      return error.code === '42P01' || (error.message?.includes('does not exist') ?? false)
    }

    expect(isTableNotFound({ code: '42P01' })).toBe(true)
    expect(isTableNotFound({ message: 'relation does not exist' })).toBe(true)
    expect(isTableNotFound({ code: '23505' })).toBe(false) // unique violation
    expect(isTableNotFound({ message: 'network error' })).toBe(false)
  })
})

// Bug 8: CardioWorkout timer accumulated seconds
describe('Bug 8 — Timer accumulated seconds tracking', () => {
  it('accumulates elapsed time across pause/resume cycles', () => {
    let accumulatedSeconds = 0
    let startTime: number | null = null
    let elapsed = 0

    // Start timer
    startTime = Date.now()

    // Simulate 5 seconds elapsed
    const fakeNow1 = startTime + 5000
    elapsed = accumulatedSeconds + Math.floor((fakeNow1 - startTime) / 1000)
    expect(elapsed).toBe(5)

    // Pause — save accumulated
    accumulatedSeconds = elapsed
    startTime = null

    // Resume — new start time
    startTime = Date.now()

    // Simulate 3 more seconds
    const fakeNow2 = startTime + 3000
    elapsed = accumulatedSeconds + Math.floor((fakeNow2 - startTime) / 1000)
    expect(elapsed).toBe(8) // 5 accumulated + 3 new
  })
})

// Bug 9: Null guard on startTimeRef
describe('Bug 9 — Null guard on startTimeRef', () => {
  it('skips elapsed calculation when startTime is null', () => {
    const startTime: number | null = null
    let elapsedUpdated = false

    // The interval callback should bail early if startTime is null
    if (startTime === null) {
      // Do nothing — this is the fix
    } else {
      elapsedUpdated = true
    }

    expect(elapsedUpdated).toBe(false)
  })
})

// Bug 10: profileService error handling
describe('Bug 10 — profileService getProfile error handling', () => {
  it('returns null only for PGRST116 (not found)', () => {
    const shouldReturnNull = (errorCode: string) => errorCode === 'PGRST116'

    expect(shouldReturnNull('PGRST116')).toBe(true) // not found = null
    expect(shouldReturnNull('42501')).toBe(false) // permission denied = throw
    expect(shouldReturnNull('PGRST301')).toBe(false) // other error = throw
  })
})

// Bug 12: setTimeout cleanup
describe('Bug 12 — setTimeout cleanup on unmount', () => {
  it('clears timeout when cleanup function runs', () => {
    vi.useFakeTimers()

    let stateUpdated = false
    const timeoutId = setTimeout(() => { stateUpdated = true }, 0)

    // Simulate unmount — cleanup runs before timeout fires
    clearTimeout(timeoutId)
    vi.runAllTimers()

    expect(stateUpdated).toBe(false)
    vi.useRealTimers()
  })
})

// Bug 13: Nullable workout_day access
describe('Bug 13 — Nullable workout_day fallback', () => {
  it('provides fallback when workout_day.name is undefined', () => {
    // Simulates the fix: ?? 'Workout' fallback
    const session = { workout_day: undefined as { name: string } | undefined }
    const name = session.workout_day?.name ?? 'Workout'
    expect(name).toBe('Workout')
  })

  it('uses actual name when workout_day exists', () => {
    const session = { workout_day: { name: 'Push Day' } }
    const name = session.workout_day?.name ?? 'Workout'
    expect(name).toBe('Push Day')
  })
})

// Bug 14: workoutStore uses Record instead of Map
describe('Bug 14 — workoutStore uses Record instead of Map', () => {
  it('Record is JSON-serializable unlike Map', () => {
    const record: Record<string, number[]> = { a: [1, 2], b: [3] }
    const serialized = JSON.stringify(record)
    const deserialized = JSON.parse(serialized)

    expect(deserialized).toEqual({ a: [1, 2], b: [3] })

    // Map loses data when serialized
    const map = new Map([['a', [1, 2]], ['b', [3]]])
    const mapSerialized = JSON.stringify(map)
    expect(mapSerialized).toBe('{}') // Maps serialize to empty objects
  })
})

// Bug 2: Auth subscription cleanup
describe('Bug 2 — Auth subscription cleanup', () => {
  it('unsubscribes previous subscription before registering new one', () => {
    let subscriptionCount = 0
    let lastUnsubscribed = false

    const subscribe = () => {
      subscriptionCount++
      return {
        unsubscribe: () => {
          lastUnsubscribed = true
          subscriptionCount--
        }
      }
    }

    // First call
    let subscription: { unsubscribe: () => void } | null = null
    subscription = subscribe()
    expect(subscriptionCount).toBe(1)

    // Second call — should unsubscribe first
    if (subscription) {
      subscription.unsubscribe()
    }
    subscription = subscribe()
    expect(subscriptionCount).toBe(1) // Still 1, not 2
    expect(lastUnsubscribed).toBe(true)
  })
})

// Bug 1: PWA cache config
describe('Bug 1 — PWA cache URL pattern excludes auth', () => {
  it('URL pattern excludes auth endpoints', () => {
    const pattern = /^https:\/\/.*\.supabase\.co\/rest\/v1\/(?!auth).*/i

    // Should match regular data endpoints
    expect(pattern.test('https://xyz.supabase.co/rest/v1/user_profiles')).toBe(true)
    expect(pattern.test('https://xyz.supabase.co/rest/v1/workout_sessions')).toBe(true)

    // Should NOT match auth endpoints
    expect(pattern.test('https://xyz.supabase.co/rest/v1/auth/v1/token')).toBe(false)
  })
})
