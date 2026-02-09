import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@/test/utils'
import { PRCelebration } from '../PRCelebration'
import type { PRCheckResult } from '@/services/prService'

describe('PRCelebration', () => {
  const createMockResult = (overrides: Partial<PRCheckResult> = {}): PRCheckResult => ({
    isNewPR: true,
    previousPR: 130,
    newWeight: 135,
    improvement: 5,
    exerciseName: 'Bench Press',
    ...overrides,
  })

  const defaultProps = {
    result: createMockResult(),
    onComplete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders the "New PR!" heading', () => {
      render(<PRCelebration {...defaultProps} />)
      expect(screen.getByText('New PR!')).toBeInTheDocument()
    })

    it('renders the exercise name', () => {
      render(<PRCelebration {...defaultProps} />)
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
    })

    it('renders the new weight', () => {
      render(<PRCelebration {...defaultProps} />)
      expect(screen.getByText('135 lbs')).toBeInTheDocument()
    })

    it('renders the improvement when available', () => {
      render(<PRCelebration {...defaultProps} />)
      expect(screen.getByText('+5 lbs from previous best!')).toBeInTheDocument()
    })

    it('does not render improvement when improvement is null', () => {
      const result = createMockResult({ improvement: null })
      render(<PRCelebration {...defaultProps} result={result} />)
      expect(screen.queryByText(/from previous best/)).not.toBeInTheDocument()
    })

    it('renders the "Tap to dismiss" instruction', () => {
      render(<PRCelebration {...defaultProps} />)
      expect(screen.getByText('Tap to dismiss')).toBeInTheDocument()
    })

    it('renders the trophy icon', () => {
      const { container } = render(<PRCelebration {...defaultProps} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('confetti particles', () => {
    it('renders 50 confetti particles', () => {
      const { container } = render(<PRCelebration {...defaultProps} />)
      const particles = container.querySelectorAll('.animate-fall')
      expect(particles.length).toBe(50)
    })
  })

  describe('vibration', () => {
    it('calls navigator.vibrate on mount', () => {
      render(<PRCelebration {...defaultProps} />)
      expect(navigator.vibrate).toHaveBeenCalledWith([100, 50, 100, 50, 200])
    })
  })

  describe('auto-dismiss', () => {
    it('auto-dismisses after 3 seconds', () => {
      render(<PRCelebration {...defaultProps} />)
      expect(screen.getByText('New PR!')).toBeInTheDocument()

      // Advance past the 3 second timeout
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      // The component sets visible to false, then calls onComplete after 300ms
      expect(screen.queryByText('New PR!')).not.toBeInTheDocument()
    })

    it('calls onComplete after auto-dismiss animation delay', () => {
      const onComplete = vi.fn()
      render(<PRCelebration {...defaultProps} onComplete={onComplete} />)

      // After 3 seconds, visible becomes false and a 300ms timeout is set
      act(() => {
        vi.advanceTimersByTime(3000)
      })
      expect(onComplete).not.toHaveBeenCalled()

      // After the additional 300ms, onComplete is called
      act(() => {
        vi.advanceTimersByTime(300)
      })
      expect(onComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('manual dismiss', () => {
    it('calls onComplete when the card is clicked', () => {
      const onComplete = vi.fn()
      render(<PRCelebration {...defaultProps} onComplete={onComplete} />)
      // The PR card has an onClick handler
      fireEvent.click(screen.getByText('New PR!').closest('div.pointer-events-auto')!)
      expect(onComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('different exercise data', () => {
    it('renders correctly for a squat PR', () => {
      const result = createMockResult({
        exerciseName: 'Barbell Squat',
        newWeight: 315,
        improvement: 10,
      })
      render(<PRCelebration {...defaultProps} result={result} />)
      expect(screen.getByText('Barbell Squat')).toBeInTheDocument()
      expect(screen.getByText('315 lbs')).toBeInTheDocument()
      expect(screen.getByText('+10 lbs from previous best!')).toBeInTheDocument()
    })

    it('renders correctly for a first-time PR (no previous)', () => {
      const result = createMockResult({
        exerciseName: 'Deadlift',
        newWeight: 225,
        previousPR: null,
        improvement: null,
      })
      render(<PRCelebration {...defaultProps} result={result} />)
      expect(screen.getByText('Deadlift')).toBeInTheDocument()
      expect(screen.getByText('225 lbs')).toBeInTheDocument()
      expect(screen.queryByText(/from previous best/)).not.toBeInTheDocument()
    })
  })

  describe('cleanup', () => {
    it('clears the timeout on unmount', () => {
      const { unmount } = render(<PRCelebration {...defaultProps} />)
      unmount()
      // No errors should occur when timers fire after unmount
      vi.advanceTimersByTime(5000)
    })
  })
})
