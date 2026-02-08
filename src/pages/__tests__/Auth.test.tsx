import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { AuthPage } from '../Auth'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockSignIn = vi.fn()
const mockSignUp = vi.fn()
const mockSignInWithGoogle = vi.fn()
const mockResetPassword = vi.fn()
const mockUpdatePassword = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
    resetPassword: mockResetPassword,
    updatePassword: mockUpdatePassword,
    loading: false,
    user: null,
  }),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: () => ({
      user: null,
      session: null,
    }),
  },
}))

vi.mock('@/services/profileService', () => ({
  upsertProfile: vi.fn(),
}))

vi.mock('@/utils/validation', () => ({
  validatePassword: (password: string) => ({
    valid: password.length >= 8,
    errors: password.length < 8 ? ['Too short'] : [],
    strength: password.length >= 12 ? 'strong' : password.length >= 8 ? 'good' : 'weak',
    checks: {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*]/.test(password),
    },
  }),
  getStrengthColor: () => '#22c55e',
  getStrengthLabel: () => 'Good',
}))

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sign in form by default with Email, Password fields and Sign In button', { timeout: 15000 }, () => {
    render(<AuthPage />)

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
    // "Sign In" appears as both a tab and a submit button
    const signInButtons = screen.getAllByRole('button', { name: 'Sign In' })
    expect(signInButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('can switch to sign up tab showing extra fields (Display Name)', async () => {
    const user = userEvent.setup()
    render(<AuthPage />)

    const signUpTab = screen.getByRole('button', { name: 'Sign Up' })
    await user.click(signUpTab)

    expect(screen.getByText('Display Name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
  })

  it('shows "Forgot password?" link in sign in mode', () => {
    render(<AuthPage />)

    expect(screen.getByRole('button', { name: 'Forgot password?' })).toBeInTheDocument()
  })

  it('shows password strength indicator in sign up mode when typing a password', async () => {
    const user = userEvent.setup()
    render(<AuthPage />)

    // Switch to sign up
    await user.click(screen.getByRole('button', { name: 'Sign Up' }))

    // Type a password to trigger the indicator
    const passwordInput = screen.getByPlaceholderText(/••••••••/)
    await user.type(passwordInput, 'TestPass1!')

    // The PasswordStrengthIndicator renders strength label and checks
    await waitFor(() => {
      expect(screen.getByText('Good')).toBeInTheDocument()
    })
  })

  it('shows "Continue with Google" button', () => {
    render(<AuthPage />)

    expect(screen.getByRole('button', { name: /Continue with Google/ })).toBeInTheDocument()
  })

  it('calls signIn with email and password on form submission', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue(undefined)
    render(<AuthPage />)

    const emailInput = screen.getByPlaceholderText('you@example.com')
    const passwordInput = screen.getByPlaceholderText(/••••••••/)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'mypassword123')

    const signInButtons = screen.getAllByRole('button', { name: 'Sign In' })
    await user.click(signInButtons[signInButtons.length - 1])

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'mypassword123', true)
    })
  })

  it('shows error message when signIn throws', async () => {
    const user = userEvent.setup()
    mockSignIn.mockRejectedValue(new Error('Invalid login credentials'))
    render(<AuthPage />)

    const emailInput = screen.getByPlaceholderText('you@example.com')
    const passwordInput = screen.getByPlaceholderText(/••••••••/)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')

    const signInButtons = screen.getAllByRole('button', { name: 'Sign In' })
    await user.click(signInButtons[signInButtons.length - 1])

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument()
    })
  })

  it('navigates to forgot password mode and back', async () => {
    const user = userEvent.setup()
    render(<AuthPage />)

    // Click forgot password
    await user.click(screen.getByRole('button', { name: 'Forgot password?' }))

    // Should show reset password form
    expect(screen.getByText('Reset Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument()

    // Click back to sign in
    await user.click(screen.getByText('Back to sign in'))

    // Should be back to sign in mode - "Sign In" appears as tab and submit button
    const signInButtons = screen.getAllByRole('button', { name: 'Sign In' })
    expect(signInButtons.length).toBeGreaterThanOrEqual(1)
  })
})
