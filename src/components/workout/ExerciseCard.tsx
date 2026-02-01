/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { Info, Check, Circle, Sparkles } from 'lucide-react'
import type { PlanExercise, ExerciseSet } from '@/types/workout'
import { formatSetReps } from '@/utils/parseSetReps'
import { useLastWeight } from '@/hooks/useWorkoutSession'
import { useProgressionSuggestion } from '@/hooks/useProgression'
import { ProgressionBadge } from './ProgressionBadge'

interface ExerciseCardProps {
  exercise: PlanExercise
  completedSets: ExerciseSet[]
  onExerciseComplete: (reps: number | null, weight: number | null) => void
}

function isBodyweightOrCardio(exercise: PlanExercise): boolean {
  const name = exercise.name.toLowerCase()
  const noWeightKeywords = [
    'walk', 'run', 'bike', 'rowing', 'stepper', 'hang', 'hold', 'plank',
    'push-up', 'push up', 'pushup', 'pull-up', 'pull up', 'pullup',
    'band', 'squat hold', 'air squat', 'lunge', 'crunch', 'leg raise',
    'ab wheel', 'rollout'
  ]
  return (
    exercise.reps_unit === 'minutes' ||
    exercise.reps_unit === 'seconds' ||
    exercise.reps_unit === 'steps' ||
    noWeightKeywords.some(keyword => name.includes(keyword))
  )
}

export function ExerciseCard({
  exercise,
  completedSets,
  onExerciseComplete
}: ExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(false)
  const [weight, setWeight] = useState<string>(exercise.target_weight?.toString() || '')
  const [weightInitialized, setWeightInitialized] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  const noWeight = isBodyweightOrCardio(exercise)
  const { data: lastWeight } = useLastWeight(noWeight ? undefined : exercise.id)
  const { data: progressionSuggestion } = useProgressionSuggestion(
    noWeight ? undefined : exercise.id,
    exercise.name,
    exercise.reps_min
  )

  useEffect(() => {
    if (!weightInitialized && lastWeight !== undefined && lastWeight !== null) {
      setWeight(lastWeight.toString())
      setWeightInitialized(true)
    }
  }, [lastWeight, weightInitialized])

  const isCompleted = completedSets.length > 0

  const handleComplete = () => {
    if (isCompleted) return
    const reps = exercise.reps_min
    const weightValue = noWeight ? null : (weight ? parseFloat(weight) : null)
    setJustCompleted(true)
    onExerciseComplete(reps, weightValue)
    setTimeout(() => setJustCompleted(false), 300)
  }

  const handleApplyProgression = () => {
    if (progressionSuggestion) {
      setWeight(progressionSuggestion.suggestedWeight.toString())
    }
  }

  return (
    <div
      className={`
        rounded-[var(--radius-xl)] overflow-hidden
        transition-colors duration-100
        ${isCompleted
          ? 'bg-[var(--color-success)]/10 border-2 border-[var(--color-success)]/30'
          : 'bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-xs)]'
        }
      `}
    >
      <div className="px-4 py-3.5 flex items-center gap-3">
        {/* Completion Toggle */}
        <button
          onClick={handleComplete}
          disabled={isCompleted}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
            transition-transform duration-100
            active:scale-90
            ${isCompleted
              ? 'bg-[var(--color-success)] text-white'
              : 'bg-[var(--color-surface-hover)] border-2 border-[var(--color-border-strong)] text-[var(--color-text-muted)]'
            }
            ${justCompleted ? 'animate-pop-in' : ''}
          `}
        >
          {isCompleted ? (
            <Check className={`w-5 h-5 ${justCompleted ? 'animate-checkmark' : ''}`} strokeWidth={3} />
          ) : (
            <Circle className="w-5 h-5" strokeWidth={2} />
          )}
        </button>

        {/* Exercise Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`
            font-semibold text-[15px] leading-tight
            ${isCompleted ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'}
          `}>
            {exercise.name}
          </h3>
          <p className={`
            text-sm mt-0.5
            ${isCompleted ? 'text-[var(--color-success)]/70' : 'text-[var(--color-text-muted)]'}
          `}>
            {formatSetReps(exercise)}
          </p>
        </div>

        {/* Weight Input */}
        {!noWeight && !isCompleted && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="
                w-16 h-9 px-2 text-center
                bg-[var(--color-surface-hover)]
                border border-transparent
                rounded-[var(--radius-md)]
                text-base font-semibold
                text-[var(--color-text)]
                focus:outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)]
                placeholder:text-[var(--color-text-muted)]
              "
            />
            <span className="text-xs font-medium text-[var(--color-text-muted)]">lbs</span>
          </div>
        )}

        {/* Weight shown when completed */}
        {!noWeight && isCompleted && completedSets[0]?.weight_used && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-success)]/15 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-success)]" />
            <span className="text-sm text-[var(--color-success)] font-bold">
              {completedSets[0].weight_used}
            </span>
          </div>
        )}

        {/* Notes button */}
        {exercise.notes && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowNotes(!showNotes)
            }}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              active:scale-90 transition-transform duration-100
              ${showNotes
                ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                : 'text-[var(--color-text-muted)]'
              }
            `}
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Badges */}
      {!noWeight && !isCompleted && (lastWeight || progressionSuggestion) && (
        <div className="px-4 pb-3 -mt-1 flex flex-wrap gap-2">
          {lastWeight && !progressionSuggestion && (
            <span className="
              inline-flex items-center gap-1.5
              text-xs font-semibold
              text-[var(--color-primary)]
              bg-[var(--color-primary)]/10
              px-2.5 py-1 rounded-full
            ">
              Last: {lastWeight} lbs
            </span>
          )}
          {progressionSuggestion && (
            <ProgressionBadge
              suggestion={progressionSuggestion}
              onClick={handleApplyProgression}
            />
          )}
        </div>
      )}

      {/* Notes */}
      {showNotes && exercise.notes && (
        <div className="px-4 pb-3 animate-fade-in">
          <div className="px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-primary)]/5">
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {exercise.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
