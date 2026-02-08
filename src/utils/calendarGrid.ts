import {
  startOfMonth,
  startOfWeek,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  differenceInCalendarDays,
  parseISO,
  format
} from 'date-fns'
import type { SessionWithDay } from '@/services/workoutService'
import type { TemplateWorkoutSession } from '@/services/templateWorkoutService'

// Unified session type shared with History page
export interface UnifiedSession {
  id: string
  type: 'weights' | 'cardio' | 'mobility'
  category: string
  name: string
  started_at: string
  completed_at: string | null
  notes: string | null
  duration_minutes?: number | null
  distance_value?: number | null
  distance_unit?: string | null
  originalSession: SessionWithDay | TemplateWorkoutSession
}

/**
 * Returns dates (Sunday-start weeks) covering the given month, using only as many rows as needed.
 */
export function getMonthGridDates(monthDate: Date): Date[] {
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  return eachDayOfInterval({ start: gridStart, end: gridEnd })
}

/**
 * Compute the cycle day (1-based) for any date given a cycle start date.
 * Returns null if date is before cycle start.
 */
export function getCycleDayForDate(
  date: Date,
  cycleStartDate: string,
  totalDays: number = 7
): number | null {
  const start = parseISO(cycleStartDate)
  const daysSinceStart = differenceInCalendarDays(date, start)
  if (daysSinceStart < 0) return null
  return ((daysSinceStart % totalDays) + totalDays) % totalDays + 1
}

/**
 * Convert a UTC timestamp to a local date key (YYYY-MM-DD) in the given timezone.
 */
function toLocalDateKey(isoTimestamp: string, timezone: string): string {
  const date = new Date(isoTimestamp)
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

/**
 * Group unified sessions by local date key (YYYY-MM-DD).
 */
export function groupSessionsByDate(
  sessions: UnifiedSession[],
  timezone: string
): Map<string, UnifiedSession[]> {
  const map = new Map<string, UnifiedSession[]>()
  for (const session of sessions) {
    const key = toLocalDateKey(session.started_at, timezone)
    const existing = map.get(key)
    if (existing) {
      existing.push(session)
    } else {
      map.set(key, [session])
    }
  }
  return map
}

/**
 * Format a Date as a YYYY-MM-DD key.
 */
export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
