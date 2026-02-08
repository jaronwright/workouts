import { type ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="
              relative w-full sm:max-w-md sm:mx-4
              max-h-[85vh] overflow-auto
              bg-[var(--color-surface)]
              rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)]
              shadow-xl
            "
            initial={prefersReduced ? false : { opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle for mobile */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-[var(--color-border-strong)]" />
            </div>

            {title && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]">
                <h2 className="text-lg font-bold text-[var(--color-text)]">{title}</h2>
                <button
                  onClick={onClose}
                  className="
                    w-8 h-8 flex items-center justify-center
                    text-[var(--color-text-muted)]
                    rounded-full
                    active:scale-90 active:bg-[var(--color-surface-hover)]
                    transition-transform duration-100
                  "
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="p-5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
