/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { CalendarGrid } from '../CalendarGrid'
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

function makeCalendarDay(dayOfMonth: number, overrides: Partial<CalendarDay> = {}): CalendarDay {
  const date = new Date(2026, 1, dayOfMonth)
  return {
    date,
    dateKey: `2026-02-${String(dayOfMonth).padStart(2, '0')}`,
    dayOfMonth,
    isCurrentMonth: true,
    isToday: false,
    isFuture: false,
    cycleDay: null,
    projected: null,
    projectedCount: 0,
    sessions: [],
    hasCompletedSession: false,
    ...overrides,
  }
}

function makeDaysForMonth(): CalendarDay[] {
  // Create 42 days (6 weeks) for a full calendar grid
  const days: CalendarDay[] = []
  for (let i = 1; i <= 28; i++) {
    days.push(makeCalendarDay(i))
  }
  // Pad with days from next month to fill out 42
  for (let i = 29; i <= 42; i++) {
    days.push(
      makeCalendarDay(i - 28, {
        date: new Date(2026, 2, i - 28),
        dateKey: `2026-03-${String(i - 28).padStart(2, '0')}`,
        isCurrentMonth: false,
      })
    )
  }
  return days
}

describe('CalendarGrid', () => {
  const defaultProps = {
    calendarDays: makeDaysForMonth(),
    currentMonth: new Date(2026, 1, 1), // February 2026
    selectedDate: new Date(2026, 1, 7),
    today: new Date(2026, 1, 7),
    onSelectDate: vi.fn(),
    onMonthChange: vi.fn(),
  }

  it('renders day-of-week headers (S, M, T, W, T, F, S)', () => {
    render(<CalendarGrid {...defaultProps} />)
    const headers = screen.getAllByText(/^[SMTWF]$/)
    // S=2 (Sun, Sat), M=1, T=2 (Tue, Thu), W=1, F=1 = 7 total
    expect(headers).toHaveLength(7)

    // Verify the exact sequence by checking all header text
    const headerTexts = headers.map((h) => h.textContent)
    expect(headerTexts).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S'])
  })

  it('renders month/year header', () => {
    render(<CalendarGrid {...defaultProps} />)
    // Month name and year are in separate elements
    expect(screen.getByText('February')).toBeInTheDocument()
    expect(screen.getByText('2026')).toBeInTheDocument()
  })

  it('renders a different month/year header for different months', () => {
    render(
      <CalendarGrid
        {...defaultProps}
        currentMonth={new Date(2026, 11, 1)}
      />
    )
    // Month name and year are in separate elements
    expect(screen.getByText('December')).toBeInTheDocument()
    expect(screen.getByText('2026')).toBeInTheDocument()
  })

  it('shows previous and next month navigation buttons', () => {
    const { container } = render(<CalendarGrid {...defaultProps} />)
    // The navigation buttons are inside a nested flex div
    const navButtonContainer = container.querySelector('.flex.items-center.gap-1')!
    const navButtons = navButtonContainer.querySelectorAll('button')
    expect(navButtons.length).toBe(2)

    // Verify SVGs exist inside the nav buttons (chevron icons)
    expect(navButtons[0].querySelector('svg')).toBeInTheDocument()
    expect(navButtons[1].querySelector('svg')).toBeInTheDocument()
  })

  it('calls onMonthChange with previous month when previous button is clicked', () => {
    const onMonthChange = vi.fn()
    const { container } = render(
      <CalendarGrid {...defaultProps} onMonthChange={onMonthChange} />
    )
    // Nav buttons are inside the nested flex container
    const navButtonContainer = container.querySelector('.flex.items-center.gap-1')!
    const navButtons = navButtonContainer.querySelectorAll('button')
    fireEvent.click(navButtons[0])

    expect(onMonthChange).toHaveBeenCalledTimes(1)
    const calledWith = onMonthChange.mock.calls[0][0] as Date
    // February 2026 - 1 = January 2026
    expect(calledWith.getMonth()).toBe(0) // January
    expect(calledWith.getFullYear()).toBe(2026)
  })

  it('calls onMonthChange with next month when next button is clicked', () => {
    const onMonthChange = vi.fn()
    const { container } = render(
      <CalendarGrid {...defaultProps} onMonthChange={onMonthChange} />
    )
    // Nav buttons are inside the nested flex container
    const navButtonContainer = container.querySelector('.flex.items-center.gap-1')!
    const navButtons = navButtonContainer.querySelectorAll('button')
    fireEvent.click(navButtons[1])

    expect(onMonthChange).toHaveBeenCalledTimes(1)
    const calledWith = onMonthChange.mock.calls[0][0] as Date
    // February 2026 + 1 = March 2026
    expect(calledWith.getMonth()).toBe(2) // March
    expect(calledWith.getFullYear()).toBe(2026)
  })

  it('renders calendar day cells for current month days', () => {
    render(<CalendarGrid {...defaultProps} />)
    // Only current-month cells render as buttons; non-current-month cells are spacers
    const dayButtons = screen.getAllByRole('button')
    // 28 current-month day buttons + 2 nav buttons = 30
    expect(dayButtons.length).toBe(30)
  })

  it('shows "Today" button when viewing a different month', () => {
    render(
      <CalendarGrid
        {...defaultProps}
        currentMonth={new Date(2026, 5, 1)} // June 2026, not the same as today (Feb)
      />
    )
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('does not show "Today" button when viewing the current month', () => {
    render(
      <CalendarGrid
        {...defaultProps}
        currentMonth={new Date(2026, 1, 1)}
        today={new Date(2026, 1, 7)}
      />
    )
    // When currentMonth matches today's month, no "Today" button
    expect(screen.queryByText('Today')).not.toBeInTheDocument()
  })
})
