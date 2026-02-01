import { supabase } from './supabase'

export interface SocialWorkout {
  id: string
  user_id: string
  started_at: string
  completed_at: string | null
  notes: string | null
  is_public: boolean
  // Type information
  type: 'weights' | 'cardio' | 'mobility'
  // Joined data
  user_profile?: {
    display_name: string | null
  } | null
  workout_day?: {
    name: string
  } | null
  template?: {
    name: string
    type: string
    category: string | null
  } | null
  // Cardio-specific
  duration_minutes?: number | null
  distance_value?: number | null
  distance_unit?: string | null
}

export async function getSocialFeed(limit = 20): Promise<SocialWorkout[]> {
  // Get weights workouts
  const { data: weightsData, error: weightsError } = await supabase
    .from('workout_sessions')
    .select(`
      id,
      user_id,
      started_at,
      completed_at,
      notes,
      is_public,
      workout_day:workout_days(name),
      user_profile:user_profiles(display_name)
    `)
    .eq('is_public', true)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (weightsError) {
    console.warn('Error fetching weights sessions for feed:', weightsError.message)
  }

  // Get template workouts (cardio/mobility)
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
      template:workout_templates(name, type, category),
      user_profile:user_profiles(display_name)
    `)
    .eq('is_public', true)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (templateError) {
    console.warn('Error fetching template sessions for feed:', templateError.message)
  }

  // Combine and sort
  const allWorkouts: SocialWorkout[] = []

  if (weightsData) {
    weightsData.forEach(w => {
      // Handle array returns from Supabase joins
      const workoutDay = Array.isArray(w.workout_day) ? w.workout_day[0] : w.workout_day
      const userProfile = Array.isArray(w.user_profile) ? w.user_profile[0] : w.user_profile

      allWorkouts.push({
        id: w.id,
        user_id: w.user_id,
        started_at: w.started_at,
        completed_at: w.completed_at,
        notes: w.notes,
        type: 'weights' as const,
        workout_day: workoutDay as { name: string } | null,
        user_profile: userProfile as { display_name: string | null } | null,
        is_public: w.is_public ?? true
      })
    })
  }

  if (templateData) {
    templateData.forEach(t => {
      // Handle array returns from Supabase joins
      const template = Array.isArray(t.template) ? t.template[0] : t.template
      const userProfile = Array.isArray(t.user_profile) ? t.user_profile[0] : t.user_profile

      allWorkouts.push({
        id: t.id,
        user_id: t.user_id,
        started_at: t.started_at,
        completed_at: t.completed_at,
        notes: t.notes,
        type: ((template as { type?: string })?.type as 'cardio' | 'mobility') || 'cardio',
        template: template as { name: string; type: string; category: string | null } | null,
        user_profile: userProfile as { display_name: string | null } | null,
        is_public: t.is_public ?? true,
        duration_minutes: t.duration_minutes,
        distance_value: t.distance_value,
        distance_unit: t.distance_unit
      })
    })
  }

  // Sort by completed_at descending
  allWorkouts.sort((a, b) => {
    const dateA = new Date(a.completed_at || a.started_at).getTime()
    const dateB = new Date(b.completed_at || b.started_at).getTime()
    return dateB - dateA
  })

  return allWorkouts.slice(0, limit)
}

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
