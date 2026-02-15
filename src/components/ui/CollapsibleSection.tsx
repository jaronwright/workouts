import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from './Card'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface CollapsibleSectionProps {
  icon: LucideIcon
  iconColor: string
  title: string
  subtitle: string
  children: ReactNode
  defaultExpanded?: boolean
  onToggle?: (expanded: boolean) => void
}

export function CollapsibleSection({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  children,
  defaultExpanded = false,
  onToggle,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const prefersReduced = useReducedMotion()

  const toggle = () => {
    const next = !expanded
    setExpanded(next)
    onToggle?.(next)
  }

  return (
    <Card>
      <CardContent className="py-4">
        <button
          onClick={toggle}
          aria-expanded={expanded}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${iconColor} rounded-full flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-[var(--color-text-muted)]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />
          )}
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
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
