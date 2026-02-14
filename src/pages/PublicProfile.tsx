import { useParams, useNavigate } from 'react-router-dom'
import { Flame, Calendar, Trophy, Dumbbell, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, Avatar } from '@/components/ui'
import { WorkoutCard } from '@/components/social/WorkoutCard'
import { FollowButton } from '@/components/social/FollowButton'
import { usePublicProfile } from '@/hooks/useSocial'
import { useFollowCounts } from '@/hooks/useFollow'
import { staggerContainer, staggerChild } from '@/config/animationConfig'

export function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { data: profile, isLoading } = usePublicProfile(userId || null)
  const { data: followCounts } = useFollowCounts(userId || null)

  if (isLoading) {
    return (
      <AppShell title="Profile" showBack>
        <div className="px-4 py-6 space-y-4">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[var(--color-surface-hover)] animate-pulse" />
            <div className="h-6 w-32 bg-[var(--color-surface-hover)] animate-pulse rounded mt-3" />
            <div className="h-4 w-24 bg-[var(--color-surface-hover)] animate-pulse rounded mt-2" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-20 bg-[var(--color-surface-hover)] animate-pulse rounded-[var(--radius-xl)]" />
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  if (!profile) {
    return (
      <AppShell title="Profile" showBack>
        <div className="px-4 py-12 text-center">
          <p className="text-[var(--color-text-muted)]">User not found</p>
        </div>
      </AppShell>
    )
  }

  const displayName = profile.display_name || 'Anonymous'

  return (
    <AppShell title={displayName} showBack>
      <div className="px-4 py-6 space-y-5 pb-8">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex flex-col items-center"
        >
          <Avatar
            src={profile.avatar_url}
            alt={displayName}
            size="lg"
            className="w-20 h-20"
          />
          <h2 className="text-xl font-bold text-[var(--color-text)] mt-3">
            {displayName}
          </h2>
          {profile.plan_name && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              <span className="text-sm text-[var(--color-text-muted)]">
                {profile.plan_name}
              </span>
            </div>
          )}

          {/* Followers / Following counts */}
          {followCounts && (
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => navigate(`/community/profile/${userId}`)}
                className="text-center"
              >
                <span className="text-sm font-bold text-[var(--color-text)]">{followCounts.followers}</span>
                <span className="text-xs text-[var(--color-text-muted)] ml-1">followers</span>
              </button>
              <div className="w-px h-4 bg-[var(--color-border)]" />
              <button
                onClick={() => navigate(`/community/profile/${userId}`)}
                className="text-center"
              >
                <span className="text-sm font-bold text-[var(--color-text)]">{followCounts.following}</span>
                <span className="text-xs text-[var(--color-text-muted)] ml-1">following</span>
              </button>
            </div>
          )}

          {/* Follow button */}
          {userId && (
            <div className="mt-3">
              <FollowButton userId={userId} size="md" />
            </div>
          )}
        </motion.div>

        {/* Stats grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-3"
        >
          <motion.div variants={staggerChild}>
            <Card>
              <CardContent className="py-3 text-center">
                <div className="w-8 h-8 rounded-full mx-auto mb-1.5 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)' }}>
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-lg font-bold text-[var(--color-text)]">{profile.stats.current_streak}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Streak</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={staggerChild}>
            <Card>
              <CardContent className="py-3 text-center">
                <div className="w-8 h-8 rounded-full mx-auto mb-1.5 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)' }}>
                  <Calendar className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-lg font-bold text-[var(--color-text)]">{profile.stats.this_week}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">This Week</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={staggerChild}>
            <Card>
              <CardContent className="py-3 text-center">
                <div className="w-8 h-8 rounded-full mx-auto mb-1.5 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}>
                  <Trophy className="w-4 h-4 text-violet-500" />
                </div>
                <p className="text-lg font-bold text-[var(--color-text)]">{profile.stats.total_workouts}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Total</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent workouts */}
        {profile.recent_workouts.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              Recent Activity
            </p>
            {profile.recent_workouts.map((workout, index) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                index={index}
                onUserClick={(uid) => navigate(`/community/profile/${uid}`)}
              />
            ))}
          </div>
        )}

        {profile.recent_workouts.length === 0 && (
          <Card variant="outlined">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                No public workouts yet
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
