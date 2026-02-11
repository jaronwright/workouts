import { motion } from 'motion/react'
import { springs, staggerContainer, staggerChild } from '@/config/animationConfig'
import { PERFORMANCE_TAG_OPTIONS } from '@/config/reviewConfig'
import type { PerformanceTag } from '@/services/reviewService'

interface PerformanceTagPickerProps {
  selectedTags: PerformanceTag[]
  onToggle: (tag: PerformanceTag) => void
}

export function PerformanceTagPicker({ selectedTags, onToggle }: PerformanceTagPickerProps) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-2"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {PERFORMANCE_TAG_OPTIONS.map((tag) => {
        const selected = selectedTags.includes(tag.value)
        const Icon = tag.icon
        return (
          <motion.button
            key={tag.value}
            type="button"
            variants={staggerChild}
            onClick={() => onToggle(tag.value)}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 border transition-colors ${
              selected
                ? 'border-transparent shadow-sm'
                : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
            }`}
            style={{
              backgroundColor: selected ? `${tag.color}18` : undefined,
            }}
            whileTap={{ scale: 0.95 }}
            animate={selected ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={springs.snappy}
          >
            <Icon
              className="w-4 h-4 shrink-0"
              style={{ color: selected ? tag.color : 'var(--color-text-muted)' }}
            />
            <span
              className="text-sm font-medium transition-colors"
              style={{ color: selected ? tag.color : 'var(--color-text)' }}
            >
              {tag.label}
            </span>
          </motion.button>
        )
      })}
    </motion.div>
  )
}
