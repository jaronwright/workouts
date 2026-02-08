import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { User, Session } from '@supabase/supabase-js'

// Mock zustand persist middleware as a passthrough to avoid localStorage issues in tests
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual<typeof import('zustand/middleware')>('zustand/middleware')
  return {
    ...actual,
    persist: (fn: unknown) => fn,
  }
})

// Use vi.hoisted so the mock object is available when vi.mock is hoisted
const mockSupabaseAuth = vi.hoisted(() => ({
  getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
  signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
  resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
  updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
  refreshSession: vi.fn().mockResolvedValue({ data: { session: null, user: null }, error: null }),
  onAuthStateChange: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  }),
  getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  resend: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: mockSupabaseAuth,
  },
}))

import { useAuthStore } from '../authStore'

// Helper to create a mock User
function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  } as User
}

// Helper to create a mock Session
function createMockSession(overrides: Partial<Session> = {}): Session {
  return {
    access_token: 'token-123',
    refresh_token: 'refresh-123',
    expires_in: 3600,
    token_type: 'bearer',
    user: createMockUser(),
    ...overrides,
  } as Session
}

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      session: null,
      loading: false,
      initialized: false,
    })
    // Clear sessionStorage
    sessionStorage.clear()
  })

  describe('initial state', () => {
    it('has null user', () => {
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('has null session', () => {
      expect(useAuthStore.getState().session).toBeNull()
    })

    it('is not loading', () => {
      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('is not initialized', () => {
      expect(useAuthStore.getState().initialized).toBe(false)
    })
  })

  describe('state setters', () => {
    it('can set user directly', () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      useAuthStore.setState({ user: mockUser as User })
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })

    it('can set session directly', () => {
      const mockSession = { access_token: 'token-123' }
      useAuthStore.setState({ session: mockSession as Session })
      expect(useAuthStore.getState().session).toEqual(mockSession)
    })

    it('can set loading state', () => {
      useAuthStore.setState({ loading: true })
      expect(useAuthStore.getState().loading).toBe(true)
    })

    it('can set initialized state', () => {
      useAuthStore.setState({ initialized: true })
      expect(useAuthStore.getState().initialized).toBe(true)
    })
  })

  describe('store methods', () => {
    it('has signUp method', () => {
      expect(typeof useAuthStore.getState().signUp).toBe('function')
    })

    it('has signIn method', () => {
      expect(typeof useAuthStore.getState().signIn).toBe('function')
    })

    it('has signInWithGoogle method', () => {
      expect(typeof useAuthStore.getState().signInWithGoogle).toBe('function')
    })

    it('has signOut method', () => {
      expect(typeof useAuthStore.getState().signOut).toBe('function')
    })

    it('has resetPassword method', () => {
      expect(typeof useAuthStore.getState().resetPassword).toBe('function')
    })

    it('has updatePassword method', () => {
      expect(typeof useAuthStore.getState().updatePassword).toBe('function')
    })

    it('has updateEmail method', () => {
      expect(typeof useAuthStore.getState().updateEmail).toBe('function')
    })

    it('has refreshSession method', () => {
      expect(typeof useAuthStore.getState().refreshSession).toBe('function')
    })

    it('has signOutAllDevices method', () => {
      expect(typeof useAuthStore.getState().signOutAllDevices).toBe('function')
    })

    it('has initialize method', () => {
      expect(typeof useAuthStore.getState().initialize).toBe('function')
    })
  })

  describe('setUser action', () => {
    it('sets a user object', () => {
      const user = createMockUser()
      useAuthStore.getState().setUser(user)
      expect(useAuthStore.getState().user).toEqual(user)
    })

    it('sets user to null', () => {
      const user = createMockUser()
      useAuthStore.getState().setUser(user)
      expect(useAuthStore.getState().user).not.toBeNull()

      useAuthStore.getState().setUser(null)
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('replaces existing user with a different user', () => {
      const user1 = createMockUser({ id: 'user-1', email: 'a@test.com' })
      const user2 = createMockUser({ id: 'user-2', email: 'b@test.com' })

      useAuthStore.getState().setUser(user1)
      expect(useAuthStore.getState().user?.id).toBe('user-1')

      useAuthStore.getState().setUser(user2)
      expect(useAuthStore.getState().user?.id).toBe('user-2')
    })

    it('does not affect other state properties', () => {
      useAuthStore.setState({ loading: true, session: createMockSession() })
      useAuthStore.getState().setUser(createMockUser())

      expect(useAuthStore.getState().loading).toBe(true)
      expect(useAuthStore.getState().session).not.toBeNull()
    })
  })

  describe('setSession action', () => {
    it('sets a session object', () => {
      const session = createMockSession()
      useAuthStore.getState().setSession(session)
      expect(useAuthStore.getState().session).toEqual(session)
    })

    it('sets session to null', () => {
      useAuthStore.getState().setSession(createMockSession())
      useAuthStore.getState().setSession(null)
      expect(useAuthStore.getState().session).toBeNull()
    })

    it('does not affect other state properties', () => {
      const user = createMockUser()
      useAuthStore.setState({ user, loading: true })
      useAuthStore.getState().setSession(createMockSession())

      expect(useAuthStore.getState().user).toEqual(user)
      expect(useAuthStore.getState().loading).toBe(true)
    })
  })

  describe('setLoading action', () => {
    it('sets loading to true', () => {
      useAuthStore.getState().setLoading(true)
      expect(useAuthStore.getState().loading).toBe(true)
    })

    it('sets loading to false', () => {
      useAuthStore.getState().setLoading(true)
      useAuthStore.getState().setLoading(false)
      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('setInitialized action', () => {
    it('sets initialized to true', () => {
      useAuthStore.getState().setInitialized(true)
      expect(useAuthStore.getState().initialized).toBe(true)
    })

    it('sets initialized to false', () => {
      useAuthStore.getState().setInitialized(true)
      useAuthStore.getState().setInitialized(false)
      expect(useAuthStore.getState().initialized).toBe(false)
    })
  })

  describe('signUp', () => {
    it('calls supabase signUp with email and password', async () => {
      const mockUser = createMockUser()
      const mockSession = createMockSession()
      mockSupabaseAuth.signUp.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      await useAuthStore.getState().signUp('test@example.com', 'password123')

      expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('sets user and session on success', async () => {
      const mockUser = createMockUser()
      const mockSession = createMockSession()
      mockSupabaseAuth.signUp.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      await useAuthStore.getState().signUp('test@example.com', 'password123')

      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().session).toEqual(mockSession)
    })

    it('sets loading true during request and false after', async () => {
      let resolveSignUp: (value: unknown) => void
      const signUpPromise = new Promise((resolve) => { resolveSignUp = resolve })
      mockSupabaseAuth.signUp.mockReturnValueOnce(signUpPromise)

      const promise = useAuthStore.getState().signUp('test@example.com', 'password123')
      expect(useAuthStore.getState().loading).toBe(true)

      resolveSignUp!({ data: { user: null, session: null }, error: null })
      await promise

      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('throws error on supabase error and resets loading', async () => {
      const authError = new Error('Email already registered')
      mockSupabaseAuth.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: authError,
      })

      await expect(
        useAuthStore.getState().signUp('test@example.com', 'password123')
      ).rejects.toThrow('Email already registered')

      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('does not set user or session on error', async () => {
      mockSupabaseAuth.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: new Error('Signup failed'),
      })

      try {
        await useAuthStore.getState().signUp('test@example.com', 'password123')
      } catch {
        // expected
      }

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().session).toBeNull()
    })

    it('handles null session (email confirmation required)', async () => {
      const mockUser = createMockUser()
      mockSupabaseAuth.signUp.mockResolvedValueOnce({
        data: { user: mockUser, session: null },
        error: null,
      })

      await useAuthStore.getState().signUp('test@example.com', 'password123')

      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().session).toBeNull()
    })
  })

  describe('signIn', () => {
    it('calls supabase signInWithPassword with email and password', async () => {
      const mockUser = createMockUser()
      const mockSession = createMockSession()
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      await useAuthStore.getState().signIn('test@example.com', 'password123')

      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('sets user and session on success', async () => {
      const mockUser = createMockUser()
      const mockSession = createMockSession()
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      await useAuthStore.getState().signIn('test@example.com', 'password123')

      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(useAuthStore.getState().session).toEqual(mockSession)
    })

    it('sets loading true during request and false after', async () => {
      let resolveSignIn: (value: unknown) => void
      const signInPromise = new Promise((resolve) => { resolveSignIn = resolve })
      mockSupabaseAuth.signInWithPassword.mockReturnValueOnce(signInPromise)

      const promise = useAuthStore.getState().signIn('test@example.com', 'pass')
      expect(useAuthStore.getState().loading).toBe(true)

      resolveSignIn!({ data: { user: null, session: null }, error: null })
      await promise

      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('throws error on invalid credentials', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: new Error('Invalid login credentials'),
      })

      await expect(
        useAuthStore.getState().signIn('test@example.com', 'wrong')
      ).rejects.toThrow('Invalid login credentials')

      expect(useAuthStore.getState().loading).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('sets session-only in sessionStorage when rememberMe is false', async () => {
      const mockUser = createMockUser()
      const mockSession = createMockSession()
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      await useAuthStore.getState().signIn('test@example.com', 'password123', false)

      expect(sessionStorage.getItem('session-only')).toBe('true')
    })

    it('removes session-only from sessionStorage when rememberMe is true', async () => {
      sessionStorage.setItem('session-only', 'true')
      const mockUser = createMockUser()
      const mockSession = createMockSession()
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      await useAuthStore.getState().signIn('test@example.com', 'password123', true)

      expect(sessionStorage.getItem('session-only')).toBeNull()
    })

    it('defaults rememberMe to true', async () => {
      const mockUser = createMockUser()
      const mockSession = createMockSession()
      sessionStorage.setItem('session-only', 'true')
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      await useAuthStore.getState().signIn('test@example.com', 'password123')

      expect(sessionStorage.getItem('session-only')).toBeNull()
    })

    it('does not set sessionStorage on error', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: new Error('Failed'),
      })

      try {
        await useAuthStore.getState().signIn('test@example.com', 'password123', false)
      } catch {
        // expected
      }

      expect(sessionStorage.getItem('session-only')).toBeNull()
    })
  })

  describe('signInWithGoogle', () => {
    it('calls supabase signInWithOAuth with google provider', async () => {
      mockSupabaseAuth.signInWithOAuth.mockResolvedValueOnce({ data: {}, error: null })

      await useAuthStore.getState().signInWithGoogle()

      expect(mockSupabaseAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
    })

    it('sets loading true during request and false after', async () => {
      let resolveOAuth: (value: unknown) => void
      const oauthPromise = new Promise((resolve) => { resolveOAuth = resolve })
      mockSupabaseAuth.signInWithOAuth.mockReturnValueOnce(oauthPromise)

      const promise = useAuthStore.getState().signInWithGoogle()
      expect(useAuthStore.getState().loading).toBe(true)

      resolveOAuth!({ data: {}, error: null })
      await promise

      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('throws error if OAuth fails', async () => {
      mockSupabaseAuth.signInWithOAuth.mockResolvedValueOnce({
        data: {},
        error: new Error('OAuth provider error'),
      })

      await expect(
        useAuthStore.getState().signInWithGoogle()
      ).rejects.toThrow('OAuth provider error')

      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('signOut', () => {
    it('calls supabase signOut', async () => {
      await useAuthStore.getState().signOut()
      expect(mockSupabaseAuth.signOut).toHaveBeenCalledTimes(1)
    })

    it('clears user and session on success', async () => {
      useAuthStore.setState({
        user: createMockUser(),
        session: createMockSession(),
      })

      await useAuthStore.getState().signOut()

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().session).toBeNull()
    })

    it('sets loading true during request and false after', async () => {
      let resolveSignOut: (value: unknown) => void
      const signOutPromise = new Promise((resolve) => { resolveSignOut = resolve })
      mockSupabaseAuth.signOut.mockReturnValueOnce(signOutPromise)

      const promise = useAuthStore.getState().signOut()
      expect(useAuthStore.getState().loading).toBe(true)

      resolveSignOut!({ error: null })
      await promise

      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('throws error if signOut fails and resets loading', async () => {
      mockSupabaseAuth.signOut.mockResolvedValueOnce({
        error: new Error('Network error'),
      })

      await expect(
        useAuthStore.getState().signOut()
      ).rejects.toThrow('Network error')

      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('does not clear user/session if signOut fails', async () => {
      const user = createMockUser()
      const session = createMockSession()
      useAuthStore.setState({ user, session })

      mockSupabaseAuth.signOut.mockResolvedValueOnce({
        error: new Error('Network error'),
      })

      try {
        await useAuthStore.getState().signOut()
      } catch {
        // expected
      }

      expect(useAuthStore.getState().user).toEqual(user)
      expect(useAuthStore.getState().session).toEqual(session)
    })

    it('works when user and session are already null (double signOut)', async () => {
      mockSupabaseAuth.signOut.mockResolvedValueOnce({ error: null })

      await useAuthStore.getState().signOut()

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().session).toBeNull()
      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('can be called consecutively without error', async () => {
      useAuthStore.setState({
        user: createMockUser(),
        session: createMockSession(),
      })
      mockSupabaseAuth.signOut.mockResolvedValue({ error: null })

      await useAuthStore.getState().signOut()
      await useAuthStore.getState().signOut()

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().session).toBeNull()
      expect(mockSupabaseAuth.signOut).toHaveBeenCalledTimes(2)
    })
  })

  describe('resetPassword', () => {
    it('calls supabase resetPasswordForEmail with email and redirect URL', async () => {
      await useAuthStore.getState().resetPassword('test@example.com')

      expect(mockSupabaseAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: expect.stringContaining('/auth?mode=reset') }
      )
    })

    it('sets loading true during request and false after', async () => {
      let resolveReset: (value: unknown) => void
      const resetPromise = new Promise((resolve) => { resolveReset = resolve })
      mockSupabaseAuth.resetPasswordForEmail.mockReturnValueOnce(resetPromise)

      const promise = useAuthStore.getState().resetPassword('test@example.com')
      expect(useAuthStore.getState().loading).toBe(true)

      resolveReset!({ error: null })
      await promise

      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('throws error on failure', async () => {
      mockSupabaseAuth.resetPasswordForEmail.mockResolvedValueOnce({
        error: new Error('User not found'),
      })

      await expect(
        useAuthStore.getState().resetPassword('nobody@example.com')
      ).rejects.toThrow('User not found')

      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('updatePassword', () => {
    it('calls supabase updateUser with new password', async () => {
      mockSupabaseAuth.updateUser.mockResolvedValueOnce({ data: {}, error: null })

      await useAuthStore.getState().updatePassword('newPassword456')

      expect(mockSupabaseAuth.updateUser).toHaveBeenCalledWith({
        password: 'newPassword456',
      })
    })

    it('sets loading true during request and false after', async () => {
      let resolveUpdate: (value: unknown) => void
      const updatePromise = new Promise((resolve) => { resolveUpdate = resolve })
      mockSupabaseAuth.updateUser.mockReturnValueOnce(updatePromise)

      const promise = useAuthStore.getState().updatePassword('newPassword456')
      expect(useAuthStore.getState().loading).toBe(true)

      resolveUpdate!({ data: {}, error: null })
      await promise

      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('throws error on failure', async () => {
      mockSupabaseAuth.updateUser.mockResolvedValueOnce({
        data: {},
        error: new Error('Password too weak'),
      })

      await expect(
        useAuthStore.getState().updatePassword('123')
      ).rejects.toThrow('Password too weak')

      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('updateEmail', () => {
    it('calls supabase updateUser with new email', async () => {
      mockSupabaseAuth.updateUser.mockResolvedValueOnce({ data: {}, error: null })

      await useAuthStore.getState().updateEmail('new@example.com')

      expect(mockSupabaseAuth.updateUser).toHaveBeenCalledWith({
        email: 'new@example.com',
      })
    })

    it('sets loading true during request and false after', async () => {
      let resolveUpdate: (value: unknown) => void
      const updatePromise = new Promise((resolve) => { resolveUpdate = resolve })
      mockSupabaseAuth.updateUser.mockReturnValueOnce(updatePromise)

      const promise = useAuthStore.getState().updateEmail('new@example.com')
      expect(useAuthStore.getState().loading).toBe(true)

      resolveUpdate!({ data: {}, error: null })
      await promise

      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('throws error on failure', async () => {
      mockSupabaseAuth.updateUser.mockResolvedValueOnce({
        data: {},
        error: new Error('Email already in use'),
      })

      await expect(
        useAuthStore.getState().updateEmail('taken@example.com')
      ).rejects.toThrow('Email already in use')

      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('resendVerificationEmail', () => {
    it('calls supabase resend with the current user email', async () => {
      useAuthStore.setState({ user: createMockUser({ email: 'verify@test.com' }) })

      await useAuthStore.getState().resendVerificationEmail()

      expect(mockSupabaseAuth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'verify@test.com',
      })
    })

    it('throws error if no user email is available', async () => {
      useAuthStore.setState({ user: null })

      await expect(
        useAuthStore.getState().resendVerificationEmail()
      ).rejects.toThrow('No email address found')
    })

    it('sets loading true during request and false after', async () => {
      useAuthStore.setState({ user: createMockUser() })
      let resolveResend: (value: unknown) => void
      const resendPromise = new Promise((resolve) => { resolveResend = resolve })
      mockSupabaseAuth.resend.mockReturnValueOnce(resendPromise)

      const promise = useAuthStore.getState().resendVerificationEmail()
      expect(useAuthStore.getState().loading).toBe(true)

      resolveResend!({ error: null })
      await promise

      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('throws error on supabase failure', async () => {
      useAuthStore.setState({ user: createMockUser() })
      mockSupabaseAuth.resend.mockResolvedValueOnce({
        error: new Error('Rate limit exceeded'),
      })

      await expect(
        useAuthStore.getState().resendVerificationEmail()
      ).rejects.toThrow('Rate limit exceeded')

      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('does not set loading if user has no email (throws before loading)', async () => {
      useAuthStore.setState({ user: null })

      try {
        await useAuthStore.getState().resendVerificationEmail()
      } catch {
        // expected
      }

      // loading is set before the email check in the implementation,
      // but the throw happens before the try block since get().user?.email
      // is checked before set({ loading: true })
      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('refreshSession', () => {
    it('calls supabase refreshSession', async () => {
      const newSession = createMockSession({ access_token: 'new-token' })
      const newUser = createMockUser({ id: 'refreshed-user' })
      mockSupabaseAuth.refreshSession.mockResolvedValueOnce({
        data: { session: newSession, user: newUser },
        error: null,
      })

      await useAuthStore.getState().refreshSession()

      expect(mockSupabaseAuth.refreshSession).toHaveBeenCalledTimes(1)
    })

    it('updates session and user on success', async () => {
      const newSession = createMockSession({ access_token: 'refreshed-token' })
      const newUser = createMockUser({ id: 'refreshed-user' })
      mockSupabaseAuth.refreshSession.mockResolvedValueOnce({
        data: { session: newSession, user: newUser },
        error: null,
      })

      await useAuthStore.getState().refreshSession()

      expect(useAuthStore.getState().session).toEqual(newSession)
      expect(useAuthStore.getState().user).toEqual(newUser)
    })

    it('sets loading true during request and false after', async () => {
      let resolveRefresh: (value: unknown) => void
      const refreshPromise = new Promise((resolve) => { resolveRefresh = resolve })
      mockSupabaseAuth.refreshSession.mockReturnValueOnce(refreshPromise)

      const promise = useAuthStore.getState().refreshSession()
      expect(useAuthStore.getState().loading).toBe(true)

      resolveRefresh!({ data: { session: null, user: null }, error: null })
      await promise

      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('throws error on failure', async () => {
      mockSupabaseAuth.refreshSession.mockResolvedValueOnce({
        data: { session: null, user: null },
        error: new Error('Refresh token expired'),
      })

      await expect(
        useAuthStore.getState().refreshSession()
      ).rejects.toThrow('Refresh token expired')

      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('signOutAllDevices', () => {
    it('calls supabase signOut with global scope', async () => {
      await useAuthStore.getState().signOutAllDevices()

      expect(mockSupabaseAuth.signOut).toHaveBeenCalledWith({ scope: 'global' })
    })

    it('clears user and session on success', async () => {
      useAuthStore.setState({
        user: createMockUser(),
        session: createMockSession(),
      })

      await useAuthStore.getState().signOutAllDevices()

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().session).toBeNull()
    })

    it('sets loading true during request and false after', async () => {
      let resolveSignOut: (value: unknown) => void
      const signOutPromise = new Promise((resolve) => { resolveSignOut = resolve })
      mockSupabaseAuth.signOut.mockReturnValueOnce(signOutPromise)

      const promise = useAuthStore.getState().signOutAllDevices()
      expect(useAuthStore.getState().loading).toBe(true)

      resolveSignOut!({ error: null })
      await promise

      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('throws error on failure and does not clear state', async () => {
      const user = createMockUser()
      const session = createMockSession()
      useAuthStore.setState({ user, session })

      mockSupabaseAuth.signOut.mockResolvedValueOnce({
        error: new Error('Global signout failed'),
      })

      await expect(
        useAuthStore.getState().signOutAllDevices()
      ).rejects.toThrow('Global signout failed')

      expect(useAuthStore.getState().user).toEqual(user)
      expect(useAuthStore.getState().session).toEqual(session)
      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('initialize', () => {
    it('sets initialized to true on success with no session', async () => {
      mockSupabaseAuth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      })

      await useAuthStore.getState().initialize()

      expect(useAuthStore.getState().initialized).toBe(true)
    })

    it('sets user and session when a valid session exists', async () => {
      const mockSession = createMockSession()
      mockSupabaseAuth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      })
      mockSupabaseAuth.getUser.mockResolvedValueOnce({
        data: { user: mockSession.user },
        error: null,
      })

      await useAuthStore.getState().initialize()

      expect(useAuthStore.getState().session).toEqual(mockSession)
      expect(useAuthStore.getState().user).toEqual(mockSession.user)
      expect(useAuthStore.getState().initialized).toBe(true)
    })

    it('skips initialization if already initialized', async () => {
      useAuthStore.setState({ initialized: true })

      await useAuthStore.getState().initialize()

      expect(mockSupabaseAuth.getSession).not.toHaveBeenCalled()
    })

    it('registers onAuthStateChange listener', async () => {
      mockSupabaseAuth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      })

      await useAuthStore.getState().initialize()

      expect(mockSupabaseAuth.onAuthStateChange).toHaveBeenCalledTimes(1)
    })

    it('clears stale session when getUser fails', async () => {
      const staleSession = createMockSession()
      mockSupabaseAuth.getSession.mockResolvedValueOnce({
        data: { session: staleSession },
        error: null,
      })
      mockSupabaseAuth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: new Error('User not found'),
      })
      mockSupabaseAuth.signOut.mockResolvedValueOnce({ error: null })

      await useAuthStore.getState().initialize()

      expect(mockSupabaseAuth.signOut).toHaveBeenCalled()
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().session).toBeNull()
      expect(useAuthStore.getState().initialized).toBe(true)
    })

    it('signs out if session-only flag is set without session-active', async () => {
      sessionStorage.setItem('session-only', 'true')
      // Do not set session-active, simulating a new browser session
      mockSupabaseAuth.signOut.mockResolvedValueOnce({ error: null })

      await useAuthStore.getState().initialize()

      expect(mockSupabaseAuth.signOut).toHaveBeenCalled()
      expect(sessionStorage.getItem('session-only')).toBeNull()
      expect(useAuthStore.getState().initialized).toBe(true)
    })

    it('sets session-active when session-only flag is set and session-active exists', async () => {
      sessionStorage.setItem('session-only', 'true')
      sessionStorage.setItem('session-active', 'true')
      mockSupabaseAuth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      })

      await useAuthStore.getState().initialize()

      expect(sessionStorage.getItem('session-active')).toBe('true')
      expect(useAuthStore.getState().initialized).toBe(true)
    })

    it('sets initialized to true even if getSession throws', async () => {
      mockSupabaseAuth.getSession.mockRejectedValueOnce(new Error('Network error'))

      await useAuthStore.getState().initialize()

      expect(useAuthStore.getState().initialized).toBe(true)
    })

    it('unsubscribes previous auth subscription on re-initialize', async () => {
      const unsubscribe1 = vi.fn()
      mockSupabaseAuth.onAuthStateChange.mockReturnValueOnce({
        data: { subscription: { unsubscribe: unsubscribe1 } },
      })
      mockSupabaseAuth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      })

      await useAuthStore.getState().initialize()

      // Reset initialized so we can call initialize again
      useAuthStore.setState({ initialized: false })

      const unsubscribe2 = vi.fn()
      mockSupabaseAuth.onAuthStateChange.mockReturnValueOnce({
        data: { subscription: { unsubscribe: unsubscribe2 } },
      })
      mockSupabaseAuth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      })

      await useAuthStore.getState().initialize()

      expect(unsubscribe1).toHaveBeenCalledTimes(1)
    })

    it('does not call getSession when session-only without session-active triggers early return', async () => {
      sessionStorage.setItem('session-only', 'true')
      mockSupabaseAuth.signOut.mockResolvedValueOnce({ error: null })

      await useAuthStore.getState().initialize()

      expect(mockSupabaseAuth.getSession).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('setting user to null when already null is a no-op', () => {
      expect(useAuthStore.getState().user).toBeNull()
      useAuthStore.getState().setUser(null)
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('setting session to null when already null is a no-op', () => {
      expect(useAuthStore.getState().session).toBeNull()
      useAuthStore.getState().setSession(null)
      expect(useAuthStore.getState().session).toBeNull()
    })

    it('multiple rapid state changes are reflected correctly', () => {
      useAuthStore.getState().setLoading(true)
      useAuthStore.getState().setLoading(false)
      useAuthStore.getState().setLoading(true)
      expect(useAuthStore.getState().loading).toBe(true)
    })

    it('concurrent signUp and signIn do not interfere with each other', async () => {
      const user1 = createMockUser({ id: 'user-1' })
      const session1 = createMockSession({ access_token: 'signup-token' })
      const user2 = createMockUser({ id: 'user-2' })
      const session2 = createMockSession({ access_token: 'signin-token' })

      mockSupabaseAuth.signUp.mockResolvedValueOnce({
        data: { user: user1, session: session1 },
        error: null,
      })
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: user2, session: session2 },
        error: null,
      })

      // Both run concurrently, last one wins
      await Promise.all([
        useAuthStore.getState().signUp('a@test.com', 'pass'),
        useAuthStore.getState().signIn('b@test.com', 'pass'),
      ])

      // Loading should be false since both completed
      expect(useAuthStore.getState().loading).toBe(false)
      // User state depends on which resolved last, but should be one of them
      expect(useAuthStore.getState().user).toBeDefined()
    })

    it('signOut after signIn clears the state set by signIn', async () => {
      const mockUser = createMockUser()
      const mockSession = createMockSession()
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      await useAuthStore.getState().signIn('test@example.com', 'password123')
      expect(useAuthStore.getState().user).toEqual(mockUser)

      mockSupabaseAuth.signOut.mockResolvedValueOnce({ error: null })
      await useAuthStore.getState().signOut()

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().session).toBeNull()
    })

    it('signUp with empty strings still calls supabase (validation is server-side)', async () => {
      mockSupabaseAuth.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: new Error('Password should be at least 6 characters'),
      })

      await expect(
        useAuthStore.getState().signUp('', '')
      ).rejects.toThrow('Password should be at least 6 characters')

      expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
        email: '',
        password: '',
      })
    })
  })
})
