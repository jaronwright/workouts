import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const session = useAuthStore((s) => s.session)
  const loading = useAuthStore((s) => s.loading)
  const initialized = useAuthStore((s) => s.initialized)
  const signUp = useAuthStore((s) => s.signUp)
  const signIn = useAuthStore((s) => s.signIn)
  const signOut = useAuthStore((s) => s.signOut)
  const resetPassword = useAuthStore((s) => s.resetPassword)
  const updatePassword = useAuthStore((s) => s.updatePassword)
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return {
    user,
    session,
    loading,
    initialized,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    initialize
  }
}
