import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import { CardioWorkoutPage } from '../CardioWorkout'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ templateId: 'template-1' }),
  }
})

let mockTemplate: Record<string, unknown> | null = null
let mockIsLoading = false

vi.mock('@/hooks/useTemplateWorkout', () => ({
  useTemplate: () => ({
    data: mockTemplate,
    isLoading: mockIsLoading,
  }),
  useLastTemplateSession: () => ({
    data: null,
    isLoading: false,
  }),
  useQuickLogTemplateWorkout: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useStartTemplateWorkout: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useCompleteTemplateWorkout: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}))

const MockIcon = (props: Record<string, unknown>) => <span data-testid="cardio-icon" {...props} />

vi.mock('@/config/workoutConfig', () => ({
  getCardioStyle: () => ({
    icon: MockIcon,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    gradient: 'from-blue-500 to-blue-600',
  }),
}))

vi.mock('@/utils/cardioUtils', () => ({
  CARDIO_INPUT_CONFIG: {
    run: [
      { mode: 'time', label: 'Time', unit: 'min' },
      { mode: 'distance', label: 'Miles', unit: 'miles' },
    ],
    cycle: [
      { mode: 'time', label: 'Time', unit: 'min' },
      { mode: 'distance', label: 'Miles', unit: 'miles' },
    ],
    stair_stepper: [
      { mode: 'time', label: 'Time', unit: 'min' },
    ],
  },
  getCardioPreference: () => null,
  setCardioPreference: vi.fn(),
}))

vi.mock('@/components/layout', () => ({
  AppShell: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

describe('CardioWorkoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTemplate = null
    mockIsLoading = false
  })

  it('shows loading state', () => {
    mockIsLoading = true
    const { container } = render(<CardioWorkoutPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows not found when template is null', () => {
    mockTemplate = null
    mockIsLoading = false
    render(<CardioWorkoutPage />)

    expect(screen.getByText('Not Found')).toBeInTheDocument()
    expect(screen.getByText('Workout not found')).toBeInTheDocument()
  })

  it('shows template name and Log Workout button when loaded', () => {
    mockTemplate = {
      id: 'template-1',
      name: 'Morning Run',
      type: 'cardio',
      category: 'run',
      duration_minutes: 30,
    }
    mockIsLoading = false

    render(<CardioWorkoutPage />)

    // "Morning Run" appears in both AppShell title and card heading
    const morningRunElements = screen.getAllByText('Morning Run')
    expect(morningRunElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: /Log Workout/i })).toBeInTheDocument()
  })

  it('shows metric toggle when modes > 1', () => {
    mockTemplate = {
      id: 'template-1',
      name: 'Morning Run',
      type: 'cardio',
      category: 'run',
      duration_minutes: 30,
    }
    mockIsLoading = false

    render(<CardioWorkoutPage />)

    // "run" category has two modes: Time and Miles
    expect(screen.getByText('Time')).toBeInTheDocument()
    expect(screen.getByText('Miles')).toBeInTheDocument()
  })

  it('does not show metric toggle when only one mode', () => {
    mockTemplate = {
      id: 'template-1',
      name: 'Stair Stepper',
      type: 'cardio',
      category: 'stair_stepper',
      duration_minutes: 20,
    }
    mockIsLoading = false

    render(<CardioWorkoutPage />)

    // "stair_stepper" has only one mode (Time), so Miles toggle should not appear
    expect(screen.queryByText('Miles')).not.toBeInTheDocument()
  })
})
