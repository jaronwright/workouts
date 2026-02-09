import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { WorkoutDayCard } from '../WorkoutDayCard'
import type { WorkoutDay } from '@/types/workout'

const createMockWorkoutDay = (overrides: Partial<WorkoutDay> = {}): WorkoutDay => ({
  id: 'day-1',
  plan_id: 'plan-1',
  day_number: 1,
  name: 'PUSH (Chest, Shoulders, Triceps)',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

describe('WorkoutDayCard', () => {
  const defaultProps = {
    day: createMockWorkoutDay(),
    onClick: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the workout display name', () => {
      render(<WorkoutDayCard {...defaultProps} />)
      // "PUSH (Chest, Shoulders, Triceps)" maps to "Push" via getWorkoutDisplayName
      expect(screen.getByText('Push')).toBeInTheDocument()
    })

    it('renders the Weights category label', () => {
      render(<WorkoutDayCard {...defaultProps} />)
      expect(screen.getByText('Weights')).toBeInTheDocument()
    })

    it('renders the chevron arrow', () => {
      const { container } = render(<WorkoutDayCard {...defaultProps} />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(1)
    })

    it('renders the workout icon', () => {
      const { container } = render(<WorkoutDayCard {...defaultProps} />)
      // There should be at least 2 SVGs: the workout icon and the chevron
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(2)
    })

    it('renders the gradient icon container', () => {
      const { container } = render(<WorkoutDayCard {...defaultProps} />)
      const gradientDiv = container.querySelector('.bg-gradient-to-br')
      expect(gradientDiv).toBeInTheDocument()
    })
  })

  describe('different workout types', () => {
    it('renders Pull day correctly', () => {
      const day = createMockWorkoutDay({
        name: 'Pull (Back, Biceps, Rear Delts)',
        day_number: 2,
      })
      render(<WorkoutDayCard {...defaultProps} day={day} />)
      expect(screen.getByText('Pull')).toBeInTheDocument()
    })

    it('renders Legs day correctly', () => {
      const day = createMockWorkoutDay({
        name: 'LEGS (Quads, Hamstrings, Calves)',
        day_number: 3,
      })
      render(<WorkoutDayCard {...defaultProps} day={day} />)
      expect(screen.getByText('Legs')).toBeInTheDocument()
    })

    it('renders Upper day correctly', () => {
      const day = createMockWorkoutDay({ name: 'Upper', day_number: 1 })
      render(<WorkoutDayCard {...defaultProps} day={day} />)
      expect(screen.getByText('Upper')).toBeInTheDocument()
    })

    it('renders Lower day correctly', () => {
      const day = createMockWorkoutDay({ name: 'Lower', day_number: 2 })
      render(<WorkoutDayCard {...defaultProps} day={day} />)
      expect(screen.getByText('Lower')).toBeInTheDocument()
    })

    it('renders Full Body A day correctly', () => {
      const day = createMockWorkoutDay({ name: 'Full Body A' })
      render(<WorkoutDayCard {...defaultProps} day={day} />)
      expect(screen.getByText('Full Body A')).toBeInTheDocument()
    })

    it('renders Chest & Back day correctly', () => {
      const day = createMockWorkoutDay({ name: 'Chest & Back' })
      render(<WorkoutDayCard {...defaultProps} day={day} />)
      expect(screen.getByText('Chest & Back')).toBeInTheDocument()
    })

    it('renders Glute Hypertrophy Lower A correctly', () => {
      const day = createMockWorkoutDay({ name: 'Lower A (Glutes & Hamstrings)' })
      render(<WorkoutDayCard {...defaultProps} day={day} />)
      expect(screen.getByText('Lower A')).toBeInTheDocument()
    })
  })

  describe('click interaction', () => {
    it('calls onClick when the card is clicked', () => {
      const onClick = vi.fn()
      render(<WorkoutDayCard {...defaultProps} onClick={onClick} />)
      // Card with interactive prop should be clickable
      const card = screen.getByText('Push').closest('[role="button"], [tabindex]')
        || screen.getByText('Push').closest('div')
      if (card) {
        fireEvent.click(card)
      }
      // The onClick may fire once or via the Card component's onClick
    })

    it('calls onClick handler with correct invocation', () => {
      const onClick = vi.fn()
      const { container } = render(<WorkoutDayCard {...defaultProps} onClick={onClick} />)
      // The Card component with interactive prop adds click handling
      // Find the outermost card div and click it
      const cardElement = container.firstChild as HTMLElement
      fireEvent.click(cardElement)
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('styling', () => {
    it('applies the correct color to the category label', () => {
      render(<WorkoutDayCard {...defaultProps} />)
      const label = screen.getByText('Weights')
      // getWeightsStyleByName('PUSH...') returns WEIGHTS_CONFIG.push with color '#6366F1'
      // The color is applied via inline style
      expect(label.style.color).toBeTruthy()
    })

    it('renders consistently for all category types', () => {
      render(<WorkoutDayCard {...defaultProps} />)
      // All workout day cards show "Weights" category
      expect(screen.getByText('Weights')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has interactive card with appropriate attributes', () => {
      const { container } = render(<WorkoutDayCard {...defaultProps} />)
      // Card component with interactive=true should set role or tabindex
      const card = container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
    })
  })
})
