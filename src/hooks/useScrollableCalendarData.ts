import { useMemo } from 'react'
import { addMonths, subMonths, format } from 'date-fns'
import { useUserSessions } from '@/hooks/useWorkoutSession'
import { useUserTemplateWorkouts } from '@/hooks/useTemplateWorkout'
import { useUserSchedule } from '@/hooks/useSchedule'
import { useProfile } from '@/hooks/useProfile'
import { getWorkoutDisplayName } from '@/config/workoutConfig'
import { detectUserTimezone, getTodayInTimezone } from '@/utils/cycleDay'
import {
  groupSessionsByDate,
  buildCalendarDaysForMonth,
  type UnifiedSession,
  type CalendarDay
} from '@/utils/calendarGrid'
import type { ScheduleDay } from '@/services/scheduleService'

export interface MonthData {
  month: Date
  monthKey: string
  days: CalendarDay[]
}

interface UseScrollableCalendarDataResult {
  months: MonthData[]
  allSessions: UnifiedSession[]
  isLoading: boolean
  today: Date
  todayMonthIndex: number
}

const MONTHS_BACK = 6
const MONTHS_FORWARD = 6

export function useScrollableCalendarData(): UseScrollableCalendarDataResult {
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

  const months = useMemo(() => {
    const timezone = profile?.timezone || detectUserTimezone()
    const today = getTodayInTimezone(timezone)
    const cycleStartDate = profile?.cycle_start_date

    // Build schedule map
    const scheduleMap = new Map<number, ScheduleDay[]>()
    if (schedule) {
      for (const s of schedule) {
        const existing = scheduleMap.get(s.day_number) || []
        existing.push(s)
        scheduleMap.set(s.day_number, existing)
      }
    }

    // Group all sessions by date once
    const sessionsByDate = groupSessionsByDate(allSessions, timezone)

    // Generate 13 months: 6 back + current + 6 forward
    const result: MonthData[] = []
    for (let i = -MONTHS_BACK; i <= MONTHS_FORWARD; i++) {
      const month = i === 0 ? today : (i < 0 ? subMonths(today, -i) : addMonths(today, i))
      const days = buildCalendarDaysForMonth(
        month,
        today,
        sessionsByDate,
        scheduleMap,
        cycleStartDate ?? null
      )
      result.push({
        month,
        monthKey: format(month, 'yyyy-MM'),
        days
      })
    }

    return result
  }, [allSessions, schedule, profile])

  const timezone = profile?.timezone || detectUserTimezone()
  const today = getTodayInTimezone(timezone)

  return {
    months,
    allSessions,
    isLoading,
    today,
    todayMonthIndex: MONTHS_BACK // Current month is always at index 6
  }
}
