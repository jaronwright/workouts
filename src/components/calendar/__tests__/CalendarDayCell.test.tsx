/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { CalendarDayCell } from '../CalendarDayCell'
import { Dumbbell } from 'lucide-react'
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
    const greenDot = container.querySelector('.bg-\\[var\\(--color-success\\)\\]')
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
    const greenDot = container.querySelector('.bg-\\[var\\(--color-success\\)\\]')
    expect(greenDot).not.toBeInTheDocument()
  })

  it('shows workout icon when projected and not rest', () => {
    const day = makeCalendarDay({
      projected: {
        dayNumber: 1,
        icon: Dumbbell,
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

  it('does not show workout icon when projected is a rest day', () => {
    const day = makeCalendarDay({
      projected: {
        dayNumber: 1,
        icon: Dumbbell,
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
    // Rest days render a small muted dot, not the Icon SVG
    const svg = container.querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })

  it('does not show workout icon when projected is null', () => {
    const day = makeCalendarDay({ projected: null })
    const { container } = render(
      <CalendarDayCell day={day} isSelected={false} onSelect={vi.fn()} />
    )
    const svg = container.querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })

  it('reduces opacity for days outside the current month', () => {
    const day = makeCalendarDay({ isCurrentMonth: false })
    render(
      <CalendarDayCell day={day} isSelected={false} onSelect={vi.fn()} />
    )
    const button = screen.getByRole('button')
    expect(button.className).toContain('opacity-30')
  })
})
