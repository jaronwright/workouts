import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Button } from '@/components/ui'
import { FadeIn, StaggerList, StaggerItem } from '@/components/motion'
import { RestTimer } from '@/components/workout'
import { PostWorkoutReview } from '@/components/review/PostWorkoutReview'
import { useTemplate, useQuickLogTemplateWorkout } from '@/hooks/useTemplateWorkout'
import { useWorkoutDay } from '@/hooks/useWorkoutPlan'
import { useToast } from '@/hooks/useToast'
import { useWakeLock } from '@/hooks/useWakeLock'
import { useReviewStore } from '@/stores/reviewStore'
import { getMobilityStyle } from '@/config/workoutConfig'
import { Check } from 'lucide-react'
import type { PlanExercise } from '@/types/workout'

function formatExerciseDetail(exercise: PlanExercise): string {
  const parts: string[] = []
  if (exercise.sets) {
    let repsPart = ''
    if (exercise.reps_min && exercise.reps_max && exercise.reps_min !== exercise.reps_max) {
      repsPart = `${exercise.reps_min}-${exercise.reps_max}`
    } else if (exercise.reps_min) {
      repsPart = `${exercise.reps_min}`
    } else if (exercise.reps_max) {
      repsPart = `${exercise.reps_max}`
    }

    if (repsPart) {
      const unit = exercise.reps_unit !== 'reps' ? exercise.reps_unit : ''
      const perSide = exercise.is_per_side ? ' per side' : ''
      parts.push(`${exercise.sets} × ${repsPart}${unit ? unit : ''}${perSide}`)
    } else {
      parts.push(`${exercise.sets} sets`)
    }
  }
  return parts.join(' ')
}

export function MobilityWorkoutPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const { data: template, isLoading: templateLoading } = useTemplate(templateId)
  const { data: workoutDay, isLoading: dayLoading } = useWorkoutDay(template?.workout_day_id ?? undefined)
  const { mutate: quickLog, isPending } = useQuickLogTemplateWorkout()
  const toast = useToast()

  const [checkedExercises, setCheckedExercises] = useState<Set<string>>(new Set())

  const style = getMobilityStyle(template?.category ?? null)
  const Icon = style.icon

  const allExercises = workoutDay?.sections?.flatMap(s => s.exercises) ?? []
  useWakeLock(allExercises.length > 0)
  const checkedCount = checkedExercises.size
  const totalCount = allExercises.length

  const toggleExercise = (exerciseId: string) => {
    setCheckedExercises(prev => {
      const next = new Set(prev)
      if (next.has(exerciseId)) {
        next.delete(exerciseId)
      } else {
        next.add(exerciseId)
      }
      return next
    })
  }

  const openReview = useReviewStore((s) => s.openReview)

  const handleComplete = () => {
    if (!templateId) return

    quickLog(
      { templateId, durationMinutes: template?.duration_minutes ?? 15 },
      {
        onSuccess: (result) => {
          const templateSessionId = (result as { id?: string })?.id
          if (templateSessionId) {
            openReview({
              templateSessionId,
              sessionType: 'mobility',
              durationMinutes: template?.duration_minutes ?? 15,
            })
          } else {
            toast.success('Mobility workout complete!')
            navigate('/history')
          }
        },
        onError: () => {
          toast.error('Failed to save workout. Please try again.')
        }
      }
    )
  }

  const isLoading = templateLoading || dayLoading

  if (isLoading) {
    return (
      <AppShell title="Loading..." showBack>
        <div className="p-[var(--space-4)] space-y-[var(--space-4)]">
          <div className="h-32 skeleton rounded-[var(--radius-xl)]" />
          <div className="h-16 skeleton rounded-[var(--radius-xl)]" />
          <div className="h-16 skeleton rounded-[var(--radius-xl)]" />
          <div className="h-16 skeleton rounded-[var(--radius-xl)]" />
        </div>
      </AppShell>
    )
  }

  if (!template) {
    return (
      <AppShell title="Not Found" showBack>
        <div className="p-4 text-center text-[var(--color-text-muted)]">
          Workout not found
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title={template.name} showBack hideNav>
      <div className="space-y-[var(--space-4)]">
        {/* ═══ EDITORIAL HERO ═══ */}
        <FadeIn direction="up">
          <div className="px-[var(--space-5)] pt-[var(--space-4)] pb-[var(--space-2)]">
            <div className="flex items-center gap-[var(--space-4)]">
              <div
                className="w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0"
                style={{ backgroundColor: style.bgColor }}
              >
                <Icon className="w-7 h-7" style={{ color: style.color }} />
              </div>
              <div>
                <h2
                  className="text-[clamp(1.75rem,8vw,2.5rem)] font-extrabold text-[var(--color-text)]"
                  style={{ fontFamily: 'var(--font-heading)', lineHeight: 'var(--leading-tight)' }}
                >
                  {template.name}
                </h2>
                <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                  ~{template.duration_minutes ?? 15} min · {totalCount} exercises
                  {checkedCount > 0 && (
                    <span style={{ color: style.color }}> · {checkedCount} done</span>
                  )}
                </p>
              </div>
            </div>
            {template.description && (
              <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] mt-[var(--space-3)]">
                {template.description}
              </p>
            )}
          </div>
        </FadeIn>

        <div className="px-[var(--space-4)]">
          <RestTimer />
        </div>

        {/* ═══ EXERCISE CHECKLIST — clean divider style ═══ */}
        {allExercises.length > 0 ? (
          <div className="px-[var(--space-5)]">
            <StaggerList>
              <div
                className="divide-y"
                style={{ '--tw-divide-opacity': '1', borderColor: 'var(--color-border)' } as React.CSSProperties}
              >
                {allExercises.map((exercise) => {
                  const isChecked = checkedExercises.has(exercise.id)
                  return (
                    <StaggerItem key={exercise.id}>
                      <button
                        className="w-full text-left py-[var(--space-4)] flex items-center gap-[var(--space-3)]"
                        onClick={() => toggleExercise(exercise.id)}
                      >
                        {/* Check circle */}
                        <div
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                            isChecked
                              ? 'border-transparent scale-110'
                              : 'border-[var(--color-border-strong)]'
                          }`}
                          style={isChecked ? { backgroundColor: style.color } : undefined}
                        >
                          {isChecked && <Check className="w-4 h-4 text-white" />}
                        </div>

                        {/* Exercise info */}
                        <div className="flex-1 min-w-0">
                          <span
                            className={`font-semibold text-[var(--text-base)] block ${
                              isChecked
                                ? 'line-through text-[var(--color-text-muted)]'
                                : 'text-[var(--color-text)]'
                            }`}
                          >
                            {exercise.name}
                          </span>
                          {exercise.notes && (
                            <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-0.5 truncate">
                              {exercise.notes}
                            </p>
                          )}
                        </div>

                        {/* Sets/reps in mono */}
                        <span className="text-[var(--text-sm)] text-[var(--color-text-secondary)] font-mono-stats shrink-0 tabular-nums">
                          {formatExerciseDetail(exercise)}
                        </span>
                      </button>
                    </StaggerItem>
                  )
                })}
              </div>
            </StaggerList>
          </div>
        ) : (
          <FadeIn direction="up">
            <div className="px-[var(--space-5)] py-[var(--space-8)] text-center text-[var(--color-text-muted)]">
              No exercises found for this workout.
            </div>
          </FadeIn>
        )}

        <div className="px-[var(--space-4)] pt-[var(--space-4)] pb-[var(--space-8)]">
          <Button
            onClick={handleComplete}
            loading={isPending}
            disabled={checkedCount === 0}
            variant="gradient"
            size="lg"
            className="w-full"
          >
            Complete Workout ({checkedCount}/{totalCount})
          </Button>
        </div>
      </div>

      {/* Post-Workout Review Modal */}
      <PostWorkoutReview onComplete={() => navigate('/history')} />
    </AppShell>
  )
}
