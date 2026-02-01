import { useNavigate } from 'react-router-dom'
import { Play, TrendingUp } from 'lucide-react'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent } from '@/components/ui'
import { WorkoutDayCard } from '@/components/workout'
import { useWorkoutPlans, useWorkoutDays } from '@/hooks/useWorkoutPlan'
import { useActiveSession, useUserSessions } from '@/hooks/useWorkoutSession'
import { formatRelativeTime } from '@/utils/formatters'
import type { SessionWithDay } from '@/services/workoutService'

export function HomePage() {
  const navigate = useNavigate()
  const { data: plans, isLoading: plansLoading } = useWorkoutPlans()
  const { data: days, isLoading: daysLoading } = useWorkoutDays(plans?.[0]?.id)
  const { data: activeSession } = useActiveSession()
  const { data: sessions } = useUserSessions()

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

  return (
    <AppShell title="Workout Tracker" showLogout>
      <div className="p-4 space-y-6">
        {activeSession && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Workout in progress</p>
                  <p className="text-gray-700">
                    {activeSession.workout_day?.name || 'Unknown workout'}
                  </p>
                </div>
                <Button onClick={handleContinueWorkout}>
                  <Play className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Start Workout</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : days?.length ? (
            <div className="space-y-3">
              {days.map((day) => (
                <WorkoutDayCard
                  key={day.id}
                  day={day}
                  onClick={() => handleStartWorkout(day.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No workout plan found. Please run the seed script to import workout data.
              </CardContent>
            </Card>
          )}
        </section>

        {recentSessions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <button
                onClick={() => navigate('/history')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                See all
              </button>
            </div>
            <div className="space-y-2">
              {recentSessions.map((session) => (
                <Card
                  key={session.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/history/${session.id}`)}
                >
                  <CardContent className="py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {session.workout_day?.name || 'Workout'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatRelativeTime(session.started_at)}
                      </p>
                    </div>
                    {session.completed_at && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Completed
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  )
}
