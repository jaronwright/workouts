import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import { ToastProvider } from '../ToastProvider'
import type { Toast } from '@/stores/toastStore'

const mockToasts: Toast[] = []
const mockRemoveToast = vi.fn()

vi.mock('@/stores/toastStore', () => ({
  useToastStore: (selector: (state: { toasts: Toast[]; removeToast: (id: string) => void }) => unknown) =>
    selector({ toasts: mockToasts, removeToast: mockRemoveToast }),
}))

describe('ToastProvider', () => {
  beforeEach(() => {
    mockToasts.length = 0
    mockRemoveToast.mockClear()
  })

  it('renders nothing when there are no toasts', () => {
    const { container } = render(<ToastProvider />)
    expect(container.innerHTML).toBe('')
  })

  it('renders toasts from the store', () => {
    mockToasts.push(
      { id: 'toast-1', type: 'success', message: 'Success message' },
      { id: 'toast-2', type: 'error', message: 'Error message' },
    )

    render(<ToastProvider />)

    expect(screen.getByText('Success message')).toBeInTheDocument()
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('renders the container with fixed positioning when toasts exist', () => {
    mockToasts.push({ id: 'toast-1', type: 'info', message: 'Info toast' })

    const { container } = render(<ToastProvider />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('fixed')
    expect(wrapper.className).toContain('z-50')
  })
})
