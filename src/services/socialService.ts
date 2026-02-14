import { supabase } from './supabase'
import type {
  FeedWorkout,
  FeedExerciseSet,
  FeedReview,
  FeedPhoto,
  Reaction,
  FeedUserProfile,
  PublicProfile,
} from '@/types/community'

// ─── Social Feed ─────────────────────────────────────

export async function getSocialFeed(limit = 20): Promise<FeedWorkout[]> {
  // Fetch weights sessions with profile + review + reactions + photos
  const { data: weightsData, error: weightsError } = await supabase
    .from('workout_sessions')
    .select(`
      id,
      user_id,
      started_at,
      completed_at,
      notes,
      is_public,
      workout_day:workout_days(name)
    `)
    .eq('is_public', true)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (weightsError) {
    console.warn('Error fetching weights sessions for feed:', weightsError.message)
  }

  // Fetch template sessions with profile + review + reactions + photos
  const { data: templateData, error: templateError } = await supabase
    .from('template_workout_sessions')
    .select(`
      id,
      user_id,
      started_at,
      completed_at,
      notes,
      is_public,
      duration_minutes,
      distance_value,
      distance_unit,
      template:workout_templates(name, type, category)
    `)
    .eq('is_public', true)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (templateError) {
    console.warn('Error fetching template sessions for feed:', templateError.message)
  }

  // Collect all user IDs for profile fetching
  const userIds = new Set<string>()
  const sessionIds: string[] = []
  const templateSessionIds: string[] = []

  weightsData?.forEach(w => {
    userIds.add(w.user_id)
    sessionIds.push(w.id)
  })
  templateData?.forEach(t => {
    userIds.add(t.user_id)
    templateSessionIds.push(t.id)
  })

  // Batch fetch profiles, reviews, reactions, and photos
  const [profiles, reactions, reviews, photos, exerciseSets] = await Promise.all([
    fetchUserProfiles([...userIds]),
    fetchReactionsForSessions(sessionIds, templateSessionIds),
    fetchReviewsForSessions(sessionIds, templateSessionIds),
    fetchPhotosForSessions(sessionIds, templateSessionIds),
    fetchExerciseSetsForSessions(sessionIds),
  ])

  // Build the feed
  const allWorkouts: FeedWorkout[] = []

  if (weightsData) {
    for (const w of weightsData) {
      const workoutDay = Array.isArray(w.workout_day) ? w.workout_day[0] : w.workout_day
      const sets = exerciseSets.get(w.id) || []
      const exerciseNames = new Set(sets.map(s => s.plan_exercise?.name).filter(Boolean))
      const totalVolume = sets.reduce((sum, s) => {
        if (s.reps_completed && s.weight_used) return sum + s.reps_completed * s.weight_used
        return sum
      }, 0)

      const duration = w.completed_at && w.started_at
        ? Math.round((new Date(w.completed_at).getTime() - new Date(w.started_at).getTime()) / 60000)
        : null

      allWorkouts.push({
        id: w.id,
        user_id: w.user_id,
        started_at: w.started_at,
        completed_at: w.completed_at,
        notes: w.notes,
        is_public: w.is_public ?? true,
        type: 'weights',
        user_profile: profiles.get(w.user_id) || null,
        workout_name: (workoutDay as { name: string } | null)?.name || 'Workout',
        workout_category: null,
        duration_minutes: duration,
        distance_value: null,
        distance_unit: null,
        exercises: sets,
        review: reviews.get(`session:${w.id}`) || null,
        reactions: reactions.get(`session:${w.id}`) || [],
        photos: photos.get(`session:${w.id}`) || [],
        total_volume: totalVolume > 0 ? totalVolume : null,
        exercise_count: exerciseNames.size,
        streak_days: null, // computed separately if needed
      })
    }
  }

  if (templateData) {
    for (const t of templateData) {
      const template = Array.isArray(t.template) ? t.template[0] : t.template
      const typedTemplate = template as { name: string; type: string; category: string | null } | null

      allWorkouts.push({
        id: t.id,
        user_id: t.user_id,
        started_at: t.started_at,
        completed_at: t.completed_at,
        notes: t.notes,
        is_public: t.is_public ?? true,
        type: (typedTemplate?.type as 'cardio' | 'mobility') || 'cardio',
        user_profile: profiles.get(t.user_id) || null,
        workout_name: typedTemplate?.name || 'Workout',
        workout_category: typedTemplate?.category || null,
        duration_minutes: t.duration_minutes,
        distance_value: t.distance_value,
        distance_unit: t.distance_unit,
        exercises: [],
        review: reviews.get(`template:${t.id}`) || null,
        reactions: reactions.get(`template:${t.id}`) || [],
        photos: photos.get(`template:${t.id}`) || [],
        total_volume: null,
        exercise_count: 0,
        streak_days: null,
      })
    }
  }

  // Sort by completed_at descending
  allWorkouts.sort((a, b) => {
    const dateA = new Date(a.completed_at || a.started_at).getTime()
    const dateB = new Date(b.completed_at || b.started_at).getTime()
    return dateB - dateA
  })

  return allWorkouts.slice(0, limit)
}

// ─── Batch Fetchers ──────────────────────────────────

// Shared helper: query a table for both session types and group results by polymorphic key
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function queryPolymorphicSessions<T>(
  table: 'activity_reactions' | 'workout_reviews' | 'workout_photos',
  select: string,
  sessionIds: string[],
  templateSessionIds: string[],
  processRow: (row: any) => T,
  idColumn: 'session_id' | 'template_session_id',
  keyPrefix: 'session' | 'template'
): Promise<Map<string, T[]>> {
  const map = new Map<string, T[]>()
  const ids = idColumn === 'session_id' ? sessionIds : templateSessionIds
  if (ids.length === 0) return map

  const query = supabase.from(table).select(select).in(idColumn, ids)
  if (table === 'workout_photos') query.order('sort_order')

  const { data, error } = await query
  if (error) { console.warn(`Error fetching ${table}:`, error.message); return map }

  data?.forEach(row => {
    const key = `${keyPrefix}:${row[idColumn]}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(processRow(row))
  })

  return map
}

// Merge two maps (mutates target)
function mergeMaps<T>(target: Map<string, T[]>, source: Map<string, T[]>): void {
  source.forEach((values, key) => {
    if (!target.has(key)) target.set(key, [])
    target.get(key)!.push(...values)
  })
}

async function fetchUserProfiles(userIds: string[]): Promise<Map<string, FeedUserProfile>> {
  const map = new Map<string, FeedUserProfile>()
  if (userIds.length === 0) return map

  // Try with hide_weight_details first; fall back to core columns if migration not applied
  const result = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url, selected_plan_id, hide_weight_details')
    .in('id', userIds)

  let profiles = result.data

  if (result.error) {
    // Retry without hide_weight_details in case the column doesn't exist yet
    const fallback = await supabase
      .from('user_profiles')
      .select('id, display_name, avatar_url, selected_plan_id')
      .in('id', userIds)

    if (fallback.error) {
      console.warn('Error fetching profiles:', fallback.error.message)
      return map
    }
    profiles = fallback.data
  }

  profiles?.forEach(p => {
    map.set(p.id, {
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      selected_plan_id: p.selected_plan_id,
      hide_weight_details: ('hide_weight_details' in p ? p.hide_weight_details : false) as boolean,
    })
  })

  return map
}

async function fetchReactionsForSessions(
  sessionIds: string[],
  templateSessionIds: string[]
): Promise<Map<string, Reaction[]>> {
  const [sessionReactions, templateReactions] = await Promise.all([
    queryPolymorphicSessions<Reaction>(
      'activity_reactions', 'id, user_id, session_id, reaction_type, created_at',
      sessionIds, templateSessionIds, r => r as Reaction, 'session_id', 'session'
    ),
    queryPolymorphicSessions<Reaction>(
      'activity_reactions', 'id, user_id, template_session_id, reaction_type, created_at',
      sessionIds, templateSessionIds, r => r as Reaction, 'template_session_id', 'template'
    ),
  ])

  const map = sessionReactions
  mergeMaps(map, templateReactions)

  // Fetch profiles for all reactors
  const reactorIds = new Set<string>()
  map.forEach(reactions => reactions.forEach(r => reactorIds.add(r.user_id)))
  const profiles = await fetchUserProfiles([...reactorIds])

  // Attach profiles to reactions
  map.forEach(reactions => {
    reactions.forEach(r => {
      const profile = profiles.get(r.user_id)
      if (profile) {
        r.user_profile = {
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
        }
      }
    })
  })

  return map
}

async function fetchReviewsForSessions(
  sessionIds: string[],
  templateSessionIds: string[]
): Promise<Map<string, FeedReview>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toReview = (r: any): FeedReview => ({
    overall_rating: r.overall_rating,
    difficulty_rating: r.difficulty_rating,
    energy_level: r.energy_level,
    mood_before: r.mood_before,
    mood_after: r.mood_after,
    performance_tags: (r.performance_tags as string[]) || [],
    reflection: r.reflection,
  })

  const reviewSelect = 'overall_rating, difficulty_rating, energy_level, mood_before, mood_after, performance_tags, reflection'

  const [sessionReviews, templateReviews] = await Promise.all([
    queryPolymorphicSessions<FeedReview>(
      'workout_reviews', `session_id, ${reviewSelect}`,
      sessionIds, templateSessionIds, toReview, 'session_id', 'session'
    ),
    queryPolymorphicSessions<FeedReview>(
      'workout_reviews', `template_session_id, ${reviewSelect}`,
      sessionIds, templateSessionIds, toReview, 'template_session_id', 'template'
    ),
  ])

  // Reviews are 1:1 — convert to single-value map
  const map = new Map<string, FeedReview>()
  sessionReviews.forEach((reviews, key) => { if (reviews[0]) map.set(key, reviews[0]) })
  templateReviews.forEach((reviews, key) => { if (reviews[0]) map.set(key, reviews[0]) })
  return map
}

async function fetchPhotosForSessions(
  sessionIds: string[],
  templateSessionIds: string[]
): Promise<Map<string, FeedPhoto[]>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toPhoto = (p: any): FeedPhoto => ({ id: p.id, photo_url: p.photo_url, caption: p.caption })

  const [sessionPhotos, templatePhotos] = await Promise.all([
    queryPolymorphicSessions<FeedPhoto>(
      'workout_photos', 'id, session_id, photo_url, caption',
      sessionIds, templateSessionIds, toPhoto, 'session_id', 'session'
    ),
    queryPolymorphicSessions<FeedPhoto>(
      'workout_photos', 'id, template_session_id, photo_url, caption',
      sessionIds, templateSessionIds, toPhoto, 'template_session_id', 'template'
    ),
  ])

  const map = sessionPhotos
  mergeMaps(map, templatePhotos)
  return map
}

async function fetchExerciseSetsForSessions(
  sessionIds: string[]
): Promise<Map<string, FeedExerciseSet[]>> {
  const map = new Map<string, FeedExerciseSet[]>()
  if (sessionIds.length === 0) return map

  const { data, error } = await supabase
    .from('exercise_sets')
    .select(`
      id,
      session_id,
      plan_exercise_id,
      set_number,
      reps_completed,
      weight_used,
      completed,
      plan_exercise:plan_exercises(name, weight_unit, reps_unit)
    `)
    .in('session_id', sessionIds)
    .eq('completed', true)
    .order('set_number')

  if (error) {
    console.warn('Error fetching exercise sets:', error.message)
    return map
  }

  data?.forEach(s => {
    const key = s.session_id
    if (!map.has(key)) map.set(key, [])
    const planExercise = Array.isArray(s.plan_exercise) ? s.plan_exercise[0] : s.plan_exercise
    map.get(key)!.push({
      id: s.id,
      plan_exercise_id: s.plan_exercise_id,
      set_number: s.set_number,
      reps_completed: s.reps_completed,
      weight_used: s.weight_used,
      completed: s.completed,
      plan_exercise: (planExercise as { name: string; weight_unit: 'lbs' | 'kg'; reps_unit: string }) || { name: 'Unknown', weight_unit: 'lbs' as const, reps_unit: 'reps' },
    })
  })

  return map
}

// ─── Public Profile ──────────────────────────────────

export async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url, selected_plan_id, hide_weight_details')
    .eq('id', userId)
    .single()

  if (error || !profile) return null

  // Get plan name
  let planName: string | null = null
  if (profile.selected_plan_id) {
    const { data: plan } = await supabase
      .from('workout_plans')
      .select('name')
      .eq('id', profile.selected_plan_id)
      .single()
    planName = plan?.name || null
  }

  // Get stats
  const [weightsCount, templateCount] = await Promise.all([
    supabase
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null),
    supabase
      .from('template_workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null),
  ])

  const totalWorkouts = (weightsCount.count || 0) + (templateCount.count || 0)

  // Get this week's workouts
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekStartISO = weekStart.toISOString()

  const [thisWeekWeights, thisWeekTemplates] = await Promise.all([
    supabase
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('completed_at', weekStartISO),
    supabase
      .from('template_workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('completed_at', weekStartISO),
  ])

  const thisWeek = (thisWeekWeights.count || 0) + (thisWeekTemplates.count || 0)

  // Get recent public workouts (reuse the feed function with user filter)
  const recentWorkouts = await getSocialFeedForUser(userId, 5)

  return {
    id: profile.id,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    selected_plan_id: profile.selected_plan_id,
    plan_name: planName,
    hide_weight_details: profile.hide_weight_details ?? false,
    stats: {
      total_workouts: totalWorkouts,
      current_streak: 0, // TODO: compute from completion dates
      this_week: thisWeek,
    },
    recent_workouts: recentWorkouts,
  }
}

async function getSocialFeedForUser(userId: string, limit: number): Promise<FeedWorkout[]> {
  const feed = await getSocialFeed(100)
  return feed.filter(w => w.user_id === userId).slice(0, limit)
}

// ─── Toggle Workout Visibility ───────────────────────

export async function toggleWorkoutPublic(
  sessionId: string,
  isWeightsSession: boolean,
  isPublic: boolean
): Promise<void> {
  const table = isWeightsSession ? 'workout_sessions' : 'template_workout_sessions'

  const { error } = await supabase
    .from(table)
    .update({ is_public: isPublic })
    .eq('id', sessionId)

  if (error) throw error
}
