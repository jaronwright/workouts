import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AppShell } from '@/components/layout'
import { Avatar } from '@/components/ui'
import { ReactionBar } from '@/components/social/ReactionBar'
import { formatDate, formatTime, formatDuration } from '@/utils/formatters'
import { getWorkoutDisplayName, getWeightsStyleByName, getCardioStyle, getMobilityStyle } from '@/config/workoutConfig'
import { MOOD_MAP, TAG_MAP, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/config/reviewConfig'
import {
  Clock, CheckCircle, Dumbbell, Timer, Layers, StickyNote,
  MapPin, Zap, Activity, Star, ArrowRight
} from 'lucide-react'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { FeedWorkout, FeedExerciseSet, FeedReview, Reaction, FeedPhoto } from '@/types/community'

// ─── Data Fetcher ────────────────────────────────────

interface PublicSessionData {
  workout: FeedWorkout
  ownerProfile: {
    display_name: string | null
    avatar_url: string | null
    hide_weight_details: boolean
  }
}

async function getPublicSession(sessionId: string, sessionType: 'weights' | 'template'): Promise<PublicSessionData | null> {
  if (sessionType === 'weights') {
    return getPublicWeightsSession(sessionId)
  }
  return getPublicTemplateSession(sessionId)
}

async function getPublicWeightsSession(sessionId: string): Promise<PublicSessionData | null> {
  const { data: session, error } = await supabase
    .from('workout_sessions')
    .select(`
      id, user_id, started_at, completed_at, notes, is_public,
      workout_day:workout_days(name)
    `)
    .eq('id', sessionId)
    .eq('is_public', true)
    .single()

  if (error || !session) return null

  // Fetch profile, sets, review, reactions, photos in parallel
  const [profile, sets, review, reactions, photos] = await Promise.all([
    fetchProfile(session.user_id),
    fetchExerciseSets(sessionId),
    fetchReview(sessionId, 'session'),
    fetchReactions(sessionId, 'session'),
    fetchPhotos(sessionId, 'session'),
  ])

  const workoutDay = Array.isArray(session.workout_day) ? session.workout_day[0] : session.workout_day
  const exerciseNames = new Set(sets.map(s => s.plan_exercise?.name).filter(Boolean))
  const totalVolume = sets.reduce((sum, s) => {
    if (s.reps_completed && s.weight_used) return sum + s.reps_completed * s.weight_used
    return sum
  }, 0)
  const duration = session.completed_at && session.started_at
    ? Math.round((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000)
    : null

  return {
    workout: {
      id: session.id,
      user_id: session.user_id,
      started_at: session.started_at,
      completed_at: session.completed_at,
      notes: session.notes,
      is_public: true,
      type: 'weights',
      user_profile: profile ? { ...profile, selected_plan_id: null } : null,
      workout_name: (workoutDay as { name: string } | null)?.name || 'Workout',
      workout_category: null,
      duration_minutes: duration,
      distance_value: null,
      distance_unit: null,
      exercises: sets,
      review,
      reactions,
      photos,
      total_volume: totalVolume > 0 ? totalVolume : null,
      exercise_count: exerciseNames.size,
      streak_days: null,
    },
    ownerProfile: profile || { display_name: null, avatar_url: null, hide_weight_details: false },
  }
}

async function getPublicTemplateSession(sessionId: string): Promise<PublicSessionData | null> {
  const { data: session, error } = await supabase
    .from('template_workout_sessions')
    .select(`
      id, user_id, started_at, completed_at, notes, is_public,
      duration_minutes, distance_value, distance_unit,
      template:workout_templates(name, type, category)
    `)
    .eq('id', sessionId)
    .eq('is_public', true)
    .single()

  if (error || !session) return null

  const [profile, review, reactions, photos] = await Promise.all([
    fetchProfile(session.user_id),
    fetchReview(sessionId, 'template'),
    fetchReactions(sessionId, 'template'),
    fetchPhotos(sessionId, 'template'),
  ])

  const template = Array.isArray(session.template) ? session.template[0] : session.template
  const typedTemplate = template as { name: string; type: string; category: string | null } | null

  return {
    workout: {
      id: session.id,
      user_id: session.user_id,
      started_at: session.started_at,
      completed_at: session.completed_at,
      notes: session.notes,
      is_public: true,
      type: (typedTemplate?.type as 'cardio' | 'mobility') || 'cardio',
      user_profile: profile ? { ...profile, selected_plan_id: null } : null,
      workout_name: typedTemplate?.name || 'Workout',
      workout_category: typedTemplate?.category || null,
      duration_minutes: session.duration_minutes,
      distance_value: session.distance_value,
      distance_unit: session.distance_unit,
      exercises: [],
      review,
      reactions,
      photos,
      total_volume: null,
      exercise_count: 0,
      streak_days: null,
    },
    ownerProfile: profile || { display_name: null, avatar_url: null, hide_weight_details: false },
  }
}

// ─── Helpers ─────────────────────────────────────────

async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from('user_profiles')
    .select('display_name, avatar_url, hide_weight_details')
    .eq('id', userId)
    .single()
  return data as { display_name: string | null; avatar_url: string | null; hide_weight_details: boolean } | null
}

async function fetchExerciseSets(sessionId: string): Promise<FeedExerciseSet[]> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select(`
      id, session_id, plan_exercise_id, set_number,
      reps_completed, weight_used, completed,
      plan_exercise:plan_exercises(name, weight_unit)
    `)
    .eq('session_id', sessionId)
    .eq('completed', true)
    .order('set_number')

  if (error || !data) return []

  return data.map(s => {
    const pe = Array.isArray(s.plan_exercise) ? s.plan_exercise[0] : s.plan_exercise
    return {
      id: s.id,
      plan_exercise_id: s.plan_exercise_id,
      set_number: s.set_number,
      reps_completed: s.reps_completed,
      weight_used: s.weight_used,
      completed: s.completed,
      plan_exercise: (pe as { name: string; weight_unit: 'lbs' | 'kg' }) || { name: 'Unknown', weight_unit: 'lbs' as const },
    }
  })
}

async function fetchReview(sessionId: string, type: 'session' | 'template'): Promise<FeedReview | null> {
  const column = type === 'session' ? 'session_id' : 'template_session_id'
  const { data, error } = await supabase
    .from('workout_reviews')
    .select('overall_rating, difficulty_rating, energy_level, mood_before, mood_after, performance_tags, reflection')
    .eq(column, sessionId)
    .maybeSingle()

  if (error || !data) return null
  return {
    overall_rating: data.overall_rating,
    difficulty_rating: data.difficulty_rating,
    energy_level: data.energy_level,
    mood_before: data.mood_before,
    mood_after: data.mood_after,
    performance_tags: (data.performance_tags as string[]) || [],
    reflection: data.reflection,
  }
}

async function fetchReactions(sessionId: string, type: 'session' | 'template'): Promise<Reaction[]> {
  const column = type === 'session' ? 'session_id' : 'template_session_id'
  const { data, error } = await supabase
    .from('activity_reactions')
    .select(`id, user_id, reaction_type, created_at, ${column}`)
    .eq(column, sessionId)

  if (error || !data) return []
  return data as Reaction[]
}

async function fetchPhotos(sessionId: string, type: 'session' | 'template'): Promise<FeedPhoto[]> {
  const column = type === 'session' ? 'session_id' : 'template_session_id'
  const { data, error } = await supabase
    .from('workout_photos')
    .select('id, photo_url, caption')
    .eq(column, sessionId)
    .order('sort_order')

  if (error || !data) return []
  return data
}

// ─── Group exercises by name ─────────────────────────

function groupExercises(sets: FeedExerciseSet[]) {
  const groups = new Map<string, FeedExerciseSet[]>()
  for (const set of sets) {
    const name = set.plan_exercise?.name || 'Unknown'
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name)!.push(set)
  }
  return [...groups.entries()]
}

// ─── Helpers ─────────────────────────────────────────

function resolveAccentColor(workout: FeedWorkout | undefined): string {
  if (!workout) return 'var(--color-primary)'
  if (workout.type === 'weights') {
    const style = getWeightsStyleByName(workout.workout_name)
    return style?.color || 'var(--color-primary)'
  }
  if (workout.type === 'mobility' && workout.workout_category) {
    return getMobilityStyle(workout.workout_category)?.color || 'var(--color-mobility)'
  }
  if (workout.workout_category) {
    return getCardioStyle(workout.workout_category)?.color || 'var(--color-cardio)'
  }
  return 'var(--color-primary)'
}

function WorkoutIconDisplay({ workout, accentColor }: { workout: FeedWorkout | undefined; accentColor: string }) {
  if (!workout) return <Dumbbell className="w-8 h-8" style={{ color: accentColor }} />
  if (workout.type === 'weights') {
    const style = getWeightsStyleByName(workout.workout_name)
    const Icon = style?.icon || Dumbbell
    return <Icon className="w-8 h-8" style={{ color: accentColor }} />
  }
  if (workout.type === 'mobility') return <Activity className="w-8 h-8" style={{ color: accentColor }} />
  return <Zap className="w-8 h-8" style={{ color: accentColor }} />
}

// ─── Page Component ──────────────────────────────────

export function PublicSessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useAuthStore(s => s.user)

  // Determine session type from React Router location (not window.location)
  const isTemplate = location.pathname.includes('/community/cardio/')

  const { data, isLoading } = useQuery({
    queryKey: ['public-session', sessionId, isTemplate ? 'template' : 'weights'],
    queryFn: () => getPublicSession(sessionId!, isTemplate ? 'template' : 'weights'),
    enabled: !!sessionId,
  })

  const workout = data?.workout
  const hideWeights = data?.ownerProfile.hide_weight_details && workout?.user_id !== currentUser?.id

  // Workout style (computed from data, not created during render)
  const workoutName = workout
    ? workout.type === 'weights'
      ? getWorkoutDisplayName(workout.workout_name)
      : workout.workout_name
    : 'Workout'

  const accentColor = resolveAccentColor(workout)

  const getDuration = () => {
    if (!workout?.duration_minutes) return null
    return formatDuration(workout.duration_minutes * 60)
  }

  return (
    <AppShell title={workoutName} showBack>
      {isLoading ? (
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 skeleton rounded-2xl" />
          ))}
        </div>
      ) : workout ? (
        <div className="pb-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, ${accentColor}15 0%, transparent 100%)`
              }}
            />
            <div className="relative px-6 pt-4 pb-6 flex flex-col items-center text-center">
              {/* Workout icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <WorkoutIconDisplay workout={workout} accentColor={accentColor} />
              </div>

              {/* User info */}
              <button
                onClick={() => navigate(`/community/profile/${workout.user_id}`)}
                className="flex items-center gap-2 mb-2"
              >
                <Avatar
                  src={workout.user_profile?.avatar_url}
                  alt={workout.user_profile?.display_name || 'User'}
                  size="sm"
                  className="w-6 h-6"
                />
                <span className="text-sm font-medium text-[var(--color-primary)]">
                  {workout.user_profile?.display_name || 'Anonymous'}
                </span>
              </button>

              {/* Workout type for cardio/mobility */}
              {workout.type !== 'weights' && (
                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-1">
                  {workout.type} workout
                </p>
              )}

              {/* Date & time */}
              <p className="text-sm text-[var(--color-text-muted)]">
                {formatDate(workout.started_at)} · {formatTime(workout.started_at)}
              </p>

              {/* Status */}
              {workout.completed_at && (
                <div className="flex items-center gap-1.5 mt-2 text-[var(--color-success)] text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </div>
              )}
            </div>
          </div>

          {/* Metrics Row */}
          <div className="flex justify-around px-4 -mt-1 mb-4">
            {getDuration() && (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center mb-1.5">
                  {workout.type === 'weights' ? (
                    <Clock className="w-5 h-5 text-sky-500" />
                  ) : (
                    <Timer className="w-5 h-5 text-sky-500" />
                  )}
                </div>
                <span className="text-sm font-bold text-[var(--color-text)]">{getDuration()}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Duration</span>
              </div>
            )}
            {workout.type === 'weights' && (
              <>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center mb-1.5">
                    <Layers className="w-5 h-5 text-violet-500" />
                  </div>
                  <span className="text-sm font-bold text-[var(--color-text)]">{workout.exercise_count}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Exercises</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center mb-1.5">
                    <Dumbbell className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="text-sm font-bold text-[var(--color-text)]">{workout.exercises.length}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Sets</span>
                </div>
              </>
            )}
            {workout.distance_value && (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-1.5">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-sm font-bold text-[var(--color-text)]">
                  {workout.distance_value} {workout.distance_unit || 'mi'}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Distance</span>
              </div>
            )}
            {workout.distance_value && workout.duration_minutes && (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center mb-1.5">
                  <Clock className="w-5 h-5 text-violet-500" />
                </div>
                <span className="text-sm font-bold text-[var(--color-text)]">
                  {(workout.duration_minutes / workout.distance_value).toFixed(1)}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">
                  Min/{workout.distance_unit === 'km' ? 'km' : 'mi'}
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          {workout.notes && (
            <div className="px-4 mb-4">
              <div className="bg-[var(--color-surface)] rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <StickyNote className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{workout.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Review Section */}
          {workout.review && (
            <div className="px-4 mb-4">
              <ReviewSection review={workout.review} />
            </div>
          )}

          {/* Exercise list (weights only) */}
          {workout.type === 'weights' && workout.exercises.length > 0 && (
            <div className="px-4 mb-4">
              <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-1">
                Exercises
              </h3>
              <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden divide-y divide-[var(--color-border)]">
                {groupExercises(workout.exercises).map(([name, sets]) => (
                  <div key={name} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${accentColor}15` }}
                      >
                        <Dumbbell className="w-4 h-4" style={{ color: accentColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[var(--color-text)]">{name}</h4>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {(() => {
                            const allSameReps = sets.every(s => s.reps_completed === sets[0].reps_completed)
                            const allSameWeight = sets.every(s => s.weight_used === sets[0].weight_used)

                            if (allSameReps && allSameWeight) {
                              const reps = sets[0].reps_completed
                              const weight = sets[0].weight_used
                              const unit = sets[0].plan_exercise?.weight_unit || 'lbs'
                              return (
                                <span className="text-xs bg-[var(--color-background)] px-2.5 py-1 rounded-lg">
                                  <span className="font-medium text-[var(--color-text)]">
                                    {sets.length} {sets.length === 1 ? 'set' : 'sets'}
                                  </span>
                                  {reps != null && (
                                    <span className="text-[var(--color-text-muted)]">
                                      , {reps} reps
                                    </span>
                                  )}
                                  {weight != null && !hideWeights && (
                                    <span className="text-[var(--color-text-muted)]">
                                      {' '}@ {weight} {unit}
                                    </span>
                                  )}
                                </span>
                              )
                            }
                            return sets.map((set, index) => (
                              <span
                                key={set.id}
                                className="text-xs bg-[var(--color-background)] px-2.5 py-1 rounded-lg"
                              >
                                <span className="font-medium text-[var(--color-text)]">S{index + 1}</span>
                                {set.reps_completed != null && (
                                  <span className="text-[var(--color-text-muted)]">
                                    : {set.reps_completed} reps
                                  </span>
                                )}
                                {set.weight_used != null && !hideWeights && (
                                  <span className="text-[var(--color-text-muted)]">
                                    {' '}@ {set.weight_used} {set.plan_exercise?.weight_unit || 'lbs'}
                                  </span>
                                )}
                              </span>
                            ))
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {workout.photos.length > 0 && (
            <div className="px-4 mb-4">
              <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-1">
                Photos
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {workout.photos.map(photo => (
                  <img
                    key={photo.id}
                    src={photo.photo_url}
                    alt={photo.caption || 'Workout photo'}
                    className="w-32 h-32 rounded-2xl object-cover flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reactions */}
          <div className="px-4">
            <ReactionBar workout={workout} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-[var(--color-text-muted)]">Workout not found or is private.</p>
        </div>
      )}
    </AppShell>
  )
}

// ─── Review Section (inline, read-only) ──────────────

function ReviewSection({ review }: { review: FeedReview }) {
  const moodBefore = review.mood_before ? MOOD_MAP[review.mood_before as keyof typeof MOOD_MAP] : null
  const moodAfter = review.mood_after ? MOOD_MAP[review.mood_after as keyof typeof MOOD_MAP] : null

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-4 space-y-3">
      {/* Stars */}
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
        <span className="text-xs font-medium text-[var(--color-text-muted)]">{review.overall_rating}/5</span>
      </div>

      {/* Mood + Difficulty */}
      <div className="flex items-center gap-3 flex-wrap">
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
      </div>

      {/* Tags */}
      {review.performance_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {review.performance_tags.map(tag => {
            const config = TAG_MAP[tag as keyof typeof TAG_MAP]
            if (!config) return null
            return (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${config.color}15`, color: config.color }}
              >
                {config.label}
              </span>
            )
          })}
        </div>
      )}

      {/* Reflection */}
      {review.reflection && (
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed italic">
          "{review.reflection}"
        </p>
      )}
    </div>
  )
}
