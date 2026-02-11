import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { ReflectionForm } from '../ReflectionForm'

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    button: ({ children, whileHover, whileTap, animate, transition, ...props }: any) =>
      createElement('button', props, children),
    span: ({ children, initial, animate, ...props }: any) =>
      createElement('span', props, children),
    div: ({ children, initial, animate, exit, transition, variants, ...props }: any) =>
      createElement('div', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}))

vi.mock('@/config/animationConfig', () => ({
  springs: { default: {}, snappy: {} },
  staggerContainer: {},
  staggerChild: {},
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  ChevronDown: (props: any) => createElement('svg', { ...props, 'data-testid': 'chevron-icon' }),
  MessageSquare: (props: any) => createElement('svg', { ...props, 'data-testid': 'message-icon' }),
  ThumbsUp: (props: any) => createElement('svg', { ...props, 'data-testid': 'thumbsup-icon' }),
  Target: (props: any) => createElement('svg', { ...props, 'data-testid': 'target-icon' }),
}))

describe('ReflectionForm', () => {
  const defaultProps = {
    reflection: '',
    highlights: '',
    improvements: '',
    onReflectionChange: vi.fn(),
    onHighlightsChange: vi.fn(),
    onImprovementsChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ────────────────────────────────────────────────────────
  // Rendering
  // ────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders all 3 section headers', () => {
      render(<ReflectionForm {...defaultProps} />)
      expect(screen.getByText('Reflection')).toBeInTheDocument()
      expect(screen.getByText('What went well')).toBeInTheDocument()
      expect(screen.getByText('What to improve')).toBeInTheDocument()
    })

    it('"Reflection" section is open by default (textarea visible)', () => {
      render(<ReflectionForm {...defaultProps} />)
      const textareas = screen.getAllByRole('textbox')
      // Only the Reflection textarea should be visible initially
      expect(textareas).toHaveLength(1)
    })

    it('other sections are closed by default', () => {
      render(<ReflectionForm {...defaultProps} />)
      const textareas = screen.getAllByRole('textbox')
      // Only 1 textarea visible (Reflection), not 3
      expect(textareas).toHaveLength(1)
    })

    it('renders section icons', () => {
      render(<ReflectionForm {...defaultProps} />)
      expect(screen.getAllByTestId('message-icon')).toHaveLength(1)
      expect(screen.getAllByTestId('thumbsup-icon')).toHaveLength(1)
      expect(screen.getAllByTestId('target-icon')).toHaveLength(1)
    })
  })

  // ────────────────────────────────────────────────────────
  // Collapsible behavior
  // ────────────────────────────────────────────────────────

  describe('collapsible behavior', () => {
    it('clicking a closed section opens it and shows textarea', () => {
      render(<ReflectionForm {...defaultProps} />)
      // Click "What went well" header to open it
      fireEvent.click(screen.getByText('What went well'))
      const textareas = screen.getAllByRole('textbox')
      // Now 2 textareas should be visible (Reflection + What went well)
      expect(textareas).toHaveLength(2)
    })

    it('clicking an open section closes it', () => {
      render(<ReflectionForm {...defaultProps} />)
      // Reflection is open by default, click to close
      fireEvent.click(screen.getByText('Reflection'))
      const textareas = screen.queryAllByRole('textbox')
      expect(textareas).toHaveLength(0)
    })

    it('opening "What to improve" section shows its textarea', () => {
      render(<ReflectionForm {...defaultProps} />)
      fireEvent.click(screen.getByText('What to improve'))
      const textareas = screen.getAllByRole('textbox')
      expect(textareas).toHaveLength(2)
    })

    it('all three sections can be open at the same time', () => {
      render(<ReflectionForm {...defaultProps} />)
      // Open the other two sections
      fireEvent.click(screen.getByText('What went well'))
      fireEvent.click(screen.getByText('What to improve'))
      const textareas = screen.getAllByRole('textbox')
      expect(textareas).toHaveLength(3)
    })
  })

  // ────────────────────────────────────────────────────────
  // Input handling
  // ────────────────────────────────────────────────────────

  describe('input handling', () => {
    it('textarea calls onReflectionChange handler on input', () => {
      render(<ReflectionForm {...defaultProps} />)
      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'Great session today' } })
      expect(defaultProps.onReflectionChange).toHaveBeenCalledWith('Great session today')
    })

    it('textarea calls onHighlightsChange when highlights section is open', () => {
      render(<ReflectionForm {...defaultProps} />)
      fireEvent.click(screen.getByText('What went well'))
      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[1], { target: { value: 'Hit a new PR' } })
      expect(defaultProps.onHighlightsChange).toHaveBeenCalledWith('Hit a new PR')
    })

    it('textarea calls onImprovementsChange when improvements section is open', () => {
      render(<ReflectionForm {...defaultProps} />)
      fireEvent.click(screen.getByText('What to improve'))
      const textareas = screen.getAllByRole('textbox')
      fireEvent.change(textareas[1], { target: { value: 'Rest longer between sets' } })
      expect(defaultProps.onImprovementsChange).toHaveBeenCalledWith('Rest longer between sets')
    })

    it('textarea truncates input to maxLength of 500 chars', () => {
      render(<ReflectionForm {...defaultProps} />)
      const textarea = screen.getByRole('textbox')
      const longText = 'a'.repeat(600)
      fireEvent.change(textarea, { target: { value: longText } })
      // The onChange slices to 500 chars
      expect(defaultProps.onReflectionChange).toHaveBeenCalledWith('a'.repeat(500))
    })
  })

  // ────────────────────────────────────────────────────────
  // Character count
  // ────────────────────────────────────────────────────────

  describe('character count', () => {
    it('shows character count when text is present', () => {
      render(<ReflectionForm {...defaultProps} reflection="Hello" />)
      // Character count appears in header and below textarea
      const counts = screen.getAllByText('5/500')
      expect(counts.length).toBeGreaterThanOrEqual(1)
    })

    it('does not show character count in header when text is empty', () => {
      render(<ReflectionForm {...defaultProps} />)
      // The count below the textarea always shows (0/500), but the header count only shows when length > 0
      // When empty, only the textarea-area count shows
      expect(screen.queryByText('0/500')).toBeInTheDocument()
    })
  })
})
