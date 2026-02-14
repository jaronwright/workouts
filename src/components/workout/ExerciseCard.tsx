/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { Info, Check, Circle, Sparkles, Cloud } from 'lucide-react'
import type { PlanExercise, ExerciseSet } from '@/types/workout'
import { formatSetReps } from '@/utils/parseSetReps'
import { useLastWeight } from '@/hooks/useWorkoutSession'
import { useProgressionSuggestion } from '@/hooks/useProgression'
import { useOfflineStore } from '@/stores/offlineStore'
import { ProgressionBadge } from './ProgressionBadge'
import { ExerciseDetailModal } from './ExerciseDetailModal'
import { updateExerciseWeightUnit } from '@/services/workoutService'

interface ExerciseCardProps {
  exercise: PlanExercise
  completedSets: ExerciseSet[]
  onExerciseComplete: (reps: number | null, weight: number | null) => void
  onExerciseUncomplete?: () => void
}

function isBodyweightOrCardio(exercise: PlanExercise): boolean {
  const name = exercise.name.toLowerCase()
  const noWeightKeywords = [
    'walk', 'run', 'bike', 'rowing', 'stepper', 'hang', 'hold', 'plank',
    'push-up', 'push up', 'pushup', 'pull-up', 'pull up', 'pullup',
    'band', 'squat hold', 'air squat', 'lunge', 'crunch', 'leg raise',
    'ab wheel', 'rollout',
    'dead bug', 'cossack', '90/90', 'hip switch',
    'cat-cow', 'cat cow', 'thoracic', 'jefferson curl',
    'scorpion', 'wall slide', 'thread the needle',
    'shoulder car', 'ankle car', 'wrist car'
  ]
  return (
    exercise.reps_unit === 'minutes' ||
    exercise.reps_unit === 'seconds' ||
    exercise.reps_unit === 'steps' ||
    noWeightKeywords.some(keyword => name.includes(keyword))
  )
}

function PendingSyncIndicator({ setId }: { setId: string }) {
  const isPending = useOfflineStore((s) =>
    s.queue.some((m) => m.type === 'log-set' && m.clientId === setId)
  )
  if (!isPending) return null
  return <Cloud className="w-3 h-3 text-[var(--color-text-muted)] animate-pulse" />
}

export function ExerciseCard({
  exercise,
  completedSets,
  onExerciseComplete,
  onExerciseUncomplete
}: ExerciseCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [weight, setWeight] = useState<string>(exercise.target_weight?.toString() || '')
  const [weightInitialized, setWeightInitialized] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const [localWeightUnit, setLocalWeightUnit] = useState<'lbs' | 'kg'>(exercise.weight_unit || 'lbs')

  // Sync local unit when exercise updates
  useEffect(() => {
    setLocalWeightUnit(exercise.weight_unit || 'lbs')
  }, [exercise.weight_unit])

  const noWeight = isBodyweightOrCardio(exercise)

  // Toggle weight unit for this exercise
  const handleToggleUnit = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const oldUnit = localWeightUnit
    const newUnit = oldUnit === 'lbs' ? 'kg' : 'lbs'
    setLocalWeightUnit(newUnit)
    try {
      await updateExerciseWeightUnit(exercise.id, newUnit)
    } catch (error) {
      // Revert on error using saved value, not stale closure
      setLocalWeightUnit(oldUnit)
      console.error('Failed to update weight unit:', error)
    }
  }
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
    if (isCompleted) {
      // Uncomplete: revert to empty circle
      onExerciseUncomplete?.()
      return
    }
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

        {/* Weight Input - uses text type with numeric inputMode for clean mobile keypad */}
        {!noWeight && !isCompleted && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              placeholder="0"
              value={weight}
              onChange={(e) => {
                // Only allow numbers and decimal point
                const val = e.target.value.replace(/[^0-9.]/g, '')
                setWeight(val)
              }}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
              className="
                w-16 h-10 px-2 text-center
                bg-[var(--color-surface-hover)]
                border-2 border-transparent
                rounded-[var(--radius-md)]
                text-lg font-bold tabular-nums
                text-[var(--color-text)]
                focus:outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)]
                placeholder:text-[var(--color-text-muted)]
                select-all
              "
            />
            <button
              onClick={handleToggleUnit}
              className="
                text-sm font-medium text-[var(--color-text-muted)]
                px-1.5 py-0.5 rounded
                hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]
                active:scale-95 transition-all duration-100
              "
            >
              {localWeightUnit}
            </button>
          </div>
        )}

        {/* Weight shown when completed */}
        {!noWeight && isCompleted && completedSets[0]?.weight_used && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-success)]/15 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-success)]" />
            <span className="text-sm text-[var(--color-success)] font-bold">
              {completedSets[0].weight_used} {localWeightUnit}
            </span>
            <PendingSyncIndicator setId={completedSets[0].id} />
          </div>
        )}

        {/* Info button - opens detail modal with GIF and notes */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowDetailModal(true)
          }}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            active:scale-90 transition-transform duration-100
            ${exercise.notes
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)]'
            }
          `}
        >
          <Info className="w-4 h-4" />
        </button>
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
              Last: {lastWeight} {localWeightUnit}
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

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        exerciseName={exercise.name}
        notes={exercise.notes}
      />
    </div>
  )
}
