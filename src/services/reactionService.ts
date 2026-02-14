import { supabase } from './supabase'
import type { ReactionType } from '@/types/community'

export interface AddReactionParams {
  sessionId?: string
  templateSessionId?: string
  reactionType: ReactionType
}

export async function addReaction(
  userId: string,
  params: AddReactionParams
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('activity_reactions')
    .upsert(
      {
        user_id: userId,
        session_id: params.sessionId || null,
        template_session_id: params.templateSessionId || null,
        reaction_type: params.reactionType,
      },
      {
        onConflict: params.sessionId
          ? 'user_id,session_id'
          : 'user_id,template_session_id',
      }
    )
    .select('id')
    .single()

  if (error) throw error
  return { id: data.id }
}

export async function removeReaction(
  userId: string,
  sessionId?: string,
  templateSessionId?: string
): Promise<void> {
  // Guard: require at least one session reference to avoid deleting all user reactions
  if (!sessionId && !templateSessionId) {
    throw new Error('removeReaction requires either sessionId or templateSessionId')
  }

  let query = supabase
    .from('activity_reactions')
    .delete()
    .eq('user_id', userId)

  if (sessionId) {
    query = query.eq('session_id', sessionId)
  } else {
    query = query.eq('template_session_id', templateSessionId!)
  }

  const { error } = await query
  if (error) throw error
}

