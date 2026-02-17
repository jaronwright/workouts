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
  // Single-page layout
  // ────────────────────────────────────────────────────────

  describe('single-page layout', () => {
    it('shows all sections at once', () => {
      useReviewStore.setState({ isReviewModalOpen: true })
      render(<PostWorkoutReview />)
      expect(screen.getByText('How was your workout?')).toBeInTheDocument()
      expect(screen.getByText('Difficulty')).toBeInTheDocument()
      expect(screen.getByText('Mood')).toBeInTheDocument()
      expect(screen.getByText('Tags')).toBeInTheDocument()
    })

    it('shows Finish Workout button', () => {
      useReviewStore.setState({ isReviewModalOpen: true })
      render(<PostWorkoutReview />)
      expect(screen.getByText('Finish Workout')).toBeInTheDocument()
    })

    it('shows Skip Review link', () => {
      useReviewStore.setState({ isReviewModalOpen: true })
      render(<PostWorkoutReview />)
      expect(screen.getByText('Skip Review')).toBeInTheDocument()
    })
  })

  // ────────────────────────────────────────────────────────
  // Skip / Close behavior
  // ────────────────────────────────────────────────────────

  describe('skip and close behavior', () => {
    it('calls onComplete when Skip Review is clicked', () => {
      const onComplete = vi.fn()
      useReviewStore.setState({ isReviewModalOpen: true })
      render(<PostWorkoutReview onComplete={onComplete} />)

      fireEvent.click(screen.getByText('Skip Review'))

      expect(useReviewStore.getState().isReviewModalOpen).toBe(false)
      expect(onComplete).toHaveBeenCalled()
    })

    it('calls onComplete when X button is clicked', () => {
      const onComplete = vi.fn()
      useReviewStore.setState({ isReviewModalOpen: true })
      render(<PostWorkoutReview onComplete={onComplete} />)

      const closeButton = screen.getByLabelText('Skip review')
      fireEvent.click(closeButton)

      expect(useReviewStore.getState().isReviewModalOpen).toBe(false)
      expect(onComplete).toHaveBeenCalled()
    })

    it('navigates home without saving when nothing selected', async () => {
      const onComplete = vi.fn()
      useReviewStore.setState({ isReviewModalOpen: true })
      render(<PostWorkoutReview onComplete={onComplete} />)

      fireEvent.click(screen.getByText('Finish Workout'))

      // Should not call mutateAsync since nothing was selected
      expect(mockMutateAsync).not.toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalled()
    })
  })

  // ────────────────────────────────────────────────────────
  // Submit
  // ────────────────────────────────────────────────────────

  describe('submit', () => {
    it('calls createReview.mutateAsync when selections are made', async () => {
      useReviewStore.setState({
        isReviewModalOpen: true,
        currentSessionId: 'session-1',
        draft: { ...defaultDraft, overallRating: 4 },
      })
      render(<PostWorkoutReview />)

      fireEvent.click(screen.getByText('Finish Workout'))

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
        currentTemplateSessionId: 'ts-1',
        draft: { ...defaultDraft, overallRating: 5 },
      })
      render(<PostWorkoutReview />)

      fireEvent.click(screen.getByText('Finish Workout'))

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            template_session_id: 'ts-1',
            overall_rating: 5,
          })
        )
      })
    })

    it('includes selected draft fields in submit data', async () => {
      useReviewStore.setState({
        isReviewModalOpen: true,
        currentSessionId: 'session-1',
        workoutDurationMinutes: 60,
        draft: {
          ...defaultDraft,
          overallRating: 4,
          difficultyRating: 3,
          moodAfter: 'good',
          performanceTags: ['felt_strong'],
        },
      })
      render(<PostWorkoutReview />)

      fireEvent.click(screen.getByText('Finish Workout'))

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            overall_rating: 4,
            difficulty_rating: 3,
            mood_after: 'good',
            performance_tags: ['felt_strong'],
            workout_duration_minutes: 60,
          })
        )
      })
    })

    it('shows Review Saved message after successful submit', async () => {
      useReviewStore.setState({
        isReviewModalOpen: true,
        draft: { ...defaultDraft, overallRating: 4 },
      })
      render(<PostWorkoutReview />)

      fireEvent.click(screen.getByText('Finish Workout'))

      await waitFor(() => {
        expect(screen.getByText('Review Saved!')).toBeInTheDocument()
      })
    })

    it('calls onComplete callback after submit and delay', async () => {
      const onComplete = vi.fn()

      useReviewStore.setState({
        isReviewModalOpen: true,
        draft: { ...defaultDraft, overallRating: 4 },
      })
      render(<PostWorkoutReview onComplete={onComplete} />)

      fireEvent.click(screen.getByText('Finish Workout'))

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled()
      })

      // The onComplete fires after a 1200ms setTimeout
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled()
      }, { timeout: 3000 })
    })
  })
})
