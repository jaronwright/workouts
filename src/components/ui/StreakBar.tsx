import { motion, AnimatePresence } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Check, Moon, type LucideIcon } from 'lucide-react'

export interface StreakDay {
  label: string
  completed: boolean
  isToday: boolean
  color?: string
  workoutName?: string
  workoutIcon?: LucideIcon
  workoutColor?: string
  isRest?: boolean
  workoutCount?: number
  dateNumber?: number
}

interface StreakBarProps {
  days: StreakDay[]
  className?: string
  showDates?: boolean
}

export function StreakBar({ days, className = '', showDates = false }: StreakBarProps) {
  const prefersReduced = useReducedMotion()

  return (
    <div className={`flex items-center justify-between gap-1 ${className}`}>
      {days.map((day, i) => {
        const Icon = day.workoutIcon
        const isToday = day.isToday

        return (
          <div key={`${day.label}-${i}`} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className={`text-[10px] font-medium ${
              isToday
                ? 'text-[var(--color-text)]'
                : 'text-[var(--color-text-muted)]'
            }`}>
              {isToday ? 'Today' : day.label}
            </span>
            <AnimatePresence>
              {showDates && day.dateNumber != null && (
                <motion.span
                  initial={prefersReduced ? false : { opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: -2 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className={`text-[9px] font-semibold leading-none ${
                    isToday
                      ? 'text-[var(--color-text)]'
                      : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  {day.dateNumber}
                </motion.span>
              )}
            </AnimatePresence>
            <motion.div
              initial={prefersReduced ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: i * 0.04,
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
              className="relative"
            >
              {/* Today's circle is larger and more prominent */}
              <div
                className={`flex items-center justify-center rounded-full transition-colors ${
                  isToday
                    ? 'w-9 h-9'
                    : 'w-7 h-7'
                } ${
                  day.completed
                    ? 'text-white shadow-sm'
                    : isToday && !day.isRest
                      ? 'text-white shadow-sm'
                      : isToday && day.isRest
                        ? 'border-2 border-[var(--color-border-strong)] text-[var(--color-text-muted)] bg-[var(--color-surface-hover)]'
                        : day.isRest
                          ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
                          : 'border border-dashed text-[var(--color-text-muted)] bg-transparent'
                }`}
                style={{
                  ...(day.completed
                    ? { backgroundColor: day.workoutColor || day.color || 'var(--color-primary)' }
                    : isToday && !day.isRest
                      ? { backgroundColor: day.workoutColor || 'var(--color-primary)' }
                      : !day.isRest && !day.completed
                        ? { borderColor: `${day.workoutColor || 'var(--color-border-strong)'}60` }
                        : undefined
                  ),
                }}
              >
                {day.completed ? (
                  <Check className={`${isToday ? 'w-4 h-4' : 'w-3 h-3'}`} strokeWidth={3} />
                ) : day.workoutCount && day.workoutCount > 1 ? (
                  <span className={`font-bold ${isToday ? 'text-xs' : 'text-[10px]'}`}>{day.workoutCount}</span>
                ) : Icon ? (
                  <Icon className={`${isToday ? 'w-4 h-4' : 'w-3 h-3'}`} strokeWidth={2.5} />
                ) : (
                  <Moon className={`${isToday ? 'w-3.5 h-3.5' : 'w-3 h-3'}`} strokeWidth={2} />
                )}
              </div>
              {/* Pulsing ring for today when not completed */}
              {isToday && !day.completed && !day.isRest && !prefersReduced && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ borderWidth: 2, borderStyle: 'solid', borderColor: day.workoutColor || 'var(--color-primary)' }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </motion.div>
            <span className={`text-[9px] leading-tight text-center truncate w-full ${
              isToday ? 'font-semibold text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'
            }`}>
              {day.workoutName || (day.isRest ? 'Rest' : '')}
            </span>
          </div>
        )
      })}
    </div>
  )
}
