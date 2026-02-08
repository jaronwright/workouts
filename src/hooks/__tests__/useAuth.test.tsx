import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { useAuthStore } from '@/stores/authStore'

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

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
})
