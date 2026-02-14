/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

// Mock the schedule service
vi.mock('@/services/scheduleService', () => ({
  getUserSchedule: vi.fn().mockResolvedValue([]),
  getScheduleDayWorkouts: vi.fn().mockResolvedValue([]),
  saveScheduleDayWorkouts: vi.fn().mockResolvedValue([]),
  deleteScheduleDay: vi.fn().mockResolvedValue(undefined),
  initializeDefaultSchedule: vi.fn().mockResolvedValue([]),
  clearUserSchedule: vi.fn().mockResolvedValue(undefined),
  getWorkoutTemplates: vi.fn().mockResolvedValue([
    { id: 'template-1', name: 'Swimming', type: 'cardio', category: 'swim', description: null, icon: null, duration_minutes: 30, workout_day_id: null, created_at: '2024-01-01T00:00:00Z' },
  ]),
  getWorkoutTemplatesByType: vi.fn().mockResolvedValue([]),
}))

import { useAuthStore } from '@/stores/authStore'
import * as scheduleService from '@/services/scheduleService'
import {
  useUserSchedule,
  useWorkoutTemplates,
  useWorkoutTemplatesByType,
  useScheduleDayWorkouts,
  useSaveScheduleDayWorkouts,
  useDeleteScheduleDay,
  useInitializeSchedule,
  useClearSchedule,
} from '../useSchedule'

// ============================================
// Test helpers
// ============================================

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

function mockAuthenticatedUser(userId = 'user-123') {
  vi.mocked(useAuthStore).mockImplementation((selector: any) =>
    selector({ user: { id: userId, email: 'test@example.com' } })
  )
}

function mockNoUser() {
  vi.mocked(useAuthStore).mockImplementation((selector: any) =>
    selector({ user: null })
  )
}

// ============================================
// useUserSchedule
// ============================================

describe('useUserSchedule', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createQueryClient()
  })

  it('returns empty data when no user is authenticated', () => {
    mockNoUser()

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useUserSchedule(), { wrapper })

    // Disabled queries should not be loading and should not fetch
    expect(result.current.isLoading).toBe(false)
    expect(result.current.fetchStatus).toBe('idle')
    expect(scheduleService.getUserSchedule).not.toHaveBeenCalled()
  })

  it('is enabled only when user is present', () => {
    mockAuthenticatedUser()

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useUserSchedule(), { wrapper })

    // When user is present, the query should be fetching
    expect(result.current.fetchStatus).toBe('fetching')
  })

  it('fetches user schedule when user is authenticated', async () => {
    mockAuthenticatedUser()
    const scheduleData = [
      {
        id: 'schedule-1',
        user_id: 'user-123',
        day_number: 1,
        template_id: null,
        workout_day_id: 'day-1',
        is_rest_day: false,
        sort_order: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        template: null,
        workout_day: { id: 'day-1', name: 'Push', day_number: 1 },
      },
    ]
    vi.mocked(scheduleService.getUserSchedule).mockResolvedValue(scheduleData as scheduleService.ScheduleDay[])

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useUserSchedule(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(scheduleService.getUserSchedule).toHaveBeenCalledWith('user-123')
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].day_number).toBe(1)
  })

  it('returns empty array when user has no schedule', async () => {
    mockAuthenticatedUser()
    vi.mocked(scheduleService.getUserSchedule).mockResolvedValue([])

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useUserSchedule(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })

  it('uses the correct query key with user ID', async () => {
    mockAuthenticatedUser('specific-user-456')
    vi.mocked(scheduleService.getUserSchedule).mockResolvedValue([])

    const wrapper = createWrapper(queryClient)
    renderHook(() => useUserSchedule(), { wrapper })

    await waitFor(() => {
      expect(scheduleService.getUserSchedule).toHaveBeenCalledWith('specific-user-456')
    })
  })
})

// ============================================
// useWorkoutTemplates
// ============================================

describe('useWorkoutTemplates', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createQueryClient()
  })

  it('fetches workout templates without requiring auth', async () => {
    mockNoUser() // Templates don't require auth

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useWorkoutTemplates(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].name).toBe('Swimming')
  })
})

// ============================================
// useSaveScheduleDayWorkouts
// ============================================

describe('useSaveScheduleDayWorkouts', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createQueryClient()
    mockAuthenticatedUser()
  })

  it('provides a mutation function', () => {
    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useSaveScheduleDayWorkouts(), { wrapper })

    expect(result.current.mutate).toBeDefined()
    expect(typeof result.current.mutateAsync).toBe('function')
  })

  it('calls saveScheduleDayWorkouts with correct arguments', async () => {
    const workouts: scheduleService.ScheduleWorkoutItem[] = [
      { type: 'weights', id: 'day-1' },
      { type: 'cardio', id: 'template-1' },
    ]
    vi.mocked(scheduleService.saveScheduleDayWorkouts).mockResolvedValue([])

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useSaveScheduleDayWorkouts(), { wrapper })

    await result.current.mutateAsync({ dayNumber: 2, workouts })

    expect(scheduleService.saveScheduleDayWorkouts).toHaveBeenCalledWith('user-123', 2, workouts)
  })

  it('invalidates correct query keys on success', async () => {
    vi.mocked(scheduleService.saveScheduleDayWorkouts).mockResolvedValue([])
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useSaveScheduleDayWorkouts(), { wrapper })

    await result.current.mutateAsync({ dayNumber: 1, workouts: [{ type: 'rest' }] })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user-schedule'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['schedule-day'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['schedule-day-workouts'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todays-workout'] })
  })

  it('does not invalidate queries on mutation failure', async () => {
    vi.mocked(scheduleService.saveScheduleDayWorkouts).mockRejectedValue(new Error('DB error'))
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useSaveScheduleDayWorkouts(), { wrapper })

    try {
      await result.current.mutateAsync({ dayNumber: 1, workouts: [] })
    } catch {
      // Expected to throw
    }

    expect(invalidateSpy).not.toHaveBeenCalled()
  })
})

// ============================================
// useClearSchedule
// ============================================

describe('useClearSchedule', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createQueryClient()
    mockAuthenticatedUser()
  })

  it('provides a mutation function', () => {
    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useClearSchedule(), { wrapper })

    expect(result.current.mutate).toBeDefined()
    expect(typeof result.current.mutateAsync).toBe('function')
  })

  it('calls clearUserSchedule with the user ID', async () => {
    vi.mocked(scheduleService.clearUserSchedule).mockResolvedValue(undefined)

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useClearSchedule(), { wrapper })

    await result.current.mutateAsync()

    expect(scheduleService.clearUserSchedule).toHaveBeenCalledWith('user-123')
  })

  it('invalidates correct query keys on success', async () => {
    vi.mocked(scheduleService.clearUserSchedule).mockResolvedValue(undefined)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useClearSchedule(), { wrapper })

    await result.current.mutateAsync()

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user-schedule'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['schedule-day'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['schedule-day-workouts'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todays-workout'] })
  })

  it('does not invalidate queries on mutation failure', async () => {
    vi.mocked(scheduleService.clearUserSchedule).mockRejectedValue(new Error('Network error'))
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useClearSchedule(), { wrapper })

    try {
      await result.current.mutateAsync()
    } catch {
      // Expected to throw
    }

    expect(invalidateSpy).not.toHaveBeenCalled()
  })
})

// ============================================
// useDeleteScheduleDay
// ============================================

describe('useDeleteScheduleDay', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createQueryClient()
    mockAuthenticatedUser()
  })

  it('provides mutation function', () => {
    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useDeleteScheduleDay(), { wrapper })

    expect(result.current.mutate).toBeDefined()
    expect(typeof result.current.mutate).toBe('function')
  })

  it('calls deleteScheduleDay with user ID and day number', async () => {
    vi.mocked(scheduleService.deleteScheduleDay).mockResolvedValue(undefined)

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useDeleteScheduleDay(), { wrapper })

    await result.current.mutateAsync(4)

    expect(scheduleService.deleteScheduleDay).toHaveBeenCalledWith('user-123', 4)
  })

  it('invalidates schedule queries on success', async () => {
    vi.mocked(scheduleService.deleteScheduleDay).mockResolvedValue(undefined)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useDeleteScheduleDay(), { wrapper })

    await result.current.mutateAsync(3)

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user-schedule'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['schedule-day'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['schedule-day-workouts'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todays-workout'] })
  })
})

// ============================================
// useInitializeSchedule
// ============================================

describe('useInitializeSchedule', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createQueryClient()
    mockAuthenticatedUser()
  })

  it('provides mutation function', () => {
    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useInitializeSchedule(), { wrapper })

    expect(result.current.mutate).toBeDefined()
    expect(typeof result.current.mutate).toBe('function')
  })

  it('calls initializeDefaultSchedule with user ID and optional plan ID', async () => {
    vi.mocked(scheduleService.initializeDefaultSchedule).mockResolvedValue([])

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useInitializeSchedule(), { wrapper })

    await result.current.mutateAsync('plan-ppl')

    expect(scheduleService.initializeDefaultSchedule).toHaveBeenCalledWith('user-123', 'plan-ppl')
  })

  it('invalidates schedule queries on success (but not schedule-day-workouts)', async () => {
    vi.mocked(scheduleService.initializeDefaultSchedule).mockResolvedValue([])
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useInitializeSchedule(), { wrapper })

    await result.current.mutateAsync()

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user-schedule'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['schedule-day'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todays-workout'] })
    // Note: useInitializeSchedule does NOT invalidate schedule-day-workouts
    // (unlike useSaveScheduleDayWorkouts which does)
  })
})

// ============================================
// useScheduleDayWorkouts
// ============================================

describe('useScheduleDayWorkouts', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createQueryClient()
  })

  it('does not fetch when no user is authenticated', () => {
    mockNoUser()

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useScheduleDayWorkouts(1), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(scheduleService.getScheduleDayWorkouts).not.toHaveBeenCalled()
  })

  it('fetches workouts for a specific day when user is present', async () => {
    mockAuthenticatedUser()
    vi.mocked(scheduleService.getScheduleDayWorkouts).mockResolvedValue([])

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useScheduleDayWorkouts(2), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(scheduleService.getScheduleDayWorkouts).toHaveBeenCalledWith('user-123', 2)
  })
})

// ============================================
// useWorkoutTemplatesByType
// ============================================

describe('useWorkoutTemplatesByType', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createQueryClient()
  })

  it('fetches templates filtered by type', async () => {
    const cardioTemplates = [
      { id: 'template-cycling', name: 'Cycling', type: 'cardio' as const, category: 'cycle', description: null, icon: null, duration_minutes: 45, workout_day_id: null, created_at: '2024-01-01T00:00:00Z' },
    ]
    vi.mocked(scheduleService.getWorkoutTemplatesByType).mockResolvedValue(cardioTemplates)

    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useWorkoutTemplatesByType('cardio'), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(scheduleService.getWorkoutTemplatesByType).toHaveBeenCalledWith('cardio')
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].name).toBe('Cycling')
  })
})
