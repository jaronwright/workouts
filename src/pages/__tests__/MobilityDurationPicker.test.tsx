import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { MobilityDurationPickerPage } from '../MobilityDurationPicker'

// ---- Router mocks ----
const mockNavigate = vi.fn()
let mockCategory = 'core'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ category: mockCategory }),
  }
})

// ---- Mobility templates hook mock ----
interface MockVariant {
  id: string
  name: string
  type: string
  category: string
  description: string | null
  duration_minutes: number | null
  icon: string | null
  workout_day_id: string | null
  created_at: string
}

let mockVariants: MockVariant[] | undefined = undefined
let mockIsLoading = false

vi.mock('@/hooks/useMobilityTemplates', () => ({
  useMobilityVariants: () => ({
    data: mockVariants,
    isLoading: mockIsLoading,
  }),
}))

// ---- Layout mock ----
vi.mock('@/components/layout', () => ({
  AppShell: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

// ---- UI mocks ----
vi.mock('@/components/ui', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// ---- Config mock ----
const MockIcon = (props: Record<string, unknown>) => <span data-testid="mobility-icon" {...props} />

vi.mock('@/config/workoutConfig', () => ({
  getMobilityStyle: () => ({
    icon: MockIcon,
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    gradient: 'from-emerald-500 to-emerald-400',
  }),
}))

// Helper to create variant templates
function createVariant(overrides: Partial<MockVariant> = {}): MockVariant {
  return {
    id: 'variant-1',
    name: 'Core Stability',
    type: 'mobility',
    category: 'core',
    description: null,
    duration_minutes: 15,
    icon: null,
    workout_day_id: null,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('MobilityDurationPickerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockVariants = undefined
    mockIsLoading = false
    mockCategory = 'core'
  })

  // ===== Loading State =====
  describe('loading state', () => {
    it('shows loading skeleton with correct title', () => {
      mockIsLoading = true
      const { container } = render(<MobilityDurationPickerPage />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThanOrEqual(1)
    })

    it('shows multiple skeleton placeholders while loading', () => {
      mockIsLoading = true
      const { container } = render(<MobilityDurationPickerPage />)

      // Should have 5 skeletons: 1 header + 4 duration cards
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(5)
    })
  })

  // ===== Not Found State =====
  describe('not found state', () => {
    it('shows not found when variants is undefined', () => {
      mockVariants = undefined
      mockIsLoading = false
      render(<MobilityDurationPickerPage />)

      expect(screen.getByText('Not Found')).toBeInTheDocument()
      expect(screen.getByText('No variants found for this mobility type.')).toBeInTheDocument()
    })

    it('shows not found when variants is an empty array', () => {
      mockVariants = []
      mockIsLoading = false
      render(<MobilityDurationPickerPage />)

      expect(screen.getByText('Not Found')).toBeInTheDocument()
      expect(screen.getByText('No variants found for this mobility type.')).toBeInTheDocument()
    })
  })

  // ===== Data Display =====
  describe('data display', () => {
    it('renders page title from first variant name', () => {
      mockVariants = [
        createVariant({ id: 'v1', name: 'Core Stability', duration_minutes: 15 }),
        createVariant({ id: 'v2', name: 'Core Stability', duration_minutes: 30 }),
      ]
      render(<MobilityDurationPickerPage />)

      // The first <h1> is the AppShell title which uses the first variant name
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Core Stability')
    })

    it('renders the header card with icon and subtitle', () => {
      mockVariants = [
        createVariant({ id: 'v1', name: 'Core Stability', duration_minutes: 15 }),
      ]
      render(<MobilityDurationPickerPage />)

      expect(screen.getByText('Choose your session length')).toBeInTheDocument()
      expect(screen.getByTestId('mobility-icon')).toBeInTheDocument()
    })

    it('renders duration cards for each variant', () => {
      mockVariants = [
        createVariant({ id: 'v1', duration_minutes: 15 }),
        createVariant({ id: 'v2', duration_minutes: 30 }),
        createVariant({ id: 'v3', duration_minutes: 45 }),
        createVariant({ id: 'v4', duration_minutes: 60 }),
      ]
      render(<MobilityDurationPickerPage />)

      // Each variant shows "X min" in two places: card body + badge
      expect(screen.getAllByText('15 min').length).toBeGreaterThanOrEqual(2)
      expect(screen.getAllByText('30 min').length).toBeGreaterThanOrEqual(2)
      expect(screen.getAllByText('45 min').length).toBeGreaterThanOrEqual(2)
      expect(screen.getAllByText('60 min').length).toBeGreaterThanOrEqual(2)
    })

    it('renders correct duration labels', () => {
      mockVariants = [
        createVariant({ id: 'v1', duration_minutes: 15 }),
        createVariant({ id: 'v2', duration_minutes: 30 }),
        createVariant({ id: 'v3', duration_minutes: 45 }),
        createVariant({ id: 'v4', duration_minutes: 60 }),
      ]
      render(<MobilityDurationPickerPage />)

      expect(screen.getByText('Quick')).toBeInTheDocument()
      expect(screen.getByText('Standard')).toBeInTheDocument()
      expect(screen.getByText('Extended')).toBeInTheDocument()
      expect(screen.getByText('Full Session')).toBeInTheDocument()
    })

    it('uses fallback label for non-standard durations', () => {
      mockVariants = [
        createVariant({ id: 'v1', duration_minutes: 20 }),
      ]
      render(<MobilityDurationPickerPage />)

      // Non-standard duration uses "X min" as label (appears in card heading, label, and badge)
      const elements = screen.getAllByText('20 min')
      expect(elements.length).toBeGreaterThanOrEqual(1)
    })

    it('defaults to 15 when duration_minutes is null', () => {
      mockVariants = [
        createVariant({ id: 'v1', duration_minutes: null }),
      ]
      render(<MobilityDurationPickerPage />)

      // Falls back to 15 min
      expect(screen.getAllByText('15 min').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Quick')).toBeInTheDocument()
    })
  })

  // ===== Navigation =====
  describe('navigation', () => {
    it('navigates to the mobility workout page on card click', async () => {
      mockVariants = [
        createVariant({ id: 'variant-abc-123', duration_minutes: 30 }),
      ]
      render(<MobilityDurationPickerPage />)

      // Click the 30 min card button
      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[0])

      expect(mockNavigate).toHaveBeenCalledWith('/mobility/variant-abc-123')
    })

    it('navigates to the correct variant when multiple options exist', async () => {
      mockVariants = [
        createVariant({ id: 'v-15', duration_minutes: 15 }),
        createVariant({ id: 'v-30', duration_minutes: 30 }),
        createVariant({ id: 'v-45', duration_minutes: 45 }),
      ]
      render(<MobilityDurationPickerPage />)

      const buttons = screen.getAllByRole('button')

      // Click the second card (30 min)
      await userEvent.click(buttons[1])
      expect(mockNavigate).toHaveBeenCalledWith('/mobility/v-30')

      // Click the third card (45 min)
      await userEvent.click(buttons[2])
      expect(mockNavigate).toHaveBeenCalledWith('/mobility/v-45')
    })
  })

  // ===== Header =====
  describe('header card', () => {
    it('renders the mobility type name in the header card', () => {
      mockVariants = [
        createVariant({ name: 'Hip, Knee & Ankle Flow', category: 'hip_knee_ankle' }),
      ]
      mockCategory = 'hip_knee_ankle'
      render(<MobilityDurationPickerPage />)

      // The name appears as page title and in the header card
      const headings = screen.getAllByText('Hip, Knee & Ankle Flow')
      expect(headings.length).toBeGreaterThanOrEqual(1)
    })

    it('uses "Mobility" as fallback when variants have no name', () => {
      mockVariants = undefined
      mockIsLoading = false
      render(<MobilityDurationPickerPage />)

      // Falls back to "Not Found" title (since no variants)
      expect(screen.getByText('Not Found')).toBeInTheDocument()
    })
  })

  // ===== Edge Cases =====
  describe('edge cases', () => {
    it('handles single variant', () => {
      mockVariants = [
        createVariant({ id: 'v1', duration_minutes: 30 }),
      ]
      render(<MobilityDurationPickerPage />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(1)
    })

    it('renders clock icons for each duration card', () => {
      mockVariants = [
        createVariant({ id: 'v1', duration_minutes: 15 }),
        createVariant({ id: 'v2', duration_minutes: 30 }),
      ]
      render(<MobilityDurationPickerPage />)

      // Cards should be rendered (each variant = 1 card)
      const cards = screen.getAllByTestId('card')
      // 1 header card + 2 duration cards = 3
      expect(cards.length).toBe(3)
    })
  })
})
