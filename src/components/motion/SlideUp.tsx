import { type ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { springPresets, type SpringPreset } from '@/config/animationConfig'

interface SlideUpProps {
  /** Controls visibility (drives enter/exit animation) */
  isOpen: boolean
  /** Called when the backdrop overlay is clicked */
  onClose: () => void
  children: ReactNode
  /** Spring config for the slide animation (bouncy default gives slight overshoot) */
  spring?: SpringPreset
  className?: string
}

export function SlideUp({
  isOpen,
  onClose,
  children,
  spring = springPresets.bouncy,
  className,
}: SlideUpProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    if (!isOpen) return null
    return (
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          role="presentation"
        />
        <div className={`absolute bottom-0 left-0 right-0 ${className ?? ''}`}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            role="presentation"
          />
          <motion.div
            className={`absolute bottom-0 left-0 right-0 ${className ?? ''}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
