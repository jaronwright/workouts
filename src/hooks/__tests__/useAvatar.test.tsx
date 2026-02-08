import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAvatarUrl, useUploadAvatar, useRemoveAvatar } from '../useAvatar'
import { useAuthStore } from '@/stores/authStore'
import * as profileService from '@/services/profileService'
import * as avatarService from '@/services/avatarService'
import type { ReactNode } from 'react'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/services/profileService', () => ({
  getProfile: vi.fn(),
  upsertProfile: vi.fn(),
}))

vi.mock('@/services/avatarService', () => ({
  getAvatarPublicUrl: vi.fn(),
  uploadAvatar: vi.fn(),
  removeAllUserAvatars: vi.fn(),
}))

describe('useAvatar hooks', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }
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

    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = { user: mockUser }
      if (typeof selector === 'function') {
        return selector(state as never)
      }
      return state
    })
  })

  describe('useAvatarUrl', () => {
    it('returns null when profile has no avatar_url', async () => {
      vi.mocked(profileService.getProfile).mockResolvedValue({
        id: 'user-123',
        display_name: 'Test',
        gender: null,
        avatar_url: null,
        selected_plan_id: null,
        current_cycle_day: 1,
        last_workout_date: null,
        cycle_start_date: null,
        timezone: null,
        created_at: '',
        updated_at: '',
      })

      const { result } = renderHook(() => useAvatarUrl(), { wrapper })

      await waitFor(() => {
        expect(result.current).toBeNull()
      })
    })

    it('returns public URL when profile has avatar_url', async () => {
      vi.mocked(profileService.getProfile).mockResolvedValue({
        id: 'user-123',
        display_name: 'Test',
        gender: null,
        avatar_url: 'user-123/avatar-123.webp',
        selected_plan_id: null,
        current_cycle_day: 1,
        last_workout_date: null,
        cycle_start_date: null,
        timezone: null,
        created_at: '',
        updated_at: '',
      })
      vi.mocked(avatarService.getAvatarPublicUrl).mockReturnValue(
        'https://example.com/avatars/user-123/avatar-123.webp'
      )

      const { result } = renderHook(() => useAvatarUrl(), { wrapper })

      await waitFor(() => {
        expect(result.current).toBe('https://example.com/avatars/user-123/avatar-123.webp')
      })
    })
  })

  describe('useUploadAvatar', () => {
    it('removes old files, uploads new file, and updates profile', async () => {
      vi.mocked(avatarService.removeAllUserAvatars).mockResolvedValue()
      vi.mocked(avatarService.uploadAvatar).mockResolvedValue('user-123/avatar-999.webp')
      vi.mocked(profileService.upsertProfile).mockResolvedValue({
        id: 'user-123',
        display_name: 'Test',
        gender: null,
        avatar_url: 'user-123/avatar-999.webp',
        selected_plan_id: null,
        current_cycle_day: 1,
        last_workout_date: null,
        cycle_start_date: null,
        timezone: null,
        created_at: '',
        updated_at: '',
      })

      const { result } = renderHook(() => useUploadAvatar(), { wrapper })

      const file = new File(['data'], 'photo.png', { type: 'image/png' })
      await result.current.mutateAsync(file)

      expect(avatarService.removeAllUserAvatars).toHaveBeenCalledWith('user-123')
      expect(avatarService.uploadAvatar).toHaveBeenCalledWith('user-123', file)
      expect(profileService.upsertProfile).toHaveBeenCalledWith('user-123', {
        avatar_url: 'user-123/avatar-999.webp',
      })
    })

    it('continues upload even if old file cleanup fails', async () => {
      vi.mocked(avatarService.removeAllUserAvatars).mockRejectedValue(new Error('No files'))
      vi.mocked(avatarService.uploadAvatar).mockResolvedValue('user-123/avatar-999.webp')
      vi.mocked(profileService.upsertProfile).mockResolvedValue({
        id: 'user-123',
        display_name: 'Test',
        gender: null,
        avatar_url: 'user-123/avatar-999.webp',
        selected_plan_id: null,
        current_cycle_day: 1,
        last_workout_date: null,
        cycle_start_date: null,
        timezone: null,
        created_at: '',
        updated_at: '',
      })

      const { result } = renderHook(() => useUploadAvatar(), { wrapper })

      const file = new File(['data'], 'photo.png', { type: 'image/png' })
      await result.current.mutateAsync(file)

      // Should still upload despite cleanup failure
      expect(avatarService.uploadAvatar).toHaveBeenCalled()
    })
  })

  describe('useRemoveAvatar', () => {
    it('removes files and sets avatar_url to null', async () => {
      vi.mocked(avatarService.removeAllUserAvatars).mockResolvedValue()
      vi.mocked(profileService.upsertProfile).mockResolvedValue({
        id: 'user-123',
        display_name: 'Test',
        gender: null,
        avatar_url: null,
        selected_plan_id: null,
        current_cycle_day: 1,
        last_workout_date: null,
        cycle_start_date: null,
        timezone: null,
        created_at: '',
        updated_at: '',
      })

      const { result } = renderHook(() => useRemoveAvatar(), { wrapper })

      await result.current.mutateAsync()

      expect(avatarService.removeAllUserAvatars).toHaveBeenCalledWith('user-123')
      expect(profileService.upsertProfile).toHaveBeenCalledWith('user-123', {
        avatar_url: null,
      })
    })
  })
})
