import { describe, it, expect } from 'vitest'
import { parseSetReps, formatSetReps } from '../parseSetReps'

describe('parseSetReps', () => {
  describe('standard formats', () => {
    it('parses "4x6-8" correctly', () => {
      const result = parseSetReps('4x6-8')
      expect(result.sets).toBe(4)
      expect(result.repsMin).toBe(6)
      expect(result.repsMax).toBe(8)
      expect(result.repsUnit).toBe('reps')
      expect(result.isPerSide).toBe(false)
    })

    it('parses "3x12" correctly', () => {
      const result = parseSetReps('3x12')
      expect(result.sets).toBe(3)
      expect(result.repsMin).toBe(12)
      expect(result.repsMax).toBe(12)
    })

    it('parses "3x10-12" correctly', () => {
      const result = parseSetReps('3x10-12')
      expect(result.sets).toBe(3)
      expect(result.repsMin).toBe(10)
      expect(result.repsMax).toBe(12)
    })
  })

  describe('per-side formats', () => {
    it('parses "3x10/side" correctly', () => {
      const result = parseSetReps('3x10/side')
      expect(result.sets).toBe(3)
      expect(result.repsMin).toBe(10)
      expect(result.isPerSide).toBe(true)
    })

    it('parses "2x8-10/leg" correctly', () => {
      const result = parseSetReps('2x8-10/leg')
      expect(result.sets).toBe(2)
      expect(result.repsMin).toBe(8)
      expect(result.repsMax).toBe(10)
      expect(result.isPerSide).toBe(true)
    })
  })

  describe('duration formats', () => {
    it('parses "5 min" correctly', () => {
      const result = parseSetReps('5 min')
      expect(result.durationMinutes).toBe(5)
      expect(result.repsUnit).toBe('minutes')
      expect(result.sets).toBe(null)
    })

    it('parses "2 min" correctly', () => {
      const result = parseSetReps('2 min')
      expect(result.durationMinutes).toBe(2)
    })
  })

  describe('seconds formats', () => {
    it('parses "2x30 sec" correctly', () => {
      const result = parseSetReps('2x30 sec')
      expect(result.sets).toBe(2)
      expect(result.repsMin).toBe(30)
      expect(result.repsMax).toBe(30)
      expect(result.repsUnit).toBe('seconds')
    })

    it('parses "3x45 sec" correctly', () => {
      const result = parseSetReps('3x45 sec')
      expect(result.sets).toBe(3)
      expect(result.repsMin).toBe(45)
      expect(result.repsUnit).toBe('seconds')
    })
  })

  describe('steps formats', () => {
    it('parses "2x10 steps/side" correctly', () => {
      const result = parseSetReps('2x10 steps/side')
      expect(result.sets).toBe(2)
      expect(result.repsMin).toBe(10)
      expect(result.repsUnit).toBe('steps')
      expect(result.isPerSide).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('returns default values for empty string', () => {
      const result = parseSetReps('')
      expect(result.sets).toBe(null)
      expect(result.repsMin).toBe(null)
      expect(result.repsMax).toBe(null)
    })

    it('returns default values for "—"', () => {
      const result = parseSetReps('—')
      expect(result.sets).toBe(null)
      expect(result.repsMin).toBe(null)
    })

    it('handles whitespace', () => {
      const result = parseSetReps('  3x10  ')
      expect(result.sets).toBe(3)
      expect(result.repsMin).toBe(10)
    })
  })
})

describe('formatSetReps', () => {
  it('formats standard sets correctly', () => {
    const result = formatSetReps({
      sets: 3,
      reps_min: 10,
      reps_max: 12,
      reps_unit: 'reps',
      is_per_side: false
    })
    expect(result).toBe('3x10-12')
  })

  it('formats single rep count correctly', () => {
    const result = formatSetReps({
      sets: 4,
      reps_min: 8,
      reps_max: 8,
      reps_unit: 'reps',
      is_per_side: false
    })
    expect(result).toBe('4x8')
  })

  it('formats per-side correctly', () => {
    const result = formatSetReps({
      sets: 3,
      reps_min: 10,
      reps_max: 10,
      reps_unit: 'reps',
      is_per_side: true
    })
    expect(result).toBe('3x10/side')
  })

  it('formats seconds correctly', () => {
    const result = formatSetReps({
      sets: 2,
      reps_min: 30,
      reps_max: 30,
      reps_unit: 'seconds',
      is_per_side: false
    })
    expect(result).toBe('2x30 seconds')
  })

  it('returns "—" for empty values', () => {
    const result = formatSetReps({
      sets: null,
      reps_min: null,
      reps_max: null,
      reps_unit: 'reps',
      is_per_side: false
    })
    expect(result).toBe('—')
  })
})
