import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Check, Sparkle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { useReviewStore } from '@/stores/reviewStore'
import { useCreateReview } from '@/hooks/useReview'
import { springs } from '@/config/animationConfig'
import { StarRating } from './StarRating'
import { DifficultyRating } from './DifficultyRating'
import { MoodSelector } from './MoodSelector'
import { PerformanceTagPicker } from './PerformanceTagPicker'

interface PostWorkoutReviewProps {
  onComplete?: () => void
}

export function PostWorkoutReview({ onComplete }: PostWorkoutReviewProps) {
  const {
    isReviewModalOpen,
    currentSessionId,
    currentTemplateSessionId,
    workoutDurationMinutes,
    draft,
    closeReview,
    updateDraft,
    toggleTag,
  } = useReviewStore()

  const createReview = useCreateReview()
  const [submitted, setSubmitted] = useState(false)
  const submittingRef = useRef(false)
  const submittedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (submittedTimerRef.current) clearTimeout(submittedTimerRef.current)
      submittingRef.current = false
    }
  }, [])

  const handleSkip = useCallback(() => {
    closeReview()
    onComplete?.()
  }, [closeReview, onComplete])

  const handleSubmit = useCallback(async () => {
    // Synchronous guard — prevents double-submit even if React hasn't re-rendered yet
    if (submittingRef.current) return
    submittingRef.current = true

    const hasAnyInput =
      draft.overallRating > 0 ||
      draft.difficultyRating !== null ||
      draft.moodAfter !== null ||
      draft.performanceTags.length > 0

    if (!hasAnyInput) {
      submittingRef.current = false
      closeReview()
      onComplete?.()
      return
    }

    try {
      await createReview.mutateAsync({
        session_id: currentSessionId || undefined,
        template_session_id: currentTemplateSessionId || undefined,
        overall_rating: draft.overallRating || undefined,
        difficulty_rating: draft.difficultyRating ?? undefined,
        mood_after: draft.moodAfter ?? undefined,
        performance_tags: draft.performanceTags,
        workout_duration_minutes: workoutDurationMinutes ?? undefined,
      })
      setSubmitted(true)
      submittedTimerRef.current = setTimeout(() => {
        setSubmitted(false)
        submittingRef.current = false
        closeReview()
        onComplete?.()
      }, 1200)
    } catch {
      // Mutation failed — still navigate home so the user isn't stuck
      submittingRef.current = false
      closeReview()
      onComplete?.()
    }
  }, [createReview, currentSessionId, currentTemplateSessionId, draft, workoutDurationMinutes, closeReview, onComplete])

  if (!isReviewModalOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleSkip}
        />

        {/* Bottom sheet */}
        <motion.div
          className="relative flex flex-col bg-[var(--color-surface-elevated)] rounded-t-3xl mt-auto max-h-[85vh]"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={springs.default}
        >
          {/* Success overlay */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--color-surface-elevated)] rounded-t-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--color-success-muted)' }}>
                    <Sparkle className="w-10 h-10" style={{ color: 'var(--color-success)' }} />
                  </div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg font-semibold text-[var(--color-text)]"
                >
                  Review Saved!
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              How was your workout?
            </h2>
            <button
              onClick={handleSkip}
              className="p-2 -mr-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors"
              aria-label="Skip review"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 pb-4">
            <div className="flex flex-col gap-6">
              {/* Star rating */}
              <div className="flex flex-col items-center pt-1">
                <StarRating
                  value={draft.overallRating}
                  onChange={(rating) => updateDraft({ overallRating: rating })}
                  size="lg"
                />
              </div>

              {/* Difficulty */}
              <DifficultyRating
                value={draft.difficultyRating}
                onChange={(level) => updateDraft({ difficultyRating: level })}
              />

              {/* Mood — single selector, saves as moodAfter */}
              <MoodSelector
                value={draft.moodAfter}
                onChange={(mood) => updateDraft({ moodAfter: mood })}
                label="Mood"
              />

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide text-center">
                  Tags
                </span>
                <PerformanceTagPicker
                  selectedTags={draft.performanceTags}
                  onToggle={toggleTag}
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex flex-col items-center gap-2 px-5 pt-3 pb-5 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              loading={createReview.isPending}
            >
              <Check className="w-5 h-5" />
              Finish Workout
            </Button>
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] py-1 transition-colors"
            >
              Skip Review
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
