import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight, Flame, Trophy, Calendar,
  Heart, Dumbbell, Activity, Target
} from 'lucide-react'
import { AppShell } from '@/components/layout'
import { ScheduleWidget } from '@/components/workout'
import { WeatherCard } from '@/components/weather'
import {
  FadeIn, StaggerList, StaggerItem, AnimatedNumber,
  PressableButton, PressableCard, FadeInOnScroll
} from '@/components/motion'

import { OnboardingWizard } from '@/components/onboarding'
import { useBodyPartList } from '@/hooks/useExerciseLibrary'
import { useActiveSession, useUserSessions, useDeleteSession } from '@/hooks/useWorkoutSession'
import { useProfile } from '@/hooks/useProfile'
import { useUserSchedule } from '@/hooks/useSchedule'
import { useUserTemplateWorkouts } from '@/hooks/useTemplateWorkout'
import { useToast } from '@/hooks/useToast'
import { formatRelativeTime } from '@/utils/formatters'
import { getWorkoutDisplayName } from '@/config/workoutConfig'
import type { SessionWithDay } from '@/services/workoutService'
import type { TemplateWorkoutSession } from '@/services/templateWorkoutService'

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

// Time-of-day greeting
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomePage() {
  const navigate = useNavigate()
  const { data: activeSession } = useActiveSession()
  const deleteSession = useDeleteSession()
  const { data: sessions, isLoading: sessionsLoading } = useUserSessions()
  const { data: profile } = useProfile()
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

  // Handlers
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

  const { data: bodyParts } = useBodyPartList()
  const firstName = profile?.display_name?.split(' ')[0]

  return (
    <AppShell title="Home">
      <div className="px-[var(--space-4)] pt-[var(--space-6)] pb-[var(--space-4)]">

        {/* ─── HERO SECTION ─── */}
        <FadeIn direction="up">
          <section className="mb-[var(--space-6)]">
            {/* Greeting — large Syne heading with yellow accent */}
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
                <span className="text-[var(--color-primary)]">.</span>
              </h1>
            )}

            {/* Today's Workout — Cinematic Hero Card (includes active session state) */}
            <FadeIn direction="up" delay={0.1}>
              <div className="mt-[var(--space-5)]">
                <ScheduleWidget
                  onSetupSchedule={() => setShowOnboarding(true)}
                  activeSession={activeSession}
                  onContinueSession={handleContinueWorkout}
                  onDismissSession={handleDismissSession}
                />
              </div>
            </FadeIn>
          </section>
        </FadeIn>

        {/* ─── WEATHER ─── */}
        <section className="mb-[var(--space-6)]">
          <WeatherCard />
        </section>

        {/* ─── STATS — icon-led, unified surface ─── */}
        <FadeIn direction="up" delay={0.15}>
          <section className="mb-[var(--space-6)]">
            <PressableCard onClick={() => navigate('/history')} className="cursor-pointer">
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] overflow-hidden">
                <div className="flex divide-x divide-[var(--color-border)]">
                  {/* Streak */}
                  <div className="flex-1 flex flex-col items-center py-[var(--space-4)] relative">
                    {streak > 0 && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(204, 255, 0, 0.06) 0%, transparent 70%)' }}
                      />
                    )}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mb-[var(--space-2)]"
                      style={{ backgroundColor: streak > 0 ? 'rgba(204, 255, 0, 0.12)' : 'var(--color-surface-hover)' }}
                    >
                      <Flame
                        className="w-4 h-4"
                        style={{ color: streak > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                      />
                    </div>
                    {statsLoading ? (
                      <div className="h-7 w-8 rounded-[var(--radius-sm)] skeleton" />
                    ) : (
                      <AnimatedNumber
                        value={streak}
                        className="text-[var(--text-2xl)] font-bold text-[var(--color-text)] font-mono-stats block leading-none"
                      />
                    )}
                    <p
                      className="text-[10px] text-[var(--color-text-muted)] mt-1 uppercase font-medium"
                      style={{ letterSpacing: 'var(--tracking-widest)' }}
                    >
                      streak
                    </p>
                  </div>

                  {/* This Week */}
                  <div className="flex-1 flex flex-col items-center py-[var(--space-4)]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mb-[var(--space-2)] bg-[var(--color-surface-hover)]">
                      <Calendar className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </div>
                    {statsLoading ? (
                      <div className="h-7 w-8 rounded-[var(--radius-sm)] skeleton" />
                    ) : (
                      <AnimatedNumber
                        value={thisWeek}
                        className="text-[var(--text-2xl)] font-bold text-[var(--color-text)] font-mono-stats block leading-none"
                      />
                    )}
                    <p
                      className="text-[10px] text-[var(--color-text-muted)] mt-1 uppercase font-medium"
                      style={{ letterSpacing: 'var(--tracking-widest)' }}
                    >
                      this week
                    </p>
                  </div>

                  {/* Total */}
                  <div className="flex-1 flex flex-col items-center py-[var(--space-4)]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mb-[var(--space-2)] bg-[var(--color-surface-hover)]">
                      <Trophy className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </div>
                    {statsLoading ? (
                      <div className="h-7 w-8 rounded-[var(--radius-sm)] skeleton" />
                    ) : (
                      <AnimatedNumber
                        value={totalWorkouts}
                        className="text-[var(--text-2xl)] font-bold text-[var(--color-text)] font-mono-stats block leading-none"
                      />
                    )}
                    <p
                      className="text-[10px] text-[var(--color-text-muted)] mt-1 uppercase font-medium"
                      style={{ letterSpacing: 'var(--tracking-widest)' }}
                    >
                      total
                    </p>
                  </div>
                </div>
              </div>
            </PressableCard>
          </section>
        </FadeIn>

        {/* ─── EXPLORE EXERCISES ─── */}
        {bodyParts && bodyParts.length > 0 && (
          <FadeInOnScroll direction="up">
            <section className="mb-[var(--space-6)]">
              <div className="flex items-center justify-between mb-[var(--space-3)]">
                <h2
                  className="text-[var(--text-xs)] uppercase font-medium text-[var(--color-text-muted)]"
                  style={{ letterSpacing: 'var(--tracking-widest)' }}
                >
                  Explore Exercises
                </h2>
                <PressableButton
                  onClick={() => navigate('/exercises')}
                  className="text-[var(--text-xs)] font-semibold text-[var(--color-primary)] flex items-center gap-0.5"
                >
                  Browse All
                  <ChevronRight className="w-3.5 h-3.5" />
                </PressableButton>
              </div>
              <div className="flex gap-[var(--space-2)] overflow-x-auto pb-1 -mx-[var(--space-4)] px-[var(--space-4)] snap-x">
                {bodyParts.map((part) => (
                  <PressableCard
                    key={part}
                    onClick={() => navigate(`/exercises?bodyPart=${encodeURIComponent(part)}`)}
                    className="cursor-pointer flex-shrink-0 snap-start"
                  >
                    <div className="w-28 bg-[var(--color-surface)] rounded-[var(--radius-lg)] px-[var(--space-3)] py-[var(--space-3)] flex flex-col items-center gap-[var(--space-2)]">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(204, 255, 0, 0.1)' }}
                      >
                        <Target className="w-5 h-5 text-[var(--color-primary)]" />
                      </div>
                      <span className="text-[var(--text-xs)] font-medium text-[var(--color-text)] capitalize text-center leading-tight">
                        {part}
                      </span>
                    </div>
                  </PressableCard>
                ))}
              </div>
            </section>
          </FadeInOnScroll>
        )}

        {/* ─── RECENT ACTIVITY — community feed style ─── */}
        {recentActivity.length > 0 && (
          <FadeInOnScroll direction="up">
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
              <StaggerList className="space-y-[var(--space-2)]">
                {recentActivity.map((item) => {
                  const isWeights = item.kind === 'weights'
                  const session = item.session
                  const name = isWeights
                    ? getWorkoutDisplayName((session as SessionWithDay).workout_day?.name ?? 'Workout')
                    : (session as TemplateWorkoutSession).template?.name || 'Workout'
                  const historyPath = isWeights
                    ? `/history/${session.id}`
                    : `/history/cardio/${session.id}`

                  // Workout type icon + color — matches community feed pattern
                  const templateType = !isWeights
                    ? (session as TemplateWorkoutSession).template?.type
                    : undefined
                  const { IconComp, iconColor } = isWeights
                    ? { IconComp: Dumbbell, iconColor: 'var(--color-weights)' }
                    : templateType === 'mobility'
                      ? { IconComp: Activity, iconColor: 'var(--color-mobility)' }
                      : { IconComp: Heart, iconColor: 'var(--color-cardio)' }

                  // Duration from completed_at - started_at
                  const durationMin = session.completed_at
                    ? Math.round((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000)
                    : null

                  return (
                    <StaggerItem key={session.id}>
                      <PressableCard onClick={() => navigate(historyPath)} className="cursor-pointer">
                        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)]">
                          <div className="flex items-center gap-[var(--space-3)]">
                            {/* Workout type icon — tinted background like community cards */}
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${iconColor}20` }}
                            >
                              <IconComp className="w-5 h-5" style={{ color: iconColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text)] truncate">
                                  {name}
                                </p>
                                <span className="text-[var(--text-xs)] text-[var(--color-text-muted)] opacity-70 shrink-0 ml-2">
                                  {formatRelativeTime(session.completed_at || session.started_at)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {durationMin && durationMin > 0 && (
                                  <span className="text-[var(--text-xs)] text-[var(--color-text-muted)]">
                                    {durationMin} min
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </PressableCard>
                    </StaggerItem>
                  )
                })}
              </StaggerList>
            </section>
          </FadeInOnScroll>
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
