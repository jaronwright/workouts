import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Bell, RefreshCw } from 'lucide-react'
import { motion } from 'motion/react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent } from '@/components/ui'
import { FadeIn, StaggerList, StaggerItem, PressableButton } from '@/components/motion'
import { WorkoutCard } from '@/components/social/WorkoutCard'
import { NotificationPanel } from '@/components/social/NotificationPanel'
import { useSocialFeed } from '@/hooks/useSocial'
import { useCommunityNotifications, useUnreadNotificationCount, useMarkNotificationsRead } from '@/hooks/useCommunityNotifications'
import { useAuthStore } from '@/stores/authStore'
import { springPresets } from '@/config/animationConfig'
import {
  EMPTY_FEED_TITLE,
  EMPTY_FEED_MESSAGE,
  PRIVACY_EXPLAINER_TITLE,
  PRIVACY_EXPLAINER_MESSAGE,
} from '@/config/communityConfig'

export function CommunityPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { data: workouts, isLoading, refetch, isRefetching } = useSocialFeed()
  const { data: unreadCount } = useUnreadNotificationCount()
  const { data: notifications, isLoading: notificationsLoading } = useCommunityNotifications()
  const markRead = useMarkNotificationsRead()

  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Check if user needs onboarding — reading localStorage is a sync side-effect
  useEffect(() => {
    if (user) {
      const key = `community-onboarded-${user.id}`
      if (!localStorage.getItem(key)) {
        setShowPrivacyModal(true) // eslint-disable-line react-hooks/set-state-in-effect
        localStorage.setItem(key, 'true')
      }
    }
  }, [user])

  // Mark notifications as read when opening the panel
  const handleOpenNotifications = useCallback(() => {
    setShowNotifications(true)
    if (unreadCount && unreadCount > 0) {
      markRead.mutate()
    }
  }, [unreadCount, markRead])

  const handleUserClick = useCallback((userId: string) => {
    navigate(`/community/profile/${userId}`)
  }, [navigate])

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  // Header action: notification bell (always visible, badge shows unread count)
  const headerAction = (
    <PressableButton
      onClick={handleOpenNotifications}
      className="relative p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] transition-colors"
    >
      <Bell className="w-5 h-5 text-[var(--color-text-muted)]" />
      {(unreadCount ?? 0) > 0 && (
        <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[var(--color-accent)]" />
      )}
    </PressableButton>
  )

  return (
    <AppShell title="Community" headerAction={headerAction}>
      <div className="px-[var(--space-4)] py-[var(--space-4)] space-y-[var(--space-3)] pb-[var(--space-8)]">
        {/* Pull to refresh button */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
            Activity
          </p>
          <PressableButton
            onClick={handleRefresh}
            disabled={isRefetching}
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </PressableButton>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-[var(--space-3)]">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-28 skeleton rounded-[var(--radius-xl)]" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!workouts || workouts.length === 0) && (
          <FadeIn direction="up">
            <Card variant="outlined">
              <CardContent className="py-[var(--space-12)] text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-[var(--space-4)]" style={{ background: 'var(--color-primary-muted)' }}>
                  <Users className="w-8 h-8 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-[var(--space-2)]">
                  {EMPTY_FEED_TITLE}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] max-w-xs mx-auto leading-relaxed">
                  {EMPTY_FEED_MESSAGE}
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Feed */}
        {!isLoading && workouts && workouts.length > 0 && (
          <StaggerList className="space-y-[var(--space-3)]">
            {workouts.map((workout, index) => (
              <StaggerItem key={workout.id}>
                <WorkoutCard
                  workout={workout}
                  index={index}
                  onUserClick={handleUserClick}
                />
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications || []}
        isLoading={notificationsLoading}
      />

      {/* Privacy Explainer Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPrivacyModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.smooth}
            className="relative bg-[var(--color-surface)] rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] p-[var(--space-6)] mx-[var(--space-4)] mb-0 sm:mb-0 max-w-sm w-full"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-[var(--space-4)]" style={{ background: 'var(--color-primary-muted)' }}>
              <Users className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text)] text-center mb-[var(--space-2)]">
              {PRIVACY_EXPLAINER_TITLE}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] text-center leading-relaxed mb-[var(--space-6)]">
              {PRIVACY_EXPLAINER_MESSAGE}
            </p>
            <PressableButton
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-3 rounded-[var(--radius-lg)] text-[var(--color-primary-text)] font-semibold text-sm"
              style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-primary)' } as React.CSSProperties}
            >
              Got it
            </PressableButton>
          </motion.div>
        </div>
      )}
    </AppShell>
  )
}
