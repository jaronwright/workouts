import { useNavigate } from 'react-router-dom'
import { Play, TrendingUp, ChevronRight, Clock, Flame, Trophy, Calendar } from 'lucide-react'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent } from '@/components/ui'
import { ActivityFeed } from '@/components/social'
import { useActiveSession, useUserSessions } from '@/hooks/useWorkoutSession'
import { useProfile } from '@/hooks/useProfile'
import { useTodaysWorkout } from '@/hooks/useSchedule'
import { formatRelativeTime } from '@/utils/formatters'
import type { SessionWithDay } from '@/services/workoutService'

// Curated Unsplash images for each workout type
const WORKOUT_IMAGES = {
  push: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop&crop=faces',
  pull: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&h=600&fit=crop&crop=faces',
  legs: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&h=600&fit=crop&crop=faces',
  rest: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&crop=faces',
  default: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&crop=faces'
}

function getWorkoutImage(workoutName: string | undefined): string {
  if (!workoutName) return WORKOUT_IMAGES.default
  const name = workoutName.toLowerCase()
  if (name.includes('push')) return WORKOUT_IMAGES.push
  if (name.includes('pull')) return WORKOUT_IMAGES.pull
  if (name.includes('leg')) return WORKOUT_IMAGES.legs
  if (name.includes('rest')) return WORKOUT_IMAGES.rest
  return WORKOUT_IMAGES.default
}

function getWorkoutType(workoutName: string | undefined): string {
  if (!workoutName) return 'Workout'
  const name = workoutName.toLowerCase()
  if (name.includes('push')) return 'Push Day'
  if (name.includes('pull')) return 'Pull Day'
  if (name.includes('leg')) return 'Leg Day'
  return 'Workout'
}

// Calculate streak from sessions
function calculateStreak(sessions: SessionWithDay[]): number {
  if (!sessions.length) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  const checkDate = new Date(today)

  // Get unique workout days
  const workoutDays = new Set(
    sessions
      .filter(s => s.completed_at)
      .map(s => {
        const d = new Date(s.completed_at!)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
      })
  )

  // Count consecutive days (allowing for rest days in PPL split)
  for (let i = 0; i < 30; i++) {
    if (workoutDays.has(checkDate.getTime())) {
      streak++
    } else if (streak > 0 && i > 1) {
      // Allow 1-2 rest days between workouts
      const nextDay = new Date(checkDate)
      nextDay.setDate(nextDay.getDate() - 1)
      if (!workoutDays.has(nextDay.getTime())) {
        break
      }
    }
    checkDate.setDate(checkDate.getDate() - 1)
  }

  return streak
}

// Count workouts this week
function countThisWeek(sessions: SessionWithDay[]): number {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  return sessions.filter(s => {
    if (!s.completed_at) return false
    return new Date(s.completed_at) >= startOfWeek
  }).length
}

export function HomePage() {
  const navigate = useNavigate()
  const { data: activeSession } = useActiveSession()
  const { data: sessions, isLoading: sessionsLoading } = useUserSessions()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: todaysWorkout, isLoading: todaysLoading } = useTodaysWorkout(profile?.current_cycle_day || 0)

  const recentSessions = (sessions?.slice(0, 3) || []) as SessionWithDay[]
  const allSessions = (sessions || []) as SessionWithDay[]

  // Stats
  const streak = calculateStreak(allSessions)
  const thisWeek = countThisWeek(allSessions)
  const totalWorkouts = allSessions.filter(s => s.completed_at).length
  const statsLoading = sessionsLoading

  // Determine hero content
  const hasActiveSession = !!activeSession
  const heroLoading = profileLoading || todaysLoading
  const heroWorkoutName = hasActiveSession
    ? activeSession.workout_day?.name
    : todaysWorkout?.workout_day?.name || todaysWorkout?.template?.name
  const heroImage = getWorkoutImage(heroWorkoutName)
  const heroWorkoutType = getWorkoutType(heroWorkoutName)

  const handleHeroAction = () => {
    if (hasActiveSession) {
      navigate(`/workout/${activeSession.workout_day_id}/active`)
    } else if (todaysWorkout?.is_rest_day) {
      navigate('/rest-day')
    } else if (todaysWorkout?.workout_day_id) {
      navigate(`/workout/${todaysWorkout.workout_day_id}`)
    } else if (todaysWorkout?.template_id && todaysWorkout?.template) {
      if (todaysWorkout.template.type === 'cardio') {
        navigate(`/cardio/${todaysWorkout.template_id}`)
      } else if (todaysWorkout.template.type === 'mobility') {
        navigate(`/mobility/${todaysWorkout.template_id}`)
      }
    } else {
      // No scheduled workout, go to workout selection
      navigate('/workout')
    }
  }

  return (
    <AppShell title="Home" showLogout>
      <div className="space-y-5 pb-4">
        {/* Hero Banner */}
        <div
          className="relative h-48 mx-4 mt-4 rounded-[var(--radius-xl)] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform duration-100"
          onClick={handleHeroAction}
        >
          {/* Background Image */}
          {heroLoading ? (
            <div className="absolute inset-0 bg-[var(--color-surface-hover)] animate-pulse" />
          ) : (
            <img
              src={heroImage}
              alt={heroWorkoutType}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-1.5">
              {hasActiveSession ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  In Progress
                </span>
              ) : heroLoading ? (
                <div className="h-5 w-16 rounded-full bg-white/20 animate-pulse" />
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wide">
                  <Clock className="w-3 h-3" />
                  Up Next
                </span>
              )}
            </div>

            {/* Workout Info */}
            {heroLoading ? (
              <>
                <div className="h-3 w-16 rounded bg-white/20 animate-pulse mb-1" />
                <div className="h-6 w-40 rounded bg-white/30 animate-pulse mb-2.5" />
              </>
            ) : (
              <>
                <p className="text-white/60 text-xs font-medium">
                  {heroWorkoutType}
                </p>
                <h2 className="text-white text-xl font-bold leading-tight mb-2.5">
                  {heroWorkoutName || 'Start a Workout'}
                </h2>
              </>
            )}

            {/* Action Button */}
            <Button
              variant={hasActiveSession ? 'primary' : 'gradient'}
              size="md"
              className="self-start"
              disabled={heroLoading}
            >
              {hasActiveSession ? (
                <>
                  <Play className="w-4 h-4 mr-1" fill="currentColor" />
                  Continue
                </>
              ) : todaysWorkout?.is_rest_day ? (
                'View Rest Day'
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" fill="currentColor" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-4">
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <CardContent className="py-3 px-2">
                <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-orange-500/15 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                {statsLoading ? (
                  <div className="h-8 w-8 mx-auto mb-0.5 rounded bg-[var(--color-surface-hover)] animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-[var(--color-text)]">{streak}</p>
                )}
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Day Streak</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="py-3 px-2">
                <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-blue-500/15 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                {statsLoading ? (
                  <div className="h-8 w-8 mx-auto mb-0.5 rounded bg-[var(--color-surface-hover)] animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-[var(--color-text)]">{thisWeek}</p>
                )}
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">This Week</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="py-3 px-2">
                <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-purple-500/15 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-purple-500" />
                </div>
                {statsLoading ? (
                  <div className="h-8 w-8 mx-auto mb-0.5 rounded bg-[var(--color-surface-hover)] animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-[var(--color-text)]">{totalWorkouts}</p>
                )}
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Total</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        {recentSessions.length > 0 && (
          <section className="px-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[var(--color-text)]">
                Recent Activity
              </h2>
              <button
                onClick={() => navigate('/history')}
                className="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-0.5 active:opacity-70"
              >
                See All
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {recentSessions.map((session) => (
                <Card
                  key={session.id}
                  interactive
                  onClick={() => navigate(`/history/${session.id}`)}
                >
                  <CardContent className="py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--color-text)] text-sm truncate">
                        {session.workout_day?.name || 'Workout'}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {formatRelativeTime(session.started_at)}
                      </p>
                    </div>
                    {session.completed_at && (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-[var(--color-success)]/15 text-[var(--color-success)] px-2 py-1 rounded-full">
                        Done
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Community */}
        <section className="px-4">
          <h2 className="text-base font-bold text-[var(--color-text)] mb-3">
            Community
          </h2>
          <ActivityFeed />
        </section>
      </div>
    </AppShell>
  )
}
