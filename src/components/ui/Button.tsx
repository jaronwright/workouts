import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles = `
      relative inline-flex items-center justify-center font-semibold
      rounded-[var(--radius-lg)]
      transition-transform duration-100 ease-out
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.97]
      select-none
    `

    const variants = {
      primary: `
        bg-[var(--color-primary)] text-[var(--color-text-inverse)]
        shadow-sm
      `,
      secondary: `
        bg-[var(--color-surface)] text-[var(--color-text)]
        border border-[var(--color-border-strong)]
        shadow-xs
      `,
      danger: `
        bg-[var(--color-danger)] text-[var(--color-text-inverse)]
        shadow-sm
      `,
      ghost: `
        bg-transparent text-[var(--color-text)]
      `,
      gradient: `
        bg-gradient-to-r from-[var(--color-primary)] to-[#8B5CF6]
        text-[var(--color-text-inverse)]
        shadow-sm
      `
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-1.5',
      md: 'px-5 py-2.5 text-base gap-2',
      lg: 'px-7 py-3.5 text-lg gap-2.5'
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
