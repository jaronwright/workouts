/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import { AnimatedCard } from '../AnimatedCard'

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const {
        initial, animate, exit, transition, whileTap, layoutId, ...htmlProps
      } = props
      return <div {...htmlProps}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

const mockUseReducedMotion = vi.fn(() => false)
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
}))

describe('AnimatedCard', () => {
  it('renders children', () => {
    render(<AnimatedCard><p>Card content</p></AnimatedCard>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders with motion wrapper when reduced motion is not preferred', () => {
    mockUseReducedMotion.mockReturnValue(false)
    const { container } = render(<AnimatedCard><p>Animated</p></AnimatedCard>)
    // motion.div is mocked to a plain div, which wraps the Card
    // The Card itself is inside a motion.div wrapper, so there are nested divs
    const content = screen.getByText('Animated')
    expect(content).toBeInTheDocument()
    // The outermost element should be the motion.div wrapper (mocked as div)
    // containing a Card (also a div)
    expect(container.querySelectorAll('div').length).toBeGreaterThanOrEqual(2)
  })

  it('renders Card directly when reduced motion is preferred', () => {
    mockUseReducedMotion.mockReturnValue(true)
    const { container } = render(<AnimatedCard><p>Static</p></AnimatedCard>)
    const content = screen.getByText('Static')
    expect(content).toBeInTheDocument()
    // Without the motion wrapper, there should be fewer wrapping divs
    // The Card renders directly without a motion.div parent
    const firstChild = container.firstChild as HTMLElement
    // Card component applies specific base styles
    expect(firstChild.className).toContain('rounded-[var(--radius-xl)]')
  })

  it('passes variant prop to Card', () => {
    mockUseReducedMotion.mockReturnValue(true)
    const { container } = render(
      <AnimatedCard variant="elevated"><p>Elevated</p></AnimatedCard>
    )
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('shadow-[var(--shadow-md)]')
  })

  it('passes interactive prop to Card', () => {
    mockUseReducedMotion.mockReturnValue(true)
    const { container } = render(
      <AnimatedCard interactive><p>Interactive</p></AnimatedCard>
    )
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('cursor-pointer')
  })
})
