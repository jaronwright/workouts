import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import { SpinnerGap } from '@phosphor-icons/react'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const setSession = useAuthStore((s) => s.setSession)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash (Supabase adds tokens to the URL)
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          setTimeout(() => navigate('/auth'), 3000)
          return
        }

        if (data.session) {
          setUser(data.session.user)
          setSession(data.session)
          navigate('/')
        } else {
          // No session found, redirect to auth
          navigate('/auth')
        }
      } catch (err) {
        console.error('Unexpected auth callback error:', err)
        setError('An unexpected error occurred')
        setTimeout(() => navigate('/auth'), 3000)
      }
    }

    handleCallback()
  }, [navigate, setUser, setSession])

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-2xl">!</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">
            Authentication Error
          </h1>
          <p className="text-[var(--color-text-muted)]">{error}</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <SpinnerGap className="w-12 h-12 text-[var(--color-primary)] animate-spin mx-auto" />
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          Completing sign in...
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Please wait while we verify your account.
        </p>
      </div>
    </div>
  )
}
