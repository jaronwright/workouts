import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Play, Pause, ArrowCounterClockwise } from '@phosphor-icons/react'
import { useWorkoutStore } from '@/stores/workoutStore'
import { formatDuration } from '@/utils/formatters'
import { ProgressRing } from '@/components/motion'
import { springPresets } from '@/config/animationConfig'

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

  // ─── PRESET SELECTOR (idle state) ───
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
                hover:bg-[var(--color-primary-muted)]
                rounded-full
                text-xs font-semibold tabular-nums
                text-[var(--color-text-secondary)]
                hover:text-[var(--color-primary)]
                active:scale-90
                transition-all duration-100
                cursor-pointer
              "
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Calculate progress: 1.0 when full, 0.0 when empty
  const progress = restTimerInitialSeconds > 0
    ? restTimerSeconds / restTimerInitialSeconds
    : 0

  const isFinished = restTimerSeconds === 0

  // ─── ACTIVE TIMER — dramatic circular display ───
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="active-timer"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={springPresets.snappy}
        className="rounded-[var(--radius-xl)] p-5 relative overflow-hidden"
        style={{
          background: isFinished
            ? 'var(--color-primary)'
            : 'var(--color-surface)',
          border: isFinished
            ? 'none'
            : '1px solid var(--color-border)',
        }}
      >
        {/* Subtle glow when active */}
        {!isFinished && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 50%, var(--color-primary-muted) 0%, transparent 70%)',
            }}
          />
        )}

        {/* Close button */}
        <div className="flex justify-end mb-2 relative">
          <button
            onClick={stopRestTimer}
            className={`
              p-1.5 rounded-full active:scale-90 transition-transform duration-100
              ${isFinished
                ? 'hover:bg-[var(--color-primary-text)]/10 text-[var(--color-primary-text)]'
                : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
              }
            `}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Circular timer display */}
        <div className="relative flex flex-col items-center">
          {/* Progress ring */}
          <div className="relative">
            <ProgressRing
              progress={progress}
              size={160}
              strokeWidth={6}
              color={isFinished ? 'rgba(255,255,255,0.9)' : 'var(--color-primary)'}
              trackColor={isFinished ? 'rgba(255,255,255,0.2)' : 'var(--color-border)'}
            />

            {/* Countdown inside the ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                key={restTimerSeconds}
                initial={false}
                animate={isFinished ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={isFinished
                  ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                  : undefined
                }
                className={`
                  font-mono-stats font-bold tabular-nums tracking-tight
                  ${isFinished
                    ? 'text-[var(--color-primary-text)] text-5xl'
                    : 'text-[var(--color-text)] text-[clamp(3rem,15vw,4.5rem)]'
                  }
                `}
              >
                {isFinished ? 'Done!' : formatDuration(restTimerSeconds)}
              </motion.span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 mt-5">
            <button
              onClick={() => isRestTimerActive ? pauseRestTimer() : startRestTimer(restTimerSeconds || restTimerInitialSeconds)}
              aria-label={isRestTimerActive ? 'Pause timer' : 'Start timer'}
              className={`
                p-3.5 rounded-full active:scale-90 transition-transform duration-100
                ${isFinished
                  ? 'bg-[var(--color-primary-text)]/20 hover:bg-[var(--color-primary-text)]/30 text-[var(--color-primary-text)]'
                  : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-text)]'
                }
              `}
              style={!isFinished ? { boxShadow: '0 0 16px var(--color-primary-glow)' } : undefined}
            >
              {isRestTimerActive ? (
                <Pause className="w-6 h-6" fill="currentColor" />
              ) : (
                <Play className="w-6 h-6" fill="currentColor" />
              )}
            </button>
            <button
              onClick={resetRestTimer}
              aria-label="Reset timer"
              className={`
                p-3.5 rounded-full active:scale-90 transition-transform duration-100
                ${isFinished
                  ? 'bg-[var(--color-primary-text)]/20 hover:bg-[var(--color-primary-text)]/30 text-[var(--color-primary-text)]'
                  : 'bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)]'
                }
              `}
            >
              <ArrowCounterClockwise className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
