/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { BottomSheet } from '../BottomSheet'

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

describe('BottomSheet', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <p>Sheet content</p>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.style.overflow = ''
  })

  afterEach(() => {
    document.body.style.overflow = ''
  })

  // ─── Rendering ─────────────────────────────────────────

  it('renders children when isOpen is true', () => {
    render(<BottomSheet {...defaultProps} />)
    expect(screen.getByText('Sheet content')).toBeInTheDocument()
  })

  it('does not render children when isOpen is false', () => {
    render(<BottomSheet {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Sheet content')).not.toBeInTheDocument()
  })

  it('shows the title when provided', () => {
    render(<BottomSheet {...defaultProps} title="My Sheet" />)
    expect(screen.getByText('My Sheet')).toBeInTheDocument()
  })

  it('does not render title section when title is not provided', () => {
    render(<BottomSheet {...defaultProps} />)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('renders multiple children correctly', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        <div data-testid="child-a">Alpha</div>
        <div data-testid="child-b">Beta</div>
        <div data-testid="child-c">Gamma</div>
      </BottomSheet>
    )
    expect(screen.getByTestId('child-a')).toBeInTheDocument()
    expect(screen.getByTestId('child-b')).toBeInTheDocument()
    expect(screen.getByTestId('child-c')).toBeInTheDocument()
  })

  it('renders a close button with proper aria-label when title is present', () => {
    render(<BottomSheet {...defaultProps} title="Test Title" />)
    const closeButton = screen.getByRole('button', { name: /close/i })
    expect(closeButton).toBeInTheDocument()
    expect(closeButton).toHaveAttribute('aria-label', 'Close')
  })

  it('does not render a close button when no title is provided', () => {
    render(<BottomSheet {...defaultProps} />)
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
  })

  // ─── Closing Behavior ─────────────────────────────────

  it('calls onClose when Escape key is pressed while open', () => {
    const onClose = vi.fn()
    render(<BottomSheet isOpen={true} onClose={onClose}><p>Content</p></BottomSheet>)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose on Escape when sheet is closed', () => {
    const onClose = vi.fn()
    render(<BottomSheet isOpen={false} onClose={onClose}><p>Content</p></BottomSheet>)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not call onClose for non-Escape keys', () => {
    const onClose = vi.fn()
    render(<BottomSheet isOpen={true} onClose={onClose}><p>Content</p></BottomSheet>)

    fireEvent.keyDown(document, { key: 'Enter' })
    fireEvent.keyDown(document, { key: 'Tab' })
    fireEvent.keyDown(document, { key: 'a' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when close button in header is clicked', () => {
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

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet isOpen={true} onClose={onClose} title="Sheet">
        <p>Content</p>
      </BottomSheet>
    )

    // The backdrop is the first motion.div with the bg-black/40 class
    const backdrop = document.querySelector('.bg-black\\/40')
    expect(backdrop).toBeTruthy()
    if (backdrop) {
      fireEvent.click(backdrop)
    }
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // ─── Body Scroll Lock ─────────────────────────────────

  it('sets body overflow to hidden when open', () => {
    render(<BottomSheet {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body overflow when unmounted', () => {
    const { unmount } = render(<BottomSheet {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')

    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('does not lock body scroll when closed', () => {
    render(<BottomSheet {...defaultProps} isOpen={false} />)
    expect(document.body.style.overflow).toBe('')
  })

  // ─── Title Variations ─────────────────────────────────

  it('renders title as an h2 heading element', () => {
    render(<BottomSheet {...defaultProps} title="Heading Test" />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Heading Test')
  })
})
