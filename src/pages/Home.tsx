import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Play, TrendingUp, ChevronRight, Flame, Trophy, Calendar,
  Dumbbell, Heart, Activity, X
} from 'lucide-react'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent, AnimatedCard, AnimatedCounter, Badge } from '@/components/ui'
import { CardioLogCard, ScheduleWidget } from '@/components/workout'
import { WeatherCard } from '@/components/weather'
import { WeeklyReviewCard } from '@/components/review/WeeklyReviewCard'
import { OnboardingWizard } from '@/components/onboarding'
import { useActiveSession, useUserSessions, useDeleteSession } from '@/hooks/useWorkoutSession'
import { useProfile } from '@/hooks/useProfile'
import { useCycleDay } from '@/hooks/useCycleDay'
import { useSelectedPlanDays } from '@/hooks/useWorkoutPlan'
import { useWorkoutTemplatesByType, useUserSchedule } from '@/hooks/useSchedule'
import { useMobilityCategories } from '@/hooks/useMobilityTemplates'
import { useUserTemplateWorkouts } from '@/hooks/useTemplateWorkout'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useToast } from '@/hooks/useToast'
import { formatRelativeTime } from '@/utils/formatters'
import { staggerContainer, staggerChild } from '@/config/animationConfig'
import {
  getWorkoutDisplayName,
  getCardioStyle,
  getMobilityStyle,
  getWeightsStyleByName,
  CATEGORY_DEFAULTS,
  CATEGORY_LABELS
} from '@/config/workoutConfig'
import type { SessionWithDay } from '@/services/workoutService'
import type { TemplateWorkoutSession } from '@/services/templateWorkoutService'
import type { WorkoutTemplate } from '@/services/scheduleService'

// Unified session type for stats and recent activity
type RecentSession =
  | { kind: 'weights'; session: SessionWithDay }
  | { kind: 'template'; session: TemplateWorkoutSession }

// Calculate streak from sessions
function calculateStreak(sessions: { completed_at: string | null }[]): number {
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
function getWeeklyCount(sessions: { completed_at: string | null }[]): number {
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

// Get session summary for a weights workout day
function getWeightsSessionSummary(dayId: string, sessions: SessionWithDay[]): string | undefined {
  const completed = sessions.filter(s => s.workout_day_id === dayId && s.completed_at)
  if (completed.length === 0) return undefined
  return `${completed.length} session${completed.length !== 1 ? 's' : ''} completed`
}

// Get session summary for a mobility category (matches all duration variants)
function getMobilityCategorySummary(category: string, sessions: TemplateWorkoutSession[]): string | undefined {
  const completed = sessions.filter(s => s.completed_at && s.template?.category === category)
  if (completed.length === 0) return undefined
  return `${completed.length} session${completed.length !== 1 ? 's' : ''} completed`
}

// Workout Day Card Component
interface WorkoutDayCardProps {
  day: { id: string; name: string; day_number: number }
  onClick: () => void
  delay?: number
  subtitle?: string
}

function WorkoutDayCard({ day, onClick, delay = 0, subtitle }: WorkoutDayCardProps) {
  const style = getWeightsStyleByName(day.name)
  const Icon = style.icon

  return (
    <AnimatedCard interactive onClick={onClick} animationDelay={delay}>
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className={`w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--color-text)] text-base leading-tight">
            {getWorkoutDisplayName(day.name)}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
            {subtitle || 'No sessions yet'}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-text-muted)]">
          <ChevronRight className="w-5 h-5" />
        </div>
      </CardContent>
    </AnimatedCard>
  )
}

// Template Card Component
interface TemplateCardProps {
  template: WorkoutTemplate
  onClick: () => void
  delay?: number
  subtitle?: string
}

function TemplateCard({ template, onClick, delay = 0, subtitle }: TemplateCardProps) {
  const style = template.type === 'cardio'
    ? getCardioStyle(template.category)
    : getMobilityStyle(template.category)
  const Icon = style.icon

  return (
    <AnimatedCard interactive onClick={onClick} animationDelay={delay}>
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className={`w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--color-text)] text-base leading-tight">
            {template.name}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
            {subtitle || 'No sessions yet'}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-text-muted)]">
          <ChevronRight className="w-5 h-5" />
        </div>
      </CardContent>
    </AnimatedCard>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { data: activeSession } = useActiveSession()
  const deleteSession = useDeleteSession()
  const { data: sessions, isLoading: sessionsLoading } = useUserSessions()
  useProfile() // keep hook for TanStack Query cache priming
  const currentCycleDay = useCycleDay()
  const { data: days, isLoading: daysLoading } = useSelectedPlanDays()
  const { data: cardioTemplates, isLoading: cardioLoading } = useWorkoutTemplatesByType('cardio')
  const { data: mobilityCategories, isLoading: mobilityLoading } = useMobilityCategories()
  const { data: schedule, isLoading: scheduleLoading } = useUserSchedule()
  const { data: templateWorkoutSessions, isLoading: templateSessionsLoading } = useUserTemplateWorkouts()
  const prefersReduced = useReducedMotion()
  const toast = useToast()

  // Onboarding wizard state
  const [showOnboarding, setShowOnboarding] = useState(false)
  const hasAttemptedAutoOpen = useRef(false)

  // Auto-open onboarding when schedule is empty (after initial load)
  useEffect(() => {
    if (scheduleLoading || hasAttemptedAutoOpen.current) return

    hasAttemptedAutoOpen.current = true
    const hasEmptySchedule = !schedule || schedule.length === 0
    if (hasEmptySchedule) {
      // Use setTimeout to defer state update and avoid cascading render warning
      const timeoutId = setTimeout(() => setShowOnboarding(true), 0)
      return () => clearTimeout(timeoutId)
    }
  }, [schedule, scheduleLoading])

  const weightsSessions = (sessions || []) as SessionWithDay[]
  const templateSessions = (templateWorkoutSessions || []) as TemplateWorkoutSession[]

  // Merge all session types for stats
  const allCompleted: { completed_at: string | null }[] = [
    ...weightsSessions,
    ...templateSessions
  ]

  // Merge recent activity from both session types, sorted by most recent
  const recentActivity: RecentSession[] = [
    ...weightsSessions.map(s => ({ kind: 'weights' as const, session: s })),
    ...templateSessions.map(s => ({ kind: 'template' as const, session: s }))
  ]
    .filter(r => r.session.completed_at)
    .sort((a, b) => new Date(b.session.completed_at!).getTime() - new Date(a.session.completed_at!).getTime())
    .slice(0, 3)

  // Stats
  const streak = calculateStreak(allCompleted)
  const thisWeek = getWeeklyCount(allCompleted)
  const totalWorkouts = allCompleted.filter(s => s.completed_at).length
  const statsLoading = sessionsLoading || templateSessionsLoading

  // Quick Select tab state
  const [activeQuickTab, setActiveQuickTab] = useState<'weights' | 'cardio' | 'mobility'>('weights')

  // Handlers
  const handleStartWorkout = (dayId: string) => navigate(`/workout/${dayId}`)
  const handleStartMobility = (category: string) => {
    navigate(`/mobility/${category}/select`)
  }
  const handleContinueWorkout = () => {
    if (activeSession) {
      navigate(`/workout/${activeSession.workout_day_id}/active`)
    }
  }
  const handleDismissSession = () => {
    if (activeSession) {
      deleteSession.mutate(activeSession.id, {
        onError: () => {
          toast.error('Failed to dismiss session. Please try again.')
        }
      })
    }
  }

  return (
    <AppShell title="Home">
      <div className="p-4 space-y-5 pb-4">
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
                    {getWorkoutDisplayName(activeSession.workout_day?.name ?? 'Workout')}
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
        <ScheduleWidget onSetupSchedule={() => setShowOnboarding(true)} />

        {/* Weather */}
        <WeatherCard />

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-3 gap-3"
          variants={staggerContainer}
          initial={prefersReduced ? false : 'hidden'}
          animate="visible"
        >
          <motion.div variants={staggerChild}>
            <Card className="overflow-hidden">
              <CardContent className="py-3 px-2 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
                <div className="relative">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  {statsLoading ? (
                    <div className="h-7 w-8 mx-auto mb-0.5 rounded bg-[var(--color-surface-hover)] animate-pulse" />
                  ) : (
                    <AnimatedCounter value={streak} className="text-2xl font-bold text-[var(--color-text)] block" />
                  )}
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Streak</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerChild}>
            <Card
              className="overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => navigate('/history')}
            >
              <CardContent className="py-3 px-2 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                <div className="relative">
                  <Calendar className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                  {statsLoading ? (
                    <div className="h-7 w-8 mx-auto mb-0.5 rounded bg-[var(--color-surface-hover)] animate-pulse" />
                  ) : (
                    <AnimatedCounter value={thisWeek} className="text-2xl font-bold text-[var(--color-text)] block" />
                  )}
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">This Week</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerChild}>
            <Card
              className="overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => navigate('/history')}
            >
              <CardContent className="py-3 px-2 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />
                <div className="relative">
                  <Trophy className="w-5 h-5 text-violet-500 mx-auto mb-1" />
                  {statsLoading ? (
                    <div className="h-7 w-8 mx-auto mb-0.5 rounded bg-[var(--color-surface-hover)] animate-pulse" />
                  ) : (
                    <AnimatedCounter value={totalWorkouts} className="text-2xl font-bold text-[var(--color-text)] block" />
                  )}
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Total</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Weekly Review Summary */}
        <WeeklyReviewCard weekStart={(() => {
          const now = new Date()
          const d = new Date(now)
          d.setDate(now.getDate() - now.getDay())
          d.setHours(0, 0, 0, 0)
          return d
        })()} />

        {/* Quick Select Workouts */}
        <section className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
            Quick Select
          </p>

          {/* Category Tab Circles */}
          <div className="flex items-center justify-around">
            {(['weights', 'cardio', 'mobility'] as const).map((cat) => {
              const cfg = CATEGORY_DEFAULTS[cat]
              const Icon = cfg.icon
              const isActive = activeQuickTab === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveQuickTab(cat)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <motion.div
                    className="w-14 h-14 rounded-full flex items-center justify-center border-2"
                    animate={{
                      backgroundColor: isActive ? cfg.bgColor : 'rgba(0, 0, 0, 0)',
                      borderColor: isActive ? cfg.color : 'var(--color-border)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: isActive ? cfg.color : 'var(--color-text-muted)' }}
                    />
                  </motion.div>
                  <span
                    className="text-[10px] font-medium uppercase tracking-wide"
                    style={{ color: isActive ? cfg.color : 'var(--color-text-muted)' }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Tab Content Panel */}
          <AnimatePresence>
            <motion.div
              key={activeQuickTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-3"
            >
              {activeQuickTab === 'weights' && (
                daysLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 rounded-[var(--radius-xl)] skeleton" />
                    ))}
                  </div>
                ) : days?.length ? (
                  days.map((day, idx) => (
                    <WorkoutDayCard
                      key={day.id}
                      day={day}
                      onClick={() => handleStartWorkout(day.id)}
                      delay={idx * 0.06}
                      subtitle={getWeightsSessionSummary(day.id, weightsSessions)}
                    />
                  ))
                ) : (
                  <Card variant="outlined">
                    <CardContent className="py-6 text-center">
                      <p className="text-[var(--color-text-muted)]">No weight workouts found.</p>
                    </CardContent>
                  </Card>
                )
              )}

              {activeQuickTab === 'cardio' && (
                cardioLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-20 rounded-[var(--radius-xl)] skeleton" />
                    ))}
                  </div>
                ) : cardioTemplates?.length ? (
                  cardioTemplates.map((template, idx) => (
                    <CardioLogCard
                      key={template.id}
                      template={template}
                      sessions={templateWorkoutSessions || []}
                      schedule={schedule || []}
                      currentCycleDay={currentCycleDay}
                      delay={idx * 0.06}
                    />
                  ))
                ) : (
                  <Card variant="outlined">
                    <CardContent className="py-6 text-center">
                      <p className="text-[var(--color-text-muted)]">No cardio workouts available.</p>
                    </CardContent>
                  </Card>
                )
              )}

              {activeQuickTab === 'mobility' && (
                mobilityLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-20 rounded-[var(--radius-xl)] skeleton" />
                    ))}
                  </div>
                ) : mobilityCategories?.length ? (
                  mobilityCategories.map(({ category, template }, idx) => (
                    <TemplateCard
                      key={category}
                      template={template}
                      onClick={() => handleStartMobility(category)}
                      delay={idx * 0.06}
                      subtitle={getMobilityCategorySummary(category, templateSessions)}
                    />
                  ))
                ) : (
                  <Card variant="outlined">
                    <CardContent className="py-6 text-center">
                      <p className="text-[var(--color-text-muted)]">No mobility workouts available.</p>
                    </CardContent>
                  </Card>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
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
            <motion.div
              className="space-y-2"
              variants={staggerContainer}
              initial={prefersReduced ? false : 'hidden'}
              animate="visible"
            >
              {recentActivity.map((item) => {
                const isWeights = item.kind === 'weights'
                const session = item.session
                const name = isWeights
                  ? getWorkoutDisplayName((session as SessionWithDay).workout_day?.name ?? 'Workout')
                  : (session as TemplateWorkoutSession).template?.name || 'Workout'
                const historyPath = isWeights
                  ? `/history/${session.id}`
                  : `/history/cardio/${session.id}`
                const IconComp = isWeights ? TrendingUp : Heart
                const gradient = isWeights
                  ? 'from-emerald-400 to-green-500'
                  : 'from-teal-400 to-teal-500'

                return (
                  <motion.div key={session.id} variants={staggerChild}>
                    <AnimatedCard
                      interactive
                      onClick={() => navigate(historyPath)}
                    >
                      <CardContent className="py-3 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                          <IconComp className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--color-text)] text-sm truncate">
                            {name}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {formatRelativeTime(session.started_at)}
                          </p>
                        </div>
                        {session.completed_at && (
                          <Badge variant="completed">Done</Badge>
                        )}
                      </CardContent>
                    </AnimatedCard>
                  </motion.div>
                )
              })}
            </motion.div>
          </section>
        )}
      </div>

      {/* Onboarding Wizard */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </AppShell>
  )
}
