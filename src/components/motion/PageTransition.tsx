import { type ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { springPresets, type SpringPreset } from '@/config/animationConfig'

interface PageTransitionProps {
  children: ReactNode
  /** Unique key for AnimatePresence to detect page changes */
  pageKey: string
  /** Navigation direction: 'forward' slides left-to-right, 'back' slides right-to-left */
  direction?: 'forward' | 'back'
  /** Spring config override */
  spring?: SpringPreset
  className?: string
}

export function PageTransition({
  children,
  pageKey,
  direction = 'forward',
  spring = springPresets.smooth,
  className,
}: PageTransitionProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  const yOffset = direction === 'forward' ? 12 : -12

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: yOffset }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -yOffset }}
        transition={spring}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
