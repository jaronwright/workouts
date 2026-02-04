import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useToastStore } from '../toastStore'

describe('useToastStore', () => {
  beforeEach(() => {
    // Clear all toasts before each test
    useToastStore.getState().clearToasts()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('starts with empty toasts array', () => {
      expect(useToastStore.getState().toasts).toEqual([])
    })
  })

  describe('addToast', () => {
    it('adds a toast to the store', () => {
      const { addToast } = useToastStore.getState()

      addToast({ type: 'success', message: 'Test message' })

      const { toasts } = useToastStore.getState()
      expect(toasts).toHaveLength(1)
      expect(toasts[0].type).toBe('success')
      expect(toasts[0].message).toBe('Test message')
    })

    it('returns the toast id', () => {
      const { addToast } = useToastStore.getState()

      const id = addToast({ type: 'info', message: 'Test' })

      expect(id).toMatch(/^toast-\d+$/)
    })

    it('generates unique ids for each toast', () => {
      const { addToast } = useToastStore.getState()

      const id1 = addToast({ type: 'success', message: 'Toast 1' })
      const id2 = addToast({ type: 'error', message: 'Toast 2' })

      expect(id1).not.toBe(id2)
    })

    it('adds multiple toasts', () => {
      const { addToast } = useToastStore.getState()

      addToast({ type: 'success', message: 'Success!' })
      addToast({ type: 'error', message: 'Error!' })
      addToast({ type: 'warning', message: 'Warning!' })

      expect(useToastStore.getState().toasts).toHaveLength(3)
    })

    it('uses default duration of 5000ms', () => {
      const { addToast } = useToastStore.getState()

      addToast({ type: 'info', message: 'Test' })

      expect(useToastStore.getState().toasts).toHaveLength(1)

      // Fast-forward past the default duration
      vi.advanceTimersByTime(5000)

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('uses custom duration when provided', () => {
      const { addToast } = useToastStore.getState()

      addToast({ type: 'info', message: 'Test', duration: 2000 })

      expect(useToastStore.getState().toasts).toHaveLength(1)

      vi.advanceTimersByTime(1999)
      expect(useToastStore.getState().toasts).toHaveLength(1)

      vi.advanceTimersByTime(1)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('does not auto-remove toast when duration is 0', () => {
      const { addToast } = useToastStore.getState()

      addToast({ type: 'info', message: 'Persistent toast', duration: 0 })

      vi.advanceTimersByTime(10000)

      expect(useToastStore.getState().toasts).toHaveLength(1)
    })

    it('supports all toast types', () => {
      const { addToast } = useToastStore.getState()

      addToast({ type: 'success', message: 'Success', duration: 0 })
      addToast({ type: 'error', message: 'Error', duration: 0 })
      addToast({ type: 'warning', message: 'Warning', duration: 0 })
      addToast({ type: 'info', message: 'Info', duration: 0 })

      const { toasts } = useToastStore.getState()
      expect(toasts.map(t => t.type)).toEqual(['success', 'error', 'warning', 'info'])
    })
  })

  describe('removeToast', () => {
    it('removes a specific toast by id', () => {
      const { addToast, removeToast } = useToastStore.getState()

      const id1 = addToast({ type: 'success', message: 'Toast 1', duration: 0 })
      const id2 = addToast({ type: 'error', message: 'Toast 2', duration: 0 })

      removeToast(id1)

      const { toasts } = useToastStore.getState()
      expect(toasts).toHaveLength(1)
      expect(toasts[0].id).toBe(id2)
    })

    it('does nothing when removing non-existent id', () => {
      const { addToast, removeToast } = useToastStore.getState()

      addToast({ type: 'success', message: 'Test', duration: 0 })

      removeToast('non-existent-id')

      expect(useToastStore.getState().toasts).toHaveLength(1)
    })
  })

  describe('clearToasts', () => {
    it('removes all toasts', () => {
      const { addToast, clearToasts } = useToastStore.getState()

      addToast({ type: 'success', message: 'Toast 1', duration: 0 })
      addToast({ type: 'error', message: 'Toast 2', duration: 0 })
      addToast({ type: 'info', message: 'Toast 3', duration: 0 })

      expect(useToastStore.getState().toasts).toHaveLength(3)

      clearToasts()

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('works when toasts array is already empty', () => {
      const { clearToasts } = useToastStore.getState()

      clearToasts()

      expect(useToastStore.getState().toasts).toHaveLength(0)
    })
  })
})
