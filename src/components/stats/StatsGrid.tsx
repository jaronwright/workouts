import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useTransform, animate as motionAnimate } from 'motion/react'
import { startOfWeek, endOfWeek, isWithinInterval, differenceInMinutes, parseISO, subDays, format } from 'date-fns'
import { AnimatedCounter } from '@/components/ui'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { staggerContainer, staggerChild } from '@/config/animationConfig'
import { CATEGORY_DEFAULTS } from '@/config/workoutConfig'
import {
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
  Calendar,
  Dumbbell,
  Zap,
  Activity,
} from 'lucide-react'
import type { CalendarDay } from '@/hooks/useCalendarData'
import type { UnifiedSession } from '@/utils/calendarGrid'

interface StatsGridProps {
  calendarDays: CalendarDay[]
  allSessions: UnifiedSession[]
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
      className={`relative overflow-hidden rounded-xl bg-[var(--color-surface)] p-4 ${className ?? ''}`}
      onClick={() => flipped && setFlipped(false)}
    >
      {/* Always rendered so widget keeps its natural height */}
      <div className={flipped ? 'invisible' : undefined}>
        {children}
      </div>
      {/* Info overlay sits on top without affecting layout */}
      {flipped && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-3 cursor-pointer bg-[var(--color-surface)]">
          <p className="text-[11px] text-[var(--color-text-muted)] text-center leading-snug">{info}</p>
        </div>
      )}
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

/* ── Animated Conic Ring ─────────────────────────── */
function ConicRing({
  value,
  max,
  size,
  thickness,
  color,
  bgColor,
  children,
  prefersReduced,
}: {
  value: number
  max: number
  size: number
  thickness: number
  color: string
  bgColor: string
  children?: ReactNode
  prefersReduced: boolean
}) {
  const angle = useMotionValue(0)
  const gradient = useTransform(
    angle,
    (v) => `conic-gradient(${color} ${v}deg, ${bgColor} ${v}deg)`
  )

  useEffect(() => {
    const target = max > 0 ? (value / max) * 360 : 0
    if (!prefersReduced) {
      motionAnimate(angle, target, {
        type: 'spring',
        stiffness: 100,
        damping: 20,
      })
    } else {
      angle.set(target)
    }
  }, [value, max, prefersReduced, angle])

  const innerSize = size - thickness * 2
  return (
    <motion.div
      className="rounded-full flex items-center justify-center mx-auto"
      style={{
        width: size,
        height: size,
        background: gradient,
      }}
    >
      <div
        className="rounded-full bg-[var(--color-surface)] flex items-center justify-center"
        style={{ width: innerSize, height: innerSize }}
      >
        {children}
      </div>
    </motion.div>
  )
}

export function StatsGrid({ calendarDays, allSessions }: StatsGridProps) {
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

    // Weekly frequency from ALL historical sessions (not just current month)
    const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]
    const completedAll = allSessions.filter(s => s.completed_at)
    completedAll.forEach(s => {
      dayOfWeekCounts[parseISO(s.started_at).getDay()]++
    })
    // Compute how many weeks of data we have
    let weeksOfData = 1
    if (completedAll.length > 0) {
      const dates = completedAll.map(s => parseISO(s.started_at).getTime())
      const earliest = Math.min(...dates)
      const latest = Math.max(...dates)
      weeksOfData = Math.max(1, Math.round((latest - earliest) / (7 * 24 * 60 * 60 * 1000)))
    }
    // Average sessions per day-of-week per week
    const dayOfWeekAvg = dayOfWeekCounts.map(c => c / weeksOfData)
    const maxDayAvg = Math.max(...dayOfWeekAvg, 0.01)

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

    // Momentum score: simplified formula
    const momentumScore = Math.min(100, Math.round(
      completionRate * 0.5 + Math.min(currentStreak * 8, 30) + Math.min(perWeek / 5 * 20, 20)
    ))

    // Last 30 days heat map
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i)
      const dateKey = format(date, 'yyyy-MM-dd')
      const dayData = calendarDays.find(d => d.dateKey === dateKey)
      const sessionCount = dayData?.sessions.filter(s => s.completed_at).length || 0
      return { date, sessionCount, isToday: dayData?.isToday ?? false }
    })

    return {
      completionRate,
      weekCompleted,
      weekScheduled,
      currentStreak,
      bestStreak,
      isAtBest: currentStreak >= bestStreak && currentStreak > 0,
      dayOfWeekAvg,
      maxDayAvg,
      totalHours,
      remainingMinutes,
      mixPcts,
      typeCounts,
      totalSessions,
      activeDays,
      perWeek,
      longestHours,
      longestMins,
      momentumScore,
      last30Days,
    }
  }, [calendarDays, allSessions])

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const momentumColor = stats.momentumScore <= 33 ? '#EF4444' : stats.momentumScore <= 66 ? '#F59E0B' : '#10B981'
  const momentumBg = stats.momentumScore <= 33 ? 'rgba(239,68,68,0.15)' : stats.momentumScore <= 66 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'

  return (
    <motion.div
      className="px-4 pt-2 pb-6 space-y-3"
      variants={staggerContainer}
      initial={prefersReduced ? false : 'hidden'}
      animate="visible"
    >
      {/* ── Row 1: Hero Stats (2-column) ─────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Momentum Score */}
        <StatWidget info="Fitness momentum based on completion, streak, and frequency" className="flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
          <div className="relative flex flex-col items-center">
            <ConicRing
              value={stats.momentumScore}
              max={100}
              size={64}
              thickness={6}
              color={momentumColor}
              bgColor={momentumBg}
              prefersReduced={prefersReduced}
            >
              <AnimatedCounter
                value={stats.momentumScore}
                className="text-2xl font-black text-[var(--color-text)]"
              />
            </ConicRing>
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-semibold mt-2">
              Momentum
            </span>
          </div>
        </StatWidget>

        {/* Current Streak */}
        <StatWidget info="Current and best consecutive workout streak" className="flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
          <div className="relative flex flex-col items-center">
            {stats.isAtBest ? (
              <Crown className="w-6 h-6 text-orange-500 mb-1" />
            ) : (
              <Flame className="w-6 h-6 text-orange-500 mb-1" />
            )}
            <AnimatedCounter
              value={stats.currentStreak}
              className="text-3xl font-black text-[var(--color-text)]"
            />
            <span className="text-[11px] text-[var(--color-text-muted)] font-medium mt-0.5">
              Best: {stats.bestStreak}
            </span>
          </div>
        </StatWidget>
      </div>

      {/* ── Row 2: 30-Day Heat Map (full-width) ──────── */}
      <StatWidget info="Activity over the last 30 days. Darker = more sessions." className="w-full">
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-3">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Last 30 Days</span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {stats.last30Days.map((day, index) => {
              let bg: string
              if (day.sessionCount === 0) bg = 'var(--color-surface)'
              else if (day.sessionCount === 1) bg = 'rgba(16,185,129,0.4)'
              else if (day.sessionCount === 2) bg = 'rgba(16,185,129,0.7)'
              else bg = 'rgb(16,185,129)'

              return (
                <motion.div
                  key={index}
                  className={`rounded-sm w-full aspect-square ${
                    day.isToday ? 'ring-2 ring-[var(--color-primary)]' : ''
                  }`}
                  style={{ backgroundColor: bg }}
                  initial={prefersReduced ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    delay: index * 0.02,
                  }}
                />
              )
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center justify-end gap-1.5 mt-2">
            <span className="text-[8px] text-[var(--color-text-muted)] font-medium">Less</span>
            <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: 'var(--color-surface)' }} />
            <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: 'rgba(16,185,129,0.4)' }} />
            <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: 'rgba(16,185,129,0.7)' }} />
            <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: 'rgb(16,185,129)' }} />
            <span className="text-[8px] text-[var(--color-text-muted)] font-medium">More</span>
          </div>
        </div>
      </StatWidget>

      {/* ── Row 3: Weekly Frequency (full-width) ─────── */}
      <StatWidget info="Average workouts per day of week, all history" className="w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Weekly Frequency</span>
          </div>
          <div className="flex items-end gap-1.5" style={{ height: 56 }}>
            {stats.dayOfWeekAvg.map((avg, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <motion.div
                  className="w-full rounded-t-md bg-violet-500"
                  style={{ opacity: avg > 0 ? 1 : 0.2 }}
                  initial={prefersReduced ? false : { height: 0 }}
                  animate={{ height: avg > 0 ? Math.max((avg / stats.maxDayAvg) * 48, 4) : 3 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.05 }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 mt-1">
            {dayLabels.map((label, i) => (
              <span key={i} className="flex-1 text-center text-[9px] text-[var(--color-text-muted)] font-medium">
                {label}
              </span>
            ))}
          </div>
        </div>
      </StatWidget>

      {/* ── Row 4: Medium Stats (2-column) ───────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Time */}
        <StatWidget info="Total time trained this month" className="flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent" />
          <div className="relative flex flex-col items-center">
            <Clock className="w-5 h-5 text-sky-500 mb-1" />
            <div className="flex items-baseline gap-0.5">
              <AnimatedCounter
                value={stats.totalHours}
                className="text-2xl font-bold text-[var(--color-text)]"
              />
              <span className="text-xs text-[var(--color-text-muted)] font-medium">h</span>
              <AnimatedCounter
                value={stats.remainingMinutes}
                className="text-lg font-bold text-[var(--color-text)]"
              />
              <span className="text-xs text-[var(--color-text-muted)] font-medium">m</span>
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Total Time</span>
          </div>
        </StatWidget>

        {/* Sessions + Per Week */}
        <StatWidget info="Completed sessions and weekly average this month" className="flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
          <div className="relative flex flex-col items-center">
            <Hash className="w-5 h-5 text-amber-500 mb-1" />
            <AnimatedCounter
              value={stats.totalSessions}
              className="text-2xl font-bold text-[var(--color-text)]"
            />
            <span className="text-[11px] text-[var(--color-text-muted)] font-medium">
              {stats.perWeek}/wk avg
            </span>
          </div>
        </StatWidget>
      </div>

      {/* ── Row 5: Workout Mix (full-width) ──────────── */}
      <StatWidget info="Weights / cardio / mobility split this month" className="w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-2">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Workout Mix</span>
          </div>
          {/* Stacked horizontal bar */}
          <div className="h-4 rounded-full overflow-hidden flex bg-[var(--color-text-muted)]/10 mb-2">
            {stats.mixPcts.weights > 0 && (
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: CATEGORY_DEFAULTS.weights.color }}
                initial={prefersReduced ? { width: `${stats.mixPcts.weights}%` } : { width: 0 }}
                animate={{ width: `${stats.mixPcts.weights}%` }}
                transition={{ type: 'spring', stiffness: 150, damping: 20 }}
              />
            )}
            {stats.mixPcts.cardio > 0 && (
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: CATEGORY_DEFAULTS.cardio.color }}
                initial={prefersReduced ? { width: `${stats.mixPcts.cardio}%` } : { width: 0 }}
                animate={{ width: `${stats.mixPcts.cardio}%` }}
                transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.1 }}
              />
            )}
            {stats.mixPcts.mobility > 0 && (
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: CATEGORY_DEFAULTS.mobility.color }}
                initial={prefersReduced ? { width: `${stats.mixPcts.mobility}%` } : { width: 0 }}
                animate={{ width: `${stats.mixPcts.mobility}%` }}
                transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.2 }}
              />
            )}
          </div>
          {/* Legend with icons */}
          <div className="flex gap-4">
            {[
              { label: 'Weights', color: CATEGORY_DEFAULTS.weights.color, pct: stats.mixPcts.weights, Icon: Dumbbell },
              { label: 'Cardio', color: CATEGORY_DEFAULTS.cardio.color, pct: stats.mixPcts.cardio, Icon: Zap },
              { label: 'Mobility', color: CATEGORY_DEFAULTS.mobility.color, pct: stats.mixPcts.mobility, Icon: Activity },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1">
                <item.Icon className="w-3 h-3" style={{ color: item.color }} />
                <span className="text-[9px] text-[var(--color-text-muted)] font-medium">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </StatWidget>

      {/* ── Row 6: Weekly Target + Completion (2-column) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Weekly Target */}
        <StatWidget info="Workouts done vs planned this week" className="flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
          <div className="relative flex flex-col items-center">
            <Target className="w-5 h-5 text-indigo-500 mb-1.5" />
            <div className="flex gap-1 mb-1.5">
              {Array.from({ length: Math.max(stats.weekScheduled, 1) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${
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

        {/* Completion Rate */}
        <StatWidget info="% of scheduled workouts completed this month" className="flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
          <div className="relative flex flex-col items-center">
            <ConicRing
              value={stats.completionRate}
              max={100}
              size={56}
              thickness={5}
              color="#10B981"
              bgColor="rgba(16,185,129,0.15)"
              prefersReduced={prefersReduced}
            >
              <AnimatedCounter
                value={stats.completionRate}
                className="text-lg font-bold text-[var(--color-text)]"
              />
            </ConicRing>
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-medium mt-1.5">
              Completion
            </span>
          </div>
        </StatWidget>
      </div>

      {/* ── Row 7: Bottom Stats (3-column, smaller) ──── */}
      <div className="grid grid-cols-3 gap-2">
        {/* Active Days */}
        <StatWidget info="Days with at least one workout" className="flex flex-col items-center justify-center">
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

        {/* Longest Session */}
        <StatWidget info="Longest single session this month" className="flex flex-col items-center justify-center">
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

        {/* Best Streak */}
        <StatWidget info="Best workout streak this month" className="flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
          <div className="relative flex flex-col items-center">
            <Crown className="w-4 h-4 text-orange-500 mb-1" />
            <AnimatedCounter
              value={stats.bestStreak}
              className="text-xl font-bold text-[var(--color-text)]"
            />
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Best Streak</span>
          </div>
        </StatWidget>
      </div>
    </motion.div>
  )
}
