import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { PasswordStrengthIndicator } from '../PasswordStrengthIndicator'

describe('PasswordStrengthIndicator', () => {
  describe('empty password', () => {
    it('returns null for an empty password', () => {
      const { container } = render(<PasswordStrengthIndicator password="" />)
      expect(container.innerHTML).toBe('')
    })
  })

  describe('requirements checklist', () => {
    it('shows all five requirement labels', () => {
      render(<PasswordStrengthIndicator password="a" />)
      expect(screen.getByText('8+ characters')).toBeInTheDocument()
      expect(screen.getByText('Uppercase letter')).toBeInTheDocument()
      expect(screen.getByText('Lowercase letter')).toBeInTheDocument()
      expect(screen.getByText('Number')).toBeInTheDocument()
      expect(screen.getByText('Special character')).toBeInTheDocument()
    })

    it('marks the lowercase requirement as met for a lowercase password', () => {
      render(<PasswordStrengthIndicator password="abc" />)
      const lowercaseLabel = screen.getByText('Lowercase letter')
      expect(lowercaseLabel.className).toContain('text-green-500')
    })

    it('marks the uppercase requirement as unmet for a lowercase-only password', () => {
      render(<PasswordStrengthIndicator password="abc" />)
      const uppercaseLabel = screen.getByText('Uppercase letter')
      expect(uppercaseLabel.className).toContain('text-[var(--color-text-muted)]')
    })

    it('marks the number requirement as met when password contains a number', () => {
      render(<PasswordStrengthIndicator password="abc123" />)
      const numberLabel = screen.getByText('Number')
      expect(numberLabel.className).toContain('text-green-500')
    })

    it('marks the special character requirement as met when password contains one', () => {
      render(<PasswordStrengthIndicator password="abc!" />)
      const specialLabel = screen.getByText('Special character')
      expect(specialLabel.className).toContain('text-green-500')
    })

    it('marks the length requirement as met when password is 8+ characters', () => {
      render(<PasswordStrengthIndicator password="abcdefgh" />)
      const lengthLabel = screen.getByText('8+ characters')
      expect(lengthLabel.className).toContain('text-green-500')
    })
  })

  describe('check and x icons', () => {
    it('shows check icons for met requirements', () => {
      render(<PasswordStrengthIndicator password="abcdefgh" />)
      // "8+ characters" and "Lowercase letter" should be met - rendered with green text
      const greenSpans = screen.getAllByText((_, element) => {
        if (element?.tagName !== 'SPAN') return false
        const cls = typeof element.className === 'string' ? element.className : ''
        return cls.includes('text-green-500')
      })
      expect(greenSpans.length).toBeGreaterThanOrEqual(2)
    })

    it('renders check (svg) icons next to met requirements', () => {
      render(<PasswordStrengthIndicator password="Abc12345!" />)
      // All 5 requirements should be met for this password
      const container = document.querySelector('.grid')
      const checkIcons = container?.querySelectorAll('.text-green-500')
      // Each met requirement has both an icon and label with green text
      expect(checkIcons?.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('strength label', () => {
    it('shows "Weak" for a password meeting 1-2 checks', () => {
      // "a" meets only lowercase (1 check)
      render(<PasswordStrengthIndicator password="a" />)
      expect(screen.getByText('Weak')).toBeInTheDocument()
    })

    it('shows "Fair" for a password meeting 3 checks', () => {
      // "Abc1" meets lowercase, uppercase, number (3 checks)
      render(<PasswordStrengthIndicator password="Abc1" />)
      expect(screen.getByText('Fair')).toBeInTheDocument()
    })

    it('shows "Good" for a password meeting 4 checks', () => {
      // "Abcdefg1" meets minLength, uppercase, lowercase, number (4 checks)
      render(<PasswordStrengthIndicator password="Abcdefg1" />)
      expect(screen.getByText('Good')).toBeInTheDocument()
    })

    it('shows "Strong" for a password meeting all 5 checks', () => {
      // "Abcdefg1!" meets all 5 checks
      render(<PasswordStrengthIndicator password="Abcdefg1!" />)
      expect(screen.getByText('Strong')).toBeInTheDocument()
    })
  })

  describe('progress bar', () => {
    it('renders the progress bar container', () => {
      render(<PasswordStrengthIndicator password="test" />)
      const progressBar = document.querySelector('.rounded-full.overflow-hidden')
      expect(progressBar).toBeInTheDocument()
    })

    it('sets progress bar width to 20% for 1 out of 5 checks met', () => {
      // "a" meets only lowercase (1/5 = 20%)
      render(<PasswordStrengthIndicator password="a" />)
      const progressFill = document.querySelector(
        '.h-full.rounded-full.transition-all'
      ) as HTMLElement
      expect(progressFill?.style.width).toBe('20%')
    })

    it('sets progress bar width to 100% for all checks met', () => {
      render(<PasswordStrengthIndicator password="Abcdefg1!" />)
      const progressFill = document.querySelector(
        '.h-full.rounded-full.transition-all'
      ) as HTMLElement
      expect(progressFill?.style.width).toBe('100%')
    })

    it('sets progress bar width to 60% for 3 out of 5 checks met', () => {
      // "Abc1" meets uppercase, lowercase, number (3/5 = 60%)
      render(<PasswordStrengthIndicator password="Abc1" />)
      const progressFill = document.querySelector(
        '.h-full.rounded-full.transition-all'
      ) as HTMLElement
      expect(progressFill?.style.width).toBe('60%')
    })
  })
})
