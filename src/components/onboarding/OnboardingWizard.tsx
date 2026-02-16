import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Button, ThemePicker } from '@/components/ui'
import { useWorkoutTemplates, useSaveScheduleDayWorkouts, useClearSchedule } from '@/hooks/useSchedule'
import { useWorkoutDays, useWorkoutPlans } from '@/hooks/useWorkoutPlan'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useUploadAvatar, useAvatarUrl } from '@/hooks/useAvatar'
import { OnboardingDayRow, type DaySelection } from './OnboardingDayRow'
import { CaretDown, CaretLeft, CaretRight, Question, ArrowClockwise, Calendar, Barbell, ArrowUp, User, Camera, Sparkle } from '@phosphor-icons/react'
import { WEIGHTS_CONFIG } from '@/config/workoutConfig'
import {
  PPL_PLAN_ID,
  UPPER_LOWER_PLAN_ID,
  FULL_BODY_PLAN_ID,
  BRO_SPLIT_PLAN_ID,
  ARNOLD_SPLIT_PLAN_ID,
  GLUTE_HYPERTROPHY_PLAN_ID,
} from '@/config/planConstants'
import type { ScheduleWorkoutItem } from '@/services/scheduleService'

interface OnboardingWizardProps {
  isOpen: boolean
  onClose: () => void
  initialStep?: 1 | 2 | 3 | 4
  initialPlanId?: string
}

const INITIAL_SELECTIONS: Record<number, DaySelection[]> = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: []
}

export function OnboardingWizard({ isOpen, onClose, initialStep = 1, initialPlanId }: OnboardingWizardProps) {
  const { data: templates } = useWorkoutTemplates()
  const { data: plans } = useWorkoutPlans()
  const { data: profile } = useProfile()
  const { mutateAsync: updateProfile } = useUpdateProfile()
  const { mutateAsync: saveWorkouts, isPending } = useSaveScheduleDayWorkouts()
  const { mutateAsync: clearSchedule } = useClearSchedule()
  const { mutateAsync: uploadAvatar } = useUploadAvatar()
  const currentAvatarUrl = useAvatarUrl()

  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialStep)
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId || profile?.selected_plan_id || PPL_PLAN_ID)
  const { data: workoutDays } = useWorkoutDays(selectedPlanId)

  const [selections, setSelections] = useState<Record<number, DaySelection[]>>(INITIAL_SELECTIONS)
  const [cycleStartDate, setCycleStartDate] = useState(() => {
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date())
  })
  const [error, setError] = useState<string | null>(null)
  const [savingDay, setSavingDay] = useState<number | null>(null)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [showAbout, setShowAbout] = useState(false)
  const [expandedSplit, setExpandedSplit] = useState<string | null>(null)

  // Auto-builder state
  const [autoFocus, setAutoFocus] = useState<'all-weights' | 'all-cardio' | 'mix'>('mix')
  const [restDays, setRestDays] = useState<1 | 2 | 3>(2)
  const [mobilityImportant, setMobilityImportant] = useState(true)
  const [showMobilityNote, setShowMobilityNote] = useState(false)

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

      // Auto-builder defaults
      setAutoFocus('mix')
      setRestDays(2)
      setMobilityImportant(true)

      // Profile step defaults
      setDisplayName(profile?.display_name || '')
      setNameError(null)
      setAvatarFile(null)
      setAvatarPreview(currentAvatarUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialStep, initialPlanId])



  const cardioTemplates = useMemo(() => templates?.filter(t => t.type === 'cardio') || [], [templates])
  const mobilityTemplates = useMemo(() => {
    const all = templates?.filter(t => t.type === 'mobility') || []
    const seen = new Set<string>()
    return all.filter(t => {
      if (seen.has(t.name)) return false
      seen.add(t.name)
      return true
    })
  }, [templates])

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
  const [isSplitSaving, setIsSplitSaving] = useState(false)

  const handleSplitNext = useCallback(async () => {
    setIsSplitSaving(true)
    setError(null)
    try {
      await updateProfile({ selected_plan_id: selectedPlanId })
      setStep(3)
    } catch (err) {
      console.error('Failed to save split selection:', err)
      setError('Failed to save selection. Please try again.')
    } finally {
      setIsSplitSaving(false)
    }
  }, [selectedPlanId, updateProfile])

  const handleSelect = useCallback((dayNumber: number, newSelections: DaySelection[]) => {
    setSelections(prev => ({ ...prev, [dayNumber]: newSelections }))
    setError(null)
  }, [])

  const handleToggleExpand = useCallback((dayNumber: number) => {
    setExpandedDay(prev => prev === dayNumber ? null : dayNumber)
  }, [])

  const handleSave = useCallback(async () => {
    setError(null)

    // Check if at least one day is configured
    const configuredDays = Object.values(selections).filter(arr => arr.length > 0)
    if (configuredDays.length === 0) {
      setError('Please configure at least one day before saving.')
      return
    }

    try {
      // Clear existing schedule to prevent duplicate entries
      await clearSchedule()

      // Save each day sequentially
      for (let day = 1; day <= 7; day++) {
        const daySelections = selections[day]
        if (daySelections.length === 0) continue

        setSavingDay(day)

        const workouts: ScheduleWorkoutItem[] = daySelections
          .filter(sel => sel.type !== 'empty')
          .map(sel =>
            sel.type === 'rest'
              ? { type: 'rest' as const }
              : { type: sel.type as 'weights' | 'cardio' | 'mobility', id: sel.id }
          )

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

  const generateSchedule = useCallback(() => {
    const newSelections: Record<number, DaySelection[]> = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
    }
    const trainingDays = 7 - restDays
    const days = workoutDays || []
    const cardio = cardioTemplates
    const mobility = mobilityTemplates

    // Determine which days are rest days (spread evenly)
    const restPositions: number[] = []
    if (restDays === 1) {
      restPositions.push(7)
    } else if (restDays === 2) {
      restPositions.push(4, 7)
    } else if (restDays === 3) {
      restPositions.push(3, 5, 7)
    }

    // Mark rest days
    for (const pos of restPositions) {
      newSelections[pos] = [{ type: 'rest' }]
    }

    // Get training day positions (non-rest)
    const trainingPositions = [1, 2, 3, 4, 5, 6, 7].filter(d => !restPositions.includes(d))

    if (autoFocus === 'all-weights') {
      // Fill training days with rotating weight days
      let weightIdx = 0
      for (const pos of trainingPositions) {
        if (days.length > 0) {
          const day = days[weightIdx % days.length]
          newSelections[pos] = [{
            type: 'weights',
            id: day.id,
            label: day.name,
            dayNumber: day.day_number
          }]
          weightIdx++
        }
      }
    } else if (autoFocus === 'all-cardio') {
      // Fill training days with rotating cardio templates
      let cardioIdx = 0
      for (const pos of trainingPositions) {
        if (cardio.length > 0) {
          const c = cardio[cardioIdx % cardio.length]
          newSelections[pos] = [{
            type: 'cardio',
            id: c.id,
            label: c.name,
            category: c.category
          }]
          cardioIdx++
        }
      }
    } else {
      // Mix of both: alternate weights and cardio
      const weightSlots: number[] = []
      const cardioSlots: number[] = []

      // Assign weights days first (up to the number of plan days), rest to cardio
      const numWeightDays = Math.min(days.length, Math.ceil(trainingDays / 2))
      for (let i = 0; i < trainingPositions.length; i++) {
        if (i < numWeightDays) {
          weightSlots.push(trainingPositions[i])
        } else {
          cardioSlots.push(trainingPositions[i])
        }
      }

      // Fill weight slots
      let weightIdx = 0
      for (const pos of weightSlots) {
        if (days.length > 0) {
          const day = days[weightIdx % days.length]
          newSelections[pos] = [{
            type: 'weights',
            id: day.id,
            label: day.name,
            dayNumber: day.day_number
          }]
          weightIdx++
        }
      }

      // Fill cardio slots
      let cardioIdx = 0
      for (const pos of cardioSlots) {
        if (cardio.length > 0) {
          const c = cardio[cardioIdx % cardio.length]
          newSelections[pos] = [{
            type: 'cardio',
            id: c.id,
            label: c.name,
            category: c.category
          }]
          cardioIdx++
        }
      }
    }

    // Add mobility as a secondary workout on 2 training days
    // Filter out core — prefer hip/spine/upper body/shoulder prehab
    if (mobilityImportant && mobility.length > 0) {
      const nonCore = mobility.filter(m => m.category !== 'core')
      const mobilityPool = nonCore.length > 0 ? nonCore : mobility

      // Prefer cardio days, then fall back to weights days, spread apart
      const cardioDayPositions = trainingPositions.filter(
        pos => newSelections[pos].length > 0 && newSelections[pos][0].type === 'cardio'
      )
      const weightsDayPositions = trainingPositions.filter(
        pos => newSelections[pos].length > 0 && newSelections[pos][0].type === 'weights'
      )
      const candidatePositions = [...cardioDayPositions, ...weightsDayPositions]

      // Pick 2 positions spread apart: first and last candidate when possible
      const mobilityTargets: number[] = []
      if (candidatePositions.length >= 2) {
        mobilityTargets.push(candidatePositions[0])
        mobilityTargets.push(candidatePositions[candidatePositions.length - 1])
      } else if (candidatePositions.length === 1) {
        mobilityTargets.push(candidatePositions[0])
      }

      // Rotate through different mobility templates so each day gets a unique one
      mobilityTargets.forEach((pos, idx) => {
        const mob = mobilityPool[idx % mobilityPool.length]
        newSelections[pos] = [...newSelections[pos], {
          type: 'mobility',
          id: mob.id,
          label: mob.name,
          category: mob.category
        }]
      })
    }

    setSelections(newSelections)
    setError(null)
  }, [autoFocus, restDays, mobilityImportant, workoutDays, cardioTemplates, mobilityTemplates])

  // Count configured days
  const configuredCount = Object.values(selections).filter(arr => arr.length > 0).length

  if (!isOpen) return null

  const SPLIT_OPTIONS = [
    {
      id: PPL_PLAN_ID, key: 'ppl', fallbackName: 'Push / Pull / Legs',
      gradient: 'from-[var(--color-cardio)] to-[var(--color-warning)]', Icon: Barbell,
      desc: 'Best for focused muscle group training, 5-6 days/week.',
      detail: 'Separates pushing movements (chest, shoulders, triceps), pulling movements (back, biceps), and legs into dedicated days. This lets you hit each muscle group with higher volume while giving them plenty of time to recover before the next session.',
      tags: [{ key: 'push', label: 'Push' }, { key: 'pull', label: 'Pull' }, { key: 'legs', label: 'Legs' }],
    },
    {
      id: UPPER_LOWER_PLAN_ID, key: 'ul', fallbackName: 'Upper / Lower',
      gradient: 'from-[var(--color-weights)] to-[var(--color-info)]', Icon: ArrowUp,
      desc: 'Simple and balanced, great for beginners or 3-4 days/week.',
      detail: "Alternates between upper body and lower body sessions, so you train your full body every two workouts. It's straightforward to follow and gives each half of your body a full day to recover between sessions.",
      tags: [{ key: 'upper', label: 'Upper' }, { key: 'lower', label: 'Lower' }],
    },
    {
      id: FULL_BODY_PLAN_ID, key: 'fb', fallbackName: 'Full Body',
      gradient: 'from-[var(--color-primary)] to-[var(--color-accent)]', Icon: Barbell,
      desc: '5 unique full-body workouts \u2014 pick any 3 per week.',
      detail: 'Each session trains every major muscle group with different exercises and rep ranges. Pick any 3 of the 5 workouts per week. Great for balanced development and flexible scheduling.',
      tags: ['full body a', 'full body b', 'full body c', 'full body d', 'full body e'].map(k => ({ key: k, label: k.replace('full body ', 'FB ').toUpperCase() })),
    },
    {
      id: BRO_SPLIT_PLAN_ID, key: 'bro', fallbackName: 'Bro Split',
      gradient: 'from-[var(--color-cardio)] to-[var(--color-weights)]', Icon: Barbell,
      desc: 'Chest \u00B7 Back \u00B7 Legs \u00B7 Shoulders \u00B7 Arms \u2014 5 days per week.',
      detail: 'Each day focuses on one muscle group with high volume. This classic bodybuilding approach lets you fully fatigue each body part before giving it a full week to recover.',
      tags: ['chest', 'back', 'legs', 'shoulders', 'arms'].map(k => ({ key: k, label: k.charAt(0).toUpperCase() + k.slice(1) })),
    },
    {
      id: ARNOLD_SPLIT_PLAN_ID, key: 'arnold', fallbackName: 'Arnold Split',
      gradient: 'from-[var(--color-cardio)] to-[var(--color-info)]', Icon: Barbell,
      desc: 'Chest & Back \u00B7 Shoulders & Arms \u00B7 Legs \u2014 6-day cycle.',
      detail: "Inspired by Arnold Schwarzenegger's training philosophy. Pairs opposing muscle groups (chest with back, shoulders with arms) for high-volume supersets. The 3-day cycle repeats twice per week with one rest day.",
      tags: ['chest & back', 'shoulders & arms', 'legs'].map(k => ({ key: k, label: k.split(' ').map(w => w === '&' ? '&' : w.charAt(0).toUpperCase() + w.slice(1)).join(' ') })),
    },
    {
      id: GLUTE_HYPERTROPHY_PLAN_ID, key: 'glute', fallbackName: 'Glute Hypertrophy',
      gradient: 'from-[var(--color-cardio)] to-[var(--color-danger)]', Icon: Barbell,
      desc: '3 Lower / 2 Upper \u00B7 5 days \u2014 lower body focused with glute emphasis.',
      detail: 'Based on the Strong Curves approach. Three dedicated lower-body days target glutes from every angle \u2014 posterior chain, quads, and isolation pump work \u2014 while two upper-body days maintain balanced strength and posture.',
      tags: ['lower a', 'upper a', 'lower b', 'upper b', 'lower c'].map(k => ({ key: k, label: k.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') })),
    },
  ] as const

  // Back button logic — always navigate through all steps
  const handleBack = () => {
    if (step === 1) {
      onClose()
    } else if (step === 2) {
      setStep(1)
    } else if (step === 3) {
      setStep(2)
    } else {
      setStep(3)
    }
  }

  // Forward button logic
  const handleForward = () => {
    if (step === 1) handleProfileNext()
    else if (step === 2) handleSplitNext()
    else if (step === 3) { generateSchedule(); setStep(4) }
    // Step 4 uses the footer "Start Training" button
  }

  return (
    <div className="fixed inset-0 z-[70] bg-[var(--color-background)] flex flex-col">
      {/* Progress Bar */}
      <div className="flex-shrink-0 flex gap-1.5 px-4 pt-3">
        <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 1 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
        <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
        <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 3 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
        <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 4 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
      </div>

      {/* Navigation Row */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors"
          >
            <CaretLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
        {step < 4 && (
          <button
            onClick={handleForward}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors"
          >
            <CaretRight className="w-5 h-5" />
          </button>
        )}
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
                  nameError ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'
                }`}
              />
              {nameError && (
                <p className="mt-1.5 text-sm text-[var(--color-danger)]">{nameError}</p>
              )}
            </div>

            {/* Theme Selection */}
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-[var(--color-text)]">Appearance</h3>
                <p className="text-sm text-[var(--color-text-muted)]">Choose your theme preference</p>
              </div>

              <ThemePicker />
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
                Select how you want to organize your muscle groups across training days
              </p>
            </div>

            {/* Split Options */}
            <div className="space-y-3">
              {SPLIT_OPTIONS.map(({ id, key, fallbackName, gradient, Icon, desc, detail, tags }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectPlan(id)}
                  className={`
                    w-full rounded-2xl p-5 text-left transition-all duration-200
                    border-2 bg-[var(--color-surface)]
                    ${selectedPlanId === id
                      ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30'
                      : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[var(--color-text)]">
                        {plans?.find(p => p.id === id)?.name || fallbackName}
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        {desc}{' '}
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); setExpandedSplit(expandedSplit === key ? null : key) }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setExpandedSplit(expandedSplit === key ? null : key) } }}
                          className="text-[var(--color-primary)] hover:underline font-medium cursor-pointer"
                        >
                          {expandedSplit === key ? 'Less' : 'See more'}
                        </span>
                      </p>
                      {expandedSplit === key && (
                        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mt-1">
                          {detail}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {tags.map(tag => (
                          <span key={tag.key} className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: WEIGHTS_CONFIG[tag.key].bgColor, color: WEIGHTS_CONFIG[tag.key].color }}>
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedPlanId === id && (
                      <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 rounded-xl bg-[var(--color-danger-muted)] border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm">
                {error}
              </div>
            )}
          </div>
        ) : step === 3 ? (
          /* Step 3: Build Your Program */
          <div className="max-w-lg mx-auto px-6 py-4 space-y-6">
            {/* Heading */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[var(--color-text)]">
                Build Your Workout Cycle
              </h2>
              <p className="text-[var(--color-text-muted)]">
                Answer a few questions and we'll create a 7-day rotation for you
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
                <div className="w-10 h-10 rounded-full bg-[var(--color-info-muted)] flex items-center justify-center">
                  <Question className="w-5 h-5 text-[var(--color-info)]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-[var(--color-text)]">How does this work?</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Learn about the schedule system</p>
                </div>
                <CaretDown className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform duration-200 ${showAbout ? 'rotate-180' : ''}`} />
              </button>

              {showAbout && (
                <div className="border-t border-[var(--color-border)] p-4 space-y-4 bg-[var(--color-background)]">
                  {/* Continuous Rotation */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ArrowClockwise className="w-4 h-4 text-[var(--color-primary)]" />
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
                    <div className="w-8 h-8 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
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

            {/* Auto-Builder Questions (shown directly) */}
            <div className="space-y-5">
              {/* Q1: Workout Crosshair */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--color-text)]">What's your workout focus?</p>
                <div className="flex gap-2">
                  {([['all-weights', 'All Weights'], ['all-cardio', 'All Cardio'], ['mix', 'Mix of Both']] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAutoFocus(value)}
                      className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all ${
                        autoFocus === value
                          ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                          : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2: Rest Days */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--color-text)]">How many rest days per week?</p>
                <div className="flex gap-2">
                  {([1, 2, 3] as const).map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRestDays(value)}
                      className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all ${
                        restDays === value
                          ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                          : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {value} day{value > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3: Mobility */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--color-text)]">Include mobility work?</p>
                <div className="flex gap-2">
                  {([true, false] as const).map(value => (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => setMobilityImportant(value)}
                      className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-all ${
                        mobilityImportant === value
                          ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                          : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {value ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] italic leading-relaxed pt-1">
                  I highly recommend including mobility work — it changed everything for me after an injury.{' '}
                  <button
                    type="button"
                    onClick={() => setShowMobilityNote(!showMobilityNote)}
                    className="text-[var(--color-primary)] hover:underline not-italic font-medium"
                  >
                    {showMobilityNote ? 'Less' : 'My story'}
                  </button>
                </p>
                {showMobilityNote && (
                  <div className="text-xs text-[var(--color-text-muted)] leading-relaxed bg-[var(--color-surface-hover)] rounded-lg p-3">
                    <p>
                      A knee injury led to chronic low back pain that stopped me from doing the things I loved every day — it really affected my mood and who I was. I ended up spending a month in Bali training at Nirvana Strength, where I rebuilt my body through daily mobility work. That experience is what inspired this app, and where I first started building it with Claude Code. I now practice mobility every single day and I genuinely believe it belongs in every training program. — Jaron
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Step 4: Your 7-Day Cycle */
          <div className="max-w-lg mx-auto px-6 py-4 space-y-6">
            {/* Heading */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[var(--color-text)]">
                Your 7-Day Cycle
              </h2>
              <p className="text-[var(--color-text-muted)]">
                Review and customize your schedule
              </p>
            </div>

            {/* Contextual message */}
            {configuredCount > 0 ? (
              <div className="rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 p-4 flex items-start gap-3">
                <Sparkle className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--color-text-muted)]">
                  Your program is ready — feel free to customize any day below.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Configure each day of your 7-day cycle.
                </p>
              </div>
            )}

            {/* Day Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Schedule
                </h3>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {configuredCount}/7 days set
                </span>
              </div>

              {[1, 2, 3, 4, 5, 6, 7].map(dayNumber => (
                <OnboardingDayRow
                  key={dayNumber}
                  dayNumber={dayNumber}
                  selections={selections[dayNumber]}
                  onSelect={(sels) => handleSelect(dayNumber, sels)}
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
              <div className="p-4 rounded-xl bg-[var(--color-danger-muted)] border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm">
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
            <Button size="lg" onClick={handleSplitNext} loading={isSplitSaving} disabled={isSplitSaving} className="w-full">
              Continue
            </Button>
          ) : step === 3 ? (
            <div className="space-y-2">
              <Button
                size="lg"
                onClick={() => { generateSchedule(); setStep(4) }}
                className="w-full"
              >
                <Sparkle className="w-4 h-4 mr-2" />
                Build My Program
              </Button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                No thanks, I'll build it from scratch
              </button>
            </div>
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
