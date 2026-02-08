import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
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

vi.mock('@/hooks/useWorkoutSession', () => ({
  useStartWorkout: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useCompleteWorkout: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useLogSet: () => ({
    mutate: vi.fn(),
  }),
  useDeleteSet: () => ({
    mutate: vi.fn(),
  }),
  useSessionSets: () => ({
    data: null,
  }),
}))

vi.mock('@/stores/workoutStore', () => ({
  useWorkoutStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) => {
      const state = {
        activeSession: null,
        setActiveSession: vi.fn(),
        setActiveWorkoutDay: vi.fn(),
        completedSets: new Map(),
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
  AppShell: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

vi.mock('@/components/workout', () => ({
  CollapsibleSection: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="collapsible-section">
      <span>{title}</span>
      {children}
    </div>
  ),
  ExerciseCard: () => <div data-testid="exercise-card" />,
  RestTimer: () => <div data-testid="rest-timer" />,
}))

describe('WorkoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWorkoutDay = null
    mockIsLoading = false
  })

  it('shows loading state initially', () => {
    mockIsLoading = true
    const { container } = render(<WorkoutPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows "Not Found" when workoutDay is null', () => {
    mockWorkoutDay = null
    mockIsLoading = false
    render(<WorkoutPage />)

    expect(screen.getByText('Not Found')).toBeInTheDocument()
    expect(screen.getByText('Workout day not found')).toBeInTheDocument()
  })

  it('shows workout name and Start Workout button when no active session', () => {
    mockWorkoutDay = {
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
    }

    render(<WorkoutPage />)

    // The workout name appears via getWorkoutDisplayName mock - AppShell title and card heading
    expect(screen.getAllByText('Push Day').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: /Start Workout/i })).toBeInTheDocument()
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
  })

  it('shows all exercises across sections', () => {
    mockWorkoutDay = {
      id: 'day-1',
      name: 'Push Day',
      sections: [
        {
          id: 'section-1',
          name: 'Main Lifts',
          duration_minutes: null,
          exercises: [
            { id: 'ex-1', name: 'Bench Press', sets: 3, reps_min: 8, reps_max: 12, reps_unit: 'reps', is_per_side: false },
            { id: 'ex-2', name: 'OHP', sets: 3, reps_min: 8, reps_max: 10, reps_unit: 'reps', is_per_side: false },
          ],
        },
        {
          id: 'section-2',
          name: 'Accessories',
          duration_minutes: null,
          exercises: [
            { id: 'ex-3', name: 'Lateral Raises', sets: 3, reps_min: 12, reps_max: 15, reps_unit: 'reps', is_per_side: false },
          ],
        },
      ],
    }

    render(<WorkoutPage />)

    // All exercises from both sections are rendered
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByText('OHP')).toBeInTheDocument()
    expect(screen.getByText('Lateral Raises')).toBeInTheDocument()
  })

  it('shows exercise list with sections', () => {
    mockWorkoutDay = {
      id: 'day-1',
      name: 'Push Day',
      sections: [
        {
          id: 'section-1',
          name: 'Main Lifts',
          duration_minutes: null,
          exercises: [
            { id: 'ex-1', name: 'Bench Press', sets: 3, reps_min: 8, reps_max: 12, reps_unit: 'reps', is_per_side: false },
          ],
        },
        {
          id: 'section-2',
          name: 'Accessories',
          duration_minutes: null,
          exercises: [
            { id: 'ex-2', name: 'Lateral Raises', sets: 3, reps_min: 12, reps_max: 15, reps_unit: 'reps', is_per_side: false },
          ],
        },
      ],
    }

    render(<WorkoutPage />)

    expect(screen.getByText('Main Lifts')).toBeInTheDocument()
    expect(screen.getByText('Accessories')).toBeInTheDocument()
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByText('Lateral Raises')).toBeInTheDocument()
  })
})
