import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'

let authSubscription: { unsubscribe: () => void } | null = null

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateEmail: (newEmail: string) => Promise<void>
  resendVerificationEmail: () => Promise<void>
  refreshSession: () => Promise<void>
  signOutAllDevices: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: false,
      initialized: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),

      signUp: async (email, password) => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password
          })
          if (error) throw error
          set({ user: data.user, session: data.session })
        } finally {
          set({ loading: false })
        }
      },

      signIn: async (email, password, rememberMe = true) => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          if (error) throw error

          // If rememberMe is false, we'll store a flag to clear session on browser close
          // Note: Supabase handles session persistence, but we can override behavior
          if (!rememberMe) {
            sessionStorage.setItem('session-only', 'true')
          } else {
            sessionStorage.removeItem('session-only')
          }

          set({ user: data.user, session: data.session })
        } finally {
          set({ loading: false })
        }
      },

      signInWithGoogle: async () => {
        set({ loading: true })
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent'
              }
            }
          })
          if (error) throw error
          // Note: User will be redirected to Google, then back to /auth/callback
          // The initialize() function will pick up the session after redirect
        } finally {
          set({ loading: false })
        }
      },

      signOut: async () => {
        set({ loading: true })
        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          set({ user: null, session: null })
        } finally {
          set({ loading: false })
        }
      },

      resetPassword: async (email: string) => {
        set({ loading: true })
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth?mode=reset`
          })
          if (error) throw error
        } finally {
          set({ loading: false })
        }
      },

      updatePassword: async (newPassword: string) => {
        set({ loading: true })
        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword
          })
          if (error) throw error
        } finally {
          set({ loading: false })
        }
      },

      updateEmail: async (newEmail: string) => {
        set({ loading: true })
        try {
          const { error } = await supabase.auth.updateUser({
            email: newEmail
          })
          if (error) throw error
        } finally {
          set({ loading: false })
        }
      },

      resendVerificationEmail: async () => {
        const email = get().user?.email
        if (!email) throw new Error('No email address found')

        set({ loading: true })
        try {
          const { error } = await supabase.auth.resend({
            type: 'signup',
            email
          })
          if (error) throw error
        } finally {
          set({ loading: false })
        }
      },

      refreshSession: async () => {
        set({ loading: true })
        try {
          const { data, error } = await supabase.auth.refreshSession()
          if (error) throw error
          set({
            session: data.session,
            user: data.user
          })
        } finally {
          set({ loading: false })
        }
      },

      signOutAllDevices: async () => {
        set({ loading: true })
        try {
          const { error } = await supabase.auth.signOut({ scope: 'global' })
          if (error) throw error
          set({ user: null, session: null })
        } finally {
          set({ loading: false })
        }
      },

      initialize: async () => {
        if (get().initialized) return

        try {
          // Check if this is a session-only login (remember me was unchecked)
          // If so and we're starting fresh (no sessionStorage marker from this session),
          // clear the persisted session
          const sessionOnly = sessionStorage.getItem('session-only')
          const sessionActive = sessionStorage.getItem('session-active')

          // If session-only was set but this is a new browser session, clear auth
          if (sessionOnly === 'true' && !sessionActive) {
            await supabase.auth.signOut()
            sessionStorage.removeItem('session-only')
            set({ initialized: true })
            return
          }

          // Mark this session as active
          if (sessionOnly === 'true') {
            sessionStorage.setItem('session-active', 'true')
          }

          // Register auth listener FIRST to avoid missing events during getSession()
          if (authSubscription) {
            authSubscription.unsubscribe()
          }
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            set({
              session,
              user: session?.user ?? null
            })
          })
          authSubscription = subscription

          const { data: { session } } = await supabase.auth.getSession()
          set({
            session,
            user: session?.user ?? null,
            initialized: true
          })
        } catch {
          set({ initialized: true })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session
      })
    }
  )
)
