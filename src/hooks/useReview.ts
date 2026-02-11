import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  createReview,
  getReviewBySessionId,
  getReviewByTemplateSessionId,
  getUserReviews,
  updateReview,
  deleteReview,
  getReviewsInRange,
  getReviewCount,
  type CreateReviewData,
  type UpdateReviewData,
  type WorkoutReview,
  type MoodValue,
  type PerformanceTag,
} from '@/services/reviewService'

// ─── Queries ──────────────────────────────────────────

export function useSessionReview(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['review', 'session', sessionId],
    queryFn: () => getReviewBySessionId(sessionId!),
    enabled: !!sessionId,
  })
}

export function useTemplateSessionReview(templateSessionId: string | undefined) {
  return useQuery({
    queryKey: ['review', 'template-session', templateSessionId],
    queryFn: () => getReviewByTemplateSessionId(templateSessionId!),
    enabled: !!templateSessionId,
  })
}

export function useUserReviews(limit = 20, offset = 0) {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['reviews', user?.id, limit, offset],
    queryFn: () => getUserReviews(user!.id, limit, offset),
    enabled: !!user?.id,
  })
}

export function useReviewsInRange(startDate: string, endDate: string) {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['reviews', 'range', user?.id, startDate, endDate],
    queryFn: () => getReviewsInRange(user!.id, startDate, endDate),
    enabled: !!user?.id && !!startDate && !!endDate,
  })
}

export function useReviewCount() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['reviews', 'count', user?.id],
    queryFn: () => getReviewCount(user!.id),
    enabled: !!user?.id,
  })
}

// ─── Mutations ────────────────────────────────────────

export function useCreateReview() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReviewData) => createReview(user!.id, data),
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      if (review.session_id) {
        queryClient.invalidateQueries({
          queryKey: ['review', 'session', review.session_id],
        })
      }
      if (review.template_session_id) {
        queryClient.invalidateQueries({
          queryKey: ['review', 'template-session', review.template_session_id],
        })
      }
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: UpdateReviewData }) =>
      updateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['review'] })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['review'] })
    },
  })
}

// ─── Computed: Weekly Review ──────────────────────────

export interface WeeklyReviewSummary {
  weekStart: string
  weekEnd: string
  totalReviews: number
  averageRating: number
  averageDifficulty: number
  averageEnergy: number
  moodImprovement: number
  topTags: { tag: PerformanceTag; count: number }[]
  ratingTrend: { date: string; rating: number }[]
}

function computeWeeklyStats(
  reviews: WorkoutReview[],
  weekStart: Date
): WeeklyReviewSummary {
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

  if (reviews.length === 0) {
    return {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      totalReviews: 0,
      averageRating: 0,
      averageDifficulty: 0,
      averageEnergy: 0,
      moodImprovement: 0,
      topTags: [],
      ratingTrend: [],
    }
  }

  const ratings = reviews.map((r) => r.overall_rating)
  const difficulties = reviews
    .map((r) => r.difficulty_rating)
    .filter((d): d is number => d !== null)
  const energies = reviews
    .map((r) => r.energy_level)
    .filter((e): e is number => e !== null)

  const avg = (nums: number[]) =>
    nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0

  // Mood improvement: compare mood_after vs mood_before scores
  const moodScore: Record<MoodValue, number> = {
    stressed: 1,
    tired: 2,
    neutral: 3,
    good: 4,
    great: 5,
  }
  const moodDeltas = reviews
    .filter((r) => r.mood_before && r.mood_after)
    .map((r) => moodScore[r.mood_after!] - moodScore[r.mood_before!])

  // Tag frequency
  const tagCounts = new Map<PerformanceTag, number>()
  for (const review of reviews) {
    for (const tag of review.performance_tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    }
  }
  const topTags = [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Daily rating trend
  const ratingTrend = reviews.map((r) => ({
    date: r.created_at,
    rating: r.overall_rating,
  }))

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    totalReviews: reviews.length,
    averageRating: Math.round(avg(ratings) * 10) / 10,
    averageDifficulty: Math.round(avg(difficulties) * 10) / 10,
    averageEnergy: Math.round(avg(energies) * 10) / 10,
    moodImprovement: Math.round(avg(moodDeltas) * 10) / 10,
    topTags,
    ratingTrend,
  }
}

export function useWeeklyReview(weekStart: Date) {
  const user = useAuthStore((s) => s.user)
  const startDate = weekStart.toISOString()
  const endDate = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

  return useQuery({
    queryKey: ['weekly-review', user?.id, startDate],
    queryFn: () => getReviewsInRange(user!.id, startDate, endDate),
    enabled: !!user?.id,
    select: (reviews) => computeWeeklyStats(reviews, weekStart),
  })
}

// ─── Computed: Review Stats ───────────────────────────

export interface ReviewStats {
  totalReviews: number
  averageRating: number
  averageDifficulty: number
  averageEnergy: number
  moodDistribution: Record<MoodValue, number>
  topTags: { tag: PerformanceTag; count: number }[]
}

function computeReviewStats(reviews: WorkoutReview[]): ReviewStats {
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      averageDifficulty: 0,
      averageEnergy: 0,
      moodDistribution: { great: 0, good: 0, neutral: 0, tired: 0, stressed: 0 },
      topTags: [],
    }
  }

  const avg = (nums: number[]) =>
    nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0

  const ratings = reviews.map((r) => r.overall_rating)
  const difficulties = reviews
    .map((r) => r.difficulty_rating)
    .filter((d): d is number => d !== null)
  const energies = reviews
    .map((r) => r.energy_level)
    .filter((e): e is number => e !== null)

  const moodDist: Record<MoodValue, number> = {
    great: 0,
    good: 0,
    neutral: 0,
    tired: 0,
    stressed: 0,
  }
  for (const r of reviews) {
    if (r.mood_after) moodDist[r.mood_after]++
  }

  const tagCounts = new Map<PerformanceTag, number>()
  for (const review of reviews) {
    for (const tag of review.performance_tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    }
  }
  const topTags = [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalReviews: reviews.length,
    averageRating: Math.round(avg(ratings) * 10) / 10,
    averageDifficulty: Math.round(avg(difficulties) * 10) / 10,
    averageEnergy: Math.round(avg(energies) * 10) / 10,
    moodDistribution: moodDist,
    topTags,
  }
}

export function useReviewStats() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['reviews', 'stats', user?.id],
    queryFn: () => getUserReviews(user!.id, 100, 0),
    enabled: !!user?.id,
    select: computeReviewStats,
  })
}
