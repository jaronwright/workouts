import { useState } from 'react'
import { Moon, Check, Plus, X } from '@phosphor-icons/react'
import {
  WEIGHTS_CONFIG,
  getCardioStyle,
  getMobilityStyle,
  getWorkoutDisplayName
} from '@/config/workoutConfig'
import type { WorkoutTemplate } from '@/services/scheduleService'

interface WorkoutDay {
  id: string
  name: string
  day_number: number
}

export interface DaySelection {
  type: 'empty' | 'rest' | 'weights' | 'cardio' | 'mobility'
  id?: string
  label?: string
  category?: string | null
  dayNumber?: number
}

interface OnboardingDayRowProps {
  dayNumber: number
  selections: DaySelection[]
  onSelect: (selections: DaySelection[]) => void
  workoutDays: WorkoutDay[]
  cardioTemplates: WorkoutTemplate[]
  mobilityTemplates: WorkoutTemplate[]
  isExpanded: boolean
  onToggleExpand: () => void
}

function getWeightsKey(name: string): keyof typeof WEIGHTS_CONFIG {
  const lower = name.toLowerCase()
  if (lower.includes('push')) return 'push'
  if (lower.includes('pull')) return 'pull'
  if (lower.includes('leg')) return 'legs'
  if (lower.includes('upper')) return 'upper'
  if (lower.includes('lower')) return 'lower'
  return 'push'
}

function getSelectionStyle(selection: DaySelection) {
  if (selection.type === 'empty') {
    return { color: 'var(--color-text-muted)', bgColor: 'var(--color-surface-hover)', icon: null }
  }
  if (selection.type === 'rest') {
    return { color: 'var(--color-text-muted)', bgColor: 'var(--color-surface-hover)', icon: Moon }
  }
  if (selection.type === 'weights') {
    const key = getWeightsKey(selection.label || '')
    const wStyle = WEIGHTS_CONFIG[key]
    return { color: wStyle.color, bgColor: wStyle.bgColor, icon: wStyle.icon }
  }
  if (selection.type === 'cardio') {
    const cStyle = getCardioStyle(selection.category || null)
    return { color: cStyle.color, bgColor: cStyle.bgColor, icon: cStyle.icon }
  }
  if (selection.type === 'mobility') {
    const mStyle = getMobilityStyle(selection.category || null)
    return { color: mStyle.color, bgColor: mStyle.bgColor, icon: mStyle.icon }
  }
  return { color: 'var(--color-text-muted)', bgColor: 'var(--color-surface-hover)', icon: null }
}

export function OnboardingDayRow({
  dayNumber,
  selections,
  onSelect,
  workoutDays,
  cardioTemplates,
  mobilityTemplates,
  isExpanded,
  onToggleExpand
}: OnboardingDayRowProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)

  // Reset add menu when collapsing
  const handleToggle = () => {
    if (isExpanded) setShowAddMenu(false)
    onToggleExpand()
  }

  const isEmpty = selections.length === 0
  const isRest = selections.length === 1 && selections[0].type === 'rest'
  const isConfigured = !isEmpty

  // First workout determines the icon circle color
  const firstStyle = isEmpty
    ? { color: 'var(--color-text-muted)', bgColor: 'var(--color-surface-hover)', icon: null }
    : getSelectionStyle(selections[0])
  const FirstIcon = firstStyle.icon

  const handlePickWorkout = (newSelection: DaySelection) => {
    if (newSelection.type === 'rest') {
      // Rest replaces everything
      onSelect([{ type: 'rest' }])
      setShowAddMenu(false)
      onToggleExpand()
      return
    }
    if (isEmpty || isRest) {
      // Replace empty/rest with the new selection
      onSelect([newSelection])
      setShowAddMenu(false)
      onToggleExpand()
      return
    }
    // Append to existing workouts
    onSelect([...selections, newSelection])
    setShowAddMenu(false)
    // Don't collapse — let user see result
  }

  const handleRemove = (index: number) => {
    const updated = selections.filter((_, i) => i !== index)
    onSelect(updated)
  }

  const handleClearAll = () => {
    onSelect([])
    setShowAddMenu(false)
    onToggleExpand()
  }

  // Determine what to show in collapsed header
  const getHeaderContent = () => {
    if (isEmpty) return <span className="text-[var(--color-text-muted)]">Tap to choose</span>

    if (selections.length === 1) {
      const sel = selections[0]
      if (sel.type === 'rest') return <span className="text-[var(--color-text)]">Rest Day</span>
      return <span className="text-[var(--color-text)]">{getWorkoutDisplayName(sel.label)}</span>
    }

    // Multiple workouts — show colored chips
    return (
      <div className="flex flex-wrap gap-1">
        {selections.map((sel, i) => {
          const s = getSelectionStyle(sel)
          return (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: s.bgColor, color: s.color }}
            >
              {getWorkoutDisplayName(sel.label)}
            </span>
          )
        })}
      </div>
    )
  }

  // Should we show the workout picker?
  const showPicker = isEmpty || isRest || showAddMenu

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
      {/* Day Header - Always visible */}
      <button
        type="button"
        onClick={handleToggle}
        className={`
          w-full flex items-center gap-4 p-4
          transition-colors duration-200
          ${isExpanded ? 'bg-[var(--color-surface-hover)]' : 'hover:bg-[var(--color-surface-hover)]'}
        `}
      >
        {/* Day Number / Icon Circle */}
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
            transition-all duration-200
            ${isConfigured
              ? 'text-white'
              : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] border-2 border-dashed border-[var(--color-border)]'
            }
          `}
          style={isConfigured ? { backgroundColor: firstStyle.color } : {}}
        >
          {isConfigured && FirstIcon ? (
            <FirstIcon className="w-6 h-6" />
          ) : (
            dayNumber
          )}
        </div>

        {/* Day Info */}
        <div className="flex-1 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Day {dayNumber}
          </p>
          <div className="mt-0.5">
            {getHeaderContent()}
          </div>
        </div>

        {/* Status indicator */}
        {isConfigured && (
          <div className="w-6 h-6 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-[var(--color-success)]" />
          </div>
        )}
      </button>

      {/* Expandable Area */}
      {isExpanded && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-background)]">
          <div className="p-4 space-y-3">
            {/* Overtraining warning */}
            {selections.length >= 3 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--color-warning-muted)] border border-[var(--color-warning)]/20">
                <span className="text-[var(--color-warning)] text-lg flex-shrink-0">⚠️</span>
                <p className="text-sm text-[var(--color-warning)]">
                  Scheduling {selections.length} sessions in one day increases injury and overtraining risk. Consider spreading workouts across multiple days.
                </p>
              </div>
            )}

            {showPicker ? (
              /* Workout picker */
              <>
                {/* Rest Day Option */}
                <WorkoutOption
                  icon={Moon}
                  color="var(--color-text-muted)"
                  bgColor="var(--color-surface-hover)"
                  label="Rest Day"
                  sublabel="Recovery and rest"
                  isSelected={isRest}
                  onClick={() => handlePickWorkout({ type: 'rest' })}
                />

                {/* Weights Section */}
                {workoutDays.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-1">
                      Weights
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {workoutDays.map(day => {
                        const key = getWeightsKey(day.name)
                        const wStyle = WEIGHTS_CONFIG[key]
                        const isSelected = selections.some(s => s.type === 'weights' && s.id === day.id)
                        return (
                          <WorkoutOption
                            key={day.id}
                            icon={wStyle.icon}
                            color={wStyle.color}
                            bgColor={wStyle.bgColor}
                            label={getWorkoutDisplayName(day.name)}
                            sublabel="Strength training"
                            isSelected={isSelected}
                            onClick={() => handlePickWorkout({
                              type: 'weights',
                              id: day.id,
                              label: day.name,
                              dayNumber: day.day_number
                            })}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Cardio Section */}
                {cardioTemplates.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-1">
                      Cardio
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {cardioTemplates.map(t => {
                        const cStyle = getCardioStyle(t.category)
                        const isSelected = selections.some(s => s.type === 'cardio' && s.id === t.id)
                        return (
                          <WorkoutOption
                            key={t.id}
                            icon={cStyle.icon}
                            color={cStyle.color}
                            bgColor={cStyle.bgColor}
                            label={t.name}
                            compact
                            isSelected={isSelected}
                            onClick={() => handlePickWorkout({
                              type: 'cardio',
                              id: t.id,
                              label: t.name,
                              category: t.category
                            })}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Mobility Section */}
                {mobilityTemplates.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-1">
                      Mobility
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {mobilityTemplates.map(t => {
                        const mStyle = getMobilityStyle(t.category)
                        const isSelected = selections.some(s => s.type === 'mobility' && s.id === t.id)
                        return (
                          <WorkoutOption
                            key={t.id}
                            icon={mStyle.icon}
                            color={mStyle.color}
                            bgColor={mStyle.bgColor}
                            label={t.name}
                            compact
                            isSelected={isSelected}
                            onClick={() => handlePickWorkout({
                              type: 'mobility',
                              id: t.id,
                              label: t.name,
                              category: t.category
                            })}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Cancel add (only when adding to existing workouts) */}
                {showAddMenu && !isEmpty && !isRest && (
                  <button
                    type="button"
                    onClick={() => setShowAddMenu(false)}
                    className="w-full text-center text-sm text-[var(--color-text-muted)] py-2 hover:text-[var(--color-text)] transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </>
            ) : (
              /* Current workouts with remove + add button */
              <>
                <div className="space-y-2">
                  {selections.map((sel, index) => {
                    const s = getSelectionStyle(sel)
                    const SelIcon = s.icon
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface)]"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: s.bgColor }}
                        >
                          {SelIcon && <SelIcon className="w-4 h-4" style={{ color: s.color }} />}
                        </div>
                        <span className="flex-1 text-sm font-medium text-[var(--color-text)]">
                          {getWorkoutDisplayName(sel.label)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--color-danger-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Add Workout button */}
                <button
                  type="button"
                  onClick={() => setShowAddMenu(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Workout</span>
                </button>

                {/* Clear all */}
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="w-full text-center text-sm text-[var(--color-text-muted)] py-2 hover:text-[var(--color-error)] transition-colors"
                >
                  Clear all
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Workout option component for cleaner selection UI
interface WorkoutOptionProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  bgColor: string
  label: string
  sublabel?: string
  compact?: boolean
  isSelected: boolean
  onClick: () => void
}

function WorkoutOption({ icon: Icon, color, bgColor, label, sublabel, compact, isSelected, onClick }: WorkoutOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl
        border-2 transition-all duration-200
        ${isSelected
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
          : 'border-transparent bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]'
        }
        ${compact ? 'p-2.5' : 'p-3'}
      `}
    >
      <div
        className={`rounded-full flex items-center justify-center ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}
        style={{ backgroundColor: bgColor }}
      >
        <Icon className={compact ? 'w-4 h-4' : 'w-5 h-5'} style={{ color }} />
      </div>
      <div className="flex-1 text-left">
        <p className={`font-medium text-[var(--color-text)] ${compact ? 'text-sm' : 'text-base'}`}>
          {label}
        </p>
        {sublabel && !compact && (
          <p className="text-xs text-[var(--color-text-muted)]">{sublabel}</p>
        )}
      </div>
      {isSelected && (
        <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  )
}
