import type { TemplateWorkoutSession } from '@/services/templateWorkoutService'
import type { ScheduleDay } from '@/services/scheduleService'

// ─── Cardio input configuration ─────────────────────────────────────────────

export interface CardioInputMode {
  mode: 'time' | 'distance'
  label: string
  unit: string
  slider?: { min: number; max: number; step: number }
}

export const CARDIO_INPUT_CONFIG: Record<string, CardioInputMode[]> = {
  run: [
    { mode: 'time', label: 'Time', unit: 'min' },
    { mode: 'distance', label: 'Miles', unit: 'miles' }
  ],
  cycle: [
    { mode: 'time', label: 'Time', unit: 'min' },
    { mode: 'distance', label: 'Miles', unit: 'miles' }
  ],
  stair_stepper: [
    { mode: 'time', label: 'Time', unit: 'min' }
  ],
  swim: [
    { mode: 'time', label: 'Time', unit: 'min' },
    { mode: 'distance', label: 'Meters', unit: 'meters', slider: { min: 500, max: 5000, step: 100 } }
  ],
  rower: [
    { mode: 'time', label: 'Time', unit: 'min' }
  ],
  boxing: [
    { mode: 'time', label: 'Time', unit: 'min' }
  ]
}

// ─── Per-template stats ─────────────────────────────────────────────────────

export interface CardioTemplateStats {
  lastSession: TemplateWorkoutSession | null
  lastSessionSummary: string
  weeklyCount: number
  nextScheduledDay: number | null
}

export function getCardioTemplateStats(
  templateId: string,
  sessions: TemplateWorkoutSession[],
  schedule: ScheduleDay[],
  currentCycleDay: number
): CardioTemplateStats {
  // Filter to completed sessions for this template, sorted desc by completed_at
  const templateSessions = sessions
    .filter(s => s.template_id === templateId && s.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())

  const lastSession = templateSessions[0] ?? null

  // Build summary string
  let lastSessionSummary = 'No sessions yet'
  const count = templateSessions.length
  if (count > 0) {
    lastSessionSummary = `${count} session${count !== 1 ? 's' : ''} completed`
  }

  // Weekly count: sessions completed since start of current week (Sunday)
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const weeklyCount = templateSessions.filter(s => {
    const completedDate = new Date(s.completed_at!)
    return completedDate >= startOfWeek
  }).length

  // Next scheduled day: scan from currentCycleDay + 1 through wrap-around
  let nextScheduledDay: number | null = null
  const totalDays = schedule.length > 0
    ? Math.max(...schedule.map(s => s.day_number))
    : 0

  if (totalDays > 0) {
    for (let i = 1; i <= totalDays; i++) {
      const checkDay = ((currentCycleDay - 1 + i) % totalDays) + 1
      const dayEntry = schedule.find(
        s => s.day_number === checkDay && s.template_id === templateId
      )
      if (dayEntry) {
        nextScheduledDay = checkDay
        break
      }
    }
  }

  return { lastSession, lastSessionSummary, weeklyCount, nextScheduledDay }
}

// ─── localStorage preference helpers ────────────────────────────────────────

export interface CardioPreference {
  mode: 'time' | 'distance'
  unit: string
}

export function getCardioPreference(category: string): CardioPreference | null {
  try {
    const raw = localStorage.getItem(`cardio-pref-${category}`)
    if (!raw) return null
    return JSON.parse(raw) as CardioPreference
  } catch {
    return null
  }
}

export function setCardioPreference(category: string, pref: CardioPreference): void {
  try {
    localStorage.setItem(`cardio-pref-${category}`, JSON.stringify(pref))
  } catch {
    // Silently fail (private browsing, quota exceeded)
  }
}
