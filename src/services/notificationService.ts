import { supabase } from './supabase'
import type { CommunityNotification, ReactionType } from '@/types/community'

// ─── Fetch Notifications ─────────────────────────────

export async function getNotifications(
  userId: string,
  limit = 50
): Promise<CommunityNotification[]> {
  const { data, error } = await supabase
    .from('community_notifications')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  // Fetch actor profiles
  const actorIds = [...new Set((data || []).map(n => n.actor_id))]
  const profileMap = new Map<string, { display_name: string | null; avatar_url: string | null }>()

  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, display_name, avatar_url')
      .in('id', actorIds)

    profiles?.forEach(p => {
      profileMap.set(p.id, { display_name: p.display_name, avatar_url: p.avatar_url })
    })
  }

  // Fetch reaction details
  const reactionIds = (data || [])
    .filter(n => n.reaction_id)
    .map(n => n.reaction_id as string)

  const reactionMap = new Map<string, { reaction_type: ReactionType }>()
  if (reactionIds.length > 0) {
    const { data: reactions } = await supabase
      .from('activity_reactions')
      .select('id, reaction_type')
      .in('id', reactionIds)

    reactions?.forEach(r => {
      reactionMap.set(r.id, { reaction_type: r.reaction_type as ReactionType })
    })
  }

  return (data || []).map(n => ({
    ...n,
    notification_type: n.notification_type as CommunityNotification['notification_type'],
    actor_profile: profileMap.get(n.actor_id) || null,
    reaction: n.reaction_id ? reactionMap.get(n.reaction_id) || null : null,
  }))
}

// ─── Unread Count ────────────────────────────────────

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('community_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('is_read', false)

  if (error) { console.warn('Error fetching unread count:', error.message); return 0 }
  return count || 0
}

// ─── Mark as Read ────────────────────────────────────

export async function markNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('community_notifications')
    .update({ is_read: true })
    .eq('recipient_id', userId)
    .eq('is_read', false)

  if (error) console.warn('Error marking notifications read:', error.message)
}

// ─── Create Notification ─────────────────────────────
// Called after adding a reaction to notify the workout owner

export async function createReactionNotification(
  actorId: string,
  recipientId: string,
  reactionId: string,
  sessionId?: string,
  templateSessionId?: string
): Promise<void> {
  // Don't notify yourself
  if (actorId === recipientId) return

  const { error } = await supabase
    .from('community_notifications')
    .insert({
      recipient_id: recipientId,
      actor_id: actorId,
      notification_type: 'reaction',
      reaction_id: reactionId,
      session_id: sessionId || null,
      template_session_id: templateSessionId || null,
    })

  if (error) console.warn('Error creating notification:', error.message)
}

export async function createCommentNotification(
  actorId: string,
  recipientId: string,
  sessionId?: string,
  templateSessionId?: string
): Promise<void> {
  if (actorId === recipientId) return

  const { error } = await supabase
    .from('community_notifications')
    .insert({
      recipient_id: recipientId,
      actor_id: actorId,
      notification_type: 'comment',
      session_id: sessionId || null,
      template_session_id: templateSessionId || null,
    })

  if (error) console.warn('Error creating comment notification:', error.message)
}

export async function createFollowNotification(
  actorId: string,
  recipientId: string
): Promise<void> {
  if (actorId === recipientId) return

  const { error } = await supabase
    .from('community_notifications')
    .insert({
      recipient_id: recipientId,
      actor_id: actorId,
      notification_type: 'new_follower',
    })

  if (error) console.warn('Error creating follow notification:', error.message)
}
