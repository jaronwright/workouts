import { useRef, useCallback, useState } from 'react'
import { format, addMonths, subMonths, isSameMonth } from 'date-fns'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarDayCell } from './CalendarDayCell'
import { useReducedMotion } from '@/hooks/useReducedMotion'
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
  const [slideDirection, setSlideDirection] = useState(0) // -1 = left (prev), 1 = right (next)
  const prefersReduced = useReducedMotion()

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        setSlideDirection(1)
        onMonthChange(addMonths(currentMonth, 1))
      } else {
        setSlideDirection(-1)
        onMonthChange(subMonths(currentMonth, 1))
      }
    }
    touchStartX.current = null
  }, [currentMonth, onMonthChange])

  const goToPrevMonth = () => {
    setSlideDirection(-1)
    onMonthChange(subMonths(currentMonth, 1))
  }
  const goToNextMonth = () => {
    setSlideDirection(1)
    onMonthChange(addMonths(currentMonth, 1))
  }
  const goToToday = () => {
    setSlideDirection(0)
    onMonthChange(today)
  }

  const isCurrentMonthToday = isSameMonth(currentMonth, today)
  const monthKey = format(currentMonth, 'yyyy-MM')

  const rowCount = Math.ceil(calendarDays.length / 7)

  return (
    <div
      className="flex flex-col flex-1"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Month navigation — editorial style */}
      <div className="mb-[var(--space-4)]">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-baseline gap-[var(--space-2)]">
            <h2
              className="text-[clamp(1.5rem,6vw,2rem)] font-extrabold text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-heading)', lineHeight: 'var(--leading-tight)' }}
            >
              {format(currentMonth, 'MMMM')}
            </h2>
            <span className="text-[var(--text-sm)] text-[var(--color-text-muted)] font-medium font-mono-stats">
              {format(currentMonth, 'yyyy')}
            </span>
            {!isCurrentMonthToday && (
              <button
                onClick={goToToday}
                className="text-[var(--text-xs)] font-semibold text-[var(--color-primary)] px-2.5 py-0.5 rounded-full bg-[var(--color-primary-muted)] transition-colors ml-1"
              >
                Today
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevMonth}
              className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4.5 h-4.5 text-[var(--color-text-muted)]" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] active:scale-95 transition-all"
            >
              <ChevronRight className="w-4.5 h-4.5 text-[var(--color-text-muted)]" />
            </button>
          </div>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((day, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold text-[var(--color-text-muted)] uppercase py-1"
            style={{ letterSpacing: 'var(--tracking-wider)' }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid with animated month transitions */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={monthKey}
          className="grid grid-cols-7 gap-1.5 flex-1"
          style={{ gridTemplateRows: `repeat(${rowCount}, 1fr)` }}
          initial={prefersReduced ? false : { opacity: 0, x: slideDirection * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: slideDirection * -40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {calendarDays.map((day) => (
            <CalendarDayCell
              key={day.dateKey}
              day={day}
              isSelected={day.dateKey === format(selectedDate, 'yyyy-MM-dd')}
              onSelect={onSelectDate}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
