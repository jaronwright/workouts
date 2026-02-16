import { motion } from 'motion/react'
import { Star, TrendUp, TrendDown, Minus, Hash } from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui/Card'
import { useWeeklyReview } from '@/hooks/useReview'
import { springs } from '@/config/animationConfig'
import { TAG_MAP, RATING_COLORS } from '@/config/reviewConfig'

interface WeeklyReviewCardProps {
  weekStart: Date
}

function WeeklyReviewSkeleton() {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded bg-[var(--color-surface-hover)] animate-pulse" />
          <div className="h-4 w-28 rounded bg-[var(--color-surface-hover)] animate-pulse" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-16 rounded bg-[var(--color-surface-hover)] animate-pulse" />
          <div className="h-6 w-12 rounded bg-[var(--color-surface-hover)] animate-pulse" />
          <div className="h-6 w-20 rounded bg-[var(--color-surface-hover)] animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

export function WeeklyReviewCard({ weekStart }: WeeklyReviewCardProps) {
  const { data: summary, isLoading } = useWeeklyReview(weekStart)

  if (isLoading) return <WeeklyReviewSkeleton />
  if (!summary || summary.totalReviews === 0) return null

  const ratingColor = RATING_COLORS[Math.round(summary.averageRating)] || RATING_COLORS[3]
  const moodTrendIcon =
    summary.moodImprovement > 0.2 ? (
      <TrendUp className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
    ) : summary.moodImprovement < -0.2 ? (
      <TrendDown className="w-4 h-4 text-[var(--color-danger)]" />
    ) : (
      <Minus className="w-4 h-4 text-[var(--color-text-muted)]" />
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springs.default}
    >
      <Card>
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-reward)]/5 to-transparent pointer-events-none" />
        <CardContent className="py-4 relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4" style={{ color: 'var(--color-reward)', fill: 'var(--color-reward)' }} />
              <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Weekly Review
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Hash className="w-3 h-3 text-[var(--color-text-muted)]" />
              <span className="text-xs font-medium text-[var(--color-text-muted)]">
                {summary.totalReviews} reviewed
              </span>
            </div>
          </div>

          {/* Rating + Mood trend */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-5 h-5"
                    style={
                      i <= Math.round(summary.averageRating)
                        ? { fill: 'var(--color-reward)', color: 'var(--color-reward)' }
                        : { fill: 'none', color: 'var(--color-border)' }
                    }
                  />
                ))}
              </div>
              <span className="text-lg font-bold" style={{ color: ratingColor }}>
                {summary.averageRating}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {moodTrendIcon}
              <span className="text-xs text-[var(--color-text-muted)]">Mood</span>
            </div>
          </div>

          {/* Top Tags */}
          {summary.topTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {summary.topTags.slice(0, 4).map(({ tag, count }) => {
                const tagInfo = TAG_MAP[tag]
                if (!tagInfo) return null
                const Icon = tagInfo.icon
                return (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      color: tagInfo.color,
                      backgroundColor: `${tagInfo.color}15`,
                    }}
                  >
                    <Icon className="w-3 h-3" />
                    {tagInfo.label}
                    {count > 1 && <span className="opacity-60">x{count}</span>}
                  </span>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
