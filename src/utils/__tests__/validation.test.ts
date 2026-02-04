import { describe, it, expect } from 'vitest'
import {
  validatePassword,
  getStrengthColor,
  getStrengthLabel,
  PasswordValidationResult
} from '../validation'

describe('validatePassword', () => {
  describe('password strength calculation', () => {
    it('returns weak for passwords with 2 or fewer checks passed', () => {
      const result = validatePassword('ab')
      expect(result.strength).toBe('weak')
    })

    it('returns fair for passwords with 3 checks passed', () => {
      const result = validatePassword('abcdefgh1')
      expect(result.strength).toBe('fair')
    })

    it('returns good for passwords with 4 checks passed', () => {
      const result = validatePassword('Abcdefgh1')
      expect(result.strength).toBe('good')
    })

    it('returns strong for passwords with all 5 checks passed', () => {
      const result = validatePassword('Abcdefgh1!')
      expect(result.strength).toBe('strong')
    })
  })

  describe('validation checks', () => {
    it('validates minimum length of 8 characters', () => {
      expect(validatePassword('Abc1!').checks.minLength).toBe(false)
      expect(validatePassword('Abcd1234!').checks.minLength).toBe(true)
    })

    it('validates uppercase letter requirement', () => {
      expect(validatePassword('abcdefgh1!').checks.hasUppercase).toBe(false)
      expect(validatePassword('Abcdefgh1!').checks.hasUppercase).toBe(true)
    })

    it('validates lowercase letter requirement', () => {
      expect(validatePassword('ABCDEFGH1!').checks.hasLowercase).toBe(false)
      expect(validatePassword('Abcdefgh1!').checks.hasLowercase).toBe(true)
    })

    it('validates number requirement', () => {
      expect(validatePassword('Abcdefgh!').checks.hasNumber).toBe(false)
      expect(validatePassword('Abcdefgh1!').checks.hasNumber).toBe(true)
    })

    it('validates special character requirement', () => {
      expect(validatePassword('Abcdefgh1').checks.hasSpecialChar).toBe(false)
      expect(validatePassword('Abcdefgh1!').checks.hasSpecialChar).toBe(true)
      expect(validatePassword('Abcdefgh1@').checks.hasSpecialChar).toBe(true)
      expect(validatePassword('Abcdefgh1#').checks.hasSpecialChar).toBe(true)
      expect(validatePassword('Abcdefgh1$').checks.hasSpecialChar).toBe(true)
    })
  })

  describe('validation result', () => {
    it('returns valid true when all requirements met', () => {
      const result = validatePassword('SecurePass1!')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('returns valid false with error messages when requirements not met', () => {
      const result = validatePassword('weak')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('includes appropriate error messages for each failed check', () => {
      const result = validatePassword('')
      expect(result.errors).toContain('At least 8 characters')
      expect(result.errors).toContain('At least one uppercase letter')
      expect(result.errors).toContain('At least one lowercase letter')
      expect(result.errors).toContain('At least one number')
      expect(result.errors).toContain('At least one special character (!@#$%^&*...)')
    })
  })

  describe('edge cases', () => {
    it('handles empty password', () => {
      const result = validatePassword('')
      expect(result.valid).toBe(false)
      expect(result.strength).toBe('weak')
      expect(result.errors.length).toBe(5)
    })

    it('handles password with only special characters', () => {
      const result = validatePassword('!@#$%^&*()')
      expect(result.checks.hasSpecialChar).toBe(true)
      expect(result.checks.minLength).toBe(true)
      expect(result.checks.hasUppercase).toBe(false)
      expect(result.checks.hasLowercase).toBe(false)
      expect(result.checks.hasNumber).toBe(false)
    })

    it('handles very long passwords', () => {
      const longPassword = 'Aa1!' + 'x'.repeat(100)
      const result = validatePassword(longPassword)
      expect(result.valid).toBe(true)
      expect(result.strength).toBe('strong')
    })
  })
})

describe('getStrengthColor', () => {
  it('returns danger color for weak passwords', () => {
    expect(getStrengthColor('weak')).toBe('var(--color-danger)')
  })

  it('returns amber color for fair passwords', () => {
    expect(getStrengthColor('fair')).toBe('#f59e0b')
  })

  it('returns blue color for good passwords', () => {
    expect(getStrengthColor('good')).toBe('#3b82f6')
  })

  it('returns green color for strong passwords', () => {
    expect(getStrengthColor('strong')).toBe('#22c55e')
  })
})

describe('getStrengthLabel', () => {
  it('returns "Weak" for weak strength', () => {
    expect(getStrengthLabel('weak')).toBe('Weak')
  })

  it('returns "Fair" for fair strength', () => {
    expect(getStrengthLabel('fair')).toBe('Fair')
  })

  it('returns "Good" for good strength', () => {
    expect(getStrengthLabel('good')).toBe('Good')
  })

  it('returns "Strong" for strong strength', () => {
    expect(getStrengthLabel('strong')).toBe('Strong')
  })
})
