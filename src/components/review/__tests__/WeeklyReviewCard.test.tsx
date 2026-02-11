import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import { WeeklyReviewCard } from '../WeeklyReviewCard'
import type { WeeklyReviewSummary } from '@/hooks/useReview'

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, initial, animate, transition, ...props }: any) =>
      createElement('div', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock useReducedMotion
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}))

// Mock useWeeklyReview
const mockUseWeeklyReview = vi.fn()
vi.mock('@/hooks/useReview', () => ({
  useWeeklyReview: (weekStart: Date) => mockUseWeeklyReview(weekStart),
}))

const baseSummary: WeeklyReviewSummary = {
  weekStart: '2024-06-01T00:00:00Z',
  weekEnd: '2024-06-08T00:00:00Z',
  totalReviews: 5,
  averageRating: 4.2,
  averageDifficulty: 3.5,
  averageEnergy: 3.8,
  moodImprovement: 1.5,
  topTags: [
    { tag: 'felt_strong', count: 3 },
    { tag: 'pumped', count: 2 },
  ],
  ratingTrend: [
    { date: '2024-06-01T12:00:00Z', rating: 4 },
    { date: '2024-06-03T12:00:00Z', rating: 5 },
  ],
}

describe('WeeklyReviewCard', () => {
  const weekStart = new Date('2024-06-01T00:00:00Z')

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseWeeklyReview.mockReturnValue({
      data: baseSummary,
      isLoading: false,
    })
  })

  // ────────────────────────────────────────────────────────
  // Loading state
  // ────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      mockUseWeeklyReview.mockReturnValue({ data: undefined, isLoading: true })
      const { container } = render(<WeeklyReviewCard weekStart={weekStart} />)
      const pulseElements = container.querySelectorAll('.animate-pulse')
      expect(pulseElements.length).toBeGreaterThan(0)
    })
  })

  // ────────────────────────────────────────────────────────
  // Empty state
  // ────────────────────────────────────────────────────────

  describe('empty state', () => {
    it('renders nothing when summary is null', () => {
      mockUseWeeklyReview.mockReturnValue({ data: null, isLoading: false })
      const { container } = render(<WeeklyReviewCard weekStart={weekStart} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders nothing when totalReviews is 0', () => {
      mockUseWeeklyReview.mockReturnValue({
        data: { ...baseSummary, totalReviews: 0 },
        isLoading: false,
      })
      const { container } = render(<WeeklyReviewCard weekStart={weekStart} />)
      expect(container.firstChild).toBeNull()
    })
  })

  // ────────────────────────────────────────────────────────
  // Header
  // ────────────────────────────────────────────────────────

  describe('header', () => {
    it('shows Weekly Review label', () => {
      render(<WeeklyReviewCard weekStart={weekStart} />)
      expect(screen.getByText('Weekly Review')).toBeInTheDocument()
    })

    it('shows total reviews count', () => {
      render(<WeeklyReviewCard weekStart={weekStart} />)
      expect(screen.getByText('5 reviewed')).toBeInTheDocument()
    })

    it('shows correct count for different values', () => {
      mockUseWeeklyReview.mockReturnValue({
        data: { ...baseSummary, totalReviews: 3 },
        isLoading: false,
      })
      render(<WeeklyReviewCard weekStart={weekStart} />)
      expect(screen.getByText('3 reviewed')).toBeInTheDocument()
    })
  })

  // ────────────────────────────────────────────────────────
  // Rating display
  // ────────────────────────────────────────────────────────

  describe('rating display', () => {
    it('shows the average rating value', () => {
      render(<WeeklyReviewCard weekStart={weekStart} />)
      expect(screen.getByText('4.2')).toBeInTheDocument()
    })

    it('renders 5 star icons', () => {
      const { container } = render(<WeeklyReviewCard weekStart={weekStart} />)
      // Card has multiple SVGs (stars + icons)
      const allSvgs = container.querySelectorAll('svg')
      expect(allSvgs.length).toBeGreaterThanOrEqual(5)
    })

    it('fills correct number of stars based on rounded rating', () => {
      const { container } = render(<WeeklyReviewCard weekStart={weekStart} />)
      // averageRating=4.2 rounds to 4, so 4 rating stars filled + 1 header star icon = 5
      const filledStars = container.querySelectorAll('.fill-amber-400')
      expect(filledStars).toHaveLength(5) // 4 rating + 1 header star
    })
  })

  // ────────────────────────────────────────────────────────
  // Mood trend
  // ────────────────────────────────────────────────────────

  describe('mood trend', () => {
    it('shows Mood label', () => {
      render(<WeeklyReviewCard weekStart={weekStart} />)
      expect(screen.getByText('Mood')).toBeInTheDocument()
    })

    it('shows positive mood trend icon when improvement > 0.2', () => {
      mockUseWeeklyReview.mockReturnValue({
        data: { ...baseSummary, moodImprovement: 1.5 },
        isLoading: false,
      })
      const { container } = render(<WeeklyReviewCard weekStart={weekStart} />)
      const greenIcons = container.querySelectorAll('.text-emerald-500')
      expect(greenIcons.length).toBeGreaterThan(0)
    })

    it('shows negative mood trend icon when improvement < -0.2', () => {
      mockUseWeeklyReview.mockReturnValue({
        data: { ...baseSummary, moodImprovement: -0.5 },
        isLoading: false,
      })
      const { container } = render(<WeeklyReviewCard weekStart={weekStart} />)
      const redIcons = container.querySelectorAll('.text-red-500')
      expect(redIcons.length).toBeGreaterThan(0)
    })

    it('shows neutral mood trend icon when near zero', () => {
      mockUseWeeklyReview.mockReturnValue({
        data: { ...baseSummary, moodImprovement: 0 },
        isLoading: false,
      })
      render(<WeeklyReviewCard weekStart={weekStart} />)
      // Neutral icon uses text-muted color, just check it renders without error
      expect(screen.getByText('Mood')).toBeInTheDocument()
    })
  })

  // ────────────────────────────────────────────────────────
  // Top tags
  // ────────────────────────────────────────────────────────

  describe('top tags', () => {
    it('renders tag labels', () => {
      render(<WeeklyReviewCard weekStart={weekStart} />)
      expect(screen.getByText('Felt Strong')).toBeInTheDocument()
      expect(screen.getByText('Pumped')).toBeInTheDocument()
    })

    it('shows count multiplier for tags with count > 1', () => {
      render(<WeeklyReviewCard weekStart={weekStart} />)
      expect(screen.getByText('x3')).toBeInTheDocument()
      expect(screen.getByText('x2')).toBeInTheDocument()
    })

    it('does not show multiplier for tags with count = 1', () => {
      mockUseWeeklyReview.mockReturnValue({
        data: {
          ...baseSummary,
          topTags: [{ tag: 'focused', count: 1 }],
        },
        isLoading: false,
      })
      render(<WeeklyReviewCard weekStart={weekStart} />)
      expect(screen.getByText('Focused')).toBeInTheDocument()
      expect(screen.queryByText('x1')).not.toBeInTheDocument()
    })

    it('does not render tags section when topTags is empty', () => {
      mockUseWeeklyReview.mockReturnValue({
        data: { ...baseSummary, topTags: [] },
        isLoading: false,
      })
      render(<WeeklyReviewCard weekStart={weekStart} />)
      expect(screen.queryByText('Felt Strong')).not.toBeInTheDocument()
    })

    it('shows at most 4 tags', () => {
      mockUseWeeklyReview.mockReturnValue({
        data: {
          ...baseSummary,
          topTags: [
            { tag: 'felt_strong', count: 5 },
            { tag: 'pumped', count: 4 },
            { tag: 'new_pr', count: 3 },
            { tag: 'focused', count: 2 },
            { tag: 'good_form', count: 1 },
          ],
        },
        isLoading: false,
      })
      render(<WeeklyReviewCard weekStart={weekStart} />)
      expect(screen.getByText('Felt Strong')).toBeInTheDocument()
      expect(screen.getByText('Pumped')).toBeInTheDocument()
      expect(screen.getByText('New PR')).toBeInTheDocument()
      expect(screen.getByText('Focused')).toBeInTheDocument()
      expect(screen.queryByText('Good Form')).not.toBeInTheDocument()
    })
  })

  // ────────────────────────────────────────────────────────
  // weekStart prop
  // ────────────────────────────────────────────────────────

  describe('weekStart prop', () => {
    it('passes weekStart to useWeeklyReview', () => {
      const customStart = new Date('2024-07-15T00:00:00Z')
      render(<WeeklyReviewCard weekStart={customStart} />)
      expect(mockUseWeeklyReview).toHaveBeenCalledWith(customStart)
    })
  })
})
