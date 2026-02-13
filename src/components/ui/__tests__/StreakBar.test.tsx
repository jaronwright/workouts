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
    span: ({ children, ...props }: any) => {
      const {
        initial, animate, exit, transition, ...htmlProps
      } = props
      return <span {...htmlProps}>{children}</span>
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

  describe('showDates prop and dateNumber display', () => {
    const daysWithDates = [
      { label: 'M', completed: true, isToday: false, color: '#10b981', dateNumber: 10 },
      { label: 'T', completed: false, isToday: true, workoutColor: '#6366F1', dateNumber: 11 },
      { label: 'W', completed: false, isToday: false, dateNumber: 12 },
      { label: 'T', completed: false, isToday: false },
      { label: 'F', completed: false, isToday: false, isRest: true, dateNumber: 14 },
    ]

    it('renders date numbers when showDates is true and dateNumber is set', () => {
      render(<StreakBar days={daysWithDates} showDates />)
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('11')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('14')).toBeInTheDocument()
    })

    it('does not render date numbers when showDates is false (default)', () => {
      render(<StreakBar days={daysWithDates} />)
      expect(screen.queryByText('10')).not.toBeInTheDocument()
      expect(screen.queryByText('11')).not.toBeInTheDocument()
      expect(screen.queryByText('12')).not.toBeInTheDocument()
      expect(screen.queryByText('14')).not.toBeInTheDocument()
    })

    it('does not render dateNumber for days where dateNumber is undefined', () => {
      render(<StreakBar days={daysWithDates} showDates />)
      // Thursday has no dateNumber — there should be no "13" or extra number
      // Only 4 date numbers should exist (10, 11, 12, 14)
      const dateSpans = screen.getAllByText(/^\d+$/)
      expect(dateSpans).toHaveLength(4)
    })

    it('each day renders its own dateNumber independently', () => {
      const days = [
        { label: 'M', completed: false, isToday: false, dateNumber: 5 },
        { label: 'T', completed: false, isToday: false, dateNumber: 6 },
        { label: 'W', completed: false, isToday: false, dateNumber: 7 },
      ]
      render(<StreakBar days={days} showDates />)
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('6')).toBeInTheDocument()
      expect(screen.getByText('7')).toBeInTheDocument()
    })

    it('applies bold styling to today date number', () => {
      render(<StreakBar days={daysWithDates} showDates />)
      const todayDateNumber = screen.getByText('11')
      expect(todayDateNumber.className).toContain('font-semibold')
      expect(todayDateNumber.className).toContain('text-[var(--color-text)]')
    })

    it('applies muted styling to non-today date numbers', () => {
      render(<StreakBar days={daysWithDates} showDates />)
      const mondayDateNumber = screen.getByText('10')
      expect(mondayDateNumber.className).toContain('font-semibold')
      expect(mondayDateNumber.className).toContain('text-[var(--color-text-muted)]')
    })
  })

  describe('workout name display', () => {
    it('renders workoutName below circles', () => {
      const days = [
        { label: 'M', completed: false, isToday: false, workoutName: 'Push' },
        { label: 'T', completed: false, isToday: false, workoutName: 'Pull' },
        { label: 'W', completed: false, isToday: true, workoutName: 'Legs' },
      ]
      render(<StreakBar days={days} />)
      expect(screen.getByText('Push')).toBeInTheDocument()
      expect(screen.getByText('Pull')).toBeInTheDocument()
      expect(screen.getByText('Legs')).toBeInTheDocument()
    })

    it('shows "Rest" text for rest days without workoutName', () => {
      const days = [
        { label: 'S', completed: false, isToday: false, isRest: true },
        { label: 'S', completed: false, isToday: false, isRest: true },
      ]
      render(<StreakBar days={days} />)
      expect(screen.getAllByText('Rest')).toHaveLength(2)
    })

    it('uses workoutName over "Rest" fallback when both isRest and workoutName are set', () => {
      const days = [
        { label: 'S', completed: false, isToday: false, isRest: true, workoutName: 'Yoga' },
      ]
      render(<StreakBar days={days} />)
      expect(screen.getByText('Yoga')).toBeInTheDocument()
      expect(screen.queryByText('Rest')).not.toBeInTheDocument()
    })

    it('applies bold styling to today workout name', () => {
      const days = [
        { label: 'M', completed: false, isToday: true, workoutName: 'Push' },
      ]
      render(<StreakBar days={days} />)
      const nameEl = screen.getByText('Push')
      expect(nameEl.className).toContain('font-semibold')
      expect(nameEl.className).toContain('text-[var(--color-text)]')
    })

    it('applies muted styling to non-today workout name', () => {
      const days = [
        { label: 'M', completed: false, isToday: false, workoutName: 'Push' },
      ]
      render(<StreakBar days={days} />)
      const nameEl = screen.getByText('Push')
      expect(nameEl.className).toContain('text-[var(--color-text-muted)]')
    })
  })

  describe('workoutCount display', () => {
    it('shows count number inside circle when workoutCount > 1 and not completed', () => {
      const days = [
        { label: 'M', completed: false, isToday: false, workoutCount: 2 },
        { label: 'T', completed: false, isToday: false, workoutCount: 3 },
      ]
      render(<StreakBar days={days} />)
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('shows check icon instead of count when day is completed', () => {
      const days = [
        { label: 'M', completed: true, isToday: false, workoutCount: 2, color: '#10b981' },
      ]
      const { container } = render(<StreakBar days={days} />)
      // Count should NOT be shown since completed takes priority
      expect(screen.queryByText('2')).not.toBeInTheDocument()
      // Check icon is an SVG from lucide
      const circle = container.querySelector('.w-7') as HTMLElement
      expect(circle).toBeTruthy()
    })

    it('does not show count when workoutCount is 1', () => {
      const days = [
        { label: 'M', completed: false, isToday: false, workoutCount: 1 },
      ]
      render(<StreakBar days={days} />)
      // workoutCount of 1 should not render the count number (falls through to icon)
      expect(screen.queryByText('1')).not.toBeInTheDocument()
    })

    it('applies larger text style for today count', () => {
      const days = [
        { label: 'M', completed: false, isToday: true, workoutCount: 2, workoutColor: '#6366F1' },
      ]
      render(<StreakBar days={days} />)
      const countEl = screen.getByText('2')
      expect(countEl.className).toContain('font-bold')
      expect(countEl.className).toContain('text-xs')
    })

    it('applies smaller text style for non-today count', () => {
      const days = [
        { label: 'M', completed: false, isToday: false, workoutCount: 2 },
      ]
      render(<StreakBar days={days} />)
      const countEl = screen.getByText('2')
      expect(countEl.className).toContain('font-bold')
      expect(countEl.className).toContain('text-[10px]')
    })
  })
})
