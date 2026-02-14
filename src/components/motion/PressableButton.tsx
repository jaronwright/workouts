import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { springPresets, type SpringPreset } from '@/config/animationConfig'

interface PressableButtonProps {
  children: ReactNode
  /** Scale factor when pressed (default 0.97) */
  scale?: number
  /** Spring config for the press/release animation */
  spring?: SpringPreset
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function PressableButton({
  children,
  scale = 0.97,
  spring = springPresets.snappy,
  className,
  onClick,
  disabled = false,
  type = 'button',
}: PressableButtonProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return (
      <button
        type={type}
        className={className}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    )
  }

  return (
    <motion.button
      type={type}
      whileTap={disabled ? undefined : { scale }}
      transition={spring}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}
