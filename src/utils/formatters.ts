import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'h:mm a')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatWeight(weight: number | null, unit: 'lbs' | 'kg' = 'lbs'): string {
  if (weight === null) return '—'
  return `${weight} ${unit}`
}

export function formatReps(reps: number | null): string {
  if (reps === null) return '—'
  return `${reps}`
}

/**
 * Normalizes a workout day name to Title Case.
 * Converts "PUSH (Chest, Shoulders, Triceps)" to "Push (Chest, Shoulders, Triceps)"
 * This is needed because the database may store names in uppercase.
 */
export function normalizeWorkoutName(name: string): string {
  if (!name) return name
  // Check if the name starts with an uppercase word followed by a space and parenthesis
  const match = name.match(/^([A-Z]+)(\s*\(.*)$/)
  if (match) {
    // Convert first word to Title Case (e.g., "PUSH" -> "Push")
    const titleCaseWord = match[1].charAt(0) + match[1].slice(1).toLowerCase()
    return titleCaseWord + match[2]
  }
  return name
}
