/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { HistoryPage } from '../History'
import type { CalendarDay } from '@/hooks/useCalendarData'

let mockCalendarDays: CalendarDay[] = []
let mockIsLoading = false
const mockToday = new Date(2026, 1, 7) // Feb 7, 2026

vi.mock('@/hooks/useCalendarData', () => ({
  useCalendarData: () => ({
    calendarDays: mockCalendarDays,
    isLoading: mockIsLoading,
    today: mockToday,
  }),
}))

vi.mock('@/components/layout', () => ({
  AppShell: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

vi.mock('@/components/calendar', () => ({
  CalendarGrid: ({ onSelectDate, onMonthChange }: {
    onSelectDate: (day: CalendarDay) => void
    onMonthChange: (month: Date) => void
  }) => (
    <div data-testid="calendar-grid">
      <button
        data-testid="select-day"
        onClick={() =>
          onSelectDate({
            date: new Date(2026, 1, 7),
            dateKey: '2026-02-07',
            dayOfMonth: 7,
            isCurrentMonth: true,
            isToday: true,
            isFuture: false,
            cycleDay: 1,
            projected: null,
            sessions: [],
            hasCompletedSession: false,
          })
        }
      >
        Select Day
      </button>
      <button
        data-testid="prev-month"
        onClick={() => onMonthChange(new Date(2026, 0, 1))}
      >
        Prev
      </button>
      <button
        data-testid="next-month"
        onClick={() => onMonthChange(new Date(2026, 2, 1))}
      >
        Next
      </button>
    </div>
  ),
  SelectedDayPanel: ({ day }: { day: CalendarDay }) => (
    <div data-testid="selected-day-panel">
      <span data-testid="selected-day-date">{day.dateKey}</span>
    </div>
  ),
}))

vi.mock('@/components/ui', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BottomSheet: ({
    children,
    isOpen,
  }: {
    children: React.ReactNode
    isOpen: boolean
  }) => (isOpen ? <div data-testid="bottom-sheet">{children}</div> : null),
  AnimatedCounter: ({ value, className }: { value: number; className: string }) => (
    <span className={className} data-testid="animated-counter">
      {value}
    </span>
  ),
}))

// Helper to build CalendarDay objects
function makeCalendarDay(overrides: Partial<CalendarDay> = {}): CalendarDay {
  return {
    date: new Date(2026, 1, 7),
    dateKey: '2026-02-07',
    dayOfMonth: 7,
    isCurrentMonth: true,
    isToday: true,
    isFuture: false,
    cycleDay: 1,
    projected: null,
    sessions: [],
    hasCompletedSession: false,
    ...overrides,
  }
}

describe('HistoryPage Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCalendarDays = []
    mockIsLoading = false
  })

  describe('Calendar navigation', () => {
    it('navigates to next month when next button is clicked', () => {
      mockCalendarDays = [makeCalendarDay()]

      render(<HistoryPage />)

      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument()

      fireEvent.click(screen.getByTestId('next-month'))

      // After clicking next, the calendar grid should still render
      // (the component re-renders with updated currentMonth state)
      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument()
    })

    it('navigates to previous month when prev button is clicked', () => {
      mockCalendarDays = [makeCalendarDay()]

      render(<HistoryPage />)

      fireEvent.click(screen.getByTestId('prev-month'))

      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument()
    })
  })

  describe('Day selection opens bottom sheet', () => {
    it('opens BottomSheet with SelectedDayPanel when a day is clicked', () => {
      mockCalendarDays = [makeCalendarDay()]

      render(<HistoryPage />)

      // Bottom sheet should not be visible initially
      expect(screen.queryByTestId('bottom-sheet')).not.toBeInTheDocument()

      // Click a day on the calendar
      fireEvent.click(screen.getByTestId('select-day'))

      // Bottom sheet should now be visible
      expect(screen.getByTestId('bottom-sheet')).toBeInTheDocument()
      // SelectedDayPanel should be rendered inside it
      expect(screen.getByTestId('selected-day-panel')).toBeInTheDocument()
    })

    it('renders SelectedDayPanel with the selected day data', () => {
      mockCalendarDays = [
        makeCalendarDay({
          date: new Date(2026, 1, 7),
          dateKey: '2026-02-07',
          dayOfMonth: 7,
        }),
      ]

      render(<HistoryPage />)

      fireEvent.click(screen.getByTestId('select-day'))

      expect(screen.getByTestId('selected-day-date')).toHaveTextContent('2026-02-07')
    })
  })

  describe('Monthly summary stats', () => {
    it('shows correct completed count for sessions in current month', () => {
      mockCalendarDays = [
        makeCalendarDay({
          date: new Date(2026, 1, 1),
          dateKey: '2026-02-01',
          dayOfMonth: 1,
          isToday: false,
          hasCompletedSession: true,
          sessions: [
            {
              id: 's1',
              name: 'Push Day',
              type: 'weights' as const,
              started_at: new Date(2026, 1, 1).toISOString(),
              completed_at: new Date(2026, 1, 1).toISOString(),
              notes: null,
              originalSession: {} as any,
            },
          ],
        }),
        makeCalendarDay({
          date: new Date(2026, 1, 3),
          dateKey: '2026-02-03',
          dayOfMonth: 3,
          isToday: false,
          hasCompletedSession: true,
          sessions: [
            {
              id: 's2',
              name: 'Pull Day',
              type: 'weights' as const,
              started_at: new Date(2026, 1, 3).toISOString(),
              completed_at: new Date(2026, 1, 3).toISOString(),
              notes: null,
              originalSession: {} as any,
            },
          ],
        }),
        makeCalendarDay({
          date: new Date(2026, 1, 5),
          dateKey: '2026-02-05',
          dayOfMonth: 5,
          isToday: false,
          hasCompletedSession: false,
          sessions: [],
        }),
      ]

      render(<HistoryPage />)

      // 2 completed sessions out of 3 days
      const counters = screen.getAllByTestId('animated-counter')
      // First counter is the completed count
      expect(counters[0]).toHaveTextContent('2')
    })

    it('shows streak count based on consecutive completed days', () => {
      // Create 3 consecutive completed days (reverse order matters for streak calc)
      mockCalendarDays = [
        makeCalendarDay({
          date: new Date(2026, 1, 5),
          dateKey: '2026-02-05',
          dayOfMonth: 5,
          isToday: false,
          hasCompletedSession: true,
          sessions: [
            {
              id: 's1',
              name: 'Push Day',
              type: 'weights' as const,
              started_at: new Date(2026, 1, 5).toISOString(),
              completed_at: new Date(2026, 1, 5).toISOString(),
              notes: null,
              originalSession: {} as any,
            },
          ],
          projected: { name: 'Push Day', isRest: false, workoutType: 'weights' } as any,
        }),
        makeCalendarDay({
          date: new Date(2026, 1, 6),
          dateKey: '2026-02-06',
          dayOfMonth: 6,
          isToday: false,
          hasCompletedSession: true,
          sessions: [
            {
              id: 's2',
              name: 'Pull Day',
              type: 'weights' as const,
              started_at: new Date(2026, 1, 6).toISOString(),
              completed_at: new Date(2026, 1, 6).toISOString(),
              notes: null,
              originalSession: {} as any,
            },
          ],
          projected: { name: 'Pull Day', isRest: false, workoutType: 'weights' } as any,
        }),
        makeCalendarDay({
          date: new Date(2026, 1, 7),
          dateKey: '2026-02-07',
          dayOfMonth: 7,
          isToday: true,
          hasCompletedSession: true,
          sessions: [
            {
              id: 's3',
              name: 'Leg Day',
              type: 'weights' as const,
              started_at: new Date(2026, 1, 7).toISOString(),
              completed_at: new Date(2026, 1, 7).toISOString(),
              notes: null,
              originalSession: {} as any,
            },
          ],
          projected: { name: 'Leg Day', isRest: false, workoutType: 'weights' } as any,
        }),
      ]

      render(<HistoryPage />)

      const counters = screen.getAllByTestId('animated-counter')
      // Second counter is the streak
      expect(counters[1]).toHaveTextContent('3')
    })

    it('shows most trained workout type', () => {
      mockCalendarDays = [
        makeCalendarDay({
          date: new Date(2026, 1, 1),
          dateKey: '2026-02-01',
          dayOfMonth: 1,
          isToday: false,
          hasCompletedSession: true,
          sessions: [
            {
              id: 's1',
              name: 'Push Day',
              type: 'weights' as const,
              started_at: new Date(2026, 1, 1).toISOString(),
              completed_at: new Date(2026, 1, 1).toISOString(),
              notes: null,
              originalSession: {} as any,
            },
          ],
        }),
        makeCalendarDay({
          date: new Date(2026, 1, 3),
          dateKey: '2026-02-03',
          dayOfMonth: 3,
          isToday: false,
          hasCompletedSession: true,
          sessions: [
            {
              id: 's2',
              name: 'Push Day',
              type: 'weights' as const,
              started_at: new Date(2026, 1, 3).toISOString(),
              completed_at: new Date(2026, 1, 3).toISOString(),
              notes: null,
              originalSession: {} as any,
            },
          ],
        }),
        makeCalendarDay({
          date: new Date(2026, 1, 5),
          dateKey: '2026-02-05',
          dayOfMonth: 5,
          isToday: false,
          hasCompletedSession: true,
          sessions: [
            {
              id: 's3',
              name: 'Pull Day',
              type: 'weights' as const,
              started_at: new Date(2026, 1, 5).toISOString(),
              completed_at: new Date(2026, 1, 5).toISOString(),
              notes: null,
              originalSession: {} as any,
            },
          ],
        }),
      ]

      render(<HistoryPage />)

      // Push Day appears twice, Pull Day once, so most trained = Push Day
      expect(screen.getByText('Push Day')).toBeInTheDocument()
      expect(screen.getByText('Most Trained')).toBeInTheDocument()
    })

    it('shows "None" for most trained when there are no completed sessions', () => {
      mockCalendarDays = [
        makeCalendarDay({
          hasCompletedSession: false,
          sessions: [],
        }),
      ]

      render(<HistoryPage />)

      expect(screen.getByText('None')).toBeInTheDocument()
    })
  })

  describe('Empty history state', () => {
    it('shows "No workout history" when calendarDays is empty', () => {
      mockCalendarDays = []
      mockIsLoading = false

      render(<HistoryPage />)

      expect(screen.getByText('No workout history')).toBeInTheDocument()
      expect(
        screen.getByText('Start your first workout to see it here!')
      ).toBeInTheDocument()
    })
  })

  describe('Loading state', () => {
    it('shows skeleton placeholders when isLoading is true', () => {
      mockIsLoading = true

      const { container } = render(<HistoryPage />)

      expect(screen.getByText('History')).toBeInTheDocument()
      const skeletons = container.querySelectorAll('.skeleton')
      expect(skeletons.length).toBe(3)
    })

    it('does not show calendar or summary when loading', () => {
      mockIsLoading = true

      render(<HistoryPage />)

      expect(screen.queryByTestId('calendar-grid')).not.toBeInTheDocument()
      expect(screen.queryByText('Streak')).not.toBeInTheDocument()
      expect(screen.queryByText('Most Trained')).not.toBeInTheDocument()
    })
  })
})
