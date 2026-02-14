import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent } from '@/components/ui'
import { StaggerList, StaggerItem } from '@/components/motion'
import { CollapsibleSection, ExerciseCard, RestTimer } from '@/components/workout'
import { PostWorkoutReview } from '@/components/review/PostWorkoutReview'
import { useWorkoutDay } from '@/hooks/useWorkoutPlan'
import { useStartWorkout, useCompleteWorkout, useLogSet, useDeleteSet, useSessionSets } from '@/hooks/useWorkoutSession'
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

export function WorkoutPage() {
  const { dayId } = useParams<{ dayId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

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

  const handleStart = useCallback(() => {
    if (!dayId || !user) return
    setShowSplash(true)

    // After splash animation, actually start the workout
    // Network errors are handled by the hook (returns optimistic session)
    setTimeout(() => {
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

  if (!activeSession) {
    return (
      <AppShell title={getWorkoutDisplayName(workoutDay.name)} showBack hideNav>
        <div className="p-[var(--space-4)] space-y-[var(--space-4)]">
          <StaggerList className="space-y-[var(--space-4)]">
            {workoutDay.sections.map((section) => {
              const isWarmup = isWarmupSection(section.name)
              const subtitle = section.duration_minutes ? `${section.duration_minutes} min` : undefined

              if (isWarmup) {
                return (
                  <StaggerItem key={section.id}>
                    <CollapsibleSection
                      title={section.name}
                      subtitle={subtitle}
                      defaultOpen={true}
                    >
                      {section.exercises.map((exercise) => (
                        <Card key={exercise.id}>
                          <CardContent className="py-[var(--space-3)]">
                            <p className="font-medium text-[var(--color-text)]">{exercise.name}</p>
                            <p className="text-sm text-[var(--color-text-muted)]">
                              {exercise.sets && `${exercise.sets} sets`}
                              {exercise.reps_min && ` × ${exercise.reps_min}${exercise.reps_max && exercise.reps_max !== exercise.reps_min ? `-${exercise.reps_max}` : ''} ${exercise.reps_unit || 'reps'}`}
                              {exercise.is_per_side && '/side'}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </CollapsibleSection>
                  </StaggerItem>
                )
              }

              return (
                <StaggerItem key={section.id}>
                  <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-[var(--space-2)] px-1">
                    {section.name}
                    {subtitle && ` (${subtitle})`}
                  </h3>
                  <div className="space-y-[var(--space-2)]">
                    {section.exercises.map((exercise) => (
                      <Card key={exercise.id}>
                        <CardContent className="py-[var(--space-3)]">
                          <p className="font-medium text-[var(--color-text)]">{exercise.name}</p>
                          <p className="text-sm text-[var(--color-text-muted)]">
                            {exercise.sets && `${exercise.sets} sets`}
                            {exercise.reps_min && ` × ${exercise.reps_min}${exercise.reps_max && exercise.reps_max !== exercise.reps_min ? `-${exercise.reps_max}` : ''} ${exercise.reps_unit || 'reps'}`}
                            {exercise.is_per_side && '/side'}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerList>
        </div>

        {/* Floating Start Workout button */}
        <div
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
            style={{ boxShadow: 'var(--shadow-primary)' }}
          >
            Start Workout
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </motion.button>
        </div>

        {/* Motivational Splash Screen */}
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

  // Active workout session view
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
                  />
                ))}
              </CollapsibleSection>
            )
          }

          return (
            <div key={section.id}>
              <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-[var(--space-3)] px-1">
                {section.name}
              </h3>
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
