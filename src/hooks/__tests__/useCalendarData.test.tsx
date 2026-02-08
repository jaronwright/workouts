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

  // ─── Mobility Sessions ──────────────────────────────

  it('maps mobility template sessions correctly', () => {
    const mobilitySession = {
      id: 'tmpl-mob-1',
      started_at: '2026-02-06T09:00:00Z',
      completed_at: '2026-02-06T09:30:00Z',
      notes: null,
      duration_minutes: 30,
      distance_value: null,
      distance_unit: null,
      template: { type: 'mobility', category: 'yoga', name: 'Morning Yoga' },
    }

    mockDefaultHooks({
      templateSessions: [mobilitySession],
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    const feb6 = result.current.calendarDays.find(
      d => d.dayOfMonth === 6 && d.date.getMonth() === 1
    )
    expect(feb6?.sessions).toHaveLength(1)
    expect(feb6?.sessions[0].type).toBe('mobility')
    expect(feb6?.sessions[0].name).toBe('Morning Yoga')
    expect(feb6?.sessions[0].category).toBe('yoga')
    expect(feb6?.hasCompletedSession).toBe(true)
  })

  // ─── Multiple Sessions Per Day ──────────────────────

  it('combines weight and template sessions on the same day', () => {
    const weightsSession = {
      id: 'ws-1',
      started_at: '2026-02-05T08:00:00Z',
      completed_at: '2026-02-05T09:00:00Z',
      notes: null,
      workout_day: { name: 'Push', id: 'wd-1', day_number: 1 },
    }
    const cardioSession = {
      id: 'tmpl-1',
      started_at: '2026-02-05T17:00:00Z',
      completed_at: '2026-02-05T17:30:00Z',
      notes: null,
      duration_minutes: 30,
      distance_value: 3,
      distance_unit: 'mi',
      template: { type: 'cardio', category: 'running', name: 'Evening Run' },
    }

    mockDefaultHooks({
      weightsSessions: [weightsSession],
      templateSessions: [cardioSession],
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    const feb5 = result.current.calendarDays.find(
      d => d.dayOfMonth === 5 && d.date.getMonth() === 1
    )
    expect(feb5?.sessions).toHaveLength(2)
    expect(feb5?.hasCompletedSession).toBe(true)
    const types = feb5!.sessions.map(s => s.type)
    expect(types).toContain('weights')
    expect(types).toContain('cardio')
  })

  // ─── Incomplete Sessions ────────────────────────────

  it('does not mark hasCompletedSession for sessions with null completed_at', () => {
    const incompleteSession = {
      id: 'session-inc',
      started_at: '2026-02-04T10:00:00Z',
      completed_at: null,
      notes: null,
      workout_day: { name: 'Pull', id: 'wd-2', day_number: 2 },
    }

    mockDefaultHooks({
      weightsSessions: [incompleteSession],
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    const feb4 = result.current.calendarDays.find(
      d => d.dayOfMonth === 4 && d.date.getMonth() === 1
    )
    expect(feb4?.sessions).toHaveLength(1)
    expect(feb4?.hasCompletedSession).toBe(false)
  })

  it('marks hasCompletedSession true when one of multiple sessions is completed', () => {
    const incomplete = {
      id: 'ws-inc',
      started_at: '2026-02-05T08:00:00Z',
      completed_at: null,
      notes: null,
      workout_day: { name: 'Push', id: 'wd-1', day_number: 1 },
    }
    const complete = {
      id: 'tmpl-comp',
      started_at: '2026-02-05T17:00:00Z',
      completed_at: '2026-02-05T17:30:00Z',
      notes: null,
      duration_minutes: 30,
      distance_value: null,
      distance_unit: null,
      template: { type: 'cardio', category: 'running', name: 'Run' },
    }

    mockDefaultHooks({
      weightsSessions: [incomplete],
      templateSessions: [complete],
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    const feb5 = result.current.calendarDays.find(
      d => d.dayOfMonth === 5 && d.date.getMonth() === 1
    )
    expect(feb5?.sessions).toHaveLength(2)
    expect(feb5?.hasCompletedSession).toBe(true)
  })

  // ─── Profile Timezone Handling ──────────────────────

  it('uses profile timezone when available', () => {
    // Session at 2026-02-05T05:30:00Z
    // In America/Chicago (UTC-6) = Feb 4 at 11:30 PM
    // In UTC = Feb 5
    const session = {
      id: 'ws-tz',
      started_at: '2026-02-05T05:30:00Z',
      completed_at: '2026-02-05T06:30:00Z',
      notes: null,
      workout_day: { name: 'Push', id: 'wd-1', day_number: 1 },
    }

    mockDefaultHooks({
      weightsSessions: [session],
      profile: {
        id: 'user-1',
        timezone: 'America/Chicago',
        cycle_start_date: null,
      },
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    // In Chicago timezone (UTC-6), 05:30Z = Feb 4 11:30 PM
    const feb4 = result.current.calendarDays.find(
      d => d.dayOfMonth === 4 && d.date.getMonth() === 1
    )
    const feb5 = result.current.calendarDays.find(
      d => d.dayOfMonth === 5 && d.date.getMonth() === 1
    )
    expect(feb4?.sessions).toHaveLength(1)
    expect(feb5?.sessions).toHaveLength(0)
  })

  it('falls back to detected timezone when profile has no timezone', () => {
    // detectUserTimezone mock returns 'America/Chicago'
    // Same session as above - should be grouped to Feb 4 in Chicago
    const session = {
      id: 'ws-tz2',
      started_at: '2026-02-05T05:30:00Z',
      completed_at: '2026-02-05T06:30:00Z',
      notes: null,
      workout_day: { name: 'Push', id: 'wd-1', day_number: 1 },
    }

    mockDefaultHooks({
      weightsSessions: [session],
      profile: null, // No profile at all
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    const feb4 = result.current.calendarDays.find(
      d => d.dayOfMonth === 4 && d.date.getMonth() === 1
    )
    expect(feb4?.sessions).toHaveLength(1)
  })

  // ─── Multiple Workouts Per Day (Schedule) ───────────

  it('sets projectedCount for days with multiple schedule entries', () => {
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
        {
          id: 's-2',
          user_id: 'user-1',
          day_number: 1,
          is_rest_day: false,
          template_id: 'tmpl-1',
          workout_day_id: null,
          sort_order: 1,
          created_at: '',
          updated_at: '',
        },
      ],
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    // Feb 1 is cycle day 1 (cycle starts Feb 1), and we have 2 entries for day 1
    const feb1 = result.current.calendarDays.find(
      d => d.dayOfMonth === 1 && d.date.getMonth() === 1
    )
    expect(feb1?.projectedCount).toBe(2)
    expect(feb1?.projected).not.toBeNull()
  })

  // ─── Empty Schedule with Cycle Start ────────────────

  it('does not compute cycle days when schedule is empty even with cycle_start_date', () => {
    mockDefaultHooks({
      profile: {
        id: 'user-1',
        cycle_start_date: '2026-02-01',
        timezone: 'America/Chicago',
      },
      schedule: [], // Empty schedule
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    for (const day of result.current.calendarDays) {
      expect(day.cycleDay).toBeNull()
      expect(day.projected).toBeNull()
      expect(day.projectedCount).toBe(0)
    }
  })

  // ─── Individual Loading States ──────────────────────

  it('reports isLoading when only weights sessions are loading', () => {
    vi.mocked(useUserSessions).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)
    vi.mocked(useUserTemplateWorkouts).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(useUserSchedule).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(useProfile).mockReturnValue({
      data: null,
      isLoading: false,
    } as any)

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    expect(result.current.isLoading).toBe(true)
  })

  it('reports isLoading when only template sessions are loading', () => {
    vi.mocked(useUserSessions).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(useUserTemplateWorkouts).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)
    vi.mocked(useUserSchedule).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(useProfile).mockReturnValue({
      data: null,
      isLoading: false,
    } as any)

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    expect(result.current.isLoading).toBe(true)
  })

  it('reports isLoading when only schedule is loading', () => {
    vi.mocked(useUserSessions).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(useUserTemplateWorkouts).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(useUserSchedule).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)
    vi.mocked(useProfile).mockReturnValue({
      data: null,
      isLoading: false,
    } as any)

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    expect(result.current.isLoading).toBe(true)
  })

  it('reports isLoading when only profile is loading', () => {
    vi.mocked(useUserSessions).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(useUserTemplateWorkouts).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(useUserSchedule).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    vi.mocked(useProfile).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    expect(result.current.isLoading).toBe(true)
  })

  // ─── Template Session Edge Cases ────────────────────

  it('defaults to cardio when template type is null', () => {
    const session = {
      id: 'tmpl-null-type',
      started_at: '2026-02-07T12:00:00Z',
      completed_at: '2026-02-07T12:30:00Z',
      notes: null,
      duration_minutes: 30,
      distance_value: null,
      distance_unit: null,
      template: { type: null, category: 'general', name: 'Workout' },
    }

    mockDefaultHooks({
      templateSessions: [session],
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    const feb7 = result.current.calendarDays.find(
      d => d.dayOfMonth === 7 && d.date.getMonth() === 1
    )
    expect(feb7?.sessions).toHaveLength(1)
    // When template type is null, it defaults to 'cardio' (see source: templateType || 'cardio')
    expect(feb7?.sessions[0].type).toBe('cardio')
  })

  it('handles template session with no template object', () => {
    const session = {
      id: 'tmpl-no-tmpl',
      started_at: '2026-02-07T12:00:00Z',
      completed_at: null,
      notes: null,
      duration_minutes: null,
      distance_value: null,
      distance_unit: null,
      template: null,
    }

    mockDefaultHooks({
      templateSessions: [session],
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    const feb7 = result.current.calendarDays.find(
      d => d.dayOfMonth === 7 && d.date.getMonth() === 1
    )
    expect(feb7?.sessions).toHaveLength(1)
    // template?.type || 'cardio' -> 'cardio'
    expect(feb7?.sessions[0].type).toBe('cardio')
    // template?.name || 'Workout' -> 'Workout'
    expect(feb7?.sessions[0].name).toBe('Workout')
    // template?.category || '' -> ''
    expect(feb7?.sessions[0].category).toBe('')
  })

  // ─── Null/Undefined Data Sources ────────────────────

  it('handles null data from hooks gracefully', () => {
    vi.mocked(useUserSessions).mockReturnValue({
      data: null,
      isLoading: false,
    } as any)
    vi.mocked(useUserTemplateWorkouts).mockReturnValue({
      data: null,
      isLoading: false,
    } as any)
    vi.mocked(useUserSchedule).mockReturnValue({
      data: null,
      isLoading: false,
    } as any)
    vi.mocked(useProfile).mockReturnValue({
      data: null,
      isLoading: false,
    } as any)

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    // Should not throw and should return empty sessions
    expect(result.current.calendarDays.length).toBeGreaterThan(0)
    for (const day of result.current.calendarDays) {
      expect(day.sessions).toEqual([])
      expect(day.hasCompletedSession).toBe(false)
    }
  })

  // ─── Session Metadata ──────────────────────────────

  it('preserves weight session metadata in unified session', () => {
    const session = {
      id: 'ws-meta',
      started_at: '2026-02-05T10:00:00Z',
      completed_at: '2026-02-05T11:00:00Z',
      notes: 'Great session!',
      workout_day: { name: 'push_day', id: 'wd-1', day_number: 1 },
    }

    mockDefaultHooks({
      weightsSessions: [session],
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    const feb5 = result.current.calendarDays.find(
      d => d.dayOfMonth === 5 && d.date.getMonth() === 1
    )
    const s = feb5?.sessions[0]
    expect(s?.id).toBe('ws-meta')
    expect(s?.type).toBe('weights')
    expect(s?.notes).toBe('Great session!')
    expect(s?.started_at).toBe('2026-02-05T10:00:00Z')
    expect(s?.completed_at).toBe('2026-02-05T11:00:00Z')
    expect(s?.originalSession).toBe(session)
  })

  it('preserves template session metadata in unified session', () => {
    const session = {
      id: 'tmpl-meta',
      started_at: '2026-02-06T14:00:00Z',
      completed_at: '2026-02-06T14:45:00Z',
      notes: 'Felt good',
      duration_minutes: 45,
      distance_value: 8.5,
      distance_unit: 'km',
      template: { type: 'cardio', category: 'cycling', name: 'Bike Ride' },
    }

    mockDefaultHooks({
      templateSessions: [session],
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    const feb6 = result.current.calendarDays.find(
      d => d.dayOfMonth === 6 && d.date.getMonth() === 1
    )
    const s = feb6?.sessions[0]
    expect(s?.id).toBe('tmpl-meta')
    expect(s?.type).toBe('cardio')
    expect(s?.category).toBe('cycling')
    expect(s?.name).toBe('Bike Ride')
    expect(s?.notes).toBe('Felt good')
    expect(s?.duration_minutes).toBe(45)
    expect(s?.distance_value).toBe(8.5)
    expect(s?.distance_unit).toBe('km')
    expect(s?.originalSession).toBe(session)
  })

  // ─── Cycle Day Projection Edge Cases ────────────────

  it('sets projectedCount to 0 and projected to null for cycle days with no schedule entry', () => {
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
        // Only day_number 1 has a schedule entry; days 2-7 have none
      ],
    })

    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    // Feb 2 is cycle day 2 (no schedule entry for day 2)
    const feb2 = result.current.calendarDays.find(
      d => d.dayOfMonth === 2 && d.date.getMonth() === 1
    )
    expect(feb2?.cycleDay).toBe(2)
    expect(feb2?.projectedCount).toBe(0)
    expect(feb2?.projected).toBeNull()
  })

  // ─── Grid for Different Month Types ─────────────────

  it('handles a month with 6 rows correctly (e.g., August 2025)', () => {
    // August 2025 starts on Friday, has 31 days -> needs 6 rows
    const aug2025 = new Date(2025, 7, 1)
    const { result } = renderHook(() => useCalendarData(aug2025), { wrapper })

    const length = result.current.calendarDays.length
    expect(length).toBe(42) // 6 rows of 7 days

    // All August days should be present
    const augDays = result.current.calendarDays.filter(
      d => d.date.getMonth() === 7 && d.date.getFullYear() === 2025
    )
    expect(augDays).toHaveLength(31)
    // All August days should be marked as current month
    for (const day of augDays) {
      expect(day.isCurrentMonth).toBe(true)
    }
  })

  it('returns unique dateKeys for all days in the grid', () => {
    const feb2026 = new Date(2026, 1, 1)
    const { result } = renderHook(() => useCalendarData(feb2026), { wrapper })

    const dateKeys = result.current.calendarDays.map(d => d.dateKey)
    const uniqueKeys = new Set(dateKeys)
    expect(uniqueKeys.size).toBe(dateKeys.length)
  })

  it('all days in past month are not future', () => {
    // Today is Feb 8, 2026. January is completely in the past.
    const jan2026 = new Date(2026, 0, 1)
    const { result } = renderHook(() => useCalendarData(jan2026), { wrapper })

    const janDays = result.current.calendarDays.filter(
      d => d.date.getMonth() === 0 && d.date.getFullYear() === 2026
    )
    for (const day of janDays) {
      expect(day.isFuture).toBe(false)
    }
  })
})
