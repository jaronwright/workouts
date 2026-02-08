/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { Modal } from '../Modal'

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
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

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.style.overflow = ''
  })

  afterEach(() => {
    document.body.style.overflow = ''
  })

  // ─── Rendering ─────────────────────────────────────────

  describe('rendering', () => {
    it('renders when isOpen is true', () => {
      render(<Modal {...defaultProps} />)
      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
    })

    it('renders title when provided', () => {
      render(<Modal {...defaultProps} title="Test Title" />)
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('renders title as an h2 heading element', () => {
      render(<Modal {...defaultProps} title="Heading Check" />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Heading Check')
    })

    it('does not render title section when not provided', () => {
      render(<Modal {...defaultProps} />)
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('renders complex children', () => {
      render(
        <Modal {...defaultProps}>
          <div data-testid="child-1">First child</div>
          <div data-testid="child-2">Second child</div>
        </Modal>
      )
      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })

    it('renders a close button when title is provided', () => {
      render(<Modal {...defaultProps} title="With Close" />)
      const closeButton = screen.getByRole('button')
      expect(closeButton).toBeInTheDocument()
    })

    it('does not render a close button when title is not provided', () => {
      render(<Modal {...defaultProps} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  // ─── Closing Behavior ─────────────────────────────────

  describe('closing behavior', () => {
    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn()
      render(<Modal {...defaultProps} onClose={onClose} />)

      const backdrop = document.querySelector('.bg-black\\/50')
      if (backdrop) {
        fireEvent.click(backdrop)
      }
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn()
      render(<Modal {...defaultProps} onClose={onClose} title="Test" />)

      const closeButton = screen.getByRole('button')
      fireEvent.click(closeButton)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn()
      render(<Modal {...defaultProps} onClose={onClose} />)

      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose for non-Escape keys', () => {
      const onClose = vi.fn()
      render(<Modal {...defaultProps} onClose={onClose} />)

      fireEvent.keyDown(document, { key: 'Enter' })
      fireEvent.keyDown(document, { key: 'Tab' })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('does not close when modal content is clicked', () => {
      const onClose = vi.fn()
      render(<Modal {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByText('Modal content'))
      expect(onClose).not.toHaveBeenCalled()
    })

    it('calls onClose via Escape even when modal is rendered without title', () => {
      const onClose = vi.fn()
      render(
        <Modal isOpen={true} onClose={onClose}>
          <span>No title modal</span>
        </Modal>
      )

      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Body Scroll Lock ─────────────────────────────────

  describe('body scroll lock', () => {
    it('locks body scroll when modal opens', () => {
      render(<Modal {...defaultProps} />)
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('restores body scroll when modal closes', () => {
      const { rerender } = render(<Modal {...defaultProps} />)
      expect(document.body.style.overflow).toBe('hidden')

      rerender(<Modal {...defaultProps} isOpen={false} />)
      expect(document.body.style.overflow).toBe('')
    })

    it('restores body scroll on unmount', () => {
      const { unmount } = render(<Modal {...defaultProps} />)
      expect(document.body.style.overflow).toBe('hidden')

      unmount()
      expect(document.body.style.overflow).toBe('')
    })

    it('does not lock scroll when initially closed', () => {
      render(<Modal {...defaultProps} isOpen={false} />)
      expect(document.body.style.overflow).toBe('')
    })
  })
})
