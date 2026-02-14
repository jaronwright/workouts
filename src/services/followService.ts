import { supabase } from './supabase'
import type { FollowUser, FollowCounts } from '@/types/community'

export async function followUser(followingId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('user_follows')
    .insert({ follower_id: user.id, following_id: followingId })

  if (error) throw error
}

export async function unfollowUser(followingId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('user_follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId)

  if (error) throw error
}

export async function getFollowers(userId: string): Promise<FollowUser[]> {
  const { data, error } = await supabase
    .from('user_follows')
    .select('follower_id')
    .eq('following_id', userId)

  if (error) throw error
  if (!data || data.length === 0) return []

  const followerIds = data.map(f => f.follower_id)
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url, selected_plan_id')
    .in('id', followerIds)

  if (profileError) throw profileError
  return (profiles || []).map(p => ({
    id: p.id,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    selected_plan_id: p.selected_plan_id,
  }))
}

export async function getFollowing(userId: string): Promise<FollowUser[]> {
  const { data, error } = await supabase
    .from('user_follows')
    .select('following_id')
    .eq('follower_id', userId)

  if (error) throw error
  if (!data || data.length === 0) return []

  const followingIds = data.map(f => f.following_id)
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url, selected_plan_id')
    .in('id', followingIds)

  if (profileError) throw profileError
  return (profiles || []).map(p => ({
    id: p.id,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    selected_plan_id: p.selected_plan_id,
  }))
}

export async function getFollowCounts(userId: string): Promise<FollowCounts> {
  const [followersResult, followingResult] = await Promise.all([
    supabase
      .from('user_follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId),
    supabase
      .from('user_follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId),
  ])

  return {
    followers: followersResult.count || 0,
    following: followingResult.count || 0,
  }
}

export async function isFollowing(followingId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { count, error } = await supabase
    .from('user_follows')
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', user.id)
    .eq('following_id', followingId)

  if (error) return false
  return (count || 0) > 0
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_follows')
    .select('following_id')
    .eq('follower_id', userId)

  if (error) { console.warn('Error fetching following IDs:', error.message); return [] }
  return (data || []).map(f => f.following_id)
}

export async function getSuggestedUsers(limit = 10): Promise<FollowUser[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get IDs the current user already follows
  const followingIds = await getFollowingIds(user.id)
  const excludeIds = [user.id, ...followingIds]

  // Get users not already followed, excluding self
  let query = supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url, selected_plan_id')
    .limit(limit)

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data: profiles, error } = await query

  if (error) { console.warn('Error fetching suggested users:', error.message); return [] }
  return (profiles || []).map(p => ({
    id: p.id,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    selected_plan_id: p.selected_plan_id,
  }))
}

export async function searchUsers(query: string, limit = 20): Promise<FollowUser[]> {
  if (!query.trim()) return []

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url, selected_plan_id')
    .ilike('display_name', `%${query}%`)
    .limit(limit)

  if (error) { console.warn('Error searching users:', error.message); return [] }
  return (data || []).map(p => ({
    id: p.id,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    selected_plan_id: p.selected_plan_id,
  }))
}
