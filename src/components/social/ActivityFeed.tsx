import { Card, CardContent } from '@/components/ui'
import { useSocialFeed } from '@/hooks/useSocial'
import { formatRelativeTime } from '@/utils/formatters'
import { getWorkoutDisplayName } from '@/config/workoutConfig'
import { Barbell, Heart, Heartbeat, User } from '@phosphor-icons/react'
import type { FeedWorkout } from '@/types/community'

function getWorkoutIcon(type: string) {
  switch (type) {
    case 'cardio':
      return { Icon: Heart, color: 'var(--color-cardio)' }
    case 'mobility':
      return { Icon: Heartbeat, color: 'var(--color-mobility)' }
    default:
      return { Icon: Barbell, color: 'var(--color-weights)' }
  }
}

interface ActivityFeedItemProps {
  workout: FeedWorkout
}

export function ActivityFeedItem({ workout }: ActivityFeedItemProps) {
  const { Icon, color } = getWorkoutIcon(workout.type)
  const workoutName = getWorkoutDisplayName(workout.workout_name)
  const userName = workout.user_profile?.display_name || 'Anonymous'

  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              <span className="text-sm font-medium text-[var(--color-text)]">
                {userName}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              Completed <span className="font-medium text-[var(--color-text)]">{workoutName}</span>
            </p>
            {workout.duration_minutes && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {workout.duration_minutes} min
                {workout.distance_value && ` • ${workout.distance_value} ${workout.distance_unit}`}
              </p>
            )}
            <p className="text-xs text-[var(--color-text-muted)] opacity-70 mt-1">
              {formatRelativeTime(workout.completed_at || workout.started_at)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ActivityFeedProps {
  limit?: number
}

export function ActivityFeed({ limit }: ActivityFeedProps) {
  const { data, isLoading, error } = useSocialFeed()

  // Flatten infinite query pages
  const workouts = data?.pages.flatMap(p => p.items) ?? []

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-[var(--color-surface-hover)] animate-pulse rounded-[var(--radius-lg)]" />
        ))}
      </div>
    )
  }

  if (error || workouts.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-[var(--color-text-muted)]">
            No recent community activity
          </p>
        </CardContent>
      </Card>
    )
  }

  const displayedWorkouts = limit ? workouts.slice(0, limit) : workouts

  return (
    <div className="space-y-2">
      {displayedWorkouts.map((workout) => (
        <ActivityFeedItem key={workout.id} workout={workout} />
      ))}
    </div>
  )
}
