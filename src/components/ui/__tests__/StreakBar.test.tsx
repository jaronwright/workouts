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
    { label: 'W', completed: false, isToday: true, workoutColor: '#6366F1' },
    { label: 'T', completed: false, isToday: false, workoutColor: '#8B5CF6' },
    { label: 'F', completed: false, isToday: false },
    { label: 'S', completed: false, isToday: false, isRest: true },
    { label: 'S', completed: false, isToday: false, isRest: true },
  ]

  it('renders all day labels with Today for isToday', () => {
    render(<StreakBar days={sampleDays} />)
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument() // isToday shows "Today" instead of "W"
    expect(screen.getByText('F')).toBeInTheDocument()
    // Two T's remain (the completed one and the non-today one)
    expect(screen.getAllByText('T')).toHaveLength(2)
    expect(screen.getAllByText('S')).toHaveLength(2)
  })

  it('applies completed styles with background color', () => {
    render(<StreakBar days={sampleDays} />)
    const mondayLabel = screen.getByText('M')
    const mondayWrapper = mondayLabel.parentElement as HTMLElement
    // Completed non-today days use w-7 circles
    const mondayCircle = mondayWrapper.querySelector('.w-7') as HTMLElement
    expect(mondayCircle).toBeTruthy()
    expect(mondayCircle!.className).toContain('text-white')
    expect(mondayCircle!.className).toContain('shadow-sm')
    expect(mondayCircle!.style.backgroundColor).toBe('rgb(16, 185, 129)')
  })

  it('applies today styles for non-completed today (filled with workout color)', () => {
    render(<StreakBar days={sampleDays} />)
    const todayLabel = screen.getByText('Today')
    const todayWrapper = todayLabel.parentElement as HTMLElement
    // Today uses w-9 (larger circle)
    const todayCircle = todayWrapper.querySelector('.w-9') as HTMLElement
    expect(todayCircle).toBeTruthy()
    // Today non-rest gets a filled background with workout color
    expect(todayCircle!.className).toContain('text-white')
    expect(todayCircle!.style.backgroundColor).toBe('rgb(99, 102, 241)')
  })

  it('applies default styles for non-completed non-today days', () => {
    render(<StreakBar days={sampleDays} />)
    const fridayLabel = screen.getByText('F')
    const fridayWrapper = fridayLabel.parentElement as HTMLElement
    const fridayCircle = fridayWrapper.querySelector('.w-7') as HTMLElement
    expect(fridayCircle).toBeTruthy()
    expect(fridayCircle!.className).toContain('border-dashed')
    expect(fridayCircle!.className).toContain('text-[var(--color-text-muted)]')
  })

  it('renders the correct number of day items', () => {
    const { container } = render(<StreakBar days={sampleDays} />)
    // Today is w-9, other 6 are w-7
    const todayCircles = container.querySelectorAll('.w-9.h-9')
    const otherCircles = container.querySelectorAll('.w-7.h-7')
    expect(todayCircles).toHaveLength(1)
    expect(otherCircles).toHaveLength(6)
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
    const wrapper = label.parentElement as HTMLElement
    const circle = wrapper.querySelector('.w-7') as HTMLElement
    expect(circle!.style.backgroundColor).toBe('var(--color-primary)')
  })

  it('renders empty streak bar with no days', () => {
    const { container } = render(<StreakBar days={[]} />)
    const circles = container.querySelectorAll('.w-7.h-7, .w-9.h-9')
    expect(circles).toHaveLength(0)
  })
})
