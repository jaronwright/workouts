import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useSessionReview,
  useTemplateSessionReview,
  useUserReviews,
  useReviewsInRange,
  useReviewCount,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  useWeeklyReview,
  useReviewStats,
} from '../useReview'
import { useAuthStore } from '@/stores/authStore'
import * as reviewService from '@/services/reviewService'
import { ReactNode } from 'react'

// Mock dependencies
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/services/reviewService', () => ({
  createReview: vi.fn(),
  getReviewBySessionId: vi.fn(),
  getReviewByTemplateSessionId: vi.fn(),
  getUserReviews: vi.fn(),
  updateReview: vi.fn(),
  deleteReview: vi.fn(),
  getReviewsInRange: vi.fn(),
  getReviewCount: vi.fn(),
}))

const mockUser = { id: 'user-123', email: 'test@example.com' }

const baseReview: reviewService.WorkoutReview = {
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
  highlights: 'Hit a new PR',
  improvements: 'Better form',
  workout_duration_minutes: 55,
  created_at: '2024-06-01T12:00:00Z',
  updated_at: '2024-06-01T12:00:00Z',
}

describe('useReview hooks', () => {
  let queryClient: QueryClient

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  function mockAuthenticatedUser() {
    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = { user: mockUser }
      if (typeof selector === 'function') {
        return selector(state as Parameters<typeof selector>[0])
      }
      return state
    })
  }

  function mockUnauthenticatedUser() {
    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = { user: null }
      if (typeof selector === 'function') {
        return selector(state as Parameters<typeof selector>[0])
      }
      return state
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    mockAuthenticatedUser()
  })

  // ─── useSessionReview ──────────────────────────────────

  describe('useSessionReview', () => {
    it('fetches review when sessionId is provided', async () => {
      vi.mocked(reviewService.getReviewBySessionId).mockResolvedValue(baseReview)

      const { result } = renderHook(() => useSessionReview('session-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(reviewService.getReviewBySessionId).toHaveBeenCalledWith('session-1')
      expect(result.current.data).toEqual(baseReview)
    })

    it('is disabled when sessionId is undefined', () => {
      const { result } = renderHook(() => useSessionReview(undefined), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(reviewService.getReviewBySessionId).not.toHaveBeenCalled()
    })

    it('returns null when no review found', async () => {
      vi.mocked(reviewService.getReviewBySessionId).mockResolvedValue(null)

      const { result } = renderHook(() => useSessionReview('session-99'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeNull()
    })

    it('handles service error', async () => {
      const error = new Error('DB error')
      vi.mocked(reviewService.getReviewBySessionId).mockRejectedValue(error)

      const { result } = renderHook(() => useSessionReview('session-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })
  })

  // ─── useTemplateSessionReview ──────────────────────────

  describe('useTemplateSessionReview', () => {
    it('fetches review when templateSessionId is provided', async () => {
      const templateReview = { ...baseReview, session_id: null, template_session_id: 'ts-1' }
      vi.mocked(reviewService.getReviewByTemplateSessionId).mockResolvedValue(templateReview)

      const { result } = renderHook(() => useTemplateSessionReview('ts-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(reviewService.getReviewByTemplateSessionId).toHaveBeenCalledWith('ts-1')
      expect(result.current.data).toEqual(templateReview)
    })

    it('is disabled when templateSessionId is undefined', () => {
      const { result } = renderHook(() => useTemplateSessionReview(undefined), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(reviewService.getReviewByTemplateSessionId).not.toHaveBeenCalled()
    })
  })

  // ─── useUserReviews ────────────────────────────────────

  describe('useUserReviews', () => {
    it('fetches reviews when user is authenticated', async () => {
      vi.mocked(reviewService.getUserReviews).mockResolvedValue([baseReview])

      const { result } = renderHook(() => useUserReviews(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(reviewService.getUserReviews).toHaveBeenCalledWith('user-123', 20, 0)
      expect(result.current.data).toEqual([baseReview])
    })

    it('passes custom limit and offset', async () => {
      vi.mocked(reviewService.getUserReviews).mockResolvedValue([])

      const { result } = renderHook(() => useUserReviews(10, 5), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(reviewService.getUserReviews).toHaveBeenCalledWith('user-123', 10, 5)
    })

    it('is disabled when no user is present', () => {
      mockUnauthenticatedUser()

      const { result } = renderHook(() => useUserReviews(), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(reviewService.getUserReviews).not.toHaveBeenCalled()
    })

    it('handles service error', async () => {
      const error = new Error('Network failure')
      vi.mocked(reviewService.getUserReviews).mockRejectedValue(error)

      const { result } = renderHook(() => useUserReviews(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })
  })

  // ─── useReviewsInRange ─────────────────────────────────

  describe('useReviewsInRange', () => {
    it('fetches reviews in date range', async () => {
      vi.mocked(reviewService.getReviewsInRange).mockResolvedValue([baseReview])

      const { result } = renderHook(
        () => useReviewsInRange('2024-06-01', '2024-06-07'),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(reviewService.getReviewsInRange).toHaveBeenCalledWith('user-123', '2024-06-01', '2024-06-07')
    })

    it('is disabled when user is not authenticated', () => {
      mockUnauthenticatedUser()

      const { result } = renderHook(
        () => useReviewsInRange('2024-06-01', '2024-06-07'),
        { wrapper }
      )

      expect(result.current.fetchStatus).toBe('idle')
    })

    it('is disabled when startDate is empty', () => {
      const { result } = renderHook(
        () => useReviewsInRange('', '2024-06-07'),
        { wrapper }
      )

      expect(result.current.fetchStatus).toBe('idle')
    })

    it('is disabled when endDate is empty', () => {
      const { result } = renderHook(
        () => useReviewsInRange('2024-06-01', ''),
        { wrapper }
      )

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  // ─── useReviewCount ────────────────────────────────────

  describe('useReviewCount', () => {
    it('fetches review count', async () => {
      vi.mocked(reviewService.getReviewCount).mockResolvedValue(15)

      const { result } = renderHook(() => useReviewCount(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(reviewService.getReviewCount).toHaveBeenCalledWith('user-123')
      expect(result.current.data).toBe(15)
    })

    it('is disabled when no user', () => {
      mockUnauthenticatedUser()

      const { result } = renderHook(() => useReviewCount(), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  // ─── useCreateReview ───────────────────────────────────

  describe('useCreateReview', () => {
    it('creates review with user id', async () => {
      vi.mocked(reviewService.createReview).mockResolvedValue(baseReview)

      const { result } = renderHook(() => useCreateReview(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          session_id: 'session-1',
          overall_rating: 4,
        })
      })

      expect(reviewService.createReview).toHaveBeenCalledWith('user-123', {
        session_id: 'session-1',
        overall_rating: 4,
      })
    })

    it('invalidates reviews queries on success', async () => {
      vi.mocked(reviewService.createReview).mockResolvedValue(baseReview)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useCreateReview(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ overall_rating: 4 })
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reviews'] })
    })

    it('invalidates session-specific review query when session_id present', async () => {
      vi.mocked(reviewService.createReview).mockResolvedValue(baseReview)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useCreateReview(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ overall_rating: 4 })
      })

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['review', 'session', 'session-1'],
      })
    })

    it('invalidates template-session review query when template_session_id present', async () => {
      const templateReview = { ...baseReview, session_id: null, template_session_id: 'ts-1' }
      vi.mocked(reviewService.createReview).mockResolvedValue(templateReview)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useCreateReview(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ template_session_id: 'ts-1', overall_rating: 5 })
      })

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['review', 'template-session', 'ts-1'],
      })
    })

    it('handles mutation error', async () => {
      const error = new Error('Create failed')
      vi.mocked(reviewService.createReview).mockRejectedValue(error)

      const { result } = renderHook(() => useCreateReview(), { wrapper })

      act(() => {
        result.current.mutate({ overall_rating: 4 })
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })

    it('is idle before mutation is triggered', () => {
      const { result } = renderHook(() => useCreateReview(), { wrapper })

      expect(result.current.isIdle).toBe(true)
    })
  })

  // ─── useUpdateReview ───────────────────────────────────

  describe('useUpdateReview', () => {
    it('updates review with id and data', async () => {
      const updated = { ...baseReview, overall_rating: 5 }
      vi.mocked(reviewService.updateReview).mockResolvedValue(updated)

      const { result } = renderHook(() => useUpdateReview(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          reviewId: 'review-1',
          data: { overall_rating: 5 },
        })
      })

      expect(reviewService.updateReview).toHaveBeenCalledWith('review-1', { overall_rating: 5 })
    })

    it('invalidates reviews and review queries on success', async () => {
      vi.mocked(reviewService.updateReview).mockResolvedValue(baseReview)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useUpdateReview(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          reviewId: 'review-1',
          data: { overall_rating: 3 },
        })
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reviews'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['review'] })
    })

    it('handles update error', async () => {
      vi.mocked(reviewService.updateReview).mockRejectedValue(new Error('Update failed'))

      const { result } = renderHook(() => useUpdateReview(), { wrapper })

      act(() => {
        result.current.mutate({ reviewId: 'review-1', data: { overall_rating: 2 } })
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })
  })

  // ─── useDeleteReview ───────────────────────────────────

  describe('useDeleteReview', () => {
    it('deletes review by id', async () => {
      vi.mocked(reviewService.deleteReview).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteReview(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync('review-1')
      })

      expect(reviewService.deleteReview).toHaveBeenCalledWith('review-1')
    })

    it('invalidates queries on success', async () => {
      vi.mocked(reviewService.deleteReview).mockResolvedValue(undefined)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useDeleteReview(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync('review-1')
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reviews'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['review'] })
    })

    it('handles delete error', async () => {
      vi.mocked(reviewService.deleteReview).mockRejectedValue(new Error('Delete failed'))

      const { result } = renderHook(() => useDeleteReview(), { wrapper })

      act(() => {
        result.current.mutate('review-1')
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })
  })

  // ─── useWeeklyReview ───────────────────────────────────

  describe('useWeeklyReview', () => {
    it('fetches reviews and computes weekly stats', async () => {
      const reviews: reviewService.WorkoutReview[] = [
        { ...baseReview, overall_rating: 4, difficulty_rating: 3, energy_level: 4 },
        { ...baseReview, id: 'review-2', overall_rating: 5, difficulty_rating: 5, energy_level: 3 },
      ]
      vi.mocked(reviewService.getReviewsInRange).mockResolvedValue(reviews)

      const weekStart = new Date('2024-06-01T00:00:00Z')
      const { result } = renderHook(() => useWeeklyReview(weekStart), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data!.totalReviews).toBe(2)
      expect(result.current.data!.averageRating).toBe(4.5)
    })

    it('returns zero stats for empty reviews', async () => {
      vi.mocked(reviewService.getReviewsInRange).mockResolvedValue([])

      const weekStart = new Date('2024-06-01T00:00:00Z')
      const { result } = renderHook(() => useWeeklyReview(weekStart), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data!.totalReviews).toBe(0)
      expect(result.current.data!.averageRating).toBe(0)
    })

    it('is disabled when no user', () => {
      mockUnauthenticatedUser()

      const weekStart = new Date('2024-06-01T00:00:00Z')
      const { result } = renderHook(() => useWeeklyReview(weekStart), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
    })

    it('computes mood improvement correctly', async () => {
      const reviews: reviewService.WorkoutReview[] = [
        { ...baseReview, mood_before: 'tired', mood_after: 'great' },
      ]
      vi.mocked(reviewService.getReviewsInRange).mockResolvedValue(reviews)

      const weekStart = new Date('2024-06-01T00:00:00Z')
      const { result } = renderHook(() => useWeeklyReview(weekStart), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // tired=2, great=5, delta=3
      expect(result.current.data!.moodImprovement).toBe(3)
    })

    it('computes top tags from reviews', async () => {
      const reviews: reviewService.WorkoutReview[] = [
        { ...baseReview, performance_tags: ['felt_strong', 'pumped'] },
        { ...baseReview, id: 'r2', performance_tags: ['felt_strong', 'new_pr'] },
      ]
      vi.mocked(reviewService.getReviewsInRange).mockResolvedValue(reviews)

      const weekStart = new Date('2024-06-01T00:00:00Z')
      const { result } = renderHook(() => useWeeklyReview(weekStart), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data!.topTags[0].tag).toBe('felt_strong')
      expect(result.current.data!.topTags[0].count).toBe(2)
    })
  })

  // ─── useReviewStats ────────────────────────────────────

  describe('useReviewStats', () => {
    it('fetches reviews and computes stats', async () => {
      const reviews: reviewService.WorkoutReview[] = [
        { ...baseReview, overall_rating: 4, mood_after: 'good' },
        { ...baseReview, id: 'r2', overall_rating: 5, mood_after: 'great' },
      ]
      vi.mocked(reviewService.getUserReviews).mockResolvedValue(reviews)

      const { result } = renderHook(() => useReviewStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data!.totalReviews).toBe(2)
      expect(result.current.data!.averageRating).toBe(4.5)
      expect(result.current.data!.moodDistribution.good).toBe(1)
      expect(result.current.data!.moodDistribution.great).toBe(1)
    })

    it('returns empty stats when no reviews', async () => {
      vi.mocked(reviewService.getUserReviews).mockResolvedValue([])

      const { result } = renderHook(() => useReviewStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data!.totalReviews).toBe(0)
      expect(result.current.data!.averageRating).toBe(0)
    })

    it('is disabled when no user', () => {
      mockUnauthenticatedUser()

      const { result } = renderHook(() => useReviewStats(), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
    })

    it('fetches up to 100 reviews for stats', async () => {
      vi.mocked(reviewService.getUserReviews).mockResolvedValue([])

      const { result } = renderHook(() => useReviewStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(reviewService.getUserReviews).toHaveBeenCalledWith('user-123', 100, 0)
    })
  })
})
