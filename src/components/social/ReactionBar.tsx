import { motion, AnimatePresence } from 'motion/react'
import { Avatar } from '@/components/ui'
import { REACTION_OPTIONS } from '@/config/communityConfig'
import { useAddReaction, useRemoveReaction } from '@/hooks/useReactions'
import { useAuthStore } from '@/stores/authStore'
import type { FeedWorkout, ReactionType } from '@/types/community'

interface ReactionBarProps {
  workout: FeedWorkout
}

export function ReactionBar({ workout }: ReactionBarProps) {
  const user = useAuthStore(s => s.user)
  const addReaction = useAddReaction()
  const removeReaction = useRemoveReaction()

  const myReaction = workout.reactions.find(r => r.user_id === user?.id)
  const otherReactions = workout.reactions.filter(r => r.user_id !== user?.id)

  const handleReaction = (type: ReactionType) => {
    if (myReaction?.reaction_type === type) {
      removeReaction.mutate({ workout })
    } else {
      addReaction.mutate({ workout, reactionType: type })
    }
  }

  // Build reactor names string
  const reactorNames = otherReactions
    .map(r => r.user_profile?.display_name || 'Someone')
    .slice(0, 3)

  const reactorString = reactorNames.length > 0
    ? reactorNames.length <= 2
      ? reactorNames.join(' and ')
      : `${reactorNames.slice(0, 2).join(', ')} and ${otherReactions.length - 2} more`
    : null

  return (
    <div className="pt-3 border-t border-[var(--color-border)]">
      {/* Reaction buttons */}
      <div className="flex items-center gap-1">
        {REACTION_OPTIONS.map(option => {
          const isActive = myReaction?.reaction_type === option.type
          const count = workout.reactions.filter(r => r.reaction_type === option.type).length

          return (
            <motion.button
              key={option.type}
              type="button"
              onClick={() => handleReaction(option.type)}
              whileTap={{ scale: 0.85 }}
              animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${isActive
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30'
                  : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
                }
              `}
            >
              <motion.span
                className="text-sm"
                animate={isActive ? { scale: [1, 1.3, 1], rotate: [0, -15, 15, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {option.emoji}
              </motion.span>
              <AnimatePresence mode="wait">
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="text-xs"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

      {/* Reactor avatars + names */}
      {otherReactions.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex -space-x-1.5">
            {otherReactions.slice(0, 4).map(r => (
              <Avatar
                key={r.user_id}
                src={r.user_profile?.avatar_url}
                alt={r.user_profile?.display_name || 'User'}
                size="sm"
                className="ring-2 ring-[var(--color-surface)] w-5 h-5"
              />
            ))}
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">
            {reactorString} reacted
          </span>
        </div>
      )}
    </div>
  )
}
