import { supabase } from './supabase'

export interface WorkoutTemplate {
  id: string
  name: string
  type: 'weights' | 'cardio' | 'mobility'
  category: string | null
  description: string | null
  icon: string | null
  duration_minutes: number | null
  created_at: string
}

export interface ScheduleDay {
  id: string
  user_id: string
  day_number: number
  template_id: string | null
  workout_day_id: string | null
  is_rest_day: boolean
  created_at: string
  updated_at: string
  // Joined data
  template?: WorkoutTemplate | null
  workout_day?: {
    id: string
    name: string
    day_number: number
  } | null
}

export interface UpdateScheduleDayData {
  template_id?: string | null
  workout_day_id?: string | null
  is_rest_day?: boolean
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function getDayName(dayNumber: number): string {
  return DAY_NAMES[dayNumber - 1] || `Day ${dayNumber}`
}

export async function getWorkoutTemplates(): Promise<WorkoutTemplate[]> {
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .order('type', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.warn('Error fetching workout templates:', error.message)
    return []
  }
  return data as WorkoutTemplate[]
}

export async function getWorkoutTemplatesByType(type: 'weights' | 'cardio' | 'mobility'): Promise<WorkoutTemplate[]> {
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('type', type)
    .order('name', { ascending: true })

  if (error) throw error
  return data as WorkoutTemplate[]
}

export async function getUserSchedule(userId: string): Promise<ScheduleDay[]> {
  const { data, error } = await supabase
    .from('user_schedules')
    .select(`
      *,
      template:workout_templates(*),
      workout_day:workout_days(id, name, day_number)
    `)
    .eq('user_id', userId)
    .order('day_number', { ascending: true })

  if (error) {
    console.warn('Error fetching user schedule:', error.message)
    return []
  }
  return data as ScheduleDay[]
}

export async function getScheduleDay(userId: string, dayNumber: number): Promise<ScheduleDay | null> {
  const { data, error } = await supabase
    .from('user_schedules')
    .select(`
      *,
      template:workout_templates(*),
      workout_day:workout_days(id, name, day_number)
    `)
    .eq('user_id', userId)
    .eq('day_number', dayNumber)
    .maybeSingle()

  if (error) {
    console.warn('Error fetching schedule day:', error.message)
    return null
  }
  return data as ScheduleDay | null
}

export async function upsertScheduleDay(
  userId: string,
  dayNumber: number,
  data: UpdateScheduleDayData
): Promise<ScheduleDay> {
  // Build the update data, ensuring constraint is satisfied
  // Either is_rest_day = true, OR template_id/workout_day_id is set
  const updateData = data.is_rest_day
    ? { is_rest_day: true, template_id: null, workout_day_id: null }
    : {
        is_rest_day: false,
        template_id: data.template_id || null,
        workout_day_id: data.workout_day_id || null
      }

  const { data: schedule, error } = await supabase
    .from('user_schedules')
    .upsert(
      {
        user_id: userId,
        day_number: dayNumber,
        ...updateData
      },
      {
        onConflict: 'user_id,day_number'
      }
    )
    .select(`
      *,
      template:workout_templates(*),
      workout_day:workout_days(id, name, day_number)
    `)
    .single()

  if (error) throw error
  return schedule as ScheduleDay
}

export async function deleteScheduleDay(userId: string, dayNumber: number): Promise<void> {
  const { error } = await supabase
    .from('user_schedules')
    .delete()
    .eq('user_id', userId)
    .eq('day_number', dayNumber)

  if (error) throw error
}

// Initialize a default schedule for a new user
export async function initializeDefaultSchedule(userId: string): Promise<ScheduleDay[]> {
  // Get the workout days (Push/Pull/Legs)
  const { data: workoutDays, error: workoutError } = await supabase
    .from('workout_days')
    .select('id, day_number')
    .order('day_number')
    .limit(3)

  if (workoutError) throw workoutError

  // Create default schedule: Push, Pull, Legs, Rest, Push, Pull, Rest
  const defaultSchedule = [
    { day_number: 1, workout_day_id: workoutDays?.[0]?.id || null, is_rest_day: false },
    { day_number: 2, workout_day_id: workoutDays?.[1]?.id || null, is_rest_day: false },
    { day_number: 3, workout_day_id: workoutDays?.[2]?.id || null, is_rest_day: false },
    { day_number: 4, is_rest_day: true },
    { day_number: 5, workout_day_id: workoutDays?.[0]?.id || null, is_rest_day: false },
    { day_number: 6, workout_day_id: workoutDays?.[1]?.id || null, is_rest_day: false },
    { day_number: 7, is_rest_day: true }
  ]

  const scheduleData = defaultSchedule.map(day => ({
    user_id: userId,
    day_number: day.day_number,
    workout_day_id: day.workout_day_id || null,
    template_id: null,
    is_rest_day: day.is_rest_day
  }))

  const { data, error } = await supabase
    .from('user_schedules')
    .upsert(scheduleData)
    .select(`
      *,
      template:workout_templates(*),
      workout_day:workout_days(id, name, day_number)
    `)

  if (error) throw error
  return data as ScheduleDay[]
}

// Get what workout is scheduled for the user's current cycle day
export async function getTodaysScheduledWorkout(userId: string, currentCycleDay: number): Promise<ScheduleDay | null> {
  return getScheduleDay(userId, currentCycleDay)
}
