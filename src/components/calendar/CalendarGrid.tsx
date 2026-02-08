import { useRef, useCallback } from 'react'
import { format, addMonths, subMonths, isSameMonth } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarDayCell } from './CalendarDayCell'
import type { CalendarDay } from '@/hooks/useCalendarData'

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

interface CalendarGridProps {
  calendarDays: CalendarDay[]
  currentMonth: Date
  selectedDate: Date
  today: Date
  onSelectDate: (day: CalendarDay) => void
  onMonthChange: (month: Date) => void
}

export function CalendarGrid({
  calendarDays,
  currentMonth,
  selectedDate,
  today,
  onSelectDate,
  onMonthChange
}: CalendarGridProps) {
  const touchStartX = useRef<number | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        onMonthChange(addMonths(currentMonth, 1))
      } else {
        onMonthChange(subMonths(currentMonth, 1))
      }
    }
    touchStartX.current = null
  }, [currentMonth, onMonthChange])

  const goToPrevMonth = () => onMonthChange(subMonths(currentMonth, 1))
  const goToNextMonth = () => onMonthChange(addMonths(currentMonth, 1))
  const goToToday = () => onMonthChange(today)

  const isCurrentMonthToday = isSameMonth(currentMonth, today)

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Month navigation header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-[var(--color-text-muted)]" />
        </button>

        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-[var(--color-text)]">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          {!isCurrentMonthToday && (
            <button
              onClick={goToToday}
              className="text-xs font-medium text-[var(--color-primary)] px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 transition-colors"
            >
              Today
            </button>
          )}
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] active:scale-95 transition-all"
        >
          <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px">
        {calendarDays.map((day) => (
          <CalendarDayCell
            key={day.dateKey}
            day={day}
            isSelected={day.dateKey === format(selectedDate, 'yyyy-MM-dd')}
            onSelect={onSelectDate}
          />
        ))}
      </div>
    </div>
  )
}
