import { useState } from 'react'
import { AppShell } from '@/components/layout'
import { ScheduleDayEditor } from '@/components/schedule'
import { useUserSchedule } from '@/hooks/useSchedule'
import { useProfile } from '@/hooks/useProfile'
import { type ScheduleDay } from '@/services/scheduleService'
import { Moon, Plus, ChevronRight } from 'lucide-react'
import {
  getWeightsStyleByDayNumber,
  getWeightsLabel,
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
    const style = getWeightsStyleByDayNumber(schedule.workout_day.day_number)
    const label = getWeightsLabel(schedule.workout_day.day_number)
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
        {profile?.current_cycle_day && (
          <div className="flex items-center justify-center gap-2 py-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            <span className="text-sm font-medium text-[var(--color-text-muted)]">
              Currently on <span className="text-[var(--color-primary)] font-semibold">Day {profile.current_cycle_day}</span>
            </span>
          </div>
        )}

        {/* Schedule List */}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7].map((dayNumber) => {
            const daySchedules = schedulesByDay.get(dayNumber) || []
            const isCurrentDay = profile?.current_cycle_day === dayNumber
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
