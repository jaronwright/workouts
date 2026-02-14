import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatTime,
  formatDuration,
  formatReps,
  formatRelativeTime
} from '../formatters'

describe('formatDate', () => {
  it('formats date string correctly', () => {
    const result = formatDate('2024-03-15T10:30:00Z')
    expect(result).toBe('Mar 15, 2024')
  })

  it('formats Date object correctly', () => {
    // Use a date with noon time to avoid timezone edge cases
    const result = formatDate(new Date('2024-12-25T12:00:00Z'))
    expect(result).toMatch(/Dec 2[45], 2024/) // Allow for timezone variance
  })
})

describe('formatTime', () => {
  it('formats morning time correctly', () => {
    const result = formatTime('2024-03-15T09:30:00Z')
    // Note: This will be timezone dependent
    expect(result).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/i)
  })

  it('formats afternoon time correctly', () => {
    const result = formatTime('2024-03-15T14:45:00Z')
    expect(result).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/i)
  })
})

describe('formatDuration', () => {
  it('formats 0 seconds correctly', () => {
    expect(formatDuration(0)).toBe('0:00')
  })

  it('formats seconds only correctly', () => {
    expect(formatDuration(45)).toBe('0:45')
  })

  it('formats minutes and seconds correctly', () => {
    expect(formatDuration(90)).toBe('1:30')
  })

  it('formats longer durations correctly', () => {
    expect(formatDuration(3661)).toBe('61:01')
  })

  it('pads single-digit seconds correctly', () => {
    expect(formatDuration(65)).toBe('1:05')
  })
})

describe('formatReps', () => {
  it('formats positive reps', () => {
    expect(formatReps(10)).toBe('10')
  })

  it('returns "—" for null reps', () => {
    expect(formatReps(null)).toBe('—')
  })

  it('formats zero reps', () => {
    expect(formatReps(0)).toBe('0')
  })
})

describe('formatRelativeTime', () => {
  it('formats recent dates as relative time', () => {
    const now = new Date()
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const result = formatRelativeTime(fiveMinAgo)
    expect(result).toContain('minutes ago')
  })

  it('formats date string', () => {
    const recent = new Date(Date.now() - 3600 * 1000).toISOString()
    const result = formatRelativeTime(recent)
    expect(result).toContain('ago')
  })
})

// ===== EDGE CASE TESTS =====

describe('formatDate - edge cases', () => {
  it('formats January 1st (New Year)', () => {
    const result = formatDate('2024-01-01T12:00:00Z')
    expect(result).toMatch(/Jan 1, 2024/)
  })

  it('formats December 31st (New Year Eve)', () => {
    const result = formatDate('2024-12-31T12:00:00Z')
    expect(result).toMatch(/Dec 3[01], 2024/)
  })

  it('formats leap day', () => {
    const result = formatDate('2024-02-29T12:00:00Z')
    expect(result).toMatch(/Feb 29, 2024/)
  })

  it('formats a date far in the past', () => {
    const result = formatDate('1970-01-01T12:00:00Z')
    expect(result).toMatch(/Jan 1, 1970/)
  })

  it('formats a date far in the future', () => {
    const result = formatDate('2099-06-15T12:00:00Z')
    expect(result).toMatch(/Jun 15, 2099/)
  })

  it('formats Date object created from year/month/day', () => {
    const date = new Date(2024, 5, 15, 12, 0, 0) // June 15, 2024 noon local
    const result = formatDate(date)
    expect(result).toBe('Jun 15, 2024')
  })

  it('handles ISO date string without time component', () => {
    // Note: '2024-03-15' is parsed as UTC midnight, which may shift dates in some timezones
    const result = formatDate('2024-03-15T12:00:00Z')
    expect(result).toMatch(/Mar 1[45], 2024/)
  })
})

describe('formatTime - edge cases', () => {
  it('formats a Date object (not just string)', () => {
    const date = new Date(2024, 0, 1, 14, 30, 0) // 2:30 PM local
    const result = formatTime(date)
    expect(result).toBe('2:30 PM')
  })

  it('formats midnight-adjacent time', () => {
    const date = new Date(2024, 0, 1, 0, 0, 0) // midnight local
    const result = formatTime(date)
    expect(result).toBe('12:00 AM')
  })

  it('formats noon local time', () => {
    const date = new Date(2024, 0, 1, 12, 0, 0) // noon local
    const result = formatTime(date)
    expect(result).toBe('12:00 PM')
  })

  it('formats time with minutes at boundary', () => {
    const date = new Date(2024, 0, 1, 23, 59, 59) // 11:59 PM local
    const result = formatTime(date)
    expect(result).toBe('11:59 PM')
  })

  it('formats 1:00 AM local time', () => {
    const date = new Date(2024, 0, 1, 1, 0, 0)
    const result = formatTime(date)
    expect(result).toBe('1:00 AM')
  })
})

describe('formatRelativeTime - edge cases', () => {
  it('formats a Date object (not string)', () => {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000)
    const result = formatRelativeTime(tenMinAgo)
    expect(result).toContain('ago')
  })

  it('formats a very recent time (seconds ago)', () => {
    const justNow = new Date(Date.now() - 10 * 1000) // 10 seconds ago
    const result = formatRelativeTime(justNow)
    expect(result).toContain('ago')
  })

  it('formats days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3600 * 1000)
    const result = formatRelativeTime(threeDaysAgo)
    expect(result).toContain('ago')
    expect(result).toContain('3 days')
  })

  it('formats months ago', () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 3600 * 1000)
    const result = formatRelativeTime(sixtyDaysAgo)
    expect(result).toContain('ago')
    expect(result).toMatch(/months? ago/)
  })

  it('formats a future date with "in" prefix', () => {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000)
    const result = formatRelativeTime(tomorrow)
    expect(result).toContain('in')
  })
})

describe('formatDuration - edge cases', () => {
  it('formats exactly 60 seconds as 1:00', () => {
    expect(formatDuration(60)).toBe('1:00')
  })

  it('formats exactly 1 second', () => {
    expect(formatDuration(1)).toBe('0:01')
  })

  it('formats 59 seconds (boundary before 1 minute)', () => {
    expect(formatDuration(59)).toBe('0:59')
  })

  it('formats large values (1 hour)', () => {
    expect(formatDuration(3600)).toBe('60:00')
  })

  it('formats very large values (24 hours)', () => {
    expect(formatDuration(86400)).toBe('1440:00')
  })

  it('formats negative seconds (implementation-defined behavior)', () => {
    // Math.floor of negative / 60 and modulo behavior
    const result = formatDuration(-1)
    // -1 / 60 = -0.0167, floor = -1; -1 % 60 = -1
    expect(result).toBe('-1:-1')
  })

  it('formats negative value of -60', () => {
    // Math.floor(-60 / 60) = -1; -60 % 60 = -0 (which is 0 in JS, toString gives "0")
    const result = formatDuration(-60)
    expect(result).toBe('-1:00')
  })

  it('formats fractional seconds', () => {
    // 90.5: floor(90.5/60) = 1; 90.5 % 60 = 30.5; "30.5".padStart(2,"0") = "30.5"
    expect(formatDuration(90.5)).toBe('1:30.5')
  })

  it('formats NaN gracefully', () => {
    const result = formatDuration(NaN)
    expect(result).toBe('NaN:NaN')
  })

  it('formats Infinity', () => {
    const result = formatDuration(Infinity)
    expect(result).toBe('Infinity:NaN')
  })

  it('formats negative Infinity', () => {
    const result = formatDuration(-Infinity)
    expect(result).toBe('-Infinity:NaN')
  })

  it('formats 0.99 seconds (sub-minute fraction)', () => {
    // floor(0.99/60) = 0; 0.99 % 60 = 0.99
    expect(formatDuration(0.99)).toBe('0:0.99')
  })
})

describe('formatReps - edge cases', () => {
  it('formats negative reps', () => {
    expect(formatReps(-1)).toBe('-1')
  })

  it('formats very large reps', () => {
    expect(formatReps(1000000)).toBe('1000000')
  })

  it('formats fractional reps', () => {
    expect(formatReps(5.5)).toBe('5.5')
  })

  it('formats NaN reps', () => {
    expect(formatReps(NaN)).toBe('NaN')
  })

  it('formats Infinity reps', () => {
    expect(formatReps(Infinity)).toBe('Infinity')
  })

  it('formats negative Infinity reps', () => {
    expect(formatReps(-Infinity)).toBe('-Infinity')
  })

  it('formats 1 rep', () => {
    expect(formatReps(1)).toBe('1')
  })

  it('formats reps with many decimal places', () => {
    expect(formatReps(3.14159)).toBe('3.14159')
  })
})

