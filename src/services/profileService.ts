import { supabase } from './supabase'

export interface UserProfile {
  id: string
  display_name: string | null
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
  current_cycle_day: number
  last_workout_date: string | null
  created_at: string
  updated_at: string
}

export interface UpdateProfileData {
  display_name?: string | null
  gender?: UserProfile['gender']
  current_cycle_day?: number
  last_workout_date?: string | null
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.warn('Error fetching profile:', error.message)
    return null
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

export async function advanceCycleDay(userId: string): Promise<UserProfile | null> {
  // Get current profile
  const { data: current, error: fetchError } = await supabase
    .from('user_profiles')
    .select('current_cycle_day')
    .eq('id', userId)
    .maybeSingle()

  // If profile doesn't exist or fetch failed, return null silently
  if (fetchError || !current) {
    console.warn('Could not advance cycle day - profile may not exist:', fetchError?.message)
    return null
  }

  // Calculate next day (wrap 7 -> 1)
  const nextDay = current.current_cycle_day >= 7 ? 1 : current.current_cycle_day + 1

  // Update profile
  const { data: profile, error: updateError } = await supabase
    .from('user_profiles')
    .update({
      current_cycle_day: nextDay,
      last_workout_date: new Date().toISOString().split('T')[0]
    })
    .eq('id', userId)
    .select()
    .maybeSingle()

  if (updateError) {
    console.warn('Could not update cycle day:', updateError.message)
    return null
  }

  return profile as UserProfile | null
}

export async function deleteUserAccount(): Promise<void> {
  // Call the RPC function to delete user account and all associated data
  const { error } = await supabase.rpc('delete_user_account')

  if (error) throw error
}
