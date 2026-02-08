/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCalendarData } from '../useCalendarData'
import { ReactNode } from 'react'

// Mock all dependencies
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = { user: { id: 'user-1' } }
    return typeof selector === 'function' ? selector(state as any) : state
  }),
}))

vi.mock('@/hooks/useWorkoutSession', () => ({
  useUserSessions: vi.fn(),
}))

vi.mock('@/hooks/useTemplateWorkout', () => ({
  useUserTemplateWorkouts: vi.fn(),
}))

vi.mock('@/hooks/useSchedule', () => ({
  useUserSchedule: vi.fn(),
}))

vi.mock('@/hooks/useProfile', () => ({
  useProfile: vi.fn(),
}))

vi.mock('@/config/workoutConfig', () => ({
  getWorkoutDisplayName: vi.fn((name: string) => name),
}))

vi.mock('@/utils/cycleDay', () => ({
  detectUserTimezone: vi.fn(() => 'America/Chicago'),
  getTodayInTimezone: vi.fn(() => new Date(2026, 1, 8)), // Feb 8, 2026
}))

vi.mock('@/utils/scheduleUtils', () => ({
  getDayInfo: vi.fn(() => ({
    dayNumber: 1,
    icon: 'Calendar',
    color: '#000',
    bgColor: '#fff',
    name: 'Push',
    isRest: false,
  })),
}))

import { useUserSessions } from '@/hooks/useWorkoutSession'
import { useUserTemplateWorkouts } from '@/hooks/useTemplateWorkout'
import { useUserSchedule } from '@/hooks/useSchedule'
import { useProfile } from '@/hooks/useProfile'
import { getTodayInTimezone } from '@/utils/cycleDay'

describe('useCalendarData', () => {
  let queryClient: QueryClient

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  function mockDefaultHooks(overrides: {
    weightsSessions?: any[]
    templateSessions?: any[]
    schedule?: any[]
    profile?: any
    isLoading?: boolean
  } = {}) {
    vi.mocked(useUserSessions).mockReturnValue({
      data: overrides.weightsSessions ?? [],
      isLoading: overrides.isLoading ?? false,
    } as any)

    vi.mocked(useUserTemplateWorkouts).mockReturnValue({
      data: overrides.templateSessions ?? [],
      isLoading: overrides.isLoading ?? false,
    } as any)

    vi.mocked(useUserSchedule).mockReturnValue({
      data: overrides.schedule ?? [],
      isLoading: overrides.isLoading ?? false,
    } as any)

    vi.mocked(useProfile).mockReturnValue({
      data: overrides.profile ?? null,
      isLoading: overrides.isLoading ?? false,
    } as any)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    // Default: Feb 8, 2026
    vi.mocked(getTodayInTimezone).mockReturnValue(new Date(2026, 1, 8))
    mockDefaultHooks()
  })

  // ─── Grid Structure ───────────────────────────────────

  it('returns calendar days covering the full month grid', () => {
    // February 2026 starts on Sunday, ends on Saturday = exactly 4 weeks = 28 days
    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    // Feb 2026: starts Sun Feb 1, ends Sat Feb 28
    // Grid should be at least 28 days (could be more if the month needs additional rows)
    expect(result.current.calendarDays.length).toBeGreaterThanOrEqual(28)
    // Must be a multiple of 7 (full weeks)
    expect(result.current.calendarDays.length % 7).toBe(0)
  })

  it('returns a grid with 35 or 42 days for months that span 5 or 6 weeks', () => {
    // March 2026 starts on Sunday, has 31 days
    const march2026 = new Date(2026, 2, 1)
    const { result } = renderHook(() => useCalendarData(march2026), { wrapper })

    const length = result.current.calendarDays.length
    expect([28, 35, 42]).toContain(length)
  })

  it('includes days from previous and next months to fill the grid', () => {
    // January 2026 starts on Thursday, so grid will include trailing days from Dec 2025
    const jan2026 = new Date(2026, 0, 1)
    const { result } = renderHook(() => useCalendarData(jan2026), { wrapper })

    const days = result.current.calendarDays
    // First day of grid should be a Sunday
    expect(days[0].date.getDay()).toBe(0) // Sunday

    // Some days should not be in the current month
    const outOfMonthDays = days.filter(d => !d.isCurrentMonth)
    expect(outOfMonthDays.length).toBeGreaterThan(0)
  })

  it('marks isCurrentMonth correctly for each day', () => {
    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    const days = result.current.calendarDays
    for (const day of days) {
      if (day.date.getMonth() === 1 && day.date.getFullYear() === 2026) {
        expect(day.isCurrentMonth).toBe(true)
      } else {
        expect(day.isCurrentMonth).toBe(false)
      }
    }
  })

  // ─── Today Detection ──────────────────────────────────

  it('marks today correctly', () => {
    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    const todayDays = result.current.calendarDays.filter(d => d.isToday)
    expect(todayDays).toHaveLength(1)
    expect(todayDays[0].dayOfMonth).toBe(8)
    expect(todayDays[0].date.getMonth()).toBe(1) // February
  })

  it('returns today date in result', () => {
    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    expect(result.current.today).toEqual(new Date(2026, 1, 8))
  })

  it('has no today marker when viewing a different month', () => {
    // "Today" is Feb 8, but we are viewing January
    const jan2026 = new Date(2026, 0, 1)
    const { result } = renderHook(() => useCalendarData(jan2026), { wrapper })

    // The grid for January might include early Feb days depending on grid layout
    // but typically Jan ends on Sat Jan 31, so the grid ends Jan 31 (no Feb days)
    const todayDays = result.current.calendarDays.filter(d => d.isToday)
    // If the grid does include Feb 8, it would be isToday=true but isCurrentMonth=false
    // If not, there would be no today
    for (const td of todayDays) {
      // If today appears, it should not be in the current month
      expect(td.isCurrentMonth).toBe(false)
    }
  })

  // ─── Future Day Detection ─────────────────────────────

  it('identifies future days correctly', () => {
    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    const days = result.current.calendarDays

    // Feb 9 should be future
    const feb9 = days.find(d => d.dayOfMonth === 9 && d.date.getMonth() === 1)
    expect(feb9?.isFuture).toBe(true)

    // Feb 7 should NOT be future (past)
    const feb7 = days.find(d => d.dayOfMonth === 7 && d.date.getMonth() === 1)
    expect(feb7?.isFuture).toBe(false)

    // Feb 8 (today) should NOT be future
    const feb8 = days.find(d => d.dayOfMonth === 8 && d.date.getMonth() === 1)
    expect(feb8?.isFuture).toBe(false)
  })

  // ─── Sessions ─────────────────────────────────────────

  it('handles month with no sessions - all days unmarked', () => {
    mockDefaultHooks({
      weightsSessions: [],
      templateSessions: [],
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    for (const day of result.current.calendarDays) {
      expect(day.sessions).toEqual([])
      expect(day.hasCompletedSession).toBe(false)
    }
  })

  it('marks hasCompletedSession for days with completed weight sessions', () => {
    const completedSession = {
      id: 'session-1',
      started_at: '2026-02-05T10:00:00Z',
      completed_at: '2026-02-05T11:00:00Z',
      notes: null,
      workout_day: { name: 'Push', id: 'wd-1', day_number: 1 },
    }

    mockDefaultHooks({
      weightsSessions: [completedSession],
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    const feb5 = result.current.calendarDays.find(
      d => d.dayOfMonth === 5 && d.date.getMonth() === 1
    )
    expect(feb5?.hasCompletedSession).toBe(true)
    expect(feb5?.sessions.length).toBeGreaterThanOrEqual(1)
  })

  it('marks template (cardio/mobility) sessions on correct days', () => {
    const cardioSession = {
      id: 'tmpl-1',
      started_at: '2026-02-03T14:00:00Z',
      completed_at: '2026-02-03T14:30:00Z',
      notes: null,
      duration_minutes: 30,
      distance_value: 5,
      distance_unit: 'km',
      template: { type: 'cardio', category: 'running', name: 'Easy Run' },
    }

    mockDefaultHooks({
      templateSessions: [cardioSession],
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    const feb3 = result.current.calendarDays.find(
      d => d.dayOfMonth === 3 && d.date.getMonth() === 1
    )
    expect(feb3?.sessions.length).toBeGreaterThanOrEqual(1)
    expect(feb3?.sessions[0].type).toBe('cardio')
    expect(feb3?.sessions[0].name).toBe('Easy Run')
  })

  // ─── Loading State ────────────────────────────────────

  it('reports isLoading when any data source is loading', () => {
    mockDefaultHooks({ isLoading: true })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    expect(result.current.isLoading).toBe(true)
  })

  it('reports not loading when all data sources are loaded', () => {
    mockDefaultHooks({ isLoading: false })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    expect(result.current.isLoading).toBe(false)
  })

  // ─── Date Keys ────────────────────────────────────────

  it('provides dateKey in YYYY-MM-DD format for each day', () => {
    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    for (const day of result.current.calendarDays) {
      expect(day.dateKey).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('dayOfMonth matches the day of the date object', () => {
    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    for (const day of result.current.calendarDays) {
      expect(day.dayOfMonth).toBe(day.date.getDate())
    }
  })

  // ─── Cycle Day Projection ─────────────────────────────

  it('computes cycle days when profile has cycle_start_date and schedule exists', () => {
    mockDefaultHooks({
      profile: {
        id: 'user-1',
        cycle_start_date: '2026-02-01',
        timezone: 'America/Chicago',
      },
      schedule: [
        {
          id: 's-1',
          user_id: 'user-1',
          day_number: 1,
          is_rest_day: false,
          template_id: null,
          workout_day_id: 'wd-1',
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
      ],
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    // With a cycle start date and schedule, some days should have cycleDay set
    const daysWithCycle = result.current.calendarDays.filter(d => d.cycleDay !== null)
    expect(daysWithCycle.length).toBeGreaterThan(0)
  })

  it('does not compute cycle days when profile has no cycle_start_date', () => {
    mockDefaultHooks({
      profile: {
        id: 'user-1',
        cycle_start_date: null,
        timezone: 'America/Chicago',
      },
      schedule: [],
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    for (const day of result.current.calendarDays) {
      expect(day.cycleDay).toBeNull()
      expect(day.projected).toBeNull()
      expect(day.projectedCount).toBe(0)
    }
  })
})
