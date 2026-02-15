import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent } from '@/components/ui'
import { StaggerList, StaggerItem, FadeIn } from '@/components/motion'
import { CollapsibleSection, ExerciseCard, RestTimer } from '@/components/workout'
import { PostWorkoutReview } from '@/components/review/PostWorkoutReview'
import { useQueryClient } from '@tanstack/react-query'
import { useWorkoutDay } from '@/hooks/useWorkoutPlan'
import { useStartWorkout, useCompleteWorkout, useLogSet, useDeleteSet, useSessionSets } from '@/hooks/useWorkoutSession'
import { swapPlanExerciseName } from '@/services/workoutService'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useReviewStore } from '@/stores/reviewStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'
import { useWakeLock } from '@/hooks/useWakeLock'
import { getWorkoutDisplayName } from '@/config/workoutConfig'
import { springPresets } from '@/config/animationConfig'

const MOTIVATIONAL_QUOTES = [
  "You got this.",
  "Today you prove yourself.",
  "One rep at a time.",
  "Make it count.",
  "No excuses. Just results.",
  "Stronger than yesterday.",
  "Your only limit is you.",
  "Time to go to work.",
  "Earn it.",
  "Be the hardest worker in the room.",
  "This is your moment.",
  "Pain is temporary. Pride is forever.",
  "Show up. Lift heavy. Repeat.",
  "The iron never lies.",
  "Discipline beats motivation.",
  "You didn't come this far to only come this far.",
  "Trust the process.",
  "Leave nothing in the tank.",
  "Champions train. Losers complain.",
  "Let's get after it.",
]

// Check if a section is a warm-up section (should be collapsible, default closed)
function isWarmupSection(sectionName: string): boolean {
  const name = sectionName.toLowerCase()
  return name.includes('warm') || name.includes('warmup') || name.includes('warm-up')
}

// Format sets/reps in compact mono-friendly format: "4×8-10" or "3×15s"
function formatSetsReps(exercise: {
  sets?: number | null
  reps_min?: number | null
  reps_max?: number | null
  reps_unit?: string | null
  is_per_side?: boolean | null
}): string {
  const parts: string[] = []
  if (exercise.sets) parts.push(`${exercise.sets}×`)
  if (exercise.reps_min) {
    const range = exercise.reps_max && exercise.reps_max !== exercise.reps_min
      ? `${exercise.reps_min}-${exercise.reps_max}`
      : `${exercise.reps_min}`
    parts.push(range)
  }
  if (exercise.reps_unit === 'seconds') parts.push('s')
  if (exercise.is_per_side) parts.push('/side')
  return parts.join('')
}

export function WorkoutPage() {
  const { dayId } = useParams<{ dayId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const queryClient = useQueryClient()
  const toast = useToast()
  const { data: workoutDay, isLoading } = useWorkoutDay(dayId)
  const { mutate: startWorkout, isPending: isStarting } = useStartWorkout()
  const { mutate: completeWorkout, isPending: isCompleting } = useCompleteWorkout()
  const { mutate: logSet } = useLogSet()
  const { mutate: deleteSet } = useDeleteSet()

  const {
    activeSession,
    setActiveSession,
    setActiveWorkoutDay,
    completedSets
  } = useWorkoutStore()

  const { data: sessionSets } = useSessionSets(activeSession?.id)

  useWakeLock(!!activeSession)

  useEffect(() => {
    if (workoutDay) {
      setActiveWorkoutDay(workoutDay)
    }
  }, [workoutDay, setActiveWorkoutDay])

  useEffect(() => {
    if (sessionSets) {
      sessionSets.forEach((set) => {
        const current = useWorkoutStore.getState().completedSets[set.plan_exercise_id] || []
        if (!current.find((s) => s.id === set.id)) {
          useWorkoutStore.getState().addCompletedSet(set.plan_exercise_id, set)
        }
      })
    }
  }, [sessionSets])

  const [showSplash, setShowSplash] = useState(false)
  const [splashQuote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])
  const splashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup splash timer on unmount
  useEffect(() => {
    return () => {
      if (splashTimerRef.current) clearTimeout(splashTimerRef.current)
    }
  }, [])

  const handleStart = useCallback(() => {
    if (!dayId || !user) return
    setShowSplash(true)

    // After splash animation, actually start the workout
    // Network errors are handled by the hook (returns optimistic session)
    splashTimerRef.current = setTimeout(() => {
      startWorkout(dayId, {
        onSuccess: (session) => {
          setActiveSession(session)
          setShowSplash(false)
        },
        onError: () => {
          toast.error('Failed to start workout. Please try again.')
          setShowSplash(false)
        }
      })
    }, 2000)
  }, [dayId, user, startWorkout, setActiveSession, toast])

  const openReview = useReviewStore((s) => s.openReview)

  const handleComplete = () => {
    if (!activeSession) return
    const sessionStartedAt = activeSession.started_at
    completeWorkout(
      { sessionId: activeSession.id },
      {
        onSuccess: () => {
          // Calculate duration for the review
          const durationMinutes = sessionStartedAt
            ? Math.round((Date.now() - new Date(sessionStartedAt).getTime()) / 60000)
            : undefined
          // Open post-workout review instead of navigating home
          openReview({
            sessionId: activeSession.id,
            sessionType: 'weights',
            durationMinutes,
          })
        },
        onError: () => {
          toast.error('Failed to complete workout. Please try again.')
        }
      }
    )
  }

  const handleExerciseComplete = (exerciseId: string, reps: number | null, weight: number | null, plannedSets: number) => {
    if (!activeSession) return
    // Log all planned sets for the exercise (not just one)
    // Network errors are handled by the hook (returns optimistic set, queues for sync)
    const setCount = Math.max(1, plannedSets || 1)
    for (let i = 1; i <= setCount; i++) {
      logSet({
        sessionId: activeSession.id,
        planExerciseId: exerciseId,
        setNumber: i,
        repsCompleted: reps,
        weightUsed: weight
      })
    }
  }

  const handleExerciseUncomplete = (exerciseId: string) => {
    const sets = completedSets[exerciseId] || []
    // Delete all sets for this exercise from the database
    // Network errors are handled by the hook (queues delete for sync)
    sets.forEach((s) => deleteSet(s.id))
    // Remove from local store immediately for responsive UI
    useWorkoutStore.getState().removeCompletedSets(exerciseId)
  }

  const handleSwapExercise = async (exerciseId: string, newName: string) => {
    try {
      const result = await swapPlanExerciseName(exerciseId, newName)
      if (result) {
        toast.success(`Swapped to ${newName}`)
        queryClient.invalidateQueries({ queryKey: ['workout-day', dayId] })
      } else {
        toast.error('Could not swap exercise. Try again.')
      }
    } catch {
      toast.error('Could not swap exercise. Try again.')
    }
  }

  if (isLoading) {
    return (
      <AppShell title="Loading..." showBack>
        <div className="p-[var(--space-4)] space-y-[var(--space-4)]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 skeleton rounded-[var(--radius-xl)]" />
          ))}
        </div>
      </AppShell>
    )
  }

  if (!workoutDay) {
    return (
      <AppShell title="Not Found" showBack>
        <div className="p-4 text-center text-[var(--color-text-muted)]">
          Workout day not found
        </div>
      </AppShell>
    )
  }

  // ─── Compute metadata for pre-workout hero ─────────────────────
  const totalExercises = workoutDay.sections.reduce((sum, s) => sum + s.exercises.length, 0)
  const estimatedMinutes = workoutDay.sections.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)

  // ═══════════════════════════════════════════════════════════════
  // PRE-WORKOUT VIEW — editorial layout with exercise preview
  // ═══════════════════════════════════════════════════════════════
  if (!activeSession) {
    return (
      <AppShell title={getWorkoutDisplayName(workoutDay.name)} showBack hideNav>
        {/* ═══ EDITORIAL HERO ═══ */}
        <FadeIn direction="up">
          <div className="px-[var(--space-5)] pt-[var(--space-4)] pb-[var(--space-6)]">
            {/* Massive workout name — magazine style */}
            <h2
              className="text-[clamp(2.5rem,11vw,3.75rem)] font-extrabold text-[var(--color-text)]"
              style={{
                fontFamily: 'var(--font-heading)',
                lineHeight: 'var(--leading-tight)',
                letterSpacing: 'var(--tracking-tighter)',
              }}
            >
              {getWorkoutDisplayName(workoutDay.name)}
            </h2>
            {/* Metadata row */}
            <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] mt-[var(--space-2)]">
              {totalExercises} exercise{totalExercises !== 1 ? 's' : ''}
              {estimatedMinutes > 0 && ` · ~${estimatedMinutes} min`}
            </p>
            {/* Motivational quote — delayed reveal */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-[var(--space-3)] italic"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              "{splashQuote}"
            </motion.p>
          </div>
        </FadeIn>

        {/* ═══ EXERCISE LIST — clean divider style ═══ */}
        <div className="px-[var(--space-5)]">
          <StaggerList className="space-y-0">
            {workoutDay.sections.map((section) => {
              const subtitle = section.duration_minutes ? `${section.duration_minutes} min` : undefined

              return (
                <StaggerItem key={section.id}>
                  {/* Section header with yellow accent bar */}
                  <div className="flex items-center gap-[var(--space-3)] pt-[var(--space-6)] pb-[var(--space-3)]">
                    <div
                      className="w-1 h-4 rounded-full"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                    <h3
                      className="text-[var(--text-xs)] font-bold text-[var(--color-text-secondary)] uppercase"
                      style={{ letterSpacing: 'var(--tracking-widest)' }}
                    >
                      {section.name}
                      {subtitle && (
                        <span className="font-normal text-[var(--color-text-muted)] ml-2">
                          ({subtitle})
                        </span>
                      )}
                    </h3>
                  </div>

                  {/* Exercise rows — no cards, just clean list items */}
                  <div
                    className="divide-y"
                    style={{ '--tw-divide-opacity': '1', borderColor: 'var(--color-border)' } as React.CSSProperties}
                  >
                    {section.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between py-[var(--space-5)]"
                      >
                        <p className="text-[var(--text-base)] font-semibold text-[var(--color-text)] flex-1 min-w-0 pr-[var(--space-3)]">
                          {exercise.name}
                        </p>
                        <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] font-mono-stats shrink-0 tabular-nums">
                          {formatSetsReps(exercise)}
                        </p>
                      </div>
                    ))}
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerList>
        </div>

        {/* Bottom spacer for floating button */}
        <div className="h-28" />

        {/* ═══ FLOATING START BUTTON ═══ */}
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springPresets.smooth, delay: 0.3 }}
          className="fixed bottom-0 left-0 right-0 p-[var(--space-4)] pb-safe border-t"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            borderColor: 'var(--glass-border)',
          }}
        >
          <motion.button
            onClick={handleStart}
            disabled={isStarting || showSplash}
            whileTap={{ scale: 0.97 }}
            transition={springPresets.snappy}
            className="w-full flex items-center justify-center gap-2 px-[var(--space-6)] py-[var(--space-4)] rounded-[var(--radius-xl)] bg-[var(--color-primary)] text-[var(--color-primary-text)] font-semibold text-lg disabled:opacity-70"
            style={{
              boxShadow: 'var(--shadow-primary)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            Start Workout
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </motion.button>
        </motion.div>

        {/* ═══ MOTIVATIONAL SPLASH SCREEN ═══ */}
        <AnimatePresence>
          {showSplash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
              style={{ background: 'var(--color-primary)' }}
            >
              {/* Expanding ring */}
              <motion.div
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute w-32 h-32 rounded-full border-4 border-white/30"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0.4 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                className="absolute w-32 h-32 rounded-full border-4 border-white/20"
              />

              {/* Quote text */}
              <motion.p
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
                className="text-[var(--color-primary-text)] text-3xl font-bold text-center px-8 leading-snug"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {splashQuote}
              </motion.p>

              {/* Subtle loading indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-16"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Post-Workout Review Modal (must be in non-active branch too,
          since clearWorkout() fires before openReview() in the mutation lifecycle) */}
      <PostWorkoutReview onComplete={() => navigate('/')} />
      </AppShell>
    )
  }

  // ═══════════════════════════════════════════════════════════════
  // ACTIVE WORKOUT VIEW — with exercise cards and rest timer
  // ═══════════════════════════════════════════════════════════════
  return (
    <AppShell title={getWorkoutDisplayName(workoutDay.name)} showBack hideNav>
      <div className="p-[var(--space-4)] space-y-[var(--space-4)]">
        {/* Rest Timer */}
        <RestTimer />

        {workoutDay.sections.map((section) => {
          const isWarmup = isWarmupSection(section.name)
          const subtitle = section.duration_minutes ? `${section.duration_minutes} min` : undefined

          if (isWarmup) {
            return (
              <CollapsibleSection
                key={section.id}
                title={section.name}
                subtitle={subtitle}
                defaultOpen={true}
              >
                {section.exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    completedSets={completedSets[exercise.id] || []}
                    onExerciseComplete={(reps, weight) =>
                      handleExerciseComplete(exercise.id, reps, weight, exercise.sets || 1)
                    }
                    onExerciseUncomplete={() => handleExerciseUncomplete(exercise.id)}
                    onSwapExercise={(newName) => handleSwapExercise(exercise.id, newName)}
                  />
                ))}
              </CollapsibleSection>
            )
          }

          return (
            <div key={section.id}>
              <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-3)] px-1">
                <div
                  className="w-1 h-4 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
                <h3
                  className="text-[var(--text-xs)] font-bold text-[var(--color-text-secondary)] uppercase"
                  style={{ letterSpacing: 'var(--tracking-widest)' }}
                >
                  {section.name}
                  {subtitle && (
                    <span className="font-normal text-[var(--color-text-muted)] ml-2">
                      ({subtitle})
                    </span>
                  )}
                </h3>
              </div>
              <div className="space-y-[var(--space-3)]">
                {section.exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    completedSets={completedSets[exercise.id] || []}
                    onExerciseComplete={(reps, weight) =>
                      handleExerciseComplete(exercise.id, reps, weight, exercise.sets || 1)
                    }
                    onExerciseUncomplete={() => handleExerciseUncomplete(exercise.id)}
                    onSwapExercise={(newName) => handleSwapExercise(exercise.id, newName)}
                  />
                ))}
              </div>
            </div>
          )
        })}

        <div className="pt-[var(--space-4)] pb-[var(--space-8)]">
          <Button
            onClick={handleComplete}
            loading={isCompleting}
            variant="gradient"
            className="w-full"
            size="lg"
          >
            Complete Workout
          </Button>
        </div>
      </div>

      {/* Post-Workout Review Modal */}
      <PostWorkoutReview onComplete={() => navigate('/')} />
    </AppShell>
  )
}
