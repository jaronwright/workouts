import { supabase } from './supabase'

export interface PersonalRecord {
  id: string
  user_id: string
  plan_exercise_id: string
  weight: number
  reps: number | null
  achieved_at: string
}

export interface PRCheckResult {
  isNewPR: boolean
  previousPR: number | null
  newWeight: number
  improvement: number | null
  exerciseName: string
}

export async function getPersonalRecord(
  userId: string,
  exerciseId: string
): Promise<PersonalRecord | null> {
  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .eq('plan_exercise_id', exerciseId)
    .maybeSingle()

  if (error) {
    console.warn('Error fetching PR:', error.message)
    return null
  }
  return data as PersonalRecord | null
}

export async function getAllPersonalRecords(userId: string): Promise<PersonalRecord[]> {
  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false })

  if (error) {
    console.warn('Error fetching PRs:', error.message)
    return []
  }
  return data as PersonalRecord[]
}

export async function checkAndUpdatePR(
  userId: string,
  exerciseId: string,
  exerciseName: string,
  weight: number,
  reps?: number
): Promise<PRCheckResult> {
  // Get current PR
  const currentPR = await getPersonalRecord(userId, exerciseId)

  // Check if this is a new PR
  const isNewPR = !currentPR || weight > currentPR.weight

  if (isNewPR) {
    // Update or create PR record
    const { error } = await supabase
      .from('personal_records')
      .upsert({
        user_id: userId,
        plan_exercise_id: exerciseId,
        weight,
        reps: reps || null,
        achieved_at: new Date().toISOString()
      })

    if (error) {
      console.warn('Error updating PR:', error.message)
    }
  }

  return {
    isNewPR,
    previousPR: currentPR?.weight || null,
    newWeight: weight,
    improvement: currentPR ? weight - currentPR.weight : null,
    exerciseName
  }
}

export async function getRecentPRs(userId: string, limit = 5): Promise<Array<PersonalRecord & { exercise_name?: string }>> {
  const { data, error } = await supabase
    .from('personal_records')
    .select(`
      *,
      exercise:plan_exercises(name)
    `)
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.warn('Error fetching recent PRs:', error.message)
    return []
  }

  return data.map(pr => ({
    ...pr,
    exercise_name: (pr.exercise as { name: string } | null)?.name
  })) as Array<PersonalRecord & { exercise_name?: string }>
}
