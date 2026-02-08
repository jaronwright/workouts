import { motion } from 'motion/react'
import { Card } from './Card'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { HTMLAttributes, ReactNode } from 'react'

interface AnimatedCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
  interactive?: boolean
  highlight?: boolean
  layoutId?: string
  animationDelay?: number
}

export function AnimatedCard({
  children,
  layoutId,
  animationDelay = 0,
  ...cardProps
}: AnimatedCardProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <Card {...cardProps}>{children}</Card>
  }

  return (
    <motion.div
      layoutId={layoutId}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: animationDelay,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card {...cardProps}>{children}</Card>
    </motion.div>
  )
}
