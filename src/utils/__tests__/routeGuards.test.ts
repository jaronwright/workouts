/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock zustand persist middleware as a passthrough to avoid localStorage issues in tests
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual<typeof import('zustand/middleware')>('zustand/middleware')
  return {
    ...actual,
    persist: (fn: unknown) => fn,
  }
})

// ──────────────────────────────────────────────────────
// UUID validation edge cases
// ──────────────────────────────────────────────────────

describe('UUID format validation', () => {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  it('accepts valid UUIDs and rejects invalid strings', () => {
    expect(UUID_REGEX.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    expect(UUID_REGEX.test('00000000-0000-0000-0000-000000000001')).toBe(true)
    expect(UUID_REGEX.test('not-a-uuid')).toBe(false)
    expect(UUID_REGEX.test('')).toBe(false)
    expect(UUID_REGEX.test('123')).toBe(false)
  })

  it('rejects wrong length, invalid hex, and injection attempts', () => {
    expect(UUID_REGEX.test('550e8400-e29b-41d4-a716-44665544000')).toBe(false)
    expect(UUID_REGEX.test('550g8400-e29b-41d4-a716-446655440000')).toBe(false)
    expect(UUID_REGEX.test("'; DROP TABLE workout_days;--")).toBe(false)
    expect(UUID_REGEX.test('1 OR 1=1')).toBe(false)
  })
})

// ──────────────────────────────────────────────────────
// Route pattern matching
// ──────────────────────────────────────────────────────

describe('Route pattern matching', () => {
  const routePatterns = [
    { path: '/' }, { path: '/auth' }, { path: '/auth/callback' },
    { path: '/community' },
    { path: '/workout/:dayId', paramName: 'dayId' },
    { path: '/workout/:dayId/active', paramName: 'dayId' },
    { path: '/cardio/:templateId', paramName: 'templateId' },
    { path: '/mobility/:category/select', paramName: 'category' },
    { path: '/mobility/:templateId', paramName: 'templateId' },
    { path: '/history' },
    { path: '/history/:sessionId', paramName: 'sessionId' },
    { path: '/history/cardio/:sessionId', paramName: 'sessionId' },
    { path: '/profile' }, { path: '/schedule' }, { path: '/rest-day' }
  ]

  it('all routes are well-formed and cover main pages', () => {
    for (const route of routePatterns) {
      expect(route.path).toMatch(/^\//)
      expect(route.path).not.toContain('//')
    }
    const expected = ['/', '/community', '/workout', '/cardio', '/mobility', '/history', '/profile', '/schedule', '/rest-day']
    for (const path of expected) {
      expect(routePatterns.some(r => r.path.startsWith(path))).toBe(true)
    }
  })

  it('workout route expects dayId and auth has two distinct routes', () => {
    const route = routePatterns.find(r => r.path === '/workout/:dayId')
    expect(route).toBeDefined()
    expect(route!.paramName).toBe('dayId')

    const authRoutes = routePatterns.filter(r => r.path.startsWith('/auth'))
    expect(authRoutes).toHaveLength(2)
  })
})

// ──────────────────────────────────────────────────────
// Auth callback error handling
// ──────────────────────────────────────────────────────

describe('Auth callback error scenarios', () => {
  it('handles empty hash, missing error_description, and encoded values', () => {
    const empty = new URLSearchParams('')
    expect(empty.get('access_token')).toBeNull()
    expect(empty.get('error')).toBeNull()

    const noDesc = new URLSearchParams('error=server_error')
    expect(noDesc.get('error')).toBe('server_error')
    expect(noDesc.get('error_description')).toBeNull()

    const encoded = new URLSearchParams('error=invalid_request&error_description=The%20request%20is%20missing')
    expect(encoded.get('error_description')).toBe('The request is missing')
  })
})

// ──────────────────────────────────────────────────────
// Auth store state edge cases
// ──────────────────────────────────────────────────────

vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    },
    from: vi.fn()
  }
}))

describe('Auth store state edge cases', () => {
  beforeEach(async () => {
    const { useAuthStore } = await import('@/stores/authStore')
    useAuthStore.setState({ user: null, session: null, loading: false, initialized: false })
  })

  it('uninitialized auth store has correct defaults', async () => {
    const { useAuthStore } = await import('@/stores/authStore')
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.session).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.initialized).toBe(false)
  })

  it('setUser updates and clears user, setLoading and setInitialized reflect changes', async () => {
    const { useAuthStore } = await import('@/stores/authStore')
    const mockUser = { id: 'user-1', email: 'test@example.com' } as any

    useAuthStore.getState().setUser(mockUser)
    expect(useAuthStore.getState().user).toEqual(mockUser)

    useAuthStore.getState().setUser(null)
    expect(useAuthStore.getState().user).toBeNull()

    useAuthStore.getState().setLoading(true)
    expect(useAuthStore.getState().loading).toBe(true)

    useAuthStore.getState().setInitialized(true)
    expect(useAuthStore.getState().initialized).toBe(true)
  })
})

// ──────────────────────────────────────────────────────
// Page key derivation (animation grouping logic in App)
// ──────────────────────────────────────────────────────

describe('Page key derivation', () => {
  function derivePageKey(pathname: string): string {
    return '/' + (pathname.split('/')[1] || '')
  }

  it('groups nested routes under top-level segment and handles empty path', () => {
    expect(derivePageKey('/')).toBe('/')
    expect(derivePageKey('')).toBe('/')
    expect(derivePageKey('/workout/abc-123')).toBe('/workout')
    expect(derivePageKey('/workout/abc-123/active')).toBe('/workout')
    expect(derivePageKey('/history/cardio/some-session')).toBe('/history')
    expect(derivePageKey('/auth/callback')).toBe('/auth')
  })
})
