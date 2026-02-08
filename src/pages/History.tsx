import { useState, useCallback, useMemo } from 'react'
import { motion } from 'motion/react'
import { startOfMonth, isSameDay } from 'date-fns'
import { AppShell } from '@/components/layout'
import { Card, CardContent, BottomSheet } from '@/components/ui'
import { CalendarGrid, SelectedDayPanel } from '@/components/calendar'
import { StatsGrid } from '@/components/stats'
import { useCalendarData } from '@/hooks/useCalendarData'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { staggerContainer, staggerChild } from '@/config/animationConfig'
import { Calendar } from 'lucide-react'
import type { CalendarDay } from '@/hooks/useCalendarData'

export function HistoryPage() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const { calendarDays, allSessions, isLoading, today } = useCalendarData(currentMonth)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const prefersReduced = useReducedMotion()

  const handleSelectDate = useCallback((day: CalendarDay) => {
    setSelectedDate(day.date)
    setIsBottomSheetOpen(true)
  }, [])

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(startOfMonth(month))
  }, [])

  // Find the selected CalendarDay object
  const selectedDay = useMemo(() => {
    return calendarDays.find(d => isSameDay(d.date, selectedDate))
  }, [calendarDays, selectedDate])

  return (
    <AppShell title="Review">
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-8 w-40 mx-auto skeleton rounded-lg" />
            <div className="h-[340px] skeleton rounded-lg" />
            <div className="h-20 skeleton rounded-lg" />
          </div>
        ) : calendarDays.length > 0 ? (
          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial={prefersReduced ? false : 'hidden'}
            animate="visible"
          >
            <motion.div variants={staggerChild}>
              <Card>
                <CardContent className="py-3">
                  <CalendarGrid
                    calendarDays={calendarDays}
                    currentMonth={currentMonth}
                    selectedDate={selectedDate}
                    today={today}
                    onSelectDate={handleSelectDate}
                    onMonthChange={handleMonthChange}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats Dashboard */}
            <motion.div variants={staggerChild}>
              <StatsGrid calendarDays={calendarDays} allSessions={allSessions} />
            </motion.div>

            {/* BottomSheet for selected day detail */}
            <BottomSheet
              isOpen={isBottomSheetOpen}
              onClose={() => setIsBottomSheetOpen(false)}
            >
              {selectedDay && (
                <SelectedDayPanel day={selectedDay} />
              )}
            </BottomSheet>
          </motion.div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-[var(--color-text-muted)] opacity-50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">No workout history</h3>
              <p className="text-[var(--color-text-muted)]">Start your first workout to see it here!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
