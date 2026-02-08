import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { Toast } from '../Toast'
import type { Toast as ToastType } from '@/stores/toastStore'

describe('Toast', () => {
  const baseToast: ToastType = {
    id: 'toast-1',
    type: 'success',
    message: 'Operation successful',
  }

  it('renders the message', () => {
    render(<Toast toast={baseToast} onDismiss={vi.fn()} />)
    expect(screen.getByText('Operation successful')).toBeInTheDocument()
  })

  it('has role="alert"', () => {
    render(<Toast toast={baseToast} onDismiss={vi.fn()} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders dismiss button with aria-label', () => {
    render(<Toast toast={baseToast} onDismiss={vi.fn()} />)
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
  })

  describe('toast types render correct icons', () => {
    it('renders success icon', () => {
      const toast: ToastType = { ...baseToast, type: 'success' }
      const { container } = render(<Toast toast={toast} onDismiss={vi.fn()} />)
      // CheckCircle icon from lucide-react renders as an SVG
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(1)
    })

    it('renders error icon', () => {
      const toast: ToastType = { ...baseToast, type: 'error', message: 'Error occurred' }
      const { container } = render(<Toast toast={toast} onDismiss={vi.fn()} />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(1)
    })

    it('renders warning icon', () => {
      const toast: ToastType = { ...baseToast, type: 'warning', message: 'Be careful' }
      const { container } = render(<Toast toast={toast} onDismiss={vi.fn()} />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(1)
    })

    it('renders info icon', () => {
      const toast: ToastType = { ...baseToast, type: 'info', message: 'FYI' }
      const { container } = render(<Toast toast={toast} onDismiss={vi.fn()} />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('toast type styles', () => {
    it('applies success styles', () => {
      const toast: ToastType = { ...baseToast, type: 'success' }
      render(<Toast toast={toast} onDismiss={vi.fn()} />)
      const alert = screen.getByRole('alert')
      expect(alert.className).toContain('bg-green-500/10')
    })

    it('applies error styles', () => {
      const toast: ToastType = { ...baseToast, type: 'error' }
      render(<Toast toast={toast} onDismiss={vi.fn()} />)
      const alert = screen.getByRole('alert')
      expect(alert.className).toContain('bg-[var(--color-danger)]/10')
    })

    it('applies warning styles', () => {
      const toast: ToastType = { ...baseToast, type: 'warning' }
      render(<Toast toast={toast} onDismiss={vi.fn()} />)
      const alert = screen.getByRole('alert')
      expect(alert.className).toContain('bg-amber-500/10')
    })

    it('applies info styles', () => {
      const toast: ToastType = { ...baseToast, type: 'info' }
      render(<Toast toast={toast} onDismiss={vi.fn()} />)
      const alert = screen.getByRole('alert')
      expect(alert.className).toContain('bg-blue-500/10')
    })
  })

  it('calls onDismiss when dismiss button is clicked', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()

    render(<Toast toast={baseToast} onDismiss={onDismiss} />)

    const dismissButton = screen.getByRole('button', { name: /dismiss/i })
    fireEvent.click(dismissButton)

    // handleDismiss sets a 200ms timeout before calling onDismiss
    vi.advanceTimersByTime(200)

    expect(onDismiss).toHaveBeenCalledWith('toast-1')

    vi.useRealTimers()
  })
})
