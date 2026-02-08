/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { BottomSheet } from '../BottomSheet'

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      // Filter out motion-specific props that are not valid HTML attributes
      const {
        initial, animate, exit, transition, drag, dragConstraints,
        dragElastic, onDragEnd, whileTap, layoutId, ...htmlProps
      } = props
      return <div {...htmlProps}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}))

describe('BottomSheet', () => {
  it('renders children when open', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        <p>Sheet content</p>
      </BottomSheet>
    )
    expect(screen.getByText('Sheet content')).toBeInTheDocument()
  })

  it('does not render children when closed', () => {
    render(
      <BottomSheet isOpen={false} onClose={vi.fn()}>
        <p>Hidden content</p>
      </BottomSheet>
    )
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
  })

  it('shows the title when provided', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()} title="My Sheet">
        <p>Content</p>
      </BottomSheet>
    )
    expect(screen.getByText('My Sheet')).toBeInTheDocument()
  })

  it('does not render title section when title is not provided', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        <p>Content</p>
      </BottomSheet>
    )
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet isOpen={true} onClose={onClose}>
        <p>Content</p>
      </BottomSheet>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not listen for Escape when closed', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet isOpen={false} onClose={onClose}>
        <p>Content</p>
      </BottomSheet>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet isOpen={true} onClose={onClose} title="Test Sheet">
        <p>Content</p>
      </BottomSheet>
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('sets body overflow to hidden when open', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        <p>Content</p>
      </BottomSheet>
    )
    expect(document.body.style.overflow).toBe('hidden')
  })
})
