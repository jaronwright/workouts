import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { startOfMonth, isSameDay } from 'date-fns'
import { AppShell } from '@/components/layout'
import { Card, CardContent, BottomSheet } from '@/components/ui'
import { CalendarGrid, SelectedDayPanel } from '@/components/calendar'
import { StatsGrid } from '@/components/stats'
import { useCalendarData } from '@/hooks/useCalendarData'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Calendar } from 'lucide-react'
import type { CalendarDay } from '@/hooks/useCalendarData'

export function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'stats'>('calendar')
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
      {/* Tab Switcher - Floating segmented control */}
      <div className="sticky top-0 z-10 px-4 pt-3 pb-2 bg-[var(--color-background)]">
        <div className="relative flex p-1 bg-[var(--color-surface)]/60 backdrop-blur-xl rounded-full border border-white/5">
          {/* Animated pill indicator */}
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--color-primary)] rounded-full"
            initial={false}
            animate={{ x: activeTab === 'calendar' ? 0 : 'calc(100% + 4px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          <button
            onClick={() => setActiveTab('calendar')}
            className={`relative z-10 flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === 'calendar' ? 'text-white' : 'text-[var(--color-text-muted)]'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`relative z-10 flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === 'stats' ? 'text-white' : 'text-[var(--color-text-muted)]'
            }`}
          >
            Stats
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="p-4 space-y-3">
          <div className="h-8 w-40 mx-auto skeleton rounded-lg" />
          <div className="h-[340px] skeleton rounded-lg" />
          <div className="h-20 skeleton rounded-lg" />
        </div>
      ) : calendarDays.length > 0 ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={prefersReduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {activeTab === 'calendar' ? (
              <div className="px-4 pt-2 flex flex-col" style={{ minHeight: 'calc(100dvh - 10.5rem)' }}>
                <CalendarGrid
                  calendarDays={calendarDays}
                  currentMonth={currentMonth}
                  selectedDate={selectedDate}
                  today={today}
                  onSelectDate={handleSelectDate}
                  onMonthChange={handleMonthChange}
                />
              </div>
            ) : (
              <StatsGrid calendarDays={calendarDays} allSessions={allSessions} />
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="p-4">
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-[var(--color-text-muted)] opacity-50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">No workout history</h3>
              <p className="text-[var(--color-text-muted)]">Start your first workout to see it here!</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* BottomSheet stays outside tab content */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      >
        {selectedDay && (
          <SelectedDayPanel day={selectedDay} />
        )}
      </BottomSheet>
    </AppShell>
  )
}
