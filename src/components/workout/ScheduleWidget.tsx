import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Calendar, Check } from 'lucide-react'
import { motion } from 'motion/react'
import { Card, CardContent, Button, StreakBar } from '@/components/ui'
import { useUserSchedule } from '@/hooks/useSchedule'
import { useCycleDay } from '@/hooks/useCycleDay'
import { useUserSessions } from '@/hooks/useWorkoutSession'
import { useUserTemplateWorkouts } from '@/hooks/useTemplateWorkout'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getDayInfo, type DayInfo } from '@/utils/scheduleUtils'
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

  // Create a map of day_number to schedule for quick lookup
  const scheduleMap = new Map<number, ScheduleDay>()
  schedule?.forEach(s => {
    // Get existing or add new
    if (!scheduleMap.has(s.day_number)) {
      scheduleMap.set(s.day_number, s)
    }
  })

  // Get info for all 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const dayNumber = i + 1
    const daySchedule = scheduleMap.get(dayNumber)
    return getDayInfo(daySchedule, dayNumber)
  })

  // Get today's workout info
  const todayInfo = days[currentCycleDay - 1] || days[0]
  const hasSchedule = schedule && schedule.length > 0

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

  // Compute weekly completion for StreakBar
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
    const todayDow = now.getDay()

    return dayLabels.map((label, i) => ({
      label,
      completed: completedDayNums.has(i),
      isToday: i === todayDow,
      color: completedDayNums.has(i) ? 'var(--color-primary)' : undefined,
    }))
  }, [weightsSessions, templateSessions])

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

  const handleTodayClick = () => {
    handleDayClick(todayInfo)
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

  const TodayIcon = todayInfo.icon

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
    >
      <Card className="overflow-hidden">
        {/* Today's Workout - Hero Section with color-coded left border */}
        <div
          className="p-4 cursor-pointer active:opacity-90 transition-opacity relative"
          style={{ backgroundColor: `${todayInfo.color}10` }}
          onClick={handleTodayClick}
        >
          {/* Color-coded left border */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[var(--radius-xl)]"
            style={{ backgroundColor: todayInfo.color }}
          />
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center bg-gradient-to-br shadow-sm"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, ${todayInfo.color}, ${todayInfo.color}cc)`,
                }}
              >
                <TodayIcon className="w-7 h-7 text-white" />
              </div>
              {todayCompleted && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-success)] border-2 border-[var(--color-surface)] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: todayInfo.bgColor, color: todayInfo.color }}>
                  Day {currentCycleDay}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">Today</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)] mt-1 truncate">
                {todayInfo.name}
              </h3>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
          </div>
        </div>

        {/* Weekly Streak Bar */}
        <CardContent className="py-3 border-t border-[var(--color-border)]">
          <StreakBar days={streakDays} />
        </CardContent>
      </Card>
    </motion.div>
  )
}
