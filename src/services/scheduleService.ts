import { supabase } from './supabase'

export interface WorkoutTemplate {
  id: string
  name: string
  type: 'weights' | 'cardio' | 'mobility'
  category: string | null
  description: string | null
  icon: string | null
  duration_minutes: number | null
  workout_day_id: string | null
  created_at: string
}

export interface ScheduleDay {
  id: string
  user_id: string
  day_number: number
  template_id: string | null
  workout_day_id: string | null
  is_rest_day: boolean
  sort_order: number
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
  sort_order?: number
}

export interface ScheduleWorkoutItem {
  type: 'rest' | 'weights' | 'cardio' | 'mobility'
  id?: string // workout_day_id or template_id
}

export function getDayName(dayNumber: number): string {
  return `Day ${dayNumber}`
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
  return (data || []).map(d => ({
    ...d,
    sort_order: d.sort_order ?? 0
  })) as ScheduleDay[]
}

export async function getScheduleDayWorkouts(userId: string, dayNumber: number): Promise<ScheduleDay[]> {
  const { data, error } = await supabase
    .from('user_schedules')
    .select(`
      *,
      template:workout_templates(*),
      workout_day:workout_days(id, name, day_number)
    `)
    .eq('user_id', userId)
    .eq('day_number', dayNumber)

  if (error) {
    console.warn('Error fetching schedule day:', error.message)
    return []
  }
  return (data || []).map(d => ({
    ...d,
    sort_order: d.sort_order ?? 0
  })) as ScheduleDay[]
}

// Legacy function for backwards compatibility - returns first workout
export async function getScheduleDay(userId: string, dayNumber: number): Promise<ScheduleDay | null> {
  const workouts = await getScheduleDayWorkouts(userId, dayNumber)
  return workouts[0] || null
}

export async function deleteScheduleDay(userId: string, dayNumber: number): Promise<void> {
  const { error } = await supabase
    .from('user_schedules')
    .delete()
    .eq('user_id', userId)
    .eq('day_number', dayNumber)

  if (error) throw error
}

// Save multiple workouts for a day (replaces all existing)
export async function saveScheduleDayWorkouts(
  userId: string,
  dayNumber: number,
  workouts: ScheduleWorkoutItem[]
): Promise<ScheduleDay[]> {
  console.log('saveScheduleDayWorkouts called:', { userId, dayNumber, workouts })

  // Delete existing schedules for this day
  try {
    await deleteScheduleDay(userId, dayNumber)
    console.log('Deleted existing schedules for day', dayNumber)
  } catch (deleteError) {
    console.error('Failed to delete existing schedules:', deleteError)
    throw new Error(`Failed to clear existing schedule: ${deleteError instanceof Error ? deleteError.message : String(deleteError)}`)
  }

  // If no workouts selected, just clear the day (don't insert anything)
  if (workouts.length === 0) {
    console.log('No workouts selected, day cleared')
    return []
  }

  // If rest day explicitly selected, insert rest entry
  if (workouts[0]?.type === 'rest') {
    console.log('Inserting rest day')
    const { data, error } = await supabase
      .from('user_schedules')
      .insert({
        user_id: userId,
        day_number: dayNumber,
        is_rest_day: true,
        template_id: null,
        workout_day_id: null
      })
      .select(`
        *,
        template:workout_templates(*),
        workout_day:workout_days(id, name, day_number)
      `)

    if (error) {
      console.error('Failed to insert rest day:', error)
      throw new Error(`Failed to save rest day: ${error.message}`)
    }
    return (data || []).map(d => ({
      ...d,
      sort_order: d.sort_order ?? 0
    })) as ScheduleDay[]
  }

  // Try inserting all workouts with sort_order
  const scheduleData = workouts.map((workout, index) => ({
    user_id: userId,
    day_number: dayNumber,
    is_rest_day: false,
    template_id: workout.type === 'cardio' || workout.type === 'mobility' ? workout.id : null,
    workout_day_id: workout.type === 'weights' ? workout.id : null,
    sort_order: index
  }))

  console.log('Inserting schedule data:', scheduleData)

  const { data, error } = await supabase
    .from('user_schedules')
    .insert(scheduleData)
    .select(`
      *,
      template:workout_templates(*),
      workout_day:workout_days(id, name, day_number)
    `)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Failed to insert schedules:', error)

    // Check if it's a column/constraint error (migration not applied)
    if (error.code === 'PGRST204' || error.message?.includes('sort_order') ||
        error.code === '23505' || error.message?.includes('unique constraint')) {
      // Fall back to single workout if multiple workouts not supported
      if (workouts.length > 1) {
        console.warn('Multiple workouts per day not supported. Apply migration 20240205000001_multiple_workouts_per_day.sql')
        throw new Error('Multiple workouts per day requires a database migration. Please save one workout at a time, or apply the migration.')
      }

      // Try inserting single workout without sort_order
      const singleData = {
        user_id: userId,
        day_number: dayNumber,
        is_rest_day: false,
        template_id: workouts[0].type === 'cardio' || workouts[0].type === 'mobility' ? workouts[0].id : null,
        workout_day_id: workouts[0].type === 'weights' ? workouts[0].id : null
      }

      const { data: fallbackData, error: fallbackError } = await supabase
        .from('user_schedules')
        .insert(singleData)
        .select(`
          *,
          template:workout_templates(*),
          workout_day:workout_days(id, name, day_number)
        `)

      if (fallbackError) {
        throw new Error(`Failed to save schedule: ${fallbackError.message}`)
      }
      return (fallbackData || []).map(d => ({
        ...d,
        sort_order: d.sort_order ?? 0
      })) as ScheduleDay[]
    }

    throw new Error(`Failed to save schedule: ${error.message}`)
  }
  console.log('Successfully saved schedules:', data)
  return (data || []).map(d => ({
    ...d,
    sort_order: d.sort_order ?? 0
  })) as ScheduleDay[]
}

// Legacy upsert function - now wraps saveScheduleDayWorkouts for single workout
export async function upsertScheduleDay(
  userId: string,
  dayNumber: number,
  data: UpdateScheduleDayData
): Promise<ScheduleDay | null> {
  let workoutItems: ScheduleWorkoutItem[] = []

  if (data.is_rest_day) {
    workoutItems = [{ type: 'rest' }]
  } else if (data.workout_day_id) {
    workoutItems = [{ type: 'weights', id: data.workout_day_id }]
  } else if (data.template_id) {
    // We need to determine if it's cardio or mobility
    // For simplicity, default to cardio - the actual type is stored in the template
    workoutItems = [{ type: 'cardio', id: data.template_id }]
  }
  // If no data provided, workoutItems stays empty (clears the day)

  const result = await saveScheduleDayWorkouts(userId, dayNumber, workoutItems)
  return result[0] || null
}

// Clear all schedule entries for a user
export async function clearUserSchedule(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_schedules')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}

// Initialize a default schedule for a new user
export async function initializeDefaultSchedule(userId: string, planId?: string): Promise<ScheduleDay[]> {
  // Get the workout days for the specified plan (or default PPL)
  let query = supabase
    .from('workout_days')
    .select('id, day_number, plan_id')
    .order('day_number')

  if (planId) {
    query = query.eq('plan_id', planId)
  } else {
    query = query.limit(3)
  }

  const { data: workoutDays, error: workoutError } = await query
  if (workoutError) throw workoutError

  // Build default schedule based on number of workout days
  let defaultSchedule: Array<{ day_number: number; workout_day_id: string | null; is_rest_day: boolean }>

  if (workoutDays && workoutDays.length === 2) {
    // Upper/Lower: Upper, Lower, Rest, Upper, Lower, Rest, Rest
    defaultSchedule = [
      { day_number: 1, workout_day_id: workoutDays[0]?.id || null, is_rest_day: false },
      { day_number: 2, workout_day_id: workoutDays[1]?.id || null, is_rest_day: false },
      { day_number: 3, is_rest_day: true, workout_day_id: null },
      { day_number: 4, workout_day_id: workoutDays[0]?.id || null, is_rest_day: false },
      { day_number: 5, workout_day_id: workoutDays[1]?.id || null, is_rest_day: false },
      { day_number: 6, is_rest_day: true, workout_day_id: null },
      { day_number: 7, is_rest_day: true, workout_day_id: null }
    ]
  } else {
    // PPL (3 days): Push, Pull, Legs, Rest, Push, Pull, Rest
    defaultSchedule = [
      { day_number: 1, workout_day_id: workoutDays?.[0]?.id || null, is_rest_day: false },
      { day_number: 2, workout_day_id: workoutDays?.[1]?.id || null, is_rest_day: false },
      { day_number: 3, workout_day_id: workoutDays?.[2]?.id || null, is_rest_day: false },
      { day_number: 4, is_rest_day: true, workout_day_id: null },
      { day_number: 5, workout_day_id: workoutDays?.[0]?.id || null, is_rest_day: false },
      { day_number: 6, workout_day_id: workoutDays?.[1]?.id || null, is_rest_day: false },
      { day_number: 7, is_rest_day: true, workout_day_id: null }
    ]
  }

  const scheduleData = defaultSchedule.map(day => ({
    user_id: userId,
    day_number: day.day_number,
    workout_day_id: day.workout_day_id,
    template_id: null,
    is_rest_day: day.is_rest_day
  }))

  const { data, error } = await supabase
    .from('user_schedules')
    .insert(scheduleData)
    .select(`
      *,
      template:workout_templates(*),
      workout_day:workout_days(id, name, day_number)
    `)

  if (error) throw error
  return (data || []).map(d => ({
    ...d,
    sort_order: d.sort_order ?? 0
  })) as ScheduleDay[]
}

// Get all workouts scheduled for the user's current cycle day
export async function getTodaysScheduledWorkouts(userId: string, currentCycleDay: number): Promise<ScheduleDay[]> {
  return getScheduleDayWorkouts(userId, currentCycleDay)
}

// Legacy function - returns first workout
export async function getTodaysScheduledWorkout(userId: string, currentCycleDay: number): Promise<ScheduleDay | null> {
  return getScheduleDay(userId, currentCycleDay)
}
