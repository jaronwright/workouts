import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play, TrendingUp, ChevronRight, ChevronDown, Clock, Flame, Trophy, Calendar,
  Zap, Dumbbell, Heart, Activity, X
} from 'lucide-react'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent } from '@/components/ui'
import { ScheduleWidget } from '@/components/workout'
import { useActiveSession, useUserSessions, useDeleteSession } from '@/hooks/useWorkoutSession'
import { useProfile } from '@/hooks/useProfile'
import { useWorkoutPlans, useWorkoutDays } from '@/hooks/useWorkoutPlan'
import { useWorkoutTemplatesByType } from '@/hooks/useSchedule'
import { formatRelativeTime } from '@/utils/formatters'
import {
  getWorkoutDisplayName,
  getCardioStyle,
  getMobilityStyle,
  CATEGORY_DEFAULTS,
  getCategoryLabel
} from '@/config/workoutConfig'
import type { SessionWithDay } from '@/services/workoutService'
import type { WorkoutTemplate } from '@/services/scheduleService'

// Get greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// Get motivational message based on stats
function getMotivationalMessage(streak: number, thisWeek: number, hasActiveSession: boolean): string {
  if (hasActiveSession) return "You have a workout in progress!"
  if (streak >= 7) return "You're on fire! Keep the momentum going!"
  if (streak >= 3) return "Great consistency! You're building a habit."
  if (thisWeek >= 3) return "Solid week! One more workout to crush it."
  if (thisWeek >= 1) return "Good start this week. Keep pushing!"
  return "Ready to start strong? Let's go!"
}

// Calculate streak from sessions
function calculateStreak(sessions: SessionWithDay[]): number {
  if (!sessions.length) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  const checkDate = new Date(today)

  const workoutDays = new Set(
    sessions
      .filter(s => s.completed_at)
      .map(s => {
        const d = new Date(s.completed_at!)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
      })
  )

  for (let i = 0; i < 30; i++) {
    if (workoutDays.has(checkDate.getTime())) {
      streak++
    } else if (streak > 0 && i > 1) {
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
function getWeeklyCount(sessions: SessionWithDay[]): number {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const days = new Set<number>()
  sessions.forEach(s => {
    if (!s.completed_at) return
    const completedDate = new Date(s.completed_at)
    if (completedDate >= startOfWeek) {
      days.add(completedDate.getDay())
    }
  })

  return days.size
}

// Workout Day Card Component
interface WorkoutDayCardProps {
  day: { id: string; name: string; day_number: number }
  onClick: () => void
}

function WorkoutDayCard({ day, onClick }: WorkoutDayCardProps) {
  const style = CATEGORY_DEFAULTS.weights

  return (
    <Card interactive onClick={onClick}>
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className={`w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-sm`}
        >
          <Dumbbell className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: style.color }}>
            Weights
          </span>
          <h3 className="font-semibold text-[var(--color-text)] text-base leading-tight mt-0.5">
            {getWorkoutDisplayName(day.name)}
          </h3>
        </div>
        <div className="w-8 h-8 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-text-muted)]">
          <ChevronRight className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  )
}

// Template Card Component
interface TemplateCardProps {
  template: WorkoutTemplate
  onClick: () => void
}

function TemplateCard({ template, onClick }: TemplateCardProps) {
  const style = template.type === 'cardio'
    ? getCardioStyle(template.category)
    : getMobilityStyle(template.category)
  const Icon = style.icon
  const typeLabel = getCategoryLabel(template.type)

  return (
    <Card interactive onClick={onClick}>
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className={`w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: style.color }}>
            {typeLabel}
          </span>
          <h3 className="font-semibold text-[var(--color-text)] text-base leading-tight mt-0.5">
            {template.name}
          </h3>
          {template.duration_minutes && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              ~{template.duration_minutes} min
            </p>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-text-muted)]">
          <ChevronRight className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  )
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string
  icon: React.ElementType
  iconColor: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function CollapsibleSection({ title, icon: Icon, iconColor, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 active:opacity-70"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
          <h2 className="text-base font-bold text-[var(--color-text)]">{title}</h2>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && <div className="space-y-3 mt-1">{children}</div>}
    </section>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { data: activeSession } = useActiveSession()
  const deleteSession = useDeleteSession()
  const { data: sessions, isLoading: sessionsLoading } = useUserSessions()
  const { data: profile } = useProfile()
  const { data: plans } = useWorkoutPlans()
  const { data: days, isLoading: daysLoading } = useWorkoutDays(plans?.[0]?.id)
  const { data: cardioTemplates, isLoading: cardioLoading } = useWorkoutTemplatesByType('cardio')
  const { data: mobilityTemplates, isLoading: mobilityLoading } = useWorkoutTemplatesByType('mobility')

  const allSessions = (sessions || []) as SessionWithDay[]
  const recentSessions = allSessions.slice(0, 3)

  // Stats
  const streak = calculateStreak(allSessions)
  const thisWeek = getWeeklyCount(allSessions)
  const totalWorkouts = allSessions.filter(s => s.completed_at).length
  const statsLoading = sessionsLoading

  // Greeting
  const greeting = getGreeting()
  const displayName = profile?.display_name || 'there'
  const motivation = getMotivationalMessage(streak, thisWeek, !!activeSession)

  // Handlers
  const handleStartWorkout = (dayId: string) => navigate(`/workout/${dayId}`)
  const handleStartCardio = (templateId: string) => navigate(`/cardio/${templateId}`)
  const handleStartMobility = (templateId: string) => navigate(`/mobility/${templateId}`)
  const handleContinueWorkout = () => {
    if (activeSession) {
      navigate(`/workout/${activeSession.workout_day_id}/active`)
    }
  }
  const handleDismissSession = () => {
    if (activeSession) {
      deleteSession.mutate(activeSession.id)
    }
  }

  return (
    <AppShell title="Home" showLogout>
      <div className="p-4 space-y-5 pb-4">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            {greeting}, {displayName}!
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
            {motivation}
          </p>
        </div>

        {/* Active Session Banner */}
        {activeSession && (
          <Card highlight>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-green-500 uppercase tracking-wide">
                    In Progress
                  </p>
                  <p className="text-base font-bold text-[var(--color-text)]">
                    {getWorkoutDisplayName(activeSession.workout_day?.name)}
                  </p>
                </div>
                <Button size="sm" onClick={handleContinueWorkout}>
                  Continue
                </Button>
                <button
                  onClick={handleDismissSession}
                  className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors"
                  title="Dismiss session"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule Widget - Today's Workout + 7-Day Overview */}
        <ScheduleWidget />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="overflow-hidden">
            <CardContent className="py-3 px-2 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
              <div className="relative">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                {statsLoading ? (
                  <div className="h-7 w-8 mx-auto mb-0.5 rounded bg-[var(--color-surface-hover)] animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-[var(--color-text)]">{streak}</p>
                )}
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Streak</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => navigate('/history')}
          >
            <CardContent className="py-3 px-2 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
              <div className="relative">
                <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                {statsLoading ? (
                  <div className="h-7 w-8 mx-auto mb-0.5 rounded bg-[var(--color-surface-hover)] animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-[var(--color-text)]">{thisWeek}</p>
                )}
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">This Week</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => navigate('/history')}
          >
            <CardContent className="py-3 px-2 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
              <div className="relative">
                <Trophy className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                {statsLoading ? (
                  <div className="h-7 w-8 mx-auto mb-0.5 rounded bg-[var(--color-surface-hover)] animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-[var(--color-text)]">{totalWorkouts}</p>
                )}
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workout Categories */}
        <CollapsibleSection
          title="Weights"
          icon={Dumbbell}
          iconColor={CATEGORY_DEFAULTS.weights.color}
          defaultOpen={false}
        >
          {daysLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-[var(--radius-xl)] skeleton" />
              ))}
            </div>
          ) : days?.length ? (
            days.map((day) => (
              <WorkoutDayCard
                key={day.id}
                day={day}
                onClick={() => handleStartWorkout(day.id)}
              />
            ))
          ) : (
            <Card variant="outlined">
              <CardContent className="py-6 text-center">
                <p className="text-[var(--color-text-muted)]">No weight workouts found.</p>
              </CardContent>
            </Card>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="Cardio"
          icon={Heart}
          iconColor={CATEGORY_DEFAULTS.cardio.color}
          defaultOpen={false}
        >
          {cardioLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-[var(--radius-xl)] skeleton" />
              ))}
            </div>
          ) : cardioTemplates?.length ? (
            cardioTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={() => handleStartCardio(template.id)}
              />
            ))
          ) : (
            <Card variant="outlined">
              <CardContent className="py-6 text-center">
                <p className="text-[var(--color-text-muted)]">No cardio workouts available.</p>
              </CardContent>
            </Card>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="Mobility"
          icon={Activity}
          iconColor={CATEGORY_DEFAULTS.mobility.color}
          defaultOpen={false}
        >
          {mobilityLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-[var(--radius-xl)] skeleton" />
              ))}
            </div>
          ) : mobilityTemplates?.length ? (
            mobilityTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={() => handleStartMobility(template.id)}
              />
            ))
          ) : (
            <Card variant="outlined">
              <CardContent className="py-6 text-center">
                <p className="text-[var(--color-text-muted)]">No mobility workouts available.</p>
              </CardContent>
            </Card>
          )}
        </CollapsibleSection>

        {/* Recent Activity */}
        {recentSessions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[var(--color-text)]">Recent Activity</h2>
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
                        {getWorkoutDisplayName(session.workout_day?.name)}
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
      </div>
    </AppShell>
  )
}
