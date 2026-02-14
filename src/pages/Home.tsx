import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Play, TrendingUp, ChevronRight, Flame, Trophy, Calendar,
  Heart, X, Dumbbell, Activity, Wind as WindIcon
} from 'lucide-react'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { CardioLogCard, ScheduleWidget } from '@/components/workout'
import { WeatherCard } from '@/components/weather'
import {
  FadeIn, StaggerList, StaggerItem, AnimatedNumber, PressableButton, PressableCard
} from '@/components/motion'

import { OnboardingWizard } from '@/components/onboarding'
import { useActiveSession, useUserSessions, useDeleteSession } from '@/hooks/useWorkoutSession'
import { useProfile } from '@/hooks/useProfile'
import { useCycleDay } from '@/hooks/useCycleDay'
import { useSelectedPlanDays } from '@/hooks/useWorkoutPlan'
import { useWorkoutTemplatesByType, useUserSchedule } from '@/hooks/useSchedule'
import { useMobilityCategories } from '@/hooks/useMobilityTemplates'
import { useUserTemplateWorkouts } from '@/hooks/useTemplateWorkout'
import { useToast } from '@/hooks/useToast'
import { formatRelativeTime } from '@/utils/formatters'
import { springPresets } from '@/config/animationConfig'
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

// Time-of-day greeting
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// Workout Day Card Component (compact row style)
interface WorkoutDayCardProps {
  day: { id: string; name: string; day_number: number }
  onClick: () => void
  delay?: number
  subtitle?: string
}

function WorkoutDayCard({ day, onClick, delay = 0 }: WorkoutDayCardProps) {
  const style = getWeightsStyleByName(day.name)
  const Icon = style.icon

  return (
    <PressableCard onClick={onClick} className="cursor-pointer">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springPresets.smooth, delay }}
        className="flex items-center gap-[var(--space-3)] py-[var(--space-3)]"
      >
        <div
          className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${style.color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: style.color }} strokeWidth={2} />
        </div>
        <p className="flex-1 text-[var(--text-sm)] font-semibold text-[var(--color-text)] truncate">
          {getWorkoutDisplayName(day.name)}
        </p>
        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
      </motion.div>
    </PressableCard>
  )
}

// Template Card Component (compact row style)
interface TemplateCardProps {
  template: WorkoutTemplate
  onClick: () => void
  delay?: number
  subtitle?: string
}

function TemplateCard({ template, onClick, delay = 0 }: TemplateCardProps) {
  const style = template.type === 'cardio'
    ? getCardioStyle(template.category)
    : getMobilityStyle(template.category)
  const Icon = style.icon

  return (
    <PressableCard onClick={onClick} className="cursor-pointer">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springPresets.smooth, delay }}
        className="flex items-center gap-[var(--space-3)] py-[var(--space-3)]"
      >
        <div
          className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${style.color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: style.color }} strokeWidth={2} />
        </div>
        <p className="flex-1 text-[var(--text-sm)] font-semibold text-[var(--color-text)] truncate">
          {template.name}
        </p>
        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
      </motion.div>
    </PressableCard>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { data: activeSession } = useActiveSession()
  const deleteSession = useDeleteSession()
  const { data: sessions, isLoading: sessionsLoading } = useUserSessions()
  const { data: profile } = useProfile()
  const currentCycleDay = useCycleDay()
  const { data: days, isLoading: daysLoading } = useSelectedPlanDays()
  const { data: cardioTemplates, isLoading: cardioLoading } = useWorkoutTemplatesByType('cardio')
  const { data: mobilityCategories, isLoading: mobilityLoading } = useMobilityCategories()
  const { data: schedule, isLoading: scheduleLoading } = useUserSchedule()
  const { data: templateWorkoutSessions, isLoading: templateSessionsLoading } = useUserTemplateWorkouts()
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

  const firstName = profile?.display_name?.split(' ')[0]

  return (
    <AppShell title="Home">
      <div className="px-[var(--space-4)] pt-[var(--space-6)] pb-[var(--space-4)]">

        {/* ─── HERO SECTION ─── */}
        <FadeIn direction="up">
          <section className="mb-[var(--space-8)]">
            {/* Greeting */}
            <p
              className="text-[var(--text-xs)] uppercase font-medium text-[var(--color-text-muted)]"
              style={{ letterSpacing: 'var(--tracking-widest)' }}
            >
              {getGreeting()}{firstName ? ',' : ''}
            </p>
            {firstName && (
              <h1
                className="text-[var(--text-4xl)] font-extrabold text-[var(--color-text)] mt-[var(--space-1)]"
                style={{ fontFamily: 'var(--font-heading)', lineHeight: 'var(--leading-tight)' }}
              >
                {firstName}
              </h1>
            )}

            {/* Today's Workout Hero Card */}
            <FadeIn direction="up" delay={0.1}>
              <div className="mt-[var(--space-6)]">
                <ScheduleWidget onSetupSchedule={() => setShowOnboarding(true)} />
              </div>
            </FadeIn>
          </section>
        </FadeIn>

        {/* ─── ACTIVE SESSION BANNER ─── */}
        {activeSession && (
          <FadeIn direction="up" delay={0.05}>
            <section className="mb-[var(--space-6)]">
              <div
                className="rounded-[var(--radius-xl)] px-[var(--space-4)] py-[var(--space-4)] relative overflow-hidden"
                style={{ background: 'var(--gradient-hero)' }}
              >
                <div className="warm-glow" />
                <div className="flex items-center gap-[var(--space-4)] relative z-10">
                  <div
                    className="w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--color-success), #10b981)' }}
                  >
                    <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[var(--text-xs)] font-semibold uppercase"
                      style={{ color: 'var(--color-success)', letterSpacing: 'var(--tracking-wider)' }}
                    >
                      In Progress
                    </p>
                    <p className="text-[var(--text-base)] font-bold text-[var(--color-text)]">
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
              </div>
            </section>
          </FadeIn>
        )}

        {/* ─── STAT PILLS (horizontal scroll) ─── */}
        <FadeIn direction="up" delay={0.15}>
          <section className="mb-[var(--space-6)]">
            <div className="flex gap-[var(--space-3)] overflow-x-auto pb-[var(--space-1)]">
              {/* Streak */}
              <div className="flex items-center gap-[var(--space-2)] bg-[var(--color-surface)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)] shrink-0">
                <Flame className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                <div>
                  {statsLoading ? (
                    <div className="h-5 w-6 rounded-[var(--radius-sm)] skeleton" />
                  ) : (
                    <AnimatedNumber
                      value={streak}
                      className="text-[var(--text-lg)] font-bold text-[var(--color-text)] font-mono-stats block leading-none"
                    />
                  )}
                  <p
                    className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-0.5"
                    style={{ letterSpacing: 'var(--tracking-wider)' }}
                  >
                    streak
                  </p>
                </div>
              </div>

              {/* This Week */}
              <PressableCard onClick={() => navigate('/history')} className="cursor-pointer shrink-0">
                <div className="flex items-center gap-[var(--space-2)] bg-[var(--color-surface)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)]">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--color-weights)' }} />
                  <div>
                    {statsLoading ? (
                      <div className="h-5 w-6 rounded-[var(--radius-sm)] skeleton" />
                    ) : (
                      <AnimatedNumber
                        value={thisWeek}
                        className="text-[var(--text-lg)] font-bold text-[var(--color-text)] font-mono-stats block leading-none"
                      />
                    )}
                    <p
                      className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-0.5"
                      style={{ letterSpacing: 'var(--tracking-wider)' }}
                    >
                      week
                    </p>
                  </div>
                </div>
              </PressableCard>

              {/* Total */}
              <PressableCard onClick={() => navigate('/history')} className="cursor-pointer shrink-0">
                <div className="flex items-center gap-[var(--space-2)] bg-[var(--color-surface)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)]">
                  <Trophy className="w-4 h-4" style={{ color: 'var(--color-tertiary)' }} />
                  <div>
                    {statsLoading ? (
                      <div className="h-5 w-6 rounded-[var(--radius-sm)] skeleton" />
                    ) : (
                      <AnimatedNumber
                        value={totalWorkouts}
                        className="text-[var(--text-lg)] font-bold text-[var(--color-text)] font-mono-stats block leading-none"
                      />
                    )}
                    <p
                      className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-0.5"
                      style={{ letterSpacing: 'var(--tracking-wider)' }}
                    >
                      total
                    </p>
                  </div>
                </div>
              </PressableCard>
            </div>
          </section>
        </FadeIn>

        {/* ─── WEATHER (compact) ─── */}
        <FadeIn direction="up" delay={0.2}>
          <section className="mb-[var(--space-6)]">
            <WeatherCard />
          </section>
        </FadeIn>

        {/* ─── QUICK SELECT ─── */}
        <FadeIn direction="up" delay={0.25}>
          <section className="mb-[var(--space-6)]">
            {/* Category pill buttons */}
            <div className="flex gap-[var(--space-2)] mb-[var(--space-4)]">
              {(['weights', 'cardio', 'mobility'] as const).map((cat) => {
                const cfg = CATEGORY_DEFAULTS[cat]
                const Icon = cfg.icon
                const isActive = activeQuickTab === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveQuickTab(cat)}
                    className="flex items-center gap-[var(--space-2)] rounded-[var(--radius-full)] px-[var(--space-4)] py-[var(--space-2)] text-[var(--text-xs)] font-semibold transition-all"
                    style={{
                      backgroundColor: isActive ? `${cfg.color}18` : 'var(--color-surface)',
                      color: isActive ? cfg.color : 'var(--color-text-muted)',
                      border: `1.5px solid ${isActive ? cfg.color : 'var(--color-border)'}`,
                      letterSpacing: 'var(--tracking-wide)',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {CATEGORY_LABELS[cat]}
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeQuickTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={springPresets.smooth}
                className="space-y-[var(--space-1)]"
              >
                {activeQuickTab === 'weights' && (
                  daysLoading ? (
                    <div className="space-y-[var(--space-3)]">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-14 rounded-[var(--radius-lg)] skeleton" />
                      ))}
                    </div>
                  ) : days?.length ? (
                    days.map((day, idx) => (
                      <WorkoutDayCard
                        key={day.id}
                        day={day}
                        onClick={() => handleStartWorkout(day.id)}
                        delay={idx * 0.04}
                        subtitle={getWeightsSessionSummary(day.id, weightsSessions)}
                      />
                    ))
                  ) : (
                    <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] py-[var(--space-4)]">
                      No weight workouts found.
                    </p>
                  )
                )}

                {activeQuickTab === 'cardio' && (
                  cardioLoading ? (
                    <div className="space-y-[var(--space-3)]">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-14 rounded-[var(--radius-lg)] skeleton" />
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
                        delay={idx * 0.04}
                      />
                    ))
                  ) : (
                    <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] py-[var(--space-4)]">
                      No cardio workouts available.
                    </p>
                  )
                )}

                {activeQuickTab === 'mobility' && (
                  mobilityLoading ? (
                    <div className="space-y-[var(--space-3)]">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-14 rounded-[var(--radius-lg)] skeleton" />
                      ))}
                    </div>
                  ) : mobilityCategories?.length ? (
                    mobilityCategories.map(({ category, template }, idx) => (
                      <TemplateCard
                        key={category}
                        template={template}
                        onClick={() => handleStartMobility(category)}
                        delay={idx * 0.04}
                        subtitle={getMobilityCategorySummary(category, templateSessions)}
                      />
                    ))
                  ) : (
                    <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] py-[var(--space-4)]">
                      No mobility workouts available.
                    </p>
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </FadeIn>

        {/* ─── RECENT ACTIVITY ─── */}
        {recentActivity.length > 0 && (
          <FadeIn direction="up" delay={0.3}>
            <section>
              <div className="flex items-center justify-between mb-[var(--space-3)]">
                <h2
                  className="text-[var(--text-xs)] uppercase font-medium text-[var(--color-text-muted)]"
                  style={{ letterSpacing: 'var(--tracking-widest)' }}
                >
                  Recent
                </h2>
                <PressableButton
                  onClick={() => navigate('/history')}
                  className="text-[var(--text-xs)] font-semibold text-[var(--color-primary)] flex items-center gap-0.5"
                >
                  See All
                  <ChevronRight className="w-3.5 h-3.5" />
                </PressableButton>
              </div>
              <StaggerList className="space-y-[var(--space-1)]">
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

                  return (
                    <StaggerItem key={session.id}>
                      <PressableCard onClick={() => navigate(historyPath)} className="cursor-pointer">
                        <div className="flex items-center gap-[var(--space-3)] py-[var(--space-3)]">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              background: isWeights
                                ? 'linear-gradient(135deg, var(--color-success), #10b981)'
                                : 'linear-gradient(135deg, var(--color-tertiary), #3DBDB4)'
                            }}
                          >
                            <IconComp className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text)] truncate">
                              {name}
                            </p>
                            <p className="text-[var(--text-xs)] text-[var(--color-text-muted)]">
                              {formatRelativeTime(session.started_at)}
                            </p>
                          </div>
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: 'var(--color-success)' }}
                          />
                        </div>
                      </PressableCard>
                    </StaggerItem>
                  )
                })}
              </StaggerList>
            </section>
          </FadeIn>
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
