import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { Card, CardHeader, CardContent } from '../Card'

describe('Card', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('renders with default variant', () => {
      render(<Card data-testid="card">Default</Card>)
      const card = screen.getByTestId('card')
      expect(card.className).toContain('bg-[var(--color-surface)]')
      expect(card.className).toContain('border')
    })

    it('renders elevated variant', () => {
      render(<Card variant="elevated" data-testid="card">Elevated</Card>)
      const card = screen.getByTestId('card')
      expect(card.className).toContain('bg-[var(--color-surface-elevated)]')
      expect(card.className).toContain('shadow-[var(--shadow-md)]')
    })

    it('renders outlined variant', () => {
      render(<Card variant="outlined" data-testid="card">Outlined</Card>)
      const card = screen.getByTestId('card')
      expect(card.className).toContain('bg-transparent')
      expect(card.className).toContain('border-2')
    })
  })

  describe('interactive mode', () => {
    it('has cursor-pointer when interactive', () => {
      render(<Card interactive data-testid="card">Interactive</Card>)
      const card = screen.getByTestId('card')
      expect(card.className).toContain('cursor-pointer')
    })

    it('handles click events when interactive', () => {
      const handleClick = vi.fn()
      render(
        <Card interactive onClick={handleClick} data-testid="card">
          Click me
        </Card>
      )

      fireEvent.click(screen.getByTestId('card'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not have interactive styles when not interactive', () => {
      render(<Card data-testid="card">Not interactive</Card>)
      const card = screen.getByTestId('card')
      expect(card.className).not.toContain('cursor-pointer')
    })
  })

  describe('highlight mode', () => {
    it('has ring when highlighted', () => {
      render(<Card highlight data-testid="card">Highlighted</Card>)
      const card = screen.getByTestId('card')
      expect(card.className).toContain('ring-2')
      expect(card.className).toContain('ring-[var(--color-primary)]')
    })

    it('does not have ring when not highlighted', () => {
      render(<Card data-testid="card">Not highlighted</Card>)
      const card = screen.getByTestId('card')
      expect(card.className).not.toContain('ring-2')
    })
  })

  describe('custom props', () => {
    it('applies custom className', () => {
      render(<Card className="custom-class" data-testid="card">Custom</Card>)
      expect(screen.getByTestId('card').className).toContain('custom-class')
    })

    it('passes through additional props', () => {
      render(<Card data-testid="card" aria-label="test card">Test</Card>)
      expect(screen.getByTestId('card')).toHaveAttribute('aria-label', 'test card')
    })
  })
})

describe('CardHeader', () => {
  it('renders children correctly', () => {
    render(<CardHeader>Header content</CardHeader>)
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('has border-bottom styling', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>)
    const header = screen.getByTestId('header')
    expect(header.className).toContain('border-b')
  })

  it('applies custom className', () => {
    render(<CardHeader className="custom-header" data-testid="header">Header</CardHeader>)
    expect(screen.getByTestId('header').className).toContain('custom-header')
  })
})

describe('CardContent', () => {
  it('renders children correctly', () => {
    render(<CardContent>Content area</CardContent>)
    expect(screen.getByText('Content area')).toBeInTheDocument()
  })

  it('has padding styles', () => {
    render(<CardContent data-testid="content">Content</CardContent>)
    const content = screen.getByTestId('content')
    expect(content.className).toContain('px-5')
    expect(content.className).toContain('py-4')
  })

  it('applies custom className', () => {
    render(<CardContent className="custom-content" data-testid="content">Content</CardContent>)
    expect(screen.getByTestId('content').className).toContain('custom-content')
  })
})

describe('Card composition', () => {
  it('renders full card with header and content', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <h2>Card Title</h2>
        </CardHeader>
        <CardContent>
          <p>Card body text</p>
        </CardContent>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card body text')).toBeInTheDocument()
  })
})
