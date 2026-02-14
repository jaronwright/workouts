import { type ReactNode, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { springPresets, type SpringPreset } from '@/config/animationConfig'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

interface FadeInOnScrollProps {
  children: ReactNode
  /** Slide direction alongside the fade */
  direction?: Direction
  /** How much of the element must be visible (0-1) before animating */
  threshold?: number
  /** Only animate once (don't re-animate on scroll back) */
  once?: boolean
  /** Spring config override */
  spring?: SpringPreset
  /** Delay in seconds */
  delay?: number
  className?: string
}

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 20 },
  down: { x: 0, y: -20 },
  left: { x: 20, y: 0 },
  right: { x: -20, y: 0 },
  none: { x: 0, y: 0 },
}

export function FadeInOnScroll({
  children,
  direction = 'up',
  threshold = 0.15,
  once = true,
  spring = springPresets.smooth,
  delay = 0,
  className,
}: FadeInOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { amount: threshold, once })
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  const offset = offsets[direction]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: offset.x, y: offset.y }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
