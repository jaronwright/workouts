import { motion } from 'motion/react'
import { springs } from '@/config/animationConfig'
import { MOOD_OPTIONS } from '@/config/reviewConfig'
import type { MoodValue } from '@/services/reviewService'

interface MoodSelectorProps {
  value: MoodValue | null
  onChange: (mood: MoodValue) => void
  label?: string
}

export function MoodSelector({ value, onChange, label }: MoodSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
          {label}
        </span>
      )}
      <div className="flex gap-2">
        {MOOD_OPTIONS.map((mood) => {
          const selected = value === mood.value
          return (
            <motion.button
              key={mood.value}
              type="button"
              onClick={() => onChange(mood.value)}
              className={`flex flex-col items-center gap-1 rounded-xl px-2.5 py-2 transition-colors ${
                selected
                  ? 'ring-2 ring-offset-1 ring-offset-[var(--color-surface)] dark:ring-offset-[var(--color-surface)]'
                  : 'hover:bg-[var(--color-surface-hover)]'
              }`}
              style={{
                backgroundColor: selected ? mood.bgColor : undefined,
                ringColor: selected ? mood.color : undefined,
                // Use outline as ring fallback for inline ring-color
                outlineColor: selected ? mood.color : undefined,
              }}
              whileTap={{ scale: 0.9 }}
              animate={selected ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={springs.default}
            >
              <span className="text-2xl leading-none">{mood.emoji}</span>
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: selected ? mood.color : 'var(--color-text-muted)' }}
              >
                {mood.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
