import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { startOfMonth, isSameDay } from 'date-fns'
import { AppShell } from '@/components/layout'
import { BottomSheet } from '@/components/ui'
import { CalendarGrid, SelectedDayPanel } from '@/components/calendar'
import { StatsGrid } from '@/components/stats'
import { FadeIn } from '@/components/motion'
import { ProgressRing } from '@/components/motion'
import { useCalendarData } from '@/hooks/useCalendarData'
import { springPresets } from '@/config/animationConfig'
import { Calendar } from 'lucide-react'
import type { CalendarDay } from '@/hooks/useCalendarData'

export function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'stats'>('calendar')
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const { calendarDays, allSessions, isLoading, today } = useCalendarData(currentMonth)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

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
      <div className="sticky top-0 z-10 px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-2)] bg-[var(--color-background)]">
        <div
          className="relative flex p-1 rounded-full border border-[var(--glass-border)]"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
          }}
        >
          {/* Animated pill indicator */}
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--color-primary)] rounded-full"
            initial={false}
            animate={{ x: activeTab === 'calendar' ? 0 : 'calc(100% + 4px)' }}
            transition={springPresets.smooth}
          />
          <button
            onClick={() => setActiveTab('calendar')}
            className={`relative z-10 flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === 'calendar' ? 'text-[var(--color-primary-text)]' : 'text-[var(--color-text-muted)]'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`relative z-10 flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === 'stats' ? 'text-[var(--color-primary-text)]' : 'text-[var(--color-text-muted)]'
            }`}
          >
            Stats
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="p-[var(--space-4)] space-y-[var(--space-3)]">
          <div className="h-8 w-40 mx-auto skeleton rounded-[var(--radius-md)]" />
          <div className="h-[340px] skeleton rounded-[var(--radius-md)]" />
          <div className="h-20 skeleton rounded-[var(--radius-md)]" />
        </div>
      ) : calendarDays.length > 0 ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={springPresets.smooth}
          >
            {activeTab === 'calendar' ? (
              <div className="px-[var(--space-4)] pt-[var(--space-2)] flex flex-col" style={{ minHeight: 'calc(100dvh - 10.5rem)' }}>
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
        <FadeIn direction="up">
          <div className="flex flex-col items-center justify-center px-[var(--space-6)] pt-[var(--space-12)] pb-[var(--space-8)]">
            {/* Animated empty ring — pulsing invitation */}
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ProgressRing
                progress={0}
                size={96}
                strokeWidth={4}
                color="var(--color-primary)"
                trackColor="var(--color-border)"
              />
            </motion.div>
            <h3
              className="text-[clamp(1.25rem,5vw,1.75rem)] font-extrabold text-[var(--color-text)] mt-[var(--space-6)] text-center"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              No workouts yet<span className="text-[var(--color-primary)]">.</span>
            </h3>
            <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] mt-[var(--space-2)] text-center max-w-[240px]">
              Complete your first workout and it'll show up here
            </p>
          </div>
        </FadeIn>
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
