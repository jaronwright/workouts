import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock zustand persist middleware as a passthrough to avoid localStorage issues in tests
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual<typeof import('zustand/middleware')>('zustand/middleware')
  return {
    ...actual,
    persist: (fn: unknown) => fn,
  }
})

import { useThemeStore, _resetThemeListenerForTesting } from '../themeStore'

describe('themeStore comprehensive', () => {
  beforeEach(() => {
    // Reset store to known state
    useThemeStore.setState({
      theme: 'dark',
      resolvedTheme: 'dark'
    })
    // Clear any added classes
    document.documentElement.classList.remove('dark')
    // Reset listener guard so tests can verify addEventListener
    _resetThemeListenerForTesting()
  })

  describe('setThemeFromProfile', () => {
    it('sets theme to light when profile has "light"', () => {
      useThemeStore.getState().setThemeFromProfile('light')

      const state = useThemeStore.getState()
      expect(state.theme).toBe('light')
      expect(state.resolvedTheme).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('sets theme to dark when profile has "dark"', () => {
      // Start from light so we can verify it switches
      useThemeStore.setState({ theme: 'light', resolvedTheme: 'light' })
      document.documentElement.classList.remove('dark')

      useThemeStore.getState().setThemeFromProfile('dark')

      const state = useThemeStore.getState()
      expect(state.theme).toBe('dark')
      expect(state.resolvedTheme).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('sets theme to system when profile has "system"', () => {
      // Mock matchMedia to return light mode
      vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      useThemeStore.getState().setThemeFromProfile('system')

      const state = useThemeStore.getState()
      expect(state.theme).toBe('system')
      expect(state.resolvedTheme).toBe('light')
    })

    it('sets theme to system and resolves dark when system prefers dark', () => {
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

      useThemeStore.getState().setThemeFromProfile('system')

      const state = useThemeStore.getState()
      expect(state.theme).toBe('system')
      expect(state.resolvedTheme).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('defaults to dark when profile theme is null', () => {
      useThemeStore.setState({ theme: 'light', resolvedTheme: 'light' })

      useThemeStore.getState().setThemeFromProfile(null)

      const state = useThemeStore.getState()
      expect(state.theme).toBe('dark')
      expect(state.resolvedTheme).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('defaults to dark when profile theme is an invalid string', () => {
      useThemeStore.setState({ theme: 'light', resolvedTheme: 'light' })

      useThemeStore.getState().setThemeFromProfile('banana')

      const state = useThemeStore.getState()
      expect(state.theme).toBe('dark')
      expect(state.resolvedTheme).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('defaults to dark when profile theme is empty string', () => {
      useThemeStore.setState({ theme: 'light', resolvedTheme: 'light' })

      useThemeStore.getState().setThemeFromProfile('')

      const state = useThemeStore.getState()
      expect(state.theme).toBe('dark')
      expect(state.resolvedTheme).toBe('dark')
    })
  })

  describe('initializeTheme listener guard', () => {
    it('only attaches one listener across multiple initializeTheme calls', () => {
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

      // Call initializeTheme three times
      useThemeStore.getState().initializeTheme()
      useThemeStore.getState().initializeTheme()
      useThemeStore.getState().initializeTheme()

      // addEventListener should only have been called once
      expect(addEventListenerSpy).toHaveBeenCalledTimes(1)
      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('attaches listener again after _resetThemeListenerForTesting', () => {
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
      expect(addEventListenerSpy).toHaveBeenCalledTimes(1)

      // Reset and reinitialize
      _resetThemeListenerForTesting()
      useThemeStore.getState().initializeTheme()
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('applyTheme behavior', () => {
    it('adds dark class when theme is set to dark', () => {
      document.documentElement.classList.remove('dark')

      useThemeStore.getState().setTheme('dark')

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('removes dark class when theme is set to light', () => {
      document.documentElement.classList.add('dark')

      useThemeStore.getState().setTheme('light')

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('adds dark class via initializeTheme when theme is dark', () => {
      useThemeStore.setState({ theme: 'dark' })
      document.documentElement.classList.remove('dark')

      useThemeStore.getState().initializeTheme()

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('removes dark class via initializeTheme when theme is light', () => {
      useThemeStore.setState({ theme: 'light' })
      document.documentElement.classList.add('dark')

      useThemeStore.getState().initializeTheme()

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('resolves system theme and applies class via initializeTheme', () => {
      // System prefers light
      vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      useThemeStore.setState({ theme: 'system' })
      document.documentElement.classList.add('dark')

      useThemeStore.getState().initializeTheme()

      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(useThemeStore.getState().resolvedTheme).toBe('light')
    })
  })

  describe('theme cycle', () => {
    it('cycles through light -> dark -> system -> light', () => {
      // Mock system to resolve as light
      vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      // Start with light
      useThemeStore.getState().setTheme('light')
      expect(useThemeStore.getState().theme).toBe('light')
      expect(useThemeStore.getState().resolvedTheme).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)

      // Switch to dark
      useThemeStore.getState().setTheme('dark')
      expect(useThemeStore.getState().theme).toBe('dark')
      expect(useThemeStore.getState().resolvedTheme).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      // Switch to system (resolves to light based on our mock)
      useThemeStore.getState().setTheme('system')
      expect(useThemeStore.getState().theme).toBe('system')
      expect(useThemeStore.getState().resolvedTheme).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)

      // Back to light
      useThemeStore.getState().setTheme('light')
      expect(useThemeStore.getState().theme).toBe('light')
      expect(useThemeStore.getState().resolvedTheme).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('cycles with system resolving to dark', () => {
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

      // light -> dark -> system (dark) -> light
      useThemeStore.getState().setTheme('light')
      expect(useThemeStore.getState().resolvedTheme).toBe('light')

      useThemeStore.getState().setTheme('dark')
      expect(useThemeStore.getState().resolvedTheme).toBe('dark')

      useThemeStore.getState().setTheme('system')
      expect(useThemeStore.getState().theme).toBe('system')
      expect(useThemeStore.getState().resolvedTheme).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      useThemeStore.getState().setTheme('light')
      expect(useThemeStore.getState().resolvedTheme).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })
})
