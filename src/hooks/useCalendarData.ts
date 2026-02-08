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
  projectedCount: number
  sessions: UnifiedSession[]
  hasCompletedSession: boolean
}

interface UseCalendarDataResult {
  calendarDays: CalendarDay[]
  allSessions: UnifiedSession[]
  isLoading: boolean
  today: Date
}

export function useCalendarData(currentMonth: Date): UseCalendarDataResult {
  const { data: weightsSessions, isLoading: isLoadingWeights } = useUserSessions()
  const { data: templateSessions, isLoading: isLoadingTemplates } = useUserTemplateWorkouts()
  const { data: schedule, isLoading: isLoadingSchedule } = useUserSchedule()
  const { data: profile, isLoading: isLoadingProfile } = useProfile()

  const isLoading = isLoadingWeights || isLoadingTemplates || isLoadingSchedule || isLoadingProfile

  const allSessions = useMemo(() => {
    const unified: UnifiedSession[] = []
    if (weightsSessions) {
      for (const session of weightsSessions) {
        const displayName = getWorkoutDisplayName(session.workout_day?.name)
        unified.push({
          id: session.id,
          type: 'weights',
          category: displayName.toLowerCase(),
          name: displayName,
          started_at: session.started_at,
          completed_at: session.completed_at,
          notes: session.notes,
          originalSession: session
        })
      }
    }
    if (templateSessions) {
      for (const session of templateSessions) {
        const templateType = session.template?.type || 'cardio'
        unified.push({
          id: session.id,
          type: templateType === 'mobility' ? 'mobility' : 'cardio',
          category: session.template?.category || '',
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
    return unified
  }, [weightsSessions, templateSessions])

  const calendarDays = useMemo(() => {
    const timezone = profile?.timezone || detectUserTimezone()
    const today = getTodayInTimezone(timezone)
    const cycleStartDate = profile?.cycle_start_date

    // Build schedule map (day_number → all ScheduleDays)
    const scheduleMap = new Map<number, ScheduleDay[]>()
    if (schedule) {
      for (const s of schedule) {
        const existing = scheduleMap.get(s.day_number) || []
        existing.push(s)
        scheduleMap.set(s.day_number, existing)
      }
    }

    // Group sessions by local date
    const sessionsByDate = groupSessionsByDate(allSessions, timezone)

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
      let projectedCount = 0
      if (cycleStartDate && schedule && schedule.length > 0) {
        cycleDay = getCycleDayForDate(date, cycleStartDate)
        if (cycleDay !== null) {
          const daySchedules = scheduleMap.get(cycleDay) || []
          projectedCount = daySchedules.length
          projected = daySchedules.length > 0 ? getDayInfo(daySchedules[0], cycleDay) : null
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
        projectedCount,
        sessions,
        hasCompletedSession
      }
    })
  }, [currentMonth, allSessions, schedule, profile])

  const timezone = profile?.timezone || detectUserTimezone()
  const today = getTodayInTimezone(timezone)

  return { calendarDays, allSessions, isLoading, today }
}
