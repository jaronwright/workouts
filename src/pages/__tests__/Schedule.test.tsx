/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import { SchedulePage } from '../Schedule'

let mockSchedule: Record<string, unknown>[] | undefined = []
let mockIsLoading = false

vi.mock('@/hooks/useSchedule', () => ({
  useUserSchedule: () => ({
    data: mockSchedule,
    isLoading: mockIsLoading,
  }),
}))

vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({
    data: {
      id: 'user-123',
      display_name: 'Test User',
      gender: null,
      avatar_url: null,
      selected_plan_id: '00000000-0000-0000-0000-000000000001',
      cycle_start_date: '2024-01-01',
      timezone: 'America/Chicago',
      created_at: '',
      updated_at: '',
    },
    isLoading: false,
  }),
  useUpdateProfile: () => ({
    mutate: vi.fn(),
  }),
}))

vi.mock('@/hooks/useCycleDay', () => ({
  useCycleDay: () => 3,
}))

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}))

vi.mock('@/utils/cycleDay', () => ({
  formatCycleStartDate: () => 'Jan 1, 2024',
}))

vi.mock('@/config/workoutConfig', () => ({
  getWorkoutDisplayName: (name: string) => name || 'Workout',
  getWeightsStyleByName: () => ({
    icon: () => null,
    color: '#000',
    bgColor: '#ccc',
  }),
  getCardioStyle: () => ({
    icon: () => null,
    color: '#000',
    bgColor: '#ccc',
    gradient: 'from-blue-500 to-blue-600',
  }),
  getMobilityStyle: () => ({
    icon: () => null,
    color: '#000',
    bgColor: '#ccc',
  }),
}))

vi.mock('@/config/animationConfig', () => ({
  staggerContainer: {},
  staggerChild: {},
  fadeInUp: {},
}))

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const {
        variants, initial, animate, exit, transition,
        layoutId, whileTap, ...validProps
      } = props
      return <div {...(validProps as Record<string, unknown>)}>{children as React.ReactNode}</div>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/layout', () => ({
  AppShell: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

vi.mock('@/components/schedule', () => ({
  ScheduleDayEditor: () => <div data-testid="schedule-day-editor" />,
}))

describe('SchedulePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSchedule = []
    mockIsLoading = false
  })

  it('shows loading skeleton when isLoading', () => {
    mockIsLoading = true
    const { container } = render(<SchedulePage />)

    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders 7 day rows when loaded', () => {
    mockSchedule = []
    mockIsLoading = false
    render(<SchedulePage />)

    // Each day number appears in both the pill selector and the day row
    // so we use getAllByText and check at least 1 exists
    for (let i = 1; i <= 7; i++) {
      const elements = screen.getAllByText(String(i))
      expect(elements.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('shows "Choose workout" for unset days', () => {
    mockSchedule = []
    mockIsLoading = false
    render(<SchedulePage />)

    // All 7 days have no workouts, so 7 "Choose workout" labels should appear
    const chooseButtons = screen.getAllByText('Choose workout')
    expect(chooseButtons.length).toBe(7)
  })

  it('shows current cycle day indicator', () => {
    mockSchedule = []
    mockIsLoading = false
    render(<SchedulePage />)

    // useCycleDay returns 3, so we expect "Day 3" to be highlighted
    expect(screen.getByText('Day 3')).toBeInTheDocument()
  })
})
