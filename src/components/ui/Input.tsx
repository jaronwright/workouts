import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-[var(--color-text)] mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-3
            bg-[var(--color-surface-sunken)]
            border-2 rounded-[var(--radius-lg)]
            text-[var(--color-text)] text-base
            placeholder:text-[var(--color-text-muted)]
            focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${error
              ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/10'
              : 'border-[var(--color-border)]'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm font-medium text-[var(--color-danger)] flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[var(--color-danger)]" />
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
