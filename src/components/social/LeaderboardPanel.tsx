import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Trophy, Flame, Dumbbell, Calendar } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useAuthStore } from '@/stores/authStore'
import type { LeaderboardMetric } from '@/services/leaderboardService'
import type { LucideIcon } from 'lucide-react'

interface MetricTab {
  key: LeaderboardMetric
  label: string
  icon: LucideIcon
  unit: string
}

const METRICS: MetricTab[] = [
  { key: 'streak', label: 'Streak', icon: Flame, unit: 'days' },
  { key: 'workouts_week', label: 'This Week', icon: Calendar, unit: 'workouts' },
  { key: 'workouts_month', label: 'Month', icon: Trophy, unit: 'workouts' },
  { key: 'volume_month', label: 'Volume', icon: Dumbbell, unit: 'lbs' },
]

export function LeaderboardPanel() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [metric, setMetric] = useState<LeaderboardMetric>('streak')
  const { data: entries, isLoading } = useLeaderboard(metric)

  const activeMetric = METRICS.find(m => m.key === metric)!

  return (
    <div className="space-y-3">
      {/* Metric tabs */}
      <div className="flex gap-1 p-1 rounded-[var(--radius-lg)] bg-[var(--color-surface-hover)]">
        {METRICS.map(m => {
          const isActive = metric === m.key
          return (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`
                relative flex-1 px-2 py-1.5 rounded-[var(--radius-md)] text-[10px] font-medium transition-colors
                ${isActive ? 'text-[var(--color-primary-text)]' : 'text-[var(--color-text-muted)]'}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="leaderboardTab"
                  className="absolute inset-0 rounded-[var(--radius-md)] bg-[var(--color-primary)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1">
                <m.icon className="w-3 h-3" />
                {m.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Leaderboard list */}
      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-12 bg-[var(--color-surface-hover)] animate-pulse rounded-[var(--radius-md)]" />
          ))}
        </div>
      ) : entries && entries.length > 0 ? (
        <div className="space-y-1">
          {entries.map(entry => {
            const isMe = user?.id === entry.user_id
            return (
              <button
                key={entry.user_id}
                onClick={() => navigate(`/community/profile/${entry.user_id}`)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-colors
                  ${isMe ? 'bg-[var(--color-primary)]/[0.08]' : 'hover:bg-[var(--color-surface-hover)]'}
                `}
              >
                {/* Rank */}
                <span className={`
                  w-6 text-center text-sm font-bold
                  ${entry.rank === 1 ? 'text-amber-500' : entry.rank === 2 ? 'text-gray-400' : entry.rank === 3 ? 'text-amber-700' : 'text-[var(--color-text-muted)]'}
                `}>
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                </span>

                <Avatar
                  src={entry.avatar_url}
                  alt={entry.display_name || 'User'}
                  size="sm"
                  className="w-8 h-8"
                />

                <span className={`flex-1 text-sm text-left truncate ${isMe ? 'font-bold text-[var(--color-text)]' : 'font-medium text-[var(--color-text)]'}`}>
                  {entry.display_name || 'Anonymous'}
                  {isMe && <span className="text-[10px] text-[var(--color-primary)] ml-1">(you)</span>}
                </span>

                <span className="text-sm font-bold text-[var(--color-text)]">
                  {entry.value.toLocaleString()}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] w-12 text-right">
                  {activeMetric.unit}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-[var(--color-text-muted)] text-center py-6">
          No data yet — start working out!
        </p>
      )}
    </div>
  )
}
