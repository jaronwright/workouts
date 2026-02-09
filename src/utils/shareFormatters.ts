import { formatDate } from '@/utils/formatters'

interface SessionShareData {
  workoutName: string
  date: string
  duration: string | null
  exerciseCount: number
}

export function formatSessionShareText(data: SessionShareData): string {
  const lines = [
    `${data.workoutName} - ${formatDate(data.date)}`,
    data.duration ? `Duration: ${data.duration}` : null,
    `${data.exerciseCount} exercise${data.exerciseCount !== 1 ? 's' : ''} completed`,
    '',
    'Tracked with Workout Tracker'
  ]
  return lines.filter((l) => l !== null).join('\n')
}

interface CardioShareData {
  workoutName: string
  date: string
  durationMinutes: number | null
  distanceValue: number | null
  distanceUnit: string | null
}

export function formatCardioShareText(data: CardioShareData): string {
  const stats: string[] = []
  if (data.durationMinutes) stats.push(`${data.durationMinutes} min`)
  if (data.distanceValue) stats.push(`${data.distanceValue} ${data.distanceUnit || 'miles'}`)

  const lines = [
    `${data.workoutName} - ${formatDate(data.date)}`,
    stats.length > 0 ? stats.join(' | ') : 'Completed',
    '',
    'Tracked with Workout Tracker'
  ]
  return lines.join('\n')
}

interface PRShareData {
  exerciseName: string
  newWeight: number
  improvement: number | null
}

export function formatPRShareText(data: PRShareData): string {
  const lines = [
    `New PR! ${data.exerciseName}: ${data.newWeight} lbs`,
    data.improvement !== null ? `+${data.improvement} lbs improvement` : null,
    '',
    'Tracked with Workout Tracker'
  ]
  return lines.filter((l) => l !== null).join('\n')
}
