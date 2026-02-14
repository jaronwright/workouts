import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  children: ReactNode
  defaultOpen?: boolean
}

export function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = true
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
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
        <ChevronDown
          className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-3">
          {children}
        </div>
      </div>
    </div>
  )
}
