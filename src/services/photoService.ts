import { supabase } from './supabase'
import type { WorkoutPhoto } from '@/types/community'

// ─── Upload Photo ────────────────────────────────────

export async function uploadWorkoutPhoto(
  userId: string,
  file: File,
  sessionId?: string,
  templateSessionId?: string,
  caption?: string
): Promise<WorkoutPhoto> {
  // Generate unique filename
  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('workout-photos')
    .upload(fileName, file, {
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) throw uploadError

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('workout-photos')
    .getPublicUrl(fileName)

  // Get next sort order
  let sortOrder = 0
  if (sessionId) {
    const { count } = await supabase
      .from('workout_photos')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
    sortOrder = count || 0
  } else if (templateSessionId) {
    const { count } = await supabase
      .from('workout_photos')
      .select('id', { count: 'exact', head: true })
      .eq('template_session_id', templateSessionId)
    sortOrder = count || 0
  }

  // Create photo record
  const { data, error } = await supabase
    .from('workout_photos')
    .insert({
      user_id: userId,
      session_id: sessionId || null,
      template_session_id: templateSessionId || null,
      photo_url: urlData.publicUrl,
      caption: caption || null,
      sort_order: sortOrder,
    })
    .select()
    .single()

  if (error) throw error
  return data as WorkoutPhoto
}

// ─── Delete Photo ────────────────────────────────────

export async function deleteWorkoutPhoto(photoId: string, photoUrl: string): Promise<void> {
  // Extract path from URL
  const urlObj = new URL(photoUrl)
  const pathMatch = urlObj.pathname.match(/workout-photos\/(.+)/)
  if (pathMatch) {
    await supabase.storage.from('workout-photos').remove([pathMatch[1]])
  }

  const { error } = await supabase
    .from('workout_photos')
    .delete()
    .eq('id', photoId)

  if (error) throw error
}

// ─── Get Photos for Session ──────────────────────────

export async function getPhotosForSession(
  sessionId?: string,
  templateSessionId?: string
): Promise<WorkoutPhoto[]> {
  let query = supabase
    .from('workout_photos')
    .select('*')
    .order('sort_order')

  if (sessionId) {
    query = query.eq('session_id', sessionId)
  } else if (templateSessionId) {
    query = query.eq('template_session_id', templateSessionId)
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []) as WorkoutPhoto[]
}
