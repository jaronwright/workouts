import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useReviewStore } from '@/stores/reviewStore'
import { useCreateReview } from '@/hooks/useReview'
import { springs } from '@/config/animationConfig'
import { REVIEW_STEPS } from '@/config/reviewConfig'
import { StarRating } from './StarRating'
import { DifficultyRating } from './DifficultyRating'
import { MoodSelector } from './MoodSelector'
import { EnergyLevel } from './EnergyLevel'
import { PerformanceTagPicker } from './PerformanceTagPicker'
import { ReflectionForm } from './ReflectionForm'

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
}

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
    step,
    totalSteps,
    closeReview,
    updateDraft,
    toggleTag,
    nextStep,
    prevStep,
  } = useReviewStore()

  const createReview = useCreateReview()
  const [direction, setDirection] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const submittedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (submittedTimerRef.current) clearTimeout(submittedTimerRef.current)
    }
  }, [])

  const handleNext = useCallback(() => {
    setDirection(1)
    nextStep()
  }, [nextStep])

  const handlePrev = useCallback(() => {
    setDirection(-1)
    prevStep()
  }, [prevStep])

  const handleSubmit = useCallback(async () => {
    await createReview.mutateAsync({
      session_id: currentSessionId || undefined,
      template_session_id: currentTemplateSessionId || undefined,
      overall_rating: draft.overallRating,
      difficulty_rating: draft.difficultyRating ?? undefined,
      energy_level: draft.energyLevel ?? undefined,
      mood_before: draft.moodBefore ?? undefined,
      mood_after: draft.moodAfter ?? undefined,
      performance_tags: draft.performanceTags,
      reflection: draft.reflection || undefined,
      highlights: draft.highlights || undefined,
      improvements: draft.improvements || undefined,
      workout_duration_minutes: workoutDurationMinutes ?? undefined,
    })
    setSubmitted(true)
    submittedTimerRef.current = setTimeout(() => {
      setSubmitted(false)
      closeReview()
      onComplete?.()
    }, 1500)
  }, [createReview, currentSessionId, currentTemplateSessionId, draft, workoutDurationMinutes, closeReview])

  const currentStepConfig = REVIEW_STEPS[step]
  const isLastStep = step === totalSteps - 1
  const canProceed = step === 0 ? draft.overallRating > 0 : true

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
          onClick={closeReview}
        />

        {/* Modal content */}
        <motion.div
          className="relative flex flex-col bg-[var(--color-surface)] rounded-t-3xl mt-auto max-h-[90vh] overflow-hidden"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={springs.default}
        >
          {/* Success overlay */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--color-surface)]"
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
                    <Sparkles className="w-10 h-10" style={{ color: 'var(--color-success)' }} />
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
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                {currentStepConfig.title}
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                {currentStepConfig.subtitle}
              </p>
            </div>
            <button
              onClick={closeReview}
              className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-1.5 px-5 pb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 h-1 rounded-full"
                style={{
                  backgroundColor:
                    i <= step ? 'var(--color-primary)' : 'var(--color-border)',
                }}
                animate={{
                  backgroundColor:
                    i <= step ? 'var(--color-primary)' : 'var(--color-border)',
                }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto px-5 pb-6 min-h-[300px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={springs.default}
              >
                {step === 0 && (
                  <div className="flex flex-col items-center gap-8 pt-4">
                    <StarRating
                      value={draft.overallRating}
                      onChange={(rating) => updateDraft({ overallRating: rating })}
                      size="lg"
                    />
                    <DifficultyRating
                      value={draft.difficultyRating}
                      onChange={(level) => updateDraft({ difficultyRating: level })}
                    />
                  </div>
                )}

                {step === 1 && (
                  <div className="flex flex-col gap-6 pt-4">
                    <MoodSelector
                      value={draft.moodBefore}
                      onChange={(mood) => updateDraft({ moodBefore: mood })}
                      label="Before"
                    />
                    <MoodSelector
                      value={draft.moodAfter}
                      onChange={(mood) => updateDraft({ moodAfter: mood })}
                      label="After"
                    />
                    <EnergyLevel
                      value={draft.energyLevel}
                      onChange={(level) => updateDraft({ energyLevel: level })}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="pt-2">
                    <PerformanceTagPicker
                      selectedTags={draft.performanceTags}
                      onToggle={toggleTag}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="pt-2">
                    <ReflectionForm
                      reflection={draft.reflection}
                      highlights={draft.highlights}
                      improvements={draft.improvements}
                      onReflectionChange={(v) => updateDraft({ reflection: v })}
                      onHighlightsChange={(v) => updateDraft({ highlights: v })}
                      onImprovementsChange={(v) => updateDraft({ improvements: v })}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            {step > 0 ? (
              <Button variant="ghost" size="md" onClick={handlePrev}>
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            <div className="flex-1" />

            {currentStepConfig.optional && !isLastStep && (
              <Button variant="ghost" size="md" onClick={handleNext}>
                Skip
              </Button>
            )}

            {isLastStep ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                loading={createReview.isPending}
                disabled={!canProceed}
              >
                <Check className="w-4 h-4" />
                Submit
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                disabled={!canProceed}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
