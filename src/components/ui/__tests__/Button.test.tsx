import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { Button } from '../Button'

describe('Button', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('renders with default variant (primary)', () => {
      render(<Button>Primary</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-[var(--color-primary)]')
    })

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-[var(--color-surface)]')
    })

    it('renders danger variant', () => {
      render(<Button variant="danger">Danger</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-[var(--color-danger)]')
    })

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-transparent')
    })

    it('renders gradient variant', () => {
      render(<Button variant="gradient">Gradient</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-gradient-to-r')
    })
  })

  describe('sizes', () => {
    it('renders small size', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('px-4 py-2 text-sm')
    })

    it('renders medium size (default)', () => {
      render(<Button size="md">Medium</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('px-5 py-2.5 text-base')
    })

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('px-7 py-3.5 text-lg')
    })
  })

  describe('states', () => {
    it('handles click events', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('is disabled when loading prop is true', () => {
      render(<Button loading>Loading</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('shows loading spinner when loading', () => {
      render(<Button loading>Loading</Button>)
      const svg = screen.getByRole('button').querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg?.classList.contains('animate-spin')).toBe(true)
    })

    it('does not fire click when disabled', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Disabled</Button>)

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('custom props', () => {
    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      expect(screen.getByRole('button').className).toContain('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = vi.fn()
      render(<Button ref={ref}>Ref Button</Button>)
      expect(ref).toHaveBeenCalled()
    })

    it('passes through additional props', () => {
      render(<Button data-testid="custom-button" type="submit">Submit</Button>)
      const button = screen.getByTestId('custom-button')
      expect(button).toHaveAttribute('type', 'submit')
    })
  })
})
