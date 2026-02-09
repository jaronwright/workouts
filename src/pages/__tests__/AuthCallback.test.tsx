import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { AuthCallbackPage } from '../AuthCallback'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockGetSession = vi.fn()

vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(),
  },
}))

const mockSetUser = vi.fn()
const mockSetSession = vi.fn()

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      setUser: mockSetUser,
      setSession: mockSetSession,
    }
    return typeof selector === 'function' ? selector(state) : state
  },
}))

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state with "Completing sign in..." message', () => {
    mockGetSession.mockReturnValue(new Promise(() => {})) // never resolves
    render(<AuthCallbackPage />)

    expect(screen.getByText('Completing sign in...')).toBeInTheDocument()
    expect(
      screen.getByText('Please wait while we verify your account.')
    ).toBeInTheDocument()
  })

  it('navigates to home and sets user/session on successful auth', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockSessionData = {
      access_token: 'token',
      refresh_token: 'refresh',
      user: mockUser,
    }

    mockGetSession.mockResolvedValue({
      data: { session: mockSessionData },
      error: null,
    })

    render(<AuthCallbackPage />)

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(mockUser)
    })

    expect(mockSetSession).toHaveBeenCalledWith(mockSessionData)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('redirects to /auth when no session is found', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    render(<AuthCallbackPage />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth')
    })

    // Should NOT set user or session
    expect(mockSetUser).not.toHaveBeenCalled()
    expect(mockSetSession).not.toHaveBeenCalled()
  })

  it('shows error message when getSession returns an error', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid token' },
    })

    render(<AuthCallbackPage />)

    await waitFor(() => {
      expect(screen.getByText('Authentication Error')).toBeInTheDocument()
    })

    expect(screen.getByText('Invalid token')).toBeInTheDocument()
    expect(screen.getByText('Redirecting to sign in...')).toBeInTheDocument()
  })

  it('schedules redirect to /auth after timeout when there is an auth error', async () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Session expired' },
    })

    render(<AuthCallbackPage />)

    await waitFor(() => {
      expect(screen.getByText('Authentication Error')).toBeInTheDocument()
    })

    // Verify setTimeout was called with 3000ms to schedule navigation
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 3000)

    setTimeoutSpy.mockRestore()
  })

  it('shows generic error on unexpected exception', async () => {
    mockGetSession.mockRejectedValue(new Error('Network failure'))

    render(<AuthCallbackPage />)

    await waitFor(() => {
      expect(screen.getByText('Authentication Error')).toBeInTheDocument()
    })

    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    expect(screen.getByText('Redirecting to sign in...')).toBeInTheDocument()
  })

  it('schedules redirect on unexpected exception', async () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
    mockGetSession.mockRejectedValue(new Error('Network failure'))

    render(<AuthCallbackPage />)

    await waitFor(() => {
      expect(screen.getByText('Authentication Error')).toBeInTheDocument()
    })

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 3000)

    setTimeoutSpy.mockRestore()
  })

  it('displays the exclamation mark icon in error state', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Auth failed' },
    })

    render(<AuthCallbackPage />)

    await waitFor(() => {
      expect(screen.getByText('!')).toBeInTheDocument()
    })
  })

  it('does not show error state during initial loading', () => {
    mockGetSession.mockReturnValue(new Promise(() => {})) // pending
    render(<AuthCallbackPage />)

    expect(screen.queryByText('Authentication Error')).not.toBeInTheDocument()
    expect(screen.queryByText('!')).not.toBeInTheDocument()
  })

  it('does not set user or session when auth error occurs', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Token invalid' },
    })

    render(<AuthCallbackPage />)

    await waitFor(() => {
      expect(screen.getByText('Authentication Error')).toBeInTheDocument()
    })

    expect(mockSetUser).not.toHaveBeenCalled()
    expect(mockSetSession).not.toHaveBeenCalled()
  })
})
