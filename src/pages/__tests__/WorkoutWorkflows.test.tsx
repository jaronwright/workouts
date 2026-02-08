import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { WorkoutPage } from '../Workout'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ dayId: 'day-1' }),
  }
})

let mockWorkoutDay: Record<string, unknown> | null = null
let mockIsLoading = false

vi.mock('@/hooks/useWorkoutPlan', () => ({
  useWorkoutDay: () => ({
    data: mockWorkoutDay,
    isLoading: mockIsLoading,
  }),
}))

const mockStartWorkoutMutate = vi.fn()
const mockCompleteWorkoutMutate = vi.fn()
const mockLogSetMutate = vi.fn()
const mockDeleteSetMutate = vi.fn()

vi.mock('@/hooks/useWorkoutSession', () => ({
  useStartWorkout: () => ({
    mutate: mockStartWorkoutMutate,
    isPending: false,
  }),
  useCompleteWorkout: () => ({
    mutate: mockCompleteWorkoutMutate,
    isPending: false,
  }),
  useLogSet: () => ({
    mutate: mockLogSetMutate,
  }),
  useDeleteSet: () => ({
    mutate: mockDeleteSetMutate,
  }),
  useSessionSets: () => ({
    data: null,
  }),
}))

let mockActiveSession: Record<string, unknown> | null = null
const mockSetActiveSession = vi.fn()
const mockSetActiveWorkoutDay = vi.fn()
let mockCompletedSets = new Map()

vi.mock('@/stores/workoutStore', () => ({
  useWorkoutStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) => {
      const state = {
        activeSession: mockActiveSession,
        setActiveSession: mockSetActiveSession,
        setActiveWorkoutDay: mockSetActiveWorkoutDay,
        completedSets: mockCompletedSets,
      }
      return typeof selector === 'function' ? selector(state) : state
    },
    {
      getState: () => ({
        addCompletedSet: vi.fn(),
        removeCompletedSets: vi.fn(),
      }),
    }
  ),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = { user: { id: 'user-123' } }
    return typeof selector === 'function' ? selector(state) : state
  },
}))

vi.mock('@/config/workoutConfig', () => ({
  getWorkoutDisplayName: (name: string) => name || 'Workout',
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
  CollapsibleSection: ({
    children,
    title,
    subtitle,
  }: {
    children: React.ReactNode
    title: string
    subtitle?: string
  }) => (
    <div data-testid="collapsible-section">
      <span>{title}</span>
      {subtitle && <span data-testid="section-subtitle">{subtitle}</span>}
      {children}
    </div>
  ),
  ExerciseCard: ({ exercise }: { exercise: { name: string } }) => (
    <div data-testid="exercise-card">{exercise.name}</div>
  ),
  RestTimer: () => <div data-testid="rest-timer" />,
}))

vi.mock('@/components/ui', () => ({
  Button: ({
    children,
    onClick,
    loading,
    ...props
  }: {
    children: React.ReactNode
    onClick?: () => void
    loading?: boolean
    [key: string]: unknown
  }) => (
    <button onClick={onClick} disabled={loading} {...props}>
      {children}
    </button>
  ),
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

// Shared workout day fixture
function makeWorkoutDay(overrides: Record<string, unknown> = {}) {
  return {
    id: 'day-1',
    name: 'Push Day',
    sections: [
      {
        id: 'section-1',
        name: 'Main Lifts',
        duration_minutes: null,
        exercises: [
          {
            id: 'ex-1',
            name: 'Bench Press',
            sets: 3,
            reps_min: 8,
            reps_max: 12,
            reps_unit: 'reps',
            is_per_side: false,
          },
        ],
      },
    ],
    ...overrides,
  }
}

describe('WorkoutPage Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWorkoutDay = null
    mockIsLoading = false
    mockActiveSession = null
    mockCompletedSets = new Map()
  })

  describe('Start workout flow', () => {
    it('shows Start Workout button when no active session exists', () => {
      mockWorkoutDay = makeWorkoutDay()

      render(<WorkoutPage />)

      const startBtn = screen.getByRole('button', { name: /Start Workout/i })
      expect(startBtn).toBeInTheDocument()
    })

    it('calls startWorkout.mutate when Start Workout is clicked', () => {
      mockWorkoutDay = makeWorkoutDay()

      render(<WorkoutPage />)

      const startBtn = screen.getByRole('button', { name: /Start Workout/i })
      fireEvent.click(startBtn)

      expect(mockStartWorkoutMutate).toHaveBeenCalledTimes(1)
      // First argument is the dayId
      expect(mockStartWorkoutMutate).toHaveBeenCalledWith(
        'day-1',
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
    })

    it('does not show Complete Workout button when there is no active session', () => {
      mockWorkoutDay = makeWorkoutDay()

      render(<WorkoutPage />)

      expect(
        screen.queryByRole('button', { name: /Complete Workout/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('Active session state', () => {
    it('shows Complete Workout button when an active session exists', () => {
      mockWorkoutDay = makeWorkoutDay()
      mockActiveSession = { id: 'session-1', workout_day_id: 'day-1' }

      render(<WorkoutPage />)

      expect(
        screen.getByRole('button', { name: /Complete Workout/i })
      ).toBeInTheDocument()
    })

    it('renders ExerciseCard components in active session view', () => {
      mockWorkoutDay = makeWorkoutDay({
        sections: [
          {
            id: 'section-1',
            name: 'Main Lifts',
            duration_minutes: null,
            exercises: [
              {
                id: 'ex-1',
                name: 'Bench Press',
                sets: 3,
                reps_min: 8,
                reps_max: 12,
                reps_unit: 'reps',
                is_per_side: false,
              },
              {
                id: 'ex-2',
                name: 'Incline DB Press',
                sets: 3,
                reps_min: 10,
                reps_max: 12,
                reps_unit: 'reps',
                is_per_side: false,
              },
            ],
          },
        ],
      })
      mockActiveSession = { id: 'session-1', workout_day_id: 'day-1' }

      render(<WorkoutPage />)

      const exerciseCards = screen.getAllByTestId('exercise-card')
      expect(exerciseCards).toHaveLength(2)
    })

    it('shows RestTimer in active session view', () => {
      mockWorkoutDay = makeWorkoutDay()
      mockActiveSession = { id: 'session-1', workout_day_id: 'day-1' }

      render(<WorkoutPage />)

      expect(screen.getByTestId('rest-timer')).toBeInTheDocument()
    })

    it('does not show Start Workout button when session is active', () => {
      mockWorkoutDay = makeWorkoutDay()
      mockActiveSession = { id: 'session-1', workout_day_id: 'day-1' }

      render(<WorkoutPage />)

      expect(
        screen.queryByRole('button', { name: /Start Workout/i })
      ).not.toBeInTheDocument()
    })

    it('calls completeWorkout.mutate when Complete Workout is clicked', () => {
      mockWorkoutDay = makeWorkoutDay()
      mockActiveSession = { id: 'session-1', workout_day_id: 'day-1' }

      render(<WorkoutPage />)

      const completeBtn = screen.getByRole('button', {
        name: /Complete Workout/i,
      })
      fireEvent.click(completeBtn)

      expect(mockCompleteWorkoutMutate).toHaveBeenCalledTimes(1)
      expect(mockCompleteWorkoutMutate).toHaveBeenCalledWith(
        { sessionId: 'session-1' },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      )
    })
  })

  describe('Exercise section rendering', () => {
    it('renders multiple sections with their headers', () => {
      mockWorkoutDay = makeWorkoutDay({
        sections: [
          {
            id: 'section-1',
            name: 'Main Lifts',
            duration_minutes: null,
            exercises: [
              {
                id: 'ex-1',
                name: 'Bench Press',
                sets: 3,
                reps_min: 8,
                reps_max: 12,
                reps_unit: 'reps',
                is_per_side: false,
              },
            ],
          },
          {
            id: 'section-2',
            name: 'Accessories',
            duration_minutes: null,
            exercises: [
              {
                id: 'ex-2',
                name: 'Lateral Raises',
                sets: 3,
                reps_min: 12,
                reps_max: 15,
                reps_unit: 'reps',
                is_per_side: false,
              },
            ],
          },
        ],
      })

      render(<WorkoutPage />)

      expect(screen.getByText('Main Lifts')).toBeInTheDocument()
      expect(screen.getByText('Accessories')).toBeInTheDocument()
    })

    it('renders exercise cards under each section', () => {
      mockWorkoutDay = makeWorkoutDay({
        sections: [
          {
            id: 'section-1',
            name: 'Main Lifts',
            duration_minutes: null,
            exercises: [
              {
                id: 'ex-1',
                name: 'Bench Press',
                sets: 3,
                reps_min: 8,
                reps_max: 12,
                reps_unit: 'reps',
                is_per_side: false,
              },
            ],
          },
          {
            id: 'section-2',
            name: 'Accessories',
            duration_minutes: null,
            exercises: [
              {
                id: 'ex-2',
                name: 'Lateral Raises',
                sets: 3,
                reps_min: 12,
                reps_max: 15,
                reps_unit: 'reps',
                is_per_side: false,
              },
              {
                id: 'ex-3',
                name: 'Tricep Pushdowns',
                sets: 3,
                reps_min: 10,
                reps_max: 12,
                reps_unit: 'reps',
                is_per_side: false,
              },
            ],
          },
        ],
      })

      render(<WorkoutPage />)

      expect(screen.getByText('Bench Press')).toBeInTheDocument()
      expect(screen.getByText('Lateral Raises')).toBeInTheDocument()
      expect(screen.getByText('Tricep Pushdowns')).toBeInTheDocument()
    })

    it('renders warm-up sections as collapsible', () => {
      mockWorkoutDay = makeWorkoutDay({
        sections: [
          {
            id: 'section-warmup',
            name: 'Warm-Up',
            duration_minutes: 10,
            exercises: [
              {
                id: 'ex-wu-1',
                name: 'Jump Rope',
                sets: null,
                reps_min: null,
                reps_max: null,
                reps_unit: 'reps',
                is_per_side: false,
              },
            ],
          },
          {
            id: 'section-1',
            name: 'Main Lifts',
            duration_minutes: null,
            exercises: [
              {
                id: 'ex-1',
                name: 'Bench Press',
                sets: 3,
                reps_min: 8,
                reps_max: 12,
                reps_unit: 'reps',
                is_per_side: false,
              },
            ],
          },
        ],
      })

      render(<WorkoutPage />)

      // Warm-Up section renders as a collapsible section
      const collapsibleSections = screen.getAllByTestId('collapsible-section')
      expect(collapsibleSections).toHaveLength(1)
      expect(screen.getByText('Warm-Up')).toBeInTheDocument()
    })

    it('shows exercise count in pre-session view', () => {
      mockWorkoutDay = makeWorkoutDay({
        sections: [
          {
            id: 'section-1',
            name: 'Main Lifts',
            duration_minutes: null,
            exercises: [
              {
                id: 'ex-1',
                name: 'Bench Press',
                sets: 3,
                reps_min: 8,
                reps_max: 12,
                reps_unit: 'reps',
                is_per_side: false,
              },
              {
                id: 'ex-2',
                name: 'OHP',
                sets: 3,
                reps_min: 8,
                reps_max: 10,
                reps_unit: 'reps',
                is_per_side: false,
              },
            ],
          },
          {
            id: 'section-2',
            name: 'Accessories',
            duration_minutes: null,
            exercises: [
              {
                id: 'ex-3',
                name: 'Lateral Raises',
                sets: 3,
                reps_min: 12,
                reps_max: 15,
                reps_unit: 'reps',
                is_per_side: false,
              },
            ],
          },
        ],
      })

      render(<WorkoutPage />)

      expect(screen.getByText('3 exercises')).toBeInTheDocument()
    })
  })

  describe('Timed section display', () => {
    it('shows duration in subtitle for timed sections in pre-session view', () => {
      mockWorkoutDay = makeWorkoutDay({
        sections: [
          {
            id: 'section-timed',
            name: 'Core Work',
            duration_minutes: 15,
            exercises: [
              {
                id: 'ex-1',
                name: 'Plank',
                sets: 3,
                reps_min: 30,
                reps_max: 60,
                reps_unit: 'seconds',
                is_per_side: false,
              },
            ],
          },
        ],
      })

      render(<WorkoutPage />)

      // Non-warmup timed section shows "(15 min)" in the header text
      expect(screen.getByText(/Core Work/)).toBeInTheDocument()
      expect(screen.getByText(/15 min/)).toBeInTheDocument()
    })

    it('shows duration in subtitle for warm-up timed sections', () => {
      mockWorkoutDay = makeWorkoutDay({
        sections: [
          {
            id: 'section-warmup',
            name: 'Warm-Up',
            duration_minutes: 10,
            exercises: [
              {
                id: 'ex-1',
                name: 'Jumping Jacks',
                sets: null,
                reps_min: null,
                reps_max: null,
                reps_unit: 'reps',
                is_per_side: false,
              },
            ],
          },
        ],
      })

      render(<WorkoutPage />)

      // Warm-up with duration renders as CollapsibleSection with subtitle
      expect(screen.getByText('Warm-Up')).toBeInTheDocument()
      expect(screen.getByTestId('section-subtitle')).toHaveTextContent('10 min')
    })

    it('shows duration in active session for timed warm-up sections', () => {
      mockWorkoutDay = makeWorkoutDay({
        sections: [
          {
            id: 'section-warmup',
            name: 'Warm-Up',
            duration_minutes: 10,
            exercises: [
              {
                id: 'ex-1',
                name: 'Jumping Jacks',
                sets: null,
                reps_min: null,
                reps_max: null,
                reps_unit: 'reps',
                is_per_side: false,
              },
            ],
          },
          {
            id: 'section-main',
            name: 'Main Lifts',
            duration_minutes: null,
            exercises: [
              {
                id: 'ex-2',
                name: 'Bench Press',
                sets: 3,
                reps_min: 8,
                reps_max: 12,
                reps_unit: 'reps',
                is_per_side: false,
              },
            ],
          },
        ],
      })
      mockActiveSession = { id: 'session-1', workout_day_id: 'day-1' }

      render(<WorkoutPage />)

      // The warm-up collapsible section should show the subtitle
      expect(screen.getByTestId('section-subtitle')).toHaveTextContent('10 min')
    })
  })
})
