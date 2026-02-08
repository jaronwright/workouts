import { supabase } from './supabase'

export interface UserFeedback {
  id: string
  user_id: string
  type: 'bug' | 'feature'
  message: string
  status: string
  created_at: string
}

export async function submitFeedback(
  userId: string,
  type: 'bug' | 'feature',
  message: string
): Promise<UserFeedback> {
  const { data, error } = await supabase
    .from('user_feedback')
    .insert({ user_id: userId, type, message })
    .select()
    .single()

  if (error) throw error
  return data as UserFeedback
}

export async function getUserFeedback(userId: string): Promise<UserFeedback[]> {
  const { data, error } = await supabase
    .from('user_feedback')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as UserFeedback[]
}
