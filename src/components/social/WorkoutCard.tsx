import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Dumbbell, Heart, Activity, ChevronDown, Flame, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { Card, CardContent, Avatar } from '@/components/ui'
import { ReactionBar } from './ReactionBar'
import { formatRelativeTime } from '@/utils/formatters'
import { getWorkoutDisplayName } from '@/config/workoutConfig'
import { MOOD_MAP, TAG_MAP } from '@/config/reviewConfig'
import { MAX_INLINE_EXERCISES, MAX_REFLECTION_LENGTH, STREAK_BADGE_THRESHOLD } from '@/config/communityConfig'
import { useAuthStore } from '@/stores/authStore'
import type { FeedWorkout, FeedExerciseSet } from '@/types/community'

// ─── Helpers ─────────────────────────────────────────

function getWorkoutIcon(type: string) {
  switch (type) {
    case 'cardio': return { Icon: Heart, color: 'var(--color-cardio)' }
    case 'mobility': return { Icon: Activity, color: 'var(--color-mobility)' }
    default: return { Icon: Dumbbell, color: 'var(--color-weights)' }
  }
}

function formatVolume(volume: number): string {
  if (volume >= 10000) return `${(volume / 1000).toFixed(1)}k lbs`
  return `${volume.toLocaleString()} lbs`
}

function formatPace(distanceValue: number, durationMinutes: number, unit: string): string {
  const pacePerUnit = durationMinutes / distanceValue
  const mins = Math.floor(pacePerUnit)
  const secs = Math.round((pacePerUnit - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')}/${unit === 'km' ? 'km' : 'mi'}`
}

// Group sets by exercise for display
function groupExercises(sets: FeedExerciseSet[]): { name: string; summary: string; unit: string }[] {
  const groups = new Map<string, FeedExerciseSet[]>()
  for (const set of sets) {
    const name = set.plan_exercise?.name || 'Unknown'
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name)!.push(set)
  }

  return [...groups.entries()].map(([name, exerciseSets]) => {
    const setCount = exerciseSets.length
    const reps = exerciseSets[0]?.reps_completed
    const weight = exerciseSets[0]?.weight_used
    const unit = exerciseSets[0]?.plan_exercise?.weight_unit || 'lbs'

    let summary = `${setCount}x${reps || '?'}`
    if (weight) summary += ` @ ${weight} ${unit}`

    return { name, summary, unit }
  })
}

// ─── Collapsed Card ──────────────────────────────────

interface WorkoutCardProps {
  workout: FeedWorkout
  index: number
  onUserClick?: (userId: string) => void
}

export function WorkoutCard({ workout, index, onUserClick }: WorkoutCardProps) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { Icon, color } = getWorkoutIcon(workout.type)

  const displayName = workout.user_profile?.display_name || 'Anonymous'
  const workoutName = getWorkoutDisplayName(workout.workout_name)
  const hideWeights = workout.user_profile?.hide_weight_details && workout.user_id !== user?.id

  // Mood pills
  const moodBefore = workout.review?.mood_before ? MOOD_MAP[workout.review.mood_before as keyof typeof MOOD_MAP] : null
  const moodAfter = workout.review?.mood_after ? MOOD_MAP[workout.review.mood_after as keyof typeof MOOD_MAP] : null

  // Top performance tag
  const topTag = workout.review?.performance_tags?.[0]
    ? TAG_MAP[workout.review.performance_tags[0] as keyof typeof TAG_MAP]
    : null

  // Summary stat line
  const summaryParts: string[] = []
  if (workout.type === 'weights') {
    if (workout.exercise_count > 0) summaryParts.push(`${workout.exercise_count} exercises`)
    if (workout.total_volume && !hideWeights) summaryParts.push(formatVolume(workout.total_volume))
  }
  if (workout.distance_value && workout.distance_unit) {
    summaryParts.push(`${workout.distance_value} ${workout.distance_unit}`)
  }
  if (workout.duration_minutes) {
    summaryParts.push(`${workout.duration_minutes} min`)
  }
  if (workout.type !== 'weights' && workout.distance_value && workout.duration_minutes && workout.distance_unit) {
    summaryParts.push(formatPace(workout.distance_value, workout.duration_minutes, workout.distance_unit))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card>
        <CardContent className="py-3.5">
          {/* ── Collapsed Content ── */}
          <div
            className="flex items-start gap-3 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            {/* Workout type icon */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Row 1: User + time */}
              <div className="flex items-center justify-between">
                <button
                  onClick={e => { e.stopPropagation(); onUserClick?.(workout.user_id) }}
                  className="flex items-center gap-2 min-w-0"
                >
                  <Avatar
                    src={workout.user_profile?.avatar_url}
                    alt={displayName}
                    size="sm"
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-semibold text-[var(--color-text)] truncate">
                    {displayName}
                  </span>
                </button>
                <span className="text-xs text-[var(--color-text-muted)] opacity-70 flex-shrink-0 ml-2">
                  {formatRelativeTime(workout.completed_at || workout.started_at)}
                </span>
              </div>

              {/* Row 2: Workout name + duration */}
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                <span className="font-medium text-[var(--color-text)]">{workoutName}</span>
                {workout.duration_minutes && (
                  <span className="text-[var(--color-text-muted)]"> · {workout.duration_minutes} min</span>
                )}
              </p>

              {/* Row 3: Mood + tag + streak */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {moodBefore && moodAfter && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs bg-[var(--color-surface-hover)]">
                    <span>{moodBefore.emoji}</span>
                    <span className="text-[var(--color-text-muted)]">→</span>
                    <span>{moodAfter.emoji}</span>
                  </span>
                )}
                {topTag && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${topTag.color}15`, color: topTag.color }}
                  >
                    {topTag.label}
                  </span>
                )}
                {workout.streak_days && workout.streak_days >= STREAK_BADGE_THRESHOLD && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/15 text-orange-500">
                    <Flame className="w-3 h-3" />
                    {workout.streak_days}d streak
                  </span>
                )}
                {workout.photos.length > 0 && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
                    <ImageIcon className="w-3 h-3" />
                    {workout.photos.length}
                  </span>
                )}
              </div>

              {/* Row 4: Summary stat */}
              {summaryParts.length > 0 && (
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {summaryParts.join(' · ')}
                </p>
              )}
            </div>

            {/* Expand indicator */}
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex-shrink-0 mt-1"
            >
              <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
            </motion.div>
          </div>

          {/* ── Expanded Content ── */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <ExpandedContent
                  workout={workout}
                  hideWeights={!!hideWeights}
                  onViewDetails={() => {
                    const path = workout.type === 'weights'
                      ? `/community/session/${workout.id}`
                      : `/community/cardio/${workout.id}`
                    navigate(path)
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Expanded Content ────────────────────────────────

function ExpandedContent({ workout, hideWeights, onViewDetails }: { workout: FeedWorkout; hideWeights: boolean; onViewDetails: () => void }) {
  const review = workout.review
  const exercises = groupExercises(workout.exercises)
  const visibleExercises = exercises.slice(0, MAX_INLINE_EXERCISES)
  const overflowCount = exercises.length - MAX_INLINE_EXERCISES

  return (
    <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-3">
      {/* Review summary */}
      {review && (
        <div className="space-y-2">
          {/* Rating + difficulty */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={`text-sm ${star <= review.overall_rating ? 'opacity-100' : 'opacity-20'}`}>
                  ⭐
                </span>
              ))}
            </div>
            {review.difficulty_rating && (
              <span className="text-xs text-[var(--color-text-muted)]">
                Difficulty: {['Easy', 'Moderate', 'Challenging', 'Hard', 'Brutal'][review.difficulty_rating - 1]}
              </span>
            )}
          </div>

          {/* Mood before → after (full) */}
          {review.mood_before && review.mood_after && (
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <span>Mood:</span>
              <span>{MOOD_MAP[review.mood_before as keyof typeof MOOD_MAP]?.emoji} {MOOD_MAP[review.mood_before as keyof typeof MOOD_MAP]?.label}</span>
              <span>→</span>
              <span>{MOOD_MAP[review.mood_after as keyof typeof MOOD_MAP]?.emoji} {MOOD_MAP[review.mood_after as keyof typeof MOOD_MAP]?.label}</span>
            </div>
          )}
        </div>
      )}

      {/* Exercise list (weights only) */}
      {workout.type === 'weights' && exercises.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
            Exercises
          </p>
          {visibleExercises.map((ex, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)] truncate">{ex.name}</span>
              <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0 ml-2">
                {hideWeights ? `${ex.summary.split('@')[0].trim()}` : ex.summary}
              </span>
            </div>
          ))}
          {overflowCount > 0 && (
            <p className="text-xs text-[var(--color-primary)] font-medium">
              + {overflowCount} more exercise{overflowCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Performance tags */}
      {review && review.performance_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {review.performance_tags.map(tag => {
            const config = TAG_MAP[tag as keyof typeof TAG_MAP]
            if (!config) return null
            return (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${config.color}15`, color: config.color }}
              >
                {config.label}
              </span>
            )
          })}
        </div>
      )}

      {/* Reflection text */}
      {review?.reflection && (
        <p className="text-sm text-[var(--color-text-secondary)] italic leading-relaxed">
          "{review.reflection.length > MAX_REFLECTION_LENGTH
            ? `${review.reflection.slice(0, MAX_REFLECTION_LENGTH)}...`
            : review.reflection}"
        </p>
      )}

      {/* Photos */}
      {workout.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {workout.photos.map(photo => (
            <img
              key={photo.id}
              src={photo.photo_url}
              alt={photo.caption || 'Workout photo'}
              className="w-24 h-24 rounded-[var(--radius-md)] object-cover flex-shrink-0"
            />
          ))}
        </div>
      )}

      {/* Reaction bar */}
      <ReactionBar workout={workout} />

      {/* View full workout */}
      <button
        onClick={onViewDetails}
        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/8 rounded-lg active:scale-[0.98] transition-transform"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        View Full Workout
      </button>
    </div>
  )
}
