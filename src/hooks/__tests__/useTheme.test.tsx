import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock zustand persist middleware as a passthrough to avoid localStorage issues in tests
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual<typeof import('zustand/middleware')>('zustand/middleware')
  return {
    ...actual,
    persist: (fn: unknown) => fn,
  }
})

// Mock useProfile and useUpdateProfile to avoid Supabase calls
vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({ data: null, isLoading: false }),
  useUpdateProfile: () => ({ mutate: vi.fn() }),
}))

import { useTheme } from '../useTheme'
import { useThemeStore } from '@/stores/themeStore'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useTheme', () => {
  beforeEach(() => {
    // Reset store to default state
    useThemeStore.setState({
      theme: 'system',
      resolvedTheme: 'light',
    })
  })

  describe('theme state', () => {
    it('returns current theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() })
      expect(result.current.theme).toBe('system')
    })

    it('returns resolved theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() })
      expect(result.current.resolvedTheme).toBe('light')
    })

    it('returns isDark based on resolved theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() })
      expect(result.current.isDark).toBe(false)

      act(() => {
        useThemeStore.setState({ resolvedTheme: 'dark' })
      })

      expect(result.current.isDark).toBe(true)
    })
  })

  describe('setTheme', () => {
    it('sets theme to light', () => {
      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() })

      act(() => {
        result.current.setTheme('light')
      })

      expect(useThemeStore.getState().theme).toBe('light')
    })

    it('sets theme to dark', () => {
      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() })

      act(() => {
        result.current.setTheme('dark')
      })

      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('sets theme to system', () => {
      useThemeStore.setState({ theme: 'dark' })
      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() })

      act(() => {
        result.current.setTheme('system')
      })

      expect(useThemeStore.getState().theme).toBe('system')
    })
  })

  describe('toggleTheme', () => {
    it('cycles from light to dark', () => {
      useThemeStore.setState({ theme: 'light' })
      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() })

      act(() => {
        result.current.toggleTheme()
      })

      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('cycles from dark to system', () => {
      useThemeStore.setState({ theme: 'dark' })
      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() })

      act(() => {
        result.current.toggleTheme()
      })

      expect(useThemeStore.getState().theme).toBe('system')
    })

    it('cycles from system to light', () => {
      useThemeStore.setState({ theme: 'system' })
      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() })

      act(() => {
        result.current.toggleTheme()
      })

      expect(useThemeStore.getState().theme).toBe('light')
    })

    it('completes full cycle', () => {
      useThemeStore.setState({ theme: 'light' })
      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() })

      act(() => {
        result.current.toggleTheme() // light -> dark
      })
      expect(useThemeStore.getState().theme).toBe('dark')

      act(() => {
        result.current.toggleTheme() // dark -> system
      })
      expect(useThemeStore.getState().theme).toBe('system')

      act(() => {
        result.current.toggleTheme() // system -> light
      })
      expect(useThemeStore.getState().theme).toBe('light')
    })
  })

  describe('initializeTheme', () => {
    it('provides initializeTheme function', () => {
      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() })
      expect(typeof result.current.initializeTheme).toBe('function')
    })
  })
})
