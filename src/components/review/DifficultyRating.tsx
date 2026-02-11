import { motion } from 'motion/react'
import { springs } from '@/config/animationConfig'
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/config/reviewConfig'

interface DifficultyRatingProps {
  value: number | null
  onChange: (level: number) => void
}

export function DifficultyRating({ value, onChange }: DifficultyRatingProps) {
  const label = value ? DIFFICULTY_LABELS[value] : null

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
        Difficulty
      </span>
      <div className="flex gap-1 w-full max-w-xs">
        {[1, 2, 3, 4, 5].map((level) => {
          const active = value !== null && level <= value
          const color = DIFFICULTY_COLORS[level]
          return (
            <motion.button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className="flex-1 flex flex-col items-center gap-1.5"
              whileTap={{ scale: 0.95 }}
              transition={springs.snappy}
            >
              <motion.div
                className="w-full h-3 rounded-full transition-colors"
                style={{
                  backgroundColor: active ? color : 'var(--color-border)',
                }}
                animate={
                  value === level
                    ? { scale: [1, 1.08, 1] }
                    : { scale: 1 }
                }
                transition={springs.default}
              />
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: active ? color : 'var(--color-text-muted)' }}
              >
                {DIFFICULTY_LABELS[level]}
              </span>
            </motion.button>
          )
        })}
      </div>
      {label && (
        <motion.span
          key={label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold"
          style={{ color: value ? DIFFICULTY_COLORS[value] : undefined }}
        >
          {label}
        </motion.span>
      )}
    </div>
  )
}
