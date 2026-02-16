import { useRef, useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowUp } from '@phosphor-icons/react'
import { CalendarDayCell } from './CalendarDayCell'
import { springPresets } from '@/config/animationConfig'
import type { MonthData } from '@/hooks/useScrollableCalendarData'
import type { CalendarDay } from '@/utils/calendarGrid'

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

interface ScrollableCalendarProps {
  months: MonthData[]
  today: Date
  todayMonthIndex: number
  selectedDate: Date
  onSelectDate: (day: CalendarDay) => void
  /** Sticky top offset in px for the day-of-week header (to clear sticky elements above) */
  stickyTopOffset?: number
}

export function ScrollableCalendar({
  months,
  today,
  todayMonthIndex,
  selectedDate,
  onSelectDate,
  stickyTopOffset = 0
}: ScrollableCalendarProps) {
  const todayMonthRef = useRef<HTMLDivElement>(null)
  const [showBackToToday, setShowBackToToday] = useState(false)
  const hasScrolledRef = useRef(false)

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd')

  // Scroll to today's month on mount
  useEffect(() => {
    if (todayMonthRef.current && !hasScrolledRef.current) {
      // Use requestAnimationFrame to ensure the DOM has been laid out
      requestAnimationFrame(() => {
        todayMonthRef.current?.scrollIntoView({ block: 'start' })
        hasScrolledRef.current = true
      })
    }
  }, [months.length])

  // IntersectionObserver to track whether today's month is visible
  useEffect(() => {
    const el = todayMonthRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowBackToToday(!entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const scrollToToday = useCallback(() => {
    todayMonthRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className="relative">
      {/* Sticky day-of-week header */}
      <div
        className="sticky z-[5] bg-[var(--color-background)] pb-1 pt-1"
        style={{ top: stickyTopOffset }}
      >
        <div className="grid grid-cols-7">
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
      </div>

      {/* Continuous months */}
      <div className="flex flex-col gap-[var(--space-6)]">
        {months.map((monthData, index) => (
          <div
            key={monthData.monthKey}
            ref={index === todayMonthIndex ? todayMonthRef : undefined}
            style={index === todayMonthIndex ? { scrollMarginTop: stickyTopOffset + 28 } : undefined}
          >
            {/* Month header */}
            <div className="flex items-baseline gap-[var(--space-2)] px-1 mb-[var(--space-2)]">
              <h3
                className="text-[clamp(1.25rem,5vw,1.5rem)] font-extrabold text-[var(--color-text)]"
                style={{ fontFamily: 'var(--font-heading)', lineHeight: 'var(--leading-tight)' }}
              >
                {format(monthData.month, 'MMMM')}
              </h3>
              <span className="text-[var(--text-sm)] text-[var(--color-text-muted)] font-medium font-mono-stats">
                {format(monthData.month, 'yyyy')}
              </span>
            </div>

            {/* Calendar grid for this month */}
            <div className="grid grid-cols-7 gap-1">
              {monthData.days.map((day) => (
                <CalendarDayCell
                  key={day.dateKey}
                  day={day}
                  isSelected={day.dateKey === selectedDateKey}
                  onSelect={onSelectDate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Back to Today floating button */}
      <AnimatePresence>
        {showBackToToday && (
          <motion.button
            onClick={scrollToToday}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-text)] shadow-lg active:scale-95 transition-transform"
            style={{ boxShadow: 'var(--shadow-primary)' }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={springPresets.snappy}
          >
            <ArrowUp className="w-4 h-4" weight="bold" />
            <span className="text-[var(--text-sm)] font-semibold">Today</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
