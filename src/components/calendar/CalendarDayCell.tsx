import { motion } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import {
  getWeightsStyleByName,
  getCardioStyle,
  getMobilityStyle,
  type WorkoutStyle
} from '@/config/workoutConfig'
import type { CalendarDay } from '@/hooks/useCalendarData'
import type { UnifiedSession } from '@/utils/calendarGrid'

interface CalendarDayCellProps {
  day: CalendarDay
  isSelected: boolean
  onSelect: (day: CalendarDay) => void
}

function getSessionStyle(session: UnifiedSession): WorkoutStyle {
  if (session.type === 'weights') return getWeightsStyleByName(session.name)
  if (session.type === 'mobility') return getMobilityStyle(session.category)
  return getCardioStyle(session.category)
}

export function CalendarDayCell({ day, isSelected, onSelect }: CalendarDayCellProps) {
  const { projected, sessions, hasCompletedSession, isToday, isFuture, isCurrentMonth, dayOfMonth } = day
  const prefersReduced = useReducedMotion()

  const hasProjection = projected && projected.name !== 'Not set'
  const isRest = projected?.isRest
  const showProjectedIcon = hasProjection && !isRest

  // Derive icon from completed session when no projection exists
  const completedSession = hasCompletedSession ? sessions.find(s => s.completed_at) : null
  const sessionStyle = completedSession ? getSessionStyle(completedSession) : null

  // Show an icon if we have a projected workout OR a completed session
  const hasIcon = showProjectedIcon || (hasCompletedSession && sessionStyle)

  // Missed workout: past day + scheduled (not rest) + no completed session
  const isMissed = isCurrentMonth && !isFuture && !isToday && hasProjection && !isRest && !hasCompletedSession

  // Determine icon and color — prefer completed session style, fall back to projected
  let Icon = showProjectedIcon ? projected!.icon : sessionStyle?.icon || null
  let iconColor = showProjectedIcon ? (projected!.color || '#6B7280') : (sessionStyle?.color || '#6B7280')
  let bgCircleColor = showProjectedIcon ? (projected!.bgColor || 'transparent') : (sessionStyle?.bgColor || 'transparent')
  let iconOpacity = 1

  // Override for completed sessions — always show the actual workout icon
  if (hasCompletedSession && sessionStyle) {
    Icon = sessionStyle.icon
    iconColor = sessionStyle.color
    bgCircleColor = sessionStyle.bgColor
  }

  if (!isCurrentMonth) {
    iconOpacity = 0.3
  } else if (isFuture && !isToday) {
    iconOpacity = 0.3
    bgCircleColor = hasIcon ? `${iconColor}10` : 'transparent'
  } else if (isMissed) {
    iconColor = '#9CA3AF'
    bgCircleColor = 'rgba(156, 163, 175, 0.1)'
    iconOpacity = 0.5
  }

  return (
    <button
      onClick={() => onSelect(day)}
      className={`
        relative flex flex-col items-center justify-start gap-0.5 py-1.5 rounded-lg
        transition-all duration-150 min-h-[52px]
        ${!isCurrentMonth ? 'opacity-30' : ''}
        ${isSelected ? 'ring-2 ring-[var(--color-primary)] bg-[var(--color-primary)]/5' : ''}
        active:scale-95
      `}
    >
      {/* Day number */}
      <span className={`
        text-[11px] font-semibold leading-none
        ${isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}
      `}>
        {dayOfMonth}
      </span>

      {/* Workout icon circle */}
      {hasIcon && Icon ? (
        <div className="relative">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
            style={{
              backgroundColor: bgCircleColor,
              opacity: iconOpacity
            }}
          >
            <Icon
              className="w-3.5 h-3.5"
              style={{ color: iconColor }}
            />
          </div>
        </div>
      ) : isRest && isCurrentMonth ? (
        <div className="w-7 h-7 rounded-full flex items-center justify-center mt-0.5 opacity-40">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)]" />
        </div>
      ) : (
        <div className="w-7 h-7 mt-0.5" />
      )}

      {/* Today pulse ring — only when there's a scheduled workout not yet done */}
      {isToday && showProjectedIcon && !hasCompletedSession && isCurrentMonth && !prefersReduced && (
        <motion.div
          className="absolute top-[14px] w-7 h-7 rounded-full border-2 border-[var(--color-primary)]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Green completion dot */}
      {hasCompletedSession && isCurrentMonth && (
        <div className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
      )}

      {/* Missed workout red dot */}
      {isMissed && isCurrentMonth && (
        <div className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[var(--color-danger)]" />
      )}

      {/* Multiple workouts badge */}
      {sessions.length > 1 && isCurrentMonth && (
        <span className="absolute top-0.5 right-0.5 text-[8px] font-bold text-[var(--color-text-muted)]">
          +{sessions.length - 1}
        </span>
      )}
    </button>
  )
}
