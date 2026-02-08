import { useMemo } from 'react'
import { isSameDay, isSameMonth, isAfter, startOfDay } from 'date-fns'
import { useUserSessions } from '@/hooks/useWorkoutSession'
import { useUserTemplateWorkouts } from '@/hooks/useTemplateWorkout'
import { useUserSchedule } from '@/hooks/useSchedule'
import { useProfile } from '@/hooks/useProfile'
import { getWorkoutDisplayName } from '@/config/workoutConfig'
import { detectUserTimezone, getTodayInTimezone } from '@/utils/cycleDay'
import { getDayInfo, type DayInfo } from '@/utils/scheduleUtils'
import {
  getMonthGridDates,
  getCycleDayForDate,
  groupSessionsByDate,
  toDateKey,
  type UnifiedSession
} from '@/utils/calendarGrid'
import type { ScheduleDay } from '@/services/scheduleService'

export interface CalendarDay {
  date: Date
  dateKey: string
  dayOfMonth: number
  isCurrentMonth: boolean
  isToday: boolean
  isFuture: boolean
  cycleDay: number | null
  projected: DayInfo | null
  sessions: UnifiedSession[]
  hasCompletedSession: boolean
}

interface UseCalendarDataResult {
  calendarDays: CalendarDay[]
  isLoading: boolean
  today: Date
}

export function useCalendarData(currentMonth: Date): UseCalendarDataResult {
  const { data: weightsSessions, isLoading: isLoadingWeights } = useUserSessions()
  const { data: templateSessions, isLoading: isLoadingTemplates } = useUserTemplateWorkouts()
  const { data: schedule, isLoading: isLoadingSchedule } = useUserSchedule()
  const { data: profile, isLoading: isLoadingProfile } = useProfile()

  const isLoading = isLoadingWeights || isLoadingTemplates || isLoadingSchedule || isLoadingProfile

  const calendarDays = useMemo(() => {
    const timezone = profile?.timezone || detectUserTimezone()
    const today = getTodayInTimezone(timezone)
    const cycleStartDate = profile?.cycle_start_date

    // Build schedule map (day_number → first ScheduleDay)
    const scheduleMap = new Map<number, ScheduleDay>()
    if (schedule) {
      for (const s of schedule) {
        if (!scheduleMap.has(s.day_number)) {
          scheduleMap.set(s.day_number, s)
        }
      }
    }

    // Build unified sessions
    const unified: UnifiedSession[] = []
    if (weightsSessions) {
      for (const session of weightsSessions) {
        unified.push({
          id: session.id,
          type: 'weights',
          name: getWorkoutDisplayName(session.workout_day?.name),
          started_at: session.started_at,
          completed_at: session.completed_at,
          notes: session.notes,
          originalSession: session
        })
      }
    }
    if (templateSessions) {
      for (const session of templateSessions) {
        unified.push({
          id: session.id,
          type: 'cardio',
          name: session.template?.name || 'Workout',
          started_at: session.started_at,
          completed_at: session.completed_at,
          notes: session.notes,
          duration_minutes: session.duration_minutes,
          distance_value: session.distance_value,
          distance_unit: session.distance_unit,
          originalSession: session
        })
      }
    }

    // Group sessions by local date
    const sessionsByDate = groupSessionsByDate(unified, timezone)

    // Get grid dates for the month
    const gridDates = getMonthGridDates(currentMonth)

    return gridDates.map((date): CalendarDay => {
      const dateKey = toDateKey(date)
      const isToday = isSameDay(date, today)
      const isFuture = isAfter(startOfDay(date), startOfDay(today))
      const isCurrentMonthDay = isSameMonth(date, currentMonth)

      // Get cycle day for projection
      let cycleDay: number | null = null
      let projected: DayInfo | null = null
      if (cycleStartDate && schedule && schedule.length > 0) {
        cycleDay = getCycleDayForDate(date, cycleStartDate)
        if (cycleDay !== null) {
          const daySchedule = scheduleMap.get(cycleDay)
          projected = getDayInfo(daySchedule, cycleDay)
        }
      }

      const sessions = sessionsByDate.get(dateKey) || []
      const hasCompletedSession = sessions.some(s => s.completed_at !== null)

      return {
        date,
        dateKey,
        dayOfMonth: date.getDate(),
        isCurrentMonth: isCurrentMonthDay,
        isToday,
        isFuture,
        cycleDay,
        projected,
        sessions,
        hasCompletedSession
      }
    })
  }, [currentMonth, weightsSessions, templateSessions, schedule, profile])

  const timezone = profile?.timezone || detectUserTimezone()
  const today = getTodayInTimezone(timezone)

  return { calendarDays, isLoading, today }
}
