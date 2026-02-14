import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { springPresets, stagger as staggerTokens, type SpringPreset } from '@/config/animationConfig'

interface StaggerListProps {
  children: ReactNode
  /** Delay between each child animation in seconds */
  staggerDelay?: number
  /** Spring config for child animations */
  spring?: SpringPreset
  className?: string
}

export function StaggerList({
  children,
  staggerDelay = staggerTokens.normal,
  spring = springPresets.smooth,
  className,
}: StaggerListProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Wrap each child in a StaggerList with this to get the stagger effect */
export function StaggerItem({
  children,
  spring = springPresets.smooth,
  className,
}: {
  children: ReactNode
  spring?: SpringPreset
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: spring,
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
