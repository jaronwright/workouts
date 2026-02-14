import { supabase } from './supabase'
import {
  FULL_BODY_PLAN_ID,
  BRO_SPLIT_PLAN_ID,
  ARNOLD_SPLIT_PLAN_ID,
  GLUTE_HYPERTROPHY_PLAN_ID,
} from '@/config/planConstants'

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

// Shared select query for schedule joins (used by all schedule queries)
const SCHEDULE_SELECT = `
  *,
  template:workout_templates(*),
  workout_day:workout_days(id, name, day_number)
`

// Normalize Supabase schedule rows — ensures sort_order always has a value
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toScheduleDays(data: any[] | null): ScheduleDay[] {
  return (data || []).map(d => ({ ...d, sort_order: d.sort_order ?? 0 }))
}

// Day patterns for initializeDefaultSchedule: index into workoutDays array, null = rest
// Pattern order: [Day1, Day2, Day3, Day4, Day5, Day6, Day7]
const PLAN_DAY_PATTERNS: Record<string, (number | null)[]> = {
  [FULL_BODY_PLAN_ID]:          [0, null, 1, null, 2, null, null],
  [BRO_SPLIT_PLAN_ID]:          [0, 1, 2, 3, 4, null, null],
  [ARNOLD_SPLIT_PLAN_ID]:       [0, 1, 2, 0, 1, 2, null],
  [GLUTE_HYPERTROPHY_PLAN_ID]:  [0, 1, null, 2, 3, 4, null],
}

// Fallback patterns by workout day count
const FALLBACK_DAY_PATTERNS: Record<number, (number | null)[]> = {
  2: [0, 1, null, 0, 1, null, null],        // Upper/Lower
  3: [0, 1, 2, null, 0, 1, null],            // PPL (default)
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

export async function getMobilityTemplatesByCategory(category: string): Promise<WorkoutTemplate[]> {
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('type', 'mobility')
    .eq('category', category)
    .order('duration_minutes', { ascending: true })

  if (error) throw error
  return data as WorkoutTemplate[]
}

export async function getMobilityCategories(): Promise<{ category: string; template: WorkoutTemplate }[]> {
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('type', 'mobility')
    .order('name', { ascending: true })

  if (error) throw error

  const templates = data as WorkoutTemplate[]
  const seen = new Set<string>()
  const categories: { category: string; template: WorkoutTemplate }[] = []

  for (const t of templates) {
    if (t.category && !seen.has(t.category)) {
      seen.add(t.category)
      categories.push({ category: t.category, template: t })
    }
  }

  return categories
}

export async function getUserSchedule(userId: string): Promise<ScheduleDay[]> {
  const { data, error } = await supabase
    .from('user_schedules')
    .select(SCHEDULE_SELECT)
    .eq('user_id', userId)
    .order('day_number', { ascending: true })

  if (error) {
    console.warn('Error fetching user schedule:', error.message)
    return []
  }
  return toScheduleDays(data)
}

export async function getScheduleDayWorkouts(userId: string, dayNumber: number): Promise<ScheduleDay[]> {
  const { data, error } = await supabase
    .from('user_schedules')
    .select(SCHEDULE_SELECT)
    .eq('user_id', userId)
    .eq('day_number', dayNumber)

  if (error) {
    console.warn('Error fetching schedule day:', error.message)
    return []
  }
  return toScheduleDays(data)
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

// Insert a rest day entry for the given user/day
async function insertRestDay(userId: string, dayNumber: number): Promise<ScheduleDay[]> {
  const { data, error } = await supabase
    .from('user_schedules')
    .insert({
      user_id: userId,
      day_number: dayNumber,
      is_rest_day: true,
      template_id: null,
      workout_day_id: null
    })
    .select(SCHEDULE_SELECT)

  if (error) throw new Error(`Failed to save rest day: ${error.message}`)
  return toScheduleDays(data)
}

// Save multiple workouts for a day (replaces all existing)
export async function saveScheduleDayWorkouts(
  userId: string,
  dayNumber: number,
  workouts: ScheduleWorkoutItem[]
): Promise<ScheduleDay[]> {
  if (workouts.length > 3) {
    console.warn('Overtraining risk: User scheduling', workouts.length, 'workouts on day', dayNumber)
  }

  // Delete existing schedules for this day
  try {
    await deleteScheduleDay(userId, dayNumber)
  } catch (deleteError) {
    throw new Error(`Failed to clear existing schedule: ${deleteError instanceof Error ? deleteError.message : String(deleteError)}`)
  }

  // Empty selection or explicit rest → insert a rest day
  if (workouts.length === 0 || workouts[0]?.type === 'rest') {
    return insertRestDay(userId, dayNumber)
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

  const { data, error } = await supabase
    .from('user_schedules')
    .insert(scheduleData)
    .select(SCHEDULE_SELECT)
    .order('sort_order', { ascending: true })

  if (error) {
    // Check if it's a column/constraint error (migration not applied)
    if (error.code === 'PGRST204' || error.message?.includes('sort_order') ||
        error.code === '23505' || error.message?.includes('unique constraint')) {
      if (workouts.length > 1) {
        throw new Error('Multiple workouts per day requires a database migration. Please save one workout at a time, or apply the migration.')
      }

      // Fall back to single workout without sort_order
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('user_schedules')
        .insert({
          user_id: userId,
          day_number: dayNumber,
          is_rest_day: false,
          template_id: workouts[0].type === 'cardio' || workouts[0].type === 'mobility' ? workouts[0].id : null,
          workout_day_id: workouts[0].type === 'weights' ? workouts[0].id : null
        })
        .select(SCHEDULE_SELECT)

      if (fallbackError) throw new Error(`Failed to save schedule: ${fallbackError.message}`)
      return toScheduleDays(fallbackData)
    }

    throw new Error(`Failed to save schedule: ${error.message}`)
  }
  return toScheduleDays(data)
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
    workoutItems = [{ type: 'cardio', id: data.template_id }]
  }

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

  // Look up pattern: plan-specific → day-count fallback → PPL default
  const pattern = (planId && PLAN_DAY_PATTERNS[planId])
    || FALLBACK_DAY_PATTERNS[workoutDays?.length ?? 3]
    || FALLBACK_DAY_PATTERNS[3]

  const scheduleData = pattern.map((dayIndex, i) => ({
    user_id: userId,
    day_number: i + 1,
    workout_day_id: dayIndex !== null ? (workoutDays?.[dayIndex]?.id || null) : null,
    template_id: null,
    is_rest_day: dayIndex === null
  }))

  const { data, error } = await supabase
    .from('user_schedules')
    .insert(scheduleData)
    .select(SCHEDULE_SELECT)

  if (error) throw error
  return toScheduleDays(data)
}

// Legacy function - returns first workout
export async function getTodaysScheduledWorkout(userId: string, currentCycleDay: number): Promise<ScheduleDay | null> {
  return getScheduleDay(userId, currentCycleDay)
}
