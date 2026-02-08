/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { VerificationBanner } from '../VerificationBanner'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: vi.fn()
}))

const mockUseAuthStore = vi.mocked(useAuthStore)
const mockUseToast = vi.mocked(useToast)

const mockToast = {
  toast: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn()
}

describe('VerificationBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseToast.mockReturnValue(mockToast)
  })

  describe('null rendering conditions', () => {
    it('returns null when there is no user', () => {
      mockUseAuthStore.mockImplementation((selector: any) => {
        const state = {
          user: null,
          resendVerificationEmail: vi.fn(),
          refreshSession: vi.fn()
        }
        return selector(state)
      })

      const { container } = render(<VerificationBanner />)
      expect(container.innerHTML).toBe('')
    })

    it('returns null when the user email is confirmed', () => {
      mockUseAuthStore.mockImplementation((selector: any) => {
        const state = {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            email_confirmed_at: '2024-01-01T00:00:00Z'
          },
          resendVerificationEmail: vi.fn(),
          refreshSession: vi.fn()
        }
        return selector(state)
      })

      const { container } = render(<VerificationBanner />)
      expect(container.innerHTML).toBe('')
    })
  })

  describe('unverified user banner', () => {
    const mockResendVerificationEmail = vi.fn()
    const mockRefreshSession = vi.fn()

    beforeEach(() => {
      mockResendVerificationEmail.mockResolvedValue(undefined)
      mockRefreshSession.mockResolvedValue(undefined)

      mockUseAuthStore.mockImplementation((selector: any) => {
        const state = {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            email_confirmed_at: null
          },
          resendVerificationEmail: mockResendVerificationEmail,
          refreshSession: mockRefreshSession
        }
        return selector(state)
      })
    })

    it('shows the verification banner for an unverified user', () => {
      render(<VerificationBanner />)
      expect(
        screen.getByText(/please verify your email address/i)
      ).toBeInTheDocument()
    })

    it('shows the verification message text', () => {
      render(<VerificationBanner />)
      expect(
        screen.getByText(/check your inbox for a verification link/i)
      ).toBeInTheDocument()
    })

    it('shows the Resend button', () => {
      render(<VerificationBanner />)
      expect(screen.getByText('Resend')).toBeInTheDocument()
    })

    it('shows the I\'ve verified button', () => {
      render(<VerificationBanner />)
      expect(screen.getByText("I've verified")).toBeInTheDocument()
    })

    it('shows the dismiss button with aria-label', () => {
      render(<VerificationBanner />)
      expect(screen.getByLabelText('Dismiss')).toBeInTheDocument()
    })
  })

  describe('dismiss functionality', () => {
    beforeEach(() => {
      mockUseAuthStore.mockImplementation((selector: any) => {
        const state = {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            email_confirmed_at: null
          },
          resendVerificationEmail: vi.fn(),
          refreshSession: vi.fn()
        }
        return selector(state)
      })
    })

    it('hides the banner when dismiss button is clicked', () => {
      const { container } = render(<VerificationBanner />)
      expect(screen.getByText(/please verify your email/i)).toBeInTheDocument()

      fireEvent.click(screen.getByLabelText('Dismiss'))
      expect(container.innerHTML).toBe('')
    })
  })

  describe('resend functionality', () => {
    it('calls resendVerificationEmail when Resend is clicked', async () => {
      const mockResend = vi.fn().mockResolvedValue(undefined)

      mockUseAuthStore.mockImplementation((selector: any) => {
        const state = {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            email_confirmed_at: null
          },
          resendVerificationEmail: mockResend,
          refreshSession: vi.fn()
        }
        return selector(state)
      })

      render(<VerificationBanner />)
      fireEvent.click(screen.getByText('Resend'))

      await waitFor(() => {
        expect(mockResend).toHaveBeenCalledTimes(1)
      })
    })

    it('shows success toast after successful resend', async () => {
      const mockResend = vi.fn().mockResolvedValue(undefined)

      mockUseAuthStore.mockImplementation((selector: any) => {
        const state = {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            email_confirmed_at: null
          },
          resendVerificationEmail: mockResend,
          refreshSession: vi.fn()
        }
        return selector(state)
      })

      render(<VerificationBanner />)
      fireEvent.click(screen.getByText('Resend'))

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Verification email sent! Check your inbox.'
        )
      })
    })

    it('shows error toast when resend fails', async () => {
      const mockResend = vi.fn().mockRejectedValue(new Error('Network error'))

      mockUseAuthStore.mockImplementation((selector: any) => {
        const state = {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            email_confirmed_at: null
          },
          resendVerificationEmail: mockResend,
          refreshSession: vi.fn()
        }
        return selector(state)
      })

      render(<VerificationBanner />)
      fireEvent.click(screen.getByText('Resend'))

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Network error')
      })
    })

    it('shows generic error toast when resend fails with non-Error', async () => {
      const mockResend = vi.fn().mockRejectedValue('unknown error')

      mockUseAuthStore.mockImplementation((selector: any) => {
        const state = {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            email_confirmed_at: null
          },
          resendVerificationEmail: mockResend,
          refreshSession: vi.fn()
        }
        return selector(state)
      })

      render(<VerificationBanner />)
      fireEvent.click(screen.getByText('Resend'))

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Failed to send verification email'
        )
      })
    })
  })

  describe('refresh session functionality', () => {
    it('calls refreshSession when I\'ve verified is clicked', async () => {
      const mockRefresh = vi.fn().mockResolvedValue(undefined)

      // Mock getState to return still-unverified user
      const mockGetState = vi.fn().mockReturnValue({
        user: { id: 'user-1', email_confirmed_at: null }
      })
      ;(useAuthStore as any).getState = mockGetState

      mockUseAuthStore.mockImplementation((selector: any) => {
        const state = {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            email_confirmed_at: null
          },
          resendVerificationEmail: vi.fn(),
          refreshSession: mockRefresh
        }
        return selector(state)
      })

      render(<VerificationBanner />)
      fireEvent.click(screen.getByText("I've verified"))

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalledTimes(1)
      })
    })
  })
})
