import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { StatsGrid } from '../StatsGrid'
import type { CalendarDay } from '@/hooks/useCalendarData'
import type { UnifiedSession } from '@/utils/calendarGrid'

// Mock framer-motion
vi.mock('motion/react', () => ({
  motion: {
    div: (props: any) => {
      const { initial, animate, exit, variants, whileHover, whileTap, layout, layoutId, transition, ...rest } = props
      return createElement('div', rest)
    },
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock useReducedMotion
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}))

// Mock AnimatedCounter to just render the value
vi.mock('@/components/ui', () => ({
  AnimatedCounter: ({ value, className }: { value: number; className?: string }) =>
    createElement('span', { className, 'data-testid': `counter-${value}` }, String(value)),
}))

// Mock animation config
vi.mock('@/config/animationConfig', () => ({
  staggerContainer: { hidden: {}, visible: {} },
  staggerChild: { hidden: {}, visible: {} },
}))

// Mock workoutConfig
vi.mock('@/config/workoutConfig', () => ({
  CATEGORY_DEFAULTS: {
    weights: { color: '#6366F1', bgColor: 'rgba(99,102,241,0.15)', gradient: '', icon: 'div' },
    cardio: { color: '#14B8A6', bgColor: 'rgba(20,184,166,0.15)', gradient: '', icon: 'div' },
    mobility: { color: '#10B981', bgColor: 'rgba(16,185,129,0.15)', gradient: '', icon: 'div' },
  },
}))

function createCalendarDay(overrides: Partial<CalendarDay> = {}): CalendarDay {
  const date = overrides.date ?? new Date()
  return {
    date,
    dateKey: date.toISOString().split('T')[0],
    dayOfMonth: date.getDate(),
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

function createUnifiedSession(overrides: Partial<UnifiedSession> = {}): UnifiedSession {
  return {
    id: 'session-1',
    type: 'weights',
    category: 'push',
    name: 'Push',
    started_at: '2025-01-15T10:00:00Z',
    completed_at: '2025-01-15T11:00:00Z',
    notes: null,
    originalSession: {} as any,
    ...overrides,
  }
}

describe('StatsGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders without crashing with empty data', () => {
      render(<StatsGrid calendarDays={[]} allSessions={[]} />)
      // Should render the grid container
      expect(screen.getByText('Completion')).toBeInTheDocument()
    })

    it('renders all stat widget labels', () => {
      render(<StatsGrid calendarDays={[]} allSessions={[]} />)
      expect(screen.getByText('Completion')).toBeInTheDocument()
      expect(screen.getByText('This Week')).toBeInTheDocument()
      expect(screen.getByText('Weekly Frequency')).toBeInTheDocument()
      expect(screen.getByText('Total Time')).toBeInTheDocument()
      expect(screen.getByText('Workout Mix')).toBeInTheDocument()
      expect(screen.getByText('Sessions')).toBeInTheDocument()
      expect(screen.getByText('Active Days')).toBeInTheDocument()
      expect(screen.getByText('Per Week')).toBeInTheDocument()
      expect(screen.getByText('Longest')).toBeInTheDocument()
    })

    it('renders day-of-week labels for frequency chart', () => {
      render(<StatsGrid calendarDays={[]} allSessions={[]} />)
      const labels = screen.getAllByText('S')
      expect(labels.length).toBeGreaterThanOrEqual(2) // S for Sunday and Saturday
      expect(screen.getByText('M')).toBeInTheDocument()
      expect(screen.getByText('W')).toBeInTheDocument()
      expect(screen.getByText('F')).toBeInTheDocument()
    })
  })

  describe('completion rate', () => {
    it('shows 0 completion rate with no scheduled days', () => {
      render(<StatsGrid calendarDays={[]} allSessions={[]} />)
      // Multiple counters show 0 - use getAllBy
      const zeroes = screen.getAllByTestId('counter-0')
      expect(zeroes.length).toBeGreaterThan(0)
    })

    it('computes completion rate from scheduled and completed days', () => {
      const days = [
        createCalendarDay({
          isCurrentMonth: true,
          isFuture: false,
          hasCompletedSession: true,
          projected: { name: 'Push', isRest: false } as any,
        }),
        createCalendarDay({
          date: new Date(2025, 0, 2),
          isCurrentMonth: true,
          isFuture: false,
          hasCompletedSession: false,
          projected: { name: 'Pull', isRest: false } as any,
        }),
      ]

      render(<StatsGrid calendarDays={days} allSessions={[]} />)
      // 1 completed / 2 scheduled = 50%
      expect(screen.getByTestId('counter-50')).toBeInTheDocument()
    })
  })

  describe('sessions and time calculations', () => {
    it('counts completed sessions this month', () => {
      const session: UnifiedSession = createUnifiedSession({
        completed_at: '2025-01-15T11:30:00Z',
        duration_minutes: 45,
      })
      const days = [
        createCalendarDay({
          isCurrentMonth: true,
          isFuture: false,
          hasCompletedSession: true,
          sessions: [session],
        }),
      ]

      render(<StatsGrid calendarDays={days} allSessions={[session]} />)
      // Should show 1 for sessions and active days counters
      const ones = screen.getAllByTestId('counter-1')
      expect(ones.length).toBeGreaterThanOrEqual(1)
    })

    it('computes total time from sessions', () => {
      const session: UnifiedSession = createUnifiedSession({
        duration_minutes: 90,
        completed_at: '2025-01-15T11:30:00Z',
      })
      const days = [
        createCalendarDay({
          isCurrentMonth: true,
          isFuture: false,
          hasCompletedSession: true,
          sessions: [session],
        }),
      ]

      render(<StatsGrid calendarDays={days} allSessions={[session]} />)
      // 90 minutes = 1 hour 30 minutes
      const ones = screen.getAllByTestId('counter-1')
      expect(ones.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByTestId('counter-30')).toBeInTheDocument()
    })

    it('shows 0 time when no sessions', () => {
      render(<StatsGrid calendarDays={[]} allSessions={[]} />)
      const zeroes = screen.getAllByTestId('counter-0')
      expect(zeroes.length).toBeGreaterThan(0)
    })
  })

  describe('workout mix', () => {
    it('renders workout mix legend labels', () => {
      render(<StatsGrid calendarDays={[]} allSessions={[]} />)
      // The percentages should be 0%
      const zeroPercents = screen.getAllByText('0%')
      expect(zeroPercents.length).toBe(3) // weights, cardio, mobility
    })

    it('computes workout mix percentages', () => {
      const weightsSession = createUnifiedSession({ type: 'weights', completed_at: '2025-01-15T11:00:00Z' })
      const cardioSession = createUnifiedSession({ id: '2', type: 'cardio', completed_at: '2025-01-16T11:00:00Z' })
      const mobilitySession = createUnifiedSession({ id: '3', type: 'mobility', completed_at: '2025-01-17T11:00:00Z' })

      const days = [
        createCalendarDay({
          isCurrentMonth: true,
          isFuture: false,
          hasCompletedSession: true,
          sessions: [weightsSession],
        }),
        createCalendarDay({
          date: new Date(2025, 0, 16),
          isCurrentMonth: true,
          isFuture: false,
          hasCompletedSession: true,
          sessions: [cardioSession],
        }),
        createCalendarDay({
          date: new Date(2025, 0, 17),
          isCurrentMonth: true,
          isFuture: false,
          hasCompletedSession: true,
          sessions: [mobilitySession],
        }),
      ]

      render(<StatsGrid calendarDays={days} allSessions={[weightsSession, cardioSession, mobilitySession]} />)
      // Each type is 33% (1/3 each)
      const thirtyThrees = screen.getAllByText('33%')
      expect(thirtyThrees.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('streak', () => {
    it('renders best streak text', () => {
      render(<StatsGrid calendarDays={[]} allSessions={[]} />)
      expect(screen.getByText(/Best:/)).toBeInTheDocument()
    })

    it('shows 0 streak when no completed sessions', () => {
      render(<StatsGrid calendarDays={[]} allSessions={[]} />)
      expect(screen.getByText('Best: 0')).toBeInTheDocument()
    })
  })

  describe('active days', () => {
    it('counts unique active days', () => {
      const days = [
        createCalendarDay({
          isCurrentMonth: true,
          isFuture: false,
          hasCompletedSession: true,
        }),
        createCalendarDay({
          date: new Date(2025, 0, 2),
          isCurrentMonth: true,
          isFuture: false,
          hasCompletedSession: true,
        }),
        createCalendarDay({
          date: new Date(2025, 0, 3),
          isCurrentMonth: true,
          isFuture: false,
          hasCompletedSession: false,
        }),
      ]

      render(<StatsGrid calendarDays={days} allSessions={[]} />)
      // 2 active days - there may be multiple counters with value 2
      const twos = screen.getAllByTestId('counter-2')
      expect(twos.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('widget info toggle', () => {
    it('shows info button on each widget', () => {
      const { container } = render(<StatsGrid calendarDays={[]} allSessions={[]} />)
      // Each widget has an info button (9 widgets total for the 3x4 grid)
      const infoButtons = container.querySelectorAll('button')
      expect(infoButtons.length).toBeGreaterThanOrEqual(9)
    })

    it('flips to show info text when info button is clicked', () => {
      render(<StatsGrid calendarDays={[]} allSessions={[]} />)
      // Click the first info button
      const infoButtons = screen.getAllByRole('button')
      fireEvent.click(infoButtons[0])
      // Should show the info text for completion rate
      expect(screen.getByText('% of scheduled workouts done this month')).toBeInTheDocument()
    })

    it('flips back when clicking on the info overlay', () => {
      render(<StatsGrid calendarDays={[]} allSessions={[]} />)
      const infoButtons = screen.getAllByRole('button')
      fireEvent.click(infoButtons[0])
      // Info text should be visible
      expect(screen.getByText('% of scheduled workouts done this month')).toBeInTheDocument()

      // Click on the widget overlay to flip back
      const overlay = screen.getByText('% of scheduled workouts done this month').closest('[class*="rounded-xl"]')
      if (overlay) fireEvent.click(overlay)
      // Info text should be gone
      expect(screen.queryByText('% of scheduled workouts done this month')).not.toBeInTheDocument()
    })
  })

  describe('per week calculation', () => {
    it('shows 0 per week with no past days', () => {
      render(<StatsGrid calendarDays={[]} allSessions={[]} />)
      // Per week is rendered as text "0" (not AnimatedCounter)
      const perWeekTexts = screen.getAllByText('0')
      expect(perWeekTexts.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('grid layout', () => {
    it('has a 3-column grid', () => {
      const { container } = render(<StatsGrid calendarDays={[]} allSessions={[]} />)
      const grid = container.querySelector('.grid.grid-cols-3')
      expect(grid).toBeInTheDocument()
    })

    it('has double-width widgets for frequency and mix', () => {
      const { container } = render(<StatsGrid calendarDays={[]} allSessions={[]} />)
      const doubleWidgets = container.querySelectorAll('.col-span-2')
      expect(doubleWidgets).toHaveLength(2)
    })
  })
})
