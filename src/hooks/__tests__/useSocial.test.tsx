import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSocialFeed, useToggleWorkoutPublic } from '../useSocial'
import * as socialService from '@/services/socialService'
import { ReactNode } from 'react'

// Mock dependencies
vi.mock('@/services/socialService', () => ({
  getSocialFeed: vi.fn(),
  toggleWorkoutPublic: vi.fn(),
}))

describe('useSocial hooks', () => {
  const mockWeightsWorkout: socialService.SocialWorkout = {
    id: 'session-1',
    user_id: 'user-1',
    started_at: '2024-06-01T10:00:00Z',
    completed_at: '2024-06-01T11:00:00Z',
    notes: 'Great workout!',
    is_public: true,
    type: 'weights',
    workout_day: { name: 'Push Day' },
  }

  const mockCardioWorkout: socialService.SocialWorkout = {
    id: 'session-2',
    user_id: 'user-2',
    started_at: '2024-06-02T08:00:00Z',
    completed_at: '2024-06-02T08:30:00Z',
    notes: null,
    is_public: true,
    type: 'cardio',
    template: { name: 'Morning Run', type: 'cardio', category: null },
    duration_minutes: 30,
    distance_value: 5.0,
    distance_unit: 'km',
  }

  const mockMobilityWorkout: socialService.SocialWorkout = {
    id: 'session-3',
    user_id: 'user-3',
    started_at: '2024-06-03T07:00:00Z',
    completed_at: '2024-06-03T07:20:00Z',
    notes: 'Felt flexible',
    is_public: true,
    type: 'mobility',
    template: { name: 'Full Body Stretch', type: 'mobility', category: 'Stretching' },
    duration_minutes: 20,
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
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  // ─── useSocialFeed ────────────────────────────────────

  describe('useSocialFeed', () => {
    it('fetches social feed with default limit', async () => {
      vi.mocked(socialService.getSocialFeed).mockResolvedValue([mockWeightsWorkout])

      const { result } = renderHook(() => useSocialFeed(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(socialService.getSocialFeed).toHaveBeenCalledWith(20)
      expect(result.current.data).toEqual([mockWeightsWorkout])
    })

    it('fetches social feed with custom limit', async () => {
      vi.mocked(socialService.getSocialFeed).mockResolvedValue([])

      const { result } = renderHook(() => useSocialFeed(10), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(socialService.getSocialFeed).toHaveBeenCalledWith(10)
    })

    it('returns mixed workout types', async () => {
      vi.mocked(socialService.getSocialFeed).mockResolvedValue([
        mockWeightsWorkout,
        mockCardioWorkout,
        mockMobilityWorkout,
      ])

      const { result } = renderHook(() => useSocialFeed(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toHaveLength(3)
      expect(result.current.data![0].type).toBe('weights')
      expect(result.current.data![1].type).toBe('cardio')
      expect(result.current.data![2].type).toBe('mobility')
    })

    it('returns empty array when no public workouts exist', async () => {
      vi.mocked(socialService.getSocialFeed).mockResolvedValue([])

      const { result } = renderHook(() => useSocialFeed(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual([])
    })

    it('uses correct query key containing limit', async () => {
      vi.mocked(socialService.getSocialFeed).mockResolvedValue([])

      renderHook(() => useSocialFeed(50), { wrapper })

      await waitFor(() => {
        const queryState = queryClient.getQueryState(['social-feed', 50])
        expect(queryState).toBeDefined()
      })
    })

    it('uses default limit in query key', async () => {
      vi.mocked(socialService.getSocialFeed).mockResolvedValue([])

      renderHook(() => useSocialFeed(), { wrapper })

      await waitFor(() => {
        const queryState = queryClient.getQueryState(['social-feed', 20])
        expect(queryState).toBeDefined()
      })
    })

    it('handles service error as query error', async () => {
      const error = new Error('Network failure')
      vi.mocked(socialService.getSocialFeed).mockRejectedValue(error)

      const { result } = renderHook(() => useSocialFeed(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })

    it('starts in loading state before data arrives', async () => {
      let resolveFeed: (value: socialService.SocialWorkout[]) => void
      vi.mocked(socialService.getSocialFeed).mockImplementation(
        () => new Promise((resolve) => { resolveFeed = resolve })
      )

      const { result } = renderHook(() => useSocialFeed(), { wrapper })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()

      await act(async () => {
        resolveFeed!([mockWeightsWorkout])
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })

    it('returns cardio workout with distance data', async () => {
      vi.mocked(socialService.getSocialFeed).mockResolvedValue([mockCardioWorkout])

      const { result } = renderHook(() => useSocialFeed(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const cardio = result.current.data![0]
      expect(cardio.duration_minutes).toBe(30)
      expect(cardio.distance_value).toBe(5.0)
      expect(cardio.distance_unit).toBe('km')
      expect(cardio.template?.name).toBe('Morning Run')
    })

    it('returns weights workout with workout_day data', async () => {
      vi.mocked(socialService.getSocialFeed).mockResolvedValue([mockWeightsWorkout])

      const { result } = renderHook(() => useSocialFeed(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const weights = result.current.data![0]
      expect(weights.workout_day?.name).toBe('Push Day')
      expect(weights.notes).toBe('Great workout!')
    })

    it('does not refetch on rerender when data is cached', async () => {
      vi.mocked(socialService.getSocialFeed).mockResolvedValue([])

      const { result, rerender } = renderHook(() => useSocialFeed(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(socialService.getSocialFeed).toHaveBeenCalledTimes(1)

      rerender()

      expect(socialService.getSocialFeed).toHaveBeenCalledTimes(1)
    })

    it('handles non-Error rejection types', async () => {
      vi.mocked(socialService.getSocialFeed).mockRejectedValue('string error')

      const { result } = renderHook(() => useSocialFeed(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe('string error')
    })
  })

  // ─── useToggleWorkoutPublic ────────────────────────────

  describe('useToggleWorkoutPublic', () => {
    it('calls toggleWorkoutPublic for a weights session', async () => {
      vi.mocked(socialService.toggleWorkoutPublic).mockResolvedValue(undefined)

      const { result } = renderHook(() => useToggleWorkoutPublic(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          sessionId: 'session-1',
          isWeightsSession: true,
          isPublic: true,
        })
      })

      expect(socialService.toggleWorkoutPublic).toHaveBeenCalledWith(
        'session-1',
        true,
        true
      )
    })

    it('calls toggleWorkoutPublic for a template session', async () => {
      vi.mocked(socialService.toggleWorkoutPublic).mockResolvedValue(undefined)

      const { result } = renderHook(() => useToggleWorkoutPublic(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          sessionId: 'session-2',
          isWeightsSession: false,
          isPublic: false,
        })
      })

      expect(socialService.toggleWorkoutPublic).toHaveBeenCalledWith(
        'session-2',
        false,
        false
      )
    })

    it('invalidates social-feed queries on success', async () => {
      vi.mocked(socialService.toggleWorkoutPublic).mockResolvedValue(undefined)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useToggleWorkoutPublic(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          sessionId: 'session-1',
          isWeightsSession: true,
          isPublic: true,
        })
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['social-feed'] })
    })

    it('invalidates user-sessions queries on success', async () => {
      vi.mocked(socialService.toggleWorkoutPublic).mockResolvedValue(undefined)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useToggleWorkoutPublic(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          sessionId: 'session-1',
          isWeightsSession: true,
          isPublic: true,
        })
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user-sessions'] })
    })

    it('invalidates user-template-workouts queries on success', async () => {
      vi.mocked(socialService.toggleWorkoutPublic).mockResolvedValue(undefined)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useToggleWorkoutPublic(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          sessionId: 'session-1',
          isWeightsSession: true,
          isPublic: true,
        })
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user-template-workouts'] })
    })

    it('invalidates all three query keys on success', async () => {
      vi.mocked(socialService.toggleWorkoutPublic).mockResolvedValue(undefined)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useToggleWorkoutPublic(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          sessionId: 'session-1',
          isWeightsSession: true,
          isPublic: true,
        })
      })

      expect(invalidateSpy).toHaveBeenCalledTimes(3)
    })

    it('handles mutation error gracefully', async () => {
      const error = new Error('Toggle failed')
      vi.mocked(socialService.toggleWorkoutPublic).mockRejectedValue(error)

      const { result } = renderHook(() => useToggleWorkoutPublic(), { wrapper })

      act(() => {
        result.current.mutate({
          sessionId: 'session-1',
          isWeightsSession: true,
          isPublic: true,
        })
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })

    it('is in idle state before mutation is triggered', () => {
      const { result } = renderHook(() => useToggleWorkoutPublic(), { wrapper })

      expect(result.current.isIdle).toBe(true)
      expect(result.current.isPending).toBe(false)
      expect(result.current.isError).toBe(false)
      expect(result.current.isSuccess).toBe(false)
    })

    it('transitions through pending state during mutation', async () => {
      let resolveToggle: (value: void) => void
      vi.mocked(socialService.toggleWorkoutPublic).mockImplementation(
        () => new Promise((resolve) => { resolveToggle = resolve })
      )

      const { result } = renderHook(() => useToggleWorkoutPublic(), { wrapper })

      act(() => {
        result.current.mutate({
          sessionId: 'session-1',
          isWeightsSession: true,
          isPublic: true,
        })
      })

      await waitFor(() => {
        expect(result.current.isPending).toBe(true)
      })

      await act(async () => {
        resolveToggle!(undefined)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })

    it('does not invalidate queries on error', async () => {
      vi.mocked(socialService.toggleWorkoutPublic).mockRejectedValue(new Error('fail'))
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useToggleWorkoutPublic(), { wrapper })

      await act(async () => {
        try {
          await result.current.mutateAsync({
            sessionId: 'session-1',
            isWeightsSession: true,
            isPublic: true,
          })
        } catch {
          // Expected
        }
      })

      expect(invalidateSpy).not.toHaveBeenCalled()
    })

    it('can toggle from public to private', async () => {
      vi.mocked(socialService.toggleWorkoutPublic).mockResolvedValue(undefined)

      const { result } = renderHook(() => useToggleWorkoutPublic(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          sessionId: 'session-1',
          isWeightsSession: true,
          isPublic: false,
        })
      })

      expect(socialService.toggleWorkoutPublic).toHaveBeenCalledWith(
        'session-1',
        true,
        false
      )
    })

    it('can perform sequential mutations', async () => {
      vi.mocked(socialService.toggleWorkoutPublic).mockResolvedValue(undefined)

      const { result } = renderHook(() => useToggleWorkoutPublic(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          sessionId: 'session-1',
          isWeightsSession: true,
          isPublic: true,
        })
      })

      await act(async () => {
        await result.current.mutateAsync({
          sessionId: 'session-2',
          isWeightsSession: false,
          isPublic: false,
        })
      })

      expect(socialService.toggleWorkoutPublic).toHaveBeenCalledTimes(2)
      expect(socialService.toggleWorkoutPublic).toHaveBeenNthCalledWith(1, 'session-1', true, true)
      expect(socialService.toggleWorkoutPublic).toHaveBeenNthCalledWith(2, 'session-2', false, false)
    })
  })
})
