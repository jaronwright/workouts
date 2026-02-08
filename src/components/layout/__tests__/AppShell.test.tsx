import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import { AppShell } from '../AppShell'

vi.mock('@/components/auth/VerificationBanner', () => ({
  VerificationBanner: () => <div data-testid="verification-banner">VerificationBanner</div>,
}))

vi.mock('../Header', () => ({
  Header: ({ title }: { title: string }) => (
    <header data-testid="header">
      <h1>{title}</h1>
    </header>
  ),
}))

vi.mock('../BottomNav', () => ({
  BottomNav: () => <nav data-testid="bottom-nav">BottomNav</nav>,
}))

describe('AppShell', () => {
  it('renders children', () => {
    render(
      <AppShell title="Test">
        <p>Child content</p>
      </AppShell>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders title in header', () => {
    render(
      <AppShell title="My Workouts">
        <p>Content</p>
      </AppShell>
    )
    expect(screen.getByText('My Workouts')).toBeInTheDocument()
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('renders the VerificationBanner', () => {
    render(
      <AppShell title="Test">
        <p>Content</p>
      </AppShell>
    )
    expect(screen.getByTestId('verification-banner')).toBeInTheDocument()
  })

  it('shows nav when hideNav is false (default)', () => {
    render(
      <AppShell title="Test">
        <p>Content</p>
      </AppShell>
    )
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument()
  })

  it('hides nav when hideNav is true', () => {
    render(
      <AppShell title="Test" hideNav={true}>
        <p>Content</p>
      </AppShell>
    )
    expect(screen.queryByTestId('bottom-nav')).not.toBeInTheDocument()
  })

  it('applies extra bottom padding when nav is visible', () => {
    const { container } = render(
      <AppShell title="Test">
        <p>Content</p>
      </AppShell>
    )
    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main!.className).toContain('pb-32')
  })

  it('applies reduced bottom padding when nav is hidden', () => {
    const { container } = render(
      <AppShell title="Test" hideNav={true}>
        <p>Content</p>
      </AppShell>
    )
    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main!.className).toContain('pb-6')
    expect(main!.className).not.toContain('pb-32')
  })
})
