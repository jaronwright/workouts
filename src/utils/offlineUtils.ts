import type { ExerciseSet, WorkoutSession } from '@/types/workout'
import type { TemplateWorkoutSession } from '@/services/templateWorkoutService'

/**
 * Detects if an error is a network failure (fetch failed, DNS, timeout)
 * vs a real Supabase business error (constraint violation, RLS, etc.).
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase()
    return (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('network request failed') ||
      msg.includes('load failed')
    )
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    return (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('network request failed') ||
      msg.includes('load failed') ||
      msg.includes('net::err_') ||
      msg.includes('the internet connection appears to be offline')
    )
  }
  return false
}

/** Generate a client-side UUID for optimistic entities. */
export function generateClientId(): string {
  return crypto.randomUUID()
}

/** Returns true if the ID was generated client-side (i.e. exists in the offline queue). */
export function isClientId(id: string, idMap: Record<string, string>): boolean {
  return id in idMap
}

/** Build an optimistic ExerciseSet for immediate UI update. */
export function buildOptimisticSet(args: {
  clientId: string
  sessionId: string
  planExerciseId: string
  setNumber: number
  repsCompleted: number | null
  weightUsed: number | null
}): ExerciseSet {
  return {
    id: args.clientId,
    session_id: args.sessionId,
    plan_exercise_id: args.planExerciseId,
    set_number: args.setNumber,
    reps_completed: args.repsCompleted,
    weight_used: args.weightUsed,
    completed: true,
    created_at: new Date().toISOString(),
  } as ExerciseSet
}

/** Build an optimistic WorkoutSession for immediate UI update. */
export function buildOptimisticSession(args: {
  clientId: string
  userId: string
  workoutDayId: string
}): WorkoutSession {
  return {
    id: args.clientId,
    user_id: args.userId,
    workout_day_id: args.workoutDayId,
    started_at: new Date().toISOString(),
    completed_at: null,
    notes: null,
  } as WorkoutSession
}

/** Build an optimistic TemplateWorkoutSession for immediate UI update. */
export function buildOptimisticTemplateSession(args: {
  clientId: string
  userId: string
  templateId: string
}): TemplateWorkoutSession {
  return {
    id: args.clientId,
    user_id: args.userId,
    template_id: args.templateId,
    started_at: new Date().toISOString(),
    completed_at: null,
    duration_minutes: null,
    distance_value: null,
    distance_unit: null,
    notes: null,
  }
}

/** Build a completed optimistic TemplateWorkoutSession for quick-log. */
export function buildOptimisticCompletedTemplateSession(args: {
  clientId: string
  userId: string
  templateId: string
  durationMinutes?: number
  distanceValue?: number
  distanceUnit?: string
}): TemplateWorkoutSession {
  return {
    id: args.clientId,
    user_id: args.userId,
    template_id: args.templateId,
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    duration_minutes: args.durationMinutes ?? null,
    distance_value: args.distanceValue ?? null,
    distance_unit: args.distanceUnit ?? null,
    notes: null,
  }
}
