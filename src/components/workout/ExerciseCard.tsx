import { useState, useEffect } from 'react'
import { Info, Check, Circle } from 'lucide-react'
import type { PlanExercise, ExerciseSet } from '@/types/workout'
import { formatSetReps } from '@/utils/parseSetReps'
import { useLastWeight } from '@/hooks/useWorkoutSession'

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

  const noWeight = isBodyweightOrCardio(exercise)
  const { data: lastWeight } = useLastWeight(noWeight ? undefined : exercise.id)

  // Pre-fill weight from last workout if available
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
    onExerciseComplete(reps, weightValue)
  }

  return (
    <div
      className={`bg-white rounded-lg border overflow-hidden transition-all ${
        isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200'
      }`}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Completion Toggle */}
        <button
          onClick={handleComplete}
          disabled={isCompleted}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            transition-colors
            ${isCompleted
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 hover:bg-blue-100 text-gray-400 hover:text-blue-600'
            }
          `}
        >
          {isCompleted ? (
            <Check className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Exercise Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>
            {exercise.name}
          </h3>
          <p className={`text-sm ${isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
            {formatSetReps(exercise)}
          </p>
        </div>

        {/* Weight Input (for non-bodyweight exercises) */}
        {!noWeight && !isCompleted && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-16 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm"
            />
            <span className="text-xs text-gray-500">lbs</span>
          </div>
        )}

        {/* Show weight used when completed */}
        {!noWeight && isCompleted && completedSets[0]?.weight_used && (
          <span className="text-sm text-green-700 font-medium flex-shrink-0">
            {completedSets[0].weight_used} lbs
          </span>
        )}

        {/* Notes button */}
        {exercise.notes && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowNotes(!showNotes)
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full flex-shrink-0"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Last weight badge */}
      {!noWeight && !isCompleted && lastWeight && (
        <div className="px-4 pb-3 -mt-1">
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            Last: {lastWeight} lbs
          </span>
        </div>
      )}

      {/* Notes */}
      {showNotes && exercise.notes && (
        <div className="px-4 pb-3">
          <p className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            {exercise.notes}
          </p>
        </div>
      )}
    </div>
  )
}
