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

  // Determine if we should show a count badge instead of an icon
  const multiCount = sessions.length > 1 ? sessions.length : (isFuture || isToday) && day.projectedCount > 1 ? day.projectedCount : 0
  const showCountBadge = multiCount > 1 && isCurrentMonth

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
      {showCountBadge ? (
        <div className="relative mt-0.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
              opacity: iconOpacity
            }}
          >
            <span className="text-[11px] font-bold text-[var(--color-text)]">{multiCount}</span>
          </div>
        </div>
      ) : hasIcon && Icon ? (
        <div className="relative mt-0.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
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
          {/* Today pulse ring — inside relative container so it aligns with icon */}
          {isToday && showProjectedIcon && !hasCompletedSession && isCurrentMonth && !prefersReduced && (
            <motion.div
              className="absolute inset-0 w-7 h-7 rounded-full border-2 border-[var(--color-primary)]"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
      ) : isRest && isCurrentMonth ? (
        <div className="w-7 h-7 rounded-full flex items-center justify-center mt-0.5 opacity-40">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)]" />
        </div>
      ) : (
        <div className="w-7 h-7 mt-0.5" />
      )}

      {/* Green completion dot */}
      {hasCompletedSession && isCurrentMonth && (
        <div className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
      )}

      {/* Missed workout red dot */}
      {isMissed && isCurrentMonth && (
        <div className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[var(--color-danger)]" />
      )}
    </button>
  )
}
