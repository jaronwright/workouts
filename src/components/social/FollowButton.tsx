import { motion, AnimatePresence } from 'motion/react'
import { UserPlus, Check } from '@phosphor-icons/react'
import { useIsFollowing, useFollowUser, useUnfollowUser } from '@/hooks/useFollow'
import { useAuthStore } from '@/stores/authStore'

interface FollowButtonProps {
  userId: string
  size?: 'sm' | 'md'
}

export function FollowButton({ userId, size = 'md' }: FollowButtonProps) {
  const currentUser = useAuthStore(s => s.user)
  const { data: isFollowing, isLoading } = useIsFollowing(userId)
  const follow = useFollowUser()
  const unfollow = useUnfollowUser()

  // Don't show follow button for own profile
  if (!currentUser || currentUser.id === userId) return null
  if (isLoading) return null

  const isPending = follow.isPending || unfollow.isPending

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPending) return
    if (isFollowing) {
      unfollow.mutate(userId)
    } else {
      follow.mutate(userId)
    }
  }

  const isSm = size === 'sm'

  return (
    <motion.button
      onClick={handleClick}
      disabled={isPending}
      whileTap={{ scale: 0.9 }}
      animate={isFollowing ? { scale: [1, 1.08, 1] } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`
        inline-flex items-center justify-center gap-1.5 font-semibold rounded-full transition-colors
        ${isSm ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'}
        ${isFollowing
          ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
          : 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
        }
        ${isPending ? 'opacity-60' : ''}
      `}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isFollowing ? (
          <motion.span
            key="following"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1"
          >
            <Check className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            Following
          </motion.span>
        ) : (
          <motion.span
            key="follow"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1"
          >
            <UserPlus className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            Follow
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
