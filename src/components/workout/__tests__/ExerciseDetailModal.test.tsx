/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { ExerciseDetailModal } from '../ExerciseDetailModal'

// Mock motion/react (Modal uses it)
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const {
        variants, initial, animate, exit, transition,
        layoutId, whileTap, ...rest
      } = props
      return <div {...rest}>{children as React.ReactNode}</div>
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock useReducedMotion (Modal uses it)
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}))

// Mock useExerciseInfo
vi.mock('@/hooks/useExerciseGif', () => ({
  useExerciseInfo: vi.fn().mockReturnValue({
    exercise: null,
    gifUrl: null,
    instructions: [],
    isLoading: false,
    error: null,
  }),
}))

import { useExerciseInfo } from '@/hooks/useExerciseGif'
const mockUseExerciseInfo = vi.mocked(useExerciseInfo)

describe('ExerciseDetailModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    exerciseName: 'Bench Press',
    notes: null as string | null | undefined,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseExerciseInfo.mockReturnValue({
      exercise: null,
      gifUrl: null,
      instructions: [],
      isLoading: false,
      error: null,
    })
  })

  describe('rendering when closed', () => {
    it('does not render content when isOpen is false', () => {
      render(<ExerciseDetailModal {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Bench Press')).not.toBeInTheDocument()
    })
  })

  describe('rendering when open', () => {
    it('renders the exercise name as the modal title', () => {
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
    })

    it('does not pass exerciseName to useExerciseInfo when modal is closed', () => {
      render(<ExerciseDetailModal {...defaultProps} isOpen={false} />)
      expect(mockUseExerciseInfo).toHaveBeenCalledWith(undefined)
    })

    it('passes exerciseName to useExerciseInfo when modal is open', () => {
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(mockUseExerciseInfo).toHaveBeenCalledWith('Bench Press')
    })
  })

  describe('loading state', () => {
    it('shows loading spinner when data is loading', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: null,
        gifUrl: null,
        instructions: [],
        isLoading: true,
        error: null,
      })
      const { container } = render(<ExerciseDetailModal {...defaultProps} />)
      // The Loader2 icon has animate-spin class
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('GIF display', () => {
    it('renders exercise GIF when gifUrl is available', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: null,
        gifUrl: 'https://example.com/bench-press.gif',
        instructions: [],
        isLoading: false,
        error: null,
      })
      render(<ExerciseDetailModal {...defaultProps} />)
      const img = screen.getByAltText('Bench Press demonstration')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/bench-press.gif')
    })

    it('does not render GIF when gifUrl is null', () => {
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(screen.queryByAltText('Bench Press demonstration')).not.toBeInTheDocument()
    })

    it('hides GIF when image fails to load', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: null,
        gifUrl: 'https://example.com/broken.gif',
        instructions: [],
        isLoading: false,
        error: null,
      })
      render(<ExerciseDetailModal {...defaultProps} />)
      const img = screen.getByAltText('Bench Press demonstration')
      fireEvent.error(img)
      // After error, the img section should be hidden
      expect(screen.queryByAltText('Bench Press demonstration')).not.toBeInTheDocument()
    })

    it('shows image with opacity-0 before load completes', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: null,
        gifUrl: 'https://example.com/bench-press.gif',
        instructions: [],
        isLoading: false,
        error: null,
      })
      render(<ExerciseDetailModal {...defaultProps} />)
      const img = screen.getByAltText('Bench Press demonstration')
      expect(img.className).toContain('opacity-0')
    })

    it('shows image with opacity-100 after load completes', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: null,
        gifUrl: 'https://example.com/bench-press.gif',
        instructions: [],
        isLoading: false,
        error: null,
      })
      render(<ExerciseDetailModal {...defaultProps} />)
      const img = screen.getByAltText('Bench Press demonstration')
      fireEvent.load(img)
      expect(img.className).toContain('opacity-100')
    })
  })

  describe('exercise details from API', () => {
    it('renders body parts when available', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: {
          bodyParts: ['chest', 'shoulders'],
          equipments: ['barbell'],
          targetMuscles: ['pectorals'],
          secondaryMuscles: ['deltoids', 'triceps'],
          gifUrl: null,
          instructions: [],
        } as any,
        gifUrl: null,
        instructions: [],
        isLoading: false,
        error: null,
      })
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(screen.getByText('chest')).toBeInTheDocument()
      expect(screen.getByText('shoulders')).toBeInTheDocument()
    })

    it('renders equipment when available', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: {
          bodyParts: [],
          equipments: ['barbell', 'bench'],
          targetMuscles: [],
          secondaryMuscles: [],
        } as any,
        gifUrl: null,
        instructions: [],
        isLoading: false,
        error: null,
      })
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(screen.getByText('barbell')).toBeInTheDocument()
      expect(screen.getByText('bench')).toBeInTheDocument()
    })

    it('renders target muscles when available', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: {
          bodyParts: [],
          equipments: [],
          targetMuscles: ['pectorals', 'triceps'],
          secondaryMuscles: [],
        } as any,
        gifUrl: null,
        instructions: [],
        isLoading: false,
        error: null,
      })
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(screen.getByText('pectorals')).toBeInTheDocument()
      expect(screen.getByText('triceps')).toBeInTheDocument()
    })

    it('renders secondary muscles (max 3)', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: {
          bodyParts: [],
          equipments: [],
          targetMuscles: [],
          secondaryMuscles: ['deltoids', 'triceps', 'biceps', 'forearms'],
        } as any,
        gifUrl: null,
        instructions: [],
        isLoading: false,
        error: null,
      })
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(screen.getByText('deltoids')).toBeInTheDocument()
      expect(screen.getByText('triceps')).toBeInTheDocument()
      expect(screen.getByText('biceps')).toBeInTheDocument()
      // fourth muscle should not be shown (sliced to 3)
      expect(screen.queryByText('forearms')).not.toBeInTheDocument()
    })
  })

  describe('instructions', () => {
    it('renders instructions when available', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: null,
        gifUrl: null,
        instructions: ['Lie on bench', 'Grip the bar', 'Lower to chest'],
        isLoading: false,
        error: null,
      })
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(screen.getByText('How to Perform')).toBeInTheDocument()
      expect(screen.getByText('Lie on bench')).toBeInTheDocument()
      expect(screen.getByText('Grip the bar')).toBeInTheDocument()
      expect(screen.getByText('Lower to chest')).toBeInTheDocument()
    })

    it('shows numbered steps', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: null,
        gifUrl: null,
        instructions: ['Step one', 'Step two'],
        isLoading: false,
        error: null,
      })
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('strips "Step:X" prefix from instructions', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: null,
        gifUrl: null,
        instructions: ['Step:1 Lie on bench', 'Step:2 Grip the bar'],
        isLoading: false,
        error: null,
      })
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(screen.getByText('Lie on bench')).toBeInTheDocument()
      expect(screen.getByText('Grip the bar')).toBeInTheDocument()
      expect(screen.queryByText(/Step:1/)).not.toBeInTheDocument()
    })

    it('does not render instructions section when empty', () => {
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(screen.queryByText('How to Perform')).not.toBeInTheDocument()
    })
  })

  describe('notes', () => {
    it('renders user notes when provided', () => {
      render(<ExerciseDetailModal {...defaultProps} notes="Keep elbows tucked" />)
      expect(screen.getByText('Your Notes')).toBeInTheDocument()
      expect(screen.getByText('Keep elbows tucked')).toBeInTheDocument()
    })

    it('does not render notes section when notes is null', () => {
      render(<ExerciseDetailModal {...defaultProps} notes={null} />)
      expect(screen.queryByText('Your Notes')).not.toBeInTheDocument()
    })

    it('does not render notes section when notes is undefined', () => {
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(screen.queryByText('Your Notes')).not.toBeInTheDocument()
    })

    it('adds separator when both API data and notes exist', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: {
          bodyParts: ['chest'],
          equipments: [],
          targetMuscles: [],
          secondaryMuscles: [],
        } as any,
        gifUrl: null,
        instructions: [],
        isLoading: false,
        error: null,
      })
      render(<ExerciseDetailModal {...defaultProps} notes="Keep elbows tucked" />)
      const notesSection = screen.getByText('Your Notes').closest('div')
      expect(notesSection?.className).toContain('border-t')
    })
  })

  describe('no data fallback', () => {
    it('shows "no details available" when no API data and no notes', () => {
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(screen.getByText('No additional details available for this exercise.')).toBeInTheDocument()
    })

    it('shows "exercise not found" when no API data but notes exist', () => {
      render(<ExerciseDetailModal {...defaultProps} notes="Some notes" />)
      expect(screen.getByText('Exercise details not found in database.')).toBeInTheDocument()
    })

    it('does not show fallback when API data exists', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: {
          bodyParts: ['chest'],
          equipments: [],
          targetMuscles: [],
          secondaryMuscles: [],
        } as any,
        gifUrl: null,
        instructions: [],
        isLoading: false,
        error: null,
      })
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(screen.queryByText('No additional details available for this exercise.')).not.toBeInTheDocument()
    })

    it('does not show fallback when loading', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: null,
        gifUrl: null,
        instructions: [],
        isLoading: true,
        error: null,
      })
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(screen.queryByText('No additional details available for this exercise.')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows error message when API returns error', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: null,
        gifUrl: null,
        instructions: [],
        isLoading: false,
        error: new Error('API Error'),
      })
      render(<ExerciseDetailModal {...defaultProps} />)
      expect(screen.getByText(/Could not load exercise details/)).toBeInTheDocument()
    })

    it('includes "showing notes only" when error and notes present', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: null,
        gifUrl: null,
        instructions: [],
        isLoading: false,
        error: new Error('API Error'),
      })
      render(<ExerciseDetailModal {...defaultProps} notes="My notes" />)
      expect(screen.getByText(/Showing your notes only/)).toBeInTheDocument()
    })

    it('does not include "showing notes only" when error without notes', () => {
      mockUseExerciseInfo.mockReturnValue({
        exercise: null,
        gifUrl: null,
        instructions: [],
        isLoading: false,
        error: new Error('API Error'),
      })
      render(<ExerciseDetailModal {...defaultProps} />)
      const errorText = screen.getByText(/Could not load exercise details/)
      expect(errorText.textContent).not.toContain('Showing your notes only')
    })
  })

  describe('modal interaction', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn()
      render(<ExerciseDetailModal {...defaultProps} onClose={onClose} />)
      // Modal renders an X button
      const buttons = screen.getAllByRole('button')
      // The close button in Modal component
      const closeButton = buttons.find(b => b.querySelector('svg'))
      if (closeButton) {
        fireEvent.click(closeButton)
        expect(onClose).toHaveBeenCalled()
      }
    })

    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn()
      render(<ExerciseDetailModal {...defaultProps} onClose={onClose} />)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalled()
    })
  })
})
