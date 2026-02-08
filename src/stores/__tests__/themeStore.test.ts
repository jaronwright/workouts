import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock zustand persist middleware as a passthrough to avoid localStorage issues in tests
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual<typeof import('zustand/middleware')>('zustand/middleware')
  return {
    ...actual,
    persist: (fn: unknown) => fn,
  }
})

import { useThemeStore } from '../themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    // Reset store state
    useThemeStore.setState({
      theme: 'system',
      resolvedTheme: 'light'
    })
    // Clear any added classes
    document.documentElement.classList.remove('dark')
  })

  describe('setTheme', () => {
    it('sets theme to light', () => {
      useThemeStore.getState().setTheme('light')

      const state = useThemeStore.getState()
      expect(state.theme).toBe('light')
      expect(state.resolvedTheme).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('sets theme to dark', () => {
      useThemeStore.getState().setTheme('dark')

      const state = useThemeStore.getState()
      expect(state.theme).toBe('dark')
      expect(state.resolvedTheme).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('sets theme to system and resolves based on media query', () => {
      // Mock matchMedia to return dark mode
      vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      useThemeStore.getState().setTheme('system')

      const state = useThemeStore.getState()
      expect(state.theme).toBe('system')
      expect(state.resolvedTheme).toBe('dark')
    })
  })

  describe('initializeTheme', () => {
    it('applies the stored theme on initialization', () => {
      useThemeStore.setState({ theme: 'dark', resolvedTheme: 'light' })

      useThemeStore.getState().initializeTheme()

      expect(useThemeStore.getState().resolvedTheme).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('sets up media query listener for system theme', () => {
      const addEventListenerSpy = vi.fn()
      vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: addEventListenerSpy,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      useThemeStore.setState({ theme: 'system' })
      useThemeStore.getState().initializeTheme()

      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })
})
