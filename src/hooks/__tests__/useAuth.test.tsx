import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { useAuthStore } from '@/stores/authStore'

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

// Helper to create a mock state and wire up the useAuthStore mock
function createMockState(overrides: Record<string, unknown> = {}) {
  const defaults = {
    user: null,
    session: null,
    loading: false,
    initialized: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    initialize: vi.fn(),
  }
  return { ...defaults, ...overrides }
}

function setupMockStore(state: Record<string, unknown>) {
  vi.mocked(useAuthStore).mockImplementation((selector) => {
    if (typeof selector === 'function') {
      return selector(state)
    }
    return state
  })
}

describe('useAuth', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }
  const mockSession = { access_token: 'token-123', user: mockUser }
  const mockInitialize = vi.fn()
  const mockSignUp = vi.fn()
  const mockSignIn = vi.fn()
  const mockSignInWithGoogle = vi.fn()
  const mockSignOut = vi.fn()
  const mockResetPassword = vi.fn()
  const mockUpdatePassword = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup mock store selector
    const mockState = {
      user: mockUser,
      session: mockSession,
      loading: false,
      initialized: true,
      signUp: mockSignUp,
      signIn: mockSignIn,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: mockSignOut,
      resetPassword: mockResetPassword,
      updatePassword: mockUpdatePassword,
      initialize: mockInitialize,
    }

    vi.mocked(useAuthStore).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(mockState)
      }
      return mockState
    })
  })

  it('returns user from auth store', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toEqual(mockUser)
  })

  it('returns session from auth store', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.session).toEqual(mockSession)
  })

  it('returns loading state', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(false)
  })

  it('returns initialized state', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.initialized).toBe(true)
  })

  it('calls initialize on mount', () => {
    renderHook(() => useAuth())
    expect(mockInitialize).toHaveBeenCalled()
  })

  it('provides signUp function', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.signUp).toBe(mockSignUp)
  })

  it('provides signIn function', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.signIn).toBe(mockSignIn)
  })

  it('provides signInWithGoogle function', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.signInWithGoogle).toBe(mockSignInWithGoogle)
  })

  it('provides signOut function', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.signOut).toBe(mockSignOut)
  })

  it('provides resetPassword function', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.resetPassword).toBe(mockResetPassword)
  })

  it('provides updatePassword function', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.updatePassword).toBe(mockUpdatePassword)
  })

  it('provides initialize function', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.initialize).toBe(mockInitialize)
  })

  describe('loading states', () => {
    it('reflects loading true from store', () => {
      const mockState = {
        user: null,
        session: null,
        loading: true,
        initialized: false,
        signUp: mockSignUp,
        signIn: mockSignIn,
        signInWithGoogle: mockSignInWithGoogle,
        signOut: mockSignOut,
        resetPassword: mockResetPassword,
        updatePassword: mockUpdatePassword,
        initialize: mockInitialize,
      }

      vi.mocked(useAuthStore).mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(mockState)
        }
        return mockState
      })

      const { result } = renderHook(() => useAuth())
      expect(result.current.loading).toBe(true)
      expect(result.current.initialized).toBe(false)
    })
  })

  describe('unauthenticated state', () => {
    it('returns null user when not authenticated', () => {
      const mockState = {
        user: null,
        session: null,
        loading: false,
        initialized: true,
        signUp: mockSignUp,
        signIn: mockSignIn,
        signInWithGoogle: mockSignInWithGoogle,
        signOut: mockSignOut,
        resetPassword: mockResetPassword,
        updatePassword: mockUpdatePassword,
        initialize: mockInitialize,
      }

      vi.mocked(useAuthStore).mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(mockState)
        }
        return mockState
      })

      const { result } = renderHook(() => useAuth())
      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
    })
  })

  describe('initialize behavior', () => {
    it('calls initialize exactly once on mount', () => {
      renderHook(() => useAuth())
      expect(mockInitialize).toHaveBeenCalledTimes(1)
    })

    it('calls initialize on mount even when not yet initialized', () => {
      const state = createMockState({ initialized: false })
      setupMockStore(state)

      renderHook(() => useAuth())
      expect(state.initialize).toHaveBeenCalledTimes(1)
    })

    it('calls initialize on mount even when already initialized', () => {
      const initFn = vi.fn()
      const state = createMockState({ initialized: true, initialize: initFn })
      setupMockStore(state)

      renderHook(() => useAuth())
      // useEffect always fires on mount; the store's initialize checks internally
      expect(initFn).toHaveBeenCalledTimes(1)
    })

    it('does not call initialize again on re-render if initialize reference is stable', () => {
      const initFn = vi.fn()
      const state = createMockState({ initialized: true, initialize: initFn })
      setupMockStore(state)

      const { rerender } = renderHook(() => useAuth())
      rerender()
      rerender()

      // useEffect with stable dependency only runs once
      expect(initFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('authentication state transitions', () => {
    it('reflects state change from unauthenticated to authenticated', () => {
      // Start unauthenticated
      const unauthState = createMockState({
        user: null,
        session: null,
        loading: false,
        initialized: true,
      })
      setupMockStore(unauthState)

      const { result, rerender } = renderHook(() => useAuth())
      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()

      // Simulate store state change to authenticated
      const authUser = { id: 'user-456', email: 'auth@test.com' }
      const authSession = { access_token: 'new-token', user: authUser }
      const authState = createMockState({
        user: authUser,
        session: authSession,
        loading: false,
        initialized: true,
      })
      setupMockStore(authState)

      rerender()

      expect(result.current.user).toEqual(authUser)
      expect(result.current.session).toEqual(authSession)
    })

    it('reflects state change from authenticated to unauthenticated (sign out)', () => {
      const authUser = { id: 'user-789', email: 'active@test.com' }
      const authSession = { access_token: 'active-token', user: authUser }
      const authState = createMockState({
        user: authUser,
        session: authSession,
        initialized: true,
      })
      setupMockStore(authState)

      const { result, rerender } = renderHook(() => useAuth())
      expect(result.current.user).toEqual(authUser)

      // Simulate sign out
      const signedOutState = createMockState({
        user: null,
        session: null,
        initialized: true,
      })
      setupMockStore(signedOutState)

      rerender()

      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
    })

    it('reflects loading state transition during authentication', () => {
      // Start loading
      const loadingState = createMockState({
        user: null,
        session: null,
        loading: true,
        initialized: false,
      })
      setupMockStore(loadingState)

      const { result, rerender } = renderHook(() => useAuth())
      expect(result.current.loading).toBe(true)
      expect(result.current.initialized).toBe(false)

      // Finish loading with authenticated user
      const authUser = { id: 'user-loaded', email: 'loaded@test.com' }
      const readyState = createMockState({
        user: authUser,
        session: { access_token: 'ready-token', user: authUser },
        loading: false,
        initialized: true,
      })
      setupMockStore(readyState)

      rerender()

      expect(result.current.loading).toBe(false)
      expect(result.current.initialized).toBe(true)
      expect(result.current.user).toEqual(authUser)
    })

    it('reflects user change (e.g., different user signs in)', () => {
      const user1 = { id: 'user-aaa', email: 'aaa@test.com' }
      const state1 = createMockState({
        user: user1,
        session: { access_token: 'token-aaa', user: user1 },
        initialized: true,
      })
      setupMockStore(state1)

      const { result, rerender } = renderHook(() => useAuth())
      expect(result.current.user?.id).toBe('user-aaa')

      const user2 = { id: 'user-bbb', email: 'bbb@test.com' }
      const state2 = createMockState({
        user: user2,
        session: { access_token: 'token-bbb', user: user2 },
        initialized: true,
      })
      setupMockStore(state2)

      rerender()

      expect(result.current.user?.id).toBe('user-bbb')
    })
  })

  describe('return value completeness', () => {
    it('returns all expected properties', () => {
      const { result } = renderHook(() => useAuth())

      const keys = Object.keys(result.current)
      expect(keys).toContain('user')
      expect(keys).toContain('session')
      expect(keys).toContain('loading')
      expect(keys).toContain('initialized')
      expect(keys).toContain('signUp')
      expect(keys).toContain('signIn')
      expect(keys).toContain('signInWithGoogle')
      expect(keys).toContain('signOut')
      expect(keys).toContain('resetPassword')
      expect(keys).toContain('updatePassword')
      expect(keys).toContain('initialize')
    })

    it('does not return extra unexpected properties', () => {
      const { result } = renderHook(() => useAuth())

      const expectedKeys = [
        'user', 'session', 'loading', 'initialized',
        'signUp', 'signIn', 'signInWithGoogle', 'signOut',
        'resetPassword', 'updatePassword', 'initialize',
      ]
      const keys = Object.keys(result.current)
      expect(keys.sort()).toEqual(expectedKeys.sort())
    })
  })

  describe('selector pattern', () => {
    it('calls useAuthStore with a selector function for each field', () => {
      renderHook(() => useAuth())

      // useAuthStore should have been called multiple times (once per selector)
      // The hook uses individual selectors: (s) => s.user, (s) => s.session, etc.
      expect(useAuthStore).toHaveBeenCalled()
      const calls = vi.mocked(useAuthStore).mock.calls
      // Should have at least 11 calls (one per field selected)
      expect(calls.length).toBeGreaterThanOrEqual(11)

      // Each call should receive a function selector
      calls.forEach((call) => {
        expect(typeof call[0]).toBe('function')
      })
    })
  })

  describe('edge cases', () => {
    it('handles user with no email gracefully', () => {
      const noEmailUser = { id: 'user-no-email', email: undefined }
      const state = createMockState({
        user: noEmailUser,
        session: { access_token: 'token', user: noEmailUser },
        initialized: true,
      })
      setupMockStore(state)

      const { result } = renderHook(() => useAuth())
      expect(result.current.user).toEqual(noEmailUser)
      expect(result.current.user?.email).toBeUndefined()
    })

    it('handles session with expired token', () => {
      const expiredSession = {
        access_token: 'expired-token',
        expires_in: 0,
        user: mockUser,
      }
      const state = createMockState({
        user: mockUser,
        session: expiredSession,
        initialized: true,
      })
      setupMockStore(state)

      const { result } = renderHook(() => useAuth())
      expect(result.current.session).toEqual(expiredSession)
    })

    it('returns stable function references from the same render', () => {
      const { result } = renderHook(() => useAuth())

      // All function references should be the same mock references
      expect(result.current.signUp).toBe(mockSignUp)
      expect(result.current.signIn).toBe(mockSignIn)
      expect(result.current.signOut).toBe(mockSignOut)
      expect(result.current.initialize).toBe(mockInitialize)
    })

    it('handles simultaneous loading and initialized being true', () => {
      // This can happen briefly during some transitions
      const state = createMockState({
        user: null,
        session: null,
        loading: true,
        initialized: true,
      })
      setupMockStore(state)

      const { result } = renderHook(() => useAuth())
      expect(result.current.loading).toBe(true)
      expect(result.current.initialized).toBe(true)
    })

    it('handles all state being in pre-initialization state', () => {
      const state = createMockState({
        user: null,
        session: null,
        loading: false,
        initialized: false,
      })
      setupMockStore(state)

      const { result } = renderHook(() => useAuth())
      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.initialized).toBe(false)
    })
  })
})
