import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowCounts,
  isFollowing,
  getSuggestedUsers,
  searchUsers,
} from '@/services/followService'
import { createFollowNotification } from '@/services/notificationService'
import { useAuthStore } from '@/stores/authStore'
import type { FollowUser, FollowCounts } from '@/types/community'

export function useFollowers(userId: string | null) {
  return useQuery<FollowUser[]>({
    queryKey: ['followers', userId],
    queryFn: () => (userId ? getFollowers(userId) : []),
    enabled: !!userId,
  })
}

export function useFollowing(userId: string | null) {
  return useQuery<FollowUser[]>({
    queryKey: ['following', userId],
    queryFn: () => (userId ? getFollowing(userId) : []),
    enabled: !!userId,
  })
}

export function useFollowCounts(userId: string | null) {
  return useQuery<FollowCounts>({
    queryKey: ['follow-counts', userId],
    queryFn: () => (userId ? getFollowCounts(userId) : { followers: 0, following: 0 }),
    enabled: !!userId,
  })
}

export function useIsFollowing(followingId: string | null) {
  const user = useAuthStore(s => s.user)
  return useQuery<boolean>({
    queryKey: ['is-following', user?.id, followingId],
    queryFn: () => (followingId ? isFollowing(followingId) : false),
    enabled: !!user && !!followingId && user.id !== followingId,
  })
}

export function useFollowUser() {
  const queryClient = useQueryClient()
  const user = useAuthStore(s => s.user)

  return useMutation({
    mutationFn: async (followingId: string) => {
      await followUser(followingId)
      // Send follow notification
      if (user) {
        await createFollowNotification(user.id, followingId)
      }
    },
    onMutate: async (followingId) => {
      // Optimistic update: mark as following immediately
      await queryClient.cancelQueries({ queryKey: ['is-following', user?.id, followingId] })
      const previous = queryClient.getQueryData<boolean>(['is-following', user?.id, followingId])
      queryClient.setQueryData(['is-following', user?.id, followingId], true)

      // Optimistic update: increment follow counts
      const prevCounts = queryClient.getQueryData<FollowCounts>(['follow-counts', followingId])
      if (prevCounts) {
        queryClient.setQueryData<FollowCounts>(['follow-counts', followingId], {
          ...prevCounts,
          followers: prevCounts.followers + 1,
        })
      }

      return { previous, prevCounts }
    },
    onError: (_err, followingId, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['is-following', user?.id, followingId], context.previous)
      }
      if (context?.prevCounts) {
        queryClient.setQueryData(['follow-counts', followingId], context.prevCounts)
      }
    },
    onSettled: (_data, _err, followingId) => {
      queryClient.invalidateQueries({ queryKey: ['is-following', user?.id, followingId] })
      queryClient.invalidateQueries({ queryKey: ['followers', followingId] })
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['follow-counts'] })
      queryClient.invalidateQueries({ queryKey: ['social-feed'] })
      queryClient.invalidateQueries({ queryKey: ['suggested-users'] })
    },
  })
}

export function useUnfollowUser() {
  const queryClient = useQueryClient()
  const user = useAuthStore(s => s.user)

  return useMutation({
    mutationFn: (followingId: string) => unfollowUser(followingId),
    onMutate: async (followingId) => {
      await queryClient.cancelQueries({ queryKey: ['is-following', user?.id, followingId] })
      const previous = queryClient.getQueryData<boolean>(['is-following', user?.id, followingId])
      queryClient.setQueryData(['is-following', user?.id, followingId], false)

      const prevCounts = queryClient.getQueryData<FollowCounts>(['follow-counts', followingId])
      if (prevCounts) {
        queryClient.setQueryData<FollowCounts>(['follow-counts', followingId], {
          ...prevCounts,
          followers: Math.max(0, prevCounts.followers - 1),
        })
      }

      return { previous, prevCounts }
    },
    onError: (_err, followingId, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['is-following', user?.id, followingId], context.previous)
      }
      if (context?.prevCounts) {
        queryClient.setQueryData(['follow-counts', followingId], context.prevCounts)
      }
    },
    onSettled: (_data, _err, followingId) => {
      queryClient.invalidateQueries({ queryKey: ['is-following', user?.id, followingId] })
      queryClient.invalidateQueries({ queryKey: ['followers', followingId] })
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['follow-counts'] })
      queryClient.invalidateQueries({ queryKey: ['social-feed'] })
      queryClient.invalidateQueries({ queryKey: ['suggested-users'] })
    },
  })
}

export function useSuggestedUsers(limit = 10) {
  return useQuery<FollowUser[]>({
    queryKey: ['suggested-users', limit],
    queryFn: () => getSuggestedUsers(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSearchUsers(query: string) {
  return useQuery<FollowUser[]>({
    queryKey: ['search-users', query],
    queryFn: () => searchUsers(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  })
}
