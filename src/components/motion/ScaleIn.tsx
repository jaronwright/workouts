import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { springPresets, type SpringPreset } from '@/config/animationConfig'

interface ScaleInProps {
  children: ReactNode
  /** Delay in seconds before animation starts */
  delay?: number
  /** Spring config override */
  spring?: SpringPreset
  className?: string
}

export function ScaleIn({
  children,
  delay = 0,
  spring = springPresets.smooth,
  className,
}: ScaleInProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
