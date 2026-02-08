import { motion } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface StreakDay {
  label: string
  completed: boolean
  isToday: boolean
  color?: string
}

interface StreakBarProps {
  days: StreakDay[]
  className?: string
}

export function StreakBar({ days, className = '' }: StreakBarProps) {
  const prefersReduced = useReducedMotion()

  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      {days.map((day, i) => (
        <div key={day.label} className="flex flex-col items-center gap-1.5">
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
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors
                ${day.completed
                  ? 'text-white shadow-sm'
                  : day.isToday
                    ? 'border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-surface)]'
                    : 'border border-dashed border-[var(--color-border-strong)] text-[var(--color-text-muted)] bg-transparent'
                }`}
              style={day.completed ? { backgroundColor: day.color || 'var(--color-primary)' } : undefined}
            >
              {day.label}
            </div>
            {day.isToday && !day.completed && !prefersReduced && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[var(--color-primary)]"
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </motion.div>
        </div>
      ))}
    </div>
  )
}
