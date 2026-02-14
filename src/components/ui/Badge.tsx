import type { ReactNode } from 'react'

type BadgeVariant = 'completed' | 'scheduled' | 'missed' | 'inProgress'

interface BadgeProps {
  variant: BadgeVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  completed: 'bg-[var(--color-success-muted)] text-[var(--color-success)]',
  scheduled: 'bg-[var(--color-info-muted)] text-[var(--color-info)]',
  missed: 'bg-[var(--color-danger-muted)] text-[var(--color-danger)]',
  inProgress: 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]',
}

export function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
