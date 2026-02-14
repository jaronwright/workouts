import { useState } from 'react'
import { motion } from 'motion/react'
import { AppShell } from '@/components/layout'
import { ScheduleDayEditor } from '@/components/schedule'
import { StaggerList, StaggerItem, FadeIn, PressableCard } from '@/components/motion'
import { useUserSchedule } from '@/hooks/useSchedule'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useCycleDay } from '@/hooks/useCycleDay'
import { formatCycleStartDate } from '@/utils/cycleDay'
import { type ScheduleDay } from '@/services/scheduleService'
import { springPresets } from '@/config/animationConfig'
import { useToast } from '@/hooks/useToast'
import { Moon, Plus, ChevronRight } from 'lucide-react'
import {
  getWeightsStyleByName,
  getWorkoutDisplayName,
  getCardioStyle,
  getMobilityStyle
} from '@/config/workoutConfig'

// Extract muscle group subtitle from raw workout name
// e.g. "Push (Chest, Shoulders, Triceps)" → "Chest, Shoulders, Triceps"
function getWorkoutSubtitle(schedule: ScheduleDay): string | null {
  if (schedule.workout_day?.name) {
    const match = schedule.workout_day.name.match(/\(([^)]+)\)/)
    if (match) return match[1]
  }
  if (schedule.template?.duration_minutes) {
    return `~${schedule.template.duration_minutes} min`
  }
  return null
}

function getWorkoutChip(schedule: ScheduleDay) {
  if (schedule.is_rest_day) {
    return {
      Icon: Moon,
      color: '#6B7280',
      label: 'Rest',
      bgColor: 'rgba(107, 114, 128, 0.15)'
    }
  }
  if (schedule.workout_day) {
    const style = getWeightsStyleByName(schedule.workout_day.name)
    const label = getWorkoutDisplayName(schedule.workout_day.name)
    return {
      Icon: style.icon,
      color: style.color,
      label: label,
      bgColor: style.bgColor
    }
  }
  if (schedule.template) {
    if (schedule.template.type === 'cardio') {
      const style = getCardioStyle(schedule.template.category)
      return {
        Icon: style.icon,
        color: style.color,
        label: schedule.template.name,
        bgColor: style.bgColor
      }
    }
    if (schedule.template.type === 'mobility') {
      const style = getMobilityStyle(schedule.template.category)
      return {
        Icon: style.icon,
        color: style.color,
        label: schedule.template.name,
        bgColor: style.bgColor
      }
    }
  }
  return null
}

export function SchedulePage() {
  const { data: schedule, isLoading } = useUserSchedule()
  const { data: profile } = useProfile()
  const { mutate: updateProfile } = useUpdateProfile()
  const currentCycleDay = useCycleDay()
  const { error: showError } = useToast()

  const [editingDay, setEditingDay] = useState<number | null>(null)

  // Group schedules by day number (supports multiple workouts per day)
  const schedulesByDay = new Map<number, ScheduleDay[]>()
  schedule?.forEach(s => {
    const existing = schedulesByDay.get(s.day_number) || []
    existing.push(s)
    schedulesByDay.set(s.day_number, existing)
  })

  if (isLoading) {
    return (
      <AppShell title="Schedule">
        <div className="p-[var(--space-4)] space-y-[var(--space-3)]">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-16 bg-[var(--color-surface-hover)] animate-pulse rounded-[var(--radius-xl)]" />
          ))}
        </div>
      </AppShell>
    )
  }

  const handleDayClick = (day: number) => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - (day - 1))
    const y = startDate.getFullYear()
    const m = String(startDate.getMonth() + 1).padStart(2, '0')
    const d = String(startDate.getDate()).padStart(2, '0')
    updateProfile(
      { cycle_start_date: `${y}-${m}-${d}` },
      { onError: () => showError('Failed to update cycle day') }
    )
  }

  return (
    <AppShell title="Schedule">
      <div className="pb-[var(--space-8)]">
        {/* ═══ HERO HEADING ═══ */}
        <FadeIn direction="up">
          <div className="px-[var(--space-5)] pt-[var(--space-4)] pb-[var(--space-5)]">
            {/* Large day indicator */}
            <p
              className="text-[var(--text-xs)] uppercase font-semibold text-[var(--color-text-muted)] mb-[var(--space-1)]"
              style={{ letterSpacing: 'var(--tracking-widest)' }}
            >
              Current Day
            </p>
            <div className="flex items-baseline gap-[var(--space-3)]">
              <span
                className="text-[clamp(3rem,12vw,4rem)] font-extrabold font-mono-stats leading-none"
                style={{ color: 'var(--color-primary)' }}
              >
                {currentCycleDay}
              </span>
              <span className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                of 7 · {formatCycleStartDate(profile?.cycle_start_date)}
              </span>
            </div>

            {/* Day selector pills — larger, more prominent */}
            <div className="flex justify-between mt-[var(--space-5)]">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isActive = currentCycleDay === day
                const daySchedules = schedulesByDay.get(day) || []
                const firstSchedule = daySchedules[0]
                const chip = firstSchedule ? getWorkoutChip(firstSchedule) : null

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className="relative flex flex-col items-center"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="schedule-day-active"
                        className="absolute -inset-1 rounded-full bg-[var(--color-primary)]"
                        transition={springPresets.snappy}
                      />
                    )}
                    <div
                      className={`
                        relative w-11 h-11 rounded-full flex items-center justify-center
                        transition-colors duration-150
                        ${isActive
                          ? 'text-[var(--color-primary-text)]'
                          : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                        }
                      `}
                      style={isActive ? { boxShadow: '0 0 12px rgba(232, 255, 0, 0.2)' } : undefined}
                    >
                      {daySchedules.length > 1 ? (
                        <span className="text-sm font-bold">{daySchedules.length}</span>
                      ) : chip?.Icon ? (
                        <chip.Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                      ) : (
                        <span className="text-sm font-semibold">{day}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </FadeIn>

        {/* ═══ 7-DAY CYCLE LIST ═══ */}
        <div className="px-[var(--space-4)]">
          <h3
            className="text-[var(--text-xs)] text-[var(--color-text-muted)] uppercase mb-[var(--space-4)] px-[var(--space-1)]"
            style={{ letterSpacing: 'var(--tracking-widest)', fontWeight: 600 }}
          >
            7-Day Cycle
          </h3>

          <StaggerList className="space-y-[var(--space-2)]">
            {[1, 2, 3, 4, 5, 6, 7].map((dayNumber) => {
              const daySchedules = schedulesByDay.get(dayNumber) || []
              const isCurrentDay = currentCycleDay === dayNumber
              const hasWorkouts = daySchedules.length > 0 && !daySchedules[0]?.is_rest_day
              const isRestDay = daySchedules.length > 0 && daySchedules[0]?.is_rest_day

              // Get the left-edge color from first workout
              const firstChip = daySchedules[0] ? getWorkoutChip(daySchedules[0]) : null
              const edgeColor = hasWorkouts && firstChip ? firstChip.color : undefined

              // Get subtitle (muscle groups or duration)
              const firstSubtitle = daySchedules[0] ? getWorkoutSubtitle(daySchedules[0]) : null

              return (
                <StaggerItem key={dayNumber}>
                  <PressableCard onClick={() => setEditingDay(dayNumber)} className="cursor-pointer">
                  <div
                    className={`
                      relative rounded-[var(--radius-lg)] overflow-hidden
                      transition-colors duration-200
                      ${isCurrentDay
                        ? 'bg-[var(--color-primary-muted)]'
                        : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]'
                      }
                    `}
                    style={isCurrentDay ? { boxShadow: '0 0 20px rgba(232, 255, 0, 0.06)' } : undefined}
                  >
                    {/* Left edge color indicator */}
                    {edgeColor && (
                      <div
                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                        style={{ backgroundColor: edgeColor }}
                      />
                    )}

                    <div className={`flex items-center gap-[var(--space-4)] px-[var(--space-5)] ${
                      isCurrentDay ? 'py-[var(--space-5)]' : 'py-[var(--space-4)]'
                    }`}>
                      {/* Day Number — bigger for active day */}
                      <div className={`
                        rounded-full flex items-center justify-center shrink-0
                        font-mono-stats font-bold
                        ${isCurrentDay
                          ? 'w-12 h-12 text-[var(--text-base)] bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                          : 'w-10 h-10 text-[15px] bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
                        }
                      `}
                        style={isCurrentDay ? { boxShadow: 'var(--shadow-primary)' } : undefined}
                      >
                        {dayNumber}
                      </div>

                      {/* Workout Content — with inline subtitles */}
                      <div className="flex-1 min-w-0">
                        {isRestDay ? (
                          <div className="flex items-center gap-[var(--space-3)] text-[var(--color-text-muted)]">
                            <Moon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
                            <span className="text-[15px]">Rest Day</span>
                          </div>
                        ) : hasWorkouts ? (
                          <div className={daySchedules.length > 1 ? 'space-y-[var(--space-2)]' : ''}>
                            {daySchedules.map((s, idx) => {
                              const chipData = getWorkoutChip(s)
                              if (!chipData) return null
                              const { Icon, color, label } = chipData
                              const subtitle = getWorkoutSubtitle(s)
                              return (
                                <div key={idx} className="flex items-center gap-[var(--space-3)] min-w-0">
                                  <Icon
                                    className="w-[18px] h-[18px] shrink-0"
                                    style={{ color }}
                                    strokeWidth={2}
                                  />
                                  <div className="min-w-0">
                                    <span
                                      className={`font-medium truncate block ${
                                        isCurrentDay ? 'text-[var(--text-base)]' : 'text-[15px]'
                                      }`}
                                      style={{ color }}
                                    >
                                      {label}
                                    </span>
                                    {subtitle && (
                                      <span className="text-[var(--text-xs)] text-[var(--color-text-muted)] truncate block">
                                        {subtitle}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center gap-[var(--space-3)] text-[var(--color-text-muted)]">
                            <Plus className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
                            <span className="text-[15px]">Add workout</span>
                          </div>
                        )}
                      </div>

                      {/* Chevron */}
                      <ChevronRight className="w-4.5 h-4.5 text-[var(--color-text-muted)] shrink-0 opacity-40" />
                    </div>
                  </div>
                  </PressableCard>
                </StaggerItem>
              )
            })}
          </StaggerList>
        </div>
      </div>

      {/* Day Editor */}
      <ScheduleDayEditor
        isOpen={editingDay !== null}
        onClose={() => setEditingDay(null)}
        dayNumber={editingDay || 1}
        currentSchedules={editingDay ? schedulesByDay.get(editingDay) || [] : []}
      />
    </AppShell>
  )
}
