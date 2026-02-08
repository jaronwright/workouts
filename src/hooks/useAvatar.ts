import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useProfile } from './useProfile'
import { getAvatarPublicUrl, uploadAvatar, removeAllUserAvatars } from '@/services/avatarService'
import { upsertProfile } from '@/services/profileService'

export function useAvatarUrl(): string | null {
  const { data: profile } = useProfile()
  if (!profile?.avatar_url) return null
  if (profile.avatar_url.startsWith('default:')) return profile.avatar_url
  return getAvatarPublicUrl(profile.avatar_url)
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (file: File) => {
      const userId = user!.id

      // Remove old avatar files before uploading new one
      await removeAllUserAvatars(userId).catch(() => {
        // Ignore errors from cleanup — folder may not exist yet
      })

      // Upload new avatar
      const path = await uploadAvatar(userId, file)

      // Update profile with new avatar path
      await upsertProfile(userId, { avatar_url: path })

      return path
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async () => {
      const userId = user!.id

      // Remove all avatar files
      await removeAllUserAvatars(userId).catch(() => {})

      // Clear avatar_url on profile
      await upsertProfile(userId, { avatar_url: null })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
