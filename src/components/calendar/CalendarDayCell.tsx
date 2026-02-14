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
  const showProjectedIcon = hasProjection

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

  // Override for completed sessions — always show the actual workout icon
  if (hasCompletedSession && sessionStyle) {
    Icon = sessionStyle.icon
    iconColor = sessionStyle.color
    bgCircleColor = sessionStyle.bgColor
  }

  // Cell background and opacity based on state
  let cellBg = 'transparent'
  let iconOpacity = 1

  if (!isCurrentMonth) {
    iconOpacity = 0.3
  } else if (hasCompletedSession) {
    // Completed: subtle workout-type tint on cell
    cellBg = `${iconColor}0D`
  } else if (isRest) {
    iconOpacity = 0.5
  } else if (isFuture && !isToday) {
    iconOpacity = 0.55
    bgCircleColor = hasIcon ? `${iconColor}18` : 'transparent'
  } else if (isMissed) {
    iconColor = '#9CA3AF'
    bgCircleColor = 'rgba(156, 163, 175, 0.1)'
    iconOpacity = 0.6
  }

  return (
    <button
      onClick={() => onSelect(day)}
      className={`
        relative flex flex-col items-center justify-center gap-1 rounded-2xl
        transition-all duration-150 h-full
        ${!isCurrentMonth ? 'opacity-25' : ''}
        ${isSelected && !isToday ? 'ring-2 ring-[var(--color-primary)] bg-[var(--color-primary)]/5' : ''}
        ${isSelected && isToday ? 'ring-2 ring-[var(--color-primary)]' : ''}
        active:scale-95
      `}
      style={{ backgroundColor: !isSelected ? cellBg : undefined }}
    >
      {/* Day number — Apple-style filled circle for today */}
      {isToday ? (
        <span className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-text)] text-sm font-bold leading-none">
          {dayOfMonth}
        </span>
      ) : (
        <span className={`
          text-sm font-semibold leading-none
          ${hasCompletedSession && isCurrentMonth ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}
        `}>
          {dayOfMonth}
        </span>
      )}

      {/* Workout icon circle */}
      {showCountBadge ? (
        <div className="relative">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
              opacity: iconOpacity
            }}
          >
            <span className="text-xs font-bold text-[var(--color-text)]">{multiCount}</span>
          </div>
        </div>
      ) : hasIcon && Icon ? (
        <div className="relative">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: bgCircleColor,
              opacity: iconOpacity
            }}
          >
            <Icon
              className="w-4 h-4"
              style={{ color: iconColor }}
            />
          </div>
          {/* Today pulse ring — inside relative container so it aligns with icon */}
          {isToday && showProjectedIcon && !isRest && !hasCompletedSession && isCurrentMonth && !prefersReduced && (
            <motion.div
              className="absolute inset-0 w-8 h-8 rounded-full border-2 border-[var(--color-primary)]"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
      ) : (
        <div className="w-8 h-8" />
      )}

      {/* Green completion dot */}
      {hasCompletedSession && isCurrentMonth && (
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
      )}

      {/* Missed workout indicator dot */}
      {isMissed && isCurrentMonth && (
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)] opacity-70" />
      )}
    </button>
  )
}
