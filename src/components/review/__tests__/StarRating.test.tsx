import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { StarRating } from '../StarRating'

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    button: ({ children, whileHover, whileTap, animate, transition, ...props }: any) =>
      createElement('button', props, children),
    span: ({ children, initial, animate, ...props }: any) =>
      createElement('span', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}))

describe('StarRating', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ────────────────────────────────────────────────────────
  // Rendering
  // ────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders 5 star buttons', () => {
      render(<StarRating value={0} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(5)
    })

    it('renders with value of 0 (no stars filled)', () => {
      const { container } = render(<StarRating value={0} />)
      const filledStars = container.querySelectorAll('.fill-amber-400')
      expect(filledStars).toHaveLength(0)
    })

    it('renders correct number of filled stars for value=3', () => {
      const { container } = render(<StarRating value={3} />)
      const filledStars = container.querySelectorAll('.fill-amber-400')
      expect(filledStars).toHaveLength(3)
    })

    it('renders all 5 stars filled for value=5', () => {
      const { container } = render(<StarRating value={5} />)
      const filledStars = container.querySelectorAll('.fill-amber-400')
      expect(filledStars).toHaveLength(5)
    })

    it('displays rating label for the current value', () => {
      render(<StarRating value={4} />)
      expect(screen.getByText('Great')).toBeInTheDocument()
    })

    it('displays "Poor" label for rating 1', () => {
      render(<StarRating value={1} />)
      expect(screen.getByText('Poor')).toBeInTheDocument()
    })

    it('displays "Amazing" label for rating 5', () => {
      render(<StarRating value={5} />)
      expect(screen.getByText('Amazing')).toBeInTheDocument()
    })

    it('does not display label when value is 0', () => {
      render(<StarRating value={0} />)
      expect(screen.queryByText('Poor')).not.toBeInTheDocument()
      expect(screen.queryByText('Good')).not.toBeInTheDocument()
    })
  })

  // ────────────────────────────────────────────────────────
  // Sizes
  // ────────────────────────────────────────────────────────

  describe('sizes', () => {
    it('renders with small size', () => {
      const { container } = render(<StarRating value={3} size="sm" />)
      const smallStars = container.querySelectorAll('.w-5')
      expect(smallStars.length).toBeGreaterThan(0)
    })

    it('renders with medium size (default)', () => {
      const { container } = render(<StarRating value={3} />)
      const medStars = container.querySelectorAll('.w-7')
      expect(medStars.length).toBeGreaterThan(0)
    })

    it('renders with large size', () => {
      const { container } = render(<StarRating value={3} size="lg" />)
      const lgStars = container.querySelectorAll('.w-9')
      expect(lgStars.length).toBeGreaterThan(0)
    })
  })

  // ────────────────────────────────────────────────────────
  // Interaction
  // ────────────────────────────────────────────────────────

  describe('interaction', () => {
    it('calls onChange when a star is clicked', () => {
      render(<StarRating value={0} onChange={mockOnChange} />)
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[2]) // 3rd star (index 2 -> value 3)
      expect(mockOnChange).toHaveBeenCalledWith(3)
    })

    it('calls onChange with correct value for each star', () => {
      render(<StarRating value={0} onChange={mockOnChange} />)
      const buttons = screen.getAllByRole('button')

      for (let i = 0; i < 5; i++) {
        fireEvent.click(buttons[i])
        expect(mockOnChange).toHaveBeenCalledWith(i + 1)
      }
      expect(mockOnChange).toHaveBeenCalledTimes(5)
    })

    it('does not call onChange when no handler is provided', () => {
      render(<StarRating value={0} />)
      const buttons = screen.getAllByRole('button')
      // Should not throw
      fireEvent.click(buttons[0])
    })
  })

  // ────────────────────────────────────────────────────────
  // Readonly mode
  // ────────────────────────────────────────────────────────

  describe('readonly mode', () => {
    it('disables all buttons when readonly', () => {
      render(<StarRating value={3} readonly />)
      const buttons = screen.getAllByRole('button')
      buttons.forEach((btn) => {
        expect(btn).toBeDisabled()
      })
    })

    it('buttons are enabled when not readonly', () => {
      render(<StarRating value={3} />)
      const buttons = screen.getAllByRole('button')
      buttons.forEach((btn) => {
        expect(btn).not.toBeDisabled()
      })
    })

    it('still shows the correct number of filled stars in readonly', () => {
      const { container } = render(<StarRating value={4} readonly />)
      const filledStars = container.querySelectorAll('.fill-amber-400')
      expect(filledStars).toHaveLength(4)
    })

    it('still shows rating label in readonly', () => {
      render(<StarRating value={5} readonly />)
      expect(screen.getByText('Amazing')).toBeInTheDocument()
    })
  })
})
