import { Moon, type Icon } from '@phosphor-icons/react'
import {
  getWeightsStyleByName,
  getCardioStyle,
  getMobilityStyle,
  getWorkoutDisplayName
} from '@/config/workoutConfig'
import type { ScheduleDay } from '@/services/scheduleService'

export interface DayInfo {
  dayNumber: number
  icon: Icon
  color: string
  bgColor: string
  name: string
  isRest: boolean
  workoutDayId?: string
  templateId?: string
  templateType?: string
}

export function getDayInfo(schedule: ScheduleDay | undefined, dayNumber: number): DayInfo {
  if (!schedule) {
    return {
      dayNumber,
      icon: Moon,
      color: '#6B7280',
      bgColor: 'rgba(107, 114, 128, 0.15)',
      name: 'Rest',
      isRest: true
    }
  }

  if (schedule.is_rest_day) {
    return {
      dayNumber,
      icon: Moon,
      color: '#6B7280',
      bgColor: 'rgba(107, 114, 128, 0.15)',
      name: 'Rest',
      isRest: true
    }
  }

  if (schedule.workout_day) {
    const style = getWeightsStyleByName(schedule.workout_day.name)
    return {
      dayNumber,
      icon: style.icon,
      color: style.color,
      bgColor: `${style.color}20`,
      name: getWorkoutDisplayName(schedule.workout_day.name) || schedule.workout_day.name,
      isRest: false,
      workoutDayId: schedule.workout_day_id || undefined
    }
  }

  if (schedule.template) {
    const template = schedule.template
    let style
    if (template.type === 'cardio') {
      style = getCardioStyle(template.category)
      return {
        dayNumber,
        icon: style.icon,
        color: style.color,
        bgColor: `${style.color}20`,
        name: template.name,
        isRest: false,
        templateId: schedule.template_id || undefined,
        templateType: template.type
      }
    }
    if (template.type === 'mobility') {
      style = getMobilityStyle(template.category)
      const mobilityDayId = template.workout_day_id
      return {
        dayNumber,
        icon: style.icon,
        color: style.color,
        bgColor: `${style.color}20`,
        name: template.name,
        isRest: false,
        workoutDayId: mobilityDayId || undefined,
        templateId: mobilityDayId ? undefined : (schedule.template_id || undefined),
        templateType: mobilityDayId ? undefined : template.type
      }
    }
  }

  return {
    dayNumber,
    icon: Moon,
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.15)',
    name: 'Rest',
    isRest: true
  }
}
