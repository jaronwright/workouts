import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { ProgressionBadge } from '../ProgressionBadge'
import type { ProgressionSuggestion } from '@/services/progressionService'

const mockSuggestion: ProgressionSuggestion = {
  exerciseId: 'exercise-1',
  currentWeight: 100,
  suggestedWeight: 105,
  increase: 5,
  reason: 'You completed all sets with good form'
}

describe('ProgressionBadge', () => {
  describe('rendering', () => {
    it('renders the suggested weight', () => {
      render(<ProgressionBadge suggestion={mockSuggestion} />)
      expect(screen.getByText(/Try 105 lbs/)).toBeInTheDocument()
    })

    it('renders the increase amount', () => {
      render(<ProgressionBadge suggestion={mockSuggestion} />)
      expect(screen.getByText(/\(\+5\)/)).toBeInTheDocument()
    })

    it('shows the reason as a title attribute', () => {
      render(<ProgressionBadge suggestion={mockSuggestion} />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'You completed all sets with good form')
    })

    it('renders the TrendingUp icon', () => {
      render(<ProgressionBadge suggestion={mockSuggestion} />)
      const button = screen.getByRole('button')
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn()
      render(<ProgressionBadge suggestion={mockSuggestion} onClick={handleClick} />)

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not throw when clicked without onClick handler', () => {
      render(<ProgressionBadge suggestion={mockSuggestion} />)
      expect(() => {
        fireEvent.click(screen.getByRole('button'))
      }).not.toThrow()
    })
  })

  describe('different suggestion values', () => {
    it('renders correctly with a small increase', () => {
      const suggestion: ProgressionSuggestion = {
        exerciseId: 'exercise-2',
        currentWeight: 20,
        suggestedWeight: 22.5,
        increase: 2.5,
        reason: 'Consistent performance over 3 sessions'
      }
      render(<ProgressionBadge suggestion={suggestion} />)
      expect(screen.getByText(/Try 22.5 lbs/)).toBeInTheDocument()
      expect(screen.getByText(/\(\+2.5\)/)).toBeInTheDocument()
    })

    it('renders correctly with a large increase', () => {
      const suggestion: ProgressionSuggestion = {
        exerciseId: 'exercise-3',
        currentWeight: 200,
        suggestedWeight: 210,
        increase: 10,
        reason: 'Major compound lift progression'
      }
      render(<ProgressionBadge suggestion={suggestion} />)
      expect(screen.getByText(/Try 210 lbs/)).toBeInTheDocument()
      expect(screen.getByText(/\(\+10\)/)).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Major compound lift progression')
    })
  })
})
