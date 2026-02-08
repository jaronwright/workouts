import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReducedMotion } from '../useReducedMotion'

describe('useReducedMotion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns false by default when prefers-reduced-motion does not match', () => {
    // The global setup.ts mocks matchMedia to return matches: false
    const { result } = renderHook(() => useReducedMotion())

    expect(result.current).toBe(false)
  })

  it('returns true when prefers-reduced-motion matches', () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result } = renderHook(() => useReducedMotion())

    expect(result.current).toBe(true)
  })

  it('registers a change event listener on mount', () => {
    const addEventListenerMock = vi.fn()
    const removeEventListenerMock = vi.fn()

    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
      dispatchEvent: vi.fn(),
    }))

    const { unmount } = renderHook(() => useReducedMotion())

    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))

    unmount()

    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('updates state when the media query change event fires', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | undefined

    const addEventListenerMock = vi.fn(
      (event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          changeHandler = handler
        }
      }
    )

    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result } = renderHook(() => useReducedMotion())

    expect(result.current).toBe(false)

    // Simulate the media query changing to reduced motion
    act(() => {
      changeHandler!({ matches: true } as MediaQueryListEvent)
    })

    expect(result.current).toBe(true)

    // Simulate the media query changing back
    act(() => {
      changeHandler!({ matches: false } as MediaQueryListEvent)
    })

    expect(result.current).toBe(false)
  })
})
