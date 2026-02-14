import { supabase } from './supabase'
import { BADGE_MAP } from '@/config/badgeConfig'
import type { UserBadge } from '@/types/community'

// ─── Fetch user badges ──────────────────────────────

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  if (error) {
    console.warn('Error fetching badges:', error.message)
    return []
  }
  return data as UserBadge[]
}

// ─── Award a badge (idempotent) ─────────────────────

export async function awardBadge(userId: string, badgeKey: string): Promise<boolean> {
  if (!BADGE_MAP[badgeKey]) return false

  const { error } = await supabase
    .from('user_badges')
    .upsert(
      { user_id: userId, badge_key: badgeKey },
      { onConflict: 'user_id,badge_key' }
    )

  if (error) {
    console.warn('Error awarding badge:', error.message)
    return false
  }
  return true
}

// ─── Check and award earned badges ──────────────────
// Called after workout completion, follow, reaction, etc.

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const awarded: string[] = []

  // Get current badges to avoid redundant checks
  const existing = await getUserBadges(userId)
  const existingKeys = new Set(existing.map(b => b.badge_key))

  // Fetch stats in parallel
  const [workoutCount, streakDays, prCount, followerCount, followingCount, reactionCount] =
    await Promise.all([
      getWorkoutCount(userId),
      getStreakDays(userId),
      getPRCount(userId),
      getFollowerCount(userId),
      getFollowingCount(userId),
      getReactionGivenCount(userId),
    ])

  // ─── Milestone badges
  const milestones: [number, string][] = [
    [1, 'first_workout'],
    [10, 'workouts_10'],
    [50, 'workouts_50'],
    [100, 'workouts_100'],
    [500, 'workouts_500'],
  ]
  for (const [threshold, key] of milestones) {
    if (workoutCount >= threshold && !existingKeys.has(key)) {
      if (await awardBadge(userId, key)) awarded.push(key)
    }
  }

  // ─── Streak badges
  const streakMilestones: [number, string][] = [
    [3, 'streak_3'],
    [7, 'streak_7'],
    [14, 'streak_14'],
    [30, 'streak_30'],
    [100, 'streak_100'],
  ]
  for (const [threshold, key] of streakMilestones) {
    if (streakDays >= threshold && !existingKeys.has(key)) {
      if (await awardBadge(userId, key)) awarded.push(key)
    }
  }

  // ─── PR badges
  if (prCount >= 1 && !existingKeys.has('first_pr')) {
    if (await awardBadge(userId, 'first_pr')) awarded.push('first_pr')
  }
  if (prCount >= 10 && !existingKeys.has('prs_10')) {
    if (await awardBadge(userId, 'prs_10')) awarded.push('prs_10')
  }

  // ─── Social badges
  if (followingCount >= 1 && !existingKeys.has('first_follow')) {
    if (await awardBadge(userId, 'first_follow')) awarded.push('first_follow')
  }
  if (followerCount >= 10 && !existingKeys.has('followers_10')) {
    if (await awardBadge(userId, 'followers_10')) awarded.push('followers_10')
  }
  if (followerCount >= 50 && !existingKeys.has('followers_50')) {
    if (await awardBadge(userId, 'followers_50')) awarded.push('followers_50')
  }
  if (reactionCount >= 1 && !existingKeys.has('first_reaction')) {
    if (await awardBadge(userId, 'first_reaction')) awarded.push('first_reaction')
  }

  return awarded
}

// ─── Stat Helpers ───────────────────────────────────

async function getWorkoutCount(userId: string): Promise<number> {
  const [weights, template] = await Promise.all([
    supabase
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null),
    supabase
      .from('template_workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null),
  ])
  return (weights.count || 0) + (template.count || 0)
}

async function getStreakDays(userId: string): Promise<number> {
  // Reuse the existing streak calculator from socialService
  const { calculateCurrentStreak } = await import('./socialService')
  return calculateCurrentStreak(userId)
}

async function getPRCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('personal_records')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) return 0
  return count || 0
}

async function getFollowerCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('user_follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', userId)

  if (error) return 0
  return count || 0
}

async function getFollowingCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('user_follows')
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', userId)

  if (error) return 0
  return count || 0
}

async function getReactionGivenCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('activity_reactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) return 0
  return count || 0
}
