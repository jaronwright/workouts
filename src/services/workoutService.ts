import { supabase } from './supabase'
import type { Tables } from '@/types/database'
import type { WorkoutDayWithSections, ExerciseSectionWithExercises } from '@/types/workout'

type WorkoutPlan = Tables<'workout_plans'>
type WorkoutDay = Tables<'workout_days'>
type ExerciseSection = Tables<'exercise_sections'>
type PlanExercise = Tables<'plan_exercises'>
type WorkoutSession = Tables<'workout_sessions'>
type ExerciseSet = Tables<'exercise_sets'>

export async function getWorkoutPlans(): Promise<WorkoutPlan[]> {
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .order('created_at')

  if (error) throw error
  return data as WorkoutPlan[]
}

export async function getWorkoutDays(planId: string): Promise<WorkoutDay[]> {
  const { data, error } = await supabase
    .from('workout_days')
    .select('*')
    .eq('plan_id', planId)
    .order('day_number')

  if (error) throw error
  return data as WorkoutDay[]
}

export async function getAllWorkoutDays(): Promise<WorkoutDay[]> {
  const { data, error } = await supabase
    .from('workout_days')
    .select('*')
    .order('day_number')

  if (error) throw error
  return data as WorkoutDay[]
}

export async function getWorkoutDayWithSections(dayId: string): Promise<WorkoutDayWithSections | null> {
  const { data: day, error: dayError } = await supabase
    .from('workout_days')
    .select('*')
    .eq('id', dayId)
    .single()

  if (dayError) throw dayError
  if (!day) return null

  const { data: sections, error: sectionsError } = await supabase
    .from('exercise_sections')
    .select('*')
    .eq('workout_day_id', dayId)
    .order('sort_order')

  if (sectionsError) throw sectionsError

  const sectionsWithExercises: ExerciseSectionWithExercises[] = await Promise.all(
    ((sections || []) as ExerciseSection[]).map(async (section) => {
      const { data: exercises, error: exercisesError } = await supabase
        .from('plan_exercises')
        .select('*')
        .eq('section_id', section.id)
        .order('sort_order')

      if (exercisesError) throw exercisesError

      return {
        ...section,
        exercises: (exercises || []) as PlanExercise[]
      }
    })
  )

  return {
    ...(day as WorkoutDay),
    sections: sectionsWithExercises
  }
}

export async function startWorkoutSession(userId: string, workoutDayId: string): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      workout_day_id: workoutDayId
    })
    .select()
    .single()

  if (error) throw error
  return data as WorkoutSession
}

export async function completeWorkoutSession(sessionId: string, notes?: string): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .update({
      completed_at: new Date().toISOString(),
      notes
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return data as WorkoutSession
}

export async function logExerciseSet(
  sessionId: string,
  planExerciseId: string,
  setNumber: number,
  repsCompleted: number | null,
  weightUsed: number | null
): Promise<ExerciseSet> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .insert({
      session_id: sessionId,
      plan_exercise_id: planExerciseId,
      set_number: setNumber,
      reps_completed: repsCompleted,
      weight_used: weightUsed,
      completed: true
    })
    .select()
    .single()

  if (error) throw error
  return data as ExerciseSet
}

export async function updateExerciseSet(
  setId: string,
  updates: {
    reps_completed?: number | null
    weight_used?: number | null
    completed?: boolean
  }
): Promise<ExerciseSet> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .update(updates)
    .eq('id', setId)
    .select()
    .single()

  if (error) throw error
  return data as ExerciseSet
}

export async function getSessionSets(sessionId: string): Promise<ExerciseSet[]> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at')

  if (error) throw error
  return data as ExerciseSet[]
}

export interface SessionWithDay extends WorkoutSession {
  workout_day: WorkoutDay | null
}

export async function getUserSessions(userId: string): Promise<SessionWithDay[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      workout_day:workout_days(*)
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (error) throw error
  return data as SessionWithDay[]
}

export async function getActiveSession(userId: string): Promise<SessionWithDay | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      workout_day:workout_days(*)
    `)
    .eq('user_id', userId)
    .is('completed_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data as SessionWithDay | null
}

export async function getExerciseHistory(userId: string, planExerciseId: string, limit = 10) {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select(`
      *,
      session:workout_sessions!inner(user_id, started_at)
    `)
    .eq('plan_exercise_id', planExerciseId)
    .eq('session.user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getLastWeightForExercise(userId: string, planExerciseId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select(`
      weight_used,
      session:workout_sessions!inner(user_id, started_at)
    `)
    .eq('plan_exercise_id', planExerciseId)
    .eq('session.user_id', userId)
    .not('weight_used', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data?.weight_used ?? null
}

export interface SessionWithSets extends WorkoutSession {
  workout_day: WorkoutDay | null
  exercise_sets: ExerciseSet[]
}

export async function getSessionWithSets(sessionId: string): Promise<SessionWithSets | null> {
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      workout_day:workout_days(*)
    `)
    .eq('id', sessionId)
    .single()

  if (sessionError) throw sessionError
  if (!session) return null

  const { data: sets, error: setsError } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at')

  if (setsError) throw setsError

  return {
    ...(session as SessionWithDay),
    exercise_sets: (sets || []) as ExerciseSet[]
  }
}

export async function getSessionExerciseDetails(sessionId: string) {
  // Get all exercise sets for this session
  const { data: sets, error: setsError } = await supabase
    .from('exercise_sets')
    .select(`
      *,
      plan_exercise:plan_exercises(
        *,
        section:exercise_sections(name, sort_order)
      )
    `)
    .eq('session_id', sessionId)
    .order('created_at')

  if (setsError) throw setsError
  return sets
}

export async function deleteWorkoutSession(sessionId: string): Promise<void> {
  // First delete all exercise sets for this session
  const { error: setsError } = await supabase
    .from('exercise_sets')
    .delete()
    .eq('session_id', sessionId)

  if (setsError) throw setsError

  // Then delete the session itself
  const { error: sessionError } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', sessionId)

  if (sessionError) throw sessionError
}
