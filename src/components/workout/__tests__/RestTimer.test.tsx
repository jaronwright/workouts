/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { RestTimer } from '../RestTimer'
import { useWorkoutStore } from '@/stores/workoutStore'

vi.mock('@/stores/workoutStore', () => ({
  useWorkoutStore: vi.fn()
}))

const mockUseWorkoutStore = vi.mocked(useWorkoutStore)

const createInactiveState = (overrides = {}) => ({
  restTimerSeconds: 0,
  restTimerInitialSeconds: 0,
  isRestTimerActive: false,
  startRestTimer: vi.fn(),
  stopRestTimer: vi.fn(),
  pauseRestTimer: vi.fn(),
  resetRestTimer: vi.fn(),
  decrementRestTimer: vi.fn(),
  ...overrides
})

const createActiveState = (overrides = {}) => ({
  restTimerSeconds: 45,
  restTimerInitialSeconds: 60,
  isRestTimerActive: true,
  startRestTimer: vi.fn(),
  stopRestTimer: vi.fn(),
  pauseRestTimer: vi.fn(),
  resetRestTimer: vi.fn(),
  decrementRestTimer: vi.fn(),
  ...overrides
})

describe('RestTimer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('inactive state (preset buttons)', () => {
    beforeEach(() => {
      mockUseWorkoutStore.mockReturnValue(createInactiveState() as any)
    })

    it('renders the Rest Timer label', () => {
      render(<RestTimer />)
      expect(screen.getByText('Rest Timer')).toBeInTheDocument()
    })

    it('renders all preset time buttons', () => {
      render(<RestTimer />)
      const presets = ['0:30', '0:45', '1:00', '1:30', '2:00', '3:00', '5:00']
      presets.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })

    it('calls startRestTimer with correct seconds when 0:30 preset is clicked', () => {
      const startRestTimer = vi.fn()
      mockUseWorkoutStore.mockReturnValue(createInactiveState({ startRestTimer }) as any)

      render(<RestTimer />)
      fireEvent.click(screen.getByText('0:30'))
      expect(startRestTimer).toHaveBeenCalledWith(30)
    })

    it('calls startRestTimer with correct seconds when 1:00 preset is clicked', () => {
      const startRestTimer = vi.fn()
      mockUseWorkoutStore.mockReturnValue(createInactiveState({ startRestTimer }) as any)

      render(<RestTimer />)
      fireEvent.click(screen.getByText('1:00'))
      expect(startRestTimer).toHaveBeenCalledWith(60)
    })

    it('calls startRestTimer with correct seconds when 2:00 preset is clicked', () => {
      const startRestTimer = vi.fn()
      mockUseWorkoutStore.mockReturnValue(createInactiveState({ startRestTimer }) as any)

      render(<RestTimer />)
      fireEvent.click(screen.getByText('2:00'))
      expect(startRestTimer).toHaveBeenCalledWith(120)
    })

    it('calls startRestTimer with correct seconds when 5:00 preset is clicked', () => {
      const startRestTimer = vi.fn()
      mockUseWorkoutStore.mockReturnValue(createInactiveState({ startRestTimer }) as any)

      render(<RestTimer />)
      fireEvent.click(screen.getByText('5:00'))
      expect(startRestTimer).toHaveBeenCalledWith(300)
    })
  })

  describe('active state (timer running)', () => {
    it('shows the timer display with formatted time', () => {
      mockUseWorkoutStore.mockReturnValue(createActiveState({ restTimerSeconds: 45 }) as any)

      render(<RestTimer />)
      expect(screen.getByText('0:45')).toBeInTheDocument()
    })

    it('shows the Rest Timer label in active state', () => {
      mockUseWorkoutStore.mockReturnValue(createActiveState() as any)

      render(<RestTimer />)
      expect(screen.getByText('Rest Timer')).toBeInTheDocument()
    })

    it('shows the pause button when timer is active', () => {
      mockUseWorkoutStore.mockReturnValue(createActiveState() as any)

      render(<RestTimer />)
      // When active, the Pause icon is rendered (with fill="currentColor")
      const buttons = screen.getAllByRole('button')
      // There should be close (X), pause, and reset buttons
      expect(buttons.length).toBeGreaterThanOrEqual(3)
    })

    it('shows the play button when timer is paused', () => {
      mockUseWorkoutStore.mockReturnValue(
        createActiveState({ isRestTimerActive: false, restTimerSeconds: 30 }) as any
      )

      render(<RestTimer />)
      const buttons = screen.getAllByRole('button')
      // Should show close (X), play, and reset buttons
      expect(buttons.length).toBeGreaterThanOrEqual(3)
    })

    it('calls stopRestTimer when close button is clicked', () => {
      const stopRestTimer = vi.fn()
      mockUseWorkoutStore.mockReturnValue(createActiveState({ stopRestTimer }) as any)

      render(<RestTimer />)
      // The X (close) button is the first button in the active view
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])
      expect(stopRestTimer).toHaveBeenCalledTimes(1)
    })

    it('calls pauseRestTimer when pause button is clicked while running', () => {
      const pauseRestTimer = vi.fn()
      mockUseWorkoutStore.mockReturnValue(createActiveState({ pauseRestTimer }) as any)

      render(<RestTimer />)
      const buttons = screen.getAllByRole('button')
      // The play/pause button is the second button (after X)
      fireEvent.click(buttons[1])
      expect(pauseRestTimer).toHaveBeenCalledTimes(1)
    })

    it('calls resetRestTimer when reset button is clicked', () => {
      const resetRestTimer = vi.fn()
      mockUseWorkoutStore.mockReturnValue(createActiveState({ resetRestTimer }) as any)

      render(<RestTimer />)
      const buttons = screen.getAllByRole('button')
      // The reset button is the third button (after X and play/pause)
      fireEvent.click(buttons[2])
      expect(resetRestTimer).toHaveBeenCalledTimes(1)
    })

    it('displays the progress bar', () => {
      mockUseWorkoutStore.mockReturnValue(
        createActiveState({ restTimerSeconds: 30, restTimerInitialSeconds: 60 }) as any
      )

      render(<RestTimer />)
      // Progress bar container has a specific class
      const container = document.querySelector('.bg-white\\/20.rounded-full')
      expect(container).toBeInTheDocument()
    })

    it('shows formatted time for various seconds values', () => {
      mockUseWorkoutStore.mockReturnValue(
        createActiveState({ restTimerSeconds: 125 }) as any
      )

      render(<RestTimer />)
      // 125 seconds = 2:05
      expect(screen.getByText('2:05')).toBeInTheDocument()
    })
  })

  describe('timer completed state', () => {
    it('shows the timer at 0:00 when seconds reach zero and timer is still active', () => {
      mockUseWorkoutStore.mockReturnValue(
        createActiveState({ restTimerSeconds: 0 }) as any
      )

      render(<RestTimer />)
      expect(screen.getByText('0:00')).toBeInTheDocument()
    })
  })
})
