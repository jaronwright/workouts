/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/ui'
import { SpinnerGap, Barbell, Lightning, Info, BookOpen, CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { useCachedExercise, useFetchExerciseGuide } from '@/hooks/useExerciseGuide'
import type { CachedExercise } from '@/services/exerciseGuideService'

interface FormGuideSheetProps {
  isOpen: boolean
  onClose: () => void
  exerciseName: string
}

export function FormGuideSheet({ isOpen, onClose, exerciseName }: FormGuideSheetProps) {
  const { data: cachedExercise } = useCachedExercise(isOpen ? exerciseName : undefined)
  const fetchGuide = useFetchExerciseGuide()

  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showAllSteps, setShowAllSteps] = useState(false)

  // Reset state when exercise changes or modal opens/closes
  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
    setShowAllSteps(false)
    fetchGuide.reset()
  }, [exerciseName, isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Determine which exercise data to display
  const exercise: CachedExercise | undefined =
    fetchGuide.data?.exercise ?? cachedExercise ?? undefined

  const hasGuide = !!exercise
  const isCached = !!cachedExercise
  const instructions = exercise?.instructions ?? []
  const visibleInstructions = showAllSteps ? instructions : instructions.slice(0, 3)
  const hasMore = instructions.length > 3

  const handleFetchGuide = () => {
    fetchGuide.mutate(exerciseName)
  }

  // Determine error/limit message
  const statusMessage = fetchGuide.data?.status === 'not_found'
    ? 'No guide available for this exercise yet.'
    : fetchGuide.data?.status === 'daily_limit'
      ? 'Exercise guides are resting today. Try again tomorrow!'
      : fetchGuide.data?.status === 'monthly_limit'
        ? `Monthly guide limit reached. Resets ${fetchGuide.data.resetsAt ?? 'next month'}.`
        : fetchGuide.data?.status === 'api_error'
          ? 'Couldn\'t load guide. Check connection and try again.'
          : fetchGuide.error
            ? 'Couldn\'t load guide. Check connection and try again.'
            : null

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Exercise Info">
      <div className="space-y-4">
        {/* Exercise name */}
        <h3 className="text-lg font-bold text-[var(--color-text)] capitalize">
          {exerciseName}
        </h3>

        {/* ─── GUIDE CONTENT (cached or just fetched) ─── */}
        {hasGuide && (
          <>
            {/* GIF */}
            {exercise.gif_url && !imageError && (
              <div className="relative w-full aspect-[4/3] bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)] overflow-hidden">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <SpinnerGap className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
                  </div>
                )}
                <img
                  src={exercise.gif_url}
                  alt={`${exerciseName} form guide`}
                  className={`w-full h-full object-contain transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </div>
            )}

            {/* Fallback when no GIF */}
            {(!exercise.gif_url || imageError) && (
              <div className="w-full h-32 bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)] flex items-center justify-center">
                <Barbell className="w-12 h-12 text-[var(--color-text-muted)] opacity-30" />
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
            {(exercise.target_muscle || (exercise.secondary_muscles?.length ?? 0) > 0) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {exercise.target_muscle && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-full capitalize">
                    <Lightning className="w-3 h-3" />
                    {exercise.target_muscle}
                  </span>
                )}
                {exercise.secondary_muscles?.slice(0, 3).map((muscle) => (
                  <span
                    key={muscle}
                    className="text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-2.5 py-1 rounded-full capitalize"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            )}

            {/* Equipment badge */}
            {exercise.equipment && (
              <div className="flex items-center gap-1.5">
                <Barbell className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span className="text-xs font-medium text-[var(--color-text-muted)] capitalize">
                  {exercise.equipment}
                </span>
              </div>
            )}

            {/* Cache indicator + attribution */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
              {isCached && (
                <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                  <CheckCircle className="w-3 h-3" />
                  Saved for offline
                </span>
              )}
              <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">
                Exercise data by ExerciseDB
              </span>
            </div>
          </>
        )}

        {/* ─── VIEW EXERCISE GUIDE BUTTON (not cached, not yet fetched) ─── */}
        {!hasGuide && !statusMessage && !fetchGuide.isPending && (
          <div className="text-center py-4">
            <button
              onClick={handleFetchGuide}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-[var(--color-primary-text)] font-semibold active:scale-[0.98] transition-transform"
              style={{ boxShadow: 'var(--shadow-primary)' }}
            >
              <BookOpen className="w-5 h-5" />
              View Exercise Guide
            </button>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Learn proper form and technique
            </p>
          </div>
        )}

        {/* ─── LOADING STATE ─── */}
        {fetchGuide.isPending && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <SpinnerGap className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
            <p className="text-sm text-[var(--color-text-muted)]">Loading exercise guide...</p>
          </div>
        )}

        {/* ─── ERROR / LIMIT MESSAGES ─── */}
        {statusMessage && (
          <div className="text-center py-6">
            <WarningCircle className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--color-text-muted)]">
              {statusMessage}
            </p>
            {(fetchGuide.data?.status === 'api_error' || fetchGuide.error) && (
              <button
                onClick={handleFetchGuide}
                className="mt-3 text-sm font-medium text-[var(--color-primary)] active:opacity-70"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
