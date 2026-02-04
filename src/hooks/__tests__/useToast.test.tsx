import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from '../useToast'
import { useToastStore } from '@/stores/toastStore'

describe('useToast', () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('toast', () => {
    it('adds a toast with default type info', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast('Test message')
      })

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0].type).toBe('info')
      expect(toasts[0].message).toBe('Test message')
    })

    it('adds a toast with specified type', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast('Error occurred', 'error')
      })

      const toasts = useToastStore.getState().toasts
      expect(toasts[0].type).toBe('error')
    })

    it('adds a toast with custom duration', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast('Quick toast', 'info', 1000)
      })

      expect(useToastStore.getState().toasts).toHaveLength(1)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('returns toast id', () => {
      const { result } = renderHook(() => useToast())

      let id: string = ''
      act(() => {
        id = result.current.toast('Test')
      })

      expect(id).toMatch(/^toast-\d+$/)
    })
  })

  describe('success', () => {
    it('adds a success toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.success('Operation completed')
      })

      const toasts = useToastStore.getState().toasts
      expect(toasts[0].type).toBe('success')
      expect(toasts[0].message).toBe('Operation completed')
    })

    it('supports custom duration', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.success('Done', 2000)
      })

      expect(useToastStore.getState().toasts).toHaveLength(1)

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })
  })

  describe('error', () => {
    it('adds an error toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.error('Something went wrong')
      })

      const toasts = useToastStore.getState().toasts
      expect(toasts[0].type).toBe('error')
      expect(toasts[0].message).toBe('Something went wrong')
    })

    it('supports custom duration', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.error('Error', 3000)
      })

      expect(useToastStore.getState().toasts).toHaveLength(1)

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })
  })

  describe('warning', () => {
    it('adds a warning toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.warning('Be careful')
      })

      const toasts = useToastStore.getState().toasts
      expect(toasts[0].type).toBe('warning')
      expect(toasts[0].message).toBe('Be careful')
    })
  })

  describe('info', () => {
    it('adds an info toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.info('FYI')
      })

      const toasts = useToastStore.getState().toasts
      expect(toasts[0].type).toBe('info')
      expect(toasts[0].message).toBe('FYI')
    })
  })

  describe('remove', () => {
    it('removes a specific toast', () => {
      const { result } = renderHook(() => useToast())

      let id: string = ''
      act(() => {
        id = result.current.toast('Toast to remove', 'info', 0)
        result.current.toast('Toast to keep', 'info', 0)
      })

      expect(useToastStore.getState().toasts).toHaveLength(2)

      act(() => {
        result.current.remove(id)
      })

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0].message).toBe('Toast to keep')
    })
  })

  describe('clear', () => {
    it('removes all toasts', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast('Toast 1', 'info', 0)
        result.current.toast('Toast 2', 'info', 0)
        result.current.toast('Toast 3', 'info', 0)
      })

      expect(useToastStore.getState().toasts).toHaveLength(3)

      act(() => {
        result.current.clear()
      })

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })
  })

  describe('multiple toasts', () => {
    it('can add multiple toasts of different types', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.success('Success!', 0)
        result.current.error('Error!', 0)
        result.current.warning('Warning!', 0)
        result.current.info('Info!', 0)
      })

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(4)
      expect(toasts.map(t => t.type)).toEqual(['success', 'error', 'warning', 'info'])
    })
  })
})
