import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { CommunityPage } from '../Community'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const {
        variants, initial, animate, exit, transition,
        layoutId, whileTap, ...validProps
      } = props
      return <div {...(validProps as Record<string, unknown>)}>{children as React.ReactNode}</div>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/layout/AppShell', () => ({
  AppShell: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

describe('CommunityPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page title "Community"', () => {
    render(<CommunityPage />)
    expect(screen.getByText('Community')).toBeInTheDocument()
  })

  it('displays the "Coming Soon" heading', () => {
    render(<CommunityPage />)
    expect(screen.getByText('Coming Soon')).toBeInTheDocument()
  })

  it('displays the "Under Construction" badge', () => {
    render(<CommunityPage />)
    expect(screen.getByText('Under Construction')).toBeInTheDocument()
  })

  it('shows introductory message about the app being in early stages', () => {
    render(<CommunityPage />)
    expect(
      screen.getByText(/still getting the app up and running/)
    ).toBeInTheDocument()
  })

  it('shows the feedback link that navigates to profile page', () => {
    render(<CommunityPage />)
    const feedbackLink = screen.getByText('report it right in the app')
    expect(feedbackLink).toBeInTheDocument()
    expect(feedbackLink.tagName).toBe('BUTTON')
  })

  it('navigates to /profile with openFeedback state when feedback link is clicked', async () => {
    const user = userEvent.setup()
    render(<CommunityPage />)

    const feedbackLink = screen.getByText('report it right in the app')
    await user.click(feedbackLink)

    expect(mockNavigate).toHaveBeenCalledWith('/profile', {
      state: { openFeedback: true },
    })
  })

  it('displays the "What\'s coming to Community" section', () => {
    render(<CommunityPage />)
    expect(
      screen.getByText("What's coming to Community:")
    ).toBeInTheDocument()
  })

  it('shows planned community features', () => {
    render(<CommunityPage />)
    expect(
      screen.getByText(/See your friends' workouts and cheer them on/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Fun competitions and a leaderboard/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Share tips, motivation, and progress/)
    ).toBeInTheDocument()
  })

  it('shows the OpenClaw expandable item', () => {
    render(<CommunityPage />)
    expect(
      screen.getByText(/See what we're building with OpenClaw/)
    ).toBeInTheDocument()
  })

  it('does not show OpenClaw details by default', () => {
    render(<CommunityPage />)
    expect(
      screen.queryByText(/dedicated Mac Mini/)
    ).not.toBeInTheDocument()
  })

  it('expands OpenClaw details when clicked', async () => {
    const user = userEvent.setup()
    render(<CommunityPage />)

    const openClawButton = screen.getByText(
      /See what we're building with OpenClaw/
    )
    await user.click(openClawButton)

    await waitFor(() => {
      expect(screen.getByText(/dedicated Mac Mini/)).toBeInTheDocument()
    })
  })

  it('shows OpenClaw description content when expanded', async () => {
    const user = userEvent.setup()
    render(<CommunityPage />)

    const openClawButton = screen.getByText(
      /See what we're building with OpenClaw/
    )
    await user.click(openClawButton)

    await waitFor(() => {
      expect(
        screen.getByText(/autonomous AI agent/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/submit feature requests and bug reports/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Welcome to the future, my friends\./)
      ).toBeInTheDocument()
    })
  })

  it('collapses OpenClaw details when clicked again', async () => {
    const user = userEvent.setup()
    render(<CommunityPage />)

    const openClawButton = screen.getByText(
      /See what we're building with OpenClaw/
    )

    // Expand
    await user.click(openClawButton)
    await waitFor(() => {
      expect(screen.getByText(/dedicated Mac Mini/)).toBeInTheDocument()
    })

    // Collapse
    await user.click(openClawButton)
    await waitFor(() => {
      expect(
        screen.queryByText(/dedicated Mac Mini/)
      ).not.toBeInTheDocument()
    })
  })

  it('shows the closing message about staying fit', () => {
    render(<CommunityPage />)
    expect(
      screen.getByText(/focus on getting the base functionality dialed in/)
    ).toBeInTheDocument()
  })

  it('shows the sign-off "Age well, my friends."', () => {
    render(<CommunityPage />)
    expect(screen.getByText('Age well, my friends.')).toBeInTheDocument()
  })
})
