import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase auth before importing the store
vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
      refreshSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  },
}))

import { useAuthStore } from '../authStore'

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
      useAuthStore.setState({ user: mockUser as any })
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })

    it('can set session directly', () => {
      const mockSession = { access_token: 'token-123' }
      useAuthStore.setState({ session: mockSession as any })
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
})
