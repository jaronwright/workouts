import { supabase } from './supabase'
import type { Challenge, ChallengeParticipant, ChallengeWithProgress } from '@/types/community'

// ─── List active challenges ─────────────────────────

export async function getActiveChallenges(userId?: string): Promise<ChallengeWithProgress[]> {
  const now = new Date().toISOString()

  const { data: challenges, error } = await supabase
    .from('challenges')
    .select('*')
    .lte('starts_at', now)
    .gte('ends_at', now)
    .order('ends_at')

  if (error || !challenges) return []

  // Fetch participant counts + user's progress in parallel
  const challengeIds = challenges.map(c => c.id)

  const [participantCounts, userParticipants] = await Promise.all([
    getParticipantCounts(challengeIds),
    userId ? getUserParticipants(userId, challengeIds) : Promise.resolve(new Map()),
  ])

  return challenges.map(challenge => ({
    ...challenge,
    participant: userParticipants.get(challenge.id) || null,
    participant_count: participantCounts.get(challenge.id) || 0,
  })) as ChallengeWithProgress[]
}

// ─── Join a challenge ───────────────────────────────

export async function joinChallenge(challengeId: string): Promise<ChallengeParticipant | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('challenge_participants')
    .upsert(
      { challenge_id: challengeId, user_id: user.id, progress: 0 },
      { onConflict: 'challenge_id,user_id' }
    )
    .select()
    .single()

  if (error) {
    console.warn('Error joining challenge:', error.message)
    return null
  }
  return data as ChallengeParticipant
}

// ─── Update challenge progress ──────────────────────

export async function updateChallengeProgress(
  challengeId: string,
  userId: string,
  progress: number
): Promise<void> {
  const { data: challenge } = await supabase
    .from('challenges')
    .select('target_value, badge_key')
    .eq('id', challengeId)
    .single()

  const isComplete = challenge && progress >= challenge.target_value
  const completedAt = isComplete ? new Date().toISOString() : null

  const { error } = await supabase
    .from('challenge_participants')
    .update({ progress, completed_at: completedAt })
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)

  if (error) {
    console.warn('Error updating challenge progress:', error.message)
    return
  }

  // Award badge on completion
  if (isComplete && challenge?.badge_key) {
    const { awardBadge } = await import('./badgeService')
    await awardBadge(userId, challenge.badge_key)
  }
}

// ─── Refresh user's challenge progress ──────────────
// Recalculates progress for all active challenges the user joined

export async function refreshChallengeProgress(userId: string): Promise<void> {
  const challenges = await getActiveChallenges(userId)
  const joined = challenges.filter(c => c.participant)

  for (const challenge of joined) {
    const newProgress = await calculateProgress(userId, challenge)
    if (newProgress !== challenge.participant!.progress) {
      await updateChallengeProgress(challenge.id, userId, newProgress)
    }
  }
}

// ─── Get challenge leaderboard ──────────────────────

export async function getChallengeLeaderboard(
  challengeId: string,
  limit = 10
): Promise<Array<ChallengeParticipant & { display_name: string | null; avatar_url: string | null }>> {
  const { data, error } = await supabase
    .from('challenge_participants')
    .select('*, profile:user_profiles(display_name, avatar_url)')
    .eq('challenge_id', challengeId)
    .order('progress', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map(p => {
    const profile = Array.isArray(p.profile) ? p.profile[0] : p.profile
    return {
      ...p,
      display_name: (profile as { display_name: string | null } | null)?.display_name || null,
      avatar_url: (profile as { avatar_url: string | null } | null)?.avatar_url || null,
    }
  })
}

// ─── Helpers ────────────────────────────────────────

async function getParticipantCounts(challengeIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  if (challengeIds.length === 0) return counts

  // Count per challenge using individual queries (PostgREST limitation)
  const results = await Promise.all(
    challengeIds.map(id =>
      supabase
        .from('challenge_participants')
        .select('id', { count: 'exact', head: true })
        .eq('challenge_id', id)
        .then(res => ({ id, count: res.count || 0 }))
    )
  )

  for (const r of results) {
    counts.set(r.id, r.count)
  }
  return counts
}

async function getUserParticipants(
  userId: string,
  challengeIds: string[]
): Promise<Map<string, ChallengeParticipant>> {
  const map = new Map<string, ChallengeParticipant>()
  if (challengeIds.length === 0) return map

  const { data, error } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('user_id', userId)
    .in('challenge_id', challengeIds)

  if (error || !data) return map

  for (const p of data) {
    map.set(p.challenge_id, p as ChallengeParticipant)
  }
  return map
}

async function calculateProgress(userId: string, challenge: Challenge): Promise<number> {
  const start = challenge.starts_at
  const end = challenge.ends_at

  switch (challenge.metric) {
    case 'workouts': {
      const [w, t] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .not('completed_at', 'is', null)
          .gte('completed_at', start)
          .lte('completed_at', end),
        supabase
          .from('template_workout_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .not('completed_at', 'is', null)
          .gte('completed_at', start)
          .lte('completed_at', end),
      ])
      return (w.count || 0) + (t.count || 0)
    }

    case 'streak': {
      const { calculateCurrentStreak } = await import('./socialService')
      return calculateCurrentStreak(userId)
    }

    case 'volume': {
      const { data } = await supabase
        .from('exercise_sets')
        .select('weight_used, reps_completed, session_id')
        .eq('completed', true)
        .in(
          'session_id',
          (await supabase
            .from('workout_sessions')
            .select('id')
            .eq('user_id', userId)
            .not('completed_at', 'is', null)
            .gte('completed_at', start)
            .lte('completed_at', end)
          ).data?.map(s => s.id) || []
        )

      if (!data) return 0
      return data.reduce((sum, s) => {
        if (s.weight_used && s.reps_completed) return sum + s.weight_used * s.reps_completed
        return sum
      }, 0)
    }

    case 'duration': {
      const { data } = await supabase
        .from('template_workout_sessions')
        .select('duration_minutes')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .gte('completed_at', start)
        .lte('completed_at', end)

      if (!data) return 0
      return data.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
    }

    case 'distance': {
      const { data } = await supabase
        .from('template_workout_sessions')
        .select('distance_value')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .gte('completed_at', start)
        .lte('completed_at', end)

      if (!data) return 0
      return data.reduce((sum, s) => sum + (s.distance_value || 0), 0)
    }

    default:
      return 0
  }
}
