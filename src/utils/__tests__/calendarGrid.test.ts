import { describe, it, expect } from 'vitest'
import {
  getMonthGridDates,
  getCycleDayForDate,
  groupSessionsByDate,
  toDateKey,
  type UnifiedSession
} from '../calendarGrid'

describe('getMonthGridDates', () => {
  it('returns correct number of dates for the grid', () => {
    const dates = getMonthGridDates(new Date(2024, 0, 1)) // January 2024
    // January 2024 starts on Monday, needs 5 rows (35 dates)
    expect(dates).toHaveLength(35)
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
    // Grid should extend into February (5 rows = 35 dates)
    const dates = getMonthGridDates(new Date(2024, 0, 1))
    const lastDate = dates[dates.length - 1]
    expect(lastDate.getMonth()).toBe(1) // February
  })

  it('handles a month that starts on Sunday', () => {
    // September 2024 starts on Sunday
    const dates = getMonthGridDates(new Date(2024, 8, 1))
    expect(dates[0].getMonth()).toBe(8) // September
    expect(dates[0].getDate()).toBe(1)
    // September 2024: 30 days starting on Sunday, needs 5 rows (35 dates)
    expect(dates).toHaveLength(35)
  })

  it('handles February in a leap year', () => {
    // February 2024 is a leap year (29 days), starts on Thursday
    const dates = getMonthGridDates(new Date(2024, 1, 1))
    // February 2024 needs 5 rows (35 dates)
    expect(dates).toHaveLength(35)
    const febDates = dates.filter(
      d => d.getMonth() === 1 && d.getFullYear() === 2024
    )
    expect(febDates).toHaveLength(29)
  })

  it('handles February in a non-leap year', () => {
    // February 2023 has 28 days, starts on Wednesday
    const dates = getMonthGridDates(new Date(2023, 1, 1))
    // February 2023 needs 5 rows (35 dates)
    expect(dates).toHaveLength(35)
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

  it('returns 42 dates (6 rows) when a month requires it', () => {
    // June 2024 starts on Saturday (day index 6) and has 30 days
    // Grid needs: 1 leading day (Sat) + 30 days spans into row 6
    // Actually: June 1 is Saturday -> grid starts Sun May 26
    // June 30 is Sunday -> grid ends Sat July 6
    // That's 42 days = 6 weeks
    const dates = getMonthGridDates(new Date(2024, 5, 1)) // June 2024
    expect(dates).toHaveLength(42)
    expect(dates.length % 7).toBe(0)
  })

  it('handles February starting on Sunday in a non-leap year (exactly 4 rows)', () => {
    // February 2015 starts on Sunday and has 28 days
    // Feb 1 = Sunday, Feb 28 = Saturday => exactly 4 weeks = 28 dates
    const dates = getMonthGridDates(new Date(2015, 1, 1))
    expect(dates).toHaveLength(28)
    // First date should be Feb 1
    expect(dates[0].getMonth()).toBe(1)
    expect(dates[0].getDate()).toBe(1)
    // Last date should be Feb 28
    const lastDate = dates[dates.length - 1]
    expect(lastDate.getMonth()).toBe(1)
    expect(lastDate.getDate()).toBe(28)
  })

  it('handles December correctly (year boundary)', () => {
    // December 2024 starts on Sunday, has 31 days
    const dates = getMonthGridDates(new Date(2024, 11, 1))
    const decDates = dates.filter(
      d => d.getMonth() === 11 && d.getFullYear() === 2024
    )
    expect(decDates).toHaveLength(31)
    // Grid should include trailing January 2025 days
    const lastDate = dates[dates.length - 1]
    expect(lastDate.getDay()).toBe(6) // Saturday
    // December 31 is a Tuesday, so trailing days go into January 2025
    const janDates = dates.filter(
      d => d.getMonth() === 0 && d.getFullYear() === 2025
    )
    expect(janDates.length).toBeGreaterThan(0)
  })

  it('handles January correctly with leading December days from previous year', () => {
    // January 2025 starts on Wednesday
    const dates = getMonthGridDates(new Date(2025, 0, 1))
    // Grid starts on Sunday Dec 29, 2024
    const firstDate = dates[0]
    expect(firstDate.getMonth()).toBe(11) // December
    expect(firstDate.getFullYear()).toBe(2024)
    expect(firstDate.getDay()).toBe(0) // Sunday
  })

  it('always ends on a Saturday', () => {
    // Test several different months
    const months = [
      new Date(2024, 0, 1),  // January
      new Date(2024, 3, 1),  // April
      new Date(2024, 6, 1),  // July
      new Date(2024, 9, 1),  // October
      new Date(2025, 1, 1),  // February
    ]
    for (const month of months) {
      const dates = getMonthGridDates(month)
      const lastDate = dates[dates.length - 1]
      expect(lastDate.getDay()).toBe(6) // Saturday
    }
  })

  it('always returns a length that is a multiple of 7', () => {
    // Test all 12 months of 2024
    for (let m = 0; m < 12; m++) {
      const dates = getMonthGridDates(new Date(2024, m, 1))
      expect(dates.length % 7).toBe(0)
    }
  })

  it('handles the same month across multiple years consistently', () => {
    // March across different years: always 31 days covered
    for (const year of [2020, 2021, 2022, 2023, 2024, 2025]) {
      const dates = getMonthGridDates(new Date(year, 2, 1))
      const marchDates = dates.filter(
        d => d.getMonth() === 2 && d.getFullYear() === year
      )
      expect(marchDates).toHaveLength(31)
    }
  })

  it('handles a month where the 1st is Saturday and has 31 days', () => {
    // August 2024 starts on Thursday... Let's find one that starts on Saturday
    // March 2025 starts on Saturday
    const dates = getMonthGridDates(new Date(2025, 2, 1))
    // Grid starts Sun Feb 23, grid needs 6 rows because Mar 1 = Sat, 31 days
    // Last day of March is Monday Mar 31
    // Grid end: Sat Apr 5 = 6 rows = 42
    expect(dates).toHaveLength(42)
    expect(dates[0].getDay()).toBe(0) // starts on Sunday
    const marchDates = dates.filter(
      d => d.getMonth() === 2 && d.getFullYear() === 2025
    )
    expect(marchDates).toHaveLength(31)
  })

  it('accepts any day of the month as input, not just the 1st', () => {
    // Passing the 15th of the month should produce the same grid as the 1st
    const fromFirst = getMonthGridDates(new Date(2024, 5, 1))
    const fromFifteenth = getMonthGridDates(new Date(2024, 5, 15))
    expect(fromFirst).toEqual(fromFifteenth)
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

  it('works with a 1-day cycle (always returns 1)', () => {
    expect(getCycleDayForDate(new Date(2024, 2, 1), cycleStart, 1)).toBe(1)
    expect(getCycleDayForDate(new Date(2024, 2, 2), cycleStart, 1)).toBe(1)
    expect(getCycleDayForDate(new Date(2024, 2, 100), cycleStart, 1)).toBe(1)
  })

  it('works with a large cycle length', () => {
    // 30-day cycle
    // Day 1: March 1 -> cycle day 1
    // Day 30: March 30 -> cycle day 30
    // Day 31: March 31 -> cycle day 1 (wraps)
    expect(getCycleDayForDate(new Date(2024, 2, 1), cycleStart, 30)).toBe(1)
    expect(getCycleDayForDate(new Date(2024, 2, 30), cycleStart, 30)).toBe(30)
    expect(getCycleDayForDate(new Date(2024, 2, 31), cycleStart, 30)).toBe(1)
    expect(getCycleDayForDate(new Date(2024, 3, 1), cycleStart, 30)).toBe(2)
  })

  it('handles cycle start crossing year boundary', () => {
    const yearEndStart = '2024-12-30'
    // Dec 30 = day 1, Dec 31 = day 2, Jan 1 2025 = day 3
    expect(getCycleDayForDate(new Date(2024, 11, 30), yearEndStart, 7)).toBe(1)
    expect(getCycleDayForDate(new Date(2024, 11, 31), yearEndStart, 7)).toBe(2)
    expect(getCycleDayForDate(new Date(2025, 0, 1), yearEndStart, 7)).toBe(3)
    // Jan 5 = 7 days after Dec 30, so wraps to day 1
    expect(getCycleDayForDate(new Date(2025, 0, 5), yearEndStart, 7)).toBe(7)
    expect(getCycleDayForDate(new Date(2025, 0, 6), yearEndStart, 7)).toBe(1)
  })

  it('handles cycle start crossing a leap day boundary', () => {
    // Start on Feb 28, 2024 (leap year)
    const leapStart = '2024-02-28'
    // Feb 28 = day 1, Feb 29 = day 2, Mar 1 = day 3
    expect(getCycleDayForDate(new Date(2024, 1, 28), leapStart, 7)).toBe(1)
    expect(getCycleDayForDate(new Date(2024, 1, 29), leapStart, 7)).toBe(2)
    expect(getCycleDayForDate(new Date(2024, 2, 1), leapStart, 7)).toBe(3)
  })

  it('returns null for all dates before start, even years prior', () => {
    expect(getCycleDayForDate(new Date(2023, 0, 1), cycleStart, 7)).toBeNull()
    expect(getCycleDayForDate(new Date(2020, 5, 15), cycleStart, 7)).toBeNull()
  })

  it('returns correct cycle day at exact cycle boundary multiples', () => {
    // At exactly N * totalDays offset, should always be cycle day 1
    for (let n = 1; n <= 10; n++) {
      const date = new Date(2024, 2, 1)
      date.setDate(date.getDate() + n * 7)
      expect(getCycleDayForDate(date, cycleStart, 7)).toBe(1)
    }
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

  it('preserves session data including category field', () => {
    const sessions = [
      makeSession({
        id: 's1',
        type: 'cardio',
        category: 'running',
        name: 'Easy Run',
        started_at: '2024-03-15T10:00:00Z'
      })
    ]
    const result = groupSessionsByDate(sessions, 'UTC')
    const daySessions = result.get('2024-03-15')!
    expect(daySessions[0].type).toBe('cardio')
    expect(daySessions[0].category).toBe('running')
    expect(daySessions[0].name).toBe('Easy Run')
  })

  it('groups mixed session types on the same date together', () => {
    const sessions = [
      makeSession({
        id: 's1',
        type: 'weights',
        name: 'Push',
        started_at: '2024-03-15T08:00:00Z'
      }),
      makeSession({
        id: 's2',
        type: 'cardio',
        category: 'running',
        name: 'Run',
        started_at: '2024-03-15T17:00:00Z'
      }),
      makeSession({
        id: 's3',
        type: 'mobility',
        category: 'yoga',
        name: 'Yoga',
        started_at: '2024-03-15T20:00:00Z'
      })
    ]
    const result = groupSessionsByDate(sessions, 'UTC')
    expect(result.size).toBe(1)
    expect(result.get('2024-03-15')).toHaveLength(3)
  })

  it('handles sessions with null completed_at', () => {
    const sessions = [
      makeSession({
        id: 's1',
        started_at: '2024-03-15T10:00:00Z',
        completed_at: null
      })
    ]
    const result = groupSessionsByDate(sessions, 'UTC')
    expect(result.size).toBe(1)
    const daySessions = result.get('2024-03-15')!
    expect(daySessions[0].completed_at).toBeNull()
  })

  it('handles sessions spanning many days', () => {
    const sessions = []
    for (let d = 1; d <= 31; d++) {
      const day = String(d).padStart(2, '0')
      sessions.push(
        makeSession({
          id: `s${d}`,
          started_at: `2024-03-${day}T12:00:00Z`
        })
      )
    }
    const result = groupSessionsByDate(sessions, 'UTC')
    expect(result.size).toBe(31)
    for (let d = 1; d <= 31; d++) {
      const day = String(d).padStart(2, '0')
      expect(result.has(`2024-03-${day}`)).toBe(true)
    }
  })

  it('handles negative UTC offset pushing date backward', () => {
    // 2024-03-16T01:00:00Z in America/New_York (UTC-4 in March) = March 15 9 PM
    const sessions = [
      makeSession({ started_at: '2024-03-16T01:00:00Z' })
    ]
    const result = groupSessionsByDate(sessions, 'America/New_York')
    expect(result.has('2024-03-15')).toBe(true)
    expect(result.has('2024-03-16')).toBe(false)
  })

  it('handles positive UTC offset pushing date forward', () => {
    // 2024-03-15T22:00:00Z in Asia/Kolkata (UTC+5:30) = March 16 3:30 AM
    const sessions = [
      makeSession({ started_at: '2024-03-15T22:00:00Z' })
    ]
    const result = groupSessionsByDate(sessions, 'Asia/Kolkata')
    expect(result.has('2024-03-16')).toBe(true)
    expect(result.has('2024-03-15')).toBe(false)
  })

  it('handles sessions on New Year boundary', () => {
    // Dec 31 at 11 PM UTC -> in UTC it's still Dec 31, in UTC+2 it's Jan 1
    const sessions = [
      makeSession({ started_at: '2024-12-31T23:00:00Z' })
    ]
    const utcResult = groupSessionsByDate(sessions, 'UTC')
    expect(utcResult.has('2024-12-31')).toBe(true)

    const eetResult = groupSessionsByDate(sessions, 'Europe/Helsinki') // UTC+2
    expect(eetResult.has('2025-01-01')).toBe(true)
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

  it('handles Feb 28 in a non-leap year', () => {
    const result = toDateKey(new Date(2023, 1, 28))
    expect(result).toBe('2023-02-28')
  })

  it('handles year 2000 (century leap year)', () => {
    const result = toDateKey(new Date(2000, 0, 1))
    expect(result).toBe('2000-01-01')
  })

  it('handles each month correctly', () => {
    const expected = [
      '2024-01-15', '2024-02-15', '2024-03-15', '2024-04-15',
      '2024-05-15', '2024-06-15', '2024-07-15', '2024-08-15',
      '2024-09-15', '2024-10-15', '2024-11-15', '2024-12-15'
    ]
    for (let m = 0; m < 12; m++) {
      expect(toDateKey(new Date(2024, m, 15))).toBe(expected[m])
    }
  })

  it('handles double-digit day at month boundary', () => {
    // November 30
    expect(toDateKey(new Date(2024, 10, 30))).toBe('2024-11-30')
    // October 31
    expect(toDateKey(new Date(2024, 9, 31))).toBe('2024-10-31')
  })
})
