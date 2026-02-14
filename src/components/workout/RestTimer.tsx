import { useEffect } from 'react'
import { X, Play, Pause, RotateCcw } from 'lucide-react'
import { useWorkoutStore } from '@/stores/workoutStore'
import { formatDuration } from '@/utils/formatters'

const PRESET_TIMES = [
  { seconds: 30, label: '0:30' },
  { seconds: 45, label: '0:45' },
  { seconds: 60, label: '1:00' },
  { seconds: 90, label: '1:30' },
  { seconds: 120, label: '2:00' },
  { seconds: 180, label: '3:00' },
  { seconds: 300, label: '5:00' }
]

export function RestTimer() {
  const {
    restTimerSeconds,
    restTimerInitialSeconds,
    isRestTimerActive,
    startRestTimer,
    stopRestTimer,
    pauseRestTimer,
    resetRestTimer,
    decrementRestTimer
  } = useWorkoutStore()

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (isRestTimerActive && restTimerSeconds > 0) {
      interval = setInterval(() => {
        decrementRestTimer()
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRestTimerActive, restTimerSeconds, decrementRestTimer])

  useEffect(() => {
    if (restTimerSeconds === 0 && isRestTimerActive) {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200])
      }
    }
  }, [restTimerSeconds, isRestTimerActive])

  if (!isRestTimerActive && restTimerSeconds === 0) {
    return (
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-4">
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
          Rest Timer
        </p>
        <div className="flex justify-between">
          {PRESET_TIMES.map(({ seconds, label }) => (
            <button
              key={seconds}
              onClick={() => startRestTimer(seconds)}
              className="
                w-10 h-10
                flex items-center justify-center
                bg-[var(--color-surface-hover)]
                rounded-full
                text-xs font-semibold tabular-nums
                text-[var(--color-text)]
                active:scale-90 active:bg-[var(--color-primary)]/20
                transition-transform duration-100
              "
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Calculate progress: 100% when full, 0% when empty
  const progress = restTimerInitialSeconds > 0
    ? (restTimerSeconds / restTimerInitialSeconds) * 100
    : 0

  return (
    <div className="bg-[var(--color-primary)] rounded-[var(--radius-xl)] p-5 text-[var(--color-primary-text)]">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-wider opacity-60">Rest Timer</p>
        <button
          onClick={stopRestTimer}
          className="p-1.5 hover:bg-black/10 rounded-full active:scale-90 transition-transform duration-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center mb-5">
        <span className="text-5xl font-bold tabular-nums tracking-tight">
          {formatDuration(restTimerSeconds)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-white/20 rounded-full overflow-hidden mb-5">
        <div
          className="absolute inset-y-0 left-0 bg-white rounded-full transition-[width] duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
        {/* Glow effect on the end */}
        <div
          className="absolute inset-y-0 w-4 bg-gradient-to-r from-white/0 to-white/50 rounded-full blur-sm transition-[left] duration-1000 ease-linear"
          style={{ left: `calc(${progress}% - 1rem)` }}
        />
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => isRestTimerActive ? pauseRestTimer() : startRestTimer(restTimerSeconds || restTimerInitialSeconds)}
          className="p-3.5 bg-white/20 hover:bg-white/30 rounded-full active:scale-90 transition-transform duration-100"
        >
          {isRestTimerActive ? (
            <Pause className="w-6 h-6" fill="currentColor" />
          ) : (
            <Play className="w-6 h-6" fill="currentColor" />
          )}
        </button>
        <button
          onClick={resetRestTimer}
          className="p-3.5 bg-white/20 hover:bg-white/30 rounded-full active:scale-90 transition-transform duration-100"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
