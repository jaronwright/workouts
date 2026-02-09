import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { WeightUnitSelector } from '../WeightUnitSelector'
import { useSettingsStore } from '@/stores/settingsStore'

// Mock the settings store
vi.mock('@/stores/settingsStore', () => ({
  useSettingsStore: vi.fn(),
}))

const mockUseSettingsStore = vi.mocked(useSettingsStore)

describe('WeightUnitSelector', () => {
  const mockSetWeightUnit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // By default, return lbs and the setter
    mockUseSettingsStore.mockImplementation((selector: any) => {
      const state = {
        weightUnit: 'lbs' as const,
        setWeightUnit: mockSetWeightUnit,
      }
      return selector(state)
    })
  })

  describe('rendering', () => {
    it('renders a select element', () => {
      render(<WeightUnitSelector />)
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    it('renders lbs option', () => {
      render(<WeightUnitSelector />)
      expect(screen.getByText('lbs')).toBeInTheDocument()
    })

    it('renders kg option', () => {
      render(<WeightUnitSelector />)
      expect(screen.getByText('kg')).toBeInTheDocument()
    })

    it('has lbs selected by default', () => {
      render(<WeightUnitSelector />)
      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select.value).toBe('lbs')
    })

    it('has kg selected when store has kg', () => {
      mockUseSettingsStore.mockImplementation((selector: any) => {
        const state = {
          weightUnit: 'kg' as const,
          setWeightUnit: mockSetWeightUnit,
        }
        return selector(state)
      })
      render(<WeightUnitSelector />)
      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select.value).toBe('kg')
    })
  })

  describe('interaction', () => {
    it('calls setWeightUnit when value changes to kg', () => {
      render(<WeightUnitSelector />)
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'kg' } })
      expect(mockSetWeightUnit).toHaveBeenCalledWith('kg')
    })

    it('calls setWeightUnit when value changes to lbs', () => {
      mockUseSettingsStore.mockImplementation((selector: any) => {
        const state = {
          weightUnit: 'kg' as const,
          setWeightUnit: mockSetWeightUnit,
        }
        return selector(state)
      })
      render(<WeightUnitSelector />)
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'lbs' } })
      expect(mockSetWeightUnit).toHaveBeenCalledWith('lbs')
    })
  })

  describe('options count', () => {
    it('has exactly two options', () => {
      render(<WeightUnitSelector />)
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(2)
    })

    it('has option values lbs and kg', () => {
      render(<WeightUnitSelector />)
      const options = screen.getAllByRole('option') as HTMLOptionElement[]
      const values = options.map(o => o.value)
      expect(values).toContain('lbs')
      expect(values).toContain('kg')
    })
  })
})
