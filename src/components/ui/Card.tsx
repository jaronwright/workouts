import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
  interactive?: boolean
  highlight?: boolean
}

export function Card({
  className = '',
  children,
  variant = 'default',
  interactive = false,
  highlight = false,
  ...props
}: CardProps) {
  const baseStyles = 'relative rounded-[var(--radius-xl)] overflow-hidden'

  const variants = {
    default: 'bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)]',
    elevated: 'bg-[var(--color-surface-elevated)] shadow-[var(--shadow-elevated)]',
    outlined: 'bg-transparent border-2 border-[var(--color-border-strong)]'
  }

  const interactiveStyles = interactive
    ? 'cursor-pointer active:scale-[0.98] transition-transform duration-100'
    : ''

  const highlightStyles = highlight
    ? 'ring-2 ring-[var(--color-primary)]'
    : ''

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${interactiveStyles} ${highlightStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
  return (
    <div
      className={`px-5 py-4 border-b border-[var(--color-border)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardContent({ className = '', children, ...props }: CardContentProps) {
  return (
    <div className={`px-5 py-4 ${className}`} {...props}>
      {children}
    </div>
  )
}
