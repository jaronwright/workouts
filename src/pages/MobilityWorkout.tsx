import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Button, Card, CardContent } from '@/components/ui'
import { useTemplate, useQuickLogTemplateWorkout } from '@/hooks/useTemplateWorkout'
import { useWorkoutDay } from '@/hooks/useWorkoutPlan'
import { useToast } from '@/hooks/useToast'
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

  const handleComplete = () => {
    if (!templateId) return

    quickLog(
      { templateId, durationMinutes: template?.duration_minutes ?? 15 },
      {
        onSuccess: () => {
          toast.success('Mobility workout complete!')
          navigate('/history')
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
        <div className="p-4 space-y-4">
          <div className="h-32 bg-[var(--color-surface-hover)] animate-pulse rounded-lg" />
          <div className="h-16 bg-[var(--color-surface-hover)] animate-pulse rounded-lg" />
          <div className="h-16 bg-[var(--color-surface-hover)] animate-pulse rounded-lg" />
          <div className="h-16 bg-[var(--color-surface-hover)] animate-pulse rounded-lg" />
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
    <AppShell title={template.name} showBack>
      <div className="p-4 space-y-4 pb-28">
        {/* Header */}
        <Card>
          <CardContent className="py-6 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: style.bgColor }}
            >
              <Icon className="w-7 h-7" style={{ color: style.color }} />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              {template.name}
            </h2>
            {template.description && (
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {template.description}
              </p>
            )}
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              ~{template.duration_minutes ?? 15} min &middot; {totalCount} exercises
            </p>
          </CardContent>
        </Card>

        {/* Exercise List */}
        {allExercises.length > 0 ? (
          <div className="space-y-2">
            {allExercises.map((exercise) => {
              const isChecked = checkedExercises.has(exercise.id)
              return (
                <Card key={exercise.id}>
                  <button
                    className="w-full text-left"
                    onClick={() => toggleExercise(exercise.id)}
                  >
                    <CardContent className="py-3 flex items-start gap-3">
                      {/* Check circle */}
                      <div
                        className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isChecked
                            ? 'border-transparent'
                            : 'border-[var(--color-border)]'
                        }`}
                        style={isChecked ? { backgroundColor: style.color } : undefined}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>

                      {/* Exercise info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span
                            className={`font-medium text-sm ${
                              isChecked
                                ? 'line-through text-[var(--color-text-muted)]'
                                : 'text-[var(--color-text)]'
                            }`}
                          >
                            {exercise.name}
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
                            {formatExerciseDetail(exercise)}
                          </span>
                        </div>
                        {exercise.notes && (
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            {exercise.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </button>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center text-[var(--color-text-muted)]">
              No exercises found for this workout.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-bg)]/95 backdrop-blur-sm border-t border-[var(--color-border)]">
        <Button
          onClick={handleComplete}
          loading={isPending}
          disabled={checkedCount === 0}
          size="lg"
          className="w-full"
        >
          Complete Workout ({checkedCount}/{totalCount})
        </Button>
      </div>
    </AppShell>
  )
}
