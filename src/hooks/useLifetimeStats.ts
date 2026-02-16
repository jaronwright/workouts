import { useUserSessions } from '@/hooks/useWorkoutSession'
import { useUserTemplateWorkouts } from '@/hooks/useTemplateWorkout'
import { getWorkoutDisplayName } from '@/config/workoutConfig'
import type { SessionWithDay } from '@/services/workoutService'

/** Compute total workouts, longest streak, and favorite workout type from all completed sessions */
export function useLifetimeStats() {
  const { data: weightsSessions } = useUserSessions()
  const { data: templateSessions } = useUserTemplateWorkouts()

  const allSessions = [
    ...(weightsSessions || []),
    ...(templateSessions || [])
  ].filter(s => s.completed_at)

  const totalWorkouts = allSessions.length

  // Longest streak
  const completedDates = allSessions
    .map(s => {
      const d = new Date(s.completed_at!)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
    .sort((a, b) => a - b)

  const uniqueDates = [...new Set(completedDates)]
  let longestStreak = 0
  let currentStreak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = uniqueDates[i] - uniqueDates[i - 1]
    if (diff <= 86400000) { // 1 day
      currentStreak++
    } else {
      longestStreak = Math.max(longestStreak, currentStreak)
      currentStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak)
  if (uniqueDates.length === 0) longestStreak = 0

  // Favorite workout type
  const typeCounts = new Map<string, number>()
  ;(weightsSessions || []).forEach((s: SessionWithDay) => {
    if (!s.completed_at) return
    const name = getWorkoutDisplayName(s.workout_day?.name)
    typeCounts.set(name, (typeCounts.get(name) || 0) + 1)
  })
  ;(templateSessions || []).forEach(s => {
    if (!s.completed_at) return
    const name = s.template?.name || 'Other'
    typeCounts.set(name, (typeCounts.get(name) || 0) + 1)
  })

  let favoriteType = 'None'
  let maxCount = 0
  typeCounts.forEach((count, name) => {
    if (count > maxCount) {
      maxCount = count
      favoriteType = name
    }
  })

  return { totalWorkouts, longestStreak, favoriteType }
}
