import { useState } from 'react'
import { ArrowLeftRight, Dumbbell, Loader2 } from 'lucide-react'
import { BottomSheet } from '@/components/ui'
import { useExerciseInfo } from '@/hooks/useExerciseGif'
import { useExerciseAlternatives } from '@/hooks/useExerciseLibrary'
import type { ExerciseDbExercise } from '@/services/exerciseDbService'

interface ExerciseSwapSheetProps {
  isOpen: boolean
  onClose: () => void
  exerciseName: string
  onSwap: (newName: string) => void
}

function AlternativeRow({
  exercise,
  onSelect,
}: {
  exercise: ExerciseDbExercise
  onSelect: (name: string) => void
}) {
  const [imgError, setImgError] = useState(false)
  const capitalized = exercise.name.replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <button
      onClick={() => onSelect(capitalized)}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-[var(--radius-lg)] hover:bg-[var(--color-surface-hover)] active:scale-[0.98] transition-all"
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-surface-hover)] overflow-hidden flex-shrink-0">
        {exercise.gifUrl && !imgError ? (
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-[var(--color-text-muted)] opacity-40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-semibold text-[var(--color-text)] truncate">
          {capitalized}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {exercise.equipments?.[0] && (
            <span className="text-[10px] font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded-full capitalize">
              {exercise.equipments[0]}
            </span>
          )}
          {exercise.bodyParts?.[0] && (
            <span className="text-[10px] font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded-full capitalize">
              {exercise.bodyParts[0]}
            </span>
          )}
        </div>
      </div>

      {/* Swap icon */}
      <ArrowLeftRight className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
    </button>
  )
}

export function ExerciseSwapSheet({ isOpen, onClose, exerciseName, onSwap }: ExerciseSwapSheetProps) {
  const [confirmName, setConfirmName] = useState<string | null>(null)
  const { exercise } = useExerciseInfo(exerciseName)
  const primaryMuscle = exercise?.targetMuscles?.[0]
  const { data: alternatives, isLoading } = useExerciseAlternatives(
    isOpen ? primaryMuscle : undefined,
    exercise?.exerciseId,
    10
  )

  const handleSelect = (name: string) => {
    setConfirmName(name)
  }

  const handleConfirm = () => {
    if (confirmName) {
      onSwap(confirmName)
      setConfirmName(null)
      onClose()
    }
  }

  const handleCancel = () => {
    setConfirmName(null)
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Swap Exercise">
      {/* Confirmation overlay */}
      {confirmName && (
        <div className="mb-4 p-4 rounded-[var(--radius-lg)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
          <p className="text-sm text-[var(--color-text)] mb-3">
            Replace <span className="font-bold">{exerciseName}</span> with{' '}
            <span className="font-bold text-[var(--color-primary)]">{confirmName}</span>?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-primary-text)] font-semibold text-sm active:scale-95 transition-transform"
            >
              Swap
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium text-sm active:scale-95 transition-transform"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Current exercise context */}
      {primaryMuscle && (
        <p className="text-xs text-[var(--color-text-muted)] mb-3">
          Showing alternatives that target <span className="font-semibold text-[var(--color-primary)] capitalize">{primaryMuscle}</span>
        </p>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
        </div>
      )}

      {/* No data state */}
      {!isLoading && !primaryMuscle && (
        <div className="text-center py-8">
          <Dumbbell className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2 opacity-40" />
          <p className="text-sm text-[var(--color-text-muted)]">
            No alternatives available for this exercise.
          </p>
        </div>
      )}

      {/* Alternatives list */}
      {!isLoading && alternatives && alternatives.length > 0 && (
        <div className="space-y-1">
          {alternatives.map((alt) => (
            <AlternativeRow
              key={alt.exerciseId}
              exercise={alt}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Empty results */}
      {!isLoading && alternatives && alternatives.length === 0 && primaryMuscle && (
        <div className="text-center py-8">
          <p className="text-sm text-[var(--color-text-muted)]">
            No alternatives found for this muscle group.
          </p>
        </div>
      )}
    </BottomSheet>
  )
}
