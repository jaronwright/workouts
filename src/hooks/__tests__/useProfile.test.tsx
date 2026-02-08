import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
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

    it('does not fetch when user is not authenticated', () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = { user: null }
        if (typeof selector === 'function') {
          return selector(state as any)
        }
        return state
      })

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
  })

  describe('useUpdateProfile', () => {
    it('calls upsertProfile with user id and data', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      await result.current.mutateAsync({ display_name: 'New Name' })

      expect(profileService.upsertProfile).toHaveBeenCalledWith('user-123', {
        display_name: 'New Name',
      })
    })

    it('invalidates profile queries on success', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue(mockProfile)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      await result.current.mutateAsync({ display_name: 'New Name' })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile'] })
    })
  })

  describe('useUpsertProfile', () => {
    it('calls upsertProfile with user id and data', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useUpsertProfile(), { wrapper })

      await result.current.mutateAsync({ gender: 'female' })

      expect(profileService.upsertProfile).toHaveBeenCalledWith('user-123', {
        gender: 'female',
      })
    })

    it('invalidates profile queries on success', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue(mockProfile)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useUpsertProfile(), { wrapper })

      await result.current.mutateAsync({ gender: 'female' })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile'] })
    })
  })

})
