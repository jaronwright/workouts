/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useExerciseInfo } from '@/hooks/useExerciseGif'
import {
  Dumbbell,
  Target,
  Loader2,
  AlertCircle,
  StickyNote,
  Zap,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

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
  const [instructionsExpanded, setInstructionsExpanded] = useState(false)

  // Reset image state when exercise changes or modal opens/closes
  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
    setInstructionsExpanded(false)
  }, [exerciseName, isOpen, gifUrl])

  const handleImageLoad = () => setImageLoaded(true)
  const handleImageError = () => setImageError(true)

  const hasApiData = !!(exercise || instructions.length > 0 || gifUrl)
  const showNoApiData = !isLoading && !hasApiData && !error

  const primaryMuscles = exercise?.targetMuscles || []
  const secondaryMuscles = exercise?.secondaryMuscles || []
  const allMuscles = [...primaryMuscles, ...secondaryMuscles]
  const hasMuscleData = allMuscles.length > 0

  // Show first 3 instructions collapsed, all when expanded
  const visibleInstructions = instructionsExpanded
    ? instructions
    : instructions.slice(0, 3)
  const hasMoreInstructions = instructions.length > 3

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={exerciseName}>
      <div className="space-y-5">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-52 bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)]">
            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mb-2" />
            <p className="text-xs text-[var(--color-text-muted)]">Loading exercise details...</p>
          </div>
        )}

        {/* GIF Section */}
        {gifUrl && !imageError && !isLoading && (
          <div className="relative rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-surface-hover)]">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
              </div>
            )}
            <img
              src={gifUrl}
              alt={`${exerciseName} demonstration`}
              className={`
                w-full rounded-[var(--radius-lg)]
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                transition-opacity duration-200
              `}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        )}

        {/* Quick Info Badges (body part + equipment) */}
        {exercise && (exercise.bodyParts?.length > 0 || exercise.equipments?.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {exercise.bodyParts?.map((part) => (
              <span
                key={part}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] px-2.5 py-1.5 rounded-full"
              >
                <Target className="w-3 h-3" />
                {part}
              </span>
            ))}
            {exercise.equipments?.map((equip) => (
              <span
                key={equip}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] px-2.5 py-1.5 rounded-full"
              >
                <Dumbbell className="w-3 h-3" />
                {equip}
              </span>
            ))}
          </div>
        )}

        {/* Muscles Worked Section */}
        {hasMuscleData && (
          <div className="bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)] p-4">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text)] mb-3">
              <Activity className="w-4 h-4 text-[var(--color-primary)]" />
              Muscles Worked
            </h4>

            {/* Primary muscles */}
            {primaryMuscles.length > 0 && (
              <div className="mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-1.5 block">
                  Primary
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {primaryMuscles.map((muscle) => (
                    <span
                      key={muscle}
                      className="
                        inline-flex items-center gap-1 text-xs font-semibold
                        text-[var(--color-primary)] bg-[var(--color-primary)]/15
                        px-2.5 py-1.5 rounded-full
                      "
                    >
                      <Zap className="w-3 h-3" />
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Secondary muscles */}
            {secondaryMuscles.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-1.5 block">
                  Secondary
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {secondaryMuscles.map((muscle) => (
                    <span
                      key={muscle}
                      className="
                        inline-flex items-center text-xs font-medium
                        text-[var(--color-text-secondary)] bg-[var(--color-surface)]
                        px-2.5 py-1.5 rounded-full
                        border border-[var(--color-border)]
                      "
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions Section */}
        {instructions.length > 0 && (
          <div>
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text)] mb-3">
              <svg className="w-4 h-4 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              How to Perform
            </h4>
            <ol className="space-y-2.5">
              {visibleInstructions.map((instruction, index) => {
                const cleanInstruction = instruction.replace(/^Step:\d+\s*/i, '')
                return (
                  <li
                    key={index}
                    className="flex gap-3 text-sm text-[var(--color-text-secondary)]"
                  >
                    <span className="
                      flex-shrink-0 w-6 h-6 flex items-center justify-center
                      bg-[var(--color-primary)]/10 text-[var(--color-primary)]
                      text-xs font-bold rounded-full mt-0.5
                    ">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{cleanInstruction}</span>
                  </li>
                )
              })}
            </ol>
            {hasMoreInstructions && (
              <button
                onClick={() => setInstructionsExpanded(!instructionsExpanded)}
                className="
                  flex items-center gap-1 mt-2 ml-9
                  text-xs font-medium text-[var(--color-primary)]
                  active:opacity-70 transition-opacity
                "
              >
                {instructionsExpanded ? (
                  <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <>Show all {instructions.length} steps <ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>
            )}
          </div>
        )}

        {/* Notes from database */}
        {notes && (
          <div className={hasApiData ? "pt-3 border-t border-[var(--color-border)]" : ""}>
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text)] mb-2">
              <StickyNote className="w-4 h-4" />
              Your Notes
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-primary)]/5 px-3 py-2.5 rounded-[var(--radius-md)]">
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
