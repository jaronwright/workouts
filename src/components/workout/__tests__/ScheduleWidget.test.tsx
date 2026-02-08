/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
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
      const { variants, initial, animate, exit, transition, layoutId, whileTap, ...rest } = props
      return <div {...rest}>{children}</div>
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

  it('renders "+ N more" when multiple workouts exist for today', () => {
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

    // Should show the first workout's name
    expect(screen.getByText('Push Day')).toBeInTheDocument()
    // Should show "+ 1 more workout"
    expect(screen.getByText('+ 1 more workout')).toBeInTheDocument()
  })

  it('renders "+ N more workouts" (plural) when 3+ workouts for today', () => {
    mockSchedule = [
      makeScheduleDay({ day_number: 1, sort_order: 0 }),
      makeScheduleDay({ id: 'sched-2', day_number: 1, sort_order: 1, workout_day_id: 'wd-2', workout_day: { id: 'wd-2', name: 'Pull Day', day_number: 2 } }),
      makeScheduleDay({ id: 'sched-3', day_number: 1, sort_order: 2, workout_day_id: 'wd-3', workout_day: { id: 'wd-3', name: 'Legs Day', day_number: 3 } }),
    ]
    mockCycleDay = 1

    render(<ScheduleWidget />)

    expect(screen.getByText('Push Day')).toBeInTheDocument()
    expect(screen.getByText('+ 2 more workouts')).toBeInTheDocument()
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
})
