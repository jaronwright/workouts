export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
  strength: 'weak' | 'fair' | 'good' | 'strong'
  checks: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
}

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true
}

export function validatePassword(password: string): PasswordValidationResult {
  const checks = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)
  }

  const errors: string[] = []

  if (!checks.minLength) {
    errors.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters`)
  }
  if (!checks.hasUppercase) {
    errors.push('At least one uppercase letter')
  }
  if (!checks.hasLowercase) {
    errors.push('At least one lowercase letter')
  }
  if (!checks.hasNumber) {
    errors.push('At least one number')
  }
  if (!checks.hasSpecialChar) {
    errors.push('At least one special character (!@#$%^&*...)')
  }

  // Calculate strength based on passed checks
  const passedChecks = Object.values(checks).filter(Boolean).length
  let strength: PasswordValidationResult['strength']

  if (passedChecks <= 2) {
    strength = 'weak'
  } else if (passedChecks === 3) {
    strength = 'fair'
  } else if (passedChecks === 4) {
    strength = 'good'
  } else {
    strength = 'strong'
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
    checks
  }
}

export function getStrengthColor(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'weak':
      return 'var(--color-danger)'
    case 'fair':
      return '#f59e0b' // amber
    case 'good':
      return '#3b82f6' // blue
    case 'strong':
      return '#22c55e' // green
  }
}

export function getStrengthLabel(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'weak':
      return 'Weak'
    case 'fair':
      return 'Fair'
    case 'good':
      return 'Good'
    case 'strong':
      return 'Strong'
  }
}
