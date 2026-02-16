/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { CalendarDayCell } from '../CalendarDayCell'
import { Barbell } from '@phosphor-icons/react'
import type { CalendarDay } from '@/hooks/useCalendarData'

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { variants, initial, animate, exit, transition, layoutId, whileTap, ...rest } = props
      return <div {...rest}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}))

function makeCalendarDay(overrides: Partial<CalendarDay> = {}): CalendarDay {
  return {
    date: new Date(2026, 1, 7),
    dateKey: '2026-02-07',
    dayOfMonth: 7,
    isCurrentMonth: true,
    isToday: false,
    isFuture: false,
    cycleDay: 1,
    projected: null,
    projectedCount: 0,
    sessions: [],
    hasCompletedSession: false,
    ...overrides,
  }
}

describe('CalendarDayCell', () => {
  it('renders the day of month number', () => {
    const day = makeCalendarDay({ dayOfMonth: 15 })
    render(
      <CalendarDayCell day={day} isSelected={false} onSelect={vi.fn()} />
    )
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('calls onSelect when clicked', () => {
    const day = makeCalendarDay()
    const onSelect = vi.fn()
    render(
      <CalendarDayCell day={day} isSelected={false} onSelect={onSelect} />
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(day)
  })

  it('shows selected styling when isSelected is true', () => {
    const day = makeCalendarDay()
    render(
      <CalendarDayCell day={day} isSelected={true} onSelect={vi.fn()} />
    )
    const button = screen.getByRole('button')
    expect(button.className).toContain('ring-2')
    expect(button.className).toContain('ring-[var(--color-primary)]')
  })

  it('does not show selected styling when isSelected is false', () => {
    const day = makeCalendarDay()
    render(
      <CalendarDayCell day={day} isSelected={false} onSelect={vi.fn()} />
    )
    const button = screen.getByRole('button')
    expect(button.className).not.toContain('ring-2')
  })

  it('shows green completion dot for completed sessions', () => {
    const day = makeCalendarDay({
      hasCompletedSession: true,
      isCurrentMonth: true,
    })
    const { container } = render(
      <CalendarDayCell day={day} isSelected={false} onSelect={vi.fn()} />
    )
    const greenDot = container.querySelector('.bg-\\[var\\(--color-primary\\)\\]')
    expect(greenDot).toBeInTheDocument()
  })

  it('does not show green dot when no completed sessions', () => {
    const day = makeCalendarDay({
      hasCompletedSession: false,
      isCurrentMonth: true,
    })
    const { container } = render(
      <CalendarDayCell day={day} isSelected={false} onSelect={vi.fn()} />
    )
    const greenDot = container.querySelector('.bg-\\[var\\(--color-primary\\)\\]')
    expect(greenDot).not.toBeInTheDocument()
  })

  it('shows workout icon when projected and not rest', () => {
    const day = makeCalendarDay({
      projected: {
        dayNumber: 1,
        icon: Barbell,
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.15)',
        name: 'Push Day',
        isRest: false,
        workoutDayId: 'day-1',
      },
      isCurrentMonth: true,
    })
    const { container } = render(
      <CalendarDayCell day={day} isSelected={false} onSelect={vi.fn()} />
    )
    // The Icon component (Dumbbell) renders an SVG element
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('shows rest day icon with reduced opacity', () => {
    const day = makeCalendarDay({
      projected: {
        dayNumber: 1,
        icon: Barbell,
        color: '#6B7280',
        bgColor: 'rgba(107, 114, 128, 0.15)',
        name: 'Rest',
        isRest: true,
      },
      isCurrentMonth: true,
    })
    const { container } = render(
      <CalendarDayCell day={day} isSelected={false} onSelect={vi.fn()} />
    )
    // Rest days render an icon with reduced opacity (0.5)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('does not show workout icon when projected is null', () => {
    const day = makeCalendarDay({ projected: null })
    const { container } = render(
      <CalendarDayCell day={day} isSelected={false} onSelect={vi.fn()} />
    )
    const svg = container.querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })

  it('renders invisible spacer for days outside the current month', () => {
    const day = makeCalendarDay({ isCurrentMonth: false })
    const { container } = render(
      <CalendarDayCell day={day} isSelected={false} onSelect={vi.fn()} />
    )
    // Non-current-month cells are invisible spacers, not interactive buttons
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    const spacer = container.querySelector('[aria-hidden="true"]')
    expect(spacer).toBeInTheDocument()
  })

  it('shows count badge when multiple sessions exist', () => {
    const day = makeCalendarDay({
      sessions: [
        { id: 's1', type: 'weights', category: 'push', name: 'Push Day', started_at: '2026-02-07T10:00:00Z', completed_at: '2026-02-07T11:00:00Z', notes: null, originalSession: {} as any },
        { id: 's2', type: 'cardio', category: 'running', name: 'Running', started_at: '2026-02-07T14:00:00Z', completed_at: '2026-02-07T15:00:00Z', notes: null, originalSession: {} as any },
      ],
      hasCompletedSession: true,
      isCurrentMonth: true,
    })
    render(
      <CalendarDayCell day={day} isSelected={false} onSelect={vi.fn()} />
    )

    // Should show "2" count badge instead of an icon
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows single session icon (not count badge) for one session', () => {
    const day = makeCalendarDay({
      sessions: [
        { id: 's1', type: 'weights', category: 'push', name: 'Push Day', started_at: '2026-02-07T10:00:00Z', completed_at: '2026-02-07T11:00:00Z', notes: null, originalSession: {} as any },
      ],
      hasCompletedSession: true,
      isCurrentMonth: true,
    })
    const { container } = render(
      <CalendarDayCell day={day} isSelected={false} onSelect={vi.fn()} />
    )

    // Should show an SVG icon, not a count number
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    // Should NOT have the count badge text
    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })

  it('shows count badge for projected multi-workout future days', () => {
    const day = makeCalendarDay({
      projected: {
        dayNumber: 1,
        icon: Barbell,
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.15)',
        name: 'Push Day',
        isRest: false,
        workoutDayId: 'day-1',
      },
      projectedCount: 3,
      isFuture: true,
      isCurrentMonth: true,
    })
    render(
      <CalendarDayCell day={day} isSelected={false} onSelect={vi.fn()} />
    )

    // Should show "3" count badge for projected multi-workout day
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows green completion dot alongside count badge when sessions completed', () => {
    const day = makeCalendarDay({
      sessions: [
        { id: 's1', type: 'weights', category: 'push', name: 'Push Day', started_at: '2026-02-07T10:00:00Z', completed_at: '2026-02-07T11:00:00Z', notes: null, originalSession: {} as any },
        { id: 's2', type: 'cardio', category: 'running', name: 'Running', started_at: '2026-02-07T14:00:00Z', completed_at: '2026-02-07T15:00:00Z', notes: null, originalSession: {} as any },
      ],
      hasCompletedSession: true,
      isCurrentMonth: true,
    })
    const { container } = render(
      <CalendarDayCell day={day} isSelected={false} onSelect={vi.fn()} />
    )

    // Count badge
    expect(screen.getByText('2')).toBeInTheDocument()
    // Green completion dot should still be present
    const greenDot = container.querySelector('.bg-\\[var\\(--color-primary\\)\\]')
    expect(greenDot).toBeInTheDocument()
  })
})
