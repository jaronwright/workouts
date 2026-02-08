import type { CalendarDay } from '@/hooks/useCalendarData'

interface CalendarDayCellProps {
  day: CalendarDay
  isSelected: boolean
  onSelect: (day: CalendarDay) => void
}

export function CalendarDayCell({ day, isSelected, onSelect }: CalendarDayCellProps) {
  const { projected, sessions, hasCompletedSession, isToday, isFuture, isCurrentMonth, dayOfMonth } = day

  const hasSessions = sessions.length > 0
  const hasProjection = projected && projected.name !== 'Not set'
  const isRest = projected?.isRest
  const showIcon = hasProjection && !isRest

  // Determine icon and color
  let iconColor = projected?.color || '#6B7280'
  let bgCircleColor = projected?.bgColor || 'transparent'
  let iconOpacity = 1

  if (!isCurrentMonth) {
    iconOpacity = 0.3
  } else if (isFuture && !isToday) {
    iconOpacity = 0.3
    bgCircleColor = showIcon ? `${projected!.color}10` : 'transparent'
  } else if (!hasSessions && !isFuture && hasProjection && !isRest) {
    // Past day, scheduled but skipped
    iconColor = '#9CA3AF'
    bgCircleColor = 'rgba(156, 163, 175, 0.1)'
    iconOpacity = 0.5
  }

  const Icon = projected?.icon

  return (
    <button
      onClick={() => onSelect(day)}
      className={`
        relative flex flex-col items-center justify-start gap-0.5 py-1.5 rounded-lg
        transition-all duration-150 min-h-[52px]
        ${!isCurrentMonth ? 'opacity-30' : ''}
        ${isSelected ? 'ring-2 ring-[var(--color-primary)] bg-[var(--color-primary)]/5' : ''}
        ${isToday && !isSelected ? 'ring-2 ring-[var(--color-primary)]/50' : ''}
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
      {showIcon && Icon ? (
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
      ) : isRest && isCurrentMonth ? (
        <div className="w-7 h-7 rounded-full flex items-center justify-center mt-0.5 opacity-40">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)]" />
        </div>
      ) : (
        <div className="w-7 h-7 mt-0.5" />
      )}

      {/* Green completion dot */}
      {hasCompletedSession && isCurrentMonth && (
        <div className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
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
