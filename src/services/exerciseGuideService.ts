import { supabase } from './supabase'

// ============================================
// Types
// ============================================

export interface CachedExercise {
  id: string
  exercisedb_id: string | null
  exercisedb_name: string
  app_exercise_names: string[]
  body_part: string | null
  equipment: string | null
  target_muscle: string | null
  secondary_muscles: string[]
  instructions: string[]
  tips: string[]
  gif_url: string | null
  image_urls: string[]
  fetched_at: string
  last_accessed_at: string
}

export interface ExerciseGuideResult {
  status: 'cached' | 'fetched' | 'not_found' | 'daily_limit' | 'monthly_limit' | 'api_error'
  exercise?: CachedExercise
  message?: string
  resetsAt?: string
}

export interface UsageStats {
  daily_calls: number
  daily_limit: number
  monthly_calls: number
  monthly_limit: number
  cached_exercises: number
  daily_remaining: number
  monthly_remaining: number
}

// ============================================
// Cache-First Lookup
// ============================================

/**
 * Check Supabase cache for an exercise by app name.
 * Returns cached data instantly (no edge function call) if found.
 */
export async function getCachedExercise(appName: string): Promise<CachedExercise | null> {
  // First check the name mapping table
  const { data: mapping } = await supabase
    .from('exercise_name_mapping')
    .select('exercise_cache_id, exercisedb_name')
    .eq('app_name', appName.toLowerCase())
    .maybeSingle()

  if (!mapping?.exercise_cache_id) return null

  // Fetch the cached exercise data
  const { data: exercise } = await supabase
    .from('exercise_cache')
    .select('*')
    .eq('id', mapping.exercise_cache_id)
    .maybeSingle()

  if (!exercise) return null

  // Update last_accessed_at in the background (fire-and-forget)
  supabase
    .from('exercise_cache')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('id', exercise.id)
    .then(() => {})

  return exercise as CachedExercise
}

// ============================================
// Edge Function Lookup (cache miss)
// ============================================

/**
 * Fetch exercise guide data. Checks cache first, falls back to edge function.
 * The edge function handles ExerciseDB API calls, caching, and rate limiting.
 */
export async function getExerciseGuide(exerciseName: string): Promise<ExerciseGuideResult> {
  // Step 1: Check cache directly (instant, free)
  const cached = await getCachedExercise(exerciseName)
  if (cached) {
    return { status: 'cached', exercise: cached }
  }

  // Step 2: Check if this exercise was previously looked up and not found
  const { data: mapping } = await supabase
    .from('exercise_name_mapping')
    .select('exercise_cache_id')
    .eq('app_name', exerciseName.toLowerCase())
    .maybeSingle()

  if (mapping && !mapping.exercise_cache_id) {
    return { status: 'not_found', message: 'No guide available for this exercise.' }
  }

  // Step 3: Call edge function (handles API call, caching, rate limits)
  // Using supabase.functions.invoke() to automatically include apikey + Authorization headers
  const { data: result, error: invokeError } = await supabase.functions.invoke('fetch-exercise', {
    body: { exerciseName },
  })

  if (invokeError || !result) {
    return { status: 'api_error', message: 'Failed to fetch exercise guide.' }
  }

  if (result.status === 'cached' || result.status === 'fetched') {
    return {
      status: result.status,
      exercise: result.data as CachedExercise,
    }
  }

  return {
    status: result.status,
    message: result.message,
    resetsAt: result.resetsAt,
  }
}

// ============================================
// Usage Stats
// ============================================

/**
 * Get ExerciseDB API usage stats (daily/monthly calls, cached count).
 */
export async function getUsageStats(): Promise<UsageStats | null> {
  const { data, error } = await supabase.rpc('get_exercisedb_usage_stats')
  if (error) {
    console.warn('Failed to fetch usage stats:', error.message)
    return null
  }
  return data as UsageStats
}
