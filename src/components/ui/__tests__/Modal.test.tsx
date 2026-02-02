import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { Modal } from '../Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal content</div>
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Reset body overflow
    document.body.style.overflow = ''
  })

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

    it('does not render title section when not provided', () => {
      render(<Modal {...defaultProps} />)
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  describe('closing behavior', () => {
    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn()
      render(<Modal {...defaultProps} onClose={onClose} />)

      // Click on the backdrop (the first div with class containing bg-black)
      const backdrop = document.querySelector('.bg-black\\/50')
      if (backdrop) {
        fireEvent.click(backdrop)
      }

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn()
      render(<Modal {...defaultProps} onClose={onClose} title="Test" />)

      // Find the close button (X icon button)
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

    it('does not close when modal content is clicked', () => {
      const onClose = vi.fn()
      render(<Modal {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByText('Modal content'))

      expect(onClose).not.toHaveBeenCalled()
    })
  })

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
  })

  describe('children rendering', () => {
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
  })
})
