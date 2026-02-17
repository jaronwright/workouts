import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { AppShell } from '@/components/layout'
import { SectionLabel } from '@/components/ui'
import { ScheduleDayEditor } from '@/components/schedule'
import { StaggerList, StaggerItem, FadeIn, FadeInOnScroll, PressableCard } from '@/components/motion'
import { useUserSchedule } from '@/hooks/useSchedule'
import { useProfile } from '@/hooks/useProfile'
import { useCycleDay } from '@/hooks/useCycleDay'
import { getTodayInTimezone, detectUserTimezone } from '@/utils/cycleDay'
import { type ScheduleDay } from '@/services/scheduleService'
import { springPresets } from '@/config/animationConfig'
import { Moon, Plus, CaretRight } from '@phosphor-icons/react'
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
  return null
}

function getWorkoutChip(schedule: ScheduleDay) {
  if (schedule.is_rest_day) {
    return {
      Icon: Moon,
      color: 'var(--color-text-muted)',
      label: 'Rest',
      bgColor: 'var(--color-surface-hover)'
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
  const currentCycleDay = useCycleDay()

  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  // The day shown in the header — defaults to the auto-computed current day
  const displayDay = selectedDay ?? currentCycleDay

  // Compute the calendar date for the displayed day
  const displayDate = useMemo(() => {
    const tz = profile?.timezone || detectUserTimezone()
    const today = getTodayInTimezone(tz)
    const dayOffset = displayDay - currentCycleDay
    const date = new Date(today)
    date.setDate(date.getDate() + dayOffset)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).format(date)
  }, [displayDay, currentCycleDay, profile?.timezone])

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
              {displayDay === currentCycleDay ? 'Current Day' : 'Day'}
            </p>
            <div className="flex items-baseline gap-[var(--space-3)]">
              <motion.span
                key={displayDay}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[clamp(3rem,12vw,4rem)] font-extrabold font-mono-stats leading-none inline-block"
                style={{ color: 'var(--color-primary)' }}
              >
                {displayDay}
              </motion.span>
              <span className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                of 7 · {displayDate}
              </span>
            </div>

            {/* Day selector pills — larger, more prominent */}
            <div className="flex justify-between mt-[var(--space-5)]">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isActive = displayDay === day
                const isToday = currentCycleDay === day
                const daySchedules = schedulesByDay.get(day) || []
                const firstSchedule = daySchedules[0]
                const chip = firstSchedule ? getWorkoutChip(firstSchedule) : null

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day === currentCycleDay ? null : day)}
                    className="relative flex flex-col items-center focus-visible:outline-none"
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
                      style={isActive ? { boxShadow: '0 0 12px var(--color-primary-glow)' } : undefined}
                    >
                      {daySchedules.length > 1 ? (
                        <span className="text-sm font-bold">{daySchedules.length}</span>
                      ) : chip?.Icon ? (
                        <chip.Icon className="w-[18px] h-[18px]" />
                      ) : (
                        <span className="text-sm font-semibold">{day}</span>
                      )}
                    </div>
                    {/* Today dot indicator */}
                    {isToday && !isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </FadeIn>

        {/* ═══ 7-DAY CYCLE LIST ═══ */}
        <FadeInOnScroll direction="up">
        <div className="px-[var(--space-4)]">
          <SectionLabel className="mb-[var(--space-4)] px-[var(--space-1)]">7-Day Cycle</SectionLabel>

          <StaggerList className="space-y-[var(--space-2)]">
            {[1, 2, 3, 4, 5, 6, 7].map((dayNumber) => {
              const daySchedules = schedulesByDay.get(dayNumber) || []
              const isCurrentDay = displayDay === dayNumber
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
                    style={isCurrentDay ? { boxShadow: '0 0 20px var(--color-primary-muted)' } : undefined}
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
                            <Moon className="w-[18px] h-[18px] shrink-0" weight="light" />
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
                            <Plus className="w-[18px] h-[18px] shrink-0" weight="light" />
                            <span className="text-[15px]">Add workout</span>
                          </div>
                        )}
                      </div>

                      {/* Chevron */}
                      <CaretRight className="w-4.5 h-4.5 text-[var(--color-text-muted)] shrink-0 opacity-40" />
                    </div>
                  </div>
                  </PressableCard>
                </StaggerItem>
              )
            })}
          </StaggerList>
        </div>
        </FadeInOnScroll>
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
