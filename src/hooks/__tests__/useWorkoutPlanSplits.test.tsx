import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSelectedPlanDays } from '../useWorkoutPlan'
import { useAuthStore } from '@/stores/authStore'
import * as profileService from '@/services/profileService'
import * as workoutService from '@/services/workoutService'
import type { ReactNode } from 'react'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/services/profileService', () => ({
  getProfile: vi.fn(),
  upsertProfile: vi.fn(),
}))

vi.mock('@/services/workoutService', () => ({
  getWorkoutPlans: vi.fn(),
  getWorkoutDays: vi.fn(),
  getWorkoutDayWithSections: vi.fn(),
  getAllWorkoutDays: vi.fn(),
}))

describe('useSelectedPlanDays', () => {
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

  it('fetches plan-specific days when profile has selected_plan_id', async () => {
    const mockProfile: profileService.UserProfile = {
      id: 'user-123',
      display_name: 'Test',
      gender: null,
      avatar_url: null,
      selected_plan_id: 'plan-ppl',
      current_cycle_day: 1,
      last_workout_date: null,
      cycle_start_date: null,
      timezone: null,
      created_at: '',
      updated_at: '',
    }

    const mockDays = [
      { id: 'day-1', name: 'Push', day_number: 1, plan_id: 'plan-ppl' },
      { id: 'day-2', name: 'Pull', day_number: 2, plan_id: 'plan-ppl' },
      { id: 'day-3', name: 'Legs', day_number: 3, plan_id: 'plan-ppl' },
    ]

    vi.mocked(profileService.getProfile).mockResolvedValue(mockProfile)
    vi.mocked(workoutService.getWorkoutDays).mockResolvedValue(mockDays as never)

    const { result } = renderHook(() => useSelectedPlanDays(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(workoutService.getWorkoutDays).toHaveBeenCalledWith('plan-ppl')
    expect(result.current.data).toEqual(mockDays)
  })

  it('fetches all workout days when profile has no selected_plan_id', async () => {
    const mockProfile: profileService.UserProfile = {
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
    }

    const mockAllDays = [
      { id: 'day-1', name: 'Push', day_number: 1 },
      { id: 'day-2', name: 'Pull', day_number: 2 },
      { id: 'day-3', name: 'Legs', day_number: 3 },
      { id: 'day-4', name: 'Upper', day_number: 1 },
      { id: 'day-5', name: 'Lower', day_number: 2 },
    ]

    vi.mocked(profileService.getProfile).mockResolvedValue(mockProfile)
    vi.mocked(workoutService.getAllWorkoutDays).mockResolvedValue(mockAllDays as never)

    const { result } = renderHook(() => useSelectedPlanDays(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(workoutService.getAllWorkoutDays).toHaveBeenCalled()
    expect(workoutService.getWorkoutDays).not.toHaveBeenCalled()
  })

  it('is disabled when profile is still loading', () => {
    vi.mocked(profileService.getProfile).mockImplementation(() => new Promise(() => {})) // never resolves

    const { result } = renderHook(() => useSelectedPlanDays(), { wrapper })

    // The query should be in pending state since profile hasn't loaded
    expect(result.current.data).toBeUndefined()
  })

  it('fires query with fallback when profile is null (user has no profile row)', async () => {
    const mockAllDays = [
      { id: 'day-1', name: 'Push', day_number: 1 },
      { id: 'day-2', name: 'Pull', day_number: 2 },
    ]

    vi.mocked(profileService.getProfile).mockResolvedValue(null)
    vi.mocked(workoutService.getAllWorkoutDays).mockResolvedValue(mockAllDays as never)

    const { result } = renderHook(() => useSelectedPlanDays(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(workoutService.getAllWorkoutDays).toHaveBeenCalled()
    expect(result.current.data).toEqual(mockAllDays)
  })

  it('uses correct query key based on plan id', async () => {
    const planId = '00000000-0000-0000-0000-000000000002'
    const mockProfile: profileService.UserProfile = {
      id: 'user-123',
      display_name: 'Test',
      gender: null,
      avatar_url: null,
      selected_plan_id: planId,
      current_cycle_day: 1,
      last_workout_date: null,
      cycle_start_date: null,
      timezone: null,
      created_at: '',
      updated_at: '',
    }

    const mockDays = [
      { id: 'upper-1', name: 'Upper', day_number: 1, plan_id: planId },
      { id: 'lower-1', name: 'Lower', day_number: 2, plan_id: planId },
    ]

    vi.mocked(profileService.getProfile).mockResolvedValue(mockProfile)
    vi.mocked(workoutService.getWorkoutDays).mockResolvedValue(mockDays as never)

    const { result } = renderHook(() => useSelectedPlanDays(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Verify the query was cached with the right key
    const queryData = queryClient.getQueryData(['workout-days', planId])
    expect(queryData).toEqual(mockDays)
  })
})
