import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { PostWorkoutReview } from '../PostWorkoutReview'
import { useReviewStore } from '@/stores/reviewStore'
import type { ReviewDraft } from '@/stores/reviewStore'

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, custom, variants, initial, animate, exit, transition, layoutId, whileTap, whileHover, ...props }: any) =>
      createElement('div', props, children),
    button: ({ children, whileHover, whileTap, animate, transition, ...props }: any) =>
      createElement('button', props, children),
    span: ({ children, initial, animate, transition, ...props }: any) =>
      createElement('span', props, children),
    p: ({ children, initial, animate, transition, ...props }: any) =>
      createElement('p', props, children),
  },
  AnimatePresence: ({ children, mode }: any) => children,
}))

// Mock useReducedMotion
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}))

// Mock useCreateReview
const mockMutateAsync = vi.fn()
vi.mock('@/hooks/useReview', () => ({
  useCreateReview: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

const defaultDraft: ReviewDraft = {
  overallRating: 0,
  difficultyRating: null,
  energyLevel: null,
  moodBefore: null,
  moodAfter: null,
  performanceTags: [],
  reflection: '',
  highlights: '',
  improvements: '',
}

describe('PostWorkoutReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMutateAsync.mockResolvedValue({})

    // Reset store to initial state
    useReviewStore.setState({
      isReviewModalOpen: false,
      currentSessionId: null,
      currentTemplateSessionId: null,
      sessionType: null,
      workoutDurationMinutes: null,
      draft: { ...defaultDraft },
      step: 0,
      totalSteps: 4,
    })
  })

  // ────────────────────────────────────────────────────────
  // Visibility
  // ────────────────────────────────────────────────────────

  describe('visibility', () => {
    it('renders nothing when modal is not open', () => {
      const { container } = render(<PostWorkoutReview />)
      expect(container.firstChild).toBeNull()
    })

    it('renders modal content when open', () => {
      useReviewStore.setState({ isReviewModalOpen: true })
      render(<PostWorkoutReview />)
      expect(screen.getByText('How was your workout?')).toBeInTheDocument()
    })
  })

  // ────────────────────────────────────────────────────────
  // Step display
  // ────────────────────────────────────────────────────────

  describe('step display', () => {
    it('shows step 0 title and subtitle', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 0 })
      render(<PostWorkoutReview />)
      expect(screen.getByText('How was your workout?')).toBeInTheDocument()
      expect(screen.getByText('Rate your overall experience')).toBeInTheDocument()
    })

    it('shows step 1 title when navigated', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 1 })
      render(<PostWorkoutReview />)
      expect(screen.getByText('How did you feel?')).toBeInTheDocument()
    })

    it('shows step 2 title', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 2 })
      render(<PostWorkoutReview />)
      expect(screen.getByText('Tag your session')).toBeInTheDocument()
    })

    it('shows step 3 title', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 3 })
      render(<PostWorkoutReview />)
      expect(screen.getByText('Reflect')).toBeInTheDocument()
    })
  })

  // ────────────────────────────────────────────────────────
  // Navigation buttons
  // ────────────────────────────────────────────────────────

  describe('navigation', () => {
    it('shows Next button on step 0', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 0, draft: { ...defaultDraft, overallRating: 4 } })
      render(<PostWorkoutReview />)
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('Next button is disabled when overallRating is 0 on step 0', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 0, draft: { ...defaultDraft, overallRating: 0 } })
      render(<PostWorkoutReview />)
      const nextBtn = screen.getByText('Next').closest('button')
      expect(nextBtn).toBeDisabled()
    })

    it('Next button is enabled when overallRating > 0 on step 0', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 0, draft: { ...defaultDraft, overallRating: 3 } })
      render(<PostWorkoutReview />)
      const nextBtn = screen.getByText('Next').closest('button')
      expect(nextBtn).not.toBeDisabled()
    })

    it('does not show Back button on step 0', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 0 })
      render(<PostWorkoutReview />)
      expect(screen.queryByText('Back')).not.toBeInTheDocument()
    })

    it('shows Back button on step 1', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 1 })
      render(<PostWorkoutReview />)
      expect(screen.getByText('Back')).toBeInTheDocument()
    })

    it('shows Skip button on optional steps (not last)', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 1 })
      render(<PostWorkoutReview />)
      expect(screen.getByText('Skip')).toBeInTheDocument()
    })

    it('does not show Skip button on step 0 (required)', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 0 })
      render(<PostWorkoutReview />)
      expect(screen.queryByText('Skip')).not.toBeInTheDocument()
    })

    it('shows Submit button on last step', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 3 })
      render(<PostWorkoutReview />)
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })

    it('does not show Skip on the last step', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 3 })
      render(<PostWorkoutReview />)
      expect(screen.queryByText('Skip')).not.toBeInTheDocument()
    })

    it('clicking Next advances the step in the store', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 0, draft: { ...defaultDraft, overallRating: 4 } })
      render(<PostWorkoutReview />)

      fireEvent.click(screen.getByText('Next'))

      expect(useReviewStore.getState().step).toBe(1)
    })

    it('clicking Back goes to previous step', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 2 })
      render(<PostWorkoutReview />)

      fireEvent.click(screen.getByText('Back'))

      expect(useReviewStore.getState().step).toBe(1)
    })
  })

  // ────────────────────────────────────────────────────────
  // Close behavior
  // ────────────────────────────────────────────────────────

  describe('close behavior', () => {
    it('closes modal when X button is clicked', () => {
      useReviewStore.setState({ isReviewModalOpen: true })
      render(<PostWorkoutReview />)

      // Find the close button (has X icon) - it's a button with the X
      const buttons = screen.getAllByRole('button')
      // The X close button is in the header area - find by looking for the non-Next/Back button
      const closeButton = buttons.find(btn => {
        return !btn.textContent?.includes('Next') &&
               !btn.textContent?.includes('Back') &&
               !btn.textContent?.includes('Submit') &&
               !btn.textContent?.includes('Skip') &&
               !btn.textContent?.includes('Poor') &&
               !btn.textContent?.includes('Fair') &&
               !btn.textContent?.includes('Good') &&
               !btn.textContent?.includes('Great') &&
               !btn.textContent?.includes('Amazing')
      })

      if (closeButton) {
        fireEvent.click(closeButton)
        expect(useReviewStore.getState().isReviewModalOpen).toBe(false)
      }
    })
  })

  // ────────────────────────────────────────────────────────
  // Submit
  // ────────────────────────────────────────────────────────

  describe('submit', () => {
    it('calls createReview.mutateAsync on submit', async () => {
      useReviewStore.setState({
        isReviewModalOpen: true,
        step: 3,
        currentSessionId: 'session-1',
        draft: { ...defaultDraft, overallRating: 4 },
      })
      render(<PostWorkoutReview />)

      fireEvent.click(screen.getByText('Submit'))

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledTimes(1)
      })

      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'session-1',
          overall_rating: 4,
        })
      )
    })

    it('passes template_session_id when reviewing a template session', async () => {
      useReviewStore.setState({
        isReviewModalOpen: true,
        step: 3,
        currentTemplateSessionId: 'ts-1',
        draft: { ...defaultDraft, overallRating: 5 },
      })
      render(<PostWorkoutReview />)

      fireEvent.click(screen.getByText('Submit'))

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            template_session_id: 'ts-1',
            overall_rating: 5,
          })
        )
      })
    })

    it('includes all draft fields in submit data', async () => {
      useReviewStore.setState({
        isReviewModalOpen: true,
        step: 3,
        currentSessionId: 'session-1',
        workoutDurationMinutes: 60,
        draft: {
          overallRating: 4,
          difficultyRating: 3,
          energyLevel: 4,
          moodBefore: 'neutral',
          moodAfter: 'good',
          performanceTags: ['felt_strong'],
          reflection: 'Great session',
          highlights: 'New PR',
          improvements: 'Form',
        },
      })
      render(<PostWorkoutReview />)

      fireEvent.click(screen.getByText('Submit'))

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            overall_rating: 4,
            difficulty_rating: 3,
            energy_level: 4,
            mood_before: 'neutral',
            mood_after: 'good',
            performance_tags: ['felt_strong'],
            reflection: 'Great session',
            highlights: 'New PR',
            improvements: 'Form',
            workout_duration_minutes: 60,
          })
        )
      })
    })

    it('shows Review Saved message after successful submit', async () => {
      useReviewStore.setState({
        isReviewModalOpen: true,
        step: 3,
        draft: { ...defaultDraft, overallRating: 4 },
      })
      render(<PostWorkoutReview />)

      fireEvent.click(screen.getByText('Submit'))

      await waitFor(() => {
        expect(screen.getByText('Review Saved!')).toBeInTheDocument()
      })
    })

    it('calls onComplete callback after submit and delay', async () => {
      const onComplete = vi.fn()

      useReviewStore.setState({
        isReviewModalOpen: true,
        step: 3,
        draft: { ...defaultDraft, overallRating: 4 },
      })
      render(<PostWorkoutReview onComplete={onComplete} />)

      fireEvent.click(screen.getByText('Submit'))

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled()
      })

      // The onComplete fires after a 1500ms setTimeout;
      // waitFor will poll until it passes or times out
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled()
      }, { timeout: 3000 })
    })
  })

  // ────────────────────────────────────────────────────────
  // Progress indicator
  // ────────────────────────────────────────────────────────

  describe('progress indicator', () => {
    it('renders 4 progress segments', () => {
      useReviewStore.setState({ isReviewModalOpen: true, step: 0 })
      const { container } = render(<PostWorkoutReview />)
      const progressBars = container.querySelectorAll('.flex-1.h-1.rounded-full')
      expect(progressBars).toHaveLength(4)
    })
  })
})
