import { supabase } from './supabase'

export interface ProgressionSuggestion {
  exerciseId: string
  currentWeight: number
  suggestedWeight: number
  increase: number
  reason: string
}

interface ExerciseHistoryEntry {
  weight_used: number
  reps_completed: number
  session_started_at: string
}

// Standard weight increments
const WEIGHT_INCREMENTS = {
  light: 2.5, // For smaller muscle groups (biceps, triceps, shoulders)
  standard: 5, // For most exercises
  heavy: 10   // For major compound lifts (squat, deadlift)
}

// Exercise categories for determining increment size
const heavyLifts = ['squat', 'deadlift', 'leg press', 'hip thrust']
const lightLifts = ['curl', 'extension', 'raise', 'fly', 'flye', 'tricep', 'bicep']

function getWeightIncrement(exerciseName: string): number {
  const name = exerciseName.toLowerCase()

  if (heavyLifts.some(lift => name.includes(lift))) {
    return WEIGHT_INCREMENTS.heavy
  }
  if (lightLifts.some(lift => name.includes(lift))) {
    return WEIGHT_INCREMENTS.light
  }
  return WEIGHT_INCREMENTS.standard
}

export async function getProgressionSuggestion(
  userId: string,
  exerciseId: string,
  exerciseName: string,
  targetReps: number
): Promise<ProgressionSuggestion | null> {
  // Get last 5 completed sets for this exercise
  const { data, error } = await supabase
    .from('exercise_sets')
    .select(`
      weight_used,
      reps_completed,
      session:workout_sessions!inner(
        user_id,
        started_at
      )
    `)
    .eq('plan_exercise_id', exerciseId)
    .eq('session.user_id', userId)
    .not('weight_used', 'is', null)
    .not('reps_completed', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error || !data || data.length < 2) {
    // Not enough history to make a suggestion
    return null
  }

  // Analyze the data
  const history: ExerciseHistoryEntry[] = data.map(d => {
    const session = d.session as unknown as { started_at: string } | null
    return {
      weight_used: d.weight_used as number,
      reps_completed: d.reps_completed as number,
      session_started_at: session?.started_at || ''
    }
  })

  // Check if user hit target reps in last 2 sessions at same weight
  const lastTwoSessions = history.slice(0, 2)
  const sameWeight = lastTwoSessions.every(s => s.weight_used === lastTwoSessions[0].weight_used)
  const hitTargetReps = lastTwoSessions.every(s => s.reps_completed >= targetReps)

  if (sameWeight && hitTargetReps) {
    const currentWeight = lastTwoSessions[0].weight_used
    const increment = getWeightIncrement(exerciseName)
    const suggestedWeight = currentWeight + increment

    return {
      exerciseId,
      currentWeight,
      suggestedWeight,
      increase: increment,
      reason: `You hit ${targetReps}+ reps at ${currentWeight} lbs for 2 sessions`
    }
  }

  return null
}

