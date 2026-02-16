interface SectionLabelProps {
  children: string
  className?: string
}

/** Uppercase muted label used as a section divider throughout the app */
export function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <h3
      className={`text-[var(--text-xs)] text-[var(--color-text-muted)] uppercase tracking-[var(--tracking-widest)] ${className}`}
      style={{ fontWeight: 'var(--weight-semibold)' }}
    >
      {children}
    </h3>
  )
}
