import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useInitializeSchedule, useClearSchedule } from '../useSchedule'
import { useAuthStore } from '@/stores/authStore'
import * as scheduleService from '@/services/scheduleService'
import type { ReactNode } from 'react'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/services/scheduleService', () => ({
  getUserSchedule: vi.fn(),
  getScheduleDayWorkouts: vi.fn(),
  saveScheduleDayWorkouts: vi.fn(),
  deleteScheduleDay: vi.fn(),
  initializeDefaultSchedule: vi.fn(),
  clearUserSchedule: vi.fn(),
  getWorkoutTemplates: vi.fn(),
  getWorkoutTemplatesByType: vi.fn(),
}))

describe('useSchedule hooks - workout splits', () => {
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

  describe('useInitializeSchedule', () => {
    it('calls initializeDefaultSchedule with user id', async () => {
      vi.mocked(scheduleService.initializeDefaultSchedule).mockResolvedValue([])

      const { result } = renderHook(() => useInitializeSchedule(), { wrapper })

      await result.current.mutateAsync()

      expect(scheduleService.initializeDefaultSchedule).toHaveBeenCalledWith('user-123', undefined)
    })

    it('passes planId when provided', async () => {
      vi.mocked(scheduleService.initializeDefaultSchedule).mockResolvedValue([])

      const { result } = renderHook(() => useInitializeSchedule(), { wrapper })

      await result.current.mutateAsync('plan-456')

      expect(scheduleService.initializeDefaultSchedule).toHaveBeenCalledWith('user-123', 'plan-456')
    })

    it('invalidates schedule queries on success', async () => {
      vi.mocked(scheduleService.initializeDefaultSchedule).mockResolvedValue([])
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useInitializeSchedule(), { wrapper })

      await result.current.mutateAsync()

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user-schedule'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['schedule-day'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todays-workout'] })
    })
  })

  describe('useClearSchedule', () => {
    it('calls clearUserSchedule with user id', async () => {
      vi.mocked(scheduleService.clearUserSchedule).mockResolvedValue()

      const { result } = renderHook(() => useClearSchedule(), { wrapper })

      await result.current.mutateAsync()

      expect(scheduleService.clearUserSchedule).toHaveBeenCalledWith('user-123')
    })

    it('invalidates all schedule-related queries on success', async () => {
      vi.mocked(scheduleService.clearUserSchedule).mockResolvedValue()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useClearSchedule(), { wrapper })

      await result.current.mutateAsync()

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user-schedule'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['schedule-day'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['schedule-day-workouts'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todays-workout'] })
    })

    it('does not invalidate queries on failure', async () => {
      vi.mocked(scheduleService.clearUserSchedule).mockRejectedValue(new Error('Failed'))
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useClearSchedule(), { wrapper })

      await expect(result.current.mutateAsync()).rejects.toThrow('Failed')

      expect(invalidateSpy).not.toHaveBeenCalled()
    })
  })
})
