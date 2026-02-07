import imageCompression from 'browser-image-compression'
import { supabase } from './supabase'

const BUCKET = 'avatars'
const MAX_SIZE_MB = 1
const MAX_WIDTH_PX = 512
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function getAvatarPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File must be JPEG, PNG, or WebP')
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File must be smaller than 10MB')
  }

  // Compress and convert to WebP
  const compressed = await imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_WIDTH_PX,
    fileType: 'image/webp',
    useWebWorker: true,
  })

  const filePath = `${userId}/avatar-${Date.now()}.webp`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, compressed, {
      contentType: 'image/webp',
      upsert: false,
    })

  if (error) throw error

  return filePath
}

export async function removeAvatarFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}

export async function removeAllUserAvatars(userId: string): Promise<void> {
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(userId)

  if (listError) throw listError

  if (files && files.length > 0) {
    const paths = files.map((f) => `${userId}/${f.name}`)
    const { error: removeError } = await supabase.storage.from(BUCKET).remove(paths)
    if (removeError) throw removeError
  }
}
