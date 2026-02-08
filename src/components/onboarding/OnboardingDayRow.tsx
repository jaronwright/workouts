import { Moon, Check } from 'lucide-react'
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
  selection: DaySelection
  onSelect: (selection: DaySelection) => void
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

export function OnboardingDayRow({
  dayNumber,
  selection,
  onSelect,
  workoutDays,
  cardioTemplates,
  mobilityTemplates,
  isExpanded,
  onToggleExpand
}: OnboardingDayRowProps) {

  const getSelectionStyle = () => {
    if (selection.type === 'empty') {
      return { color: 'var(--color-text-muted)', bgColor: 'var(--color-surface-hover)', icon: null }
    }
    if (selection.type === 'rest') {
      return { color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.15)', icon: Moon }
    }
    if (selection.type === 'weights') {
      const key = getWeightsKey(selection.label || '')
      const style = WEIGHTS_CONFIG[key]
      return { color: style.color, bgColor: style.bgColor, icon: style.icon }
    }
    if (selection.type === 'cardio') {
      const style = getCardioStyle(selection.category || null)
      return { color: style.color, bgColor: style.bgColor, icon: style.icon }
    }
    if (selection.type === 'mobility') {
      const style = getMobilityStyle(selection.category || null)
      return { color: style.color, bgColor: style.bgColor, icon: style.icon }
    }
    return { color: 'var(--color-text-muted)', bgColor: 'var(--color-surface-hover)', icon: null }
  }

  const style = getSelectionStyle()
  const Icon = style.icon

  const handleSelect = (newSelection: DaySelection) => {
    onSelect(newSelection)
    onToggleExpand() // Collapse after selection
  }

  const getDisplayLabel = () => {
    if (selection.type === 'empty') return 'Tap to choose'
    if (selection.type === 'rest') return 'Rest Day'
    return getWorkoutDisplayName(selection.label)
  }

  const isConfigured = selection.type !== 'empty'

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
      {/* Day Header - Always visible */}
      <button
        type="button"
        onClick={onToggleExpand}
        className={`
          w-full flex items-center gap-4 p-4
          transition-colors duration-200
          ${isExpanded ? 'bg-[var(--color-surface-hover)]' : 'hover:bg-[var(--color-surface-hover)]'}
        `}
      >
        {/* Day Number */}
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
            transition-all duration-200
            ${isConfigured
              ? 'text-white'
              : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] border-2 border-dashed border-[var(--color-border)]'
            }
          `}
          style={isConfigured ? { backgroundColor: style.color } : {}}
        >
          {isConfigured && Icon ? (
            <Icon className="w-6 h-6" />
          ) : (
            dayNumber
          )}
        </div>

        {/* Day Info */}
        <div className="flex-1 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Day {dayNumber}
          </p>
          <p className={`text-base font-medium mt-0.5 ${isConfigured ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>
            {getDisplayLabel()}
          </p>
        </div>

        {/* Status indicator */}
        {isConfigured && (
          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-500" />
          </div>
        )}
      </button>

      {/* Expandable Selection Area */}
      {isExpanded && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-background)]">
          <div className="p-4 space-y-3">
            {/* Rest Day Option */}
            <WorkoutOption
              icon={Moon}
              color="#6B7280"
              bgColor="rgba(107, 114, 128, 0.15)"
              label="Rest Day"
              sublabel="Recovery and rest"
              isSelected={selection.type === 'rest'}
              onClick={() => handleSelect({ type: 'rest' })}
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
                    return (
                      <WorkoutOption
                        key={day.id}
                        icon={wStyle.icon}
                        color={wStyle.color}
                        bgColor={wStyle.bgColor}
                        label={getWorkoutDisplayName(day.name)}
                        sublabel="Strength training"
                        isSelected={selection.type === 'weights' && selection.id === day.id}
                        onClick={() => handleSelect({
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
                    return (
                      <WorkoutOption
                        key={t.id}
                        icon={cStyle.icon}
                        color={cStyle.color}
                        bgColor={cStyle.bgColor}
                        label={t.name}
                        compact
                        isSelected={selection.type === 'cardio' && selection.id === t.id}
                        onClick={() => handleSelect({
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
                    return (
                      <WorkoutOption
                        key={t.id}
                        icon={mStyle.icon}
                        color={mStyle.color}
                        bgColor={mStyle.bgColor}
                        label={t.name}
                        compact
                        isSelected={selection.type === 'mobility' && selection.id === t.id}
                        onClick={() => handleSelect({
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

            {/* Clear Selection */}
            {isConfigured && (
              <button
                type="button"
                onClick={() => handleSelect({ type: 'empty' })}
                className="w-full text-center text-sm text-[var(--color-text-muted)] py-2 hover:text-[var(--color-error)] transition-colors"
              >
                Clear selection
              </button>
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
