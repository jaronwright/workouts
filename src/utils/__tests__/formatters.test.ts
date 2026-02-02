import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatDuration,
  formatWeight,
  formatReps
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

describe('formatDateTime', () => {
  it('formats date and time together', () => {
    const result = formatDateTime('2024-03-15T09:30:00Z')
    expect(result).toMatch(/Mar 15, 2024 \d{1,2}:\d{2}\s(AM|PM)/i)
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

describe('formatWeight', () => {
  it('formats weight with lbs suffix', () => {
    expect(formatWeight(135)).toBe('135 lbs')
  })

  it('formats decimal weights', () => {
    expect(formatWeight(132.5)).toBe('132.5 lbs')
  })

  it('returns "—" for null weight', () => {
    expect(formatWeight(null)).toBe('—')
  })

  it('formats zero weight', () => {
    expect(formatWeight(0)).toBe('0 lbs')
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
