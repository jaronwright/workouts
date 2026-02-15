import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Bell, RefreshCw, Search, X } from 'lucide-react'
import { motion } from 'motion/react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, Avatar } from '@/components/ui'
import { FadeIn, StaggerList, StaggerItem, PressableButton } from '@/components/motion'
import { WorkoutCard } from '@/components/social/WorkoutCard'
import { NotificationPanel } from '@/components/social/NotificationPanel'
import { FeedTabs } from '@/components/social/FeedTabs'
import { FollowButton } from '@/components/social/FollowButton'
import { ChallengeCard } from '@/components/social/ChallengeCard'
import { LeaderboardPanel } from '@/components/social/LeaderboardPanel'
import { BadgeCelebration } from '@/components/social/BadgeCelebration'
import { useSocialFeed } from '@/hooks/useSocial'
import { useFollowCounts, useSuggestedUsers, useSearchUsers } from '@/hooks/useFollow'
import { useActiveChallenges, useJoinChallenge } from '@/hooks/useChallenges'
import { useCheckBadges } from '@/hooks/useBadges'
import { useCommunityNotifications, useUnreadNotificationCount, useMarkNotificationsRead } from '@/hooks/useCommunityNotifications'
import { useAuthStore } from '@/stores/authStore'
import { springPresets } from '@/config/animationConfig'
import type { FeedMode } from '@/types/community'
import {
  EMPTY_FEED_TITLE,
  EMPTY_FEED_MESSAGE,
  PRIVACY_EXPLAINER_TITLE,
  PRIVACY_EXPLAINER_MESSAGE,
} from '@/config/communityConfig'

export function CommunityPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)

  // Feed mode: following or discover
  const [feedMode, setFeedMode] = useState<FeedMode>('discover')
  const defaultSetRef = useRef(false)

  const { data: followCounts } = useFollowCounts(user?.id ?? null)
  const followingCount = followCounts?.following ?? 0

  // Default to 'following' tab when user follows people (set once)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!defaultSetRef.current && followCounts && followCounts.following > 0) {
      setFeedMode('following')
      defaultSetRef.current = true
    }
  }, [followCounts])
  /* eslint-enable react-hooks/set-state-in-effect */

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSocialFeed(feedMode)

  const { data: unreadCount } = useUnreadNotificationCount()
  const { data: notifications, isLoading: notificationsLoading } = useCommunityNotifications()
  const markRead = useMarkNotificationsRead()

  // Flatten paginated feed into a single array
  const workouts = data?.pages.flatMap(p => p.items) ?? []

  // Search state (only on Discover tab)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const { data: searchResults } = useSearchUsers(searchQuery)
  const { data: suggestedUsers } = useSuggestedUsers(6)
  const { data: challenges } = useActiveChallenges()
  const joinChallenge = useJoinChallenge()

  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [newBadgeKeys, setNewBadgeKeys] = useState<string[]>([])

  // Infinite scroll: observe sentinel element to auto-load more
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Check for new badges on page load
  const checkBadges = useCheckBadges()
  useEffect(() => {
    if (user) {
      checkBadges.mutate(undefined, {
        onSuccess: (awarded) => {
          if (awarded.length > 0) setNewBadgeKeys(awarded) // eslint-disable-line react-hooks/set-state-in-effect
        }
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Check if user needs onboarding
  useEffect(() => {
    if (user) {
      const key = `community-onboarded-${user.id}`
      if (!localStorage.getItem(key)) {
        setShowPrivacyModal(true) // eslint-disable-line react-hooks/set-state-in-effect
        localStorage.setItem(key, 'true')
      }
    }
  }, [user])

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

  // Header action: notification bell
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

  const showDiscoverExtras = feedMode === 'discover' && !isLoading

  return (
    <AppShell title="Community" headerAction={headerAction}>
      <div className="px-[var(--space-4)] py-[var(--space-4)] space-y-[var(--space-3)] pb-[var(--space-8)]">
        {/* Feed Tabs */}
        <FeedTabs
          activeTab={feedMode}
          onTabChange={setFeedMode}
          followingCount={followingCount}
        />

        {/* Discover: Search bar */}
        {showDiscoverExtras && (
          <div className="space-y-[var(--space-3)]">
            <div className="flex items-center gap-2 bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)] px-3 py-2">
              <Search className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true) }}
                onFocus={() => setShowSearch(true)}
                placeholder="Search people..."
                className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setShowSearch(false) }}>
                  <X className="w-4 h-4 text-[var(--color-text-muted)]" />
                </button>
              )}
            </div>

            {/* Search results */}
            {showSearch && searchQuery.length >= 2 && searchResults && (
              <div className="space-y-1">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)] text-center py-3">No users found</p>
                ) : (
                  searchResults.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { handleUserClick(u.id); setShowSearch(false); setSearchQuery('') }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] transition-colors"
                    >
                      <Avatar src={u.avatar_url} alt={u.display_name || 'User'} size="sm" className="w-8 h-8" />
                      <span className="text-sm font-medium text-[var(--color-text)] truncate flex-1 text-left">
                        {u.display_name || 'Anonymous'}
                      </span>
                      <FollowButton userId={u.id} size="sm" />
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Suggested users (when not searching) */}
            {!showSearch && suggestedUsers && suggestedUsers.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                  Suggested
                </p>
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                  {suggestedUsers.map(u => (
                    <div
                      key={u.id}
                      className="flex flex-col items-center gap-1.5 min-w-[72px] p-2 rounded-[var(--radius-lg)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                    >
                      <div onClick={() => handleUserClick(u.id)}>
                        <Avatar src={u.avatar_url} alt={u.display_name || 'User'} size="md" className="w-12 h-12" />
                      </div>
                      <span
                        onClick={() => handleUserClick(u.id)}
                        className="text-[10px] font-medium text-[var(--color-text)] truncate max-w-[72px]"
                      >
                        {u.display_name || 'Anonymous'}
                      </span>
                      <FollowButton userId={u.id} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Challenges (Discover tab) */}
        {showDiscoverExtras && challenges && challenges.length > 0 && !showSearch && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              Active Challenges
            </p>
            {challenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoin={(id) => joinChallenge.mutate(id)}
                isJoining={joinChallenge.isPending}
              />
            ))}
          </div>
        )}

        {/* Leaderboard (Discover tab) */}
        {showDiscoverExtras && !showSearch && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              Leaderboard
            </p>
            <LeaderboardPanel />
          </div>
        )}

        {/* Header row with refresh */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
            {feedMode === 'following' ? 'Your Feed' : 'Activity'}
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
        {!isLoading && workouts.length === 0 && (
          <FadeIn direction="up">
            <Card variant="outlined">
              <CardContent className="py-[var(--space-12)] text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-[var(--space-4)]" style={{ background: 'var(--color-primary-muted)' }}>
                  <Users className="w-8 h-8 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-[var(--space-2)]">
                  {feedMode === 'following' ? 'No workouts from your crew yet' : EMPTY_FEED_TITLE}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] max-w-xs mx-auto leading-relaxed">
                  {feedMode === 'following'
                    ? 'When people you follow log workouts, they\'ll show up here.'
                    : EMPTY_FEED_MESSAGE}
                </p>
                {feedMode === 'following' && (
                  <button
                    onClick={() => setFeedMode('discover')}
                    className="mt-4 px-4 py-2 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-text)] text-sm font-semibold"
                  >
                    Discover People
                  </button>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Feed */}
        {!isLoading && workouts.length > 0 && (
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

        {/* Infinite scroll sentinel */}
        {hasNextPage && (
          <div ref={loadMoreRef} className="py-[var(--space-4)] flex justify-center">
            {isFetchingNextPage && (
              <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        )}

        {/* End of feed indicator */}
        {!isLoading && workouts.length > 0 && !hasNextPage && (
          <p className="text-center text-xs text-[var(--color-text-muted)] py-[var(--space-4)]">
            You&apos;re all caught up!
          </p>
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

      {/* Badge Celebration Overlay */}
      {newBadgeKeys.length > 0 && (
        <BadgeCelebration
          badgeKeys={newBadgeKeys}
          onComplete={() => setNewBadgeKeys([])}
        />
      )}
    </AppShell>
  )
}
