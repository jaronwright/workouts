import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useWorkoutPlans,
  useWorkoutDays,
  useWorkoutDay,
  useSelectedPlanDays,
} from '../useWorkoutPlan'
import { useAuthStore } from '@/stores/authStore'
import * as profileService from '@/services/profileService'
import * as workoutService from '@/services/workoutService'
import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

const mockUser = { id: 'user-123', email: 'test@example.com' }

function makeProfile(overrides: Partial<profileService.UserProfile> = {}): profileService.UserProfile {
  return {
    id: 'user-123',
    display_name: 'Test User',
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
    ...overrides,
  }
}

describe('useWorkoutPlan hooks (comprehensive)', () => {
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
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    })

    // Default: authenticated user
    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = { user: mockUser }
      if (typeof selector === 'function') {
        return selector(state as never)
      }
      return state
    })
  })

  // ─── useWorkoutPlans ─────────────────────────────────────

  describe('useWorkoutPlans', () => {
    it('returns data from getWorkoutPlans query', async () => {
      const plans = [
        { id: 'plan-1', name: 'PPL', description: 'Push Pull Legs', created_at: '2024-01-01' },
        { id: 'plan-2', name: 'Upper/Lower', description: null, created_at: '2024-01-02' },
      ]
      vi.mocked(workoutService.getWorkoutPlans).mockResolvedValue(plans as never)

      const { result } = renderHook(() => useWorkoutPlans(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(workoutService.getWorkoutPlans).toHaveBeenCalledTimes(1)
      expect(result.current.data).toEqual(plans)
    })

    it('exposes error state when service fails', async () => {
      const error = new Error('Network error')
      vi.mocked(workoutService.getWorkoutPlans).mockRejectedValue(error)

      const { result } = renderHook(() => useWorkoutPlans(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })

    it('uses query key ["workout-plans"]', async () => {
      vi.mocked(workoutService.getWorkoutPlans).mockResolvedValue([])

      renderHook(() => useWorkoutPlans(), { wrapper })

      await waitFor(() => {
        const state = queryClient.getQueryState(['workout-plans'])
        expect(state).toBeDefined()
      })
    })
  })

  // ─── useWorkoutDays ──────────────────────────────────────

  describe('useWorkoutDays', () => {
    it('calls getWorkoutDays when planId is provided', async () => {
      const days = [
        { id: 'day-1', plan_id: 'plan-1', name: 'Push', day_number: 1, created_at: '' },
        { id: 'day-2', plan_id: 'plan-1', name: 'Pull', day_number: 2, created_at: '' },
      ]
      vi.mocked(workoutService.getWorkoutDays).mockResolvedValue(days as never)

      const { result } = renderHook(() => useWorkoutDays('plan-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(workoutService.getWorkoutDays).toHaveBeenCalledWith('plan-1')
      expect(workoutService.getAllWorkoutDays).not.toHaveBeenCalled()
      expect(result.current.data).toEqual(days)
    })

    it('calls getAllWorkoutDays when planId is undefined', async () => {
      const allDays = [
        { id: 'day-1', plan_id: 'plan-1', name: 'Push', day_number: 1, created_at: '' },
        { id: 'day-3', plan_id: 'plan-2', name: 'Upper', day_number: 1, created_at: '' },
      ]
      vi.mocked(workoutService.getAllWorkoutDays).mockResolvedValue(allDays as never)

      const { result } = renderHook(() => useWorkoutDays(undefined), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(workoutService.getAllWorkoutDays).toHaveBeenCalledTimes(1)
      expect(workoutService.getWorkoutDays).not.toHaveBeenCalled()
      expect(result.current.data).toEqual(allDays)
    })

    it('calls getAllWorkoutDays when planId is not passed', async () => {
      vi.mocked(workoutService.getAllWorkoutDays).mockResolvedValue([])

      const { result } = renderHook(() => useWorkoutDays(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(workoutService.getAllWorkoutDays).toHaveBeenCalled()
      expect(workoutService.getWorkoutDays).not.toHaveBeenCalled()
    })

    it('uses query key with planId when provided', async () => {
      vi.mocked(workoutService.getWorkoutDays).mockResolvedValue([])

      renderHook(() => useWorkoutDays('plan-1'), { wrapper })

      await waitFor(() => {
        const state = queryClient.getQueryState(['workout-days', 'plan-1'])
        expect(state).toBeDefined()
      })
    })

    it('uses query key with "all" when no planId', async () => {
      vi.mocked(workoutService.getAllWorkoutDays).mockResolvedValue([])

      renderHook(() => useWorkoutDays(), { wrapper })

      await waitFor(() => {
        const state = queryClient.getQueryState(['workout-days', 'all'])
        expect(state).toBeDefined()
      })
    })

    it('exposes error state when service fails', async () => {
      const error = new Error('Days fetch failed')
      vi.mocked(workoutService.getWorkoutDays).mockRejectedValue(error)

      const { result } = renderHook(() => useWorkoutDays('plan-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })
  })

  // ─── useWorkoutDay ───────────────────────────────────────

  describe('useWorkoutDay', () => {
    it('fetches day with sections when dayId is provided', async () => {
      const dayWithSections = {
        id: 'day-1',
        plan_id: 'plan-1',
        name: 'Push',
        day_number: 1,
        created_at: '',
        sections: [
          {
            id: 'section-1',
            workout_day_id: 'day-1',
            name: 'Main Lifts',
            duration_minutes: null,
            sort_order: 1,
            exercises: [],
          },
        ],
      }
      vi.mocked(workoutService.getWorkoutDayWithSections).mockResolvedValue(dayWithSections as never)

      const { result } = renderHook(() => useWorkoutDay('day-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(workoutService.getWorkoutDayWithSections).toHaveBeenCalledWith('day-1')
      expect(result.current.data).toEqual(dayWithSections)
    })

    it('is disabled when dayId is undefined', () => {
      const { result } = renderHook(() => useWorkoutDay(undefined), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(workoutService.getWorkoutDayWithSections).not.toHaveBeenCalled()
    })

    it('uses query key ["workout-day", dayId]', async () => {
      vi.mocked(workoutService.getWorkoutDayWithSections).mockResolvedValue(null)

      renderHook(() => useWorkoutDay('day-1'), { wrapper })

      await waitFor(() => {
        const state = queryClient.getQueryState(['workout-day', 'day-1'])
        expect(state).toBeDefined()
      })
    })

    it('returns null when getWorkoutDayWithSections returns null', async () => {
      vi.mocked(workoutService.getWorkoutDayWithSections).mockResolvedValue(null)

      const { result } = renderHook(() => useWorkoutDay('day-nonexistent'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeNull()
    })

    it('exposes error state when service fails', async () => {
      const error = new Error('Day fetch error')
      vi.mocked(workoutService.getWorkoutDayWithSections).mockRejectedValue(error)

      const { result } = renderHook(() => useWorkoutDay('day-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })
  })

  // ─── useSelectedPlanDays ─────────────────────────────────

  describe('useSelectedPlanDays', () => {
    it('fetches days when profile has selected_plan_id', async () => {
      const profile = makeProfile({ selected_plan_id: 'plan-ppl' })
      const days = [
        { id: 'day-1', name: 'Push', day_number: 1, plan_id: 'plan-ppl', created_at: '' },
        { id: 'day-2', name: 'Pull', day_number: 2, plan_id: 'plan-ppl', created_at: '' },
      ]

      vi.mocked(profileService.getProfile).mockResolvedValue(profile)
      vi.mocked(workoutService.getWorkoutDays).mockResolvedValue(days as never)

      const { result } = renderHook(() => useSelectedPlanDays(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(workoutService.getWorkoutDays).toHaveBeenCalledWith('plan-ppl')
      expect(result.current.data).toEqual(days)
    })

    it('is disabled when profile has no selected_plan_id', async () => {
      const profile = makeProfile({ selected_plan_id: null })
      vi.mocked(profileService.getProfile).mockResolvedValue(profile)

      const { result } = renderHook(() => useSelectedPlanDays(), { wrapper })

      // Wait for profile to load
      await waitFor(() => {
        expect(profileService.getProfile).toHaveBeenCalled()
      })

      // Days query should not have been called
      expect(result.current.data).toBeUndefined()
      expect(workoutService.getWorkoutDays).not.toHaveBeenCalled()
    })

    it('is disabled when profile is still loading', () => {
      // Profile never resolves
      vi.mocked(profileService.getProfile).mockImplementation(() => new Promise(() => {}))

      const { result } = renderHook(() => useSelectedPlanDays(), { wrapper })

      expect(result.current.data).toBeUndefined()
      expect(workoutService.getWorkoutDays).not.toHaveBeenCalled()
    })

    it('is disabled when profile is null', async () => {
      vi.mocked(profileService.getProfile).mockResolvedValue(null)

      const { result } = renderHook(() => useSelectedPlanDays(), { wrapper })

      await waitFor(() => {
        expect(profileService.getProfile).toHaveBeenCalled()
      })

      expect(result.current.data).toBeUndefined()
      expect(workoutService.getWorkoutDays).not.toHaveBeenCalled()
    })

    it('uses query key with plan id', async () => {
      const planId = '00000000-0000-0000-0000-000000000001'
      const profile = makeProfile({ selected_plan_id: planId })

      vi.mocked(profileService.getProfile).mockResolvedValue(profile)
      vi.mocked(workoutService.getWorkoutDays).mockResolvedValue([])

      renderHook(() => useSelectedPlanDays(), { wrapper })

      await waitFor(() => {
        const state = queryClient.getQueryState(['workout-days', planId])
        expect(state).toBeDefined()
      })
    })

    it('uses query key "none" when no plan selected', async () => {
      vi.mocked(profileService.getProfile).mockResolvedValue(makeProfile())

      renderHook(() => useSelectedPlanDays(), { wrapper })

      await waitFor(() => {
        expect(profileService.getProfile).toHaveBeenCalled()
      })

      // The query key should be ['workout-days', 'none']
      const state = queryClient.getQueryState(['workout-days', 'none'])
      expect(state).toBeDefined()
    })
  })
})
