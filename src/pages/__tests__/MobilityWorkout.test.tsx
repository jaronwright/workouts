import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import { MobilityWorkoutPage } from '../MobilityWorkout'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ templateId: 'template-mob-1' }),
  }
})

let mockTemplate: Record<string, unknown> | null = null
let mockTemplateLoading = false
let mockWorkoutDay: Record<string, unknown> | null = null
let mockDayLoading = false
let mockQuickLog = vi.fn()

vi.mock('@/hooks/useTemplateWorkout', () => ({
  useTemplate: () => ({
    data: mockTemplate,
    isLoading: mockTemplateLoading,
  }),
  useQuickLogTemplateWorkout: () => ({
    mutate: mockQuickLog,
    isPending: false,
  }),
}))

vi.mock('@/hooks/useWorkoutPlan', () => ({
  useWorkoutDay: () => ({
    data: mockWorkoutDay,
    isLoading: mockDayLoading,
  }),
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
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

describe('MobilityWorkoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTemplate = null
    mockTemplateLoading = false
    mockWorkoutDay = null
    mockDayLoading = false
    mockQuickLog = vi.fn()
  })

  it('shows loading state', () => {
    mockTemplateLoading = true
    const { container } = render(<MobilityWorkoutPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows not found when template is null', () => {
    mockTemplate = null
    mockTemplateLoading = false
    render(<MobilityWorkoutPage />)

    expect(screen.getByText('Not Found')).toBeInTheDocument()
    expect(screen.getByText('Workout not found')).toBeInTheDocument()
  })

  it('shows template name and exercise count when loaded', () => {
    mockTemplate = {
      id: 'template-mob-1',
      name: 'Core Stability',
      type: 'mobility',
      category: 'core',
      duration_minutes: 30,
      description: 'Core activation and stability exercises',
      workout_day_id: 'day-1',
    }
    mockWorkoutDay = {
      id: 'day-1',
      name: 'Core Stability — 30 min',
      sections: [
        {
          id: 'sec-1',
          exercises: [
            { id: 'ex-1', name: 'Dead Bug', sets: 3, reps_min: 10, reps_max: null, reps_unit: 'reps', is_per_side: true, notes: 'test' },
            { id: 'ex-2', name: 'Pallof Press Hold', sets: 3, reps_min: 20, reps_max: null, reps_unit: 'seconds', is_per_side: true, notes: 'test' },
          ],
        },
      ],
    }

    render(<MobilityWorkoutPage />)

    const nameElements = screen.getAllByText('Core Stability')
    expect(nameElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/~30 min/)).toBeInTheDocument()
    expect(screen.getByText(/2 exercises/)).toBeInTheDocument()
  })

  it('shows description when template has one', () => {
    mockTemplate = {
      id: 'template-mob-1',
      name: 'Core Stability',
      type: 'mobility',
      category: 'core',
      duration_minutes: 15,
      description: 'Core activation and stability exercises',
      workout_day_id: 'day-1',
    }
    mockWorkoutDay = {
      id: 'day-1',
      name: 'Core Stability — 15 min',
      sections: [],
    }

    render(<MobilityWorkoutPage />)

    expect(screen.getByText('Core activation and stability exercises')).toBeInTheDocument()
  })

  it('uses template duration_minutes for quickLog instead of hardcoded 15', async () => {
    const userEvent = (await import('@testing-library/user-event')).default
    mockTemplate = {
      id: 'template-mob-1',
      name: 'Core Stability',
      type: 'mobility',
      category: 'core',
      duration_minutes: 45,
      workout_day_id: 'day-1',
    }
    mockWorkoutDay = {
      id: 'day-1',
      name: 'Core Stability — 45 min',
      sections: [
        {
          id: 'sec-1',
          exercises: [
            { id: 'ex-1', name: 'Dead Bug', sets: 3, reps_min: 10, reps_max: null, reps_unit: 'reps', is_per_side: true, notes: 'test' },
          ],
        },
      ],
    }

    render(<MobilityWorkoutPage />)

    // Check an exercise to enable the Complete button
    await userEvent.click(screen.getByText('Dead Bug'))

    // Click Complete
    await userEvent.click(screen.getByText(/Complete Workout/))

    expect(mockQuickLog).toHaveBeenCalledWith(
      { templateId: 'template-mob-1', durationMinutes: 45 },
      expect.any(Object)
    )
  })
})
