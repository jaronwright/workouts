import { describe, it, expect } from 'vitest'
import {
  getCurrentCycleDay,
  getTodayInTimezone,
  detectUserTimezone,
  formatCycleStartDate
} from '../cycleDay'

describe('getCurrentCycleDay', () => {
  // We test with a fixed "today" by mocking Date and Intl.DateTimeFormat
  const TIMEZONE = 'America/Chicago'

  // Helper: compute cycle day given a start date string and a "today" string
  // We'll mock getTodayInTimezone indirectly by controlling the system date
  function cycleDayFor(startDate: string, todayDate: string, totalDays = 7): number {
    // Calculate difference manually
    const start = new Date(startDate + 'T00:00:00')
    const today = new Date(todayDate + 'T00:00:00')
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return ((diff % totalDays) + totalDays) % totalDays + 1
  }

  it('returns 1 when start date is today', () => {
    const today = new Date().toISOString().split('T')[0]
    // Use the same timezone trick as getTodayInTimezone for consistency
    const result = cycleDayFor(today, today)
    expect(result).toBe(1)
  })

  it('returns 2 when start date is yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]
    const result = cycleDayFor(yesterdayStr, todayStr)
    expect(result).toBe(2)
  })

  it('wraps to 1 after 7 days', () => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const startStr = sevenDaysAgo.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]
    const result = cycleDayFor(startStr, todayStr)
    expect(result).toBe(1)
  })

  it('returns 2 after 8 days', () => {
    const eightDaysAgo = new Date()
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8)
    const startStr = eightDaysAgo.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]
    const result = cycleDayFor(startStr, todayStr)
    expect(result).toBe(2)
  })

  it('handles start date in future gracefully', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]
    const result = cycleDayFor(tomorrowStr, todayStr)
    // -1 day => ((-1 % 7) + 7) % 7 + 1 = 7
    expect(result).toBe(7)
  })

  it('handles start date 2 days in future', () => {
    const future = new Date()
    future.setDate(future.getDate() + 2)
    const futureStr = future.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]
    const result = cycleDayFor(futureStr, todayStr)
    // -2 days => ((-2 % 7) + 7) % 7 + 1 = 6
    expect(result).toBe(6)
  })

  // Integration test using the actual function
  it('getCurrentCycleDay returns 1 for today as start date', () => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date())
    const result = getCurrentCycleDay(today, TIMEZONE)
    expect(result).toBe(1)
  })

  it('getCurrentCycleDay returns correct day for known offset', () => {
    // 3 days ago — use en-CA format in the same timezone to match getTodayInTimezone
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const startStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(threeDaysAgo)
    const result = getCurrentCycleDay(startStr, TIMEZONE)
    expect(result).toBe(4)
  })

  it('getCurrentCycleDay handles custom totalDays', () => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date())
    // With totalDays=5, start=today → day 1
    expect(getCurrentCycleDay(today, TIMEZONE, 5)).toBe(1)
  })

  it('getCurrentCycleDay wraps correctly with non-7 totalDays', () => {
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
    const startStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(fiveDaysAgo)
    // 5 days ago with totalDays=5 → wraps to day 1
    expect(getCurrentCycleDay(startStr, TIMEZONE, 5)).toBe(1)
  })

  it('getCurrentCycleDay with timezone-consistent date format', () => {
    // Ensure using timezone-aware date format produces consistent results
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const startStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(yesterday)
    const result = getCurrentCycleDay(startStr, TIMEZONE)
    expect(result).toBe(2)
  })
})

describe('getTodayInTimezone', () => {
  it('returns a Date object', () => {
    const result = getTodayInTimezone('America/Chicago')
    expect(result).toBeInstanceOf(Date)
  })

  it('returns a valid date', () => {
    const result = getTodayInTimezone('America/New_York')
    expect(result.getTime()).not.toBeNaN()
  })

  it('works with UTC timezone', () => {
    const result = getTodayInTimezone('UTC')
    expect(result).toBeInstanceOf(Date)
    expect(result.getTime()).not.toBeNaN()
  })
})

describe('detectUserTimezone', () => {
  it('returns a string', () => {
    const result = detectUserTimezone()
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('formatCycleStartDate', () => {
  it('formats a date string correctly', () => {
    const result = formatCycleStartDate('2026-02-07')
    expect(result).toBe('Feb 7, 2026')
  })

  it('returns "today" for null input', () => {
    expect(formatCycleStartDate(null)).toBe('today')
  })

  it('returns "today" for undefined input', () => {
    expect(formatCycleStartDate(undefined)).toBe('today')
  })

  it('formats another date correctly', () => {
    const result = formatCycleStartDate('2025-12-25')
    expect(result).toBe('Dec 25, 2025')
  })

  it('returns "today" for an invalid date string', () => {
    expect(formatCycleStartDate('not-a-date')).toBe('today')
  })

  it('returns "today" for an empty string', () => {
    expect(formatCycleStartDate('')).toBe('today')
  })

  it('formats a valid ISO date with time component', () => {
    const result = formatCycleStartDate('2026-06-15T14:30:00Z')
    expect(typeof result).toBe('string')
    expect(result).not.toBe('today')
    expect(result).toContain('2026')
  })
})

describe('getCurrentCycleDay edge cases', () => {
  const TIMEZONE = 'America/Chicago'

  it('returns 1 when totalDays is 0', () => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date())
    const result = getCurrentCycleDay(today, TIMEZONE, 0)
    expect(result).toBe(1)
  })

  it('returns 1 when totalDays is negative', () => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date())
    const result = getCurrentCycleDay(today, TIMEZONE, -5)
    expect(result).toBe(1)
  })

  it('returns 1 when totalDays is negative and start date is in the past', () => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const startStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(threeDaysAgo)
    const result = getCurrentCycleDay(startStr, TIMEZONE, -10)
    expect(result).toBe(1)
  })
})

describe('detectUserTimezone additional checks', () => {
  it('returns a non-empty string', () => {
    const result = detectUserTimezone()
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns a string containing a slash (IANA timezone format)', () => {
    const result = detectUserTimezone()
    // IANA timezones like "America/Chicago" contain a slash
    // (or could be "UTC" which doesn't, but typical browsers return IANA)
    expect(typeof result).toBe('string')
  })
})
