import { motion, useReducedMotion } from 'motion/react'
import { springPresets, type SpringPreset } from '@/config/animationConfig'

interface AnimatedProgressProps {
  /** Progress value from 0 to 1 */
  progress: number
  /** CSS color value for the bar */
  color?: string
  /** Height of the progress bar in pixels */
  height?: number
  /** Spring config override */
  spring?: SpringPreset
  className?: string
}

export function AnimatedProgress({
  progress,
  color = 'var(--color-primary)',
  height = 4,
  spring = springPresets.smooth,
  className,
}: AnimatedProgressProps) {
  const prefersReduced = useReducedMotion()
  const clampedProgress = Math.max(0, Math.min(1, progress))

  if (prefersReduced) {
    return (
      <div
        className={`w-full overflow-hidden rounded-full ${className ?? ''}`}
        style={{ height, backgroundColor: 'var(--color-surface-hover)' }}
      >
        <div
          style={{
            width: `${clampedProgress * 100}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 'inherit',
          }}
        />
      </div>
    )
  }

  return (
    <div
      className={`w-full overflow-hidden rounded-full ${className ?? ''}`}
      style={{ height, backgroundColor: 'var(--color-surface-hover)' }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clampedProgress * 100}%` }}
        transition={spring}
        style={{
          height: '100%',
          backgroundColor: color,
          borderRadius: 'inherit',
        }}
      />
    </div>
  )
}
