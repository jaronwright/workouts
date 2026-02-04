import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from '../useTheme'
import { useThemeStore } from '@/stores/themeStore'

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
      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('system')
    })

    it('returns resolved theme', () => {
      const { result } = renderHook(() => useTheme())
      expect(result.current.resolvedTheme).toBe('light')
    })

    it('returns isDark based on resolved theme', () => {
      const { result } = renderHook(() => useTheme())
      expect(result.current.isDark).toBe(false)

      act(() => {
        useThemeStore.setState({ resolvedTheme: 'dark' })
      })

      expect(result.current.isDark).toBe(true)
    })
  })

  describe('setTheme', () => {
    it('sets theme to light', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setTheme('light')
      })

      expect(useThemeStore.getState().theme).toBe('light')
    })

    it('sets theme to dark', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setTheme('dark')
      })

      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('sets theme to system', () => {
      useThemeStore.setState({ theme: 'dark' })
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setTheme('system')
      })

      expect(useThemeStore.getState().theme).toBe('system')
    })
  })

  describe('toggleTheme', () => {
    it('cycles from light to dark', () => {
      useThemeStore.setState({ theme: 'light' })
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('cycles from dark to system', () => {
      useThemeStore.setState({ theme: 'dark' })
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      expect(useThemeStore.getState().theme).toBe('system')
    })

    it('cycles from system to light', () => {
      useThemeStore.setState({ theme: 'system' })
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      expect(useThemeStore.getState().theme).toBe('light')
    })

    it('completes full cycle', () => {
      useThemeStore.setState({ theme: 'light' })
      const { result } = renderHook(() => useTheme())

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
      const { result } = renderHook(() => useTheme())
      expect(typeof result.current.initializeTheme).toBe('function')
    })
  })
})
