import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatDuration,
  formatWeight,
  formatReps,
  formatRelativeTime,
  normalizeWorkoutName
} from '../formatters'
import {
  validatePassword,
  getStrengthColor,
  getStrengthLabel
} from '../validation'
import {
  getCurrentCycleDay,
  formatCycleStartDate,
  getTodayInTimezone
} from '../cycleDay'
import {
  getMonthGridDates,
  toDateKey,
  groupSessionsByDate,
  getCycleDayForDate,
  type UnifiedSession
} from '../calendarGrid'

// ──────────────────────────────────────────────────────
// formatters.ts edge cases
// ──────────────────────────────────────────────────────

describe('formatDuration edge cases', () => {
  it('formats very large numbers (>3600 seconds) correctly', () => {
    // 3661 seconds = 61 minutes, 1 second
    expect(formatDuration(3661)).toBe('61:01')
  })

  it('formats extremely large numbers (>86400 seconds) correctly', () => {
    // 86400 seconds = 1440 minutes, 0 seconds
    expect(formatDuration(86400)).toBe('1440:00')
  })

  it('formats 100000 seconds correctly', () => {
    // 100000 / 60 = 1666 minutes, remainder 40 seconds
    expect(formatDuration(100000)).toBe('1666:40')
  })

  it('handles negative numbers', () => {
    // Math.floor(-30/60) = -1, -30 % 60 = -30
    // Result: "-1:-30" (demonstrates the function does not guard against negative input)
    const result = formatDuration(-30)
    // The function uses Math.floor and %, so negative input produces
    // mins = Math.floor(-30/60) = -1, secs = -30 % 60 = -30
    expect(result).toBe('-1:-30')
  })

  it('handles negative number at exactly -60', () => {
    // Math.floor(-60/60) = -1, -60 % 60 = -0
    const result = formatDuration(-60)
    expect(result).toBe('-1:00')
  })

  it('formats exactly 3600 seconds (1 hour)', () => {
    expect(formatDuration(3600)).toBe('60:00')
  })

  it('formats 7200 seconds (2 hours)', () => {
    expect(formatDuration(7200)).toBe('120:00')
  })
})

describe('formatWeight edge cases', () => {
  it('formats very large weights correctly', () => {
    expect(formatWeight(99999)).toBe('99999 lbs')
  })

  it('formats very large weights with kg unit', () => {
    expect(formatWeight(99999, 'kg')).toBe('99999 kg')
  })

  it('formats weight of 0 with kg', () => {
    expect(formatWeight(0, 'kg')).toBe('0 kg')
  })

  it('formats very small decimal weights', () => {
    expect(formatWeight(0.5)).toBe('0.5 lbs')
  })

  it('handles negative weight values', () => {
    // The function does not guard against negative values
    expect(formatWeight(-10)).toBe('-10 lbs')
  })

  it('formats weight with many decimal places', () => {
    expect(formatWeight(132.123456789)).toBe('132.123456789 lbs')
  })
})

describe('formatReps edge cases', () => {
  it('formats very large rep count', () => {
    expect(formatReps(999999)).toBe('999999')
  })

  it('formats negative reps', () => {
    // The function does not guard against negative values
    expect(formatReps(-5)).toBe('-5')
  })

  it('formats float reps', () => {
    expect(formatReps(10.5)).toBe('10.5')
  })
})

describe('formatDate edge cases', () => {
  it('throws or produces invalid result for completely invalid date string', () => {
    // new Date('not-a-date') creates an Invalid Date
    expect(() => formatDate('not-a-date')).toThrow()
  })

  it('throws for empty string', () => {
    expect(() => formatDate('')).toThrow()
  })

  it('formats a date at epoch (1970-01-01)', () => {
    const result = formatDate('1970-01-01T00:00:00Z')
    expect(result).toMatch(/Jan 1, 1970|Dec 31, 1969/) // timezone dependent
  })

  it('formats a far future date', () => {
    const result = formatDate('2099-12-31T12:00:00Z')
    expect(result).toMatch(/Dec 31, 2099/)
  })
})

describe('formatRelativeTime edge cases', () => {
  it('returns "less than a minute ago" for just now', () => {
    const now = new Date()
    const result = formatRelativeTime(now)
    expect(result).toMatch(/less than a minute ago/)
  })

  it('returns relative time for a few minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const result = formatRelativeTime(fiveMinutesAgo)
    expect(result).toMatch(/5 minutes ago/)
  })

  it('returns relative time for hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const result = formatRelativeTime(twoHoursAgo)
    expect(result).toMatch(/2 hours ago|about 2 hours ago/)
  })

  it('returns relative time for days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(threeDaysAgo)
    expect(result).toMatch(/3 days ago/)
  })

  it('returns relative time for future dates', () => {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000)
    const result = formatRelativeTime(oneHourFromNow)
    expect(result).toMatch(/in about 1 hour|in 1 hour/)
  })

  it('handles string date input', () => {
    const recentIso = new Date(Date.now() - 5 * 1000).toISOString()
    const result = formatRelativeTime(recentIso)
    expect(result).toMatch(/less than a minute ago/)
  })

  it('throws for invalid date string', () => {
    expect(() => formatRelativeTime('invalid')).toThrow()
  })
})

describe('normalizeWorkoutName edge cases', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeWorkoutName('')).toBe('')
  })

  it('converts uppercase word with parentheses to title case', () => {
    expect(normalizeWorkoutName('PUSH (Chest, Shoulders, Triceps)')).toBe(
      'Push (Chest, Shoulders, Triceps)'
    )
  })

  it('does not modify already title-cased names', () => {
    expect(normalizeWorkoutName('Push Day')).toBe('Push Day')
  })

  it('handles single uppercase word without parentheses', () => {
    // No match for regex since there is no parenthesis following
    expect(normalizeWorkoutName('PUSH')).toBe('PUSH')
  })

  it('handles name with only parentheses, no leading uppercase word', () => {
    expect(normalizeWorkoutName('(test)')).toBe('(test)')
  })
})

// ──────────────────────────────────────────────────────
// validation.ts edge cases
// ──────────────────────────────────────────────────────

describe('validatePassword edge cases', () => {
  it('returns weak and 5 errors for empty string', () => {
    const result = validatePassword('')
    expect(result.valid).toBe(false)
    expect(result.strength).toBe('weak')
    expect(result.errors).toHaveLength(5)
    expect(result.checks.minLength).toBe(false)
    expect(result.checks.hasUppercase).toBe(false)
    expect(result.checks.hasLowercase).toBe(false)
    expect(result.checks.hasNumber).toBe(false)
    expect(result.checks.hasSpecialChar).toBe(false)
  })

  it('handles very long passwords (>100 chars)', () => {
    const longPassword = 'Aa1!' + 'x'.repeat(200)
    const result = validatePassword(longPassword)
    expect(result.valid).toBe(true)
    expect(result.strength).toBe('strong')
    expect(result.errors).toHaveLength(0)
  })

  it('handles password with only spaces', () => {
    const result = validatePassword('        ') // 8 spaces
    expect(result.checks.minLength).toBe(true)
    expect(result.checks.hasUppercase).toBe(false)
    expect(result.checks.hasLowercase).toBe(false)
    expect(result.checks.hasNumber).toBe(false)
    expect(result.checks.hasSpecialChar).toBe(false)
    expect(result.valid).toBe(false)
    // Only minLength passes => 1 check => weak
    expect(result.strength).toBe('weak')
  })

  it('handles password with unicode characters', () => {
    const result = validatePassword('Aa1!unicorn')
    expect(result.valid).toBe(true)
  })

  it('handles password with emoji characters', () => {
    const result = validatePassword('Aa1!    ')
    // Emojis are not uppercase, lowercase, numbers, or special chars by the regex
    expect(result.valid).toBe(true)
    expect(result.strength).toBe('strong')
  })

  it('handles password with non-Latin uppercase letters', () => {
    // Characters like capital accented letters may not match [A-Z]
    const result = validatePassword('aa1!aaaaa')
    expect(result.checks.hasUppercase).toBe(false)
    expect(result.valid).toBe(false)
  })

  it('reports exactly 4 errors when only minLength passes', () => {
    const result = validatePassword('        ') // 8 spaces
    expect(result.errors).toHaveLength(4)
    expect(result.errors).toContain('At least one uppercase letter')
    expect(result.errors).toContain('At least one lowercase letter')
    expect(result.errors).toContain('At least one number')
    expect(result.errors).toContain('At least one special character (!@#$%^&*...)')
  })

  it('correctly counts 2 passed checks as weak', () => {
    // lowercase + minLength
    const result = validatePassword('abcdefgh')
    expect(result.checks.minLength).toBe(true)
    expect(result.checks.hasLowercase).toBe(true)
    expect(result.checks.hasUppercase).toBe(false)
    expect(result.checks.hasNumber).toBe(false)
    expect(result.checks.hasSpecialChar).toBe(false)
    expect(result.strength).toBe('weak')
  })

  it('correctly counts 3 passed checks as fair', () => {
    // lowercase + uppercase + minLength
    const result = validatePassword('Abcdefgh')
    expect(result.checks.minLength).toBe(true)
    expect(result.checks.hasLowercase).toBe(true)
    expect(result.checks.hasUppercase).toBe(true)
    expect(result.checks.hasNumber).toBe(false)
    expect(result.checks.hasSpecialChar).toBe(false)
    expect(result.strength).toBe('fair')
  })

  it('correctly counts 4 passed checks as good', () => {
    // lowercase + uppercase + number + minLength
    const result = validatePassword('Abcdefg1')
    expect(result.checks.minLength).toBe(true)
    expect(result.checks.hasLowercase).toBe(true)
    expect(result.checks.hasUppercase).toBe(true)
    expect(result.checks.hasNumber).toBe(true)
    expect(result.checks.hasSpecialChar).toBe(false)
    expect(result.strength).toBe('good')
  })

  it('detects various special characters', () => {
    const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '=', '[', ']', '{', '}', ';', "'", ':', '"', '\\', '|', ',', '.', '<', '>', '/', '?', '`', '~']
    for (const char of specialChars) {
      const result = validatePassword(char)
      expect(result.checks.hasSpecialChar).toBe(true)
    }
  })
})

describe('getStrengthColor edge cases', () => {
  it('returns correct color for all strength levels', () => {
    expect(getStrengthColor('weak')).toBe('var(--color-danger)')
    expect(getStrengthColor('fair')).toBe('#f59e0b')
    expect(getStrengthColor('good')).toBe('#3b82f6')
    expect(getStrengthColor('strong')).toBe('#22c55e')
  })

  it('returns a string for each strength level', () => {
    const levels: Array<'weak' | 'fair' | 'good' | 'strong'> = ['weak', 'fair', 'good', 'strong']
    for (const level of levels) {
      expect(typeof getStrengthColor(level)).toBe('string')
      expect(getStrengthColor(level).length).toBeGreaterThan(0)
    }
  })
})

describe('getStrengthLabel edge cases', () => {
  it('returns correct label for all strength levels', () => {
    expect(getStrengthLabel('weak')).toBe('Weak')
    expect(getStrengthLabel('fair')).toBe('Fair')
    expect(getStrengthLabel('good')).toBe('Good')
    expect(getStrengthLabel('strong')).toBe('Strong')
  })

  it('returns capitalized labels', () => {
    const levels: Array<'weak' | 'fair' | 'good' | 'strong'> = ['weak', 'fair', 'good', 'strong']
    for (const level of levels) {
      const label = getStrengthLabel(level)
      expect(label.charAt(0)).toBe(label.charAt(0).toUpperCase())
    }
  })
})

// ──────────────────────────────────────────────────────
// cycleDay.ts edge cases
// ──────────────────────────────────────────────────────

describe('getCurrentCycleDay edge cases', () => {
  const TIMEZONE = 'America/Chicago'

  it('handles future cycle_start_date (tomorrow)', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(tomorrow)

    const result = getCurrentCycleDay(tomorrowStr, TIMEZONE)
    // -1 day => ((-1 % 7) + 7) % 7 + 1 = 7
    expect(result).toBe(7)
  })

  it('handles future cycle_start_date (1 week from now)', () => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    const nextWeekStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(nextWeek)

    const result = getCurrentCycleDay(nextWeekStr, TIMEZONE)
    // -7 days => ((-7 % 7) + 7) % 7 + 1 = 1 (wraps around)
    expect(result).toBe(1)
  })

  it('handles very old cycle_start_date (1 year ago)', () => {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const startStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(oneYearAgo)

    const result = getCurrentCycleDay(startStr, TIMEZONE)
    // Should be a valid cycle day between 1 and 7
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(7)
  })

  it('handles very old cycle_start_date (10 years ago)', () => {
    const tenYearsAgo = new Date()
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)
    const startStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(tenYearsAgo)

    const result = getCurrentCycleDay(startStr, TIMEZONE)
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(7)
  })

  it('handles totalDays of 1 (always returns 1)', () => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date())

    expect(getCurrentCycleDay(today, TIMEZONE, 1)).toBe(1)
  })

  it('handles totalDays of 1 with past start date', () => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const startStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(threeDaysAgo)

    // With totalDays=1, any day mod 1 = 0, then +1 = 1
    expect(getCurrentCycleDay(startStr, TIMEZONE, 1)).toBe(1)
  })

  it('works with different timezone (UTC)', () => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date())

    const result = getCurrentCycleDay(today, 'UTC')
    expect(result).toBe(1)
  })

  it('works with Asia/Tokyo timezone', () => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date())

    const result = getCurrentCycleDay(today, 'Asia/Tokyo')
    expect(result).toBe(1)
  })
})

describe('formatCycleStartDate edge cases', () => {
  it('returns "today" for null', () => {
    expect(formatCycleStartDate(null)).toBe('today')
  })

  it('returns "today" for undefined', () => {
    expect(formatCycleStartDate(undefined)).toBe('today')
  })

  it('returns "today" for empty string', () => {
    // Empty string is falsy, so returns 'today'
    expect(formatCycleStartDate('')).toBe('today')
  })

  it('returns "today" for an invalid date string that cannot be parsed', () => {
    // parseISO('not-a-date') returns Invalid Date, and formatting it throws
    // The catch block returns 'today'
    expect(formatCycleStartDate('not-a-date')).toBe('today')
  })

  it('formats a valid date string correctly', () => {
    expect(formatCycleStartDate('2026-01-15')).toBe('Jan 15, 2026')
  })

  it('formats a date string with time portion (ignores time)', () => {
    // parseISO should handle the full ISO string
    const result = formatCycleStartDate('2026-06-15T10:30:00Z')
    expect(result).toMatch(/Jun 15, 2026/)
  })

  it('formats epoch date correctly', () => {
    expect(formatCycleStartDate('1970-01-01')).toBe('Jan 1, 1970')
  })

  it('formats far future date correctly', () => {
    expect(formatCycleStartDate('2099-12-31')).toBe('Dec 31, 2099')
  })
})

describe('getTodayInTimezone edge cases', () => {
  it('returns a Date at midnight (time components are 0)', () => {
    const result = getTodayInTimezone('UTC')
    // parseISO from en-CA format returns midnight
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
  })

  it('returns the same date for the same timezone call', () => {
    const result1 = getTodayInTimezone('America/Chicago')
    const result2 = getTodayInTimezone('America/Chicago')
    expect(result1.getTime()).toBe(result2.getTime())
  })
})

// ──────────────────────────────────────────────────────
// calendarGrid.ts edge cases
// ──────────────────────────────────────────────────────

describe('getMonthGridDates edge cases', () => {
  it('returns correct number of dates for a month starting on Sunday', () => {
    // September 2024 starts on Sunday
    const dates = getMonthGridDates(new Date(2024, 8, 1))
    // 30 days starting on Sunday, needs 5 rows (35 dates)
    expect(dates).toHaveLength(35)
    // First date should be September 1 itself
    expect(dates[0].getMonth()).toBe(8)
    expect(dates[0].getDate()).toBe(1)
  })

  it('returns correct number of dates for a month starting on Saturday', () => {
    // June 2024 starts on Saturday
    const dates = getMonthGridDates(new Date(2024, 5, 1))
    // 30 days starting on Saturday, needs 6 rows (42 dates)
    expect(dates).toHaveLength(42)
    // First date should be Sunday May 26
    expect(dates[0].getDay()).toBe(0)
  })

  it('first date is always a Sunday (weekStartsOn: 0)', () => {
    // Test multiple months
    const months = [
      new Date(2024, 0, 1),  // Jan 2024 (Mon)
      new Date(2024, 1, 1),  // Feb 2024 (Thu)
      new Date(2024, 2, 1),  // Mar 2024 (Fri)
      new Date(2024, 3, 1),  // Apr 2024 (Mon)
      new Date(2024, 4, 1),  // May 2024 (Wed)
      new Date(2024, 5, 1),  // Jun 2024 (Sat)
      new Date(2024, 6, 1),  // Jul 2024 (Mon)
      new Date(2024, 7, 1),  // Aug 2024 (Thu)
      new Date(2024, 8, 1),  // Sep 2024 (Sun)
      new Date(2024, 9, 1),  // Oct 2024 (Tue)
      new Date(2024, 10, 1), // Nov 2024 (Fri)
      new Date(2024, 11, 1)  // Dec 2024 (Sun)
    ]
    for (const month of months) {
      const dates = getMonthGridDates(month)
      expect(dates[0].getDay()).toBe(0) // Sunday
      // Grid uses only as many rows as needed (35 or 42 dates)
      expect(dates.length % 7).toBe(0)
      expect(dates.length).toBeGreaterThanOrEqual(28)
      expect(dates.length).toBeLessThanOrEqual(42)
    }
  })

  it('all dates are in chronological order', () => {
    const dates = getMonthGridDates(new Date(2024, 0, 1))
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i].getTime()).toBeGreaterThan(dates[i - 1].getTime())
    }
  })

  it('handles December correctly (next month crosses year boundary)', () => {
    const dates = getMonthGridDates(new Date(2024, 11, 1))
    const lastDate = dates[dates.length - 1]
    // The trailing days should be in January 2025
    if (lastDate.getMonth() === 0) {
      expect(lastDate.getFullYear()).toBe(2025)
    }
  })

  it('handles January correctly (previous month from prior year)', () => {
    // January 2025 starts on Wednesday
    const dates = getMonthGridDates(new Date(2025, 0, 1))
    // Leading days should be from December 2024
    expect(dates[0].getMonth()).toBe(11) // December
    expect(dates[0].getFullYear()).toBe(2024)
  })
})

describe('toDateKey edge cases', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2024, 2, 15))).toBe('2024-03-15')
  })

  it('pads single-digit months', () => {
    expect(toDateKey(new Date(2024, 0, 15))).toBe('2024-01-15')
  })

  it('pads single-digit days', () => {
    expect(toDateKey(new Date(2024, 0, 5))).toBe('2024-01-05')
  })

  it('handles the epoch date', () => {
    // January 1, 1970 in local timezone
    const epoch = new Date(1970, 0, 1)
    expect(toDateKey(epoch)).toBe('1970-01-01')
  })

  it('handles far future dates', () => {
    const future = new Date(2099, 11, 31)
    expect(toDateKey(future)).toBe('2099-12-31')
  })

  it('handles leap year February 29', () => {
    expect(toDateKey(new Date(2024, 1, 29))).toBe('2024-02-29')
  })
})

describe('groupSessionsByDate edge cases', () => {
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

  it('returns empty map for empty array', () => {
    const result = groupSessionsByDate([], 'UTC')
    expect(result.size).toBe(0)
    expect(result).toBeInstanceOf(Map)
  })

  it('handles sessions with duplicate dates by grouping them together', () => {
    const sessions = [
      makeSession({ id: 's1', started_at: '2024-03-15T08:00:00Z' }),
      makeSession({ id: 's2', started_at: '2024-03-15T12:00:00Z' }),
      makeSession({ id: 's3', started_at: '2024-03-15T18:00:00Z' })
    ]
    const result = groupSessionsByDate(sessions, 'UTC')
    expect(result.size).toBe(1)
    expect(result.get('2024-03-15')).toHaveLength(3)
  })

  it('preserves session order within the same date group', () => {
    const sessions = [
      makeSession({ id: 's1', name: 'Morning', started_at: '2024-03-15T08:00:00Z' }),
      makeSession({ id: 's2', name: 'Afternoon', started_at: '2024-03-15T14:00:00Z' }),
      makeSession({ id: 's3', name: 'Evening', started_at: '2024-03-15T20:00:00Z' })
    ]
    const result = groupSessionsByDate(sessions, 'UTC')
    const grouped = result.get('2024-03-15')!
    expect(grouped[0].name).toBe('Morning')
    expect(grouped[1].name).toBe('Afternoon')
    expect(grouped[2].name).toBe('Evening')
  })

  it('handles a single session', () => {
    const sessions = [makeSession()]
    const result = groupSessionsByDate(sessions, 'UTC')
    expect(result.size).toBe(1)
  })

  it('groups cardio and weights sessions on the same date', () => {
    const sessions = [
      makeSession({ id: 's1', type: 'weights', started_at: '2024-03-15T08:00:00Z' }),
      makeSession({ id: 's2', type: 'cardio', started_at: '2024-03-15T14:00:00Z' })
    ]
    const result = groupSessionsByDate(sessions, 'UTC')
    expect(result.size).toBe(1)
    const grouped = result.get('2024-03-15')!
    expect(grouped).toHaveLength(2)
    expect(grouped[0].type).toBe('weights')
    expect(grouped[1].type).toBe('cardio')
  })

  it('handles sessions across timezone boundary', () => {
    // 2024-03-15T23:30:00Z is March 15 in UTC but March 16 in Asia/Tokyo (UTC+9)
    const sessions = [
      makeSession({ id: 's1', started_at: '2024-03-15T23:30:00Z' })
    ]

    const utcResult = groupSessionsByDate(sessions, 'UTC')
    expect(utcResult.has('2024-03-15')).toBe(true)

    const tokyoResult = groupSessionsByDate(sessions, 'Asia/Tokyo')
    expect(tokyoResult.has('2024-03-16')).toBe(true)
  })

  it('handles many sessions spread across multiple days', () => {
    const sessions = Array.from({ length: 30 }, (_, i) => {
      const day = (i % 28) + 1
      const dayStr = day.toString().padStart(2, '0')
      return makeSession({
        id: `s${i}`,
        started_at: `2024-03-${dayStr}T10:00:00Z`
      })
    })
    const result = groupSessionsByDate(sessions, 'UTC')
    // 30 sessions across 28 days (days 1-28, then 1 and 2 again)
    expect(result.size).toBe(28)
    // Days 1 and 2 should have 2 sessions each
    expect(result.get('2024-03-01')).toHaveLength(2)
    expect(result.get('2024-03-02')).toHaveLength(2)
  })
})

describe('getCycleDayForDate edge cases', () => {
  it('returns null for date far before cycle start', () => {
    const result = getCycleDayForDate(new Date(2020, 0, 1), '2024-03-01', 7)
    expect(result).toBeNull()
  })

  it('returns 1 for exactly the start date', () => {
    const result = getCycleDayForDate(new Date(2024, 2, 1), '2024-03-01', 7)
    expect(result).toBe(1)
  })

  it('handles totalDays of 1', () => {
    const result = getCycleDayForDate(new Date(2024, 2, 5), '2024-03-01', 1)
    expect(result).toBe(1) // any day mod 1 = 0, then +1 = 1
  })

  it('handles very large number of days since start', () => {
    const farFuture = new Date(2024, 2, 1)
    farFuture.setDate(farFuture.getDate() + 1000)
    const result = getCycleDayForDate(farFuture, '2024-03-01', 7)
    // 1000 % 7 = 6, so 6 + 1 = 7
    expect(result).toBe(7)
  })
})
