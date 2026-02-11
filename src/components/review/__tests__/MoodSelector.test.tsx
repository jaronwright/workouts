import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { MoodSelector } from '../MoodSelector'

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
  MOOD_OPTIONS: [
    { value: 'stressed', emoji: '\u{1F624}', label: 'Stressed', color: '#ef4444', bgColor: '#ef444415' },
    { value: 'tired', emoji: '\u{1F634}', label: 'Tired', color: '#6366f1', bgColor: '#6366f115' },
    { value: 'neutral', emoji: '\u{1F610}', label: 'Neutral', color: '#6b7280', bgColor: '#6b728015' },
    { value: 'good', emoji: '\u{1F60A}', label: 'Good', color: '#22c55e', bgColor: '#22c55e15' },
    { value: 'great', emoji: '\u{1F525}', label: 'Great', color: '#f97316', bgColor: '#f9731615' },
  ],
}))

describe('MoodSelector', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ────────────────────────────────────────────────────────
  // Rendering
  // ────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders 5 mood option buttons', () => {
      render(<MoodSelector value={null} onChange={mockOnChange} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(5)
    })

    it('displays label when provided', () => {
      render(<MoodSelector value={null} onChange={mockOnChange} label="How do you feel?" />)
      expect(screen.getByText('How do you feel?')).toBeInTheDocument()
    })

    it('does not display label when not provided', () => {
      render(<MoodSelector value={null} onChange={mockOnChange} />)
      // No label element should be rendered above mood buttons
      const labels = screen.queryByText('How do you feel?')
      expect(labels).not.toBeInTheDocument()
    })

    it('each button shows correct emoji and label text', () => {
      render(<MoodSelector value={null} onChange={mockOnChange} />)
      expect(screen.getByText('Great')).toBeInTheDocument()
      expect(screen.getByText('Good')).toBeInTheDocument()
      expect(screen.getByText('Neutral')).toBeInTheDocument()
      expect(screen.getByText('Tired')).toBeInTheDocument()
      expect(screen.getByText('Stressed')).toBeInTheDocument()
    })

    it('renders emoji for each mood option', () => {
      render(<MoodSelector value={null} onChange={mockOnChange} />)
      expect(screen.getByText('\u{1F525}')).toBeInTheDocument()
      expect(screen.getByText('\u{1F60A}')).toBeInTheDocument()
      expect(screen.getByText('\u{1F610}')).toBeInTheDocument()
      expect(screen.getByText('\u{1F634}')).toBeInTheDocument()
      expect(screen.getByText('\u{1F624}')).toBeInTheDocument()
    })
  })

  // ────────────────────────────────────────────────────────
  // Selection
  // ────────────────────────────────────────────────────────

  describe('selection', () => {
    it('highlights the selected mood button with ring-2 class', () => {
      const { container } = render(<MoodSelector value="great" onChange={mockOnChange} />)
      const buttons = container.querySelectorAll('button')
      // Last button (Great) should have ring-2 (reversed order: stressed, tired, neutral, good, great)
      expect(buttons[4].className).toContain('ring-2')
    })

    it('does not highlight unselected mood buttons with ring-2', () => {
      const { container } = render(<MoodSelector value="great" onChange={mockOnChange} />)
      const buttons = container.querySelectorAll('button')
      // Other buttons should NOT have ring-2
      expect(buttons[0].className).not.toContain('ring-2')
      expect(buttons[1].className).not.toContain('ring-2')
      expect(buttons[2].className).not.toContain('ring-2')
      expect(buttons[3].className).not.toContain('ring-2')
    })

    it('applies background color to selected mood button', () => {
      render(<MoodSelector value="good" onChange={mockOnChange} />)
      const buttons = screen.getAllByRole('button')
      // Good is at index 3 (reversed order: stressed, tired, neutral, good, great)
      expect(buttons[3].getAttribute('style')).toContain('background-color')
    })

    it('no background color on unselected mood buttons', () => {
      render(<MoodSelector value="good" onChange={mockOnChange} />)
      const buttons = screen.getAllByRole('button')
      // Stressed at index 0 should not have bg color when good is selected
      expect(buttons[0].style.backgroundColor).toBe('')
    })

    it('no buttons are highlighted when value is null', () => {
      const { container } = render(<MoodSelector value={null} onChange={mockOnChange} />)
      const buttons = container.querySelectorAll('button')
      buttons.forEach((btn) => {
        expect(btn.className).not.toContain('ring-2')
      })
    })
  })

  // ────────────────────────────────────────────────────────
  // Interaction
  // ────────────────────────────────────────────────────────

  describe('interaction', () => {
    it('calls onChange with the correct mood value when clicked', () => {
      render(<MoodSelector value={null} onChange={mockOnChange} />)
      const buttons = screen.getAllByRole('button')
      // First button is now Stressed (reversed order)
      fireEvent.click(buttons[0])
      expect(mockOnChange).toHaveBeenCalledWith('stressed')
    })

    it('calls onChange with correct value for each mood', () => {
      render(<MoodSelector value={null} onChange={mockOnChange} />)
      const buttons = screen.getAllByRole('button')
      // Reversed order: stressed, tired, neutral, good, great
      const expected = ['stressed', 'tired', 'neutral', 'good', 'great']

      buttons.forEach((btn, i) => {
        fireEvent.click(btn)
        expect(mockOnChange).toHaveBeenCalledWith(expected[i])
      })
      expect(mockOnChange).toHaveBeenCalledTimes(5)
    })

    it('calls onChange even when mood is already selected', () => {
      render(<MoodSelector value="tired" onChange={mockOnChange} />)
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[1]) // click Tired (index 1 in reversed order)
      expect(mockOnChange).toHaveBeenCalledWith('tired')
    })
  })
})
