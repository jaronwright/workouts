import { supabase } from './supabase'

// ─── Types ────────────────────────────────────────────

export type MoodValue = 'great' | 'good' | 'neutral' | 'tired' | 'stressed'

export type PerformanceTag =
  | 'felt_strong'
  | 'new_pr'
  | 'tired'
  | 'pumped'
  | 'rushed'
  | 'sore'
  | 'focused'
  | 'distracted'
  | 'good_form'
  | 'heavy'
  | 'light_day'
  | 'breakthrough'

export interface WorkoutReview {
  id: string
  user_id: string
  session_id: string | null
  template_session_id: string | null
  overall_rating: number
  difficulty_rating: number | null
  energy_level: number | null
  mood_before: MoodValue | null
  mood_after: MoodValue | null
  performance_tags: PerformanceTag[]
  reflection: string | null
  highlights: string | null
  improvements: string | null
  workout_duration_minutes: number | null
  created_at: string
  updated_at: string
}

export interface CreateReviewData {
  session_id?: string
  template_session_id?: string
  overall_rating: number
  difficulty_rating?: number
  energy_level?: number
  mood_before?: MoodValue
  mood_after?: MoodValue
  performance_tags?: PerformanceTag[]
  reflection?: string
  highlights?: string
  improvements?: string
  workout_duration_minutes?: number
}

export interface UpdateReviewData {
  overall_rating?: number
  difficulty_rating?: number | null
  energy_level?: number | null
  mood_before?: MoodValue | null
  mood_after?: MoodValue | null
  performance_tags?: PerformanceTag[]
  reflection?: string | null
  highlights?: string | null
  improvements?: string | null
}

// ─── CRUD Operations ──────────────────────────────────

export async function createReview(
  userId: string,
  data: CreateReviewData
): Promise<WorkoutReview> {
  const { data: review, error } = await supabase
    .from('workout_reviews')
    .insert({
      user_id: userId,
      session_id: data.session_id || null,
      template_session_id: data.template_session_id || null,
      overall_rating: data.overall_rating,
      difficulty_rating: data.difficulty_rating ?? null,
      energy_level: data.energy_level ?? null,
      mood_before: data.mood_before ?? null,
      mood_after: data.mood_after ?? null,
      performance_tags: data.performance_tags || [],
      reflection: data.reflection ?? null,
      highlights: data.highlights ?? null,
      improvements: data.improvements ?? null,
      workout_duration_minutes: data.workout_duration_minutes ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return review as WorkoutReview
}

export async function getReviewBySessionId(
  sessionId: string
): Promise<WorkoutReview | null> {
  const { data, error } = await supabase
    .from('workout_reviews')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (error) throw error
  return data as WorkoutReview | null
}

export async function getReviewByTemplateSessionId(
  templateSessionId: string
): Promise<WorkoutReview | null> {
  const { data, error } = await supabase
    .from('workout_reviews')
    .select('*')
    .eq('template_session_id', templateSessionId)
    .maybeSingle()

  if (error) throw error
  return data as WorkoutReview | null
}

export async function getUserReviews(
  userId: string,
  limit = 20,
  offset = 0
): Promise<WorkoutReview[]> {
  const { data, error } = await supabase
    .from('workout_reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return (data || []) as WorkoutReview[]
}

export async function updateReview(
  reviewId: string,
  data: UpdateReviewData
): Promise<WorkoutReview> {
  const { data: review, error } = await supabase
    .from('workout_reviews')
    .update(data)
    .eq('id', reviewId)
    .select()
    .single()

  if (error) throw error
  return review as WorkoutReview
}

export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from('workout_reviews')
    .delete()
    .eq('id', reviewId)

  if (error) throw error
}

export async function getReviewsInRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<WorkoutReview[]> {
  const { data, error } = await supabase
    .from('workout_reviews')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []) as WorkoutReview[]
}

export async function getReviewCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('workout_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count || 0
}
