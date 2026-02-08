/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import { AnimatedCounter } from '../AnimatedCounter'

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useMotionValue: () => ({ set: vi.fn() }),
  useSpring: (v: any) => v,
  useTransform: () => ({ on: () => vi.fn() }),
}))

const mockUseReducedMotion = vi.fn(() => false)
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
}))

describe('AnimatedCounter', () => {
  it('renders the value', () => {
    mockUseReducedMotion.mockReturnValue(false)
    render(<AnimatedCounter value={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('displays value directly with reduced motion', () => {
    mockUseReducedMotion.mockReturnValue(true)
    render(<AnimatedCounter value={100} />)
    const span = screen.getByText('100')
    expect(span).toBeInTheDocument()
    expect(span.tagName).toBe('SPAN')
  })

  it('renders as a span element', () => {
    mockUseReducedMotion.mockReturnValue(false)
    render(<AnimatedCounter value={7} />)
    const span = screen.getByText('7')
    expect(span.tagName).toBe('SPAN')
  })

  it('applies custom className', () => {
    mockUseReducedMotion.mockReturnValue(true)
    render(<AnimatedCounter value={50} className="text-2xl font-bold" />)
    const span = screen.getByText('50')
    expect(span.className).toContain('text-2xl')
    expect(span.className).toContain('font-bold')
  })

  it('applies className when motion is enabled', () => {
    mockUseReducedMotion.mockReturnValue(false)
    render(<AnimatedCounter value={25} className="counter-class" />)
    const span = screen.getByText('25')
    expect(span.className).toContain('counter-class')
  })

  it('renders different values correctly', () => {
    mockUseReducedMotion.mockReturnValue(true)
    const { rerender } = render(<AnimatedCounter value={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()

    rerender(<AnimatedCounter value={999} />)
    expect(screen.getByText('999')).toBeInTheDocument()
  })
})
