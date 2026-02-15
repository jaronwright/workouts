/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { Dumbbell } from 'lucide-react'
import { useExerciseInfo } from '@/hooks/useExerciseGif'

interface ExerciseGifThumbnailProps {
  exerciseName: string
  onClick: () => void
  size?: number
}

/**
 * Small circular GIF thumbnail for exercise cards.
 * Shows the exercise demonstration in a compact format.
 * Tapping opens the full detail modal.
 */
export function ExerciseGifThumbnail({
  exerciseName,
  onClick,
  size = 40,
}: ExerciseGifThumbnailProps) {
  const { gifUrl, isLoading } = useExerciseInfo(exerciseName)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [gifUrl])

  // Don't render anything if no GIF available and not loading
  if (!isLoading && !gifUrl) return null

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="
        flex-shrink-0 rounded-[var(--radius-md)] overflow-hidden
        bg-[var(--color-surface-hover)]
        active:scale-95 transition-transform duration-100
      "
      style={{ width: size, height: size }}
    >
      {gifUrl && !imageError ? (
        <>
          {!imageLoaded && (
            <div
              className="flex items-center justify-center bg-[var(--color-surface-hover)]"
              style={{ width: size, height: size }}
            >
              <Dumbbell className="w-4 h-4 text-[var(--color-text-muted)] animate-pulse" />
            </div>
          )}
          <img
            src={gifUrl}
            alt={exerciseName}
            className={`object-cover ${imageLoaded ? 'block' : 'hidden'}`}
            style={{ width: size, height: size }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </>
      ) : (
        <div
          className="flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <Dumbbell className="w-4 h-4 text-[var(--color-text-muted)]" />
        </div>
      )}
    </button>
  )
}
