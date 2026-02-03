import { useNavigate } from 'react-router-dom'
import { Moon, Dumbbell, Heart, Activity, ChevronRight, Calendar } from 'lucide-react'
import { Card, CardContent, Button } from '@/components/ui'
import { useUserSchedule } from '@/hooks/useSchedule'
import { useProfile } from '@/hooks/useProfile'
import {
  getWeightsStyleByDayNumber,
  getCardioStyle,
  getMobilityStyle,
  getWorkoutDisplayName
} from '@/config/workoutConfig'
import type { ScheduleDay } from '@/services/scheduleService'

interface DayInfo {
  dayNumber: number
  icon: typeof Dumbbell
  color: string
  bgColor: string
  name: string
  isRest: boolean
  workoutDayId?: string
  templateId?: string
  templateType?: string
}

function getDayInfo(schedule: ScheduleDay | undefined, dayNumber: number): DayInfo {
  if (!schedule) {
    return {
      dayNumber,
      icon: Calendar,
      color: 'var(--color-text-muted)',
      bgColor: 'var(--color-surface-hover)',
      name: 'Not set',
      isRest: false
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
    const style = getWeightsStyleByDayNumber(schedule.workout_day.day_number)
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
  }

  return {
    dayNumber,
    icon: Calendar,
    color: 'var(--color-text-muted)',
    bgColor: 'var(--color-surface-hover)',
    name: 'Not set',
    isRest: false
  }
}

export function ScheduleWidget() {
  const navigate = useNavigate()
  const { data: schedule, isLoading } = useUserSchedule()
  const { data: profile } = useProfile()
  const currentCycleDay = profile?.current_cycle_day || 1

  // Create a map of day_number to schedule for quick lookup
  const scheduleMap = new Map<number, ScheduleDay>()
  schedule?.forEach(s => {
    // Get existing or add new
    if (!scheduleMap.has(s.day_number)) {
      scheduleMap.set(s.day_number, s)
    }
  })

  // Get info for all 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const dayNumber = i + 1
    const daySchedule = scheduleMap.get(dayNumber)
    return getDayInfo(daySchedule, dayNumber)
  })

  // Get today's workout info
  const todayInfo = days[currentCycleDay - 1] || days[0]
  const hasSchedule = schedule && schedule.length > 0

  const handleDayClick = (day: DayInfo) => {
    if (day.isRest) {
      navigate('/rest-day')
    } else if (day.workoutDayId) {
      navigate(`/workout/${day.workoutDayId}`)
    } else if (day.templateId) {
      if (day.templateType === 'cardio') {
        navigate(`/cardio/${day.templateId}`)
      } else if (day.templateType === 'mobility') {
        navigate(`/mobility/${day.templateId}`)
      }
    } else {
      navigate('/schedule')
    }
  }

  const handleTodayClick = () => {
    handleDayClick(todayInfo)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="h-24 skeleton rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (!hasSchedule) {
    return (
      <Card variant="outlined">
        <CardContent className="py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-surface-hover)] flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[var(--color-text-muted)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-text)]">
                No schedule set up yet
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Create your weekly workout plan
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={() => navigate('/schedule')}>
              Set Up
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const TodayIcon = todayInfo.icon

  return (
    <Card className="overflow-hidden">
      {/* Today's Workout - Hero Section */}
      <div
        className="p-4 cursor-pointer active:opacity-90 transition-opacity"
        style={{ backgroundColor: `${todayInfo.color}10` }}
        onClick={handleTodayClick}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center"
            style={{ backgroundColor: todayInfo.bgColor }}
          >
            <TodayIcon className="w-6 h-6" style={{ color: todayInfo.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ backgroundColor: todayInfo.bgColor, color: todayInfo.color }}>
                Day {currentCycleDay}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)]">Today</span>
            </div>
            <h3 className="text-base font-bold text-[var(--color-text)] mt-1 truncate">
              {todayInfo.name}
            </h3>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
        </div>
      </div>

      {/* Cycle Days Overview - Compact Tabs */}
      <CardContent className="py-3 border-t border-[var(--color-border)]">
        <div className="flex justify-between gap-1">
          {days.map((day) => {
            const isToday = day.dayNumber === currentCycleDay
            const DayIcon = day.icon

            return (
              <button
                key={day.dayNumber}
                onClick={() => handleDayClick(day)}
                className={`
                  flex-1 flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg
                  transition-all duration-150
                  ${isToday
                    ? 'bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]'
                    : 'hover:bg-[var(--color-surface-hover)] active:scale-95'
                  }
                `}
              >
                <span className={`
                  text-[10px] font-bold
                  ${isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}
                `}>
                  {day.dayNumber}
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150"
                  style={{
                    backgroundColor: isToday ? todayInfo.color : day.bgColor,
                    color: isToday ? 'white' : day.color
                  }}
                >
                  <DayIcon className="w-4 h-4" />
                </div>
                <span className={`
                  text-[9px] font-medium truncate max-w-full px-0.5
                  ${isToday ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}
                `}>
                  {day.name.length > 6 ? day.name.substring(0, 5) + '…' : day.name}
                </span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
