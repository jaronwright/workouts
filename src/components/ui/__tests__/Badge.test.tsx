import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { Badge } from '../Badge'

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge variant="completed">Completed</Badge>)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders as an inline span element', () => {
    render(<Badge variant="completed">Test</Badge>)
    const badge = screen.getByText('Test')
    expect(badge.tagName).toBe('SPAN')
  })

  describe('variant styles', () => {
    it('applies completed variant styles', () => {
      render(<Badge variant="completed">Done</Badge>)
      const badge = screen.getByText('Done')
      expect(badge.className).toContain('bg-emerald-100')
      expect(badge.className).toContain('text-emerald-700')
    })

    it('applies scheduled variant styles', () => {
      render(<Badge variant="scheduled">Upcoming</Badge>)
      const badge = screen.getByText('Upcoming')
      expect(badge.className).toContain('bg-indigo-100')
      expect(badge.className).toContain('text-indigo-700')
    })

    it('applies missed variant styles', () => {
      render(<Badge variant="missed">Missed</Badge>)
      const badge = screen.getByText('Missed')
      expect(badge.className).toContain('bg-red-100')
      expect(badge.className).toContain('text-red-700')
    })

    it('applies inProgress variant styles', () => {
      render(<Badge variant="inProgress">In Progress</Badge>)
      const badge = screen.getByText('In Progress')
      expect(badge.className).toContain('bg-amber-100')
      expect(badge.className).toContain('text-amber-700')
    })
  })

  it('applies custom className', () => {
    render(<Badge variant="completed" className="my-custom-class">Test</Badge>)
    const badge = screen.getByText('Test')
    expect(badge.className).toContain('my-custom-class')
  })

  it('always includes base styles', () => {
    render(<Badge variant="completed">Test</Badge>)
    const badge = screen.getByText('Test')
    expect(badge.className).toContain('inline-flex')
    expect(badge.className).toContain('rounded-full')
    expect(badge.className).toContain('text-xs')
    expect(badge.className).toContain('font-semibold')
  })
})
