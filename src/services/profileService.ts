import { supabase } from './supabase'

export interface UserProfile {
  id: string
  display_name: string | null
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
  avatar_url: string | null
  selected_plan_id: string | null
  current_cycle_day: number
  last_workout_date: string | null
  cycle_start_date: string | null
  timezone: string | null
  created_at: string
  updated_at: string
}

export interface UpdateProfileData {
  display_name?: string | null
  gender?: UserProfile['gender']
  avatar_url?: string | null
  selected_plan_id?: string | null
  current_cycle_day?: number
  last_workout_date?: string | null
  cycle_start_date?: string | null
  timezone?: string | null
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    if (error.code === 'PGRST116') {
      // "not found" — user has no profile yet
      return null
    }
    throw error
  }
  return data as UserProfile | null
}

export async function createProfile(userId: string, data?: UpdateProfileData): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      ...data
    })
    .select()
    .single()

  if (error) throw error
  return profile as UserProfile
}

export async function updateProfile(userId: string, data: UpdateProfileData): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .update(data)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return profile as UserProfile
}

export async function upsertProfile(userId: string, data: UpdateProfileData): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      ...data
    })
    .select()
    .single()

  if (error) throw error
  return profile as UserProfile
}

export async function deleteUserAccount(): Promise<void> {
  // Call the RPC function to delete user account and all associated data
  const { error } = await supabase.rpc('delete_user_account')

  if (error) throw error
}
