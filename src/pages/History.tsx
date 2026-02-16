import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { startOfMonth, isSameDay } from 'date-fns'
import { AppShell } from '@/components/layout'
import { BottomSheet, SegmentedControl } from '@/components/ui'
import { ScrollableCalendar, SelectedDayPanel } from '@/components/calendar'
import { StatsGrid } from '@/components/stats'
import { FadeIn } from '@/components/motion'
import { ProgressRing } from '@/components/motion'
import { useScrollableCalendarData } from '@/hooks/useScrollableCalendarData'
import { useCalendarData } from '@/hooks/useCalendarData'
import { springPresets } from '@/config/animationConfig'
import type { CalendarDay } from '@/utils/calendarGrid'

export function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'stats'>('calendar')
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  // Scrollable calendar data (13 months, no month navigation needed)
  const { months, allSessions, isLoading: isCalendarLoading, today, todayMonthIndex } = useScrollableCalendarData()

  // Stats tab has its own month state with prev/next navigation
  const [statsMonth, setStatsMonth] = useState(() => startOfMonth(new Date()))
  const { calendarDays: statsCalendarDays, allSessions: statsAllSessions, isLoading: isStatsLoading } = useCalendarData(statsMonth)

  const handleStatsMonthChange = useCallback((month: Date) => {
    setStatsMonth(startOfMonth(month))
  }, [])

  const handleSelectDate = useCallback((day: CalendarDay) => {
    setSelectedDate(day.date)
    setIsBottomSheetOpen(true)
  }, [])

  // Find the selected CalendarDay object across all months
  const selectedDay = useMemo(() => {
    for (const monthData of months) {
      const found = monthData.days.find(d => isSameDay(d.date, selectedDate))
      if (found && found.isCurrentMonth) return found
    }
    return undefined
  }, [months, selectedDate])

  const isLoading = activeTab === 'calendar' ? isCalendarLoading : isStatsLoading
  const hasData = activeTab === 'calendar' ? months.length > 0 : statsCalendarDays.length > 0

  return (
    <AppShell title="Review">
      {/* Tab Switcher - Floating segmented control */}
      <div className="sticky top-0 z-10 px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-2)] bg-[var(--color-background)]">
        <SegmentedControl
          tabs={[
            { key: 'calendar', label: 'Calendar' },
            { key: 'stats', label: 'Stats' },
          ]}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as 'calendar' | 'stats')}
          id="historyTabs"
        />
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="p-[var(--space-4)] space-y-[var(--space-3)]">
          <div className="h-8 w-40 mx-auto skeleton rounded-[var(--radius-md)]" />
          <div className="h-[340px] skeleton rounded-[var(--radius-md)]" />
          <div className="h-20 skeleton rounded-[var(--radius-md)]" />
        </div>
      ) : hasData ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={springPresets.smooth}
          >
            {activeTab === 'calendar' ? (
              <div className="px-[var(--space-4)] pt-[var(--space-2)] pb-[var(--space-6)]">
                <ScrollableCalendar
                  months={months}
                  today={today}
                  todayMonthIndex={todayMonthIndex}
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                  stickyTopOffset={56}
                />
              </div>
            ) : (
              <StatsGrid calendarDays={statsCalendarDays} allSessions={statsAllSessions} currentMonth={statsMonth} onMonthChange={handleStatsMonthChange} />
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
