import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { UserFeedback } from '../feedbackService'

// Build a chainable mock where each terminal method can be reconfigured per-test.
let mockSingleResult = { data: null as unknown, error: null as unknown }
let mockSelectResult = { data: null as unknown, error: null as unknown }

const chainable = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn(() => Promise.resolve(mockSelectResult)),
  single: vi.fn(() => Promise.resolve(mockSingleResult)),
}

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => chainable),
  },
}))

// Import after mocking
import { supabase } from '../supabase'
import { submitFeedback, getUserFeedback } from '../feedbackService'

const baseFeedback: UserFeedback = {
  id: 'feedback-1',
  user_id: 'user-123',
  type: 'bug',
  message: 'Something is broken',
  status: 'new',
  created_at: '2024-06-01T12:00:00Z',
}

describe('feedbackService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSingleResult = { data: null, error: null }
    mockSelectResult = { data: null, error: null }
  })

  // ────────────────────────────────────────────────────────
  // Type definitions
  // ────────────────────────────────────────────────────────

  describe('type definitions', () => {
    it('UserFeedback type has correct shape', () => {
      const feedback: UserFeedback = { ...baseFeedback }

      expect(feedback.id).toBe('feedback-1')
      expect(feedback.user_id).toBe('user-123')
      expect(feedback.type).toBe('bug')
      expect(feedback.message).toBe('Something is broken')
      expect(feedback.status).toBe('new')
      expect(feedback.created_at).toBe('2024-06-01T12:00:00Z')
    })

    it('UserFeedback supports feature type', () => {
      const feedback: UserFeedback = {
        ...baseFeedback,
        type: 'feature',
        message: 'Please add dark mode',
      }

      expect(feedback.type).toBe('feature')
      expect(feedback.message).toBe('Please add dark mode')
    })
  })

  // ────────────────────────────────────────────────────────
  // submitFeedback
  // ────────────────────────────────────────────────────────

  describe('submitFeedback', () => {
    it('submits bug feedback successfully', async () => {
      mockSingleResult = { data: baseFeedback, error: null }

      const result = await submitFeedback('user-123', 'bug', 'Something is broken')

      expect(supabase.from).toHaveBeenCalledWith('user_feedback')
      expect(chainable.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        type: 'bug',
        message: 'Something is broken',
      })
      expect(chainable.select).toHaveBeenCalled()
      expect(chainable.single).toHaveBeenCalled()
      expect(result).toEqual(baseFeedback)
    })

    it('submits feature request feedback successfully', async () => {
      const featureFeedback: UserFeedback = {
        ...baseFeedback,
        id: 'feedback-2',
        type: 'feature',
        message: 'Add charts for progress',
      }
      mockSingleResult = { data: featureFeedback, error: null }

      const result = await submitFeedback('user-123', 'feature', 'Add charts for progress')

      expect(chainable.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        type: 'feature',
        message: 'Add charts for progress',
      })
      expect(result).toEqual(featureFeedback)
      expect(result.type).toBe('feature')
    })

    it('passes the correct userId in the insert payload', async () => {
      mockSingleResult = { data: baseFeedback, error: null }

      await submitFeedback('specific-user-456', 'bug', 'Error message')

      expect(chainable.insert).toHaveBeenCalledWith({
        user_id: 'specific-user-456',
        type: 'bug',
        message: 'Error message',
      })
    })

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' }
      mockSingleResult = { data: null, error: dbError }

      await expect(
        submitFeedback('user-123', 'bug', 'Something broke')
      ).rejects.toEqual(dbError)
    })

    it('throws on RLS policy violation', async () => {
      const rlsError = { code: '42501', message: 'new row violates row-level security policy' }
      mockSingleResult = { data: null, error: rlsError }

      await expect(
        submitFeedback('wrong-user', 'bug', 'Not allowed')
      ).rejects.toEqual(rlsError)
    })

    it('throws on unique constraint violation', async () => {
      const constraintError = { code: '23505', message: 'duplicate key value' }
      mockSingleResult = { data: null, error: constraintError }

      await expect(
        submitFeedback('user-123', 'feature', 'Duplicate')
      ).rejects.toEqual(constraintError)
    })

    it('handles long message strings', async () => {
      const longMessage = 'A'.repeat(5000)
      const feedback: UserFeedback = {
        ...baseFeedback,
        message: longMessage,
      }
      mockSingleResult = { data: feedback, error: null }

      const result = await submitFeedback('user-123', 'bug', longMessage)

      expect(chainable.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        type: 'bug',
        message: longMessage,
      })
      expect(result.message).toBe(longMessage)
    })

    it('handles empty message string', async () => {
      const feedback: UserFeedback = { ...baseFeedback, message: '' }
      mockSingleResult = { data: feedback, error: null }

      const result = await submitFeedback('user-123', 'bug', '')

      expect(chainable.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        type: 'bug',
        message: '',
      })
      expect(result.message).toBe('')
    })

    it('returns data typed as UserFeedback', async () => {
      const feedback: UserFeedback = {
        id: 'feedback-99',
        user_id: 'user-123',
        type: 'feature',
        message: 'Better UI',
        status: 'in_progress',
        created_at: '2024-07-01T00:00:00Z',
      }
      mockSingleResult = { data: feedback, error: null }

      const result = await submitFeedback('user-123', 'feature', 'Better UI')

      expect(result.id).toBe('feedback-99')
      expect(result.status).toBe('in_progress')
      expect(result.created_at).toBe('2024-07-01T00:00:00Z')
    })

    it('calls chain methods in correct order: insert -> select -> single', async () => {
      mockSingleResult = { data: baseFeedback, error: null }
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

      await submitFeedback('user-123', 'bug', 'Test order')

      expect(callOrder).toEqual(['insert', 'select', 'single'])
    })
  })

  // ────────────────────────────────────────────────────────
  // getUserFeedback
  // ────────────────────────────────────────────────────────

  describe('getUserFeedback', () => {
    it('returns feedback list for a user', async () => {
      const feedbackList: UserFeedback[] = [
        baseFeedback,
        {
          id: 'feedback-2',
          user_id: 'user-123',
          type: 'feature',
          message: 'Add graphs',
          status: 'new',
          created_at: '2024-06-02T12:00:00Z',
        },
      ]
      mockSelectResult = { data: feedbackList, error: null }

      const result = await getUserFeedback('user-123')

      expect(supabase.from).toHaveBeenCalledWith('user_feedback')
      expect(chainable.select).toHaveBeenCalledWith('*')
      expect(chainable.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(chainable.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(feedbackList)
      expect(result).toHaveLength(2)
    })

    it('returns empty array when user has no feedback', async () => {
      mockSelectResult = { data: [], error: null }

      const result = await getUserFeedback('user-no-feedback')

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('returns empty array when data is null', async () => {
      mockSelectResult = { data: null, error: null }

      const result = await getUserFeedback('user-123')

      expect(result).toEqual([])
    })

    it('passes the correct userId to the eq chain', async () => {
      mockSelectResult = { data: [], error: null }

      await getUserFeedback('specific-uuid-789')

      expect(chainable.eq).toHaveBeenCalledWith('user_id', 'specific-uuid-789')
    })

    it('orders results by created_at descending (newest first)', async () => {
      mockSelectResult = { data: [], error: null }

      await getUserFeedback('user-123')

      expect(chainable.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('throws on database error', async () => {
      const dbError = { code: 'PGRST000', message: 'connection refused' }
      mockSelectResult = { data: null, error: dbError }

      await expect(getUserFeedback('user-123')).rejects.toEqual(dbError)
    })

    it('throws on RLS policy error', async () => {
      const rlsError = { code: '42501', message: 'permission denied for table user_feedback' }
      mockSelectResult = { data: null, error: rlsError }

      await expect(getUserFeedback('user-123')).rejects.toEqual(rlsError)
    })

    it('returns multiple feedback items in correct order', async () => {
      const feedbackList: UserFeedback[] = [
        { ...baseFeedback, id: 'fb-3', created_at: '2024-06-03T12:00:00Z' },
        { ...baseFeedback, id: 'fb-2', created_at: '2024-06-02T12:00:00Z' },
        { ...baseFeedback, id: 'fb-1', created_at: '2024-06-01T12:00:00Z' },
      ]
      mockSelectResult = { data: feedbackList, error: null }

      const result = await getUserFeedback('user-123')

      expect(result).toHaveLength(3)
      expect(result[0].id).toBe('fb-3')
      expect(result[2].id).toBe('fb-1')
    })

    it('returns feedback with mixed types', async () => {
      const feedbackList: UserFeedback[] = [
        { ...baseFeedback, id: 'fb-1', type: 'bug' },
        { ...baseFeedback, id: 'fb-2', type: 'feature' },
        { ...baseFeedback, id: 'fb-3', type: 'bug' },
      ]
      mockSelectResult = { data: feedbackList, error: null }

      const result = await getUserFeedback('user-123')

      expect(result).toHaveLength(3)
      expect(result[0].type).toBe('bug')
      expect(result[1].type).toBe('feature')
      expect(result[2].type).toBe('bug')
    })

    it('calls chain methods in correct order: select -> eq -> order', async () => {
      mockSelectResult = { data: [], error: null }
      const callOrder: string[] = []

      chainable.select.mockImplementation(() => {
        callOrder.push('select')
        return chainable
      })
      chainable.eq.mockImplementation(() => {
        callOrder.push('eq')
        return chainable
      })
      chainable.order.mockImplementation(() => {
        callOrder.push('order')
        return Promise.resolve(mockSelectResult)
      })

      await getUserFeedback('user-123')

      expect(callOrder).toEqual(['select', 'eq', 'order'])
    })
  })
})
