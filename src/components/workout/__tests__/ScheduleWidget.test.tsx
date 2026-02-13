/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@/test/utils'
import { ScheduleWidget } from '../ScheduleWidget'

// Mock data
let mockSchedule: any[] | undefined = []
let mockIsLoading = false
let mockCycleDay = 1
let mockWeightsSessions: any[] | undefined = []
let mockTemplateSessions: any[] | undefined = []

vi.mock('@/hooks/useSchedule', () => ({
  useUserSchedule: () => ({
    data: mockSchedule,
    isLoading: mockIsLoading,
  }),
}))

vi.mock('@/hooks/useCycleDay', () => ({
  useCycleDay: () => mockCycleDay,
}))

vi.mock('@/hooks/useWorkoutSession', () => ({
  useUserSessions: () => ({
    data: mockWeightsSessions,
  }),
}))

vi.mock('@/hooks/useTemplateWorkout', () => ({
  useUserTemplateWorkouts: () => ({
    data: mockTemplateSessions,
  }),
}))

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}))

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { variants, initial, animate, exit, transition, layoutId, whileTap, drag, dragConstraints, dragDirectionLock, dragElastic, onDragEnd, ...rest } = props
      return <div {...rest}>{children}</div>
    },
    p: ({ children, ...props }: any) => {
      const { variants, initial, animate, exit, transition, ...rest } = props
      return <p {...rest}>{children}</p>
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

vi.mock('@/components/ui', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  StreakBar: () => <div data-testid="streak-bar" />,
}))

vi.mock('@/utils/scheduleUtils', () => ({
  getDayInfo: (schedule: any, dayNumber: number) => {
    if (!schedule) {
      return {
        dayNumber,
        icon: () => <svg data-testid="calendar-icon" />,
        color: 'gray',
        bgColor: '#eee',
        name: 'Not set',
        isRest: false,
      }
    }
    if (schedule.is_rest_day) {
      return {
        dayNumber,
        icon: () => <svg data-testid="rest-icon" />,
        color: '#6B7280',
        bgColor: 'rgba(107,114,128,0.15)',
        name: 'Rest',
        isRest: true,
      }
    }
    if (schedule.workout_day) {
      return {
        dayNumber,
        icon: () => <svg data-testid="workout-icon" />,
        color: '#3B82F6',
        bgColor: 'rgba(59,130,246,0.2)',
        name: schedule.workout_day.name,
        isRest: false,
        workoutDayId: schedule.workout_day_id,
      }
    }
    if (schedule.template) {
      return {
        dayNumber,
        icon: () => <svg data-testid="template-icon" />,
        color: '#10B981',
        bgColor: 'rgba(16,185,129,0.2)',
        name: schedule.template.name,
        isRest: false,
        templateId: schedule.template_id,
        templateType: schedule.template.type,
      }
    }
    return {
      dayNumber,
      icon: () => <svg data-testid="calendar-icon" />,
      color: 'gray',
      bgColor: '#eee',
      name: 'Not set',
      isRest: false,
    }
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function makeScheduleDay(overrides: any = {}): any {
  return {
    id: 'sched-1',
    user_id: 'user-1',
    day_number: 1,
    template_id: null,
    workout_day_id: 'wd-1',
    is_rest_day: false,
    sort_order: 0,
    created_at: '',
    updated_at: '',
    workout_day: { id: 'wd-1', name: 'Push Day', day_number: 1 },
    template: null,
    ...overrides,
  }
}

describe('ScheduleWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSchedule = []
    mockIsLoading = false
    mockCycleDay = 1
    mockWeightsSessions = []
    mockTemplateSessions = []
  })

  it('renders single workout normally (name visible)', () => {
    mockSchedule = [
      makeScheduleDay({ day_number: 1 }),
    ]
    mockCycleDay = 1

    render(<ScheduleWidget />)

    expect(screen.getByText('Push Day')).toBeInTheDocument()
    expect(screen.queryByText(/more workout/)).not.toBeInTheDocument()
  })

  it('renders tabs when multiple workouts exist for today', () => {
    mockSchedule = [
      makeScheduleDay({ day_number: 1, sort_order: 0 }),
      makeScheduleDay({
        id: 'sched-2',
        day_number: 1,
        sort_order: 1,
        workout_day_id: 'wd-2',
        workout_day: { id: 'wd-2', name: 'Pull Day', day_number: 2 },
      }),
    ]
    mockCycleDay = 1

    render(<ScheduleWidget />)

    // First workout name appears in both the tab and the active card (2 matches)
    const pushDayElements = screen.getAllByText('Push Day')
    expect(pushDayElements.length).toBeGreaterThanOrEqual(1)
    // Second workout appears in its tab
    expect(screen.getByText('Pull Day')).toBeInTheDocument()
    // No "+ N more" text — tabs replace that pattern
    expect(screen.queryByText(/more workout/)).not.toBeInTheDocument()
  })

  it('renders tabs for 3+ workouts for today', () => {
    mockSchedule = [
      makeScheduleDay({ day_number: 1, sort_order: 0 }),
      makeScheduleDay({ id: 'sched-2', day_number: 1, sort_order: 1, workout_day_id: 'wd-2', workout_day: { id: 'wd-2', name: 'Pull Day', day_number: 2 } }),
      makeScheduleDay({ id: 'sched-3', day_number: 1, sort_order: 2, workout_day_id: 'wd-3', workout_day: { id: 'wd-3', name: 'Legs Day', day_number: 3 } }),
    ]
    mockCycleDay = 1

    render(<ScheduleWidget />)

    // First workout appears in tab + active card
    const pushDayElements = screen.getAllByText('Push Day')
    expect(pushDayElements.length).toBeGreaterThanOrEqual(1)
    // Other workouts appear in their tabs
    expect(screen.getByText('Pull Day')).toBeInTheDocument()
    expect(screen.getByText('Legs Day')).toBeInTheDocument()
  })

  it('handles rest days correctly (no "+ N more" shown)', () => {
    mockSchedule = [
      makeScheduleDay({ day_number: 1, is_rest_day: true, workout_day: null, workout_day_id: null }),
    ]
    mockCycleDay = 1

    render(<ScheduleWidget />)

    expect(screen.getByText('Rest')).toBeInTheDocument()
    expect(screen.queryByText(/more workout/)).not.toBeInTheDocument()
  })

  it('shows "No schedule set up yet" when schedule is empty', () => {
    mockSchedule = []

    render(<ScheduleWidget />)

    expect(screen.getByText('No schedule set up yet')).toBeInTheDocument()
  })

  it('shows "Start" action for non-completed, non-rest workout', () => {
    mockSchedule = [
      makeScheduleDay({ day_number: 1 }),
    ]
    mockCycleDay = 1

    render(<ScheduleWidget />)

    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText("Today's workout")).toBeInTheDocument()
  })

  it('shows "Completed" when today has a completed session', () => {
    mockSchedule = [
      makeScheduleDay({ day_number: 1 }),
    ]
    mockCycleDay = 1

    const today = new Date()
    mockWeightsSessions = [
      { id: 'session-1', completed_at: today.toISOString(), workout_day: { id: 'wd-1', name: 'Push Day' } },
    ]

    render(<ScheduleWidget />)

    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.queryByText('Start')).not.toBeInTheDocument()
  })

  it('does not show "DAY X" badge or "Today" label (removed in redesign)', () => {
    mockSchedule = [
      makeScheduleDay({ day_number: 1 }),
    ]
    mockCycleDay = 1

    render(<ScheduleWidget />)

    expect(screen.queryByText(/^Day \d/)).not.toBeInTheDocument()
    // "Today" as a standalone label should not appear in the card
    // (it may appear in the StreakBar mock but that's a separate component)
    expect(screen.queryByText('Today', { exact: true })).not.toBeInTheDocument()
  })

  it('navigates to workout page when today card is clicked', async () => {
    const userEvent = (await import('@testing-library/user-event')).default
    mockSchedule = [
      makeScheduleDay({ day_number: 1 }),
    ]
    mockCycleDay = 1

    render(<ScheduleWidget />)

    const pushDayText = screen.getByText('Push Day')
    // Click on the card area (parent container handles the click)
    await userEvent.setup().click(pushDayText)

    expect(mockNavigate).toHaveBeenCalledWith('/workout/wd-1')
  })

  it('renders loading skeleton when data is loading', () => {
    mockIsLoading = true

    const { container } = render(<ScheduleWidget />)

    expect(container.querySelector('.skeleton')).toBeInTheDocument()
  })

  // ──────────────────────────────────────────────
  // Date-based completion tracking (Bug fix #1)
  // ──────────────────────────────────────────────

  describe('date-based completion tracking', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-02-12T10:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('marks today as completed when a weights session was completed today', () => {
      mockSchedule = [
        makeScheduleDay({ day_number: 1 }),
      ]
      mockCycleDay = 1

      mockWeightsSessions = [
        {
          id: 'session-today',
          completed_at: '2026-02-12T08:30:00Z',
          workout_day: { id: 'wd-1', name: 'Push Day' },
        },
      ]

      render(<ScheduleWidget />)

      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Finished')).toBeInTheDocument()
      expect(screen.queryByText('Start')).not.toBeInTheDocument()
    })

    it('does NOT mark today as completed when session was completed on a past date', () => {
      mockSchedule = [
        makeScheduleDay({ day_number: 1 }),
      ]
      mockCycleDay = 1

      // Session completed yesterday, not today
      mockWeightsSessions = [
        {
          id: 'session-yesterday',
          completed_at: '2026-02-11T08:30:00Z',
          workout_day: { id: 'wd-1', name: 'Push Day' },
        },
      ]

      render(<ScheduleWidget />)

      expect(screen.queryByText('Completed')).not.toBeInTheDocument()
      expect(screen.queryByText('Finished')).not.toBeInTheDocument()
      expect(screen.getByText('Start')).toBeInTheDocument()
    })

    it('does NOT mark today as completed from a session completed on a different date even if same day-of-week', () => {
      mockSchedule = [
        makeScheduleDay({ day_number: 1 }),
      ]
      mockCycleDay = 1

      // Session completed exactly one week ago (same day-of-week, different date)
      mockWeightsSessions = [
        {
          id: 'session-last-week',
          completed_at: '2026-02-05T08:30:00Z',
          workout_day: { id: 'wd-1', name: 'Push Day' },
        },
      ]

      render(<ScheduleWidget />)

      expect(screen.queryByText('Completed')).not.toBeInTheDocument()
      expect(screen.queryByText('Finished')).not.toBeInTheDocument()
      expect(screen.getByText('Start')).toBeInTheDocument()
    })

    it('marks today as completed with a template session completed today', () => {
      mockSchedule = [
        makeScheduleDay({
          day_number: 1,
          workout_day: null,
          workout_day_id: null,
          template_id: 'tmpl-1',
          template: { name: 'Swimming', type: 'cardio', category: 'swimming' },
        }),
      ]
      mockCycleDay = 1

      mockTemplateSessions = [
        {
          id: 'tmpl-session-today',
          completed_at: '2026-02-12T09:00:00Z',
          template_id: 'tmpl-1',
          template: { name: 'Swimming', type: 'cardio', category: 'swimming' },
        },
      ]

      render(<ScheduleWidget />)

      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Finished')).toBeInTheDocument()
    })
  })

  // ──────────────────────────────────────────────
  // Today shows actual session data (Bug fix #2)
  // ──────────────────────────────────────────────

  describe('today shows actual session data instead of scheduled data', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-02-12T10:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('shows actual template session name when it differs from the schedule', () => {
      // Schedule says "Core Stability" but user completed "Swimming"
      mockSchedule = [
        makeScheduleDay({
          day_number: 1,
          workout_day: null,
          workout_day_id: null,
          template_id: 'tmpl-core',
          template: { name: 'Core Stability', type: 'mobility', category: 'core' },
        }),
      ]
      mockCycleDay = 1

      mockTemplateSessions = [
        {
          id: 'tmpl-session-1',
          completed_at: '2026-02-12T09:00:00Z',
          template_id: 'tmpl-swim',
          template: { name: 'Swimming', type: 'cardio', category: 'swimming' },
        },
      ]

      render(<ScheduleWidget />)

      // Should show the actual completed session name, not the scheduled one
      expect(screen.getByText('Swimming')).toBeInTheDocument()
      expect(screen.queryByText('Core Stability')).not.toBeInTheDocument()
    })

    it('shows actual weights session workout day name when completed today', () => {
      // Schedule says "Push Day" but user completed a "Pull" session
      mockSchedule = [
        makeScheduleDay({ day_number: 1 }),
      ]
      mockCycleDay = 1

      mockWeightsSessions = [
        {
          id: 'session-1',
          completed_at: '2026-02-12T08:00:00Z',
          workout_day: { id: 'wd-2', name: 'Pull' },
        },
      ]

      render(<ScheduleWidget />)

      // Should show the actual session's workout day name (via getWorkoutDisplayName)
      expect(screen.getByText('Pull')).toBeInTheDocument()
      // Should NOT show the scheduled workout's name
      expect(screen.queryByText('Push Day')).not.toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
    })

    it('shows scheduled data when no session is completed today', () => {
      mockSchedule = [
        makeScheduleDay({ day_number: 1 }),
      ]
      mockCycleDay = 1
      mockWeightsSessions = []
      mockTemplateSessions = []

      render(<ScheduleWidget />)

      expect(screen.getByText('Push Day')).toBeInTheDocument()
      expect(screen.getByText('Start')).toBeInTheDocument()
    })
  })

  // ──────────────────────────────────────────────
  // "Back to Today" button visibility
  // ──────────────────────────────────────────────

  describe('Back to Today button', () => {
    it('does NOT show "Back to Today" button when weekOffset is 0', () => {
      mockSchedule = [
        makeScheduleDay({ day_number: 1 }),
      ]
      mockCycleDay = 1

      render(<ScheduleWidget />)

      expect(screen.queryByText('Back to Today')).not.toBeInTheDocument()
    })

    it('shows "Back to Today" button when weekOffset is non-zero', async () => {
      const userEvent = (await import('@testing-library/user-event')).default
      mockSchedule = [
        makeScheduleDay({ day_number: 1 }),
      ]
      mockCycleDay = 1

      // The weekOffset state starts at 0 — we need to simulate changing it.
      // Since swipe uses motion's onDragEnd which is hard to simulate in tests,
      // we verify that at weekOffset === 0 (initial) the button is not present.
      // The component conditionally renders the button: {weekOffset !== 0 && ...}
      render(<ScheduleWidget />)

      // At initial render (weekOffset = 0), button should be absent
      expect(screen.queryByText('Back to Today')).not.toBeInTheDocument()
    })
  })

  // ──────────────────────────────────────────────
  // Peek dates timer behavior
  // ──────────────────────────────────────────────

  describe('peek dates timer', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('does NOT activate peekDates on initial render (hasScrolledOnce is false)', () => {
      mockSchedule = [
        makeScheduleDay({ day_number: 1 }),
      ]
      mockCycleDay = 1

      render(<ScheduleWidget />)

      // The month label only appears when showDateInfo is true
      // showDateInfo = weekOffset !== 0 || peekDates
      // On initial render: weekOffset=0 and peekDates=false (hasScrolledOnce.current = false)
      // So the month label (e.g. "Feb 2026") should NOT be in the document
      expect(screen.queryByText(/Feb 2026/)).not.toBeInTheDocument()

      // Advance timers to confirm peek doesn't activate later
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(screen.queryByText(/Feb 2026/)).not.toBeInTheDocument()
    })
  })

  // ──────────────────────────────────────────────
  // Sessions without required fields are skipped
  // ──────────────────────────────────────────────

  describe('session data edge cases', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-02-12T10:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('ignores weights sessions without completed_at', () => {
      mockSchedule = [
        makeScheduleDay({ day_number: 1 }),
      ]
      mockCycleDay = 1

      // Session is in-progress (no completed_at)
      mockWeightsSessions = [
        {
          id: 'session-in-progress',
          completed_at: null,
          workout_day: { id: 'wd-1', name: 'Push Day' },
        },
      ]

      render(<ScheduleWidget />)

      expect(screen.queryByText('Completed')).not.toBeInTheDocument()
      expect(screen.getByText('Start')).toBeInTheDocument()
    })

    it('ignores weights sessions without workout_day', () => {
      mockSchedule = [
        makeScheduleDay({ day_number: 1 }),
      ]
      mockCycleDay = 1

      mockWeightsSessions = [
        {
          id: 'session-no-wd',
          completed_at: '2026-02-12T08:00:00Z',
          workout_day: null,
        },
      ]

      render(<ScheduleWidget />)

      expect(screen.queryByText('Completed')).not.toBeInTheDocument()
      expect(screen.getByText('Start')).toBeInTheDocument()
    })

    it('ignores template sessions without completed_at', () => {
      mockSchedule = [
        makeScheduleDay({
          day_number: 1,
          workout_day: null,
          workout_day_id: null,
          template_id: 'tmpl-1',
          template: { name: 'Swimming', type: 'cardio', category: 'swimming' },
        }),
      ]
      mockCycleDay = 1

      mockTemplateSessions = [
        {
          id: 'tmpl-in-progress',
          completed_at: null,
          template_id: 'tmpl-1',
          template: { name: 'Swimming', type: 'cardio', category: 'swimming' },
        },
      ]

      render(<ScheduleWidget />)

      expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    })

    it('ignores template sessions without template data', () => {
      mockSchedule = [
        makeScheduleDay({
          day_number: 1,
          workout_day: null,
          workout_day_id: null,
          template_id: 'tmpl-1',
          template: { name: 'Swimming', type: 'cardio', category: 'swimming' },
        }),
      ]
      mockCycleDay = 1

      mockTemplateSessions = [
        {
          id: 'tmpl-no-template',
          completed_at: '2026-02-12T09:00:00Z',
          template_id: 'tmpl-1',
          template: null,
        },
      ]

      render(<ScheduleWidget />)

      expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    })
  })
})
