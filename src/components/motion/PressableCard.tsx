import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { springPresets, type SpringPreset } from '@/config/animationConfig'

interface PressableCardProps {
  children: ReactNode
  /** Scale factor when pressed (default 0.97) */
  scale?: number
  /** Spring config for the press/release animation */
  spring?: SpringPreset
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export function PressableCard({
  children,
  scale = 0.97,
  spring = springPresets.snappy,
  className,
  onClick,
  disabled = false,
}: PressableCardProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return (
      <div className={className} onClick={disabled ? undefined : onClick}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      whileTap={disabled ? undefined : { scale }}
      transition={spring}
      className={className}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </motion.div>
  )
}
