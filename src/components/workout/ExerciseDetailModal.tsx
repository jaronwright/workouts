import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useExerciseInfo } from '@/hooks/useExerciseGif'
import { Dumbbell, Target, Loader2, AlertCircle, StickyNote, Info } from 'lucide-react'

interface ExerciseDetailModalProps {
  isOpen: boolean
  onClose: () => void
  exerciseName: string
  notes?: string | null
}

export function ExerciseDetailModal({
  isOpen,
  onClose,
  exerciseName,
  notes
}: ExerciseDetailModalProps) {
  const { exercise, gifUrl, instructions, isLoading, error } = useExerciseInfo(
    isOpen ? exerciseName : undefined
  )
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Reset image state when modal opens with new exercise
  const handleImageLoad = () => setImageLoaded(true)
  const handleImageError = () => setImageError(true)

  const hasApiData = !!(exercise || instructions.length > 0 || gifUrl)
  const showNoApiData = !isLoading && !hasApiData && !error

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={exerciseName}>
      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-48 bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)]">
            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
          </div>
        )}

        {/* GIF Section */}
        {gifUrl && !imageError && !isLoading && (
          <div className="relative">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)]">
                <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
              </div>
            )}
            <img
              src={gifUrl}
              alt={`${exerciseName} demonstration`}
              className={`
                w-full rounded-[var(--radius-lg)] bg-[var(--color-surface-hover)]
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                transition-opacity duration-200
              `}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        )}

        {/* Exercise Details from API */}
        {exercise && (
          <div className="flex flex-wrap gap-2">
            {exercise.bodyParts?.map((part) => (
              <span
                key={part}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] px-2.5 py-1 rounded-full"
              >
                <Target className="w-3 h-3" />
                {part}
              </span>
            ))}
            {exercise.equipments?.map((equip) => (
              <span
                key={equip}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] px-2.5 py-1 rounded-full"
              >
                <Dumbbell className="w-3 h-3" />
                {equip}
              </span>
            ))}
            {exercise.targetMuscles?.map((muscle) => (
              <span
                key={muscle}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-full"
              >
                {muscle}
              </span>
            ))}
            {exercise.secondaryMuscles?.slice(0, 3).map((muscle) => (
              <span
                key={muscle}
                className="inline-flex items-center text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-2.5 py-1 rounded-full"
              >
                {muscle}
              </span>
            ))}
          </div>
        )}

        {/* Instructions from API */}
        {instructions.length > 0 && (
          <div>
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text)] mb-2">
              <Info className="w-4 h-4" />
              How to Perform
            </h4>
            <ol className="space-y-2">
              {instructions.map((instruction, index) => {
                // Remove "Step:X " prefix if present
                const cleanInstruction = instruction.replace(/^Step:\d+\s*/i, '')
                return (
                  <li
                    key={index}
                    className="flex gap-2 text-sm text-[var(--color-text-secondary)]"
                  >
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold rounded-full">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{cleanInstruction}</span>
                  </li>
                )
              })}
            </ol>
          </div>
        )}

        {/* Notes from database */}
        {notes && (
          <div className={hasApiData ? "pt-2 border-t border-[var(--color-border)]" : ""}>
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text)] mb-2">
              <StickyNote className="w-4 h-4" />
              Your Notes
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-primary)]/5 px-3 py-2 rounded-[var(--radius-md)]">
              {notes}
            </p>
          </div>
        )}

        {/* No API data fallback */}
        {showNoApiData && !notes && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-10 h-10 text-[var(--color-text-muted)] mb-2" />
            <p className="text-sm text-[var(--color-text-muted)]">
              No additional details available for this exercise.
            </p>
          </div>
        )}

        {showNoApiData && notes && (
          <div className="flex items-center gap-2 py-2 px-3 bg-[var(--color-surface-hover)] rounded-[var(--radius-md)]">
            <AlertCircle className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
            <p className="text-xs text-[var(--color-text-muted)]">
              Exercise details not found in database.
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 py-2 px-3 bg-[var(--color-warning)]/10 rounded-[var(--radius-md)]">
            <AlertCircle className="w-4 h-4 text-[var(--color-warning)] flex-shrink-0" />
            <p className="text-xs text-[var(--color-warning)]">
              Could not load exercise details. {notes ? 'Showing your notes only.' : ''}
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
