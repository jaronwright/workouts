import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Fire, Trophy, Calendar } from '@phosphor-icons/react'
import { AppShell } from '@/components/layout'
import { ScheduleWidget } from '@/components/workout'
import { WeatherCard } from '@/components/weather'
import { FadeIn, AnimatedNumber, PressableCard } from '@/components/motion'

import { OnboardingWizard } from '@/components/onboarding'
import { useActiveSession, useUserSessions, useDeleteSession } from '@/hooks/useWorkoutSession'
import { useProfile } from '@/hooks/useProfile'
import { useUserSchedule } from '@/hooks/useSchedule'
import { useUserTemplateWorkouts } from '@/hooks/useTemplateWorkout'
import { useToast } from '@/hooks/useToast'
import type { SessionWithDay } from '@/services/workoutService'
import type { TemplateWorkoutSession } from '@/services/templateWorkoutService'

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
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-card)]">
                <div className="flex divide-x divide-[var(--color-border)]">
                  {/* Streak */}
                  <div className="flex-1 flex flex-col items-center py-[var(--space-4)] relative">
                    {streak > 0 && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(circle at 50% 30%, var(--color-primary-glow) 0%, transparent 70%)' }}
                      />
                    )}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mb-[var(--space-2)]"
                      style={{ backgroundColor: streak > 0 ? 'var(--color-primary-glow)' : 'var(--color-surface-hover)' }}
                    >
                      <Fire
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

      </div>

      {/* Onboarding Wizard */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </AppShell>
  )
}
