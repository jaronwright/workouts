import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Star, ChevronDown, Pencil, Trash2, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { springs } from '@/config/animationConfig'
import {
  MOOD_MAP,
  TAG_MAP,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  ENERGY_LABELS,
  ENERGY_COLORS,
  RATING_COLORS,
} from '@/config/reviewConfig'
import type { WorkoutReview } from '@/services/reviewService'

interface ReviewSummaryCardProps {
  review: WorkoutReview
  onEdit?: () => void
  onDelete?: () => void
}

export function ReviewSummaryCard({ review, onEdit, onDelete }: ReviewSummaryCardProps) {
  const [showFullReflection, setShowFullReflection] = useState(false)

  if (!review?.overall_rating) return null

  const moodBefore = review.mood_before ? MOOD_MAP[review.mood_before] : null
  const moodAfter = review.mood_after ? MOOD_MAP[review.mood_after] : null
  const ratingColor = RATING_COLORS[review.overall_rating] || RATING_COLORS[3]
  const reflectionText = review.reflection || ''
  const isTruncated = reflectionText.length > 120

  return (
    <Card>
      <CardContent className="py-4">
        {/* Header: Stars + Actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i <= review.overall_rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-none text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: ratingColor }}
            >
              {review.overall_rating}/5
            </span>
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mood + Difficulty + Energy row */}
        <div className="flex items-center gap-4 mb-3 flex-wrap">
          {moodBefore && moodAfter && (
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{moodBefore.emoji}</span>
              <ArrowRight className="w-3 h-3 text-[var(--color-text-muted)]" />
              <span className="text-lg">{moodAfter.emoji}</span>
            </div>
          )}
          {review.difficulty_rating && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                color: DIFFICULTY_COLORS[review.difficulty_rating],
                backgroundColor: `${DIFFICULTY_COLORS[review.difficulty_rating]}18`,
              }}
            >
              {DIFFICULTY_LABELS[review.difficulty_rating]}
            </span>
          )}
          {review.energy_level && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                color: ENERGY_COLORS[review.energy_level],
                backgroundColor: `${ENERGY_COLORS[review.energy_level]}18`,
              }}
            >
              {ENERGY_LABELS[review.energy_level]}
            </span>
          )}
        </div>

        {/* Tags */}
        {review.performance_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {review.performance_tags.map((tagValue) => {
              const tag = TAG_MAP[tagValue]
              if (!tag) return null
              const Icon = tag.icon
              return (
                <span
                  key={tagValue}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    color: tag.color,
                    backgroundColor: `${tag.color}15`,
                  }}
                >
                  <Icon className="w-3 h-3" />
                  {tag.label}
                </span>
              )
            })}
          </div>
        )}

        {/* Reflection */}
        {reflectionText && (
          <div>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {showFullReflection || !isTruncated
                ? reflectionText
                : `${reflectionText.slice(0, 120)}...`}
            </p>
            {isTruncated && (
              <button
                onClick={() => setShowFullReflection((prev) => !prev)}
                className="text-xs text-[var(--color-primary)] font-medium mt-1 flex items-center gap-0.5"
              >
                {showFullReflection ? 'Show less' : 'Show more'}
                <motion.div
                  animate={{ rotate: showFullReflection ? 180 : 0 }}
                  transition={springs.default}
                >
                  <ChevronDown className="w-3 h-3" />
                </motion.div>
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
