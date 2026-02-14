import { useState } from 'react'
import { motion } from 'motion/react'
import { AppShell } from '@/components/layout'
import { ScheduleDayEditor } from '@/components/schedule'
import { StaggerList, StaggerItem } from '@/components/motion'
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
        {/* ── WEEK OVERVIEW ── */}
        <div className="px-[var(--space-4)] pt-[var(--space-4)] pb-[var(--space-6)]">
          {/* Cycle info */}
          <div className="flex items-center justify-center gap-[var(--space-2)] mb-[var(--space-4)]">
            <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
            <span className="text-[var(--text-xs)] font-medium text-[var(--color-text-muted)]">
              Day <span className="text-[var(--color-primary)] font-semibold font-mono-stats">{currentCycleDay}</span>
              <span className="mx-1.5 opacity-40">&middot;</span>
              {formatCycleStartDate(profile?.cycle_start_date)}
            </span>
          </div>

          {/* Day selector pills */}
          <div className="flex justify-center gap-[var(--space-3)]">
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
                      className="absolute -inset-0.5 rounded-full bg-[var(--color-primary)]"
                      transition={springPresets.snappy}
                    />
                  )}
                  <div
                    className={`
                      relative w-10 h-10 rounded-full flex items-center justify-center
                      transition-colors duration-150
                      ${isActive
                        ? 'text-[var(--color-primary-text)]'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
                      }
                    `}
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

        {/* ── WORKOUT LIST ── */}
        <div className="px-[var(--space-4)]">
          <h3
            className="text-[var(--text-xs)] text-[var(--color-text-muted)] uppercase tracking-[var(--tracking-widest)] mb-[var(--space-4)]"
            style={{ fontWeight: 'var(--weight-semibold)' }}
          >
            7-Day Cycle
          </h3>

          <StaggerList className="space-y-[var(--space-3)]">
            {[1, 2, 3, 4, 5, 6, 7].map((dayNumber) => {
              const daySchedules = schedulesByDay.get(dayNumber) || []
              const isCurrentDay = currentCycleDay === dayNumber
              const hasWorkouts = daySchedules.length > 0 && !daySchedules[0]?.is_rest_day
              const isRestDay = daySchedules.length > 0 && daySchedules[0]?.is_rest_day

              // Get the left-edge color from first workout
              const firstChip = daySchedules[0] ? getWorkoutChip(daySchedules[0]) : null
              const edgeColor = hasWorkouts && firstChip ? firstChip.color : undefined

              return (
                <StaggerItem key={dayNumber}>
                  <div
                    onClick={() => setEditingDay(dayNumber)}
                    className={`
                      relative rounded-[var(--radius-lg)] cursor-pointer overflow-hidden
                      transition-all duration-200 active:scale-[0.98]
                      ${isCurrentDay
                        ? 'bg-[var(--color-primary-muted)]'
                        : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]'
                      }
                    `}
                  >
                    {/* Left edge color indicator */}
                    {edgeColor && (
                      <div
                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                        style={{ backgroundColor: edgeColor }}
                      />
                    )}

                    <div className="flex items-center gap-[var(--space-4)] px-[var(--space-5)] py-[var(--space-4)]">
                      {/* Day Number */}
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center shrink-0
                        font-mono-stats text-[15px] font-bold
                        ${isCurrentDay
                          ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                          : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
                        }
                      `}
                        style={isCurrentDay ? { boxShadow: 'var(--shadow-primary)' } : undefined}
                      >
                        {dayNumber}
                      </div>

                      {/* Workout Content */}
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
                              return (
                                <div key={idx} className="flex items-center gap-[var(--space-3)] min-w-0">
                                  <Icon
                                    className="w-[18px] h-[18px] shrink-0"
                                    style={{ color }}
                                    strokeWidth={2}
                                  />
                                  <span
                                    className="text-[15px] font-medium truncate"
                                    style={{ color }}
                                  >
                                    {label}
                                  </span>
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
