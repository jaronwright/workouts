import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import { BottomNav } from '../BottomNav'

// Mock framer-motion
vi.mock('motion/react', () => ({
  motion: {
    div: (props: any) => {
      const { initial, animate, exit, variants, whileHover, whileTap, layout, layoutId, transition, ...rest } = props
      return createElement('div', rest)
    },
  },
  AnimatePresence: ({ children }: any) => children,
}))

describe('BottomNav', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders a nav element', () => {
      render(<BottomNav />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('renders all four navigation links', () => {
      render(<BottomNav />)
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(4)
    })

    it('renders the Home link', () => {
      render(<BottomNav />)
      expect(screen.getByText('Home')).toBeInTheDocument()
    })

    it('renders the Community link', () => {
      render(<BottomNav />)
      expect(screen.getByText('Community')).toBeInTheDocument()
    })

    it('renders the Schedule link', () => {
      render(<BottomNav />)
      expect(screen.getByText('Schedule')).toBeInTheDocument()
    })

    it('renders the Review link', () => {
      render(<BottomNav />)
      expect(screen.getByText('Review')).toBeInTheDocument()
    })

    it('does not render a Profile link (profile accessed via header)', () => {
      render(<BottomNav />)
      expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    })
  })

  describe('navigation links', () => {
    it('Home link points to /', () => {
      render(<BottomNav />)
      const homeLink = screen.getByText('Home').closest('a')
      expect(homeLink).toHaveAttribute('href', '/')
    })

    it('Community link points to /community', () => {
      render(<BottomNav />)
      const communityLink = screen.getByText('Community').closest('a')
      expect(communityLink).toHaveAttribute('href', '/community')
    })

    it('Schedule link points to /schedule', () => {
      render(<BottomNav />)
      const scheduleLink = screen.getByText('Schedule').closest('a')
      expect(scheduleLink).toHaveAttribute('href', '/schedule')
    })

    it('Review link points to /history', () => {
      render(<BottomNav />)
      const historyLink = screen.getByText('Review').closest('a')
      expect(historyLink).toHaveAttribute('href', '/history')
    })

  })

  describe('active state', () => {
    it('Home link has active styling when on root path', () => {
      // BrowserRouter starts at "/", so Home should be active
      render(<BottomNav />)
      const homeLink = screen.getByText('Home').closest('a')
      expect(homeLink?.className).toContain('text-[var(--color-primary)]')
    })

    it('non-active links have muted text color', () => {
      render(<BottomNav />)
      // Community should not be active on root path
      const communityLink = screen.getByText('Community').closest('a')
      expect(communityLink?.className).toContain('text-[var(--color-text-muted)]')
    })
  })

  describe('structure', () => {
    it('contains labels for each nav item', () => {
      render(<BottomNav />)
      const labels = ['Home', 'Community', 'Schedule', 'Review']
      labels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })

    it('renders icons as SVG elements', () => {
      render(<BottomNav />)
      const nav = screen.getByRole('navigation')
      const svgs = nav.querySelectorAll('svg')
      expect(svgs.length).toBe(4)
    })

    it('nav items are wrapped in flex container', () => {
      render(<BottomNav />)
      const nav = screen.getByRole('navigation')
      const flexContainer = nav.querySelector('.flex.items-center.justify-around')
      expect(flexContainer).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('has frosted glass effect class', () => {
      render(<BottomNav />)
      const nav = screen.getByRole('navigation')
      const glass = nav.querySelector('.frosted-glass')
      expect(glass).toBeInTheDocument()
    })

    it('has proper height for nav container', () => {
      render(<BottomNav />)
      const nav = screen.getByRole('navigation')
      const container = nav.querySelector('.h-16')
      expect(container).toBeInTheDocument()
    })
  })
})
