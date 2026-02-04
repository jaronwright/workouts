import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProgressionSuggestion } from '../useProgression'
import { useAuthStore } from '@/stores/authStore'
import * as progressionService from '@/services/progressionService'
import { ReactNode } from 'react'

// Mock dependencies
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/services/progressionService', () => ({
  getProgressionSuggestion: vi.fn(),
}))

describe('useProgression hooks', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }
  const mockSuggestion = {
    currentWeight: 135,
    suggestedWeight: 140,
    increase: 5,
    reason: 'You hit 8+ reps at 135 lbs for 2 sessions',
  }

  let queryClient: QueryClient

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = { user: mockUser }
      if (typeof selector === 'function') {
        return selector(state as any)
      }
      return state
    })
  })

  describe('useProgressionSuggestion', () => {
    it('fetches progression suggestion when all params are provided', async () => {
      vi.mocked(progressionService.getProgressionSuggestion).mockResolvedValue(
        mockSuggestion
      )

      const { result } = renderHook(
        () => useProgressionSuggestion('exercise-123', 'Bench Press', 8),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(progressionService.getProgressionSuggestion).toHaveBeenCalledWith(
        'user-123',
        'exercise-123',
        'Bench Press',
        8
      )
      expect(result.current.data).toEqual(mockSuggestion)
    })

    it('does not fetch when user is not authenticated', () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = { user: null }
        if (typeof selector === 'function') {
          return selector(state as any)
        }
        return state
      })

      const { result } = renderHook(
        () => useProgressionSuggestion('exercise-123', 'Bench Press', 8),
        { wrapper }
      )

      expect(result.current.fetchStatus).toBe('idle')
      expect(
        progressionService.getProgressionSuggestion
      ).not.toHaveBeenCalled()
    })

    it('does not fetch when exerciseId is undefined', () => {
      const { result } = renderHook(
        () => useProgressionSuggestion(undefined, 'Bench Press', 8),
        { wrapper }
      )

      expect(result.current.fetchStatus).toBe('idle')
      expect(
        progressionService.getProgressionSuggestion
      ).not.toHaveBeenCalled()
    })

    it('does not fetch when targetReps is null', () => {
      const { result } = renderHook(
        () => useProgressionSuggestion('exercise-123', 'Bench Press', null),
        { wrapper }
      )

      expect(result.current.fetchStatus).toBe('idle')
      expect(
        progressionService.getProgressionSuggestion
      ).not.toHaveBeenCalled()
    })

    it('returns null when no suggestion available', async () => {
      vi.mocked(progressionService.getProgressionSuggestion).mockResolvedValue(
        null
      )

      const { result } = renderHook(
        () => useProgressionSuggestion('exercise-123', 'Bench Press', 8),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeNull()
    })
  })
})
