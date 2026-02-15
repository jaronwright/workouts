import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Play, TrendingUp, ChevronRight, Flame, Trophy, Calendar,
  Heart, X, BookOpen
} from 'lucide-react'
import { AppShell } from '@/components/layout'
import { Button } from '@/components/ui'
import { ScheduleWidget } from '@/components/workout'
import {
  FadeIn, StaggerList, StaggerItem, AnimatedNumber,
  PressableButton, PressableCard, FadeInOnScroll
} from '@/components/motion'

import { OnboardingWizard } from '@/components/onboarding'
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

            {/* Today's Workout — Cinematic Hero Card */}
            <FadeIn direction="up" delay={0.1}>
              <div className="mt-[var(--space-5)]">
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

        {/* ─── STAT PILLS — number-forward, JetBrains Mono ─── */}
        <FadeIn direction="up" delay={0.15}>
          <section className="mb-[var(--space-6)]">
            <div className="flex gap-[var(--space-3)]">
              {/* Streak — yellow glow when active */}
              <PressableCard onClick={() => navigate('/history')} className="flex-1 cursor-pointer">
                <div
                  className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)] text-center border border-[var(--color-border)]"
                  style={streak > 0 ? { boxShadow: '0 0 16px rgba(232, 255, 0, 0.08)', borderColor: 'rgba(232, 255, 0, 0.15)' } : undefined}
                >
                  {statsLoading ? (
                    <div className="h-7 w-8 mx-auto rounded-[var(--radius-sm)] skeleton" />
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
              </PressableCard>

              {/* This Week */}
              <PressableCard onClick={() => navigate('/history')} className="flex-1 cursor-pointer">
                <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)] text-center border border-[var(--color-border)]">
                  {statsLoading ? (
                    <div className="h-7 w-8 mx-auto rounded-[var(--radius-sm)] skeleton" />
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
              </PressableCard>

              {/* Total */}
              <PressableCard onClick={() => navigate('/history')} className="flex-1 cursor-pointer">
                <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)] text-center border border-[var(--color-border)]">
                  {statsLoading ? (
                    <div className="h-7 w-8 mx-auto rounded-[var(--radius-sm)] skeleton" />
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
              </PressableCard>
            </div>
          </section>
        </FadeIn>

        {/* ─── EXERCISE LIBRARY LINK ─── */}
        <FadeIn direction="up" delay={0.2}>
          <section className="mb-[var(--space-6)]">
            <PressableCard onClick={() => navigate('/exercises')} className="cursor-pointer">
              <div className="
                flex items-center gap-[var(--space-4)] p-[var(--space-4)]
                bg-[var(--color-surface)] border border-[var(--color-border)]
                rounded-[var(--radius-xl)] shadow-[var(--shadow-xs)]
              ">
                <div
                  className="w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--color-tertiary), #3DBDB4)' }}
                >
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text)]">
                    Exercise Library
                  </p>
                  <p className="text-[var(--text-xs)] text-[var(--color-text-muted)]">
                    Browse 1300+ exercises with demos &amp; instructions
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
              </div>
            </PressableCard>
          </section>
        </FadeIn>

        {/* ─── RECENT ACTIVITY ─── */}
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
              <StaggerList className="space-y-[var(--space-1)]">
                {recentActivity.map((item, idx) => {
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
                        <div
                          className="flex items-center gap-[var(--space-3)] py-[var(--space-3)] pl-[var(--space-3)]"
                          style={idx === 0 ? { borderLeft: '2px solid var(--color-primary)' } : undefined}
                        >
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
