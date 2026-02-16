import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  getProfile,
  updateProfile,
  upsertProfile,
  type UserProfile,
  type UpdateProfileData
} from '@/services/profileService'

export function useProfile() {
  const user = useAuthStore((s) => s.user)

  return useQuery<UserProfile | null>({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user?.id
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (data: UpdateProfileData) => {
      if (!user) throw new Error('Not authenticated')
      return updateProfile(user.id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error) => {
      console.error('Failed to update profile:', error)
    }
  })
}

export function useUpsertProfile() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (data: UpdateProfileData) => upsertProfile(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })
}

/**
 * One-time sync: if profile has no avatar but Google OAuth provided one, copy it over.
 * This ensures Google profile photos appear in the community feed without manual upload.
 */
export function useGoogleAvatarSync() {
  const user = useAuthStore((s) => s.user)
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()
  const syncedRef = useRef(false)

  useEffect(() => {
    if (syncedRef.current || !user || !profile) return
    if (profile.avatar_url) return // already has an avatar

    const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture
    if (!googleAvatar) return

    syncedRef.current = true
    upsertProfile(user.id, { avatar_url: googleAvatar })
      .then(() => queryClient.invalidateQueries({ queryKey: ['profile'] }))
      .catch((err) => console.warn('Failed to sync Google avatar:', err))
  }, [user, profile, queryClient])
}

