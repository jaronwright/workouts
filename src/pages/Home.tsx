import { useNavigate } from 'react-router-dom'
import { Play, TrendingUp, Calendar, Users, ChevronRight } from 'lucide-react'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent } from '@/components/ui'
import { WorkoutDayCard } from '@/components/workout'
import { ActivityFeed } from '@/components/social'
import { useWorkoutPlans, useWorkoutDays } from '@/hooks/useWorkoutPlan'
import { useActiveSession, useUserSessions } from '@/hooks/useWorkoutSession'
import { useProfile } from '@/hooks/useProfile'
import { useTodaysWorkout } from '@/hooks/useSchedule'
import { formatRelativeTime } from '@/utils/formatters'
import { getDayName } from '@/services/scheduleService'
import type { SessionWithDay } from '@/services/workoutService'

export function HomePage() {
  const navigate = useNavigate()
  const { data: plans, isLoading: plansLoading } = useWorkoutPlans()
  const { data: days, isLoading: daysLoading } = useWorkoutDays(plans?.[0]?.id)
  const { data: activeSession } = useActiveSession()
  const { data: sessions } = useUserSessions()
  const { data: profile } = useProfile()
  const { data: todaysWorkout } = useTodaysWorkout(profile?.current_cycle_day || 0)

  const recentSessions = (sessions?.slice(0, 3) || []) as SessionWithDay[]
  const isLoading = plansLoading || daysLoading

  const handleStartWorkout = (dayId: string) => {
    navigate(`/workout/${dayId}`)
  }

  const handleContinueWorkout = () => {
    if (activeSession) {
      navigate(`/workout/${activeSession.workout_day_id}/active`)
    }
  }

  const handleTodaysWorkout = () => {
    if (!todaysWorkout) return

    if (todaysWorkout.is_rest_day) {
      navigate('/rest-day')
    } else if (todaysWorkout.workout_day_id) {
      navigate(`/workout/${todaysWorkout.workout_day_id}`)
    } else if (todaysWorkout.template_id && todaysWorkout.template) {
      if (todaysWorkout.template.type === 'cardio') {
        navigate(`/cardio/${todaysWorkout.template_id}`)
      } else if (todaysWorkout.template.type === 'mobility') {
        navigate(`/mobility/${todaysWorkout.template_id}`)
      }
    }
  }

  return (
    <AppShell title="Workout Tracker" showLogout>
      <div className="p-4 space-y-5">
        {/* Active Session Card */}
        {activeSession && (
          <Card highlight className="animate-fade-in">
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent" />
              <CardContent className="relative py-4">
                <div className="flex items-center gap-4">
                  <div className="
                    w-12 h-12 rounded-[var(--radius-lg)]
                    bg-gradient-to-br from-[var(--color-primary)] to-[#8B5CF6]
                    flex items-center justify-center
                    animate-pulse-subtle
                  ">
                    <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide">
                      In Progress
                    </p>
                    <p className="text-base font-bold text-[var(--color-text)]">
                      {activeSession.workout_day?.name || 'Workout'}
                    </p>
                  </div>
                  <Button variant="gradient" size="sm" onClick={handleContinueWorkout}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Today's Workout */}
        {profile?.current_cycle_day && todaysWorkout && !activeSession && (
          <Card interactive onClick={handleTodaysWorkout}>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="
                  w-12 h-12 rounded-[var(--radius-lg)]
                  bg-gradient-to-br from-amber-400 to-orange-500
                  flex items-center justify-center
                ">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">
                    {getDayName(profile.current_cycle_day)} • Day {profile.current_cycle_day}
                  </p>
                  <p className="text-base font-bold text-[var(--color-text)]">
                    {todaysWorkout.is_rest_day
                      ? 'Rest Day'
                      : todaysWorkout.workout_day?.name || todaysWorkout.template?.name || 'Workout'}
                  </p>
                </div>
                <Button size="sm" variant={todaysWorkout.is_rest_day ? 'secondary' : 'primary'}>
                  {todaysWorkout.is_rest_day ? 'View' : 'Start'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workouts */}
        <section>
          <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">
            Workouts
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-[var(--radius-xl)] skeleton" />
              ))}
            </div>
          ) : days?.length ? (
            <div className="space-y-2.5">
              {days.map((day) => (
                <WorkoutDayCard
                  key={day.id}
                  day={day}
                  onClick={() => handleStartWorkout(day.id)}
                />
              ))}
            </div>
          ) : (
            <Card variant="outlined">
              <CardContent className="py-8 text-center">
                <p className="text-[var(--color-text-muted)]">
                  No workout plan found.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Recent Activity */}
        {recentSessions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                Recent
              </h2>
              <button
                onClick={() => navigate('/history')}
                className="
                  text-sm font-semibold text-[var(--color-primary)]
                  flex items-center gap-0.5
                  active:opacity-70
                "
              >
                All
                <ChevronRight className="w-4 h-4" />
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
                    <div className="
                      w-10 h-10 rounded-full
                      bg-gradient-to-br from-emerald-400 to-green-500
                      flex items-center justify-center
                    ">
                      <TrendingUp className="w-5 h-5 text-white" />
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
                      <span className="
                        text-[10px] font-bold uppercase tracking-wide
                        bg-[var(--color-success)]/15 text-[var(--color-success)]
                        px-2 py-1 rounded-full
                      ">
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
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Community
            </h2>
          </div>
          <ActivityFeed />
        </section>
      </div>
    </AppShell>
  )
}
