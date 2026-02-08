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

  it('returns duration-based summary when session has duration', () => {
    const session = makeSession({ duration_minutes: 32 })
    const stats = getCardioTemplateStats('template-run', [session], [], 1)

    expect(stats.lastSession).toBe(session)
    expect(stats.lastSessionSummary).toContain('32 min')
  })

  it('returns distance-based summary when session has distance', () => {
    const session = makeSession({
      duration_minutes: null,
      distance_value: 3.1,
      distance_unit: 'miles'
    })
    const stats = getCardioTemplateStats('template-run', [session], [], 1)

    expect(stats.lastSessionSummary).toContain('3.1 miles')
  })

  it('prefers distance over duration in summary when both exist', () => {
    const session = makeSession({
      duration_minutes: 25,
      distance_value: 3.1,
      distance_unit: 'miles'
    })
    const stats = getCardioTemplateStats('template-run', [session], [], 1)

    // Distance takes precedence
    expect(stats.lastSessionSummary).toContain('3.1 miles')
    expect(stats.lastSessionSummary).not.toContain('25 min')
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
    expect(stats.lastSessionSummary).toContain('35 min')
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
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
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
    const originalSetItem = Storage.prototype.setItem
    Storage.prototype.setItem = () => { throw new Error('QuotaExceededError') }

    // Should not throw
    expect(() => setCardioPreference('run', { mode: 'time', unit: 'min' })).not.toThrow()

    Storage.prototype.setItem = originalSetItem
  })

  it('handles localStorage.getItem throwing', () => {
    const originalGetItem = Storage.prototype.getItem
    Storage.prototype.getItem = () => { throw new Error('SecurityError') }

    expect(getCardioPreference('run')).toBeNull()

    Storage.prototype.getItem = originalGetItem
  })
})
