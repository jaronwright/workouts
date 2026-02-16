import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Button, Modal } from '@/components/ui'
import { PressableCard } from '@/components/motion'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useClearSchedule } from '@/hooks/useSchedule'
import { useToast } from '@/hooks/useToast'
import { OnboardingWizard } from '@/components/onboarding'
import { ArrowsLeftRight, ArrowsDownUp, Barbell, Fire, Trophy, Heart, CaretDown, Check } from '@phosphor-icons/react'
import { springPresets } from '@/config/animationConfig'
import {
  PPL_PLAN_ID,
  UPPER_LOWER_PLAN_ID,
  FULL_BODY_PLAN_ID,
  BRO_SPLIT_PLAN_ID,
  ARNOLD_SPLIT_PLAN_ID,
  GLUTE_HYPERTROPHY_PLAN_ID,
  SPLIT_NAMES,
} from '@/config/planConstants'

const SPLITS = [
  [PPL_PLAN_ID, 'Push/Pull/Legs', ArrowsLeftRight],
  [UPPER_LOWER_PLAN_ID, 'Upper/Lower', ArrowsDownUp],
  [FULL_BODY_PLAN_ID, 'Full Body', Barbell],
  [BRO_SPLIT_PLAN_ID, 'Bro Split', Fire],
  [ARNOLD_SPLIT_PLAN_ID, 'Arnold Split', Trophy],
  [GLUTE_HYPERTROPHY_PLAN_ID, 'Glute Hypertrophy', Heart],
] as const

export function WorkoutSplitSection() {
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const { mutateAsync: updateProfileAsync, isPending: isSaving } = useUpdateProfile()
  const { mutateAsync: clearSchedule } = useClearSchedule()
  const { error: showError } = useToast()

  const [expanded, setExpanded] = useState(false)
  const [showSplitConfirm, setShowSplitConfirm] = useState(false)
  const [pendingSplitId, setPendingSplitId] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const currentSplitId = profile?.selected_plan_id || PPL_PLAN_ID
  const currentSplitName = SPLIT_NAMES[currentSplitId] || 'Push / Pull / Legs'

  const handleSplitChange = (newPlanId: string) => {
    if (newPlanId === currentSplitId) return
    setPendingSplitId(newPlanId)
    setShowSplitConfirm(true)
  }

  const confirmSplitChange = async () => {
    if (!pendingSplitId) return
    try {
      await updateProfileAsync({ selected_plan_id: pendingSplitId })
    } catch (err) {
      console.error('Failed to update workout split:', err)
      showError('Failed to change workout split. Please try again.')
      setShowSplitConfirm(false)
      setPendingSplitId(null)
      return
    }
    try {
      await clearSchedule()
    } catch (err) {
      console.error('Failed to clear schedule after split change:', err)
    }
    setShowSplitConfirm(false)
    setExpanded(false)
    setShowOnboarding(true)
  }

  return (
    <>
      <div className="px-[var(--space-4)] pt-[var(--space-4)]">
        {/* Clickable header — toggles grid visibility */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-[var(--space-2)] mb-[var(--space-3)] cursor-pointer group"
        >
          <div className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
          <h3
            className="text-[var(--text-xs)] text-[var(--color-text-muted)] uppercase"
            style={{ letterSpacing: 'var(--tracking-widest)', fontWeight: 600 }}
          >
            Workout Split
          </h3>
          <span className="text-[var(--text-xs)] text-[var(--color-primary)] font-semibold ml-auto">
            {currentSplitName}
          </span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={springPresets.snappy}
          >
            <CaretDown className="w-3.5 h-3.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]" weight="bold" />
          </motion.div>
        </button>

        {/* Expandable split grid */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-[var(--space-2)] pb-[var(--space-1)]">
                {SPLITS.map(([planId, label, Icon]) => {
                  const isActive = currentSplitId === planId
                  return (
                    <PressableCard key={planId} onClick={() => handleSplitChange(planId)}>
                      <div
                        className={`
                          relative flex items-center gap-[var(--space-3)]
                          px-[var(--space-3)] py-[var(--space-3)] min-h-[52px]
                          rounded-[var(--radius-lg)] transition-all
                          ${isActive
                            ? 'bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20'
                            : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
                          }
                        `}
                      >
                        <Icon
                          className={`w-5 h-5 shrink-0 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
                          weight={isActive ? 'fill' : 'regular'}
                        />
                        <span className={`text-[var(--text-sm)] font-medium leading-tight ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                          {label}
                        </span>
                        {isActive && (
                          <Check className="w-4 h-4 text-[var(--color-primary)] ml-auto shrink-0" weight="bold" />
                        )}
                      </div>
                    </PressableCard>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Split Change Confirmation Modal */}
      <Modal
        isOpen={showSplitConfirm}
        onClose={() => {
          setShowSplitConfirm(false)
          setPendingSplitId(null)
        }}
        title="Change Workout Split"
      >
        <div className="space-y-[var(--space-4)]">
          <p className="text-sm text-[var(--color-text-muted)]">
            Changing your workout split will reset your schedule. You'll be able to set up a new schedule for the selected split.
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Your existing workout history will not be affected.
          </p>
          <div className="flex gap-[var(--space-3)]">
            <Button
              variant="secondary"
              onClick={() => {
                setShowSplitConfirm(false)
                setPendingSplitId(null)
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={confirmSplitChange} loading={isSaving} className="flex-1">
              Change Split
            </Button>
          </div>
        </div>
      </Modal>

      {/* Onboarding Wizard for schedule setup after split change */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => { setShowOnboarding(false); setPendingSplitId(null); navigate('/') }}
        initialStep={3}
        initialPlanId={pendingSplitId || currentSplitId}
      />
    </>
  )
}
