import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { HomePage } from '../Home'

// Track navigate calls
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// Configurable mock return values
let mockSessions: Record<string, unknown>[] = []
let mockTemplateSessions: Record<string, unknown>[] = []
let mockProfile: Record<string, unknown> | null = null
let mockProfileLoading = false
let mockSchedule: Record<string, unknown>[] = []
let mockDays: Record<string, unknown>[] = []
let mockCardioTemplates: Record<string, unknown>[] = []
let mockMobilityCategories: { category: string; template: Record<string, unknown> }[] = []
let mockActiveSession: Record<string, unknown> | null = null

vi.mock('@/hooks/useWorkoutSession', () => ({
  useActiveSession: () => ({ data: mockActiveSession }),
  useUserSessions: () => ({ data: mockSessions, isLoading: false }),
  useDeleteSession: () => ({ mutate: vi.fn() }),
}))

vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({ data: mockProfile, isLoading: mockProfileLoading }),
  useUpdateProfile: () => ({ mutateAsync: vi.fn() }),
}))

vi.mock('@/hooks/useCycleDay', () => ({
  useCycleDay: () => 1,
}))

vi.mock('@/hooks/useAvatar', () => ({
  useAvatarUrl: () => null,
}))

vi.mock('@/hooks/useWorkoutPlan', () => ({
  useSelectedPlanDays: () => ({ data: mockDays, isLoading: false }),
}))

vi.mock('@/hooks/useSchedule', () => ({
  useWorkoutTemplatesByType: (type: string) => {
    if (type === 'cardio') return { data: mockCardioTemplates, isLoading: false }
    return { data: [], isLoading: false }
  },
  useUserSchedule: () => ({ data: mockSchedule, isLoading: false }),
}))

vi.mock('@/hooks/useMobilityTemplates', () => ({
  useMobilityCategories: () => ({ data: mockMobilityCategories, isLoading: false }),
}))

vi.mock('@/hooks/useTemplateWorkout', () => ({
  useUserTemplateWorkouts: () => ({ data: mockTemplateSessions }),
}))

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }),
}))

vi.mock('@/config/animationConfig', () => ({
  staggerContainer: {},
  staggerChild: {},
}))

vi.mock('motion/react', () => {
  const { forwardRef } = require('react')
  const motionValueMock = (initial: number) => ({
    get: () => initial,
    set: vi.fn(),
    on: () => vi.fn(),
  })
  return {
    motion: new Proxy({}, {
      get: (_target: unknown, prop: string) => {
        return forwardRef((props: Record<string, unknown>, ref: unknown) => {
          const { children, variants, initial, animate, exit, transition, whileTap, whileHover, ...rest } = props as Record<string, unknown>
          const Tag = prop as string
          return <Tag ref={ref} {...rest}>{children as React.ReactNode}</Tag>
        })
      },
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useMotionValue: motionValueMock,
    useSpring: (mv: unknown) => mv,
    useTransform: (mv: unknown) => ({ get: () => 0, on: () => vi.fn() }),
  }
})

vi.mock('@/components/workout', () => ({
  CardioLogCard: () => <div data-testid="cardio-log-card" />,
  ScheduleWidget: () => <div data-testid="schedule-widget" />,
}))

vi.mock('@/components/weather', () => ({
  WeatherCard: () => <div data-testid="weather-card" />,
}))

vi.mock('@/components/onboarding', () => ({
  OnboardingWizard: () => null,
}))

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessions = []
    mockTemplateSessions = []
    mockProfile = {
      id: 'user-123',
      display_name: 'Jaron',
      gender: null,
      avatar_url: null,
      selected_plan_id: '00000000-0000-0000-0000-000000000001',
      cycle_start_date: '2024-01-01',
      timezone: 'America/Chicago',
      created_at: '',
      updated_at: '',
    }
    mockProfileLoading = false
    mockSchedule = [{ id: 's1', day_number: 1 }]
    mockDays = []
    mockCardioTemplates = []
    mockMobilityCategories = []
    mockActiveSession = null
  })

  describe('Header', () => {
    it('renders avatar button in header that navigates to profile', async () => {
      const userEvent = (await import('@testing-library/user-event')).default
      render(<HomePage />)
      const profileButton = screen.getByRole('button', { name: /profile/i })
      expect(profileButton).toBeInTheDocument()
      await userEvent.click(profileButton)
      expect(mockNavigate).toHaveBeenCalledWith('/profile')
    })
  })

  describe('Quick Stats with merged sessions', () => {
    it('counts weights-only sessions in total', () => {
      mockSessions = [
        { id: '1', completed_at: new Date().toISOString(), started_at: new Date().toISOString(), workout_day: null },
        { id: '2', completed_at: new Date().toISOString(), started_at: new Date().toISOString(), workout_day: null },
      ]
      render(<HomePage />)
      // Total should show "2"
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('counts template sessions in total', () => {
      mockTemplateSessions = [
        { id: 't1', completed_at: new Date().toISOString(), started_at: new Date().toISOString(), template: { name: 'Running' } },
        { id: 't2', completed_at: new Date().toISOString(), started_at: new Date().toISOString(), template: { name: 'Swimming' } },
      ]
      render(<HomePage />)
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('merges weights + template sessions in total count', () => {
      mockSessions = [
        { id: '1', completed_at: new Date().toISOString(), started_at: new Date().toISOString(), workout_day: null },
      ]
      mockTemplateSessions = [
        { id: 't1', completed_at: new Date().toISOString(), started_at: new Date().toISOString(), template: { name: 'Running' } },
      ]
      render(<HomePage />)
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('shows zero stats when no sessions', () => {
      render(<HomePage />)
      const zeros = screen.getAllByText('0')
      // Streak, This Week, and Total should all be 0
      expect(zeros.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Recent Activity', () => {
    it('shows weights sessions in recent activity', () => {
      mockSessions = [
        {
          id: 'w1',
          completed_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          workout_day: { name: 'Push (Chest, Shoulders, Triceps)' },
        },
      ]
      render(<HomePage />)
      expect(screen.getByText('Push')).toBeInTheDocument()
    })

    it('shows template sessions in recent activity', () => {
      mockTemplateSessions = [
        {
          id: 't1',
          completed_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          template: { name: 'Morning Run' },
        },
      ]
      render(<HomePage />)
      expect(screen.getByText('Morning Run')).toBeInTheDocument()
    })

    it('sorts mixed sessions by most recent first', () => {
      const now = Date.now()
      mockSessions = [
        {
          id: 'w1',
          completed_at: new Date(now - 60000).toISOString(),
          started_at: new Date(now - 120000).toISOString(),
          workout_day: { name: 'Push (Chest, Shoulders, Triceps)' },
        },
      ]
      mockTemplateSessions = [
        {
          id: 't1',
          completed_at: new Date(now).toISOString(),
          started_at: new Date(now - 30000).toISOString(),
          template: { name: 'Morning Run' },
        },
      ]
      render(<HomePage />)
      const items = screen.getAllByText(/Push|Morning Run/)
      // Morning Run (more recent) should appear before Push
      expect(items[0].textContent).toBe('Morning Run')
      expect(items[1].textContent).toBe('Push')
    })

    it('limits recent activity to 3 items', () => {
      const now = Date.now()
      mockSessions = Array.from({ length: 5 }, (_, i) => ({
        id: `w${i}`,
        completed_at: new Date(now - i * 60000).toISOString(),
        started_at: new Date(now - i * 60000 - 30000).toISOString(),
        workout_day: { name: `Push (Chest, Shoulders, Triceps)` },
      }))
      render(<HomePage />)
      const doneLabels = screen.getAllByText('Done')
      expect(doneLabels.length).toBe(3)
    })
  })

  describe('Mobility routing', () => {
    it('renders mobility category cards and navigates to duration picker', async () => {
      const userEvent = (await import('@testing-library/user-event')).default
      mockMobilityCategories = [
        {
          category: 'hip_knee_ankle',
          template: {
            id: 'mob-1',
            name: 'Hip, Knee & Ankle Flow',
            type: 'mobility',
            category: 'hip_knee_ankle',
            duration_minutes: 15,
            created_at: '2024-01-01',
          },
        },
      ]
      render(<HomePage />)

      // Switch to the Mobility tab
      const mobilityTab = screen.getByText('Mobility')
      await userEvent.click(mobilityTab)

      // Wait for tab content to animate in
      const template = await waitFor(() => screen.getByText('Hip, Knee & Ankle Flow'))
      await userEvent.click(template)

      // Should navigate to /mobility/hip_knee_ankle/select (duration picker)
      expect(mockNavigate).toHaveBeenCalledWith('/mobility/hip_knee_ankle/select')
    })
  })

  describe('Active session banner', () => {
    it('shows continue button when there is an active session', () => {
      mockActiveSession = {
        id: 'session-1',
        workout_day_id: 'day-1',
        workout_day: { name: 'Push (Chest, Shoulders, Triceps)' },
      }
      render(<HomePage />)
      expect(screen.getByText('Continue')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })
  })

  describe('WeeklyReviewCard removal', () => {
    it('does not render any Weekly Review content', () => {
      render(<HomePage />)
      expect(screen.queryByText(/weekly review/i)).not.toBeInTheDocument()
      expect(screen.queryByTestId('weekly-review')).not.toBeInTheDocument()
    })
  })

  describe('ScheduleWidget', () => {
    it('renders the schedule widget', () => {
      render(<HomePage />)
      expect(screen.getByTestId('schedule-widget')).toBeInTheDocument()
    })
  })

  describe('WeatherCard', () => {
    it('renders the weather card', () => {
      render(<HomePage />)
      expect(screen.getByTestId('weather-card')).toBeInTheDocument()
    })
  })
})
