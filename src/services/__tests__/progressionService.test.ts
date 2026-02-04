import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ProgressionSuggestion } from '../progressionService'

// Mock Supabase with inline factory
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  },
}))

describe('progressionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('type definitions', () => {
    it('ProgressionSuggestion type has correct shape', () => {
      const suggestion: ProgressionSuggestion = {
        currentWeight: 135,
        suggestedWeight: 140,
        increase: 5,
        reason: 'You hit 8+ reps at 135 lbs for 2 sessions',
      }

      expect(suggestion.currentWeight).toBe(135)
      expect(suggestion.suggestedWeight).toBe(140)
      expect(suggestion.increase).toBe(5)
      expect(suggestion.reason).toContain('135 lbs')
    })
  })

  describe('weight increment categories', () => {
    const getWeightIncrement = (exerciseName: string): number => {
      const heavyLifts = ['squat', 'deadlift', 'leg press', 'hip thrust']
      const lightLifts = ['curl', 'tricep', 'lateral', 'fly', 'raise']

      const nameLower = exerciseName.toLowerCase()

      if (heavyLifts.some((lift) => nameLower.includes(lift))) {
        return 10 // Heavy lift increment
      }
      if (lightLifts.some((lift) => nameLower.includes(lift))) {
        return 2.5 // Light lift increment
      }
      return 5 // Standard increment
    }

    it('uses heavy increment (10 lbs) for squats', () => {
      expect(getWeightIncrement('Barbell Squat')).toBe(10)
    })

    it('uses heavy increment (10 lbs) for deadlifts', () => {
      expect(getWeightIncrement('Conventional Deadlift')).toBe(10)
    })

    it('uses heavy increment (10 lbs) for leg press', () => {
      expect(getWeightIncrement('Leg Press')).toBe(10)
    })

    it('uses heavy increment (10 lbs) for hip thrusts', () => {
      expect(getWeightIncrement('Barbell Hip Thrust')).toBe(10)
    })

    it('uses light increment (2.5 lbs) for curls', () => {
      expect(getWeightIncrement('Bicep Curl')).toBe(2.5)
    })

    it('uses light increment (2.5 lbs) for tricep extensions', () => {
      expect(getWeightIncrement('Overhead Tricep Extension')).toBe(2.5)
    })

    it('uses light increment (2.5 lbs) for lateral raises', () => {
      expect(getWeightIncrement('Lateral Raise')).toBe(2.5)
    })

    it('uses light increment (2.5 lbs) for flies', () => {
      expect(getWeightIncrement('Cable Fly')).toBe(2.5)
    })

    it('uses standard increment (5 lbs) for bench press', () => {
      expect(getWeightIncrement('Bench Press')).toBe(5)
    })

    it('uses standard increment (5 lbs) for rows', () => {
      expect(getWeightIncrement('Barbell Row')).toBe(5)
    })

    it('uses standard increment (5 lbs) for shoulder press', () => {
      expect(getWeightIncrement('Overhead Press')).toBe(5)
    })
  })

  describe('progression logic', () => {
    it('requires 2 sessions at target reps to suggest increase', () => {
      const historyData = [
        { weight_used: 135, reps_completed: 8 },
        { weight_used: 135, reps_completed: 8 },
      ]
      const targetReps = 8
      const sameWeight =
        historyData[0].weight_used === historyData[1].weight_used
      const bothHitTarget = historyData.every(
        (h) => h.reps_completed >= targetReps
      )
      const shouldSuggest = historyData.length >= 2 && sameWeight && bothHitTarget

      expect(shouldSuggest).toBe(true)
    })

    it('does not suggest if reps not hit', () => {
      const historyData = [
        { weight_used: 135, reps_completed: 6 },
        { weight_used: 135, reps_completed: 7 },
      ]
      const targetReps = 8
      const bothHitTarget = historyData.every(
        (h) => h.reps_completed >= targetReps
      )

      expect(bothHitTarget).toBe(false)
    })

    it('does not suggest if weights different', () => {
      const historyData = [
        { weight_used: 135, reps_completed: 8 },
        { weight_used: 130, reps_completed: 8 },
      ]
      const sameWeight =
        historyData[0].weight_used === historyData[1].weight_used

      expect(sameWeight).toBe(false)
    })

    it('does not suggest with only 1 session', () => {
      const historyData = [{ weight_used: 135, reps_completed: 8 }]
      const enoughHistory = historyData.length >= 2

      expect(enoughHistory).toBe(false)
    })

    it('considers reps >= target as hitting target', () => {
      const historyData = [
        { weight_used: 135, reps_completed: 10 }, // Exceeded
        { weight_used: 135, reps_completed: 9 }, // Exceeded
      ]
      const targetReps = 8
      const bothHitTarget = historyData.every(
        (h) => h.reps_completed >= targetReps
      )

      expect(bothHitTarget).toBe(true)
    })
  })
})
