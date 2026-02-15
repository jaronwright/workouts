/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/ui'
import { useExerciseInfo } from '@/hooks/useExerciseGif'
import { Loader2, Dumbbell, Zap, Info } from 'lucide-react'

interface FormGuideSheetProps {
  isOpen: boolean
  onClose: () => void
  exerciseName: string
}

export function FormGuideSheet({ isOpen, onClose, exerciseName }: FormGuideSheetProps) {
  const { exercise, gifUrl, instructions, isLoading } = useExerciseInfo(
    isOpen ? exerciseName : undefined
  )
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showAllSteps, setShowAllSteps] = useState(false)

  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
    setShowAllSteps(false)
  }, [exerciseName, isOpen])

  const visibleInstructions = showAllSteps ? instructions : instructions.slice(0, 3)
  const hasMore = instructions.length > 3

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Form Guide">
      <div className="space-y-4">
        {/* Exercise name */}
        <h3 className="text-base font-bold text-[var(--color-text)] capitalize">
          {exerciseName}
        </h3>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-48 bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)]">
            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
          </div>
        )}

        {/* GIF */}
        {gifUrl && !imageError && !isLoading && (
          <div className="relative w-full aspect-[4/3] bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)] overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
              </div>
            )}
            <img
              src={gifUrl}
              alt={`${exerciseName} form guide`}
              className={`w-full h-full object-contain transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {/* Fallback when no GIF */}
        {(imageError || (!gifUrl && !isLoading)) && (
          <div className="w-full h-32 bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)] flex items-center justify-center">
            <Dumbbell className="w-12 h-12 text-[var(--color-text-muted)] opacity-30" />
          </div>
        )}

        {/* Instructions */}
        {visibleInstructions.length > 0 && (
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
              <Info className="w-3.5 h-3.5" />
              Instructions
            </h4>
            <ol className="space-y-3">
              {visibleInstructions.map((instruction, index) => {
                const clean = instruction.replace(/^Step:\d+\s*/i, '')
                return (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold rounded-full">
                      {index + 1}
                    </span>
                    <span className="text-sm text-[var(--color-text-secondary)] leading-relaxed pt-1">
                      {clean}
                    </span>
                  </li>
                )
              })}
            </ol>
            {hasMore && !showAllSteps && (
              <button
                onClick={() => setShowAllSteps(true)}
                className="mt-3 text-sm font-medium text-[var(--color-primary)] active:opacity-70"
              >
                Show all {instructions.length} steps
              </button>
            )}
          </div>
        )}

        {/* Muscle tags */}
        {exercise && ((exercise.targetMuscles ?? []).length > 0 || (exercise.secondaryMuscles ?? []).length > 0) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {(exercise.targetMuscles ?? []).map((muscle) => (
              <span
                key={muscle}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-full capitalize"
              >
                <Zap className="w-3 h-3" />
                {muscle}
              </span>
            ))}
            {(exercise.secondaryMuscles ?? []).slice(0, 3).map((muscle) => (
              <span
                key={muscle}
                className="text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-2.5 py-1 rounded-full capitalize"
              >
                {muscle}
              </span>
            ))}
          </div>
        )}

        {/* No data */}
        {!isLoading && !exercise && (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--color-text-muted)]">
              No form guide available for this exercise.
            </p>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
