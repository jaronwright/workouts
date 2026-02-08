import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useCycleDay } from '../useCycleDay'
import * as useProfileHooks from '@/hooks/useProfile'
import * as cycleDayUtils from '@/utils/cycleDay'

// Mock dependencies
vi.mock('@/hooks/useProfile', () => ({
  useProfile: vi.fn(),
  useUpdateProfile: vi.fn(),
}))

vi.mock('@/utils/cycleDay', () => ({
  getCurrentCycleDay: vi.fn(),
  detectUserTimezone: vi.fn(),
}))

describe('useCycleDay', () => {
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
          gcTime: 0,
        },
      },
    })

    // Default: detectUserTimezone returns a timezone
    vi.mocked(cycleDayUtils.detectUserTimezone).mockReturnValue('America/Chicago')

    // Default: useUpdateProfile returns a mock mutate function
    vi.mocked(useProfileHooks.useUpdateProfile).mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useProfileHooks.useUpdateProfile>)
  })

  it('returns 1 when profile data is not loaded (undefined)', () => {
    vi.mocked(useProfileHooks.useProfile).mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    } as unknown as ReturnType<typeof useProfileHooks.useProfile>)

    const { result } = renderHook(() => useCycleDay(), { wrapper })

    expect(result.current).toBe(1)
    expect(cycleDayUtils.getCurrentCycleDay).not.toHaveBeenCalled()
  })

  it('returns 1 when profile has no cycle_start_date', () => {
    vi.mocked(useProfileHooks.useProfile).mockReturnValue({
      data: {
        id: 'user-123',
        display_name: 'Test User',
        gender: 'male',
        avatar_url: null,
        selected_plan_id: null,
        current_cycle_day: 1,
        last_workout_date: null,
        cycle_start_date: null,
        timezone: 'America/Chicago',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      isLoading: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof useProfileHooks.useProfile>)

    const { result } = renderHook(() => useCycleDay(), { wrapper })

    expect(result.current).toBe(1)
    expect(cycleDayUtils.getCurrentCycleDay).not.toHaveBeenCalled()
  })

  it('returns correct cycle day when profile has cycle_start_date', () => {
    vi.mocked(useProfileHooks.useProfile).mockReturnValue({
      data: {
        id: 'user-123',
        display_name: 'Test User',
        gender: 'male',
        avatar_url: null,
        selected_plan_id: null,
        current_cycle_day: 3,
        last_workout_date: '2024-01-15',
        cycle_start_date: '2024-01-10',
        timezone: 'America/New_York',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
      },
      isLoading: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof useProfileHooks.useProfile>)

    vi.mocked(cycleDayUtils.getCurrentCycleDay).mockReturnValue(3)

    const { result } = renderHook(() => useCycleDay(), { wrapper })

    expect(result.current).toBe(3)
    expect(cycleDayUtils.getCurrentCycleDay).toHaveBeenCalledWith(
      '2024-01-10',
      'America/New_York'
    )
  })

  it('uses detected timezone when profile timezone is null', () => {
    vi.mocked(useProfileHooks.useProfile).mockReturnValue({
      data: {
        id: 'user-123',
        display_name: 'Test User',
        gender: 'male',
        avatar_url: null,
        selected_plan_id: null,
        current_cycle_day: 5,
        last_workout_date: null,
        cycle_start_date: '2024-01-01',
        timezone: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      isLoading: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof useProfileHooks.useProfile>)

    vi.mocked(cycleDayUtils.detectUserTimezone).mockReturnValue('America/Chicago')
    vi.mocked(cycleDayUtils.getCurrentCycleDay).mockReturnValue(5)

    const { result } = renderHook(() => useCycleDay(), { wrapper })

    expect(result.current).toBe(5)
    expect(cycleDayUtils.getCurrentCycleDay).toHaveBeenCalledWith(
      '2024-01-01',
      'America/Chicago'
    )
  })

  it('returns 1 when profile is null', () => {
    vi.mocked(useProfileHooks.useProfile).mockReturnValue({
      data: null,
      isLoading: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof useProfileHooks.useProfile>)

    const { result } = renderHook(() => useCycleDay(), { wrapper })

    expect(result.current).toBe(1)
    expect(cycleDayUtils.getCurrentCycleDay).not.toHaveBeenCalled()
  })
})
