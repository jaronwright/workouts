import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Calendar, Moon } from 'lucide-react'
import type { ScheduleDay, WorkoutTemplate } from '@/services/scheduleService'

// Mock workoutConfig before importing the module under test
const mockWeightsStyle = { color: '#6366F1', bgColor: 'rgba(99, 102, 241, 0.15)', gradient: 'from-indigo-500 to-indigo-400', icon: Calendar }
const mockCardioStyle = { color: '#14B8A6', bgColor: 'rgba(20, 184, 166, 0.15)', gradient: 'from-teal-500 to-teal-400', icon: Calendar }
const mockMobilityStyle = { color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)', gradient: 'from-emerald-500 to-emerald-400', icon: Calendar }

vi.mock('@/config/workoutConfig', () => ({
  getWeightsStyleByName: vi.fn(() => mockWeightsStyle),
  getCardioStyle: vi.fn(() => mockCardioStyle),
  getMobilityStyle: vi.fn(() => mockMobilityStyle),
  getWorkoutDisplayName: vi.fn((name: string) => {
    const map: Record<string, string> = {
      'PUSH (Chest, Shoulders, Triceps)': 'Push',
      'Pull (Back, Biceps, Rear Delts)': 'Pull',
      'LEGS (Quads, Hamstrings, Calves)': 'Legs',
      'Upper Body': 'Upper',
      'Lower Body': 'Lower',
    }
    return map[name] || null
  })
}))

import { getDayInfo } from '../scheduleUtils'
import { getCurrentCycleDay, getTodayInTimezone } from '../cycleDay'
import { getCycleDayForDate } from '../calendarGrid'
import {
  getWeightsStyleByName,
  getCardioStyle,
  getMobilityStyle,
  getWorkoutDisplayName
} from '@/config/workoutConfig'

function makeScheduleDay(overrides: Partial<ScheduleDay> = {}): ScheduleDay {
  return {
    id: 'sched-1',
    user_id: 'user-1',
    day_number: 1,
    template_id: null,
    workout_day_id: null,
    is_rest_day: false,
    sort_order: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  }
}

function makeTemplate(overrides: Partial<WorkoutTemplate> = {}): WorkoutTemplate {
  return {
    id: 'tmpl-1',
    name: 'Cycling',
    type: 'cardio',
    category: 'cycle',
    description: null,
    icon: null,
    duration_minutes: 30,
    workout_day_id: null,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides
  }
}

// ═══════════════════════════════════════════════════════════════════════
// getDayInfo - Additional Integration Tests
// ═══════════════════════════════════════════════════════════════════════

describe('getDayInfo - integration scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns "Not set" state with correct CSS variables when schedule is null', () => {
    const result = getDayInfo(undefined, 7)

    expect(result).toEqual({
      dayNumber: 7,
      icon: Calendar,
      color: 'var(--color-text-muted)',
      bgColor: 'var(--color-surface-hover)',
      name: 'Not set',
      isRest: false,
    })
    expect(result.workoutDayId).toBeUndefined()
    expect(result.templateId).toBeUndefined()
    expect(result.templateType).toBeUndefined()
  })

  it('returns rest day with Moon icon and gray colors', () => {
    const schedule = makeScheduleDay({ is_rest_day: true, day_number: 4 })
    const result = getDayInfo(schedule, 4)

    expect(result.icon).toBe(Moon)
    expect(result.color).toBe('#6B7280')
    expect(result.bgColor).toBe('rgba(107, 114, 128, 0.15)')
    expect(result.name).toBe('Rest')
    expect(result.isRest).toBe(true)
    expect(result.workoutDayId).toBeUndefined()
  })

  it('returns weights workout info with style from getWeightsStyleByName', () => {
    const schedule = makeScheduleDay({
      workout_day_id: 'wd-upper',
      workout_day: { id: 'wd-upper', name: 'Upper Body', day_number: 1 }
    })

    const result = getDayInfo(schedule, 1)

    expect(getWeightsStyleByName).toHaveBeenCalledWith('Upper Body')
    expect(getWorkoutDisplayName).toHaveBeenCalledWith('Upper Body')
    expect(result.name).toBe('Upper')
    expect(result.icon).toBe(mockWeightsStyle.icon)
    expect(result.color).toBe(mockWeightsStyle.color)
    expect(result.bgColor).toBe(`${mockWeightsStyle.color}20`)
    expect(result.isRest).toBe(false)
    expect(result.workoutDayId).toBe('wd-upper')
  })

  it('returns cardio template info with templateType set to "cardio"', () => {
    const schedule = makeScheduleDay({
      template_id: 'tmpl-run',
      template: makeTemplate({
        id: 'tmpl-run',
        name: 'Running',
        type: 'cardio',
        category: 'run',
        duration_minutes: 30,
      })
    })

    const result = getDayInfo(schedule, 2)

    expect(getCardioStyle).toHaveBeenCalledWith('run')
    expect(result.name).toBe('Running')
    expect(result.templateId).toBe('tmpl-run')
    expect(result.templateType).toBe('cardio')
    expect(result.workoutDayId).toBeUndefined()
    expect(result.isRest).toBe(false)
  })

  it('returns mobility template info without workout_day_id link', () => {
    const schedule = makeScheduleDay({
      template_id: 'tmpl-core',
      template: makeTemplate({
        id: 'tmpl-core',
        name: 'Core Stability',
        type: 'mobility',
        category: 'core',
        duration_minutes: 15,
        workout_day_id: null,
      })
    })

    const result = getDayInfo(schedule, 6)

    expect(getMobilityStyle).toHaveBeenCalledWith('core')
    expect(result.name).toBe('Core Stability')
    expect(result.templateId).toBe('tmpl-core')
    expect(result.templateType).toBe('mobility')
    expect(result.workoutDayId).toBeUndefined()
  })

  it('returns mobility template with workoutDayId when template has workout_day_id', () => {
    const schedule = makeScheduleDay({
      template_id: 'tmpl-spine',
      template: makeTemplate({
        id: 'tmpl-spine',
        name: 'Spine Mobility',
        type: 'mobility',
        category: 'spine',
        duration_minutes: 15,
        workout_day_id: 'wd-linked',
      })
    })

    const result = getDayInfo(schedule, 3)

    expect(result.workoutDayId).toBe('wd-linked')
    // When mobility template has workout_day_id, templateId and templateType are undefined
    expect(result.templateId).toBeUndefined()
    expect(result.templateType).toBeUndefined()
  })

  it('uses workout_day.name as fallback when getWorkoutDisplayName returns falsy', () => {
    vi.mocked(getWorkoutDisplayName).mockReturnValueOnce('')

    const schedule = makeScheduleDay({
      workout_day_id: 'wd-custom',
      workout_day: { id: 'wd-custom', name: 'My Custom Split', day_number: 1 }
    })

    const result = getDayInfo(schedule, 1)

    expect(result.name).toBe('My Custom Split')
  })

  it('returns fallback "Not set" when schedule has no rest, workout_day, or template', () => {
    const schedule = makeScheduleDay({
      is_rest_day: false,
      workout_day: null,
      template: null,
      workout_day_id: null,
      template_id: null,
    })

    const result = getDayInfo(schedule, 5)

    expect(result.icon).toBe(Calendar)
    expect(result.name).toBe('Not set')
    expect(result.isRest).toBe(false)
    expect(result.color).toBe('var(--color-text-muted)')
  })

  it('prioritizes rest day over workout_day data', () => {
    // If is_rest_day is true, it should return rest even if workout_day exists
    const schedule = makeScheduleDay({
      is_rest_day: true,
      workout_day_id: 'wd-push',
      workout_day: { id: 'wd-push', name: 'Push', day_number: 1 }
    })

    const result = getDayInfo(schedule, 1)

    expect(result.name).toBe('Rest')
    expect(result.isRest).toBe(true)
    expect(result.icon).toBe(Moon)
    // getWeightsStyleByName should not be called for rest days
    expect(getWeightsStyleByName).not.toHaveBeenCalled()
  })

  it('prioritizes workout_day over template data', () => {
    // If both workout_day and template exist, workout_day should win
    const schedule = makeScheduleDay({
      workout_day_id: 'wd-legs',
      workout_day: { id: 'wd-legs', name: 'LEGS (Quads, Hamstrings, Calves)', day_number: 3 },
      template_id: 'tmpl-cardio',
      template: makeTemplate({ name: 'Running', type: 'cardio' })
    })

    const result = getDayInfo(schedule, 3)

    expect(result.name).toBe('Legs')
    expect(getWeightsStyleByName).toHaveBeenCalled()
    expect(getCardioStyle).not.toHaveBeenCalled()
  })
})

// ═══════════════════════════════════════════════════════════════════════
// getCurrentCycleDay - from cycleDay.ts
// ═══════════════════════════════════════════════════════════════════════

describe('getCurrentCycleDay', () => {
  const TIMEZONE = 'America/Chicago'

  it('returns 1 when start date is today', () => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date())

    const result = getCurrentCycleDay(today, TIMEZONE)
    expect(result).toBe(1)
  })

  it('returns correct day for a known offset', () => {
    const today = getTodayInTimezone(TIMEZONE)
    // Start date = 3 days ago should give day 4
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 3)
    const startStr = startDate.toISOString().substring(0, 10)

    const result = getCurrentCycleDay(startStr, TIMEZONE)
    expect(result).toBe(4)
  })

  it('wraps around after 7 days', () => {
    const today = getTodayInTimezone(TIMEZONE)
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 7)
    const startStr = startDate.toISOString().substring(0, 10)

    const result = getCurrentCycleDay(startStr, TIMEZONE)
    expect(result).toBe(1) // 7 % 7 = 0 -> day 1
  })

  it('handles custom totalDays parameter', () => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date())

    // On start day with totalDays=5, should return 1
    expect(getCurrentCycleDay(today, TIMEZONE, 5)).toBe(1)
  })

  it('handles future start date using double-modulo', () => {
    const today = getTodayInTimezone(TIMEZONE)
    const futureDate = new Date(today)
    futureDate.setDate(futureDate.getDate() + 2)
    const futureStr = futureDate.toISOString().substring(0, 10)

    // -2 days offset: ((-2 % 7) + 7) % 7 + 1 = (5 + 7) % 7 + 1 = 5 + 1 = 6
    const result = getCurrentCycleDay(futureStr, TIMEZONE)
    expect(result).toBe(6)
  })

  it('returns consistent results for different timezone formats', () => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'UTC',
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date())

    const resultUtc = getCurrentCycleDay(today, 'UTC')
    expect(resultUtc).toBe(1)
  })
})

// ═══════════════════════════════════════════════════════════════════════
// getCycleDayForDate - from calendarGrid.ts
// ═══════════════════════════════════════════════════════════════════════

describe('getCycleDayForDate', () => {
  const cycleStart = '2024-03-01'

  it('returns 1 for the start date itself', () => {
    const result = getCycleDayForDate(new Date(2024, 2, 1), cycleStart, 7)
    expect(result).toBe(1)
  })

  it('returns null for dates before cycle start', () => {
    const result = getCycleDayForDate(new Date(2024, 1, 28), cycleStart, 7)
    expect(result).toBeNull()
  })

  it('returns sequential day numbers within first cycle', () => {
    expect(getCycleDayForDate(new Date(2024, 2, 2), cycleStart, 7)).toBe(2)
    expect(getCycleDayForDate(new Date(2024, 2, 3), cycleStart, 7)).toBe(3)
    expect(getCycleDayForDate(new Date(2024, 2, 7), cycleStart, 7)).toBe(7)
  })

  it('wraps back to 1 at the start of the second cycle', () => {
    expect(getCycleDayForDate(new Date(2024, 2, 8), cycleStart, 7)).toBe(1)
    expect(getCycleDayForDate(new Date(2024, 2, 9), cycleStart, 7)).toBe(2)
  })

  it('handles non-7 totalDays correctly', () => {
    // 5-day cycle starting March 1
    expect(getCycleDayForDate(new Date(2024, 2, 1), cycleStart, 5)).toBe(1)
    expect(getCycleDayForDate(new Date(2024, 2, 5), cycleStart, 5)).toBe(5)
    expect(getCycleDayForDate(new Date(2024, 2, 6), cycleStart, 5)).toBe(1) // wraps
    expect(getCycleDayForDate(new Date(2024, 2, 7), cycleStart, 5)).toBe(2)
  })

  it('defaults to 7-day cycle when totalDays not specified', () => {
    const result = getCycleDayForDate(new Date(2024, 2, 8), cycleStart)
    // Day 8 from start = (7 % 7) + 1 = 1
    expect(result).toBe(1)
  })

  it('handles dates far in the future correctly', () => {
    // 365 days later: 365 % 7 = 1, so day 2
    const farFuture = new Date(2025, 1, 28) // ~365 days from March 1, 2024
    const result = getCycleDayForDate(farFuture, cycleStart, 7)
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(7)
  })

  it('returns 1 for a 1-day cycle on any future date', () => {
    const result = getCycleDayForDate(new Date(2024, 2, 5), cycleStart, 1)
    expect(result).toBe(1)
  })
})
