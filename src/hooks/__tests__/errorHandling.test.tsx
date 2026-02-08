import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from '../useToast'
import { useToastStore } from '@/stores/toastStore'
import { useReducedMotion } from '../useReducedMotion'

// ──────────────────────────────────────────────────────
// useToast edge cases
// ──────────────────────────────────────────────────────

describe('useToast edge cases', () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('adding multiple toasts rapidly', () => {
    it('handles 10 toasts added in rapid succession', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.toast(`Toast ${i}`, 'info', 0)
        }
      })

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(10)
    })

    it('each rapid toast gets a unique ID', () => {
      const { result } = renderHook(() => useToast())

      const ids: string[] = []
      act(() => {
        for (let i = 0; i < 5; i++) {
          ids.push(result.current.toast(`Toast ${i}`, 'info', 0))
        }
      })

      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(5)
    })

    it('handles mixed toast types added rapidly', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.success('Success', 0)
        result.current.error('Error', 0)
        result.current.warning('Warning', 0)
        result.current.info('Info', 0)
        result.current.success('Success 2', 0)
        result.current.error('Error 2', 0)
      })

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(6)
      expect(toasts[0].type).toBe('success')
      expect(toasts[1].type).toBe('error')
      expect(toasts[2].type).toBe('warning')
      expect(toasts[3].type).toBe('info')
      expect(toasts[4].type).toBe('success')
      expect(toasts[5].type).toBe('error')
    })

    it('handles 50 toasts without issues', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        for (let i = 0; i < 50; i++) {
          result.current.info(`Toast ${i}`, 0)
        }
      })

      expect(useToastStore.getState().toasts).toHaveLength(50)
    })
  })

  describe('toast auto-dismiss behavior', () => {
    it('auto-dismisses toast after default duration (5000ms)', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast('Auto dismiss me')
      })

      expect(useToastStore.getState().toasts).toHaveLength(1)

      act(() => {
        vi.advanceTimersByTime(4999)
      })

      // Should still be there just before 5000ms
      expect(useToastStore.getState().toasts).toHaveLength(1)

      act(() => {
        vi.advanceTimersByTime(1)
      })

      // Should be gone at exactly 5000ms
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('does not auto-dismiss when duration is 0', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast('Persistent toast', 'info', 0)
      })

      act(() => {
        vi.advanceTimersByTime(60000) // Advance 1 minute
      })

      // Toast should still be present because duration is 0
      expect(useToastStore.getState().toasts).toHaveLength(1)
    })

    it('auto-dismisses with custom short duration', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast('Quick', 'info', 500)
      })

      expect(useToastStore.getState().toasts).toHaveLength(1)

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('auto-dismisses multiple toasts independently', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast('Short', 'info', 1000)
        result.current.toast('Medium', 'info', 3000)
        result.current.toast('Long', 'info', 5000)
      })

      expect(useToastStore.getState().toasts).toHaveLength(3)

      // After 1000ms, first toast should be gone
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(useToastStore.getState().toasts).toHaveLength(2)

      // After another 2000ms (total 3000ms), second toast should be gone
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(useToastStore.getState().toasts).toHaveLength(1)

      // After another 2000ms (total 5000ms), last toast should be gone
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('manually removing a toast does not affect other auto-dismiss timers', () => {
      const { result } = renderHook(() => useToast())

      let id1 = ''
      act(() => {
        id1 = result.current.toast('Toast 1', 'info', 3000)
        result.current.toast('Toast 2', 'info', 5000)
      })

      expect(useToastStore.getState().toasts).toHaveLength(2)

      // Remove toast 1 manually
      act(() => {
        result.current.remove(id1)
      })

      expect(useToastStore.getState().toasts).toHaveLength(1)
      expect(useToastStore.getState().toasts[0].message).toBe('Toast 2')

      // Toast 2 should still auto-dismiss at 5000ms
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('clearing all toasts while auto-dismiss timers are pending', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast('Toast 1', 'info', 3000)
        result.current.toast('Toast 2', 'info', 5000)
      })

      expect(useToastStore.getState().toasts).toHaveLength(2)

      // Clear all
      act(() => {
        result.current.clear()
      })

      expect(useToastStore.getState().toasts).toHaveLength(0)

      // Timer fires but toast is already gone, should not cause errors
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })
  })

  describe('toast deduplication (no built-in dedup)', () => {
    it('allows adding duplicate messages (no dedup by default)', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast('Same message', 'info', 0)
        result.current.toast('Same message', 'info', 0)
        result.current.toast('Same message', 'info', 0)
      })

      // The store does not deduplicate, so all 3 should exist
      expect(useToastStore.getState().toasts).toHaveLength(3)
    })

    it('duplicate toasts have unique IDs', () => {
      const { result } = renderHook(() => useToast())

      const ids: string[] = []
      act(() => {
        ids.push(result.current.toast('Same', 'info', 0))
        ids.push(result.current.toast('Same', 'info', 0))
      })

      expect(ids[0]).not.toBe(ids[1])
    })
  })

  describe('toast with empty message', () => {
    it('adds a toast with empty string message', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast('', 'info', 0)
      })

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0].message).toBe('')
    })
  })

  describe('removing non-existent toast', () => {
    it('does not throw when removing a toast that does not exist', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast('Existing', 'info', 0)
      })

      expect(useToastStore.getState().toasts).toHaveLength(1)

      // Remove a non-existent ID
      act(() => {
        result.current.remove('non-existent-id')
      })

      // Should still have the original toast
      expect(useToastStore.getState().toasts).toHaveLength(1)
    })
  })

  describe('clearing empty toast store', () => {
    it('does not throw when clearing an already empty store', () => {
      const { result } = renderHook(() => useToast())

      expect(useToastStore.getState().toasts).toHaveLength(0)

      act(() => {
        result.current.clear()
      })

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })
  })
})

// ──────────────────────────────────────────────────────
// useReducedMotion edge cases
// ──────────────────────────────────────────────────────

describe('useReducedMotion edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('defaults to false when matchMedia returns matches: false', () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it('responds to dynamic changes from false to true', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | undefined

    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          changeHandler = handler
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)

    // Simulate user enabling reduced motion in system settings
    act(() => {
      changeHandler!({ matches: true } as MediaQueryListEvent)
    })

    expect(result.current).toBe(true)
  })

  it('responds to dynamic changes from true to false', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | undefined

    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          changeHandler = handler
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)

    // Simulate user disabling reduced motion
    act(() => {
      changeHandler!({ matches: false } as MediaQueryListEvent)
    })

    expect(result.current).toBe(false)
  })

  it('handles multiple rapid toggle changes', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | undefined

    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          changeHandler = handler
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)

    // Rapid toggle
    act(() => {
      changeHandler!({ matches: true } as MediaQueryListEvent)
    })
    expect(result.current).toBe(true)

    act(() => {
      changeHandler!({ matches: false } as MediaQueryListEvent)
    })
    expect(result.current).toBe(false)

    act(() => {
      changeHandler!({ matches: true } as MediaQueryListEvent)
    })
    expect(result.current).toBe(true)
  })

  it('cleans up event listener on unmount', () => {
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

    expect(addEventListenerMock).toHaveBeenCalledTimes(1)
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))

    unmount()

    expect(removeEventListenerMock).toHaveBeenCalledTimes(1)
    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))

    // The same handler reference should be used for add and remove
    const addedHandler = addEventListenerMock.mock.calls[0][1]
    const removedHandler = removeEventListenerMock.mock.calls[0][1]
    expect(addedHandler).toBe(removedHandler)
  })

  it('queries the correct media feature string', () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    renderHook(() => useReducedMotion())

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })

  it('starts with true and stays true when no change event fires', () => {
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
})
