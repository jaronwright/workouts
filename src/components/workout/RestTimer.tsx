import { useEffect } from 'react'
import { X, Play, Pause, RotateCcw } from 'lucide-react'
import { useWorkoutStore } from '@/stores/workoutStore'
import { formatDuration } from '@/utils/formatters'

const PRESET_TIMES = [
  { seconds: 30, label: '30s' },
  { seconds: 45, label: '45s' },
  { seconds: 60, label: '1m' },
  { seconds: 90, label: '1:30' },
  { seconds: 120, label: '2m' },
  { seconds: 180, label: '3m' },
  { seconds: 300, label: '5m' }
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
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
        <p className="text-sm font-medium text-[var(--color-text)] mb-3">Timer</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_TIMES.map(({ seconds, label }) => (
            <button
              key={seconds}
              onClick={() => startRestTimer(seconds)}
              className="px-3 py-2 bg-[var(--color-surface-hover)] hover:bg-[var(--color-primary)]/20 rounded-lg text-sm font-medium text-[var(--color-text)] transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const progress = restTimerSeconds > 0 ? (restTimerSeconds / 300) * 100 : 0

  return (
    <div className="bg-[var(--color-primary)] rounded-lg p-4 text-[var(--color-text-inverse)]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium opacity-90">Timer</p>
        <button
          onClick={stopRestTimer}
          className="p-1 hover:bg-white/20 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center mb-4">
        <span className="text-4xl font-bold tabular-nums">
          {formatDuration(restTimerSeconds)}
        </span>
      </div>

      <div className="h-2 bg-white/30 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-white transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => isRestTimerActive ? pauseRestTimer() : startRestTimer(restTimerSeconds || restTimerInitialSeconds)}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full"
        >
          {isRestTimerActive ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={resetRestTimer}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
