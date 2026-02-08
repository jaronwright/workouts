import { parseISO, differenceInCalendarDays } from 'date-fns'

/**
 * Get today's date in a specific timezone as a Date object (midnight local).
 * Uses the en-CA locale which natively formats as YYYY-MM-DD.
 */
export function getTodayInTimezone(timezone: string): Date {
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date())
  return parseISO(dateStr)
}

/**
 * Compute the current cycle day (1-based) from a start date and timezone.
 * Uses double-modulo to handle negative values (start date in future).
 */
export function getCurrentCycleDay(
  cycleStartDate: string,
  timezone: string,
  totalDays: number = 7
): number {
  const today = getTodayInTimezone(timezone)
  const startDateStr = cycleStartDate.substring(0, 10)
  const start = parseISO(startDateStr)
  const daysSinceStart = differenceInCalendarDays(today, start)
  return ((daysSinceStart % totalDays) + totalDays) % totalDays + 1
}

/**
 * Detect the user's timezone from the browser.
 * Falls back to America/Chicago if detection fails.
 */
export function detectUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'America/Chicago'
  }
}

/**
 * Format a cycle start date string for display (e.g., "Feb 7, 2026").
 */
export function formatCycleStartDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'today'
  try {
    const date = parseISO(dateStr)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  } catch {
    return 'today'
  }
}
