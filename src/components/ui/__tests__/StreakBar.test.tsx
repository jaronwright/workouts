/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import { StreakBar } from '../StreakBar'

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

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}))

describe('StreakBar', () => {
  const sampleDays = [
    { label: 'M', completed: true, isToday: false, color: '#10b981' },
    { label: 'T', completed: true, isToday: false, color: '#10b981' },
    { label: 'W', completed: false, isToday: true },
    { label: 'T', completed: false, isToday: false },
    { label: 'F', completed: false, isToday: false },
    { label: 'S', completed: false, isToday: false },
    { label: 'S', completed: false, isToday: false },
  ]

  it('renders all day labels', () => {
    render(<StreakBar days={sampleDays} />)
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(screen.getByText('W')).toBeInTheDocument()
    expect(screen.getByText('F')).toBeInTheDocument()
    // There are two T's and two S's, getAllByText for those
    expect(screen.getAllByText('T')).toHaveLength(2)
    expect(screen.getAllByText('S')).toHaveLength(2)
  })

  it('applies completed styles with background color', () => {
    render(<StreakBar days={sampleDays} />)
    const mondayLabel = screen.getByText('M')
    const mondayCircle = mondayLabel.closest('.w-8') as HTMLElement
    expect(mondayCircle).toBeTruthy()
    expect(mondayCircle!.className).toContain('text-white')
    expect(mondayCircle!.className).toContain('shadow-sm')
    expect(mondayCircle!.style.backgroundColor).toBe('rgb(16, 185, 129)')
  })

  it('applies today styles for non-completed today', () => {
    render(<StreakBar days={sampleDays} />)
    const wednesdayLabel = screen.getByText('W')
    const wednesdayCircle = wednesdayLabel.closest('.w-8') as HTMLElement
    expect(wednesdayCircle).toBeTruthy()
    expect(wednesdayCircle!.className).toContain('border-2')
    expect(wednesdayCircle!.className).toContain('border-[var(--color-primary)]')
  })

  it('applies default styles for non-completed non-today days', () => {
    render(<StreakBar days={sampleDays} />)
    const fridayLabel = screen.getByText('F')
    const fridayCircle = fridayLabel.closest('.w-8') as HTMLElement
    expect(fridayCircle).toBeTruthy()
    expect(fridayCircle!.className).toContain('border-dashed')
    expect(fridayCircle!.className).toContain('text-[var(--color-text-muted)]')
  })

  it('renders the correct number of day items', () => {
    const { container } = render(<StreakBar days={sampleDays} />)
    const circles = container.querySelectorAll('.w-8.h-8')
    expect(circles).toHaveLength(7)
  })

  it('applies custom className to the container', () => {
    const { container } = render(<StreakBar days={sampleDays} className="mt-4" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('mt-4')
  })

  it('uses default primary color when day.color is not provided', () => {
    const daysWithoutColor = [
      { label: 'M', completed: true, isToday: false },
    ]
    render(<StreakBar days={daysWithoutColor} />)
    const label = screen.getByText('M')
    const circle = label.closest('.w-8') as HTMLElement
    expect(circle!.style.backgroundColor).toBe('var(--color-primary)')
  })

  it('renders empty streak bar with no days', () => {
    const { container } = render(<StreakBar days={[]} />)
    const circles = container.querySelectorAll('.w-8.h-8')
    expect(circles).toHaveLength(0)
  })
})
