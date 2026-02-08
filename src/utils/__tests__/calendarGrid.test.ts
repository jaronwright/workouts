import { describe, it, expect } from 'vitest'
import {
  getMonthGridDates,
  getCycleDayForDate,
  groupSessionsByDate,
  toDateKey,
  type UnifiedSession
} from '../calendarGrid'

describe('getMonthGridDates', () => {
  it('returns exactly 42 dates', () => {
    const dates = getMonthGridDates(new Date(2024, 0, 1)) // January 2024
    expect(dates).toHaveLength(42)
  })

  it('starts on a Sunday', () => {
    const dates = getMonthGridDates(new Date(2024, 0, 1)) // January 2024
    expect(dates[0].getDay()).toBe(0) // Sunday
  })

  it('covers the entire month', () => {
    // March 2024: starts on Friday, ends on Sunday
    const dates = getMonthGridDates(new Date(2024, 2, 1))
    const marchDates = dates.filter(
      d => d.getMonth() === 2 && d.getFullYear() === 2024
    )
    // March has 31 days, all should be present
    expect(marchDates).toHaveLength(31)
  })

  it('includes leading days from previous month when month does not start on Sunday', () => {
    // March 2024 starts on a Friday, so grid should start on Sunday Feb 25
    const dates = getMonthGridDates(new Date(2024, 2, 1))
    const firstDate = dates[0]
    expect(firstDate.getMonth()).toBe(1) // February
    expect(firstDate.getDate()).toBe(25)
  })

  it('includes trailing days from next month', () => {
    // January 2024: ends on Wednesday Jan 31
    // Grid should extend into February
    const dates = getMonthGridDates(new Date(2024, 0, 1))
    const lastDate = dates[41]
    expect(lastDate.getMonth()).toBe(1) // February
  })

  it('handles a month that starts on Sunday', () => {
    // September 2024 starts on Sunday
    const dates = getMonthGridDates(new Date(2024, 8, 1))
    expect(dates[0].getMonth()).toBe(8) // September
    expect(dates[0].getDate()).toBe(1)
    expect(dates).toHaveLength(42)
  })

  it('handles February in a leap year', () => {
    // February 2024 is a leap year (29 days), starts on Thursday
    const dates = getMonthGridDates(new Date(2024, 1, 1))
    expect(dates).toHaveLength(42)
    const febDates = dates.filter(
      d => d.getMonth() === 1 && d.getFullYear() === 2024
    )
    expect(febDates).toHaveLength(29)
  })

  it('handles February in a non-leap year', () => {
    // February 2023 has 28 days, starts on Wednesday
    const dates = getMonthGridDates(new Date(2023, 1, 1))
    expect(dates).toHaveLength(42)
    const febDates = dates.filter(
      d => d.getMonth() === 1 && d.getFullYear() === 2023
    )
    expect(febDates).toHaveLength(28)
  })

  it('returns dates in chronological order', () => {
    const dates = getMonthGridDates(new Date(2024, 5, 1)) // June 2024
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i].getTime()).toBeGreaterThan(dates[i - 1].getTime())
    }
  })
})

describe('getCycleDayForDate', () => {
  const cycleStart = '2024-03-01' // Friday March 1, 2024

  it('returns 1 for the start date itself', () => {
    const result = getCycleDayForDate(new Date(2024, 2, 1), cycleStart, 7)
    expect(result).toBe(1)
  })

  it('returns null for dates before the cycle start', () => {
    const result = getCycleDayForDate(new Date(2024, 1, 28), cycleStart, 7)
    expect(result).toBeNull()
  })

  it('returns correct cycle day for dates within the first cycle', () => {
    // Day 2 of cycle
    expect(getCycleDayForDate(new Date(2024, 2, 2), cycleStart, 7)).toBe(2)
    // Day 3 of cycle
    expect(getCycleDayForDate(new Date(2024, 2, 3), cycleStart, 7)).toBe(3)
    // Day 7 of cycle
    expect(getCycleDayForDate(new Date(2024, 2, 7), cycleStart, 7)).toBe(7)
  })

  it('wraps correctly after a full cycle', () => {
    // Day 8 = 1 week + 1 day -> cycle day 1 again
    expect(getCycleDayForDate(new Date(2024, 2, 8), cycleStart, 7)).toBe(1)
    // Day 9 -> cycle day 2
    expect(getCycleDayForDate(new Date(2024, 2, 9), cycleStart, 7)).toBe(2)
  })

  it('wraps correctly over multiple cycles', () => {
    // 14 days later = exactly 2 cycles -> cycle day 1
    expect(getCycleDayForDate(new Date(2024, 2, 15), cycleStart, 7)).toBe(1)
    // 21 days later = exactly 3 cycles -> cycle day 1
    expect(getCycleDayForDate(new Date(2024, 2, 22), cycleStart, 7)).toBe(1)
  })

  it('uses default totalDays of 7 when not specified', () => {
    const result = getCycleDayForDate(new Date(2024, 2, 8), cycleStart)
    expect(result).toBe(1) // 7 days later wraps to day 1
  })

  it('works with non-7-day cycles', () => {
    // 5-day cycle
    // Day 1: March 1
    // Day 5: March 5
    // Day 6 (March 6) wraps to day 1
    expect(getCycleDayForDate(new Date(2024, 2, 1), cycleStart, 5)).toBe(1)
    expect(getCycleDayForDate(new Date(2024, 2, 5), cycleStart, 5)).toBe(5)
    expect(getCycleDayForDate(new Date(2024, 2, 6), cycleStart, 5)).toBe(1)
    expect(getCycleDayForDate(new Date(2024, 2, 7), cycleStart, 5)).toBe(2)
  })

  it('handles dates far in the future', () => {
    // 365 days later: 365 % 7 = 1, so cycle day 2
    const futureDate = new Date(2024, 2, 1)
    futureDate.setDate(futureDate.getDate() + 365)
    const result = getCycleDayForDate(futureDate, cycleStart, 7)
    expect(result).toBe(2) // 365 mod 7 = 1, so 1 + 1 = 2
  })

  it('returns null for date one day before start', () => {
    const result = getCycleDayForDate(new Date(2024, 1, 29), cycleStart, 7)
    expect(result).toBeNull()
  })
})

describe('groupSessionsByDate', () => {
  function makeSession(overrides: Partial<UnifiedSession> = {}): UnifiedSession {
    return {
      id: 'session-1',
      type: 'weights',
      name: 'Push',
      started_at: '2024-03-15T10:00:00Z',
      completed_at: '2024-03-15T11:00:00Z',
      notes: null,
      originalSession: {} as UnifiedSession['originalSession'],
      ...overrides
    }
  }

  it('groups a single session under its local date key', () => {
    const sessions = [makeSession({ started_at: '2024-03-15T10:00:00Z' })]
    const result = groupSessionsByDate(sessions, 'UTC')
    expect(result.size).toBe(1)
    expect(result.has('2024-03-15')).toBe(true)
    expect(result.get('2024-03-15')).toHaveLength(1)
  })

  it('groups multiple sessions on the same date together', () => {
    const sessions = [
      makeSession({ id: 's1', started_at: '2024-03-15T08:00:00Z' }),
      makeSession({ id: 's2', started_at: '2024-03-15T14:00:00Z' })
    ]
    const result = groupSessionsByDate(sessions, 'UTC')
    expect(result.size).toBe(1)
    expect(result.get('2024-03-15')).toHaveLength(2)
  })

  it('separates sessions on different dates', () => {
    const sessions = [
      makeSession({ id: 's1', started_at: '2024-03-15T10:00:00Z' }),
      makeSession({ id: 's2', started_at: '2024-03-16T10:00:00Z' })
    ]
    const result = groupSessionsByDate(sessions, 'UTC')
    expect(result.size).toBe(2)
    expect(result.has('2024-03-15')).toBe(true)
    expect(result.has('2024-03-16')).toBe(true)
  })

  it('returns an empty map for no sessions', () => {
    const result = groupSessionsByDate([], 'UTC')
    expect(result.size).toBe(0)
  })

  it('respects timezone when grouping by date', () => {
    // 2024-03-15T23:00:00Z is still March 15 in UTC
    // but March 16 in Asia/Tokyo (UTC+9)
    const sessions = [makeSession({ started_at: '2024-03-15T23:00:00Z' })]

    const utcResult = groupSessionsByDate(sessions, 'UTC')
    expect(utcResult.has('2024-03-15')).toBe(true)

    const tokyoResult = groupSessionsByDate(sessions, 'Asia/Tokyo')
    expect(tokyoResult.has('2024-03-16')).toBe(true)
  })

  it('groups sessions correctly across a timezone date boundary', () => {
    // Two sessions near midnight UTC
    // In US/Pacific (UTC-7/UTC-8), both are on March 15
    // In UTC, the second is on March 16
    const sessions = [
      makeSession({ id: 's1', started_at: '2024-03-15T20:00:00Z' }),
      makeSession({ id: 's2', started_at: '2024-03-16T02:00:00Z' })
    ]

    // In UTC, they are on different days
    const utcResult = groupSessionsByDate(sessions, 'UTC')
    expect(utcResult.size).toBe(2)

    // In America/Los_Angeles (UTC-7 in March), both are on March 15
    const laResult = groupSessionsByDate(sessions, 'America/Los_Angeles')
    expect(laResult.size).toBe(1)
    expect(laResult.get('2024-03-15')).toHaveLength(2)
  })
})

describe('toDateKey', () => {
  it('formats a date as YYYY-MM-DD', () => {
    const result = toDateKey(new Date(2024, 2, 15)) // March 15, 2024
    expect(result).toBe('2024-03-15')
  })

  it('pads single-digit months and days', () => {
    const result = toDateKey(new Date(2024, 0, 5)) // January 5, 2024
    expect(result).toBe('2024-01-05')
  })

  it('handles the last day of the year', () => {
    const result = toDateKey(new Date(2024, 11, 31)) // December 31, 2024
    expect(result).toBe('2024-12-31')
  })

  it('handles the first day of the year', () => {
    const result = toDateKey(new Date(2024, 0, 1)) // January 1, 2024
    expect(result).toBe('2024-01-01')
  })

  it('handles Feb 29 in a leap year', () => {
    const result = toDateKey(new Date(2024, 1, 29))
    expect(result).toBe('2024-02-29')
  })
})
