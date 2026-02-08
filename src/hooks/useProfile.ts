import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  getProfile,
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
    // Use upsertProfile to create profile if it doesn't exist
    mutationFn: (data: UpdateProfileData) => upsertProfile(user!.id, data),
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

