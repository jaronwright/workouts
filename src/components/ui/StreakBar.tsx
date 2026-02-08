import { motion } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Moon, type LucideIcon } from 'lucide-react'

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
}

interface StreakBarProps {
  days: StreakDay[]
  className?: string
}

export function StreakBar({ days, className = '' }: StreakBarProps) {
  const prefersReduced = useReducedMotion()

  return (
    <div className={`flex items-center justify-between gap-1 ${className}`}>
      {days.map((day, i) => {
        const Icon = day.workoutIcon
        return (
          <div key={`${day.label}-${i}`} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className={`text-[10px] font-medium ${day.isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
              {day.label}
            </span>
            <motion.div
              initial={prefersReduced ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: i * 0.05,
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
              className="relative"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  ${day.completed
                    ? 'text-white shadow-sm'
                    : day.isToday
                      ? 'border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-surface)]'
                      : 'border border-dashed border-[var(--color-border-strong)] text-[var(--color-text-muted)] bg-transparent'
                  }`}
                style={day.completed
                  ? { backgroundColor: day.workoutColor || day.color || 'var(--color-primary)' }
                  : undefined
                }
              >
                {day.workoutCount && day.workoutCount > 1 ? (
                  <span className="text-xs font-bold">{day.workoutCount}</span>
                ) : Icon ? (
                  <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                ) : (
                  <Moon className="w-3 h-3 text-[var(--color-text-muted)]" strokeWidth={2} />
                )}
              </div>
              {day.isToday && !day.completed && !prefersReduced && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[var(--color-primary)]"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </motion.div>
            <span className={`text-[9px] leading-tight text-center truncate w-full ${day.isToday ? 'font-semibold text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>
              {day.workoutName || (day.isRest ? 'Rest' : '—')}
            </span>
          </div>
        )
      })}
    </div>
  )
}
