import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { DifficultyRating } from '../DifficultyRating'

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    button: ({ children, whileHover, whileTap, animate, transition, ...props }: any) =>
      createElement('button', props, children),
    span: ({ children, initial, animate, ...props }: any) =>
      createElement('span', props, children),
    div: ({ children, initial, animate, exit, transition, variants, ...props }: any) =>
      createElement('div', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}))

vi.mock('@/config/animationConfig', () => ({
  springs: { default: {}, snappy: {} },
  staggerContainer: {},
  staggerChild: {},
}))

vi.mock('@/config/reviewConfig', () => ({
  DIFFICULTY_LABELS: { 1: 'Easy', 2: 'Moderate', 3: 'Challenging', 4: 'Hard', 5: 'Brutal' } as Record<number, string>,
  DIFFICULTY_COLORS: { 1: '#22c55e', 2: '#84cc16', 3: '#eab308', 4: '#f97316', 5: '#ef4444' } as Record<number, string>,
}))

describe('DifficultyRating', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ────────────────────────────────────────────────────────
  // Rendering
  // ────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders 5 difficulty buttons', () => {
      render(<DifficultyRating value={null} onChange={mockOnChange} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(5)
    })

    it('renders "Difficulty" header text', () => {
      render(<DifficultyRating value={null} onChange={mockOnChange} />)
      expect(screen.getByText('Difficulty')).toBeInTheDocument()
    })

    it('renders all 5 difficulty labels', () => {
      render(<DifficultyRating value={null} onChange={mockOnChange} />)
      expect(screen.getByText('Easy')).toBeInTheDocument()
      expect(screen.getByText('Moderate')).toBeInTheDocument()
      expect(screen.getByText('Challenging')).toBeInTheDocument()
      expect(screen.getByText('Hard')).toBeInTheDocument()
      expect(screen.getByText('Brutal')).toBeInTheDocument()
    })
  })

  // ────────────────────────────────────────────────────────
  // Selection display
  // ────────────────────────────────────────────────────────

  describe('selection display', () => {
    it('shows label text when value is set', () => {
      render(<DifficultyRating value={4} onChange={mockOnChange} />)
      // The label appears twice: once in the button row, once as the selected label span
      const hardLabels = screen.getAllByText('Hard')
      expect(hardLabels.length).toBeGreaterThanOrEqual(2)
    })

    it('does not show extra label when value is null', () => {
      render(<DifficultyRating value={null} onChange={mockOnChange} />)
      // Each label appears only once (in the button row)
      const easyLabels = screen.getAllByText('Easy')
      expect(easyLabels).toHaveLength(1)
    })

    it('fills bars up to the selected level', () => {
      const { container } = render(<DifficultyRating value={3} onChange={mockOnChange} />)
      const bars = container.querySelectorAll('.h-3')
      // First 3 should have their active color (not border color), last 2 should have border color
      expect(bars[0].getAttribute('style')).not.toContain('var(--color-border)')
      expect(bars[1].getAttribute('style')).not.toContain('var(--color-border)')
      expect(bars[2].getAttribute('style')).not.toContain('var(--color-border)')
      expect(bars[3].getAttribute('style')).toContain('var(--color-border)')
      expect(bars[4].getAttribute('style')).toContain('var(--color-border)')
    })

    it('no bars are filled when value is null', () => {
      const { container } = render(<DifficultyRating value={null} onChange={mockOnChange} />)
      const bars = container.querySelectorAll('.h-3')
      bars.forEach((bar) => {
        expect(bar.getAttribute('style')).toContain('var(--color-border)')
      })
    })

    it('all bars are filled when value is 5', () => {
      const { container } = render(<DifficultyRating value={5} onChange={mockOnChange} />)
      const bars = container.querySelectorAll('.h-3')
      bars.forEach((bar) => {
        expect(bar.getAttribute('style')).not.toContain('var(--color-border)')
      })
    })

    it('shows "Brutal" label when value is 5', () => {
      render(<DifficultyRating value={5} onChange={mockOnChange} />)
      const brutalLabels = screen.getAllByText('Brutal')
      expect(brutalLabels.length).toBeGreaterThanOrEqual(2)
    })

    it('shows "Easy" label when value is 1', () => {
      render(<DifficultyRating value={1} onChange={mockOnChange} />)
      const easyLabels = screen.getAllByText('Easy')
      expect(easyLabels.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ────────────────────────────────────────────────────────
  // Interaction
  // ────────────────────────────────────────────────────────

  describe('interaction', () => {
    it('calls onChange with correct level when clicked', () => {
      render(<DifficultyRating value={null} onChange={mockOnChange} />)
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[3]) // 4th button -> level 4
      expect(mockOnChange).toHaveBeenCalledWith(4)
    })

    it('calls onChange with correct value for each level', () => {
      render(<DifficultyRating value={null} onChange={mockOnChange} />)
      const buttons = screen.getAllByRole('button')

      for (let i = 0; i < 5; i++) {
        fireEvent.click(buttons[i])
        expect(mockOnChange).toHaveBeenCalledWith(i + 1)
      }
      expect(mockOnChange).toHaveBeenCalledTimes(5)
    })

    it('calls onChange even when the same level is already selected', () => {
      render(<DifficultyRating value={2} onChange={mockOnChange} />)
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[1])
      expect(mockOnChange).toHaveBeenCalledWith(2)
    })
  })
})
