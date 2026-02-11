import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import { ReviewBadge } from '../ReviewBadge'

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
  RATING_COLORS: {
    1: '#ef4444',
    2: '#f97316',
    3: '#eab308',
    4: '#22c55e',
    5: '#10b981',
  } as Record<number, string>,
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Star: (props: any) => createElement('svg', { ...props, 'data-testid': 'star-icon' }),
}))

describe('ReviewBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ────────────────────────────────────────────────────────
  // Rendering
  // ────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the rating number', () => {
      render(<ReviewBadge rating={4} />)
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('renders star icon', () => {
      render(<ReviewBadge rating={3} />)
      expect(screen.getByTestId('star-icon')).toBeInTheDocument()
    })

    it('renders as an inline-flex span element', () => {
      const { container } = render(<ReviewBadge rating={4} />)
      const badge = container.firstChild as HTMLElement
      expect(badge.tagName.toLowerCase()).toBe('span')
      expect(badge.className).toContain('inline-flex')
    })
  })

  // ────────────────────────────────────────────────────────
  // Rating display
  // ────────────────────────────────────────────────────────

  describe('rating display', () => {
    it('renders decimal ratings with one decimal place (e.g., 4.5)', () => {
      render(<ReviewBadge rating={4.5} />)
      expect(screen.getByText('4.5')).toBeInTheDocument()
    })

    it('renders integer ratings without decimal (e.g., 4)', () => {
      render(<ReviewBadge rating={4} />)
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.queryByText('4.0')).not.toBeInTheDocument()
    })

    it('renders rating of 1 correctly', () => {
      render(<ReviewBadge rating={1} />)
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('renders rating of 5 correctly', () => {
      render(<ReviewBadge rating={5} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('renders 3.7 as "3.7"', () => {
      render(<ReviewBadge rating={3.7} />)
      expect(screen.getByText('3.7')).toBeInTheDocument()
    })

    it('renders 2.0 without decimal (integer)', () => {
      render(<ReviewBadge rating={2} />)
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  // ────────────────────────────────────────────────────────
  // Color mapping
  // ────────────────────────────────────────────────────────

  describe('color mapping', () => {
    it('rounds rating for color lookup (3.7 rounds to 4)', () => {
      const { container } = render(<ReviewBadge rating={3.7} />)
      const badge = container.firstChild as HTMLElement
      // Math.round(3.7) = 4 -> color #22c55e = rgb(34, 197, 94)
      expect(badge.style.color).toBe('rgb(34, 197, 94)')
    })

    it('uses color for rating 1', () => {
      const { container } = render(<ReviewBadge rating={1} />)
      const badge = container.firstChild as HTMLElement
      // #ef4444 = rgb(239, 68, 68)
      expect(badge.style.color).toBe('rgb(239, 68, 68)')
    })

    it('uses color for rating 5', () => {
      const { container } = render(<ReviewBadge rating={5} />)
      const badge = container.firstChild as HTMLElement
      // #10b981 = rgb(16, 185, 129)
      expect(badge.style.color).toBe('rgb(16, 185, 129)')
    })
  })

  // ────────────────────────────────────────────────────────
  // Sizes
  // ────────────────────────────────────────────────────────

  describe('sizes', () => {
    it('defaults to "sm" size', () => {
      const { container } = render(<ReviewBadge rating={4} />)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('text-[10px]')
    })

    it('renders with "md" size', () => {
      const { container } = render(<ReviewBadge rating={4} size="md" />)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain('text-xs')
    })

    it('sm size star icon has w-3 class', () => {
      const { container } = render(<ReviewBadge rating={3} size="sm" />)
      const icon = container.querySelector('svg')!
      expect(icon.getAttribute('class')).toContain('w-3')
    })

    it('md size star icon has w-3.5 class', () => {
      const { container } = render(<ReviewBadge rating={3} size="md" />)
      const icon = container.querySelector('svg')!
      expect(icon.getAttribute('class')).toContain('w-3.5')
    })
  })
})
