import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CaretDown, type Icon } from '@phosphor-icons/react'
import { Card, CardContent } from './Card'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  icon?: Icon
  iconColor?: string
  children: ReactNode
  defaultOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  /** 'default' = Card-based with icon circle, 'lined' = compact with accent bar */
  variant?: 'default' | 'lined'
  headerRight?: ReactNode
  className?: string
}

export function CollapsibleSection({
  title,
  subtitle,
  icon: IconComponent,
  iconColor,
  children,
  defaultOpen = false,
  onToggle,
  variant = 'default',
  headerRight,
  className = '',
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const prefersReduced = useReducedMotion()

  const toggle = () => {
    const next = !isOpen
    setIsOpen(next)
    onToggle?.(next)
  }

  if (variant === 'lined') {
    return (
      <div className={`space-y-3 ${className}`}>
        <button
          onClick={toggle}
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between px-1 py-1 text-left group"
        >
          <div className="flex items-center gap-[var(--space-2)]">
            <div
              className="w-1 h-4 rounded-full shrink-0"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            <div>
              <h3
                className="text-[var(--text-xs)] font-bold text-[var(--color-text-secondary)] uppercase group-hover:text-[var(--color-text)] transition-colors"
                style={{ letterSpacing: 'var(--tracking-widest)' }}
              >
                {title}
                {subtitle && (
                  <span className="font-normal text-[var(--color-text-muted)] ml-2">
                    ({subtitle})
                  </span>
                )}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {headerRight}
            <CaretDown
              className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={prefersReduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="space-y-3">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Default variant: Card-based with icon circle
  return (
    <Card className={className}>
      <CardContent className="py-4">
        <button
          onClick={toggle}
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {IconComponent && (
              <div className={`w-10 h-10 ${iconColor || ''} rounded-full flex items-center justify-center`}>
                <IconComponent className="w-5 h-5" />
              </div>
            )}
            <div className="text-left">
              <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
              {subtitle && (
                <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {headerRight}
            <CaretDown
              className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={prefersReduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-4">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
