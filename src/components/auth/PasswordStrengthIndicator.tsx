import { Check, X } from '@phosphor-icons/react'
import { validatePassword, getStrengthColor, getStrengthLabel } from '@/utils/validation'

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const validation = validatePassword(password)
  const strengthColor = getStrengthColor(validation.strength)
  const strengthLabel = getStrengthLabel(validation.strength)

  // Don't show anything if password is empty
  if (!password) {
    return null
  }

  const requirements = [
    { key: 'minLength', label: '8+ characters', met: validation.checks.minLength },
    { key: 'hasUppercase', label: 'Uppercase letter', met: validation.checks.hasUppercase },
    { key: 'hasLowercase', label: 'Lowercase letter', met: validation.checks.hasLowercase },
    { key: 'hasNumber', label: 'Number', met: validation.checks.hasNumber },
    { key: 'hasSpecialChar', label: 'Special character', met: validation.checks.hasSpecialChar }
  ]

  // Calculate progress bar width
  const passedCount = Object.values(validation.checks).filter(Boolean).length
  const progressWidth = (passedCount / 5) * 100

  return (
    <div className="mt-2 space-y-2 animate-fade-in">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-[var(--duration-slow)]"
            style={{
              width: `${progressWidth}%`,
              backgroundColor: strengthColor
            }}
          />
        </div>
        <span
          className="text-xs font-medium"
          style={{ color: strengthColor }}
        >
          {strengthLabel}
        </span>
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-2 gap-1">
        {requirements.map(({ key, label, met }) => (
          <div
            key={key}
            className="flex items-center gap-1.5 text-xs"
          >
            {met ? (
              <Check className="w-3 h-3 text-[var(--color-success)]" />
            ) : (
              <X className="w-3 h-3 text-[var(--color-text-muted)]" />
            )}
            <span className={met ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
