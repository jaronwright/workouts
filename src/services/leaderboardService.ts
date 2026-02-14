import { supabase } from './supabase'
import type { LeaderboardEntry } from '@/types/community'

export type LeaderboardMetric = 'streak' | 'workouts_week' | 'workouts_month' | 'volume_month'

// ─── Get leaderboard ────────────────────────────────

export async function getLeaderboard(
  metric: LeaderboardMetric,
  limit = 10
): Promise<LeaderboardEntry[]> {
  switch (metric) {
    case 'streak':
      return getStreakLeaderboard(limit)
    case 'workouts_week':
      return getWorkoutLeaderboard('week', limit)
    case 'workouts_month':
      return getWorkoutLeaderboard('month', limit)
    case 'volume_month':
      return getVolumeLeaderboard(limit)
    default:
      return []
  }
}

// ─── Streak Leaderboard ─────────────────────────────
// Top users by current streak

async function getStreakLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  // Get all users who have completed workouts recently
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 2) // active in last 2 days = potentially on a streak

  const { data: recentUsers } = await supabase
    .from('workout_sessions')
    .select('user_id')
    .not('completed_at', 'is', null)
    .gte('completed_at', cutoff.toISOString())

  const { data: recentTemplateUsers } = await supabase
    .from('template_workout_sessions')
    .select('user_id')
    .not('completed_at', 'is', null)
    .gte('completed_at', cutoff.toISOString())

  const userIds = [
    ...new Set([
      ...(recentUsers?.map(u => u.user_id) || []),
      ...(recentTemplateUsers?.map(u => u.user_id) || []),
    ])
  ]

  if (userIds.length === 0) return []

  // Calculate streaks for active users
  const { computeStreaksForUsers } = await import('./socialService')
  const streakMap = await computeStreaksForUsers(userIds)

  // Get profiles
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url')
    .in('id', userIds)

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

  // Build and sort
  const entries: LeaderboardEntry[] = userIds
    .map(userId => {
      const profile = profileMap.get(userId)
      return {
        user_id: userId,
        display_name: profile?.display_name || null,
        avatar_url: profile?.avatar_url || null,
        value: streakMap.get(userId) || 0,
        rank: 0,
      }
    })
    .filter(e => e.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)

  // Assign ranks
  entries.forEach((entry, i) => { entry.rank = i + 1 })
  return entries
}

// ─── Workout Count Leaderboard ──────────────────────

async function getWorkoutLeaderboard(
  period: 'week' | 'month',
  limit: number
): Promise<LeaderboardEntry[]> {
  const start = new Date()
  if (period === 'week') {
    const day = start.getDay()
    start.setDate(start.getDate() - (day === 0 ? 6 : day - 1))
  } else {
    start.setDate(1)
  }
  start.setHours(0, 0, 0, 0)
  const startISO = start.toISOString()

  // Fetch counts from both session tables
  const [weights, templates] = await Promise.all([
    supabase
      .from('workout_sessions')
      .select('user_id')
      .not('completed_at', 'is', null)
      .eq('is_public', true)
      .gte('completed_at', startISO),
    supabase
      .from('template_workout_sessions')
      .select('user_id')
      .not('completed_at', 'is', null)
      .eq('is_public', true)
      .gte('completed_at', startISO),
  ])

  // Count per user
  const countMap = new Map<string, number>()
  for (const row of [...(weights.data || []), ...(templates.data || [])]) {
    countMap.set(row.user_id, (countMap.get(row.user_id) || 0) + 1)
  }

  const userIds = [...countMap.keys()]
  if (userIds.length === 0) return []

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url')
    .in('id', userIds)

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

  const entries: LeaderboardEntry[] = userIds
    .map(userId => ({
      user_id: userId,
      display_name: profileMap.get(userId)?.display_name || null,
      avatar_url: profileMap.get(userId)?.avatar_url || null,
      value: countMap.get(userId) || 0,
      rank: 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)

  entries.forEach((entry, i) => { entry.rank = i + 1 })
  return entries
}

// ─── Volume Leaderboard ─────────────────────────────

async function getVolumeLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  // Get public sessions from this month with their exercise sets
  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('id, user_id')
    .not('completed_at', 'is', null)
    .eq('is_public', true)
    .gte('completed_at', start.toISOString())

  if (!sessions || sessions.length === 0) return []

  const sessionIds = sessions.map(s => s.id)
  const sessionUserMap = new Map(sessions.map(s => [s.id, s.user_id]))

  const { data: sets } = await supabase
    .from('exercise_sets')
    .select('session_id, weight_used, reps_completed')
    .eq('completed', true)
    .in('session_id', sessionIds)

  if (!sets) return []

  // Sum volume per user
  const volumeMap = new Map<string, number>()
  for (const set of sets) {
    if (!set.weight_used || !set.reps_completed) continue
    const userId = sessionUserMap.get(set.session_id)
    if (!userId) continue
    volumeMap.set(userId, (volumeMap.get(userId) || 0) + set.weight_used * set.reps_completed)
  }

  const userIds = [...volumeMap.keys()]
  if (userIds.length === 0) return []

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url')
    .in('id', userIds)

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

  const entries: LeaderboardEntry[] = userIds
    .map(userId => ({
      user_id: userId,
      display_name: profileMap.get(userId)?.display_name || null,
      avatar_url: profileMap.get(userId)?.avatar_url || null,
      value: Math.round(volumeMap.get(userId) || 0),
      rank: 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)

  entries.forEach((entry, i) => { entry.rank = i + 1 })
  return entries
}
