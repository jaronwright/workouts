import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { PerformanceTagPicker } from '../PerformanceTagPicker'

const { MockIcon } = vi.hoisted(() => {
  const MockIcon = (props: any) => createElement('svg', props)
  return { MockIcon }
})

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    button: ({ children, whileHover, whileTap, animate, transition, variants, ...props }: any) =>
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
  PERFORMANCE_TAG_OPTIONS: [
    { value: 'felt_strong', label: 'Felt Strong', icon: MockIcon, color: '#22c55e' },
    { value: 'new_pr', label: 'New PR', icon: MockIcon, color: '#f59e0b' },
    { value: 'pumped', label: 'Pumped', icon: MockIcon, color: '#ec4899' },
    { value: 'focused', label: 'Focused', icon: MockIcon, color: '#6366f1' },
    { value: 'good_form', label: 'Good Form', icon: MockIcon, color: '#06b6d4' },
    { value: 'breakthrough', label: 'Breakthrough', icon: MockIcon, color: '#f97316' },
    { value: 'heavy', label: 'Heavy', icon: MockIcon, color: '#78716c' },
    { value: 'light_day', label: 'Light Day', icon: MockIcon, color: '#a3a3a3' },
    { value: 'tired', label: 'Tired', icon: MockIcon, color: '#6366f1' },
    { value: 'sore', label: 'Sore', icon: MockIcon, color: '#ef4444' },
    { value: 'rushed', label: 'Rushed', icon: MockIcon, color: '#f97316' },
    { value: 'distracted', label: 'Distracted', icon: MockIcon, color: '#a855f7' },
  ],
}))

describe('PerformanceTagPicker', () => {
  const mockOnToggle = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ────────────────────────────────────────────────────────
  // Rendering
  // ────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders all 12 tag buttons', () => {
      render(<PerformanceTagPicker selectedTags={[]} onToggle={mockOnToggle} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(12)
    })

    it('each tag shows its label text', () => {
      render(<PerformanceTagPicker selectedTags={[]} onToggle={mockOnToggle} />)
      expect(screen.getByText('Felt Strong')).toBeInTheDocument()
      expect(screen.getByText('New PR')).toBeInTheDocument()
      expect(screen.getByText('Pumped')).toBeInTheDocument()
      expect(screen.getByText('Focused')).toBeInTheDocument()
      expect(screen.getByText('Good Form')).toBeInTheDocument()
      expect(screen.getByText('Breakthrough')).toBeInTheDocument()
      expect(screen.getByText('Heavy')).toBeInTheDocument()
      expect(screen.getByText('Light Day')).toBeInTheDocument()
      expect(screen.getByText('Tired')).toBeInTheDocument()
      expect(screen.getByText('Sore')).toBeInTheDocument()
      expect(screen.getByText('Rushed')).toBeInTheDocument()
      expect(screen.getByText('Distracted')).toBeInTheDocument()
    })

    it('renders an icon for each tag', () => {
      const { container } = render(
        <PerformanceTagPicker selectedTags={[]} onToggle={mockOnToggle} />
      )
      const icons = container.querySelectorAll('svg')
      expect(icons).toHaveLength(12)
    })
  })

  // ────────────────────────────────────────────────────────
  // Selection styling
  // ────────────────────────────────────────────────────────

  describe('selection styling', () => {
    it('shows selected tags with border-transparent class', () => {
      const { container } = render(
        <PerformanceTagPicker selectedTags={['felt_strong', 'pumped']} onToggle={mockOnToggle} />
      )
      const buttons = container.querySelectorAll('button')
      // First button (Felt Strong) is selected
      expect(buttons[0].className).toContain('border-transparent')
      // Third button (Pumped) is selected
      expect(buttons[2].className).toContain('border-transparent')
    })

    it('unselected tags have border class but not border-transparent', () => {
      const { container } = render(
        <PerformanceTagPicker selectedTags={['felt_strong']} onToggle={mockOnToggle} />
      )
      const buttons = container.querySelectorAll('button')
      // Second button (New PR) is NOT selected
      expect(buttons[1].className).toContain('border')
      expect(buttons[1].className).not.toContain('border-transparent')
    })

    it('no tags are highlighted when selectedTags is empty', () => {
      const { container } = render(
        <PerformanceTagPicker selectedTags={[]} onToggle={mockOnToggle} />
      )
      const buttons = container.querySelectorAll('button')
      buttons.forEach((btn) => {
        expect(btn.className).not.toContain('border-transparent')
      })
    })

    it('multiple tags can be selected simultaneously', () => {
      const { container } = render(
        <PerformanceTagPicker
          selectedTags={['new_pr', 'focused', 'heavy']}
          onToggle={mockOnToggle}
        />
      )
      const buttons = container.querySelectorAll('button')
      expect(buttons[1].className).toContain('border-transparent') // New PR
      expect(buttons[3].className).toContain('border-transparent') // Focused
      expect(buttons[6].className).toContain('border-transparent') // Heavy
    })

    it('selected tag has background color applied', () => {
      render(
        <PerformanceTagPicker selectedTags={['felt_strong']} onToggle={mockOnToggle} />
      )
      const buttons = screen.getAllByRole('button')
      expect(buttons[0].style.backgroundColor).toBeTruthy()
    })
  })

  // ────────────────────────────────────────────────────────
  // Interaction
  // ────────────────────────────────────────────────────────

  describe('interaction', () => {
    it('calls onToggle with correct tag value when clicked', () => {
      render(<PerformanceTagPicker selectedTags={[]} onToggle={mockOnToggle} />)
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])
      expect(mockOnToggle).toHaveBeenCalledWith('felt_strong')
    })

    it('calls onToggle for each tag when clicked', () => {
      render(<PerformanceTagPicker selectedTags={[]} onToggle={mockOnToggle} />)
      const buttons = screen.getAllByRole('button')
      const expectedValues = [
        'felt_strong', 'new_pr', 'pumped', 'focused', 'good_form', 'breakthrough',
        'heavy', 'light_day', 'tired', 'sore', 'rushed', 'distracted',
      ]

      buttons.forEach((btn, i) => {
        fireEvent.click(btn)
        expect(mockOnToggle).toHaveBeenCalledWith(expectedValues[i])
      })
      expect(mockOnToggle).toHaveBeenCalledTimes(12)
    })

    it('calls onToggle when clicking an already selected tag', () => {
      render(
        <PerformanceTagPicker selectedTags={['new_pr']} onToggle={mockOnToggle} />
      )
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[1]) // Click New PR (already selected)
      expect(mockOnToggle).toHaveBeenCalledWith('new_pr')
    })
  })
})
