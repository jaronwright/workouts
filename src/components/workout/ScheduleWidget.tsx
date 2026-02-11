import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Calendar, Check, Play } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, Button, StreakBar } from '@/components/ui'
import { useUserSchedule } from '@/hooks/useSchedule'
import { useCycleDay } from '@/hooks/useCycleDay'
import { useUserSessions } from '@/hooks/useWorkoutSession'
import { useUserTemplateWorkouts } from '@/hooks/useTemplateWorkout'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getDayInfo, type DayInfo } from '@/utils/scheduleUtils'
import { getWorkoutShortName } from '@/config/workoutConfig'
import type { ScheduleDay } from '@/services/scheduleService'

interface ScheduleWidgetProps {
  onSetupSchedule?: () => void
}

export function ScheduleWidget({ onSetupSchedule }: ScheduleWidgetProps) {
  const navigate = useNavigate()
  const { data: schedule, isLoading } = useUserSchedule()
  const currentCycleDay = useCycleDay()
  const { data: weightsSessions } = useUserSessions()
  const { data: templateSessions } = useUserTemplateWorkouts()
  const prefersReduced = useReducedMotion()

  // Create a map of day_number to ALL schedules for quick lookup
  const scheduleMap = new Map<number, ScheduleDay[]>()
  schedule?.forEach(s => {
    const existing = scheduleMap.get(s.day_number) || []
    existing.push(s)
    scheduleMap.set(s.day_number, existing)
  })

  // Get info for all 7 days (use first schedule for icon/name/color)
  const days = Array.from({ length: 7 }, (_, i) => {
    const dayNumber = i + 1
    const daySchedules = scheduleMap.get(dayNumber) || []
    return getDayInfo(daySchedules[0], dayNumber)
  })

  // Get ALL today's workout infos (for tabs)
  const todaySchedules = scheduleMap.get(currentCycleDay) || []
  const todayInfos = todaySchedules.length > 0
    ? todaySchedules.map(s => getDayInfo(s, currentCycleDay))
    : [getDayInfo(undefined, currentCycleDay)]
  const todayWorkoutCount = todaySchedules.length
  const hasSchedule = schedule && schedule.length > 0
  const [activeTab, setActiveTab] = useState(0)

  // Check if today's workout is completed
  const todayCompleted = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const allSessions = [
      ...(weightsSessions || []),
      ...(templateSessions || [])
    ]

    return allSessions.some(s => {
      if (!s.completed_at) return false
      const completedDate = new Date(s.completed_at)
      completedDate.setHours(0, 0, 0, 0)
      return completedDate.getTime() === today.getTime()
    })
  }, [weightsSessions, templateSessions])

  // Compute rolling 7-day schedule starting from today
  const streakDays = useMemo(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const allSessions = [
      ...(weightsSessions || []),
      ...(templateSessions || [])
    ]

    const completedDayNums = new Set<number>()
    allSessions.forEach(s => {
      if (!s.completed_at) return
      const completedDate = new Date(s.completed_at)
      if (completedDate >= startOfWeek) {
        completedDayNums.add(completedDate.getDay())
      }
    })

    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    const todayDow = now.getDay() // 0=Sun, 1=Mon, ...
    const totalDays = days.length // always 7

    // Rolling 7-day view starting from today
    return Array.from({ length: 7 }, (_, i) => {
      const dow = (todayDow + i) % 7
      const cycleDay = ((currentCycleDay - 1 + i) % totalDays) + 1
      const dayInfo = days[cycleDay - 1]

      const cycleDaySchedules = scheduleMap.get(cycleDay) || []
      const workoutCount = cycleDaySchedules.length

      return {
        label: dayLabels[dow],
        completed: completedDayNums.has(dow),
        isToday: i === 0,
        color: completedDayNums.has(dow) ? dayInfo?.color || 'var(--color-primary)' : undefined,
        workoutName: workoutCount > 1 ? 'Multi' : dayInfo?.name ? getWorkoutShortName(dayInfo.name) : undefined,
        workoutIcon: dayInfo?.icon,
        workoutColor: dayInfo?.color,
        isRest: dayInfo?.isRest,
        workoutCount,
      }
    })
  }, [weightsSessions, templateSessions, days, currentCycleDay, schedule])

  const handleDayClick = (day: DayInfo) => {
    if (day.isRest) {
      navigate('/rest-day')
    } else if (day.workoutDayId) {
      navigate(`/workout/${day.workoutDayId}`)
    } else if (day.templateId) {
      if (day.templateType === 'cardio') {
        navigate(`/cardio/${day.templateId}`)
      } else if (day.templateType === 'mobility') {
        navigate(`/mobility/${day.templateId}`)
      }
    } else {
      navigate('/schedule')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="h-24 skeleton rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (!hasSchedule) {
    const handleSetup = () => {
      if (onSetupSchedule) {
        onSetupSchedule()
      } else {
        navigate('/schedule')
      }
    }

    return (
      <Card variant="outlined">
        <CardContent className="py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-surface-hover)] flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[var(--color-text-muted)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-text)]">
                No schedule set up yet
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Create your weekly workout plan
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={handleSetup}>
              Set Up
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeInfo = todayInfos[activeTab] || todayInfos[0]
  const ActiveIcon = activeInfo.icon

  const handleActiveClick = () => {
    handleDayClick(activeInfo)
  }

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
    >
      <Card className="overflow-hidden">
        {/* Multi-workout tabs (only shown when >1 workout today) */}
        {todayWorkoutCount > 1 && (
          <div className="flex border-b border-[var(--color-border)]">
            {todayInfos.map((info, i) => {
              const isActive = i === activeTab
              const TabIcon = info.icon
              return (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-medium transition-colors relative ${
                    isActive ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" style={{ color: isActive ? info.color : undefined }} strokeWidth={2} />
                  <span className="truncate">{getWorkoutShortName(info.name)}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                      style={{ backgroundColor: info.color }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Today's Workout - Minimal card with left accent */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={todayWorkoutCount > 1 && !prefersReduced ? { opacity: 0, x: 8 } : false}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="px-4 py-3.5 cursor-pointer active:opacity-90 transition-opacity relative"
              onClick={handleActiveClick}
            >
              {/* Color-coded left accent bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[var(--radius-xl)]"
                style={{ backgroundColor: activeInfo.color }}
              />

              <div className="flex items-center gap-3">
                {/* Inline icon + workout name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    {todayCompleted ? (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${activeInfo.color}20` }}
                      >
                        <Check className="w-4 h-4" style={{ color: activeInfo.color }} strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${activeInfo.color}15` }}
                      >
                        <ActiveIcon className="w-3.5 h-3.5" style={{ color: activeInfo.color }} strokeWidth={2.5} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[var(--color-text)] truncate leading-tight">
                        {activeInfo.name}
                      </h3>
                      {todayCompleted ? (
                        <p className="text-xs text-[var(--color-success)] mt-0.5 font-medium">
                          Completed
                        </p>
                      ) : !activeInfo.isRest ? (
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          Today's workout
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Right action — Start or Finished */}
                {todayCompleted ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-semibold text-[var(--color-success)]">Finished</span>
                    <Check className="w-3.5 h-3.5 text-[var(--color-success)]" strokeWidth={2.5} />
                  </div>
                ) : !activeInfo.isRest ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-semibold" style={{ color: activeInfo.color }}>Start</span>
                    <Play className="w-3.5 h-3.5" style={{ color: activeInfo.color }} strokeWidth={2.5} />
                  </div>
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Rolling 7-day schedule strip */}
        <CardContent className="py-3 border-t border-[var(--color-border)]">
          <StreakBar days={streakDays} />
        </CardContent>
      </Card>
    </motion.div>
  )
}
