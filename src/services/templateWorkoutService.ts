import { supabase } from './supabase'
import type { WorkoutTemplate } from './scheduleService'

export interface TemplateWorkoutSession {
  id: string
  user_id: string
  template_id: string
  started_at: string
  completed_at: string | null
  duration_minutes: number | null
  distance_value: number | null
  distance_unit: string | null
  notes: string | null
  template?: WorkoutTemplate | null
}

export interface StartTemplateWorkoutData {
  templateId: string
}

export interface CompleteTemplateWorkoutData {
  sessionId: string
  durationMinutes?: number
  distanceValue?: number
  distanceUnit?: string
  notes?: string
}

export async function getTemplateById(templateId: string): Promise<WorkoutTemplate | null> {
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('id', templateId)
    .maybeSingle()

  if (error) {
    if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('does not exist')) {
      return null
    }
    throw error
  }
  return data as WorkoutTemplate | null
}

export async function startTemplateWorkout(
  userId: string,
  templateId: string
): Promise<TemplateWorkoutSession> {
  // Get template to check type
  const template = await getTemplateById(templateId)
  if (!template) throw new Error('Template not found')

  // Create a workout session linked to template
  // We'll store template sessions in a separate table or use a special marker
  // For now, use the notes field to indicate template type
  const { data, error } = await supabase
    .from('template_workout_sessions')
    .insert({
      user_id: userId,
      template_id: templateId,
      started_at: new Date().toISOString()
    })
    .select(`
      *,
      template:workout_templates(*)
    `)
    .single()

  if (error) {
    throw error
  }

  return data as TemplateWorkoutSession
}

export async function completeTemplateWorkout(
  sessionId: string,
  data: Omit<CompleteTemplateWorkoutData, 'sessionId'>
): Promise<TemplateWorkoutSession> {
  const { data: session, error } = await supabase
    .from('template_workout_sessions')
    .update({
      completed_at: new Date().toISOString(),
      duration_minutes: data.durationMinutes || null,
      distance_value: data.distanceValue || null,
      distance_unit: data.distanceUnit || null,
      notes: data.notes || null
    })
    .eq('id', sessionId)
    .select(`
      *,
      template:workout_templates(*)
    `)
    .single()

  if (error) throw error
  return session as TemplateWorkoutSession
}

export async function getUserTemplateWorkouts(userId: string): Promise<TemplateWorkoutSession[]> {
  const { data, error } = await supabase
    .from('template_workout_sessions')
    .select(`
      *,
      template:workout_templates(*)
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (error) {
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      console.warn('template_workout_sessions table may not exist:', error.message)
      return []
    }
    throw error
  }
  return data as TemplateWorkoutSession[]
}

export async function quickLogTemplateWorkout(
  userId: string,
  templateId: string,
  data: { durationMinutes?: number; distanceValue?: number; distanceUnit?: string }
): Promise<TemplateWorkoutSession> {
  const session = await startTemplateWorkout(userId, templateId)
  const completed = await completeTemplateWorkout(session.id, {
    durationMinutes: data.durationMinutes,
    distanceValue: data.distanceValue,
    distanceUnit: data.distanceUnit
  })
  return completed
}

export async function getActiveTemplateWorkout(userId: string): Promise<TemplateWorkoutSession | null> {
  const { data, error } = await supabase
    .from('template_workout_sessions')
    .select(`
      *,
      template:workout_templates(*)
    `)
    .eq('user_id', userId)
    .is('completed_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      console.warn('template_workout_sessions table may not exist:', error.message)
      return null
    }
    throw error
  }
  return data as TemplateWorkoutSession | null
}
