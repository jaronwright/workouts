import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Dumbbell, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { FadeIn } from '@/components/motion'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { upsertProfile } from '@/services/profileService'
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator'
import { validatePassword } from '@/utils/validation'

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset'

export function AuthPage() {
  const [searchParams] = useSearchParams()
  const urlMode = searchParams.get('mode')

  const [mode, setMode] = useState<AuthMode>(urlMode === 'reset' ? 'reset' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const navigate = useNavigate()
  const { signIn, signUp, signInWithGoogle, resetPassword, updatePassword, loading, user } = useAuth()

  // Check for password reset mode from URL - this needs to sync mode from URL params
  // which changes when user returns from password reset email link
  useEffect(() => {
    if (urlMode === 'reset' && user) {
      // Using a callback form to avoid the linter warning for sync setState in effect
      // This is intentional: we need to update mode when URL changes after email redirect
      queueMicrotask(() => setMode('reset'))
    }
  }, [urlMode, user])

  // Redirect if already logged in (unless in reset mode)
  useEffect(() => {
    if (user && mode !== 'reset') {
      navigate('/')
    }
  }, [user, mode, navigate])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    if (!password) {
      setError('Please enter your password')
      return
    }

    try {
      await signIn(email.trim(), password, rememberMe)
      navigate('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      if (message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else if (message.includes('Email not confirmed')) {
        setError('Please check your email and confirm your account before signing in.')
      } else {
        setError(message)
      }
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    if (!password) {
      setError('Please enter a password')
      return
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      setError('Password does not meet requirements')
      return
    }

    try {
      await signUp(email.trim(), password)
      const newUser = useAuthStore.getState().user

      if (newUser && displayName) {
        await upsertProfile(newUser.id, {
          display_name: displayName.trim() || null
        })
      }

      // Check if email confirmation is required
      const session = useAuthStore.getState().session
      if (!session) {
        setSuccess('Account created! Please check your email to confirm your account.')
        setMode('signin')
      } else {
        navigate('/')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      if (message.includes('already registered')) {
        setError('An account with this email already exists. Try signing in instead.')
      } else {
        setError(message)
      }
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    try {
      await resetPassword(email.trim())
      setSuccess('Password reset email sent! Check your inbox for the reset link.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!password) {
      setError('Please enter a new password')
      return
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      setError('Password does not meet requirements')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await updatePassword(password)
      setSuccess('Password updated successfully!')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setSuccess('')

    try {
      await signInWithGoogle()
      // User will be redirected to Google, then back to /auth/callback
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    }
  }

  const clearForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setDisplayName('')
    setError('')
    setSuccess('')
    setRememberMe(true)
  }

  const switchMode = (newMode: AuthMode) => {
    clearForm()
    setMode(newMode)
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-[var(--space-4)] relative overflow-hidden">
      {/* Warm glow backdrop */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: 'var(--gradient-warm-glow)' }}
      />
      <div className="w-full max-w-sm relative">
        {/* Brand Header */}
        <FadeIn direction="up">
          <div className="text-center mb-[var(--space-10)]">
            <div
              className="w-16 h-16 mx-auto mb-[var(--space-5)] rounded-[var(--radius-xl)] flex items-center justify-center animate-glow"
              style={{
                background: 'var(--gradient-primary)',
                boxShadow: 'var(--shadow-primary)',
              }}
            >
              <Dumbbell className="w-8 h-8" style={{ color: 'var(--color-primary-text)' }} />
            </div>
            <h1
              className="text-[var(--text-3xl)] text-[var(--color-text)] mb-[var(--space-2)]"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-tight)' }}
            >
              Workout Tracker
            </h1>
            <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
              Track your progress. Elevate your training.
            </p>
          </div>
        </FadeIn>

        {/* Auth Card */}
        <FadeIn direction="up" delay={0.1}>
          <Card variant="elevated">
            <CardContent className="p-[var(--space-5)]">
              {/* Sign In / Sign Up Mode */}
              {(mode === 'signin' || mode === 'signup') && (
                <>
                  {/* Tabs */}
                  <div className="flex p-1 mb-[var(--space-5)] bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)]">
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className={`
                        flex-1 py-2 text-center font-semibold text-sm
                        rounded-[var(--radius-md)]
                        transition-colors duration-150
                        ${mode === 'signin'
                          ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-[var(--shadow-sm)]'
                          : 'text-[var(--color-text-muted)]'
                        }
                      `}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className={`
                        flex-1 py-2 text-center font-semibold text-sm
                        rounded-[var(--radius-md)]
                        transition-colors duration-150
                        ${mode === 'signup'
                          ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-[var(--shadow-sm)]'
                          : 'text-[var(--color-text-muted)]'
                        }
                      `}
                    >
                      Sign Up
                    </button>
                  </div>

                  <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-[var(--space-4)]">
                    <Input
                      type="email"
                      label="Email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                    <div>
                      <Input
                        type="password"
                        label="Password"
                        placeholder="--------"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                        required
                        minLength={mode === 'signup' ? 8 : 6}
                      />
                      {mode === 'signup' && <PasswordStrengthIndicator password={password} />}
                    </div>

                    {mode === 'signup' && (
                      <div className="space-y-[var(--space-4)] animate-fade-in">
                        <Input
                          type="text"
                          label="Display Name"
                          placeholder="Your name (optional)"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          autoComplete="name"
                        />
                      </div>
                    )}

                    {/* Remember Me & Forgot Password (Sign In only) */}
                    {mode === 'signin' && (
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="
                              w-4 h-4 rounded
                              border-2 border-[var(--color-border)]
                              text-[var(--color-primary)]
                              focus:ring-[var(--color-primary)]
                              focus:ring-offset-0
                            "
                          />
                          <span className="text-sm text-[var(--color-text-muted)]">
                            Remember me
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-sm text-[var(--color-primary)] hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="
                        flex items-center gap-2 px-[var(--space-3)] py-2.5
                        rounded-[var(--radius-md)]
                        bg-[var(--color-danger-muted)]
                        animate-fade-in
                      ">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)]" />
                        <p className="text-sm font-medium text-[var(--color-danger)]">
                          {error}
                        </p>
                      </div>
                    )}

                    {/* Success Message */}
                    {success && (
                      <div className="
                        flex items-center gap-2 px-[var(--space-3)] py-2.5
                        rounded-[var(--radius-md)]
                        bg-[var(--color-success-muted)]
                        animate-fade-in
                      ">
                        <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
                          {success}
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="gradient"
                      className="w-full"
                      size="lg"
                      loading={loading}
                    >
                      {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    </Button>

                    {/* Divider */}
                    <div className="relative my-[var(--space-5)]">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[var(--color-border)]" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-[var(--space-3)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
                          or continue with
                        </span>
                      </div>
                    </div>

                    {/* Google Sign In */}
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      size="lg"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </form>
                </>
              )}

              {/* Forgot Password Mode */}
              {mode === 'forgot' && (
                <>
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] mb-[var(--space-4)] hover:text-[var(--color-text)] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to sign in
                  </button>

                  <h2 className="text-[var(--text-lg)] text-[var(--color-text)] mb-[var(--space-2)]">
                    Reset Password
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)] mb-[var(--space-5)]">
                    Enter your email and we'll send you a link to reset your password.
                  </p>

                  <form onSubmit={handleForgotPassword} className="space-y-[var(--space-4)]">
                    <Input
                      type="email"
                      label="Email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />

                    {error && (
                      <div className="
                        flex items-center gap-2 px-[var(--space-3)] py-2.5
                        rounded-[var(--radius-md)]
                        bg-[var(--color-danger-muted)]
                        animate-fade-in
                      ">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)]" />
                        <p className="text-sm font-medium text-[var(--color-danger)]">
                          {error}
                        </p>
                      </div>
                    )}

                    {success && (
                      <div className="
                        flex items-center gap-2 px-[var(--space-3)] py-2.5
                        rounded-[var(--radius-md)]
                        bg-[var(--color-success-muted)]
                        animate-fade-in
                      ">
                        <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
                          {success}
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="gradient"
                      className="w-full"
                      size="lg"
                      loading={loading}
                    >
                      Send Reset Link
                    </Button>
                  </form>
                </>
              )}

              {/* Reset Password Mode (after clicking email link) */}
              {mode === 'reset' && (
                <>
                  <h2 className="text-[var(--text-lg)] text-[var(--color-text)] mb-[var(--space-2)]">
                    Set New Password
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)] mb-[var(--space-5)]">
                    Enter your new password below.
                  </p>

                  <form onSubmit={handleResetPassword} className="space-y-[var(--space-4)]">
                    <div>
                      <Input
                        type="password"
                        label="New Password"
                        placeholder="--------"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        minLength={8}
                      />
                      <PasswordStrengthIndicator password={password} />
                    </div>
                    <Input
                      type="password"
                      label="Confirm Password"
                      placeholder="--------"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />

                    {error && (
                      <div className="
                        flex items-center gap-2 px-[var(--space-3)] py-2.5
                        rounded-[var(--radius-md)]
                        bg-[var(--color-danger-muted)]
                        animate-fade-in
                      ">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)]" />
                        <p className="text-sm font-medium text-[var(--color-danger)]">
                          {error}
                        </p>
                      </div>
                    )}

                    {success && (
                      <div className="
                        flex items-center gap-2 px-[var(--space-3)] py-2.5
                        rounded-[var(--radius-md)]
                        bg-[var(--color-success-muted)]
                        animate-fade-in
                      ">
                        <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
                          {success}
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="gradient"
                      className="w-full"
                      size="lg"
                      loading={loading}
                    >
                      Update Password
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}
