import { useState } from 'react'
import { motion } from 'motion/react'
import { Star } from 'lucide-react'
import { springs } from '@/config/animationConfig'
import { RATING_LABELS } from '@/config/reviewConfig'

interface StarRatingProps {
  value: number
  onChange?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}

const sizeMap = {
  sm: { star: 'w-5 h-5', gap: 'gap-1' },
  md: { star: 'w-7 h-7', gap: 'gap-1.5' },
  lg: { star: 'w-9 h-9', gap: 'gap-2' },
}

export function StarRating({ value, onChange, size = 'md', readonly = false }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const displayValue = hovered ?? value
  const { star, gap } = sizeMap[size]
  const label = RATING_LABELS[Math.round(displayValue)]

  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex ${gap}`}
        onMouseLeave={() => !readonly && setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = i <= displayValue
          return (
            <motion.button
              key={i}
              type="button"
              disabled={readonly}
              className="focus:outline-none disabled:cursor-default"
              onMouseEnter={() => !readonly && setHovered(i)}
              onClick={() => onChange?.(i)}
              whileHover={readonly ? undefined : { scale: 1.2 }}
              whileTap={readonly ? undefined : { scale: 0.9 }}
              animate={filled && i === Math.round(displayValue) ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={springs.snappy}
            >
              <Star
                className={`${star} transition-colors duration-150 ${
                  filled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-none text-gray-300 dark:text-gray-600'
                }`}
              />
            </motion.button>
          )
        })}
      </div>
      {label && (
        <motion.span
          key={label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-medium text-[var(--color-text-muted)] mt-1.5"
        >
          {label}
        </motion.span>
      )}
    </div>
  )
}
