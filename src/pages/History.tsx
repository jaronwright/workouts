import { useState, useCallback, useMemo } from 'react'
import { startOfMonth, isSameDay } from 'date-fns'
import { AppShell } from '@/components/layout'
import { Card, CardContent, BottomSheet, AnimatedCounter } from '@/components/ui'
import { CalendarGrid, SelectedDayPanel } from '@/components/calendar'
import { useCalendarData } from '@/hooks/useCalendarData'
import { Calendar, Flame, Target, TrendingUp } from 'lucide-react'
import type { CalendarDay } from '@/hooks/useCalendarData'

export function HistoryPage() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const { calendarDays, isLoading, today } = useCalendarData(currentMonth)
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

  // Monthly summary stats
  const monthlySummary = useMemo(() => {
    const currentMonthDays = calendarDays.filter(d => d.isCurrentMonth)
    const completedDays = currentMonthDays.filter(d => d.hasCompletedSession)
    const scheduledDays = currentMonthDays.filter(d => d.projected && d.projected.name !== 'Not set' && !d.projected.isRest)

    // Count workout types
    const typeCounts = new Map<string, number>()
    completedDays.forEach(d => {
      d.sessions.forEach(s => {
        const name = s.name || 'Unknown'
        typeCounts.set(name, (typeCounts.get(name) || 0) + 1)
      })
    })

    let mostTrained = ''
    let maxCount = 0
    typeCounts.forEach((count, name) => {
      if (count > maxCount) {
        maxCount = count
        mostTrained = name
      }
    })

    // Compute streak within this month
    let streak = 0
    let currentStreak = 0
    const sortedCompleted = [...currentMonthDays]
      .filter(d => !d.isFuture)
      .reverse()
    for (const d of sortedCompleted) {
      if (d.hasCompletedSession) {
        currentStreak++
        streak = Math.max(streak, currentStreak)
      } else if (d.projected && !d.projected.isRest && d.projected.name !== 'Not set') {
        currentStreak = 0
      }
    }

    return {
      completed: completedDays.length,
      scheduled: scheduledDays.length,
      streak,
      mostTrained: mostTrained || 'None'
    }
  }, [calendarDays])

  return (
    <AppShell title="History">
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-8 w-40 mx-auto skeleton rounded-lg" />
            <div className="h-[340px] skeleton rounded-lg" />
            <div className="h-20 skeleton rounded-lg" />
          </div>
        ) : calendarDays.length > 0 ? (
          <>
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

            {/* Monthly Summary Strip */}
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center p-2 rounded-xl bg-[var(--color-surface)]">
                <Target className="w-4 h-4 text-indigo-500 mb-0.5" />
                <AnimatedCounter
                  value={monthlySummary.completed}
                  className="text-lg font-bold text-[var(--color-text)]"
                />
                <span className="text-[9px] text-[var(--color-text-muted)] font-medium">
                  /{monthlySummary.scheduled}
                </span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-[var(--color-surface)]">
                <Flame className="w-4 h-4 text-orange-500 mb-0.5" />
                <AnimatedCounter
                  value={monthlySummary.streak}
                  className="text-lg font-bold text-[var(--color-text)]"
                />
                <span className="text-[9px] text-[var(--color-text-muted)] font-medium">Streak</span>
              </div>
              <div className="col-span-2 flex flex-col items-center justify-center p-2 rounded-xl bg-[var(--color-surface)]">
                <TrendingUp className="w-4 h-4 text-emerald-500 mb-0.5" />
                <span className="text-sm font-bold text-[var(--color-text)] truncate max-w-full px-1">
                  {monthlySummary.mostTrained}
                </span>
                <span className="text-[9px] text-[var(--color-text-muted)] font-medium">Most Trained</span>
              </div>
            </div>

            {/* BottomSheet for selected day detail */}
            <BottomSheet
              isOpen={isBottomSheetOpen}
              onClose={() => setIsBottomSheetOpen(false)}
            >
              {selectedDay && (
                <SelectedDayPanel day={selectedDay} />
              )}
            </BottomSheet>
          </>
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
