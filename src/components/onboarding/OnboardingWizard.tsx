import { useState, useCallback } from 'react'
import { Button } from '@/components/ui'
import { useWorkoutTemplates, useSaveScheduleDayWorkouts } from '@/hooks/useSchedule'
import { useWorkoutDays } from '@/hooks/useWorkoutPlan'
import { OnboardingDayRow, type DaySelection } from './OnboardingDayRow'
import { X, ChevronDown, HelpCircle, RefreshCw, Calendar, Sparkles } from 'lucide-react'
import type { ScheduleWorkoutItem } from '@/services/scheduleService'

interface OnboardingWizardProps {
  isOpen: boolean
  onClose: () => void
}

const INITIAL_SELECTIONS: Record<number, DaySelection> = {
  1: { type: 'empty' },
  2: { type: 'empty' },
  3: { type: 'empty' },
  4: { type: 'empty' },
  5: { type: 'empty' },
  6: { type: 'empty' },
  7: { type: 'empty' }
}

export function OnboardingWizard({ isOpen, onClose }: OnboardingWizardProps) {
  const { data: templates } = useWorkoutTemplates()
  const { data: workoutDays } = useWorkoutDays()
  const { mutateAsync: saveWorkouts, isPending } = useSaveScheduleDayWorkouts()

  const [selections, setSelections] = useState<Record<number, DaySelection>>(INITIAL_SELECTIONS)
  const [error, setError] = useState<string | null>(null)
  const [savingDay, setSavingDay] = useState<number | null>(null)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  const cardioTemplates = templates?.filter(t => t.type === 'cardio') || []
  const mobilityTemplates = templates?.filter(t => t.type === 'mobility') || []

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

      setSavingDay(null)
      onClose()
    } catch (err) {
      setSavingDay(null)
      console.error('Failed to save schedule:', err)
      setError(err instanceof Error ? err.message : 'Failed to save schedule. Please try again.')
    }
  }, [selections, saveWorkouts, onClose])

  // Count configured days
  const configuredCount = Object.values(selections).filter(s => s.type !== 'empty').length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] bg-[var(--color-background)] flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="w-10" /> {/* Spacer for centering */}
        <h1 className="text-lg font-bold text-[var(--color-text)]">Set Up Your Schedule</h1>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {/* Welcome Message */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-500 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">
              Build Your Workout Cycle
            </h2>
            <p className="text-[var(--color-text-muted)]">
              Create a 7-day rotation that fits your fitness goals
            </p>
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
      </main>

      {/* Fixed Footer */}
      <footer className="flex-shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={isPending}
            disabled={configuredCount === 0}
            className="flex-1"
          >
            {savingDay ? `Saving Day ${savingDay}...` : 'Save Schedule'}
          </Button>
        </div>
      </footer>
    </div>
  )
}
