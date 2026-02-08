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
    expect(screen.getByText('February 2026')).toBeInTheDocument()
  })

  it('renders a different month/year header for different months', () => {
    render(
      <CalendarGrid
        {...defaultProps}
        currentMonth={new Date(2026, 11, 1)}
      />
    )
    expect(screen.getByText('December 2026')).toBeInTheDocument()
  })

  it('shows previous and next month navigation buttons', () => {
    const { container } = render(<CalendarGrid {...defaultProps} />)
    // The navigation header has two buttons: previous (ChevronLeft) and next (ChevronRight)
    const navButtons = container.querySelectorAll('button')
    // At minimum there should be prev and next navigation buttons
    expect(navButtons.length).toBeGreaterThanOrEqual(2)

    // Verify SVGs exist inside the first and second nav buttons (chevron icons)
    const firstButton = navButtons[0]
    const lastNavButton = navButtons[1]
    expect(firstButton.querySelector('svg')).toBeInTheDocument()
    expect(lastNavButton.querySelector('svg')).toBeInTheDocument()
  })

  it('calls onMonthChange with previous month when previous button is clicked', () => {
    const onMonthChange = vi.fn()
    const { container } = render(
      <CalendarGrid {...defaultProps} onMonthChange={onMonthChange} />
    )
    // The first button in the header is the previous month button
    const buttons = container.querySelectorAll('button')
    fireEvent.click(buttons[0])

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
    // The second button in the navigation header is the next month button
    // We need to find the button that contains the ChevronRight icon
    // It's the second direct child button of the navigation header
    const navHeader = container.querySelector('.flex.items-center.justify-between')!
    const navButtons = navHeader.querySelectorAll(':scope > button')
    fireEvent.click(navButtons[1])

    expect(onMonthChange).toHaveBeenCalledTimes(1)
    const calledWith = onMonthChange.mock.calls[0][0] as Date
    // February 2026 + 1 = March 2026
    expect(calledWith.getMonth()).toBe(2) // March
    expect(calledWith.getFullYear()).toBe(2026)
  })

  it('renders calendar day cells for all days', () => {
    render(<CalendarGrid {...defaultProps} />)
    // All 42 day cells should be rendered as buttons
    const dayButtons = screen.getAllByRole('button')
    // Subtract 2 for prev/next navigation buttons (and possibly a "Today" button)
    // There should be at least 42 day cell buttons
    expect(dayButtons.length).toBeGreaterThanOrEqual(42)
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
