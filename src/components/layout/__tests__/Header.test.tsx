import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { Header } from '../Header'

// Mock the auth store
const mockSignOut = vi.fn().mockResolvedValue(undefined)
const mockNavigate = vi.fn()

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => selector({ signOut: mockSignOut }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the title', () => {
      render(<Header title="My Workouts" />)
      expect(screen.getByText('My Workouts')).toBeInTheDocument()
    })

    it('renders as a header element', () => {
      render(<Header title="Test" />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('renders the title in an h1 element', () => {
      render(<Header title="Test Title" />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Test Title')
    })

    it('does not render back button by default', () => {
      render(<Header title="Test" />)
      const buttons = screen.queryAllByRole('button')
      expect(buttons).toHaveLength(0)
    })

    it('does not render logout button by default', () => {
      render(<Header title="Test" />)
      const buttons = screen.queryAllByRole('button')
      expect(buttons).toHaveLength(0)
    })
  })

  describe('back button', () => {
    it('renders back button when showBack is true', () => {
      render(<Header title="Details" showBack />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })

    it('navigates back when back button is clicked', () => {
      render(<Header title="Details" showBack />)
      const backButton = screen.getAllByRole('button')[0]
      fireEvent.click(backButton)
      expect(mockNavigate).toHaveBeenCalledWith(-1)
    })

    it('does not render back button when showBack is false', () => {
      render(<Header title="Test" showBack={false} />)
      const buttons = screen.queryAllByRole('button')
      expect(buttons).toHaveLength(0)
    })

    it('back button contains a chevron icon (SVG)', () => {
      render(<Header title="Details" showBack />)
      const backButton = screen.getAllByRole('button')[0]
      const svg = backButton.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('logout button', () => {
    it('renders logout button when showLogout is true', () => {
      render(<Header title="Profile" showLogout />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })

    it('calls signOut and navigates to /auth on logout click', async () => {
      render(<Header title="Profile" showLogout />)
      const logoutButton = screen.getAllByRole('button')[0]
      fireEvent.click(logoutButton)

      // Wait for async signOut
      await vi.waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1)
      })
      expect(mockNavigate).toHaveBeenCalledWith('/auth')
    })

    it('does not render logout button when showLogout is false', () => {
      render(<Header title="Test" showLogout={false} />)
      const buttons = screen.queryAllByRole('button')
      expect(buttons).toHaveLength(0)
    })

    it('logout button contains an SVG icon', () => {
      render(<Header title="Profile" showLogout />)
      const logoutButton = screen.getAllByRole('button')[0]
      const svg = logoutButton.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('both back and logout buttons', () => {
    it('renders both buttons when showBack and showLogout are true', () => {
      render(<Header title="Test" showBack showLogout />)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
    })

    it('back button is on the left, logout on the right', () => {
      render(<Header title="Test" showBack showLogout />)
      const buttons = screen.getAllByRole('button')
      // First button should be the back button (left side)
      fireEvent.click(buttons[0])
      expect(mockNavigate).toHaveBeenCalledWith(-1)
    })
  })

  describe('headerAction', () => {
    it('renders custom header action element', () => {
      render(
        <Header
          title="Test"
          headerAction={<button data-testid="custom-action">Action</button>}
        />
      )
      expect(screen.getByTestId('custom-action')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('does not render header action when not provided', () => {
      render(<Header title="Test" />)
      expect(screen.queryByTestId('custom-action')).not.toBeInTheDocument()
    })

    it('renders header action alongside logout button', () => {
      render(
        <Header
          title="Test"
          showLogout
          headerAction={<span data-testid="extra">Extra</span>}
        />
      )
      expect(screen.getByTestId('extra')).toBeInTheDocument()
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('styling', () => {
    it('header has frosted glass effect', () => {
      render(<Header title="Test" />)
      const header = screen.getByRole('banner')
      expect(header.className).toContain('frosted-glass')
    })

    it('header has z-index for layering', () => {
      render(<Header title="Test" />)
      const header = screen.getByRole('banner')
      expect(header.className).toContain('z-40')
    })

    it('header has fixed height', () => {
      render(<Header title="Test" />)
      const header = screen.getByRole('banner')
      const container = header.querySelector('.h-14')
      expect(container).toBeInTheDocument()
    })
  })
})
