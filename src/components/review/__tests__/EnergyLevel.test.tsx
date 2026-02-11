import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { EnergyLevel } from '../EnergyLevel'

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
  AnimatePresence: ({ children }: any) => (typeof children === 'function' ? null : children),
  useMotionValue: () => ({ get: () => 0, set: () => {} }),
  useTransform: () => ({ get: () => 0 }),
  animate: vi.fn(),
}))

vi.mock('@/config/animationConfig', () => ({
  springs: { default: {}, snappy: {} },
  staggerContainer: {},
  staggerChild: {},
}))

vi.mock('@/config/reviewConfig', () => ({
  ENERGY_LABELS: { 1: 'Drained', 2: 'Low', 3: 'Normal', 4: 'High', 5: 'Energized' } as Record<number, string>,
  ENERGY_COLORS: { 1: '#EF4444', 2: '#F97316', 3: '#EAB308', 4: '#84CC16', 5: '#22C55E' } as Record<number, string>,
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Battery: (props: any) => createElement('svg', { ...props, 'data-testid': 'battery-icon' }),
  BatteryFull: (props: any) => createElement('svg', { ...props, 'data-testid': 'battery-full-icon' }),
  Zap: (props: any) => createElement('svg', { ...props, 'data-testid': 'zap-icon' }),
}))

describe('EnergyLevel', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ────────────────────────────────────────────────────────
  // Rendering
  // ────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders "Energy Level" header text', () => {
      render(<EnergyLevel value={null} onChange={mockOnChange} />)
      expect(screen.getByText('Energy Level')).toBeInTheDocument()
    })

    it('renders battery icon when no value or low energy', () => {
      render(<EnergyLevel value={null} onChange={mockOnChange} />)
      expect(screen.getByTestId('battery-icon')).toBeInTheDocument()
    })

    it('renders battery full icon when energy is high (4+)', () => {
      render(<EnergyLevel value={4} onChange={mockOnChange} />)
      expect(screen.getByTestId('battery-full-icon')).toBeInTheDocument()
    })

    it('renders all 5 level labels as clickable buttons', () => {
      render(<EnergyLevel value={null} onChange={mockOnChange} />)
      expect(screen.getByText('Drained')).toBeInTheDocument()
      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getByText('Normal')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.getByText('Energized')).toBeInTheDocument()
    })

    it('renders the slider with correct ARIA attributes', () => {
      render(<EnergyLevel value={3} onChange={mockOnChange} />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-valuemin', '1')
      expect(slider).toHaveAttribute('aria-valuemax', '5')
      expect(slider).toHaveAttribute('aria-valuenow', '3')
      expect(slider).toHaveAttribute('aria-label', 'Energy level')
    })

    it('renders 5 tick mark buttons on the track plus 5 label buttons', () => {
      render(<EnergyLevel value={null} onChange={mockOnChange} />)
      // 5 tick marks on track + 5 label buttons below
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(10)
    })
  })

  // ────────────────────────────────────────────────────────
  // Selection display
  // ────────────────────────────────────────────────────────

  describe('selection display', () => {
    it('shows selected label text when value is set', () => {
      render(<EnergyLevel value={4} onChange={mockOnChange} />)
      // "High" appears in the label row AND as the selected label below the slider
      const highLabels = screen.getAllByText('High')
      expect(highLabels.length).toBeGreaterThanOrEqual(2)
    })

    it('does not show selected label when value is null', () => {
      render(<EnergyLevel value={null} onChange={mockOnChange} />)
      // Each label appears only once (in the label row)
      const drainedLabels = screen.getAllByText('Drained')
      expect(drainedLabels).toHaveLength(1)
    })

    it('shows "Energized" label when value is 5', () => {
      render(<EnergyLevel value={5} onChange={mockOnChange} />)
      const labels = screen.getAllByText('Energized')
      expect(labels.length).toBeGreaterThanOrEqual(2)
    })

    it('shows "Drained" label when value is 1', () => {
      render(<EnergyLevel value={1} onChange={mockOnChange} />)
      const labels = screen.getAllByText('Drained')
      expect(labels.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ────────────────────────────────────────────────────────
  // Interaction
  // ────────────────────────────────────────────────────────

  describe('interaction', () => {
    it('calls onChange when a label button is clicked', () => {
      render(<EnergyLevel value={null} onChange={mockOnChange} />)
      fireEvent.click(screen.getByText('Normal'))
      expect(mockOnChange).toHaveBeenCalledWith(3)
    })

    it('calls onChange with correct value for each label', () => {
      render(<EnergyLevel value={null} onChange={mockOnChange} />)
      fireEvent.click(screen.getByText('Drained'))
      expect(mockOnChange).toHaveBeenCalledWith(1)
      fireEvent.click(screen.getByText('Low'))
      expect(mockOnChange).toHaveBeenCalledWith(2)
      fireEvent.click(screen.getByText('Normal'))
      expect(mockOnChange).toHaveBeenCalledWith(3)
      fireEvent.click(screen.getByText('High'))
      expect(mockOnChange).toHaveBeenCalledWith(4)
      fireEvent.click(screen.getByText('Energized'))
      expect(mockOnChange).toHaveBeenCalledWith(5)
      expect(mockOnChange).toHaveBeenCalledTimes(5)
    })

    it('supports keyboard navigation with ArrowRight', () => {
      render(<EnergyLevel value={3} onChange={mockOnChange} />)
      const slider = screen.getByRole('slider')
      fireEvent.keyDown(slider, { key: 'ArrowRight' })
      expect(mockOnChange).toHaveBeenCalledWith(4)
    })

    it('supports keyboard navigation with ArrowLeft', () => {
      render(<EnergyLevel value={3} onChange={mockOnChange} />)
      const slider = screen.getByRole('slider')
      fireEvent.keyDown(slider, { key: 'ArrowLeft' })
      expect(mockOnChange).toHaveBeenCalledWith(2)
    })

    it('clamps keyboard navigation at min (1)', () => {
      render(<EnergyLevel value={1} onChange={mockOnChange} />)
      const slider = screen.getByRole('slider')
      fireEvent.keyDown(slider, { key: 'ArrowLeft' })
      expect(mockOnChange).toHaveBeenCalledWith(1)
    })

    it('clamps keyboard navigation at max (5)', () => {
      render(<EnergyLevel value={5} onChange={mockOnChange} />)
      const slider = screen.getByRole('slider')
      fireEvent.keyDown(slider, { key: 'ArrowRight' })
      expect(mockOnChange).toHaveBeenCalledWith(5)
    })

    it('starts at level 1 when pressing ArrowRight with no value', () => {
      render(<EnergyLevel value={null} onChange={mockOnChange} />)
      const slider = screen.getByRole('slider')
      fireEvent.keyDown(slider, { key: 'ArrowRight' })
      expect(mockOnChange).toHaveBeenCalledWith(1)
    })
  })
})
