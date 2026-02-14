import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { springPresets, type SpringPreset } from '@/config/animationConfig'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

interface FadeInProps {
  children: ReactNode
  /** Slide direction alongside the fade */
  direction?: Direction
  /** Delay in seconds before animation starts */
  delay?: number
  /** Spring config override */
  spring?: SpringPreset
  className?: string
}

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 16 },
  down: { x: 0, y: -16 },
  left: { x: 16, y: 0 },
  right: { x: -16, y: 0 },
  none: { x: 0, y: 0 },
}

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  spring = springPresets.smooth,
  className,
}: FadeInProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  const offset = offsets[direction]

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
