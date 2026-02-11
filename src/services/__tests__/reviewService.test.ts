import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { WorkoutReview, CreateReviewData, UpdateReviewData } from '../reviewService'

// ─── Chainable Supabase mock ────────────────────────
// Terminal methods return promise-resolved results that can be reconfigured per-test.

let mockSingleResult = { data: null as unknown, error: null as unknown }
let mockMaybeSingleResult = { data: null as unknown, error: null as unknown }
let mockSelectResult = { data: null as unknown, error: null as unknown }
let mockDeleteResult = { error: null as unknown }
let mockCountResult = { count: null as number | null, error: null as unknown }

const chainable = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn(() => Promise.resolve(mockSelectResult)),
  single: vi.fn(() => Promise.resolve(mockSingleResult)),
  maybeSingle: vi.fn(() => Promise.resolve(mockMaybeSingleResult)),
}

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => chainable),
  },
}))

// Import after mocking
import { supabase } from '../supabase'
import {
  createReview,
  getReviewBySessionId,
  getReviewByTemplateSessionId,
  getUserReviews,
  updateReview,
  deleteReview,
  getReviewsInRange,
  getReviewCount,
} from '../reviewService'

const baseReview: WorkoutReview = {
  id: 'review-1',
  user_id: 'user-123',
  session_id: 'session-1',
  template_session_id: null,
  overall_rating: 4,
  difficulty_rating: 3,
  energy_level: 4,
  mood_before: 'neutral',
  mood_after: 'good',
  performance_tags: ['felt_strong', 'pumped'],
  reflection: 'Great session today',
  highlights: 'Hit a new PR on bench',
  improvements: 'Need to focus on form',
  workout_duration_minutes: 55,
  created_at: '2024-06-01T12:00:00Z',
  updated_at: '2024-06-01T12:00:00Z',
}

describe('reviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSingleResult = { data: null, error: null }
    mockMaybeSingleResult = { data: null, error: null }
    mockSelectResult = { data: null, error: null }
    mockDeleteResult = { error: null }
    mockCountResult = { count: null, error: null }

    // Reset chainable terminals to defaults
    chainable.select.mockReturnThis()
    chainable.insert.mockReturnThis()
    chainable.update.mockReturnThis()
    chainable.delete.mockReturnThis()
    chainable.eq.mockReturnThis()
    chainable.gte.mockReturnThis()
    chainable.lte.mockReturnThis()
    chainable.order.mockReturnThis()
    chainable.range.mockImplementation(() => Promise.resolve(mockSelectResult))
    chainable.single.mockImplementation(() => Promise.resolve(mockSingleResult))
    chainable.maybeSingle.mockImplementation(() => Promise.resolve(mockMaybeSingleResult))
  })

  // ────────────────────────────────────────────────────────
  // createReview
  // ────────────────────────────────────────────────────────

  describe('createReview', () => {
    it('creates a review with all fields successfully', async () => {
      mockSingleResult = { data: baseReview, error: null }

      const createData: CreateReviewData = {
        session_id: 'session-1',
        overall_rating: 4,
        difficulty_rating: 3,
        energy_level: 4,
        mood_before: 'neutral',
        mood_after: 'good',
        performance_tags: ['felt_strong', 'pumped'],
        reflection: 'Great session today',
        highlights: 'Hit a new PR on bench',
        improvements: 'Need to focus on form',
        workout_duration_minutes: 55,
      }

      const result = await createReview('user-123', createData)

      expect(supabase.from).toHaveBeenCalledWith('workout_reviews')
      expect(chainable.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        session_id: 'session-1',
        template_session_id: null,
        overall_rating: 4,
        difficulty_rating: 3,
        energy_level: 4,
        mood_before: 'neutral',
        mood_after: 'good',
        performance_tags: ['felt_strong', 'pumped'],
        reflection: 'Great session today',
        highlights: 'Hit a new PR on bench',
        improvements: 'Need to focus on form',
        workout_duration_minutes: 55,
      })
      expect(chainable.select).toHaveBeenCalled()
      expect(chainable.single).toHaveBeenCalled()
      expect(result).toEqual(baseReview)
    })

    it('creates a review with minimal required fields', async () => {
      const minimalReview: WorkoutReview = {
        ...baseReview,
        difficulty_rating: null,
        energy_level: null,
        mood_before: null,
        mood_after: null,
        performance_tags: [],
        reflection: null,
        highlights: null,
        improvements: null,
        workout_duration_minutes: null,
      }
      mockSingleResult = { data: minimalReview, error: null }

      const result = await createReview('user-123', { overall_rating: 4 })

      expect(chainable.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        session_id: null,
        template_session_id: null,
        overall_rating: 4,
        difficulty_rating: null,
        energy_level: null,
        mood_before: null,
        mood_after: null,
        performance_tags: [],
        reflection: null,
        highlights: null,
        improvements: null,
        workout_duration_minutes: null,
      })
      expect(result).toEqual(minimalReview)
    })

    it('creates a review for a template session (cardio/mobility)', async () => {
      const templateReview: WorkoutReview = {
        ...baseReview,
        session_id: null,
        template_session_id: 'template-session-1',
      }
      mockSingleResult = { data: templateReview, error: null }

      const result = await createReview('user-123', {
        template_session_id: 'template-session-1',
        overall_rating: 5,
      })

      expect(chainable.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: null,
          template_session_id: 'template-session-1',
        })
      )
      expect(result.template_session_id).toBe('template-session-1')
      expect(result.session_id).toBeNull()
    })

    it('defaults session_id and template_session_id to null when not provided', async () => {
      mockSingleResult = { data: baseReview, error: null }

      await createReview('user-123', { overall_rating: 3 })

      expect(chainable.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: null,
          template_session_id: null,
        })
      )
    })

    it('throws on database error', async () => {
      const dbError = { code: '23505', message: 'duplicate key value' }
      mockSingleResult = { data: null, error: dbError }

      await expect(
        createReview('user-123', { overall_rating: 4 })
      ).rejects.toEqual(dbError)
    })

    it('throws on RLS policy violation', async () => {
      const rlsError = { code: '42501', message: 'new row violates row-level security policy' }
      mockSingleResult = { data: null, error: rlsError }

      await expect(
        createReview('wrong-user', { overall_rating: 3 })
      ).rejects.toEqual(rlsError)
    })

    it('calls chain methods in correct order: insert -> select -> single', async () => {
      mockSingleResult = { data: baseReview, error: null }
      const callOrder: string[] = []

      chainable.insert.mockImplementation(() => {
        callOrder.push('insert')
        return chainable
      })
      chainable.select.mockImplementation(() => {
        callOrder.push('select')
        return chainable
      })
      chainable.single.mockImplementation(() => {
        callOrder.push('single')
        return Promise.resolve(mockSingleResult)
      })

      await createReview('user-123', { overall_rating: 4 })

      expect(callOrder).toEqual(['insert', 'select', 'single'])
    })

    it('passes all mood values correctly', async () => {
      mockSingleResult = { data: baseReview, error: null }

      await createReview('user-123', {
        overall_rating: 3,
        mood_before: 'stressed',
        mood_after: 'great',
      })

      expect(chainable.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          mood_before: 'stressed',
          mood_after: 'great',
        })
      )
    })
  })

  // ────────────────────────────────────────────────────────
  // getReviewBySessionId
  // ────────────────────────────────────────────────────────

  describe('getReviewBySessionId', () => {
    it('returns review when found', async () => {
      mockMaybeSingleResult = { data: baseReview, error: null }

      const result = await getReviewBySessionId('session-1')

      expect(supabase.from).toHaveBeenCalledWith('workout_reviews')
      expect(chainable.select).toHaveBeenCalledWith('*')
      expect(chainable.eq).toHaveBeenCalledWith('session_id', 'session-1')
      expect(chainable.maybeSingle).toHaveBeenCalled()
      expect(result).toEqual(baseReview)
    })

    it('returns null when no review exists', async () => {
      mockMaybeSingleResult = { data: null, error: null }

      const result = await getReviewBySessionId('nonexistent-session')

      expect(result).toBeNull()
    })

    it('throws on database error', async () => {
      const dbError = { code: 'PGRST000', message: 'connection refused' }
      mockMaybeSingleResult = { data: null, error: dbError }

      await expect(getReviewBySessionId('session-1')).rejects.toEqual(dbError)
    })

    it('passes session ID correctly to eq chain', async () => {
      mockMaybeSingleResult = { data: null, error: null }

      await getReviewBySessionId('specific-session-uuid')

      expect(chainable.eq).toHaveBeenCalledWith('session_id', 'specific-session-uuid')
    })
  })

  // ────────────────────────────────────────────────────────
  // getReviewByTemplateSessionId
  // ────────────────────────────────────────────────────────

  describe('getReviewByTemplateSessionId', () => {
    it('returns review when found', async () => {
      const templateReview: WorkoutReview = {
        ...baseReview,
        session_id: null,
        template_session_id: 'template-session-1',
      }
      mockMaybeSingleResult = { data: templateReview, error: null }

      const result = await getReviewByTemplateSessionId('template-session-1')

      expect(supabase.from).toHaveBeenCalledWith('workout_reviews')
      expect(chainable.select).toHaveBeenCalledWith('*')
      expect(chainable.eq).toHaveBeenCalledWith('template_session_id', 'template-session-1')
      expect(chainable.maybeSingle).toHaveBeenCalled()
      expect(result).toEqual(templateReview)
    })

    it('returns null when no review exists', async () => {
      mockMaybeSingleResult = { data: null, error: null }

      const result = await getReviewByTemplateSessionId('nonexistent')

      expect(result).toBeNull()
    })

    it('throws on database error', async () => {
      const dbError = { code: '42P01', message: 'relation does not exist' }
      mockMaybeSingleResult = { data: null, error: dbError }

      await expect(
        getReviewByTemplateSessionId('template-1')
      ).rejects.toEqual(dbError)
    })
  })

  // ────────────────────────────────────────────────────────
  // getUserReviews
  // ────────────────────────────────────────────────────────

  describe('getUserReviews', () => {
    it('returns reviews array for a user', async () => {
      const reviews: WorkoutReview[] = [
        baseReview,
        { ...baseReview, id: 'review-2', overall_rating: 5 },
      ]
      mockSelectResult = { data: reviews, error: null }

      const result = await getUserReviews('user-123')

      expect(supabase.from).toHaveBeenCalledWith('workout_reviews')
      expect(chainable.select).toHaveBeenCalledWith('*')
      expect(chainable.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(chainable.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(reviews)
      expect(result).toHaveLength(2)
    })

    it('returns empty array when user has no reviews', async () => {
      mockSelectResult = { data: [], error: null }

      const result = await getUserReviews('user-no-reviews')

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('returns empty array when data is null', async () => {
      mockSelectResult = { data: null, error: null }

      const result = await getUserReviews('user-123')

      expect(result).toEqual([])
    })

    it('uses default limit of 20 and offset of 0', async () => {
      mockSelectResult = { data: [], error: null }

      await getUserReviews('user-123')

      // range(0, 19) for limit=20, offset=0
      expect(chainable.range).toHaveBeenCalledWith(0, 19)
    })

    it('respects custom limit and offset', async () => {
      mockSelectResult = { data: [], error: null }

      await getUserReviews('user-123', 10, 5)

      // range(5, 14) for limit=10, offset=5
      expect(chainable.range).toHaveBeenCalledWith(5, 14)
    })

    it('throws on database error', async () => {
      const dbError = { code: 'PGRST000', message: 'connection refused' }
      mockSelectResult = { data: null, error: dbError }

      await expect(getUserReviews('user-123')).rejects.toEqual(dbError)
    })

    it('orders results by created_at descending (newest first)', async () => {
      mockSelectResult = { data: [], error: null }

      await getUserReviews('user-123')

      expect(chainable.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })

  // ────────────────────────────────────────────────────────
  // updateReview
  // ────────────────────────────────────────────────────────

  describe('updateReview', () => {
    it('updates review successfully', async () => {
      const updated: WorkoutReview = { ...baseReview, overall_rating: 5 }
      mockSingleResult = { data: updated, error: null }

      const updateData: UpdateReviewData = { overall_rating: 5 }
      const result = await updateReview('review-1', updateData)

      expect(supabase.from).toHaveBeenCalledWith('workout_reviews')
      expect(chainable.update).toHaveBeenCalledWith(updateData)
      expect(chainable.eq).toHaveBeenCalledWith('id', 'review-1')
      expect(chainable.select).toHaveBeenCalled()
      expect(chainable.single).toHaveBeenCalled()
      expect(result.overall_rating).toBe(5)
    })

    it('updates multiple fields at once', async () => {
      const updateData: UpdateReviewData = {
        overall_rating: 5,
        difficulty_rating: 4,
        mood_after: 'great',
        reflection: 'Updated reflection',
      }
      const updated: WorkoutReview = { ...baseReview, ...updateData }
      mockSingleResult = { data: updated, error: null }

      const result = await updateReview('review-1', updateData)

      expect(chainable.update).toHaveBeenCalledWith(updateData)
      expect(result.overall_rating).toBe(5)
      expect(result.difficulty_rating).toBe(4)
      expect(result.mood_after).toBe('great')
      expect(result.reflection).toBe('Updated reflection')
    })

    it('can set nullable fields to null', async () => {
      const updateData: UpdateReviewData = {
        difficulty_rating: null,
        energy_level: null,
        mood_before: null,
        mood_after: null,
        reflection: null,
      }
      const updated: WorkoutReview = { ...baseReview, ...updateData }
      mockSingleResult = { data: updated, error: null }

      const result = await updateReview('review-1', updateData)

      expect(chainable.update).toHaveBeenCalledWith(updateData)
      expect(result.difficulty_rating).toBeNull()
      expect(result.energy_level).toBeNull()
    })

    it('throws on database error', async () => {
      const dbError = { code: 'PGRST116', message: 'Row not found' }
      mockSingleResult = { data: null, error: dbError }

      await expect(
        updateReview('nonexistent', { overall_rating: 5 })
      ).rejects.toEqual(dbError)
    })
  })

  // ────────────────────────────────────────────────────────
  // deleteReview
  // ────────────────────────────────────────────────────────

  describe('deleteReview', () => {
    it('deletes a review successfully', async () => {
      // delete -> eq returns the chainable, and the terminal is eq itself here
      chainable.eq.mockImplementation(() => Promise.resolve(mockDeleteResult))

      const result = await deleteReview('review-1')

      expect(supabase.from).toHaveBeenCalledWith('workout_reviews')
      expect(chainable.delete).toHaveBeenCalled()
      expect(chainable.eq).toHaveBeenCalledWith('id', 'review-1')
      expect(result).toBeUndefined()
    })

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' }
      chainable.eq.mockImplementation(() => Promise.resolve({ error: dbError }))

      await expect(deleteReview('review-1')).rejects.toEqual(dbError)
    })
  })

  // ────────────────────────────────────────────────────────
  // getReviewsInRange
  // ────────────────────────────────────────────────────────

  describe('getReviewsInRange', () => {
    it('returns reviews within date range', async () => {
      const reviews: WorkoutReview[] = [
        { ...baseReview, id: 'review-1', created_at: '2024-06-01T12:00:00Z' },
        { ...baseReview, id: 'review-2', created_at: '2024-06-03T12:00:00Z' },
      ]
      // order is the terminal here
      chainable.order.mockImplementation(() => Promise.resolve({ data: reviews, error: null }))

      const result = await getReviewsInRange('user-123', '2024-06-01T00:00:00Z', '2024-06-07T00:00:00Z')

      expect(supabase.from).toHaveBeenCalledWith('workout_reviews')
      expect(chainable.select).toHaveBeenCalledWith('*')
      expect(chainable.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(chainable.gte).toHaveBeenCalledWith('created_at', '2024-06-01T00:00:00Z')
      expect(chainable.lte).toHaveBeenCalledWith('created_at', '2024-06-07T00:00:00Z')
      expect(chainable.order).toHaveBeenCalledWith('created_at', { ascending: true })
      expect(result).toEqual(reviews)
      expect(result).toHaveLength(2)
    })

    it('returns empty array when no reviews in range', async () => {
      chainable.order.mockImplementation(() => Promise.resolve({ data: [], error: null }))

      const result = await getReviewsInRange('user-123', '2020-01-01', '2020-01-02')

      expect(result).toEqual([])
    })

    it('returns empty array when data is null', async () => {
      chainable.order.mockImplementation(() => Promise.resolve({ data: null, error: null }))

      const result = await getReviewsInRange('user-123', '2024-01-01', '2024-01-07')

      expect(result).toEqual([])
    })

    it('throws on database error', async () => {
      const dbError = { code: 'PGRST000', message: 'connection refused' }
      chainable.order.mockImplementation(() => Promise.resolve({ data: null, error: dbError }))

      await expect(
        getReviewsInRange('user-123', '2024-01-01', '2024-01-07')
      ).rejects.toEqual(dbError)
    })
  })

  // ────────────────────────────────────────────────────────
  // getReviewCount
  // ────────────────────────────────────────────────────────

  describe('getReviewCount', () => {
    it('returns count when reviews exist', async () => {
      // select with count options -> eq is terminal
      chainable.eq.mockImplementation(() => Promise.resolve({ count: 15, error: null }))

      const result = await getReviewCount('user-123')

      expect(supabase.from).toHaveBeenCalledWith('workout_reviews')
      expect(chainable.select).toHaveBeenCalledWith('*', { count: 'exact', head: true })
      expect(chainable.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(result).toBe(15)
    })

    it('returns 0 when count is null', async () => {
      chainable.eq.mockImplementation(() => Promise.resolve({ count: null, error: null }))

      const result = await getReviewCount('user-123')

      expect(result).toBe(0)
    })

    it('returns 0 when no reviews exist', async () => {
      chainable.eq.mockImplementation(() => Promise.resolve({ count: 0, error: null }))

      const result = await getReviewCount('user-123')

      expect(result).toBe(0)
    })

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' }
      chainable.eq.mockImplementation(() => Promise.resolve({ count: null, error: dbError }))

      await expect(getReviewCount('user-123')).rejects.toEqual(dbError)
    })
  })
})
