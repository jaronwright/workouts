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
let mockIsLoading = false

vi.mock('@/hooks/useTemplateWorkout', () => ({
  useTemplate: () => ({
    data: mockTemplate,
    isLoading: mockIsLoading,
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
    mockIsLoading = false
  })

  it('shows loading state', () => {
    mockIsLoading = true
    const { container } = render(<MobilityWorkoutPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows not found when template is null', () => {
    mockTemplate = null
    mockIsLoading = false
    render(<MobilityWorkoutPage />)

    expect(screen.getByText('Not Found')).toBeInTheDocument()
    expect(screen.getByText('Workout not found')).toBeInTheDocument()
  })

  it('shows template name and duration selection (15m, 30m, 45m, 60m) when loaded', () => {
    mockTemplate = {
      id: 'template-mob-1',
      name: 'Full Body Stretch',
      type: 'mobility',
      category: 'full_body',
      duration_minutes: 30,
      description: 'A comprehensive mobility routine',
    }
    mockIsLoading = false

    render(<MobilityWorkoutPage />)

    // "Full Body Stretch" appears in both AppShell title and card heading
    const nameElements = screen.getAllByText('Full Body Stretch')
    expect(nameElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Select Duration')).toBeInTheDocument()

    // Duration options
    expect(screen.getByText('15m')).toBeInTheDocument()
    expect(screen.getByText('30m')).toBeInTheDocument()
    expect(screen.getByText('45m')).toBeInTheDocument()
    expect(screen.getByText('60m')).toBeInTheDocument()
  })

  it('shows Start button with selected duration', () => {
    mockTemplate = {
      id: 'template-mob-1',
      name: 'Hip Flow',
      type: 'mobility',
      category: 'hip_knee_ankle',
      duration_minutes: 15,
    }
    mockIsLoading = false

    render(<MobilityWorkoutPage />)

    // Default duration is from template (15 min) or DURATION_OPTIONS[0]
    expect(screen.getByRole('button', { name: /Start 15 Minute Session/i })).toBeInTheDocument()
  })

  it('shows description when template has one', () => {
    mockTemplate = {
      id: 'template-mob-1',
      name: 'Morning Mobility',
      type: 'mobility',
      category: 'full_body',
      duration_minutes: 30,
      description: 'Wake up your joints and muscles',
    }
    mockIsLoading = false

    render(<MobilityWorkoutPage />)

    expect(screen.getByText('Wake up your joints and muscles')).toBeInTheDocument()
  })
})
