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
    theme: null,
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

    // ─── New edge cases ───

    it('starts in loading state before data arrives', async () => {
      let resolveGetProfile: (value: profileService.UserProfile) => void
      vi.mocked(profileService.getProfile).mockImplementation(
        () => new Promise((resolve) => { resolveGetProfile = resolve })
      )

      const { result } = renderHook(() => useProfile(), { wrapper })

      // Initially should be loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()

      // Resolve the promise
      await act(async () => {
        resolveGetProfile!(mockProfile)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
      expect(result.current.data).toEqual(mockProfile)
    })

    it('has isPending true when query is disabled (no user)', () => {
      mockUnauthenticatedUser()

      const { result } = renderHook(() => useProfile(), { wrapper })

      // When enabled=false, the query is in "pending" status but idle fetchStatus
      expect(result.current.isPending).toBe(true)
      expect(result.current.fetchStatus).toBe('idle')
    })

    it('query key includes undefined when user has no id', () => {
      mockUnauthenticatedUser()

      renderHook(() => useProfile(), { wrapper })

      // The query key should be ['profile', undefined] and it exists but was never fetched
      const queryState = queryClient.getQueryState(['profile', undefined])
      expect(queryState).toBeDefined()
      expect(queryState!.fetchStatus).toBe('idle')
      expect(queryState!.data).toBeUndefined()
    })

    it('returns profile with theme field', async () => {
      const themedProfile: profileService.UserProfile = {
        ...mockProfile,
        theme: 'dark',
      }
      vi.mocked(profileService.getProfile).mockResolvedValue(themedProfile)

      const { result } = renderHook(() => useProfile(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.theme).toBe('dark')
    })

    it('handles profile with all nullable fields as null', async () => {
      const minimalProfile: profileService.UserProfile = {
        id: 'user-123',
        display_name: null,
        gender: null,
        avatar_url: null,
        selected_plan_id: null,
        current_cycle_day: 1,
        last_workout_date: null,
        cycle_start_date: null,
        timezone: null,
        theme: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      vi.mocked(profileService.getProfile).mockResolvedValue(minimalProfile)

      const { result } = renderHook(() => useProfile(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.display_name).toBeNull()
      expect(result.current.data?.gender).toBeNull()
      expect(result.current.data?.avatar_url).toBeNull()
      expect(result.current.data?.selected_plan_id).toBeNull()
      expect(result.current.data?.last_workout_date).toBeNull()
      expect(result.current.data?.cycle_start_date).toBeNull()
      expect(result.current.data?.timezone).toBeNull()
      expect(result.current.data?.theme).toBeNull()
    })

    it('does not refetch when user id has not changed', async () => {
      vi.mocked(profileService.getProfile).mockResolvedValue(mockProfile)

      const { result, rerender } = renderHook(() => useProfile(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(profileService.getProfile).toHaveBeenCalledTimes(1)

      // Re-render with same user - should not refetch since data is cached
      rerender()

      // Still only called once since the query key hasn't changed
      expect(profileService.getProfile).toHaveBeenCalledTimes(1)
    })

    it('handles non-Error rejection types', async () => {
      vi.mocked(profileService.getProfile).mockRejectedValue('string error')

      const { result } = renderHook(() => useProfile(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe('string error')
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

    // ─── New edge cases ───

    it('is in idle state before mutation is triggered', () => {
      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      expect(result.current.isIdle).toBe(true)
      expect(result.current.isPending).toBe(false)
      expect(result.current.isError).toBe(false)
      expect(result.current.isSuccess).toBe(false)
    })

    it('transitions through pending state during mutation', async () => {
      let resolveUpsert: (value: profileService.UserProfile) => void
      vi.mocked(profileService.upsertProfile).mockImplementation(
        () => new Promise((resolve) => { resolveUpsert = resolve })
      )

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      // Start the mutation (don't await)
      act(() => {
        result.current.mutate({ display_name: 'Pending' })
      })

      // Should be pending
      await waitFor(() => {
        expect(result.current.isPending).toBe(true)
      })

      // Resolve
      await act(async () => {
        resolveUpsert!(mockProfile)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })

    it('can update theme field', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue({
        ...mockProfile,
        theme: 'light',
      })

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ theme: 'light' })
      })

      expect(profileService.upsertProfile).toHaveBeenCalledWith('user-123', {
        theme: 'light',
      })
    })

    it('can perform sequential mutations', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ display_name: 'First' })
      })

      await act(async () => {
        await result.current.mutateAsync({ display_name: 'Second' })
      })

      expect(profileService.upsertProfile).toHaveBeenCalledTimes(2)
      expect(profileService.upsertProfile).toHaveBeenNthCalledWith(1, 'user-123', {
        display_name: 'First',
      })
      expect(profileService.upsertProfile).toHaveBeenNthCalledWith(2, 'user-123', {
        display_name: 'Second',
      })
    })

    it('logs specific error object to console on failure', async () => {
      const specificError = new Error('Supabase timeout')
      vi.mocked(profileService.upsertProfile).mockRejectedValue(specificError)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      await act(async () => {
        try {
          await result.current.mutateAsync({ display_name: 'Timeout' })
        } catch {
          // Expected
        }
      })

      // Verify the exact error object is logged
      expect(consoleSpy).toHaveBeenCalledTimes(1)
      expect(consoleSpy.mock.calls[0][0]).toBe('Failed to update profile:')
      expect(consoleSpy.mock.calls[0][1]).toBe(specificError)
      consoleSpy.mockRestore()
    })

    it('sets isError after failed mutation via mutate', async () => {
      vi.mocked(profileService.upsertProfile).mockRejectedValue(new Error('fail'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      act(() => {
        result.current.mutate({ display_name: 'Err' })
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('fail')
    })

    it('can update selected_plan_id independently', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue({
        ...mockProfile,
        selected_plan_id: '00000000-0000-0000-0000-000000000001',
      })

      const { result } = renderHook(() => useUpdateProfile(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          selected_plan_id: '00000000-0000-0000-0000-000000000001',
        })
      })

      expect(profileService.upsertProfile).toHaveBeenCalledWith('user-123', {
        selected_plan_id: '00000000-0000-0000-0000-000000000001',
      })
    })
  })

  // ─── useUpsertProfile ────────────────────────────────────

  describe('useUpsertProfile', () => {
    it('calls upsertProfile with user id and data', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useUpsertProfile(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ display_name: 'Upserted' })
      })

      expect(profileService.upsertProfile).toHaveBeenCalledWith('user-123', {
        display_name: 'Upserted',
      })
    })

    it('invalidates profile queries on success', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue(mockProfile)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useUpsertProfile(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ display_name: 'Upserted' })
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

    // ─── New edge cases ───

    it('handles mutation error without onError handler (no console.error)', async () => {
      const error = new Error('upsert failed')
      vi.mocked(profileService.upsertProfile).mockRejectedValue(error)

      const { result } = renderHook(() => useUpsertProfile(), { wrapper })

      // Use mutate (not mutateAsync) so the error is captured in hook state
      act(() => {
        result.current.mutate({ display_name: 'Fail' })
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })

    it('does not invalidate queries on error', async () => {
      vi.mocked(profileService.upsertProfile).mockRejectedValue(new Error('fail'))
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useUpsertProfile(), { wrapper })

      await act(async () => {
        try {
          await result.current.mutateAsync({ display_name: 'Fail' })
        } catch {
          // Expected
        }
      })

      expect(invalidateSpy).not.toHaveBeenCalled()
    })

    it('can update theme via upsert', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue({
        ...mockProfile,
        theme: 'dark',
      })

      const { result } = renderHook(() => useUpsertProfile(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ theme: 'dark' })
      })

      expect(profileService.upsertProfile).toHaveBeenCalledWith('user-123', {
        theme: 'dark',
      })
    })

    it('can upsert all UpdateProfileData fields at once', async () => {
      const allFields: profileService.UpdateProfileData = {
        display_name: 'All Fields',
        avatar_url: 'https://example.com/all.png',
        selected_plan_id: '00000000-0000-0000-0000-000000000002',
        current_cycle_day: 7,
        last_workout_date: '2024-12-31',
        cycle_start_date: '2024-12-01',
        timezone: 'Asia/Tokyo',
        theme: 'dark',
      }
      vi.mocked(profileService.upsertProfile).mockResolvedValue({
        ...mockProfile,
        ...allFields,
      })

      const { result } = renderHook(() => useUpsertProfile(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(allFields)
      })

      expect(profileService.upsertProfile).toHaveBeenCalledWith('user-123', allFields)
    })

    it('is in idle state before first mutation', () => {
      const { result } = renderHook(() => useUpsertProfile(), { wrapper })

      expect(result.current.isIdle).toBe(true)
      expect(result.current.isPending).toBe(false)
    })

    it('returns data from successful mutation', async () => {
      const updatedProfile: profileService.UserProfile = {
        ...mockProfile,
        display_name: 'Returned',
      }
      vi.mocked(profileService.upsertProfile).mockResolvedValue(updatedProfile)

      const { result } = renderHook(() => useUpsertProfile(), { wrapper })

      let returnedData: profileService.UserProfile | undefined
      await act(async () => {
        returnedData = await result.current.mutateAsync({ display_name: 'Returned' })
      })

      expect(returnedData).toEqual(updatedProfile)
    })

    it('can set selected_plan_id to null to deselect plan', async () => {
      vi.mocked(profileService.upsertProfile).mockResolvedValue({
        ...mockProfile,
        selected_plan_id: null,
      })

      const { result } = renderHook(() => useUpsertProfile(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ selected_plan_id: null })
      })

      expect(profileService.upsertProfile).toHaveBeenCalledWith('user-123', {
        selected_plan_id: null,
      })
    })
  })
})
