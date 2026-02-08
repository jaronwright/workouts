import { useState, useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/ui'
import { useWorkoutTemplates, useSaveScheduleDayWorkouts, useClearSchedule } from '@/hooks/useSchedule'
import { useWorkoutDays, useWorkoutPlans } from '@/hooks/useWorkoutPlan'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useUploadAvatar } from '@/hooks/useAvatar'
import { OnboardingDayRow, type DaySelection } from './OnboardingDayRow'
import { X, ChevronDown, ChevronLeft, HelpCircle, RefreshCw, Calendar, Dumbbell, ArrowUp, User, Camera } from 'lucide-react'
import { WEIGHTS_CONFIG } from '@/config/workoutConfig'
import type { ScheduleWorkoutItem } from '@/services/scheduleService'

interface OnboardingWizardProps {
  isOpen: boolean
  onClose: () => void
  initialStep?: 1 | 2 | 3
  initialPlanId?: string
}

const PPL_PLAN_ID = '00000000-0000-0000-0000-000000000001'
const UPPER_LOWER_PLAN_ID = '00000000-0000-0000-0000-000000000002'

const INITIAL_SELECTIONS: Record<number, DaySelection> = {
  1: { type: 'empty' },
  2: { type: 'empty' },
  3: { type: 'empty' },
  4: { type: 'empty' },
  5: { type: 'empty' },
  6: { type: 'empty' },
  7: { type: 'empty' }
}

export function OnboardingWizard({ isOpen, onClose, initialStep = 1, initialPlanId }: OnboardingWizardProps) {
  const { data: templates } = useWorkoutTemplates()
  const { data: plans } = useWorkoutPlans()
  const { data: profile } = useProfile()
  const { mutateAsync: updateProfile } = useUpdateProfile()
  const { mutateAsync: saveWorkouts, isPending } = useSaveScheduleDayWorkouts()
  const { mutateAsync: clearSchedule } = useClearSchedule()
  const { mutateAsync: uploadAvatar } = useUploadAvatar()

  const [step, setStep] = useState<1 | 2 | 3>(initialStep)
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId || profile?.selected_plan_id || PPL_PLAN_ID)
  const { data: workoutDays } = useWorkoutDays(selectedPlanId)

  const [selections, setSelections] = useState<Record<number, DaySelection>>(INITIAL_SELECTIONS)
  const [cycleStartDate, setCycleStartDate] = useState(() => {
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date())
  })
  const [error, setError] = useState<string | null>(null)
  const [savingDay, setSavingDay] = useState<number | null>(null)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  // Profile step state
  const [displayName, setDisplayName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset step and selection when wizard opens
  // Only trigger on isOpen/initialStep/initialPlanId changes — NOT profile loads
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep)
      setSelectedPlanId(initialPlanId || profile?.selected_plan_id || PPL_PLAN_ID)
      setSelections(INITIAL_SELECTIONS)
      setCycleStartDate(new Intl.DateTimeFormat('en-CA', {
        year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(new Date()))
      setError(null)
      setExpandedDay(null)

      // Profile step defaults
      setDisplayName(profile?.display_name || '')
      setNameError(null)
      setAvatarFile(null)
      setAvatarPreview(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialStep, initialPlanId])



  const cardioTemplates = templates?.filter(t => t.type === 'cardio') || []
  const mobilityTemplates = templates?.filter(t => t.type === 'mobility') || []

  const handleSelectPlan = useCallback((planId: string) => {
    setSelectedPlanId(planId)
    setError(null)
  }, [])

  // Step 1 → Step 2: save profile name + photo
  const handleProfileNext = useCallback(async () => {
    const trimmed = displayName.trim()
    if (!trimmed) {
      setNameError('Please enter your name')
      return
    }
    setNameError(null)
    setIsProfileSaving(true)

    try {
      await updateProfile({ display_name: trimmed })
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Failed to save profile. Please try again.')
      setIsProfileSaving(false)
      return
    }

    // If user selected a photo file, upload it (non-blocking)
    if (avatarFile) {
      try {
        await uploadAvatar(avatarFile)
      } catch {
        // Upload failure is non-blocking
      }
    }

    setIsProfileSaving(false)
    setStep(2)
  }, [displayName, avatarFile, updateProfile, uploadAvatar])

  // Step 2 → Step 3: save selected plan
  const handleSplitNext = useCallback(async () => {
    try {
      await updateProfile({ selected_plan_id: selectedPlanId })
    } catch {
      setError('Failed to save selection. Please try again.')
      return
    }
    setStep(3)
  }, [selectedPlanId, updateProfile])

  const handleSelect = useCallback((dayNumber: number, selection: DaySelection) => {
    setSelections(prev => ({ ...prev, [dayNumber]: selection }))
    setError(null)
  }, [])

  const handleToggleExpand = useCallback((dayNumber: number) => {
    setExpandedDay(prev => prev === dayNumber ? null : dayNumber)
  }, [])

  const handleSave = useCallback(async () => {
    setError(null)

    // Check if at least one day is configured
    const configuredDays = Object.values(selections).filter(s => s.type !== 'empty')
    if (configuredDays.length === 0) {
      setError('Please configure at least one day before saving.')
      return
    }

    try {
      // Clear existing schedule to prevent duplicate entries
      await clearSchedule()

      // Save each day sequentially
      for (let day = 1; day <= 7; day++) {
        const sel = selections[day]
        if (sel.type === 'empty') continue

        setSavingDay(day)

        const workouts: ScheduleWorkoutItem[] = sel.type === 'rest'
          ? [{ type: 'rest' }]
          : [{ type: sel.type, id: sel.id }]

        await saveWorkouts({ dayNumber: day, workouts })
      }

      // Save cycle start date and timezone
      await updateProfile({
        cycle_start_date: cycleStartDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })

      setSavingDay(null)
      onClose()
    } catch (err) {
      setSavingDay(null)
      console.error('Failed to save schedule:', err)
      setError(err instanceof Error ? err.message : 'Failed to save schedule. Please try again.')
    }
  }, [selections, saveWorkouts, clearSchedule, updateProfile, cycleStartDate, onClose])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }, [])

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  // Count configured days
  const configuredCount = Object.values(selections).filter(s => s.type !== 'empty').length

  if (!isOpen) return null

  const pplPlan = plans?.find(p => p.id === PPL_PLAN_ID)
  const ulPlan = plans?.find(p => p.id === UPPER_LOWER_PLAN_ID)

  // Back button logic
  const handleBack = () => {
    if (step === 1) {
      onClose()
    } else if (step === 2) {
      if (initialStep >= 2) onClose()
      else setStep(1)
    } else {
      if (initialStep >= 3) onClose()
      else setStep(2)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] bg-[var(--color-background)] flex flex-col">
      {/* Progress Bar */}
      <div className="flex-shrink-0 flex gap-1.5 px-4 pt-3">
        <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 1 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
        <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
        <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 3 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
      </div>

      {/* Navigation Row */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2">
        <div className="w-10">
          {((step === 2 && initialStep < 2) || (step === 3 && initialStep < 3)) && (
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto">
        {step === 1 ? (
          /* Step 1: Profile Setup */
          <div className="max-w-lg mx-auto px-6 py-4 space-y-8">
            {/* Heading */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[var(--color-text)]">
                What's your name?
              </h2>
              <p className="text-[var(--color-text-muted)]">
                Personalize your training experience
              </p>
            </div>

            {/* Profile Photo */}
            <div className="flex flex-col items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-28 h-28 rounded-full object-cover border-2 border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-primary)] transition-colors">
                    <User className="w-10 h-10 text-[var(--color-text-muted)]/40" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-lg ring-3 ring-[var(--color-background)]">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </button>
              <p className="text-sm text-[var(--color-text-muted)]">
                {avatarPreview ? 'Tap to change photo' : 'Add a photo (optional)'}
              </p>
            </div>

            {/* Name Input */}
            <div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value)
                  if (nameError) setNameError(null)
                }}
                placeholder="Your name"
                autoFocus
                className={`w-full px-5 py-4 text-lg rounded-2xl border bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors ${
                  nameError ? 'border-red-500' : 'border-[var(--color-border)]'
                }`}
              />
              {nameError && (
                <p className="mt-1.5 text-sm text-red-500">{nameError}</p>
              )}
            </div>
          </div>
        ) : step === 2 ? (
          /* Step 2: Split Selection */
          <div className="max-w-lg mx-auto px-6 py-4 space-y-6">
            {/* Heading */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[var(--color-text)]">
                Choose Your Training Split
              </h2>
              <p className="text-[var(--color-text-muted)]">
                Select how to organize your training days
              </p>
            </div>

            {/* Split Options */}
            <div className="space-y-3">
              {/* PPL Card */}
              <button
                type="button"
                onClick={() => handleSelectPlan(PPL_PLAN_ID)}
                className={`
                  w-full rounded-2xl p-5 text-left transition-all duration-200
                  border-2 bg-[var(--color-surface)]
                  ${selectedPlanId === PPL_PLAN_ID
                    ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30'
                    : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--color-text)]">
                      {pplPlan?.name || 'Push / Pull / Legs'}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                      Great for focused muscle group training.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: WEIGHTS_CONFIG.push.bgColor, color: WEIGHTS_CONFIG.push.color }}>Push</span>
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: WEIGHTS_CONFIG.pull.bgColor, color: WEIGHTS_CONFIG.pull.color }}>Pull</span>
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: WEIGHTS_CONFIG.legs.bgColor, color: WEIGHTS_CONFIG.legs.color }}>Legs</span>
                    </div>
                  </div>
                  {selectedPlanId === PPL_PLAN_ID && (
                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              {/* Upper/Lower Card */}
              <button
                type="button"
                onClick={() => handleSelectPlan(UPPER_LOWER_PLAN_ID)}
                className={`
                  w-full rounded-2xl p-5 text-left transition-all duration-200
                  border-2 bg-[var(--color-surface)]
                  ${selectedPlanId === UPPER_LOWER_PLAN_ID
                    ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30'
                    : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <ArrowUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--color-text)]">
                      {ulPlan?.name || 'Upper / Lower'}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                      Simple and effective full-body coverage.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: WEIGHTS_CONFIG.upper.bgColor, color: WEIGHTS_CONFIG.upper.color }}>Upper</span>
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: WEIGHTS_CONFIG.lower.bgColor, color: WEIGHTS_CONFIG.lower.color }}>Lower</span>
                    </div>
                  </div>
                  {selectedPlanId === UPPER_LOWER_PLAN_ID && (
                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* Step 3: Schedule Setup */
          <div className="max-w-lg mx-auto px-6 py-4 space-y-6">
            {/* Heading */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[var(--color-text)]">
                Build Your Workout Cycle
              </h2>
              <p className="text-[var(--color-text-muted)]">
                Create a 7-day rotation that fits your goals
              </p>
            </div>

            {/* Cycle Start Date */}
            <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-text)]">Cycle Start Date</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Day 1 begins on this date</p>
                </div>
                <input
                  type="date"
                  value={cycleStartDate}
                  onChange={(e) => setCycleStartDate(e.target.value)}
                  className="bg-[var(--color-surface-hover)] text-[var(--color-text)] px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm"
                />
              </div>
            </div>

            {/* About Section - Collapsible */}
            <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAbout(!showAbout)}
                className="w-full flex items-center gap-3 p-4 hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-[var(--color-text)]">How does this work?</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Learn about the schedule system</p>
                </div>
                <ChevronDown className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform duration-200 ${showAbout ? 'rotate-180' : ''}`} />
              </button>

              {showAbout && (
                <div className="border-t border-[var(--color-border)] p-4 space-y-4 bg-[var(--color-background)]">
                  {/* Continuous Rotation */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <RefreshCw className="w-4 h-4 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text)] text-sm">Continuous 7-Day Rotation</p>
                      <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        Your schedule runs on a 7-day cycle that repeats indefinitely. After Day 7, it automatically loops back to Day 1. This creates a consistent routine regardless of the calendar.
                      </p>
                    </div>
                  </div>

                  {/* Independent of Calendar */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text)] text-sm">Independent of Calendar Days</p>
                      <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        Day 1 doesn't have to be Monday. Your cycle days overlay with calendar days based on when you started. If you miss a day, your schedule picks up where you left off.
                      </p>
                    </div>
                  </div>

                  {/* Example */}
                  <div className="bg-[var(--color-surface-hover)] rounded-xl p-3 mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Example</p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      If you start on a Wednesday with Day 1 = Push, then Thursday becomes Day 2, and so on. The following Tuesday would be Day 7, and Wednesday starts again at Day 1.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Day Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Your 7-Day Cycle
                </h3>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {configuredCount}/7 days set
                </span>
              </div>

              {[1, 2, 3, 4, 5, 6, 7].map(dayNumber => (
                <OnboardingDayRow
                  key={dayNumber}
                  dayNumber={dayNumber}
                  selection={selections[dayNumber]}
                  onSelect={(sel) => handleSelect(dayNumber, sel)}
                  workoutDays={workoutDays || []}
                  cardioTemplates={cardioTemplates}
                  mobilityTemplates={mobilityTemplates}
                  isExpanded={expandedDay === dayNumber}
                  onToggleExpand={() => handleToggleExpand(dayNumber)}
                />
              ))}
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Fixed Footer */}
      <footer className="flex-shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto">
          {step === 1 ? (
            <Button size="lg" onClick={handleProfileNext} loading={isProfileSaving} disabled={!displayName.trim()} className="w-full">
              Continue
            </Button>
          ) : step === 2 ? (
            <Button size="lg" onClick={handleSplitNext} className="w-full">
              Continue
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleSave}
              loading={isPending}
              disabled={configuredCount === 0}
              className="w-full"
            >
              {savingDay ? `Saving Day ${savingDay}...` : 'Start Training'}
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
