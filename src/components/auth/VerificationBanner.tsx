import { useState } from 'react'
import { Envelope, X, ArrowClockwise } from '@phosphor-icons/react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'

export function VerificationBanner() {
  const user = useAuthStore((s) => s.user)
  const resendVerificationEmail = useAuthStore((s) => s.resendVerificationEmail)
  const refreshSession = useAuthStore((s) => s.refreshSession)
  const { success, error } = useToast()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Don't show if no user, user is verified, or banner was dismissed
  if (!user || user.email_confirmed_at || isDismissed) {
    return null
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await resendVerificationEmail()
      success('Verification email sent! Check your inbox.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send verification email'
      error(message)
    } finally {
      setIsResending(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshSession()
      // If still not verified after refresh, show message
      const currentUser = useAuthStore.getState().user
      if (currentUser && !currentUser.email_confirmed_at) {
        error('Email not yet verified. Please check your inbox.')
      } else {
        success('Email verified! Welcome!')
      }
    } catch {
      error('Failed to refresh session')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="
      bg-[var(--color-warning-muted)] border-b border-[var(--color-warning)]/20
      px-4 py-3
    ">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <Envelope className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0" />
        <p className="flex-1 text-sm text-[var(--color-warning)]">
          Please verify your email address. Check your inbox for a verification link.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResend}
            disabled={isResending}
            className="
              text-xs font-medium text-[var(--color-warning)]
              hover:underline disabled:opacity-50
              flex items-center gap-1
            "
          >
            {isResending && <ArrowClockwise className="w-3 h-3 animate-spin" />}
            Resend
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="
              text-xs font-medium text-[var(--color-warning)]
              hover:underline disabled:opacity-50
              flex items-center gap-1
            "
          >
            {isRefreshing && <ArrowClockwise className="w-3 h-3 animate-spin" />}
            I've verified
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="
              p-1 rounded
              text-[var(--color-warning)] hover:bg-[var(--color-warning)]/20
              transition-colors
            "
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
