import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProfile, useUpdateProfile, useUpsertProfile } from '../useProfile'
import { useAuthStore } from '@/stores/authStore'
import * as profileService from '@/services/profileService'
import { ReactNode } from 'react'

// Mock dependencies
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/services/profileService', () => ({
  getProfile: vi.fn(),
  upsertProfile: vi.fn(),
}))

describe('useProfile hooks', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }
  const mockProfile: profileService.UserProfile = {
    id: 'user-123',
    display_name: 'Test User',
    gender: 'male',
    avatar_url: null,
    selected_plan_id: null,
    current_cycle_day: 1,
    last_workout_date: '2024-01-15',
    cycle_start_date: null,
    timezone: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
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

  // ─── useProfile ──────────────────────────────────────────

  describe('useProfile', () => {
    it('fetches profile when user is authenticated', async () => {
      vi.mocked(profileService.getProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useProfile(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(profileService.getProfile).toHaveBeenCalledWith('user-123')
      expect(result.current.data).toEqual(mockProfile)
    })

    it('is disabled when no user is present', () => {
      mockUnauthenticatedUser()

      const { result } = renderHook(() => useProfile(), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(profileService.getProfile).not.toHaveBeenCalled()
    })

    it('returns null when profile does not exist', async () => {
      vi.mocked(profileService.getProfile).mockResolvedValue(null)

      const { result } = renderHook(() => useProfile(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeNull()
    })

    it('uses correct query key containing user id', async () => {
      vi.mocked(profileService.getProfile).mockResolvedValue(mockProfile)

      renderHook(() => useProfile(), { wrapper })

      await waitFor(() => {
        const queryState = queryClient.getQueryState(['profile', 'user-123'])
        expect(queryState).toBeDefined()
      })
    })

    it('handles service error as query error', async () => {
      const error = new Error('Network failure')
      vi.mocked(profileService.getProfile).mockRejectedValue(error)

      const { result } = renderHook(() => useProfile(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })

    it('returns full profile fields when present', async () => {
      const fullProfile: profileService.UserProfile = {
        ...mockProfile,
        display_name: 'Full User',
        gender: 'female',
        avatar_url: 'https://example.com/avatar.png',
        selected_plan_id: '00000000-0000-0000-0000-000000000001',
        current_cycle_day: 3,
        cycle_start_date: '2024-01-01',
        timezone: 'America/New_York',
      }
      vi.mocked(profileService.getProfile).mockResolvedValue(fullProfile)

      const { result } = renderHook(() => useProfile(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.display_name).toBe('Full User')
      expect(result.current.data?.gender).toBe('female')
      expect(result.current.data?.avatar_url).toBe('https://example.com/avatar.png')
      expect(result.current.data?.selected_plan_id).toBe('00000000-0000-0000-0000-000000000001')
      expect(result.current.data?.timezone).toBe('America/New_York')
    })
  })

  // ─── useUpdateProfile ────────────────────────────────────

  describe('useUpdateProfile', () => {
    it('calls upsertProfile with user id and data', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ display_name: 'New Name' })
      })

      expect(profileService.upsertProfile).toHaveBeenCalledWith('user-123', {
        display_name: 'New Name',
      })
    })

    it('invalidates profile queries on success', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue(mockProfile)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ display_name: 'New Name' })
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile'] })
    })

    it('handles mutation error gracefully', async () => {
      const error = new Error('Update failed')
      vi.mocked(profileService.upsertProfile).mockRejectedValue(error)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      await act(async () => {
        try {
          await result.current.mutateAsync({ display_name: 'Fail' })
        } catch {
          // Expected
        }
      })

      expect(consoleSpy).toHaveBeenCalledWith('Failed to update profile:', error)
      consoleSpy.mockRestore()
    })

    it('can update multiple fields at once', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      const updateData: profileService.UpdateProfileData = {
        display_name: 'Updated',
        avatar_url: 'https://example.com/new.png',
        selected_plan_id: '00000000-0000-0000-0000-000000000002',
        timezone: 'Europe/London',
      }

      await act(async () => {
        await result.current.mutateAsync(updateData)
      })

      expect(profileService.upsertProfile).toHaveBeenCalledWith('user-123', updateData)
    })

    it('does not invalidate queries on error', async () => {
      vi.mocked(profileService.upsertProfile).mockRejectedValue(new Error('fail'))
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      await act(async () => {
        try {
          await result.current.mutateAsync({ display_name: 'Fail' })
        } catch {
          // Expected
        }
      })

      // invalidateQueries should NOT have been called since the mutation failed
      expect(invalidateSpy).not.toHaveBeenCalled()
    })
  })

  // ─── useUpsertProfile ────────────────────────────────────

  describe('useUpsertProfile', () => {
    it('calls upsertProfile with user id and data', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useUpsertProfile(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ gender: 'female' })
      })

      expect(profileService.upsertProfile).toHaveBeenCalledWith('user-123', {
        gender: 'female',
      })
    })

    it('invalidates profile queries on success', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue(mockProfile)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useUpsertProfile(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ gender: 'female' })
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile'] })
    })

    it('can set cycle_start_date and current_cycle_day', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue({
        ...mockProfile,
        cycle_start_date: '2024-06-01',
        current_cycle_day: 5,
      })

      const { result } = renderHook(() => useUpsertProfile(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          cycle_start_date: '2024-06-01',
          current_cycle_day: 5,
        })
      })

      expect(profileService.upsertProfile).toHaveBeenCalledWith('user-123', {
        cycle_start_date: '2024-06-01',
        current_cycle_day: 5,
      })
    })

    it('can clear nullable fields by passing null', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue({
        ...mockProfile,
        display_name: null,
        avatar_url: null,
      })

      const { result } = renderHook(() => useUpsertProfile(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          display_name: null,
          avatar_url: null,
        })
      })

      expect(profileService.upsertProfile).toHaveBeenCalledWith('user-123', {
        display_name: null,
        avatar_url: null,
      })
    })
  })
})
