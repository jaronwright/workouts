import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Barbell, Heart, Heartbeat, CaretDown, Fire, ArrowSquareOut, Clock } from '@phosphor-icons/react'
import { Card, Avatar } from '@/components/ui'
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
    case 'mobility': return { Icon: Heartbeat, color: 'var(--color-mobility)' }
    default: return { Icon: Barbell, color: 'var(--color-weights)' }
  }
}

function formatVolume(volume: number): string {
  if (volume >= 10000) return `${(volume / 1000).toFixed(1)}k`
  return volume.toLocaleString()
}

function formatPace(distanceValue: number, durationMinutes: number, unit: string): string {
  const pacePerUnit = durationMinutes / distanceValue
  const mins = Math.floor(pacePerUnit)
  const secs = Math.round((pacePerUnit - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')}/${unit === 'km' ? 'km' : 'mi'}`
}

// Match the pattern from parseSetReps.ts — DB stores 'seconds', 'minutes', 'steps', 'reps'
function formatRepsUnit(unit: string): string {
  if (!unit || unit === 'reps') return ''
  return unit
}

interface GroupedExercise {
  name: string
  setCount: number
  reps: number | null
  repsUnit: string
}

// Group sets by plan_exercise_id (not name) to avoid merging distinct exercises
function groupExercises(sets: FeedExerciseSet[]): GroupedExercise[] {
  const groups = new Map<string, FeedExerciseSet[]>()
  for (const set of sets) {
    const key = set.plan_exercise_id
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(set)
  }

  return [...groups.entries()].map(([, exerciseSets]) => ({
    name: exerciseSets[0]?.plan_exercise?.name || 'Unknown',
    setCount: exerciseSets.length,
    reps: exerciseSets[0]?.reps_completed ?? null,
    repsUnit: exerciseSets[0]?.plan_exercise?.reps_unit || 'reps',
  }))
}

function formatExerciseSummary(ex: GroupedExercise): string {
  const unit = formatRepsUnit(ex.repsUnit)
  if (ex.reps == null) return `${ex.setCount} sets`
  if (unit) return `${ex.setCount}x${ex.reps} ${unit}`
  return `${ex.setCount}x${ex.reps}`
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

  // Subtitle line (type-specific, no duration — that's in the header)
  const subtitleParts: string[] = []
  if (workout.distance_value && workout.distance_unit) {
    subtitleParts.push(`${workout.distance_value} ${workout.distance_unit}`)
  }
  if (workout.type !== 'weights' && workout.distance_value && workout.duration_minutes && workout.distance_unit) {
    subtitleParts.push(formatPace(workout.distance_value, workout.duration_minutes, workout.distance_unit))
  }

  const hasPhotos = workout.photos.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card className="overflow-hidden">
        {/* Workout-type colored accent bar */}
        <div className="h-[3px]" style={{ background: color }} />

        <div className="px-5 py-4">
          {/* ── User header ── */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={e => { e.stopPropagation(); onUserClick?.(workout.user_id) }}
              className="flex items-center gap-2.5 min-w-0"
            >
              <Avatar
                src={workout.user_profile?.avatar_url}
                alt={displayName}
                size="sm"
                className="w-8 h-8"
              />
              <span className="text-sm font-semibold text-[var(--color-text)] truncate">
                {displayName}
              </span>
            </button>
            <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0 ml-2">
              {formatRelativeTime(workout.completed_at || workout.started_at)}
            </span>
          </div>

          {/* ── Main content — clickable to expand ── */}
          <div
            className="cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            {/* Workout name + type icon */}
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="w-5.5 h-5.5" style={{ color }} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[var(--color-text)] leading-snug">
                  {workoutName}
                </h3>

                {/* Duration + metric chips */}
                <div className="flex items-center gap-2 mt-1">
                  {workout.duration_minutes && (
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                      <Clock className="w-3 h-3" />
                      {workout.duration_minutes} min
                    </span>
                  )}
                  {workout.type === 'weights' && workout.exercise_count > 0 && (
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {workout.exercise_count} exercises
                    </span>
                  )}
                  {subtitleParts.length > 0 && (
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {subtitleParts.join(' · ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Expand indicator */}
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="flex-shrink-0 mt-1.5"
              >
                <CaretDown className="w-4 h-4 text-[var(--color-text-muted)]" />
              </motion.div>
            </div>

            {/* Volume highlight (weights) */}
            {workout.type === 'weights' && workout.total_volume && !hideWeights && (
              <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)]">
                <Barbell className="w-4 h-4 text-[var(--color-weights)]" />
                <span className="text-sm font-bold text-[var(--color-text)]">
                  {formatVolume(workout.total_volume)} lbs
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">total volume</span>
              </div>
            )}

            {/* Badges (mood, tag, streak) */}
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              {moodBefore && moodAfter && (
                <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs bg-[var(--color-surface-sunken)]">
                  <span>{moodBefore.emoji}</span>
                  <span className="text-[var(--color-text-muted)]">→</span>
                  <span>{moodAfter.emoji}</span>
                </span>
              )}
              {topTag && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${topTag.color}15`, color: topTag.color }}
                >
                  {topTag.label}
                </span>
              )}
              {workout.streak_days && workout.streak_days >= STREAK_BADGE_THRESHOLD && (
                <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-reward-muted)] text-[var(--color-reward)]">
                  <Fire className="w-3 h-3" />
                  {workout.streak_days}d streak
                </span>
              )}
            </div>

            {/* Photo preview (visible in collapsed state) */}
            {hasPhotos && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-0.5">
                {workout.photos.slice(0, 3).map(photo => (
                  <img
                    key={photo.id}
                    src={photo.photo_url}
                    alt={photo.caption || 'Workout photo'}
                    className="w-20 h-20 rounded-[var(--radius-md)] object-cover flex-shrink-0"
                  />
                ))}
                {workout.photos.length > 3 && (
                  <div className="w-20 h-20 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-[var(--color-text-muted)]">
                      +{workout.photos.length - 3}
                    </span>
                  </div>
                )}
              </div>
            )}
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
                  hasInlinePhotos={hasPhotos}
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
        </div>
      </Card>
    </motion.div>
  )
}

// ─── Expanded Content ────────────────────────────────

function ExpandedContent({ workout, hasInlinePhotos, onViewDetails }: { workout: FeedWorkout; hasInlinePhotos: boolean; onViewDetails: () => void }) {
  const review = workout.review
  const exercises = groupExercises(workout.exercises)
  const visibleExercises = exercises.slice(0, MAX_INLINE_EXERCISES)
  const overflowCount = exercises.length - MAX_INLINE_EXERCISES

  return (
    <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-3">
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

      {/* Exercise list (weights only) — shows sets × reps, no individual weights */}
      {workout.type === 'weights' && exercises.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
            Exercises
          </p>
          <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] divide-y divide-[var(--color-border)]">
            {visibleExercises.map((ex, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm text-[var(--color-text)] truncate">{ex.name}</span>
                <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0 ml-3 font-medium tabular-nums">
                  {formatExerciseSummary(ex)}
                </span>
              </div>
            ))}
          </div>
          {overflowCount > 0 && (
            <p className="text-xs text-[var(--color-primary)] font-medium mt-1.5 pl-3">
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
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
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
          &ldquo;{review.reflection.length > MAX_REFLECTION_LENGTH
            ? `${review.reflection.slice(0, MAX_REFLECTION_LENGTH)}...`
            : review.reflection}&rdquo;
        </p>
      )}

      {/* Full photos grid (only if no inline preview already shown) */}
      {!hasInlinePhotos && workout.photos.length > 0 && (
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
        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/8 rounded-[var(--radius-md)] active:scale-[0.98] transition-transform"
      >
        <ArrowSquareOut className="w-3.5 h-3.5" />
        View Full Workout
      </button>
    </div>
  )
}
