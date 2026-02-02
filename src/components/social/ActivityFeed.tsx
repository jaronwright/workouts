import { Card, CardContent } from '@/components/ui'
import { useSocialFeed } from '@/hooks/useSocial'
import { formatRelativeTime, normalizeWorkoutName } from '@/utils/formatters'
import { Dumbbell, Heart, Activity, User } from 'lucide-react'
import type { SocialWorkout } from '@/services/socialService'

function getWorkoutIcon(workout: SocialWorkout) {
  switch (workout.type) {
    case 'cardio':
      return { Icon: Heart, color: 'var(--color-cardio)' }
    case 'mobility':
      return { Icon: Activity, color: 'var(--color-mobility)' }
    default:
      return { Icon: Dumbbell, color: 'var(--color-weights)' }
  }
}

function getWorkoutName(workout: SocialWorkout): string {
  if (workout.workout_day?.name) {
    return normalizeWorkoutName(workout.workout_day.name)
  }
  if (workout.template?.name) {
    return workout.template.name
  }
  return 'Workout'
}

function getUserDisplayName(workout: SocialWorkout): string {
  return workout.user_profile?.display_name || 'Anonymous'
}

interface ActivityFeedItemProps {
  workout: SocialWorkout
}

function ActivityFeedItem({ workout }: ActivityFeedItemProps) {
  const { Icon, color } = getWorkoutIcon(workout)
  const workoutName = getWorkoutName(workout)
  const userName = getUserDisplayName(workout)

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

export function ActivityFeed() {
  const { data: workouts, isLoading, error } = useSocialFeed()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-[var(--color-surface-hover)] animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (error || !workouts || workouts.length === 0) {
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

  return (
    <div className="space-y-2">
      {workouts.map((workout) => (
        <ActivityFeedItem key={workout.id} workout={workout} />
      ))}
    </div>
  )
}
