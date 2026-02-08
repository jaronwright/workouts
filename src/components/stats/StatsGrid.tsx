import { useMemo, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { startOfWeek, endOfWeek, isWithinInterval, getDay, differenceInMinutes, parseISO } from 'date-fns'
import { AnimatedCounter } from '@/components/ui'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { staggerContainer, staggerChild } from '@/config/animationConfig'
import { CATEGORY_DEFAULTS } from '@/config/workoutConfig'
import {
  Percent,
  Target,
  Flame,
  BarChart3,
  Clock,
  Layers,
  CalendarDays,
  Hash,
  Timer,
  Crown,
  Info,
} from 'lucide-react'
import type { CalendarDay } from '@/hooks/useCalendarData'

interface StatsGridProps {
  calendarDays: CalendarDay[]
}

function computeSessionDuration(session: { started_at: string; completed_at: string | null; duration_minutes?: number | null }): number {
  if (session.duration_minutes) return session.duration_minutes
  if (session.completed_at) {
    return Math.max(0, differenceInMinutes(parseISO(session.completed_at), parseISO(session.started_at)))
  }
  return 0
}

function StatWidget({ info, className, children }: { info: string; className?: string; children: ReactNode }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <motion.div
      variants={staggerChild}
      className={`relative overflow-hidden rounded-xl bg-[var(--color-surface)] p-3 ${className ?? ''}`}
      onClick={() => flipped && setFlipped(false)}
    >
      <AnimatePresence mode="wait" initial={false}>
        {flipped ? (
          <motion.div
            key="info"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 cursor-pointer bg-[var(--color-surface)]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <Info className="w-4 h-4 text-[var(--color-text-muted)] mb-2 shrink-0" />
            <p className="text-xs text-[var(--color-text-muted)] text-center leading-relaxed">{info}</p>
            <span className="text-[9px] text-[var(--color-text-muted)] opacity-50 mt-2">tap to dismiss</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className="contents"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      {!flipped && (
        <button
          onClick={(e) => { e.stopPropagation(); setFlipped(true) }}
          className="absolute top-2 right-2 z-10 p-0.5 rounded-full text-[var(--color-text-muted)] opacity-30 hover:opacity-60 transition-opacity"
        >
          <Info className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  )
}

export function StatsGrid({ calendarDays }: StatsGridProps) {
  const prefersReduced = useReducedMotion()

  const stats = useMemo(() => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 })

    const currentMonthDays = calendarDays.filter(d => d.isCurrentMonth)
    const pastDays = currentMonthDays.filter(d => !d.isFuture)
    const completedDays = currentMonthDays.filter(d => d.hasCompletedSession)

    // Scheduled days (non-rest, actually assigned)
    const scheduledDays = currentMonthDays.filter(
      d => d.projected && d.projected.name !== 'Not set' && !d.projected.isRest
    )

    // Completion rate
    const completionRate = scheduledDays.length > 0
      ? Math.round((completedDays.length / scheduledDays.length) * 100)
      : 0

    // Weekly target
    const weekDays = currentMonthDays.filter(d =>
      isWithinInterval(d.date, { start: weekStart, end: weekEnd })
    )
    const weekCompleted = weekDays.filter(d => d.hasCompletedSession).length
    const weekScheduled = weekDays.filter(
      d => d.projected && d.projected.name !== 'Not set' && !d.projected.isRest
    ).length

    // Streak (current consecutive days with completed sessions, walking backward from today)
    let currentStreak = 0
    const sortedPast = [...pastDays].sort((a, b) => b.date.getTime() - a.date.getTime())
    for (const d of sortedPast) {
      if (d.hasCompletedSession) {
        currentStreak++
      } else if (d.projected && !d.projected.isRest && d.projected.name !== 'Not set') {
        break
      }
    }

    // Best streak this month
    let bestStreak = 0
    let tempStreak = 0
    for (const d of pastDays) {
      if (d.hasCompletedSession) {
        tempStreak++
        bestStreak = Math.max(bestStreak, tempStreak)
      } else if (d.projected && !d.projected.isRest && d.projected.name !== 'Not set') {
        tempStreak = 0
      }
    }

    // Weekly frequency (sessions per day-of-week, 0=Sun..6=Sat)
    const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]
    completedDays.forEach(d => {
      dayOfWeekCounts[getDay(d.date)]++
    })
    const maxDayCount = Math.max(...dayOfWeekCounts, 1)

    // Total time this month
    let totalMinutes = 0
    let longestSessionMin = 0
    let totalSessions = 0
    const typeCounts = { weights: 0, cardio: 0, mobility: 0 }

    currentMonthDays.forEach(d => {
      d.sessions.forEach(s => {
        if (!s.completed_at) return
        totalSessions++
        const dur = computeSessionDuration(s)
        totalMinutes += dur
        longestSessionMin = Math.max(longestSessionMin, dur)
        if (s.type in typeCounts) {
          typeCounts[s.type as keyof typeof typeCounts]++
        }
      })
    })

    const totalHours = Math.floor(totalMinutes / 60)
    const remainingMinutes = totalMinutes % 60

    // Workout mix percentages
    const totalTyped = typeCounts.weights + typeCounts.cardio + typeCounts.mobility
    const mixPcts = totalTyped > 0
      ? {
          weights: Math.round((typeCounts.weights / totalTyped) * 100),
          cardio: Math.round((typeCounts.cardio / totalTyped) * 100),
          mobility: Math.round((typeCounts.mobility / totalTyped) * 100),
        }
      : { weights: 0, cardio: 0, mobility: 0 }

    // Active days (unique days with a workout)
    const activeDays = completedDays.length

    // Per week average
    const weeksElapsed = Math.max(1, Math.ceil(pastDays.length / 7))
    const perWeek = pastDays.length > 0 ? +(totalSessions / weeksElapsed).toFixed(1) : 0

    // Longest session
    const longestHours = Math.floor(longestSessionMin / 60)
    const longestMins = longestSessionMin % 60

    return {
      completionRate,
      weekCompleted,
      weekScheduled,
      currentStreak,
      bestStreak,
      isAtBest: currentStreak >= bestStreak && currentStreak > 0,
      dayOfWeekCounts,
      maxDayCount,
      totalHours,
      remainingMinutes,
      mixPcts,
      typeCounts,
      totalSessions,
      activeDays,
      perWeek,
      longestHours,
      longestMins,
    }
  }, [calendarDays])

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <motion.div
      className="grid grid-cols-3 gap-2"
      variants={staggerContainer}
      initial={prefersReduced ? false : 'hidden'}
      animate="visible"
    >
      {/* Row 1: Completion Rate | Weekly Target | Best Streak */}
      <StatWidget info="Percentage of scheduled workouts completed this month" className="flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
        <div className="relative">
          {/* Conic gradient progress ring */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-1.5 mx-auto"
            style={{
              background: `conic-gradient(#10B981 ${stats.completionRate * 3.6}deg, rgba(16,185,129,0.15) ${stats.completionRate * 3.6}deg)`,
            }}
          >
            <div className="w-9 h-9 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
              <Percent className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>
          <AnimatedCounter
            value={stats.completionRate}
            className="text-xl font-bold text-[var(--color-text)] block text-center"
          />
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Completion</span>
        </div>
      </StatWidget>

      <StatWidget info="Workouts completed vs scheduled this week" className="flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
        <div className="relative flex flex-col items-center">
          <Target className="w-4 h-4 text-indigo-500 mb-1" />
          <div className="flex gap-1 mb-1.5">
            {Array.from({ length: Math.max(stats.weekScheduled, 1) }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < stats.weekCompleted ? 'bg-indigo-500' : 'bg-indigo-500/20'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-[var(--color-text)]">
            {stats.weekCompleted}/{stats.weekScheduled}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">This Week</span>
        </div>
      </StatWidget>

      <StatWidget info="Consecutive workout days (current / best this month)" className="flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
        <div className="relative flex flex-col items-center">
          {stats.isAtBest ? (
            <Crown className="w-4 h-4 text-orange-500 mb-1" />
          ) : (
            <Flame className="w-4 h-4 text-orange-500 mb-1" />
          )}
          <AnimatedCounter
            value={stats.currentStreak}
            className="text-xl font-bold text-[var(--color-text)]"
          />
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">
            Best: {stats.bestStreak}
          </span>
        </div>
      </StatWidget>

      {/* Row 2: Weekly Frequency (2×1) | Total Time (1×1) */}
      <StatWidget info="How often you train each day of the week" className="col-span-2">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Weekly Frequency</span>
          </div>
          <div className="flex items-end gap-1" style={{ height: 40 }}>
            {stats.dayOfWeekCounts.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <motion.div
                  className="w-full rounded-sm bg-violet-500"
                  style={{ opacity: count > 0 ? 1 : 0.2 }}
                  initial={prefersReduced ? false : { height: 0 }}
                  animate={{ height: count > 0 ? Math.max((count / stats.maxDayCount) * 32, 4) : 2 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.05 }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            {dayLabels.map((label, i) => (
              <span key={i} className="flex-1 text-center text-[8px] text-[var(--color-text-muted)] font-medium">
                {label}
              </span>
            ))}
          </div>
        </div>
      </StatWidget>

      <StatWidget info="Total training time this month" className="flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent" />
        <div className="relative flex flex-col items-center">
          <Clock className="w-4 h-4 text-sky-500 mb-1" />
          <div className="flex items-baseline gap-0.5">
            <AnimatedCounter
              value={stats.totalHours}
              className="text-xl font-bold text-[var(--color-text)]"
            />
            <span className="text-[10px] text-[var(--color-text-muted)] font-medium">h</span>
            <AnimatedCounter
              value={stats.remainingMinutes}
              className="text-sm font-bold text-[var(--color-text)]"
            />
            <span className="text-[10px] text-[var(--color-text-muted)] font-medium">m</span>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Total Time</span>
        </div>
      </StatWidget>

      {/* Row 3: Workout Mix (2×1) | Sessions (1×1) */}
      <StatWidget info="Balance of weights, cardio, and mobility sessions" className="col-span-2">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-2">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Workout Mix</span>
          </div>
          {/* Stacked horizontal bar */}
          <div className="h-3 rounded-full overflow-hidden flex bg-[var(--color-text-muted)]/10 mb-2">
            {stats.mixPcts.weights > 0 && (
              <motion.div
                className="h-full"
                style={{ backgroundColor: CATEGORY_DEFAULTS.weights.color }}
                initial={prefersReduced ? { width: `${stats.mixPcts.weights}%` } : { width: 0 }}
                animate={{ width: `${stats.mixPcts.weights}%` }}
                transition={{ type: 'spring', stiffness: 150, damping: 20 }}
              />
            )}
            {stats.mixPcts.cardio > 0 && (
              <motion.div
                className="h-full"
                style={{ backgroundColor: CATEGORY_DEFAULTS.cardio.color }}
                initial={prefersReduced ? { width: `${stats.mixPcts.cardio}%` } : { width: 0 }}
                animate={{ width: `${stats.mixPcts.cardio}%` }}
                transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.1 }}
              />
            )}
            {stats.mixPcts.mobility > 0 && (
              <motion.div
                className="h-full"
                style={{ backgroundColor: CATEGORY_DEFAULTS.mobility.color }}
                initial={prefersReduced ? { width: `${stats.mixPcts.mobility}%` } : { width: 0 }}
                animate={{ width: `${stats.mixPcts.mobility}%` }}
                transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.2 }}
              />
            )}
          </div>
          {/* Legend */}
          <div className="flex gap-3">
            {[
              { label: 'Weights', color: CATEGORY_DEFAULTS.weights.color, pct: stats.mixPcts.weights },
              { label: 'Cardio', color: CATEGORY_DEFAULTS.cardio.color, pct: stats.mixPcts.cardio },
              { label: 'Mobility', color: CATEGORY_DEFAULTS.mobility.color, pct: stats.mixPcts.mobility },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[9px] text-[var(--color-text-muted)] font-medium">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </StatWidget>

      <StatWidget info="Total completed sessions this month" className="flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
        <div className="relative flex flex-col items-center">
          <Hash className="w-4 h-4 text-amber-500 mb-1" />
          <AnimatedCounter
            value={stats.totalSessions}
            className="text-xl font-bold text-[var(--color-text)]"
          />
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Sessions</span>
        </div>
      </StatWidget>

      {/* Row 4: Active Days | Per Week | Longest */}
      <StatWidget info="Days with at least one completed workout" className="flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
        <div className="relative flex flex-col items-center">
          <CalendarDays className="w-4 h-4 text-blue-500 mb-1" />
          <AnimatedCounter
            value={stats.activeDays}
            className="text-xl font-bold text-[var(--color-text)]"
          />
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Active Days</span>
        </div>
      </StatWidget>

      <StatWidget info="Average sessions per week this month" className="flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
        <div className="relative flex flex-col items-center">
          <BarChart3 className="w-4 h-4 text-emerald-500 mb-1" />
          <span className="text-xl font-bold text-[var(--color-text)]">{stats.perWeek}</span>
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Per Week</span>
        </div>
      </StatWidget>

      <StatWidget info="Your longest single session this month" className="flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent" />
        <div className="relative flex flex-col items-center">
          <Timer className="w-4 h-4 text-rose-500 mb-1" />
          <div className="flex items-baseline gap-0.5">
            {stats.longestHours > 0 && (
              <>
                <span className="text-xl font-bold text-[var(--color-text)]">{stats.longestHours}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-medium">h</span>
              </>
            )}
            <span className="text-xl font-bold text-[var(--color-text)]">{stats.longestMins}</span>
            <span className="text-[10px] text-[var(--color-text-muted)] font-medium">m</span>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Longest</span>
        </div>
      </StatWidget>
    </motion.div>
  )
}
