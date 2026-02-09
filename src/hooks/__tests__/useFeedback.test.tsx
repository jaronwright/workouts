import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSubmitFeedback, useUserFeedback } from '../useFeedback'
import { useAuthStore } from '@/stores/authStore'
import * as feedbackService from '@/services/feedbackService'
import { ReactNode } from 'react'

// Mock dependencies
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/services/feedbackService', () => ({
  submitFeedback: vi.fn(),
  getUserFeedback: vi.fn(),
}))

describe('useFeedback hooks', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }

  const mockFeedback: feedbackService.UserFeedback = {
    id: 'feedback-1',
    user_id: 'user-123',
    type: 'bug',
    message: 'Something is broken',
    status: 'open',
    created_at: '2024-06-01T00:00:00Z',
  }

  const mockFeatureRequest: feedbackService.UserFeedback = {
    id: 'feedback-2',
    user_id: 'user-123',
    type: 'feature',
    message: 'Please add dark mode',
    status: 'open',
    created_at: '2024-06-02T00:00:00Z',
  }

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

  // ─── useUserFeedback ──────────────────────────────────

  describe('useUserFeedback', () => {
    it('fetches feedback when user is authenticated', async () => {
      vi.mocked(feedbackService.getUserFeedback).mockResolvedValue([mockFeedback])

      const { result } = renderHook(() => useUserFeedback(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(feedbackService.getUserFeedback).toHaveBeenCalledWith('user-123')
      expect(result.current.data).toEqual([mockFeedback])
    })

    it('is disabled when no user is present', () => {
      mockUnauthenticatedUser()

      const { result } = renderHook(() => useUserFeedback(), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(feedbackService.getUserFeedback).not.toHaveBeenCalled()
    })

    it('returns empty array when user has no feedback', async () => {
      vi.mocked(feedbackService.getUserFeedback).mockResolvedValue([])

      const { result } = renderHook(() => useUserFeedback(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual([])
    })

    it('returns multiple feedback items', async () => {
      vi.mocked(feedbackService.getUserFeedback).mockResolvedValue([
        mockFeedback,
        mockFeatureRequest,
      ])

      const { result } = renderHook(() => useUserFeedback(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toHaveLength(2)
      expect(result.current.data![0].type).toBe('bug')
      expect(result.current.data![1].type).toBe('feature')
    })

    it('uses correct query key containing user id', async () => {
      vi.mocked(feedbackService.getUserFeedback).mockResolvedValue([])

      renderHook(() => useUserFeedback(), { wrapper })

      await waitFor(() => {
        const queryState = queryClient.getQueryState(['feedback', 'user-123'])
        expect(queryState).toBeDefined()
      })
    })

    it('handles service error as query error', async () => {
      const error = new Error('Network failure')
      vi.mocked(feedbackService.getUserFeedback).mockRejectedValue(error)

      const { result } = renderHook(() => useUserFeedback(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })

    it('starts in loading state before data arrives', async () => {
      let resolveGetFeedback: (value: feedbackService.UserFeedback[]) => void
      vi.mocked(feedbackService.getUserFeedback).mockImplementation(
        () => new Promise((resolve) => { resolveGetFeedback = resolve })
      )

      const { result } = renderHook(() => useUserFeedback(), { wrapper })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()

      await act(async () => {
        resolveGetFeedback!([mockFeedback])
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
      expect(result.current.data).toEqual([mockFeedback])
    })

    it('has isPending true when query is disabled (no user)', () => {
      mockUnauthenticatedUser()

      const { result } = renderHook(() => useUserFeedback(), { wrapper })

      expect(result.current.isPending).toBe(true)
      expect(result.current.fetchStatus).toBe('idle')
    })

    it('query key includes undefined when user has no id', () => {
      mockUnauthenticatedUser()

      renderHook(() => useUserFeedback(), { wrapper })

      const queryState = queryClient.getQueryState(['feedback', undefined])
      expect(queryState).toBeDefined()
      expect(queryState!.fetchStatus).toBe('idle')
      expect(queryState!.data).toBeUndefined()
    })

    it('does not refetch when user id has not changed', async () => {
      vi.mocked(feedbackService.getUserFeedback).mockResolvedValue([])

      const { result, rerender } = renderHook(() => useUserFeedback(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(feedbackService.getUserFeedback).toHaveBeenCalledTimes(1)

      rerender()

      expect(feedbackService.getUserFeedback).toHaveBeenCalledTimes(1)
    })
  })

  // ─── useSubmitFeedback ─────────────────────────────────

  describe('useSubmitFeedback', () => {
    it('calls submitFeedback with user id, type, and message', async () => {
      vi.mocked(feedbackService.submitFeedback).mockResolvedValue(mockFeedback)

      const { result } = renderHook(() => useSubmitFeedback(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ type: 'bug', message: 'Something is broken' })
      })

      expect(feedbackService.submitFeedback).toHaveBeenCalledWith(
        'user-123',
        'bug',
        'Something is broken'
      )
    })

    it('submits a feature request', async () => {
      vi.mocked(feedbackService.submitFeedback).mockResolvedValue(mockFeatureRequest)

      const { result } = renderHook(() => useSubmitFeedback(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ type: 'feature', message: 'Please add dark mode' })
      })

      expect(feedbackService.submitFeedback).toHaveBeenCalledWith(
        'user-123',
        'feature',
        'Please add dark mode'
      )
    })

    it('invalidates feedback queries on success', async () => {
      vi.mocked(feedbackService.submitFeedback).mockResolvedValue(mockFeedback)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useSubmitFeedback(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ type: 'bug', message: 'test' })
      })

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['feedback', 'user-123'],
      })
    })

    it('handles mutation error gracefully', async () => {
      const error = new Error('Submit failed')
      vi.mocked(feedbackService.submitFeedback).mockRejectedValue(error)

      const { result } = renderHook(() => useSubmitFeedback(), { wrapper })

      act(() => {
        result.current.mutate({ type: 'bug', message: 'fail' })
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })

    it('is in idle state before mutation is triggered', () => {
      const { result } = renderHook(() => useSubmitFeedback(), { wrapper })

      expect(result.current.isIdle).toBe(true)
      expect(result.current.isPending).toBe(false)
      expect(result.current.isError).toBe(false)
      expect(result.current.isSuccess).toBe(false)
    })

    it('transitions through pending state during mutation', async () => {
      let resolveSubmit: (value: feedbackService.UserFeedback) => void
      vi.mocked(feedbackService.submitFeedback).mockImplementation(
        () => new Promise((resolve) => { resolveSubmit = resolve })
      )

      const { result } = renderHook(() => useSubmitFeedback(), { wrapper })

      act(() => {
        result.current.mutate({ type: 'bug', message: 'pending' })
      })

      await waitFor(() => {
        expect(result.current.isPending).toBe(true)
      })

      await act(async () => {
        resolveSubmit!(mockFeedback)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })

    it('does not invalidate queries on error', async () => {
      vi.mocked(feedbackService.submitFeedback).mockRejectedValue(new Error('fail'))
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useSubmitFeedback(), { wrapper })

      await act(async () => {
        try {
          await result.current.mutateAsync({ type: 'bug', message: 'fail' })
        } catch {
          // Expected
        }
      })

      expect(invalidateSpy).not.toHaveBeenCalled()
    })

    it('returns data from successful mutation', async () => {
      vi.mocked(feedbackService.submitFeedback).mockResolvedValue(mockFeedback)

      const { result } = renderHook(() => useSubmitFeedback(), { wrapper })

      let returnedData: feedbackService.UserFeedback | undefined
      await act(async () => {
        returnedData = await result.current.mutateAsync({ type: 'bug', message: 'test' })
      })

      expect(returnedData).toEqual(mockFeedback)
    })

    it('can perform sequential mutations', async () => {
      vi.mocked(feedbackService.submitFeedback)
        .mockResolvedValueOnce(mockFeedback)
        .mockResolvedValueOnce(mockFeatureRequest)

      const { result } = renderHook(() => useSubmitFeedback(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ type: 'bug', message: 'First' })
      })

      await act(async () => {
        await result.current.mutateAsync({ type: 'feature', message: 'Second' })
      })

      expect(feedbackService.submitFeedback).toHaveBeenCalledTimes(2)
      expect(feedbackService.submitFeedback).toHaveBeenNthCalledWith(1, 'user-123', 'bug', 'First')
      expect(feedbackService.submitFeedback).toHaveBeenNthCalledWith(2, 'user-123', 'feature', 'Second')
    })
  })
})
