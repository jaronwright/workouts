import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/ui'
import { Bell, X } from 'lucide-react'
import { REACTION_MAP } from '@/config/communityConfig'
import { formatRelativeTime } from '@/utils/formatters'
import type { CommunityNotification } from '@/types/community'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  notifications: CommunityNotification[]
  isLoading: boolean
}

function getNotificationText(notification: CommunityNotification): string {
  const actorName = notification.actor_profile?.display_name || 'Someone'
  const reactionConfig = notification.reaction?.reaction_type
    ? REACTION_MAP[notification.reaction.reaction_type]
    : null

  if (notification.notification_type === 'reaction' && reactionConfig) {
    return `${actorName} reacted ${reactionConfig.emoji} to your workout`
  }

  if (notification.notification_type === 'photo_reaction' && reactionConfig) {
    return `${actorName} reacted ${reactionConfig.emoji} to your photo`
  }

  return `${actorName} interacted with your workout`
}

function getNotificationRoute(notification: CommunityNotification): string | null {
  if (notification.session_id) {
    return `/community/session/${notification.session_id}`
  }
  if (notification.template_session_id) {
    return `/community/cardio/${notification.template_session_id}`
  }
  return null
}

export function NotificationPanel({ isOpen, onClose, notifications, isLoading }: NotificationPanelProps) {
  const navigate = useNavigate()

  const handleNotificationClick = (notification: CommunityNotification) => {
    const route = getNotificationRoute(notification)
    if (route) {
      onClose()
      navigate(route)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] bg-[var(--color-surface)] rounded-t-[var(--radius-xl)] shadow-[var(--shadow-xl)] flex flex-col"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-bold text-[var(--color-text)]">Notifications</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-surface-hover)] animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 bg-[var(--color-surface-hover)] animate-pulse rounded" />
                        <div className="h-2 w-1/4 bg-[var(--color-surface-hover)] animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-7 h-7 text-[var(--color-text-muted)] opacity-40" />
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">No notifications yet</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 opacity-60">
                    When friends react to your workouts, you'll see it here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border)]">
                  {notifications.map(notification => {
                    const route = getNotificationRoute(notification)
                    const reactionConfig = notification.reaction?.reaction_type
                      ? REACTION_MAP[notification.reaction.reaction_type]
                      : null

                    return (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        disabled={!route}
                        className={`
                          w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors
                          ${route ? 'hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-hover)]' : ''}
                          ${!notification.is_read ? 'bg-[var(--color-primary)]/[0.03]' : ''}
                        `}
                      >
                        {/* Avatar with reaction badge */}
                        <div className="relative flex-shrink-0">
                          <Avatar
                            src={notification.actor_profile?.avatar_url}
                            alt={notification.actor_profile?.display_name || 'User'}
                            size="md"
                            className="w-10 h-10"
                          />
                          {reactionConfig && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-xs shadow-sm border border-[var(--color-border)]">
                              {reactionConfig.emoji}
                            </span>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--color-text)] leading-snug">
                            {getNotificationText(notification)}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 opacity-70">
                            {formatRelativeTime(notification.created_at)}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0 mt-2" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Bottom safe area */}
            <div className="pb-safe" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
