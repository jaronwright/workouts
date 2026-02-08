import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import { HistoryPage } from '../History'
import type { CalendarDay } from '@/hooks/useCalendarData'

let mockCalendarDays: CalendarDay[] = []
let mockIsLoading = false

vi.mock('@/hooks/useCalendarData', () => ({
  useCalendarData: () => ({
    calendarDays: mockCalendarDays,
    isLoading: mockIsLoading,
    today: new Date(),
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
  CalendarGrid: ({ calendarDays }: { calendarDays: CalendarDay[] }) => (
    <div data-testid="calendar-grid">{calendarDays.length} days</div>
  ),
  SelectedDayPanel: () => <div data-testid="selected-day-panel" />,
}))

vi.mock('@/components/ui', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BottomSheet: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
    isOpen ? <div data-testid="bottom-sheet">{children}</div> : null,
  AnimatedCounter: ({ value, className }: { value: number; className: string }) => (
    <span className={className}>{value}</span>
  ),
}))

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCalendarDays = []
    mockIsLoading = false
  })

  it('shows loading skeleton when isLoading', () => {
    mockIsLoading = true
    const { container } = render(<HistoryPage />)

    expect(screen.getByText('History')).toBeInTheDocument()
    expect(container.querySelector('.skeleton')).toBeInTheDocument()
  })

  it('shows empty state when no calendar days', () => {
    mockCalendarDays = []
    mockIsLoading = false
    render(<HistoryPage />)

    expect(screen.getByText('No workout history')).toBeInTheDocument()
    expect(screen.getByText('Start your first workout to see it here!')).toBeInTheDocument()
  })

  it('renders calendar grid and monthly summary when data available', () => {
    const today = new Date()
    mockCalendarDays = [
      {
        date: today,
        dateKey: '2024-01-15',
        dayOfMonth: 15,
        isCurrentMonth: true,
        isToday: true,
        isFuture: false,
        cycleDay: 1,
        projected: null,
        sessions: [
          {
            id: 's1',
            name: 'Push Day',
            type: 'weights' as const,
            completedAt: today.toISOString(),
            startedAt: today.toISOString(),
            durationMinutes: 45,
          },
        ],
        hasCompletedSession: true,
      },
    ]
    mockIsLoading = false

    render(<HistoryPage />)

    expect(screen.getByTestId('calendar-grid')).toBeInTheDocument()
    // Monthly summary stats should be visible
    expect(screen.getByText('Streak')).toBeInTheDocument()
    expect(screen.getByText('Most Trained')).toBeInTheDocument()
  })
})
