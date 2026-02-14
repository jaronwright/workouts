import { supabase } from './supabase'
import type { ActivityComment } from '@/types/community'

export async function addComment(
  content: string,
  sessionId?: string,
  templateSessionId?: string
): Promise<ActivityComment> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('activity_comments')
    .insert({
      user_id: user.id,
      content,
      session_id: sessionId || null,
      template_session_id: templateSessionId || null,
    })
    .select('id, user_id, session_id, template_session_id, content, created_at')
    .single()

  if (error) throw error

  // Fetch own profile for the returned comment
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return {
    ...data,
    user_profile: profile ? { display_name: profile.display_name, avatar_url: profile.avatar_url } : null,
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('activity_comments')
    .delete()
    .eq('id', commentId)

  if (error) throw error
}

export async function getCommentsForSession(
  sessionId?: string,
  templateSessionId?: string
): Promise<ActivityComment[]> {
  if (!sessionId && !templateSessionId) return []

  let query = supabase
    .from('activity_comments')
    .select('id, user_id, session_id, template_session_id, content, created_at')

  if (sessionId) {
    query = query.eq('session_id', sessionId)
  } else if (templateSessionId) {
    query = query.eq('template_session_id', templateSessionId)
  }

  const { data, error } = await query.order('created_at', { ascending: true })

  if (error) throw error
  if (!data || data.length === 0) return []

  // Batch fetch user profiles
  const userIds = [...new Set(data.map(c => c.user_id))]
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url')
    .in('id', userIds)

  const profileMap = new Map<string, { display_name: string | null; avatar_url: string | null }>()
  profiles?.forEach(p => {
    profileMap.set(p.id, { display_name: p.display_name, avatar_url: p.avatar_url })
  })

  return data.map(c => ({
    ...c,
    user_profile: profileMap.get(c.user_id) || null,
  }))
}

export async function getCommentCount(
  sessionId?: string,
  templateSessionId?: string
): Promise<number> {
  if (!sessionId && !templateSessionId) return 0

  let query = supabase
    .from('activity_comments')
    .select('id', { count: 'exact', head: true })

  if (sessionId) {
    query = query.eq('session_id', sessionId)
  } else if (templateSessionId) {
    query = query.eq('template_session_id', templateSessionId)
  }

  const { count, error } = await query
  if (error) { console.warn('Error fetching comment count:', error.message); return 0 }
  return count || 0
}
