import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { WorkoutSelectPage } from '../WorkoutSelect'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// Configurable mock return values
let mockDays: Record<string, unknown>[] = []
let mockDaysLoading = false
let mockCardioTemplates: Record<string, unknown>[] = []
let mockCardioLoading = false
let mockMobilityTemplates: Record<string, unknown>[] = []
let mockMobilityLoading = false
let mockActiveSession: Record<string, unknown> | null = null
const mockDeleteMutate = vi.fn()

vi.mock('@/hooks/useWorkoutPlan', () => ({
  useSelectedPlanDays: () => ({
    data: mockDays,
    isLoading: mockDaysLoading,
  }),
}))

vi.mock('@/hooks/useWorkoutSession', () => ({
  useActiveSession: () => ({ data: mockActiveSession }),
  useDeleteSession: () => ({ mutate: mockDeleteMutate }),
}))

vi.mock('@/hooks/useSchedule', () => ({
  useWorkoutTemplatesByType: (type: string) => {
    if (type === 'cardio')
      return { data: mockCardioTemplates, isLoading: mockCardioLoading }
    if (type === 'mobility')
      return { data: mockMobilityTemplates, isLoading: mockMobilityLoading }
    return { data: [], isLoading: false }
  },
}))

vi.mock('@/components/layout', () => ({
  AppShell: ({
    children,
    title,
  }: {
    children: React.ReactNode
    title: string
  }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

vi.mock('@/components/workout', () => ({
  WorkoutDayCard: ({
    day,
    onClick,
  }: {
    day: { id: string; name: string }
    onClick: () => void
  }) => (
    <button data-testid={`workout-day-${day.id}`} onClick={onClick}>
      {day.name}
    </button>
  ),
  ScheduleWidget: () => <div data-testid="schedule-widget" />,
}))

vi.mock('@/config/workoutConfig', () => ({
  getWorkoutDisplayName: (name: string) => name || 'Workout',
  getCardioStyle: () => ({
    color: '#14B8A6',
    bgColor: 'rgba(20, 184, 166, 0.15)',
    gradient: 'from-teal-500 to-teal-400',
    icon: 'div',
  }),
  getMobilityStyle: () => ({
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    gradient: 'from-emerald-500 to-green-500',
    icon: 'div',
  }),
  getCategoryLabel: (type: string) => {
    const labels: Record<string, string> = {
      cardio: 'Cardio',
      mobility: 'Mobility',
      weights: 'Weights',
    }
    return labels[type] || type
  },
  CATEGORY_DEFAULTS: {
    weights: {
      color: '#6366F1',
      bgColor: 'rgba(99, 102, 241, 0.15)',
      gradient: 'from-indigo-500 to-indigo-400',
      icon: 'div',
    },
    cardio: {
      color: '#14B8A6',
      bgColor: 'rgba(20, 184, 166, 0.15)',
      gradient: 'from-teal-500 to-teal-400',
      icon: 'div',
    },
    mobility: {
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      gradient: 'from-emerald-500 to-green-500',
      icon: 'div',
    },
  },
}))

describe('WorkoutSelectPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDays = []
    mockDaysLoading = false
    mockCardioTemplates = []
    mockCardioLoading = false
    mockMobilityTemplates = []
    mockMobilityLoading = false
    mockActiveSession = null
  })

  describe('Page structure', () => {
    it('renders the page title "Workouts"', () => {
      render(<WorkoutSelectPage />)
      expect(screen.getByText('Workouts')).toBeInTheDocument()
    })

    it('renders the schedule widget', () => {
      render(<WorkoutSelectPage />)
      expect(screen.getByTestId('schedule-widget')).toBeInTheDocument()
    })

    it('renders section headers for Weights, Cardio, and Mobility', () => {
      render(<WorkoutSelectPage />)
      expect(screen.getByText('Weights')).toBeInTheDocument()
      expect(screen.getByText('Cardio')).toBeInTheDocument()
      expect(screen.getByText('Mobility')).toBeInTheDocument()
    })
  })

  describe('Loading states', () => {
    it('shows skeleton loaders when weights data is loading', () => {
      mockDaysLoading = true
      const { container } = render(<WorkoutSelectPage />)

      const skeletons = container.querySelectorAll('.skeleton')
      expect(skeletons.length).toBeGreaterThanOrEqual(3)
    })

    it('shows skeleton loaders when cardio data is loading', () => {
      mockCardioLoading = true
      const { container } = render(<WorkoutSelectPage />)

      const skeletons = container.querySelectorAll('.skeleton')
      expect(skeletons.length).toBeGreaterThanOrEqual(2)
    })

    it('shows skeleton loaders when mobility data is loading', () => {
      mockMobilityLoading = true
      const { container } = render(<WorkoutSelectPage />)

      const skeletons = container.querySelectorAll('.skeleton')
      expect(skeletons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Empty states', () => {
    it('shows empty message when no weight workouts exist', () => {
      mockDays = []
      render(<WorkoutSelectPage />)
      expect(
        screen.getByText('No weight workouts found.')
      ).toBeInTheDocument()
    })

    it('shows empty message when no cardio workouts exist', () => {
      mockCardioTemplates = []
      render(<WorkoutSelectPage />)
      expect(
        screen.getByText('No cardio workouts available.')
      ).toBeInTheDocument()
    })

    it('shows empty message when no mobility workouts exist', () => {
      mockMobilityTemplates = []
      render(<WorkoutSelectPage />)
      expect(
        screen.getByText('No mobility workouts available.')
      ).toBeInTheDocument()
    })
  })

  describe('Weights section', () => {
    it('renders workout day cards when days exist', () => {
      mockDays = [
        {
          id: 'day-1',
          name: 'Push (Chest, Shoulders, Triceps)',
          day_number: 1,
          workout_plan_id: 'plan-1',
        },
        {
          id: 'day-2',
          name: 'Pull (Back, Biceps, Rear Delts)',
          day_number: 2,
          workout_plan_id: 'plan-1',
        },
      ]
      render(<WorkoutSelectPage />)

      expect(
        screen.getByTestId('workout-day-day-1')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('workout-day-day-2')
      ).toBeInTheDocument()
    })

    it('navigates to workout page when a workout day is clicked', async () => {
      const user = userEvent.setup()
      mockDays = [
        {
          id: 'day-1',
          name: 'Push',
          day_number: 1,
          workout_plan_id: 'plan-1',
        },
      ]
      render(<WorkoutSelectPage />)

      await user.click(screen.getByTestId('workout-day-day-1'))
      expect(mockNavigate).toHaveBeenCalledWith('/workout/day-1')
    })
  })

  describe('Cardio section', () => {
    it('renders cardio template cards when templates exist', () => {
      mockCardioTemplates = [
        {
          id: 'cardio-1',
          name: 'Running',
          type: 'cardio',
          category: 'run',
          duration_minutes: 30,
          created_at: '2024-01-01',
        },
        {
          id: 'cardio-2',
          name: 'Swimming',
          type: 'cardio',
          category: 'swim',
          duration_minutes: 45,
          created_at: '2024-01-01',
        },
      ]
      render(<WorkoutSelectPage />)

      expect(screen.getByText('Running')).toBeInTheDocument()
      expect(screen.getByText('Swimming')).toBeInTheDocument()
    })

    it('shows duration for cardio templates', () => {
      mockCardioTemplates = [
        {
          id: 'cardio-1',
          name: 'Cycling',
          type: 'cardio',
          category: 'cycle',
          duration_minutes: 45,
          created_at: '2024-01-01',
        },
      ]
      render(<WorkoutSelectPage />)

      expect(screen.getByText('~45 min')).toBeInTheDocument()
    })

    it('navigates to cardio page when a cardio template is clicked', async () => {
      const user = userEvent.setup()
      mockCardioTemplates = [
        {
          id: 'cardio-1',
          name: 'Running',
          type: 'cardio',
          category: 'run',
          duration_minutes: 30,
          created_at: '2024-01-01',
        },
      ]
      render(<WorkoutSelectPage />)

      await user.click(screen.getByText('Running'))
      expect(mockNavigate).toHaveBeenCalledWith('/cardio/cardio-1')
    })
  })

  describe('Mobility section', () => {
    it('renders mobility template cards when templates exist', () => {
      mockMobilityTemplates = [
        {
          id: 'mob-1',
          name: 'Hip, Knee & Ankle Flow',
          type: 'mobility',
          category: 'hip_knee_ankle',
          duration_minutes: 15,
          created_at: '2024-01-01',
        },
      ]
      render(<WorkoutSelectPage />)

      expect(
        screen.getByText('Hip, Knee & Ankle Flow')
      ).toBeInTheDocument()
    })

    it('shows duration for mobility templates', () => {
      mockMobilityTemplates = [
        {
          id: 'mob-1',
          name: 'Core Stability',
          type: 'mobility',
          category: 'core',
          duration_minutes: 20,
          created_at: '2024-01-01',
        },
      ]
      render(<WorkoutSelectPage />)

      expect(screen.getByText('~20 min')).toBeInTheDocument()
    })

    it('navigates to mobility page when a mobility template is clicked', async () => {
      const user = userEvent.setup()
      mockMobilityTemplates = [
        {
          id: 'mob-1',
          name: 'Spine Mobility',
          type: 'mobility',
          category: 'spine',
          duration_minutes: 15,
          created_at: '2024-01-01',
        },
      ]
      render(<WorkoutSelectPage />)

      await user.click(screen.getByText('Spine Mobility'))
      expect(mockNavigate).toHaveBeenCalledWith('/mobility/mob-1')
    })

    it('does not show duration when template has no duration_minutes', () => {
      mockMobilityTemplates = [
        {
          id: 'mob-1',
          name: 'Spine Mobility',
          type: 'mobility',
          category: 'spine',
          duration_minutes: null,
          created_at: '2024-01-01',
        },
      ]
      render(<WorkoutSelectPage />)

      expect(screen.getByText('Spine Mobility')).toBeInTheDocument()
      expect(screen.queryByText(/min/)).not.toBeInTheDocument()
    })
  })

  describe('Active session banner', () => {
    it('shows active session banner when there is an in-progress session', () => {
      mockActiveSession = {
        id: 'session-1',
        workout_day_id: 'day-1',
        workout_day: { name: 'Push (Chest, Shoulders, Triceps)' },
      }
      render(<WorkoutSelectPage />)

      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Continue')).toBeInTheDocument()
    })

    it('displays the active session workout name', () => {
      mockActiveSession = {
        id: 'session-1',
        workout_day_id: 'day-2',
        workout_day: { name: 'Pull (Back, Biceps, Rear Delts)' },
      }
      render(<WorkoutSelectPage />)

      // getWorkoutDisplayName is mocked to return the name as-is
      expect(
        screen.getByText('Pull (Back, Biceps, Rear Delts)')
      ).toBeInTheDocument()
    })

    it('does not show active session banner when no session is active', () => {
      mockActiveSession = null
      render(<WorkoutSelectPage />)

      expect(screen.queryByText('In Progress')).not.toBeInTheDocument()
      expect(screen.queryByText('Continue')).not.toBeInTheDocument()
    })

    it('navigates to active workout when Continue is clicked', async () => {
      const user = userEvent.setup()
      mockActiveSession = {
        id: 'session-1',
        workout_day_id: 'day-1',
        workout_day: { name: 'Push' },
      }
      render(<WorkoutSelectPage />)

      await user.click(screen.getByText('Continue'))
      expect(mockNavigate).toHaveBeenCalledWith('/workout/day-1/active')
    })

    it('calls deleteSession when dismiss button is clicked', async () => {
      const user = userEvent.setup()
      mockActiveSession = {
        id: 'session-1',
        workout_day_id: 'day-1',
        workout_day: { name: 'Push' },
      }
      render(<WorkoutSelectPage />)

      const dismissButton = screen.getByTitle('Dismiss session')
      await user.click(dismissButton)

      expect(mockDeleteMutate).toHaveBeenCalledWith('session-1')
    })
  })

  describe('Multiple sections populated', () => {
    it('renders all sections with data simultaneously', () => {
      mockDays = [
        {
          id: 'day-1',
          name: 'Push',
          day_number: 1,
          workout_plan_id: 'plan-1',
        },
      ]
      mockCardioTemplates = [
        {
          id: 'cardio-1',
          name: 'Running',
          type: 'cardio',
          category: 'run',
          duration_minutes: 30,
          created_at: '2024-01-01',
        },
      ]
      mockMobilityTemplates = [
        {
          id: 'mob-1',
          name: 'Core Stability',
          type: 'mobility',
          category: 'core',
          duration_minutes: 20,
          created_at: '2024-01-01',
        },
      ]
      render(<WorkoutSelectPage />)

      // All section headers present
      expect(screen.getByText('Weights')).toBeInTheDocument()
      // "Cardio" appears as both a section header and a template category label
      expect(screen.getAllByText('Cardio').length).toBeGreaterThanOrEqual(1)
      // "Mobility" appears as both a section header and a template category label
      expect(screen.getAllByText('Mobility').length).toBeGreaterThanOrEqual(1)

      // All items present
      expect(screen.getByTestId('workout-day-day-1')).toBeInTheDocument()
      expect(screen.getByText('Running')).toBeInTheDocument()
      expect(screen.getByText('Core Stability')).toBeInTheDocument()

      // No empty state messages
      expect(
        screen.queryByText('No weight workouts found.')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('No cardio workouts available.')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('No mobility workouts available.')
      ).not.toBeInTheDocument()
    })
  })
})
