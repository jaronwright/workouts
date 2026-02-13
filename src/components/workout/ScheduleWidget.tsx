import { useMemo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Calendar, Check, Play, type LucideIcon } from 'lucide-react'
import { motion, AnimatePresence, type PanInfo } from 'motion/react'
import { Card, CardContent, Button, StreakBar } from '@/components/ui'
import { useUserSchedule } from '@/hooks/useSchedule'
import { useCycleDay } from '@/hooks/useCycleDay'
import { useUserSessions } from '@/hooks/useWorkoutSession'
import { useUserTemplateWorkouts } from '@/hooks/useTemplateWorkout'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getDayInfo, type DayInfo } from '@/utils/scheduleUtils'
import {
  getWorkoutShortName,
  getWeightsStyleByName,
  getCardioStyle,
  getMobilityStyle,
  getWorkoutDisplayName,
} from '@/config/workoutConfig'
import type { ScheduleDay } from '@/services/scheduleService'

interface ScheduleWidgetProps {
  onSetupSchedule?: () => void
}

/** Stable date key for comparing calendar days (YYYY-MM-DD) */
function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface CompletedSessionInfo {
  name: string
  icon: LucideIcon
  color: string
  workoutDayId?: string
  templateId?: string
  templateType?: string
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

  // Get ALL today's scheduled workout infos (for tabs when not yet completed)
  const todaySchedules = scheduleMap.get(currentCycleDay) || []
  const todayInfos = todaySchedules.length > 0
    ? todaySchedules.map(s => getDayInfo(s, currentCycleDay))
    : [getDayInfo(undefined, currentCycleDay)]
  const hasSchedule = schedule && schedule.length > 0
  const [activeTab, setActiveTab] = useState(0)
  const [weekOffset, setWeekOffset] = useState(0)
  const swipeDirection = useRef(0)

  // Briefly show dates on the current week after returning from another week
  const [peekDates, setPeekDates] = useState(false)
  const hasScrolledOnce = useRef(false)

  useEffect(() => {
    if (weekOffset !== 0) {
      hasScrolledOnce.current = true
      setPeekDates(false)
      return
    }
    // Just returned to current week — peek for 3 seconds
    if (hasScrolledOnce.current) {
      setPeekDates(true)
      const timer = setTimeout(() => setPeekDates(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [weekOffset])

  const showDateInfo = weekOffset !== 0 || peekDates

  // Map completed sessions by date — used for both the today card and streak bar.
  // This fixes two bugs:
  //  1. Uses actual calendar dates instead of day-of-week numbers, preventing
  //     future days from being marked as completed.
  //  2. Stores the actual session info (name/icon/color) so the today card
  //     shows what was really completed, not what was scheduled.
  const completedSessionsByDate = useMemo(() => {
    const map = new Map<string, CompletedSessionInfo[]>()

    weightsSessions?.forEach(s => {
      if (!s.completed_at || !s.workout_day) return
      const d = new Date(s.completed_at)
      const key = toDateKey(d)
      const style = getWeightsStyleByName(s.workout_day.name)
      const existing = map.get(key) || []
      existing.push({
        name: getWorkoutDisplayName(s.workout_day.name) || s.workout_day.name,
        icon: style.icon,
        color: style.color,
        workoutDayId: s.workout_day.id,
      })
      map.set(key, existing)
    })

    templateSessions?.forEach(s => {
      if (!s.completed_at || !s.template) return
      const d = new Date(s.completed_at)
      const key = toDateKey(d)
      const style = s.template.type === 'cardio'
        ? getCardioStyle(s.template.category)
        : getMobilityStyle(s.template.category)
      const existing = map.get(key) || []
      existing.push({
        name: s.template.name,
        icon: style.icon,
        color: style.color,
        templateId: s.template_id,
        templateType: s.template.type,
      })
      map.set(key, existing)
    })

    return map
  }, [weightsSessions, templateSessions])

  // Derive today's completion state from actual sessions
  const todayKey = toDateKey(new Date())
  const todayCompletedSessions = completedSessionsByDate.get(todayKey) || []
  const todayCompleted = todayCompletedSessions.length > 0

  // When completed, show actual session info; otherwise show scheduled info
  const todayDisplayInfos: DayInfo[] = useMemo(() => {
    if (todayCompletedSessions.length > 0) {
      return todayCompletedSessions.map(s => ({
        dayNumber: currentCycleDay,
        icon: s.icon,
        color: s.color,
        bgColor: `${s.color}20`,
        name: s.name,
        isRest: false,
        workoutDayId: s.workoutDayId,
        templateId: s.templateId,
        templateType: s.templateType,
      }))
    }
    return todayInfos
  }, [todayCompletedSessions, todayInfos, currentCycleDay])

  const displayWorkoutCount = todayDisplayInfos.length
  const clampedTab = Math.max(0, Math.min(activeTab, displayWorkoutCount - 1))

  // Compute rolling 7-day schedule starting from today + weekOffset
  const { streakDays, monthLabel } = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const totalDays = days.length // always 7

    // Track months seen for the header label
    const monthsInView = new Set<string>()

    const computed = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now)
      date.setDate(now.getDate() + weekOffset + i)
      const dow = date.getDay()
      const dateKey = toDateKey(date)
      const dateNumber = date.getDate()

      monthsInView.add(`${monthNames[date.getMonth()]} ${date.getFullYear()}`)

      const dayDiff = weekOffset + i
      const cycleDay = ((currentCycleDay - 1 + dayDiff) % totalDays + totalDays) % totalDays + 1
      const dayInfo = days[cycleDay - 1]
      const isToday = dayDiff === 0

      // Check actual completed sessions for this date
      const completedSessions = completedSessionsByDate.get(dateKey) || []
      const isCompleted = completedSessions.length > 0

      // For completed days, use real session data for name/icon/color
      if (isCompleted) {
        const first = completedSessions[0]
        return {
          label: dayLabels[dow],
          completed: true,
          isToday,
          color: first.color,
          workoutName: completedSessions.length > 1
            ? 'Multi'
            : getWorkoutShortName(first.name),
          workoutIcon: first.icon,
          workoutColor: first.color,
          isRest: false,
          workoutCount: completedSessions.length,
          dateNumber,
        }
      }

      // For non-completed days, use scheduled data
      const cycleDaySchedules = scheduleMap.get(cycleDay) || []
      const workoutCount = cycleDaySchedules.length

      return {
        label: dayLabels[dow],
        completed: false,
        isToday,
        color: undefined,
        workoutName: workoutCount > 1 ? 'Multi' : dayInfo?.name ? getWorkoutShortName(dayInfo.name) : undefined,
        workoutIcon: dayInfo?.icon,
        workoutColor: dayInfo?.color,
        isRest: dayInfo?.isRest,
        workoutCount,
        dateNumber,
      }
    })

    // Build month label: "Feb 2026" or "Feb – Mar 2026"
    const months = Array.from(monthsInView)
    const label = months.length === 1 ? months[0] : months.join(' – ')

    return { streakDays: computed, monthLabel: label }
  }, [days, currentCycleDay, schedule, weekOffset, completedSessionsByDate])

  // Swipe handler for the 7-day strip
  const handleSwipe = (_: unknown, info: PanInfo) => {
    const threshold = 50
    if (info.offset.x < -threshold || info.velocity.x < -300) {
      swipeDirection.current = 1
      setWeekOffset(prev => prev + 7)
    } else if (info.offset.x > threshold || info.velocity.x > 300) {
      swipeDirection.current = -1
      setWeekOffset(prev => prev - 7)
    }
  }

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

  const activeInfo = todayDisplayInfos[clampedTab] || todayDisplayInfos[0]
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
        {displayWorkoutCount > 1 && (
          <div className="flex border-b border-[var(--color-border)]">
            {todayDisplayInfos.map((info, i) => {
              const isActive = i === clampedTab
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
            key={clampedTab}
            initial={displayWorkoutCount > 1 && !prefersReduced ? { opacity: 0, x: 8 } : false}
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

        {/* Rolling 7-day schedule strip — swipeable */}
        <CardContent className="py-3 border-t border-[var(--color-border)] overflow-hidden">
          {/* Month header — fades in when dates are visible */}
          <AnimatePresence>
            {showDateInfo && (
              <motion.p
                initial={prefersReduced ? false : { opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 6 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-center"
              >
                {monthLabel}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="relative">
            {/* Scroll direction indicators */}
            <AnimatePresence>
              {showDateInfo && !prefersReduced && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-10 pointer-events-none"
                  >
                    <ChevronLeft className="w-3 h-3 text-[var(--color-text-muted)]" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-10 pointer-events-none"
                  >
                    <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)]" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={weekOffset}
                initial={{ opacity: 0, x: swipeDirection.current > 0 ? 60 : -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: swipeDirection.current > 0 ? -60 : 60 }}
                transition={{ duration: 0.2 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragDirectionLock
                dragElastic={0.2}
                onDragEnd={handleSwipe}
                style={{ touchAction: 'pan-y' }}
              >
                <StreakBar days={streakDays} showDates={showDateInfo} />
              </motion.div>
            </AnimatePresence>
          </div>

          {weekOffset !== 0 && (
            <button
              onClick={() => {
                swipeDirection.current = weekOffset > 0 ? -1 : 1
                setWeekOffset(0)
              }}
              className="mt-2 text-[10px] text-[var(--color-primary)] font-medium mx-auto block"
            >
              Back to Today
            </button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
