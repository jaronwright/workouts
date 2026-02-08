import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getCardioTemplateStats,
  getCardioPreference,
  setCardioPreference,
  CARDIO_INPUT_CONFIG,
  type CardioPreference
} from '../cardioUtils'
import type { TemplateWorkoutSession } from '@/services/templateWorkoutService'
import type { ScheduleDay } from '@/services/scheduleService'

// Mock formatRelativeTime to avoid date-fns time sensitivity
vi.mock('@/utils/formatters', () => ({
  formatRelativeTime: vi.fn((date: string) => {
    // Return a deterministic relative time based on input
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'less than a minute ago'
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  })
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeSession(overrides: Partial<TemplateWorkoutSession> = {}): TemplateWorkoutSession {
  return {
    id: crypto.randomUUID(),
    user_id: 'user-1',
    template_id: 'template-run',
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    duration_minutes: 30,
    distance_value: null,
    distance_unit: null,
    notes: null,
    ...overrides
  }
}

function makeScheduleDay(overrides: Partial<ScheduleDay> = {}): ScheduleDay {
  return {
    id: crypto.randomUUID(),
    user_id: 'user-1',
    day_number: 1,
    template_id: null,
    workout_day_id: null,
    is_rest_day: false,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }
}

// ─── CARDIO_INPUT_CONFIG ────────────────────────────────────────────────────

describe('CARDIO_INPUT_CONFIG', () => {
  it('has entries for all expected cardio categories', () => {
    expect(Object.keys(CARDIO_INPUT_CONFIG)).toEqual(
      expect.arrayContaining(['run', 'cycle', 'stair_stepper', 'swim', 'rower'])
    )
  })

  it('every category has at least one mode with "time"', () => {
    for (const [category, modes] of Object.entries(CARDIO_INPUT_CONFIG)) {
      const hasTime = modes.some(m => m.mode === 'time')
      expect(hasTime, `${category} should have a time mode`).toBe(true)
    }
  })

  it('run and cycle have both time and distance modes', () => {
    for (const cat of ['run', 'cycle']) {
      const modes = CARDIO_INPUT_CONFIG[cat]
      expect(modes).toHaveLength(2)
      expect(modes[0].mode).toBe('time')
      expect(modes[1].mode).toBe('distance')
    }
  })

  it('stair_stepper and rower only have time mode', () => {
    for (const cat of ['stair_stepper', 'rower']) {
      const modes = CARDIO_INPUT_CONFIG[cat]
      expect(modes).toHaveLength(1)
      expect(modes[0].mode).toBe('time')
    }
  })

  it('swim has time and distance modes, with slider on distance', () => {
    const modes = CARDIO_INPUT_CONFIG.swim
    expect(modes).toHaveLength(2)
    expect(modes[1].mode).toBe('distance')
    expect(modes[1].slider).toBeDefined()
    expect(modes[1].slider!.min).toBe(500)
    expect(modes[1].slider!.max).toBe(5000)
    expect(modes[1].slider!.step).toBe(100)
  })
})

// ─── getCardioTemplateStats ─────────────────────────────────────────────────

describe('getCardioTemplateStats', () => {
  it('returns empty stats when no sessions exist', () => {
    const stats = getCardioTemplateStats('template-run', [], [], 1)

    expect(stats.lastSession).toBeNull()
    expect(stats.lastSessionSummary).toBe('No sessions yet')
    expect(stats.weeklyCount).toBe(0)
    expect(stats.nextScheduledDay).toBeNull()
  })

  it('ignores sessions for other templates', () => {
    const otherSession = makeSession({ template_id: 'template-swim' })
    const stats = getCardioTemplateStats('template-run', [otherSession], [], 1)

    expect(stats.lastSession).toBeNull()
    expect(stats.lastSessionSummary).toBe('No sessions yet')
    expect(stats.weeklyCount).toBe(0)
  })

  it('ignores incomplete sessions (no completed_at)', () => {
    const incomplete = makeSession({ completed_at: null })
    const stats = getCardioTemplateStats('template-run', [incomplete], [], 1)

    expect(stats.lastSession).toBeNull()
    expect(stats.weeklyCount).toBe(0)
  })

  it('returns session count summary when session has duration', () => {
    const session = makeSession({ duration_minutes: 32 })
    const stats = getCardioTemplateStats('template-run', [session], [], 1)

    expect(stats.lastSession).toBe(session)
    expect(stats.lastSessionSummary).toBe('1 session completed')
  })

  it('returns session count summary when session has distance', () => {
    const session = makeSession({
      duration_minutes: null,
      distance_value: 3.1,
      distance_unit: 'miles'
    })
    const stats = getCardioTemplateStats('template-run', [session], [], 1)

    expect(stats.lastSessionSummary).toBe('1 session completed')
  })

  it('returns session count summary when both duration and distance exist', () => {
    const session = makeSession({
      duration_minutes: 25,
      distance_value: 3.1,
      distance_unit: 'miles'
    })
    const stats = getCardioTemplateStats('template-run', [session], [], 1)

    expect(stats.lastSessionSummary).toBe('1 session completed')
  })

  it('returns most recent session as lastSession', () => {
    const older = makeSession({
      completed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      duration_minutes: 20
    })
    const newer = makeSession({
      completed_at: new Date().toISOString(),
      duration_minutes: 35
    })
    const stats = getCardioTemplateStats('template-run', [older, newer], [], 1)

    expect(stats.lastSession).toBe(newer)
    expect(stats.lastSessionSummary).toBe('2 sessions completed')
  })

  it('counts weekly sessions correctly', () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const thisWeekSession1 = makeSession({
      completed_at: new Date(startOfWeek.getTime() + 3600000).toISOString()
    })
    const thisWeekSession2 = makeSession({
      completed_at: new Date().toISOString()
    })
    const lastWeekSession = makeSession({
      completed_at: new Date(startOfWeek.getTime() - 86400000).toISOString()
    })

    const stats = getCardioTemplateStats(
      'template-run',
      [thisWeekSession1, thisWeekSession2, lastWeekSession],
      [],
      1
    )

    expect(stats.weeklyCount).toBe(2)
  })

  it('finds next scheduled day by scanning forward from current day', () => {
    const schedule: ScheduleDay[] = [
      makeScheduleDay({ day_number: 1, template_id: null, is_rest_day: true }),
      makeScheduleDay({ day_number: 2, template_id: 'template-run' }),
      makeScheduleDay({ day_number: 3, template_id: null, is_rest_day: true }),
      makeScheduleDay({ day_number: 4, template_id: 'template-swim' }),
      makeScheduleDay({ day_number: 5, template_id: 'template-run' })
    ]

    // Current day is 2, so next run should be day 5
    const stats = getCardioTemplateStats('template-run', [], schedule, 2)
    expect(stats.nextScheduledDay).toBe(5)
  })

  it('wraps around to find next scheduled day', () => {
    const schedule: ScheduleDay[] = [
      makeScheduleDay({ day_number: 1, template_id: 'template-run' }),
      makeScheduleDay({ day_number: 2, template_id: null, is_rest_day: true }),
      makeScheduleDay({ day_number: 3, template_id: null, is_rest_day: true })
    ]

    // Current day is 2, wraps around to find day 1
    const stats = getCardioTemplateStats('template-run', [], schedule, 2)
    expect(stats.nextScheduledDay).toBe(1)
  })

  it('returns null nextScheduledDay when template not in schedule', () => {
    const schedule: ScheduleDay[] = [
      makeScheduleDay({ day_number: 1, template_id: 'template-swim' }),
      makeScheduleDay({ day_number: 2, template_id: null, is_rest_day: true })
    ]

    const stats = getCardioTemplateStats('template-run', [], schedule, 1)
    expect(stats.nextScheduledDay).toBeNull()
  })
})

// ─── localStorage preference helpers ────────────────────────────────────────

describe('cardio preference helpers', () => {
  let store: Record<string, string>
  let mockLocalStorage: Storage
  let originalLocalStorage: Storage

  beforeEach(() => {
    store = {}
    originalLocalStorage = globalThis.localStorage

    mockLocalStorage = {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value }),
      removeItem: vi.fn((key: string) => { delete store[key] }),
      clear: vi.fn(() => { store = {} }),
      get length() { return Object.keys(store).length },
      key: vi.fn((index: number) => Object.keys(store)[index] ?? null)
    }

    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true
    })
  })

  it('returns null when no preference is stored', () => {
    expect(getCardioPreference('run')).toBeNull()
  })

  it('round-trips a preference correctly', () => {
    const pref: CardioPreference = { mode: 'distance', unit: 'miles' }
    setCardioPreference('run', pref)

    const result = getCardioPreference('run')
    expect(result).toEqual(pref)
  })

  it('stores preferences per category independently', () => {
    setCardioPreference('run', { mode: 'distance', unit: 'miles' })
    setCardioPreference('swim', { mode: 'time', unit: 'min' })

    expect(getCardioPreference('run')).toEqual({ mode: 'distance', unit: 'miles' })
    expect(getCardioPreference('swim')).toEqual({ mode: 'time', unit: 'min' })
  })

  it('overwrites existing preference', () => {
    setCardioPreference('run', { mode: 'time', unit: 'min' })
    setCardioPreference('run', { mode: 'distance', unit: 'miles' })

    expect(getCardioPreference('run')).toEqual({ mode: 'distance', unit: 'miles' })
  })

  it('uses correct localStorage key pattern', () => {
    setCardioPreference('run', { mode: 'time', unit: 'min' })
    expect(localStorage.getItem('cardio-pref-run')).not.toBeNull()
  })

  it('handles corrupted localStorage data gracefully', () => {
    localStorage.setItem('cardio-pref-run', 'not-json{{{')
    expect(getCardioPreference('run')).toBeNull()
  })

  it('handles localStorage.setItem throwing (private browsing)', () => {
    mockLocalStorage.setItem = () => { throw new Error('QuotaExceededError') }

    // Should not throw
    expect(() => setCardioPreference('run', { mode: 'time', unit: 'min' })).not.toThrow()
  })

  it('handles localStorage.getItem throwing', () => {
    mockLocalStorage.getItem = () => { throw new Error('SecurityError') }

    expect(getCardioPreference('run')).toBeNull()
  })
})

// ─── Additional CARDIO_INPUT_CONFIG edge case tests ──────────────────────────

describe('CARDIO_INPUT_CONFIG (extended)', () => {
  it('includes boxing category with time-only mode', () => {
    const modes = CARDIO_INPUT_CONFIG.boxing
    expect(modes).toBeDefined()
    expect(modes).toHaveLength(1)
    expect(modes[0].mode).toBe('time')
    expect(modes[0].unit).toBe('min')
  })

  it('distance modes for run and cycle use miles as unit', () => {
    for (const cat of ['run', 'cycle']) {
      const distanceMode = CARDIO_INPUT_CONFIG[cat].find(m => m.mode === 'distance')
      expect(distanceMode).toBeDefined()
      expect(distanceMode!.unit).toBe('miles')
    }
  })

  it('swim distance mode uses meters as unit', () => {
    const distanceMode = CARDIO_INPUT_CONFIG.swim.find(m => m.mode === 'distance')
    expect(distanceMode).toBeDefined()
    expect(distanceMode!.unit).toBe('meters')
  })

  it('no category has an empty modes array', () => {
    for (const [category, modes] of Object.entries(CARDIO_INPUT_CONFIG)) {
      expect(modes.length, `${category} should have at least one mode`).toBeGreaterThan(0)
    }
  })

  it('only swim has a slider configuration', () => {
    for (const [category, modes] of Object.entries(CARDIO_INPUT_CONFIG)) {
      for (const mode of modes) {
        if (category === 'swim' && mode.mode === 'distance') {
          expect(mode.slider).toBeDefined()
        } else {
          expect(mode.slider, `${category}/${mode.mode} should not have a slider`).toBeUndefined()
        }
      }
    }
  })

  it('all modes have non-empty label and unit strings', () => {
    for (const [category, modes] of Object.entries(CARDIO_INPUT_CONFIG)) {
      for (const mode of modes) {
        expect(mode.label.length, `${category} label should be non-empty`).toBeGreaterThan(0)
        expect(mode.unit.length, `${category} unit should be non-empty`).toBeGreaterThan(0)
      }
    }
  })

  it('time modes consistently use "min" as unit and "Time" as label', () => {
    for (const [, modes] of Object.entries(CARDIO_INPUT_CONFIG)) {
      const timeMode = modes.find(m => m.mode === 'time')
      if (timeMode) {
        expect(timeMode.unit).toBe('min')
        expect(timeMode.label).toBe('Time')
      }
    }
  })

  it('accessing a non-existent category returns undefined', () => {
    expect(CARDIO_INPUT_CONFIG['nonexistent']).toBeUndefined()
  })
})

// ─── Additional getCardioTemplateStats edge case tests ───────────────────────

describe('getCardioTemplateStats (extended edge cases)', () => {
  it('handles a single session that is both last and only weekly session', () => {
    const now = new Date()
    const session = makeSession({ completed_at: now.toISOString() })
    const stats = getCardioTemplateStats('template-run', [session], [], 1)

    expect(stats.lastSession).toBe(session)
    expect(stats.weeklyCount).toBe(1)
    expect(stats.lastSessionSummary).toBe('1 session completed')
  })

  it('uses singular "session" for count of 1', () => {
    const session = makeSession()
    const stats = getCardioTemplateStats('template-run', [session], [], 1)
    expect(stats.lastSessionSummary).toBe('1 session completed')
  })

  it('uses plural "sessions" for count > 1', () => {
    const s1 = makeSession({ completed_at: new Date().toISOString() })
    const s2 = makeSession({ completed_at: new Date(Date.now() - 86400000).toISOString() })
    const stats = getCardioTemplateStats('template-run', [s1, s2], [], 1)
    expect(stats.lastSessionSummary).toBe('2 sessions completed')
  })

  it('correctly sorts sessions by completed_at descending regardless of input order', () => {
    const old = makeSession({
      id: 'old',
      completed_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      duration_minutes: 10
    })
    const mid = makeSession({
      id: 'mid',
      completed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      duration_minutes: 20
    })
    const recent = makeSession({
      id: 'recent',
      completed_at: new Date().toISOString(),
      duration_minutes: 30
    })

    // Pass in random order
    const stats = getCardioTemplateStats('template-run', [mid, recent, old], [], 1)
    expect(stats.lastSession!.id).toBe('recent')
  })

  it('handles mix of complete and incomplete sessions', () => {
    const complete1 = makeSession({ completed_at: new Date().toISOString() })
    const incomplete = makeSession({ completed_at: null })
    const complete2 = makeSession({
      completed_at: new Date(Date.now() - 86400000).toISOString()
    })

    const stats = getCardioTemplateStats(
      'template-run',
      [complete1, incomplete, complete2],
      [],
      1
    )

    // Only 2 completed sessions
    expect(stats.lastSessionSummary).toBe('2 sessions completed')
  })

  it('handles mix of templates and incomplete sessions', () => {
    const mySession = makeSession({
      template_id: 'template-run',
      completed_at: new Date().toISOString()
    })
    const otherSession = makeSession({
      template_id: 'template-swim',
      completed_at: new Date().toISOString()
    })
    const incompleteMySession = makeSession({
      template_id: 'template-run',
      completed_at: null
    })

    const stats = getCardioTemplateStats(
      'template-run',
      [mySession, otherSession, incompleteMySession],
      [],
      1
    )

    expect(stats.lastSession).toBe(mySession)
    expect(stats.lastSessionSummary).toBe('1 session completed')
  })

  it('returns weeklyCount of 0 when all sessions are from before the current week', () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const lastWeek = makeSession({
      completed_at: new Date(startOfWeek.getTime() - 1).toISOString()
    })
    const twoWeeksAgo = makeSession({
      completed_at: new Date(startOfWeek.getTime() - 86400000 * 7).toISOString()
    })

    const stats = getCardioTemplateStats('template-run', [lastWeek, twoWeeksAgo], [], 1)
    expect(stats.weeklyCount).toBe(0)
    expect(stats.lastSessionSummary).toBe('2 sessions completed')
  })

  it('counts session exactly at start of week as part of the weekly count', () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const exactlyAtStart = makeSession({
      completed_at: startOfWeek.toISOString()
    })

    const stats = getCardioTemplateStats('template-run', [exactlyAtStart], [], 1)
    expect(stats.weeklyCount).toBe(1)
  })

  it('handles many sessions and counts correctly', () => {
    const now = new Date()
    const sessions: TemplateWorkoutSession[] = []
    for (let i = 0; i < 50; i++) {
      sessions.push(
        makeSession({
          completed_at: new Date(now.getTime() - i * 3600000).toISOString()
        })
      )
    }

    const stats = getCardioTemplateStats('template-run', sessions, [], 1)
    expect(stats.lastSessionSummary).toBe('50 sessions completed')
    // lastSession should be the most recent
    expect(stats.lastSession!.completed_at).toBe(sessions[0].completed_at)
  })

  // ─── nextScheduledDay edge cases ─────────────────────────────────────────

  it('returns nextScheduledDay as the current day + 1 when it is scheduled there', () => {
    const schedule: ScheduleDay[] = [
      makeScheduleDay({ day_number: 1, template_id: null, is_rest_day: true }),
      makeScheduleDay({ day_number: 2, template_id: 'template-run' }),
      makeScheduleDay({ day_number: 3, template_id: 'template-run' }),
    ]

    const stats = getCardioTemplateStats('template-run', [], schedule, 2)
    expect(stats.nextScheduledDay).toBe(3)
  })

  it('returns nextScheduledDay as current day when it wraps fully around', () => {
    // Only one day has the template, and it's the current day
    const schedule: ScheduleDay[] = [
      makeScheduleDay({ day_number: 1, template_id: null, is_rest_day: true }),
      makeScheduleDay({ day_number: 2, template_id: 'template-run' }),
      makeScheduleDay({ day_number: 3, template_id: null, is_rest_day: true }),
    ]

    // Current day is 2, scanning forward: 3 (rest), 1 (rest), 2 (run!) => wraps to self
    const stats = getCardioTemplateStats('template-run', [], schedule, 2)
    expect(stats.nextScheduledDay).toBe(2)
  })

  it('returns null nextScheduledDay when schedule is empty', () => {
    const stats = getCardioTemplateStats('template-run', [], [], 1)
    expect(stats.nextScheduledDay).toBeNull()
  })

  it('handles single-day schedule where that day has the template', () => {
    const schedule: ScheduleDay[] = [
      makeScheduleDay({ day_number: 1, template_id: 'template-run' }),
    ]

    const stats = getCardioTemplateStats('template-run', [], schedule, 1)
    expect(stats.nextScheduledDay).toBe(1)
  })

  it('handles single-day schedule where that day does NOT have the template', () => {
    const schedule: ScheduleDay[] = [
      makeScheduleDay({ day_number: 1, template_id: 'template-swim' }),
    ]

    const stats = getCardioTemplateStats('template-run', [], schedule, 1)
    expect(stats.nextScheduledDay).toBeNull()
  })

  it('handles schedule with non-contiguous day_numbers', () => {
    // day_numbers: 1, 3, 5 — max is 5, so totalDays = 5
    const schedule: ScheduleDay[] = [
      makeScheduleDay({ day_number: 1, template_id: null, is_rest_day: true }),
      makeScheduleDay({ day_number: 3, template_id: 'template-run' }),
      makeScheduleDay({ day_number: 5, template_id: null, is_rest_day: true }),
    ]

    // currentCycleDay = 1: checks 2 (no entry), 3 (run!) => 3
    const stats = getCardioTemplateStats('template-run', [], schedule, 1)
    expect(stats.nextScheduledDay).toBe(3)
  })

  it('handles schedule where multiple days have the same template', () => {
    const schedule: ScheduleDay[] = [
      makeScheduleDay({ day_number: 1, template_id: 'template-run' }),
      makeScheduleDay({ day_number: 2, template_id: null, is_rest_day: true }),
      makeScheduleDay({ day_number: 3, template_id: 'template-run' }),
      makeScheduleDay({ day_number: 4, template_id: null, is_rest_day: true }),
      makeScheduleDay({ day_number: 5, template_id: 'template-run' }),
    ]

    // currentCycleDay = 3 => checks 4 (rest), 5 (run!) => 5
    const stats = getCardioTemplateStats('template-run', [], schedule, 3)
    expect(stats.nextScheduledDay).toBe(5)
  })

  it('handles currentCycleDay equal to totalDays (last day in cycle)', () => {
    const schedule: ScheduleDay[] = [
      makeScheduleDay({ day_number: 1, template_id: 'template-run' }),
      makeScheduleDay({ day_number: 2, template_id: null, is_rest_day: true }),
      makeScheduleDay({ day_number: 3, template_id: null, is_rest_day: true }),
    ]

    // currentCycleDay = 3 (last day) => checks: ((3-1+1)%3)+1=2 (rest), ((3-1+2)%3)+1=3 (rest), ((3-1+3)%3)+1=1 (run!) => 1
    const stats = getCardioTemplateStats('template-run', [], schedule, 3)
    expect(stats.nextScheduledDay).toBe(1)
  })

  it('handles currentCycleDay of 1 (first day in cycle)', () => {
    const schedule: ScheduleDay[] = [
      makeScheduleDay({ day_number: 1, template_id: null, is_rest_day: true }),
      makeScheduleDay({ day_number: 2, template_id: null, is_rest_day: true }),
      makeScheduleDay({ day_number: 3, template_id: 'template-run' }),
    ]

    // currentCycleDay = 1 => checks 2 (rest), 3 (run!) => 3
    const stats = getCardioTemplateStats('template-run', [], schedule, 1)
    expect(stats.nextScheduledDay).toBe(3)
  })

  it('handles sessions with null duration_minutes and null distance values', () => {
    const session = makeSession({
      duration_minutes: null,
      distance_value: null,
      distance_unit: null
    })
    const stats = getCardioTemplateStats('template-run', [session], [], 1)

    expect(stats.lastSession).toBe(session)
    expect(stats.lastSessionSummary).toBe('1 session completed')
  })

  it('ignores sessions from completely different templates even when many exist', () => {
    const sessions: TemplateWorkoutSession[] = Array.from({ length: 10 }, (_, i) =>
      makeSession({
        template_id: `template-other-${i}`,
        completed_at: new Date(Date.now() - i * 86400000).toISOString()
      })
    )

    const stats = getCardioTemplateStats('template-run', sessions, [], 1)
    expect(stats.lastSession).toBeNull()
    expect(stats.lastSessionSummary).toBe('No sessions yet')
    expect(stats.weeklyCount).toBe(0)
  })

  it('handles sessions with same completed_at timestamp', () => {
    const timestamp = new Date().toISOString()
    const s1 = makeSession({ id: 'a', completed_at: timestamp })
    const s2 = makeSession({ id: 'b', completed_at: timestamp })

    const stats = getCardioTemplateStats('template-run', [s1, s2], [], 1)
    expect(stats.lastSessionSummary).toBe('2 sessions completed')
    // Both have same time, just ensure one is picked
    expect(stats.lastSession).toBeDefined()
  })

  it('handles sessions with notes field populated', () => {
    const session = makeSession({
      notes: 'Felt great today, pushed hard on intervals',
      duration_minutes: 45
    })
    const stats = getCardioTemplateStats('template-run', [session], [], 1)
    expect(stats.lastSession!.notes).toBe('Felt great today, pushed hard on intervals')
  })

  it('handles session with template joined data', () => {
    const session = makeSession({
      template: {
        id: 'template-run',
        name: 'Running',
        type: 'cardio',
        category: 'run',
        description: 'A running workout',
        icon: null,
        duration_minutes: 30,
        workout_day_id: null,
        created_at: new Date().toISOString()
      }
    })
    const stats = getCardioTemplateStats('template-run', [session], [], 1)
    expect(stats.lastSession!.template).toBeDefined()
    expect(stats.lastSession!.template!.name).toBe('Running')
  })
})

// ─── Additional cardio preference helpers edge case tests ────────────────────

describe('cardio preference helpers (extended edge cases)', () => {
  let store: Record<string, string>
  let mockLocalStorage: Storage
  let originalLocalStorage: Storage

  beforeEach(() => {
    store = {}
    originalLocalStorage = globalThis.localStorage

    mockLocalStorage = {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value }),
      removeItem: vi.fn((key: string) => { delete store[key] }),
      clear: vi.fn(() => { store = {} }),
      get length() { return Object.keys(store).length },
      key: vi.fn((index: number) => Object.keys(store)[index] ?? null)
    }

    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true
    })
  })

  it('returns null for empty string stored in localStorage', () => {
    localStorage.setItem('cardio-pref-run', '')
    // Empty string is falsy, so getItem returns '' which is truthy for !== null
    // but JSON.parse('') will throw
    expect(getCardioPreference('run')).toBeNull()
  })

  it('returns null for stored value "null"', () => {
    localStorage.setItem('cardio-pref-run', 'null')
    // JSON.parse('null') returns null, which is valid but not a CardioPreference
    const result = getCardioPreference('run')
    expect(result).toBeNull()
  })

  it('handles stored value "undefined" (invalid JSON)', () => {
    localStorage.setItem('cardio-pref-run', 'undefined')
    expect(getCardioPreference('run')).toBeNull()
  })

  it('handles stored numeric value', () => {
    localStorage.setItem('cardio-pref-run', '42')
    // JSON.parse('42') returns 42 which gets returned as-is (not a valid CardioPreference but no runtime error)
    const result = getCardioPreference('run')
    expect(result).toBe(42)
  })

  it('handles stored array value', () => {
    localStorage.setItem('cardio-pref-run', '["time","min"]')
    const result = getCardioPreference('run')
    expect(result).toEqual(['time', 'min'])
  })

  it('preserves exact preference shape through round-trip', () => {
    const pref: CardioPreference = { mode: 'time', unit: 'min' }
    setCardioPreference('cycle', pref)
    const result = getCardioPreference('cycle')
    expect(result).toEqual({ mode: 'time', unit: 'min' })
    expect(result).not.toBe(pref) // should be a new object from JSON parse
  })

  it('handles category names with special characters', () => {
    const pref: CardioPreference = { mode: 'time', unit: 'min' }
    setCardioPreference('stair_stepper', pref)
    expect(getCardioPreference('stair_stepper')).toEqual(pref)
  })

  it('handles very long category names', () => {
    const longName = 'a'.repeat(1000)
    const pref: CardioPreference = { mode: 'distance', unit: 'miles' }
    setCardioPreference(longName, pref)
    expect(getCardioPreference(longName)).toEqual(pref)
  })

  it('does not interfere with other localStorage keys', () => {
    localStorage.setItem('other-key', 'other-value')
    setCardioPreference('run', { mode: 'time', unit: 'min' })
    expect(localStorage.getItem('other-key')).toBe('other-value')
  })

  it('setCardioPreference calls localStorage.setItem with correct key and serialized value', () => {
    const pref: CardioPreference = { mode: 'distance', unit: 'meters' }
    setCardioPreference('swim', pref)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'cardio-pref-swim',
      JSON.stringify(pref)
    )
  })

  it('getCardioPreference calls localStorage.getItem with correct key', () => {
    getCardioPreference('rower')
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('cardio-pref-rower')
  })

  it('handles sequential set and get for different categories without cross-contamination', () => {
    const categories = ['run', 'cycle', 'swim', 'stair_stepper', 'rower', 'boxing']
    const prefs: CardioPreference[] = categories.map((_, i) => ({
      mode: i % 2 === 0 ? 'time' : 'distance',
      unit: i % 2 === 0 ? 'min' : 'miles'
    }))

    // Set all
    categories.forEach((cat, i) => setCardioPreference(cat, prefs[i]))

    // Verify all independently
    categories.forEach((cat, i) => {
      expect(getCardioPreference(cat)).toEqual(prefs[i])
    })
  })

  it('handles double JSON serialization gracefully on read', () => {
    // Simulate someone accidentally double-serializing
    const pref: CardioPreference = { mode: 'time', unit: 'min' }
    localStorage.setItem('cardio-pref-run', JSON.stringify(JSON.stringify(pref)))
    // JSON.parse will return a string, not the original object
    const result = getCardioPreference('run')
    expect(typeof result).toBe('string')
  })

  it('returns null when localStorage getItem returns null (key does not exist)', () => {
    // Explicitly verify getItem returns null for non-existent key
    expect(mockLocalStorage.getItem('cardio-pref-nonexistent')).toBeNull()
    expect(getCardioPreference('nonexistent')).toBeNull()
  })
})
