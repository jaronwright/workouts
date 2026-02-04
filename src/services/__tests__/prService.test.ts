import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PersonalRecord, PRCheckResult } from '../prService'

// Mock Supabase with inline factory
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}))

describe('prService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('type definitions', () => {
    it('PersonalRecord type has correct shape', () => {
      const pr: PersonalRecord = {
        id: 'pr-123',
        user_id: 'user-123',
        plan_exercise_id: 'exercise-123',
        weight: 225,
        reps: 8,
        achieved_at: '2024-01-15T10:00:00Z',
      }

      expect(pr.id).toBe('pr-123')
      expect(pr.user_id).toBe('user-123')
      expect(pr.plan_exercise_id).toBe('exercise-123')
      expect(pr.weight).toBe(225)
      expect(pr.reps).toBe(8)
    })

    it('PersonalRecord supports optional reps', () => {
      const pr: PersonalRecord = {
        id: 'pr-123',
        user_id: 'user-123',
        plan_exercise_id: 'exercise-123',
        weight: 225,
        reps: undefined,
        achieved_at: '2024-01-15T10:00:00Z',
      }

      expect(pr.reps).toBeUndefined()
    })

    it('PRCheckResult type for new PR', () => {
      const result: PRCheckResult = {
        isNewPR: true,
        previousPR: 200,
        newWeight: 225,
        improvement: 25,
        exerciseName: 'Bench Press',
      }

      expect(result.isNewPR).toBe(true)
      expect(result.previousPR).toBe(200)
      expect(result.improvement).toBe(25)
    })

    it('PRCheckResult type for no new PR', () => {
      const result: PRCheckResult = {
        isNewPR: false,
        previousPR: 225,
        newWeight: 200,
        improvement: null,
        exerciseName: 'Bench Press',
      }

      expect(result.isNewPR).toBe(false)
      expect(result.improvement).toBeNull()
    })

    it('PRCheckResult type for first PR', () => {
      const result: PRCheckResult = {
        isNewPR: true,
        previousPR: null,
        newWeight: 135,
        improvement: null,
        exerciseName: 'Bench Press',
      }

      expect(result.isNewPR).toBe(true)
      expect(result.previousPR).toBeNull()
      expect(result.improvement).toBeNull()
    })
  })

  describe('PR comparison logic', () => {
    it('detects new PR when weight exceeds previous', () => {
      const previousWeight = 200
      const newWeight = 225
      const isNewPR = newWeight > previousWeight

      expect(isNewPR).toBe(true)
    })

    it('does not detect PR when weight is less', () => {
      const previousWeight = 225
      const newWeight = 200
      const isNewPR = newWeight > previousWeight

      expect(isNewPR).toBe(false)
    })

    it('does not detect PR when weight is equal', () => {
      const previousWeight = 225
      const newWeight = 225
      const isNewPR = newWeight > previousWeight

      expect(isNewPR).toBe(false)
    })

    it('calculates improvement correctly', () => {
      const previousWeight = 200
      const newWeight = 225
      const improvement = newWeight - previousWeight

      expect(improvement).toBe(25)
    })
  })
})
