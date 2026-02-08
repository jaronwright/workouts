import { useState } from 'react'
import { AppShell } from '@/components/layout'
import { ScheduleDayEditor } from '@/components/schedule'
import { useUserSchedule } from '@/hooks/useSchedule'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useCycleDay } from '@/hooks/useCycleDay'
import { formatCycleStartDate } from '@/utils/cycleDay'
import { type ScheduleDay } from '@/services/scheduleService'
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
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-20 bg-[var(--color-surface-hover)] animate-pulse rounded-2xl" />
          ))}
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Schedule">
      <div className="p-4 space-y-3">
        {/* Current Day Indicator */}
        <div className="flex flex-col items-center gap-2 py-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            <span className="text-sm font-medium text-[var(--color-text-muted)]">
              Currently on <span className="text-[var(--color-primary)] font-semibold">Day {currentCycleDay}</span>
            </span>
          </div>
          <div className="flex justify-between w-full max-w-xs gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => {
                  const today = new Date()
                  const startDate = new Date(today)
                  startDate.setDate(today.getDate() - (day - 1))
                  const y = startDate.getFullYear()
                  const m = String(startDate.getMonth() + 1).padStart(2, '0')
                  const d = String(startDate.getDate()).padStart(2, '0')
                  updateProfile({ cycle_start_date: `${y}-${m}-${d}` })
                }}
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-150 active:scale-90 cursor-pointer
                  ${currentCycleDay === day
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
                  }
                `}
              >
                {day}
              </button>
            ))}
          </div>
          <span className="text-xs text-[var(--color-text-muted)] opacity-60">
            Tap a day to set where you are in your cycle
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            Cycle started {formatCycleStartDate(profile?.cycle_start_date)}
          </span>
        </div>

        {/* Schedule List */}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7].map((dayNumber) => {
            const daySchedules = schedulesByDay.get(dayNumber) || []
            const isCurrentDay = currentCycleDay === dayNumber
            const hasWorkouts = daySchedules.length > 0 && !daySchedules[0]?.is_rest_day
            const isRestDay = daySchedules.length > 0 && daySchedules[0]?.is_rest_day

            return (
              <div
                key={dayNumber}
                onClick={() => setEditingDay(dayNumber)}
                className={`
                  relative rounded-2xl p-4 cursor-pointer
                  transition-all duration-200 active:scale-[0.98]
                  ${isCurrentDay
                    ? 'bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]/30'
                    : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Day Number Badge */}
                  <div className={`
                    w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0
                    ${isCurrentDay
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-surface-hover)] text-[var(--color-text)]'
                    }
                  `}>
                    <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">Day</span>
                    <span className="text-lg font-bold -mt-0.5">{dayNumber}</span>
                  </div>

                  {/* Workout Content */}
                  <div className="flex-1 min-w-0 py-0.5">
                    {isRestDay ? (
                      <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                        <Moon className="w-4 h-4" />
                        <span className="text-sm font-medium">Rest Day</span>
                      </div>
                    ) : hasWorkouts ? (
                      <div className="flex flex-wrap gap-1.5">
                        {daySchedules.map((s, idx) => {
                          const chip = getWorkoutChip(s)
                          if (!chip) return null
                          const { Icon, color, label, bgColor } = chip
                          return (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium"
                              style={{ backgroundColor: bgColor, color }}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[140px]">{label}</span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] border border-dashed border-[var(--color-border)]">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Choose workout</span>
                      </span>
                    )}
                  </div>

                  {/* Arrow indicator */}
                  <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] flex-shrink-0 mt-3" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day Editor Modal */}
      <ScheduleDayEditor
        isOpen={editingDay !== null}
        onClose={() => setEditingDay(null)}
        dayNumber={editingDay || 1}
        currentSchedules={editingDay ? schedulesByDay.get(editingDay) || [] : []}
      />
    </AppShell>
  )
}
