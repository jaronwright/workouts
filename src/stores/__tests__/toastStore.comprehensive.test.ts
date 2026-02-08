import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useToastStore } from '../toastStore'

describe('useToastStore - comprehensive edge cases', () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('has an empty toasts array', () => {
      expect(useToastStore.getState().toasts).toEqual([])
    })

    it('has addToast, removeToast, and clearToasts as functions', () => {
      const state = useToastStore.getState()
      expect(typeof state.addToast).toBe('function')
      expect(typeof state.removeToast).toBe('function')
      expect(typeof state.clearToasts).toBe('function')
    })
  })

  describe('addToast - edge cases', () => {
    it('returns incrementing ids across multiple calls', () => {
      const { addToast } = useToastStore.getState()
      const id1 = addToast({ type: 'success', message: 'A', duration: 0 })
      const id2 = addToast({ type: 'success', message: 'B', duration: 0 })
      const id3 = addToast({ type: 'success', message: 'C', duration: 0 })

      // Extract the numeric part and verify ordering
      const num1 = parseInt(id1.replace('toast-', ''))
      const num2 = parseInt(id2.replace('toast-', ''))
      const num3 = parseInt(id3.replace('toast-', ''))
      expect(num2).toBeGreaterThan(num1)
      expect(num3).toBeGreaterThan(num2)
    })

    it('preserves toast order (FIFO)', () => {
      const { addToast } = useToastStore.getState()
      addToast({ type: 'success', message: 'First', duration: 0 })
      addToast({ type: 'error', message: 'Second', duration: 0 })
      addToast({ type: 'info', message: 'Third', duration: 0 })

      const messages = useToastStore.getState().toasts.map(t => t.message)
      expect(messages).toEqual(['First', 'Second', 'Third'])
    })

    it('handles empty message string', () => {
      const { addToast } = useToastStore.getState()
      addToast({ type: 'info', message: '', duration: 0 })

      const { toasts } = useToastStore.getState()
      expect(toasts).toHaveLength(1)
      expect(toasts[0].message).toBe('')
    })

    it('handles very long message string', () => {
      const { addToast } = useToastStore.getState()
      const longMessage = 'A'.repeat(10000)
      addToast({ type: 'info', message: longMessage, duration: 0 })

      const { toasts } = useToastStore.getState()
      expect(toasts[0].message).toBe(longMessage)
    })

    it('can add a toast right after clearing all toasts', () => {
      const { addToast, clearToasts } = useToastStore.getState()
      addToast({ type: 'success', message: 'Before clear', duration: 0 })
      clearToasts()
      addToast({ type: 'info', message: 'After clear', duration: 0 })

      const { toasts } = useToastStore.getState()
      expect(toasts).toHaveLength(1)
      expect(toasts[0].message).toBe('After clear')
    })

    it('handles adding many toasts rapidly', () => {
      const { addToast } = useToastStore.getState()
      const ids: string[] = []
      for (let i = 0; i < 100; i++) {
        ids.push(addToast({ type: 'info', message: `Toast ${i}`, duration: 0 }))
      }

      expect(useToastStore.getState().toasts).toHaveLength(100)
      // All IDs are unique
      expect(new Set(ids).size).toBe(100)
    })
  })

  describe('auto-remove timing', () => {
    it('auto-removes toast exactly at duration boundary', () => {
      const { addToast } = useToastStore.getState()
      addToast({ type: 'info', message: 'Test', duration: 3000 })

      vi.advanceTimersByTime(2999)
      expect(useToastStore.getState().toasts).toHaveLength(1)

      vi.advanceTimersByTime(1)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('auto-removes multiple toasts with different durations independently', () => {
      const { addToast } = useToastStore.getState()
      addToast({ type: 'success', message: 'Short', duration: 1000 })
      addToast({ type: 'error', message: 'Medium', duration: 3000 })
      addToast({ type: 'info', message: 'Long', duration: 5000 })

      expect(useToastStore.getState().toasts).toHaveLength(3)

      vi.advanceTimersByTime(1000)
      expect(useToastStore.getState().toasts).toHaveLength(2)
      expect(useToastStore.getState().toasts.map(t => t.message)).toEqual(['Medium', 'Long'])

      vi.advanceTimersByTime(2000) // 3000 total
      expect(useToastStore.getState().toasts).toHaveLength(1)
      expect(useToastStore.getState().toasts[0].message).toBe('Long')

      vi.advanceTimersByTime(2000) // 5000 total
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('auto-remove still fires after toast is manually removed (no-op)', () => {
      const { addToast, removeToast } = useToastStore.getState()
      const id = addToast({ type: 'info', message: 'Test', duration: 3000 })

      // Manually remove before auto-remove fires
      removeToast(id)
      expect(useToastStore.getState().toasts).toHaveLength(0)

      // Auto-remove fires but toast is already gone - should not throw
      vi.advanceTimersByTime(3000)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('auto-remove still fires after clearToasts (no-op)', () => {
      const { addToast, clearToasts } = useToastStore.getState()
      addToast({ type: 'info', message: 'Test', duration: 2000 })

      clearToasts()
      expect(useToastStore.getState().toasts).toHaveLength(0)

      // Timer fires but toasts were already cleared
      vi.advanceTimersByTime(2000)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('does not auto-remove when duration is exactly 0', () => {
      const { addToast } = useToastStore.getState()
      addToast({ type: 'warning', message: 'Persistent', duration: 0 })

      vi.advanceTimersByTime(60000) // Wait a full minute
      expect(useToastStore.getState().toasts).toHaveLength(1)
    })

    it('does not auto-remove when duration is negative (treated as duration > 0)', () => {
      const { addToast } = useToastStore.getState()
      // Negative duration: the check is `duration > 0`, so negative won't trigger auto-remove
      addToast({ type: 'info', message: 'Negative duration', duration: -1000 })

      vi.advanceTimersByTime(60000)
      // Negative is not > 0, so no auto-remove
      expect(useToastStore.getState().toasts).toHaveLength(1)
    })

    it('uses default 5000ms duration when no duration is provided', () => {
      const { addToast } = useToastStore.getState()
      addToast({ type: 'success', message: 'Default' })

      vi.advanceTimersByTime(4999)
      expect(useToastStore.getState().toasts).toHaveLength(1)

      vi.advanceTimersByTime(1)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('handles very short duration (1ms)', () => {
      const { addToast } = useToastStore.getState()
      addToast({ type: 'info', message: 'Flash', duration: 1 })

      expect(useToastStore.getState().toasts).toHaveLength(1)
      vi.advanceTimersByTime(1)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })
  })

  describe('removeToast - edge cases', () => {
    it('removes the correct toast when multiple exist', () => {
      const { addToast, removeToast } = useToastStore.getState()
      const id1 = addToast({ type: 'success', message: 'A', duration: 0 })
      const id2 = addToast({ type: 'error', message: 'B', duration: 0 })
      const id3 = addToast({ type: 'info', message: 'C', duration: 0 })

      removeToast(id2)

      const messages = useToastStore.getState().toasts.map(t => t.message)
      expect(messages).toEqual(['A', 'C'])
      expect(useToastStore.getState().toasts.find(t => t.id === id1)).toBeDefined()
      expect(useToastStore.getState().toasts.find(t => t.id === id3)).toBeDefined()
    })

    it('removing same id twice is a no-op on second call', () => {
      const { addToast, removeToast } = useToastStore.getState()
      const id = addToast({ type: 'info', message: 'Test', duration: 0 })

      removeToast(id)
      expect(useToastStore.getState().toasts).toHaveLength(0)

      removeToast(id) // second remove
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('does not affect other toasts when removing non-existent id', () => {
      const { addToast, removeToast } = useToastStore.getState()
      addToast({ type: 'success', message: 'A', duration: 0 })
      addToast({ type: 'error', message: 'B', duration: 0 })

      removeToast('completely-fake-id')

      expect(useToastStore.getState().toasts).toHaveLength(2)
    })

    it('removes all toasts one by one', () => {
      const { addToast, removeToast } = useToastStore.getState()
      const id1 = addToast({ type: 'success', message: 'A', duration: 0 })
      const id2 = addToast({ type: 'error', message: 'B', duration: 0 })
      const id3 = addToast({ type: 'info', message: 'C', duration: 0 })

      removeToast(id1)
      expect(useToastStore.getState().toasts).toHaveLength(2)
      removeToast(id2)
      expect(useToastStore.getState().toasts).toHaveLength(1)
      removeToast(id3)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })
  })

  describe('clearToasts - edge cases', () => {
    it('clearing an already empty store is safe', () => {
      const { clearToasts } = useToastStore.getState()
      clearToasts()
      clearToasts()
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('clearing does not prevent future toasts from being added', () => {
      const { addToast, clearToasts } = useToastStore.getState()
      addToast({ type: 'info', message: 'Before', duration: 0 })
      clearToasts()
      const id = addToast({ type: 'success', message: 'After', duration: 0 })

      expect(useToastStore.getState().toasts).toHaveLength(1)
      expect(useToastStore.getState().toasts[0].id).toBe(id)
      expect(useToastStore.getState().toasts[0].message).toBe('After')
    })

    it('clearing with pending auto-remove timers does not cause errors', () => {
      const { addToast, clearToasts } = useToastStore.getState()
      addToast({ type: 'success', message: 'A', duration: 1000 })
      addToast({ type: 'error', message: 'B', duration: 2000 })
      addToast({ type: 'info', message: 'C', duration: 3000 })

      clearToasts()
      expect(useToastStore.getState().toasts).toHaveLength(0)

      // Let all timers fire
      vi.advanceTimersByTime(5000)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })
  })

  describe('store subscription', () => {
    it('notifies on add', () => {
      const listener = vi.fn()
      const unsub = useToastStore.subscribe(listener)

      useToastStore.getState().addToast({ type: 'info', message: 'Test', duration: 0 })
      expect(listener).toHaveBeenCalledTimes(1)

      unsub()
    })

    it('notifies on remove', () => {
      const { addToast } = useToastStore.getState()
      const id = addToast({ type: 'info', message: 'Test', duration: 0 })

      const listener = vi.fn()
      const unsub = useToastStore.subscribe(listener)

      useToastStore.getState().removeToast(id)
      expect(listener).toHaveBeenCalledTimes(1)

      unsub()
    })

    it('notifies on clear', () => {
      useToastStore.getState().addToast({ type: 'info', message: 'Test', duration: 0 })

      const listener = vi.fn()
      const unsub = useToastStore.subscribe(listener)

      useToastStore.getState().clearToasts()
      expect(listener).toHaveBeenCalledTimes(1)

      unsub()
    })

    it('notifies on auto-remove', () => {
      const listener = vi.fn()
      const unsub = useToastStore.subscribe(listener)

      useToastStore.getState().addToast({ type: 'info', message: 'Test', duration: 1000 })
      const addCount = listener.mock.calls.length

      vi.advanceTimersByTime(1000)
      // Should have been notified again for the auto-removal
      expect(listener.mock.calls.length).toBeGreaterThan(addCount)

      unsub()
    })
  })

  describe('toast data integrity', () => {
    it('preserves toast type correctly for each type', () => {
      const { addToast } = useToastStore.getState()
      const types: Array<'success' | 'error' | 'warning' | 'info'> = ['success', 'error', 'warning', 'info']

      types.forEach(type => {
        addToast({ type, message: `msg-${type}`, duration: 0 })
      })

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(4)
      types.forEach((type, i) => {
        expect(toasts[i].type).toBe(type)
        expect(toasts[i].message).toBe(`msg-${type}`)
      })
    })

    it('each toast has its own unique id property', () => {
      const { addToast } = useToastStore.getState()
      addToast({ type: 'success', message: 'A', duration: 0 })
      addToast({ type: 'success', message: 'A', duration: 0 }) // Same content, different toast

      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(2)
      expect(toasts[0].id).not.toBe(toasts[1].id)
    })

    it('returned id matches the id stored in the toast', () => {
      const { addToast } = useToastStore.getState()
      const id = addToast({ type: 'error', message: 'Err', duration: 0 })

      const toast = useToastStore.getState().toasts.find(t => t.id === id)
      expect(toast).toBeDefined()
      expect(toast!.type).toBe('error')
      expect(toast!.message).toBe('Err')
    })
  })
})
