/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import { SelectedDayPanel } from '../SelectedDayPanel'
import { Dumbbell } from 'lucide-react'
import type { CalendarDay } from '@/hooks/useCalendarData'
import type { UnifiedSession } from '@/utils/calendarGrid'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function makeCalendarDay(overrides: Partial<CalendarDay> = {}): CalendarDay {
  return {
    date: new Date(2026, 1, 7),
    dateKey: '2026-02-07',
    dayOfMonth: 7,
    isCurrentMonth: true,
    isToday: false,
    isFuture: false,
    cycleDay: null,
    projected: null,
    sessions: [],
    hasCompletedSession: false,
    ...overrides,
  }
}

function makeSession(overrides: Partial<UnifiedSession> = {}): UnifiedSession {
  return {
    id: 'session-1',
    type: 'weights',
    name: 'Push Day',
    started_at: '2026-02-07T10:00:00Z',
    completed_at: '2026-02-07T11:00:00Z',
    notes: null,
    originalSession: {} as any,
    ...overrides,
  }
}

describe('SelectedDayPanel', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('shows "Today" for today\'s date', () => {
    const day = makeCalendarDay({ isToday: true })
    render(<SelectedDayPanel day={day} />)
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('shows formatted date for non-today dates', () => {
    // February 7, 2026 is a Saturday
    const day = makeCalendarDay({
      isToday: false,
      date: new Date(2026, 1, 7),
    })
    render(<SelectedDayPanel day={day} />)
    expect(screen.getByText('Saturday, Feb 7')).toBeInTheDocument()
  })

  it('shows "No workout scheduled" when no sessions and no projection', () => {
    const day = makeCalendarDay({
      sessions: [],
      projected: null,
    })
    render(<SelectedDayPanel day={day} />)
    expect(screen.getByText('No workout scheduled')).toBeInTheDocument()
  })

  it('shows "No workout scheduled" when projection name is "Not set"', () => {
    const day = makeCalendarDay({
      sessions: [],
      projected: {
        dayNumber: 1,
        icon: Dumbbell,
        color: '#ccc',
        bgColor: '#eee',
        name: 'Not set',
        isRest: false,
      },
    })
    render(<SelectedDayPanel day={day} />)
    expect(screen.getByText('No workout scheduled')).toBeInTheDocument()
  })

  it('shows session cards when sessions exist', () => {
    const sessions = [
      makeSession({ id: 's1', name: 'Push Day' }),
      makeSession({ id: 's2', name: 'Cardio Run', type: 'cardio' }),
    ]
    const day = makeCalendarDay({ sessions })
    render(<SelectedDayPanel day={day} />)
    expect(screen.getByText('Push Day')).toBeInTheDocument()
    expect(screen.getByText('Cardio Run')).toBeInTheDocument()
  })

  it('shows "Completed" badge for completed sessions', () => {
    const sessions = [
      makeSession({ completed_at: '2026-02-07T11:00:00Z' }),
    ]
    const day = makeCalendarDay({ sessions })
    render(<SelectedDayPanel day={day} />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('shows "Not started yet" for today\'s projected unstarted workout', () => {
    const day = makeCalendarDay({
      isToday: true,
      isFuture: false,
      sessions: [],
      projected: {
        dayNumber: 1,
        icon: Dumbbell,
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.15)',
        name: 'Push Day',
        isRest: false,
        workoutDayId: 'day-1',
      },
    })
    render(<SelectedDayPanel day={day} />)
    expect(screen.getByText('Not started yet')).toBeInTheDocument()
    expect(screen.getByText('Push Day')).toBeInTheDocument()
  })

  it('shows a "Start" button for today\'s projected unstarted workout', () => {
    const day = makeCalendarDay({
      isToday: true,
      isFuture: false,
      sessions: [],
      projected: {
        dayNumber: 1,
        icon: Dumbbell,
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.15)',
        name: 'Push Day',
        isRest: false,
        workoutDayId: 'day-1',
      },
    })
    render(<SelectedDayPanel day={day} />)
    expect(screen.getByText('Start')).toBeInTheDocument()
  })

  it('shows "Upcoming workout" for future projected workouts', () => {
    const day = makeCalendarDay({
      isToday: false,
      isFuture: true,
      sessions: [],
      projected: {
        dayNumber: 2,
        icon: Dumbbell,
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.15)',
        name: 'Pull Day',
        isRest: false,
        workoutDayId: 'day-2',
      },
    })
    render(<SelectedDayPanel day={day} />)
    expect(screen.getByText('Upcoming workout')).toBeInTheDocument()
    expect(screen.getByText('Pull Day')).toBeInTheDocument()
  })

  it('shows "Rest day" for past rest days', () => {
    const day = makeCalendarDay({
      isToday: false,
      isFuture: false,
      sessions: [],
      projected: {
        dayNumber: 3,
        icon: Dumbbell,
        color: '#6B7280',
        bgColor: 'rgba(107, 114, 128, 0.15)',
        name: 'Rest',
        isRest: true,
      },
    })
    render(<SelectedDayPanel day={day} />)
    expect(screen.getByText('Rest day')).toBeInTheDocument()
  })

  it('shows "Missed" badge for past scheduled but unfinished workouts', () => {
    const day = makeCalendarDay({
      isToday: false,
      isFuture: false,
      sessions: [],
      projected: {
        dayNumber: 1,
        icon: Dumbbell,
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.15)',
        name: 'Push Day',
        isRest: false,
        workoutDayId: 'day-1',
      },
    })
    render(<SelectedDayPanel day={day} />)
    expect(screen.getByText('Missed')).toBeInTheDocument()
  })
})
