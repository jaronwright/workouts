import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock zustand persist middleware as a passthrough to avoid localStorage issues in tests
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual<typeof import('zustand/middleware')>('zustand/middleware')
  return {
    ...actual,
    persist: (fn: unknown) => fn,
  }
})

import { useSettingsStore, convertWeight, formatWeightWithUnit, type WeightUnit } from '../settingsStore'

describe('useSettingsStore - comprehensive', () => {
  beforeEach(() => {
    useSettingsStore.setState({ weightUnit: 'lbs' })
  })

  describe('initial state', () => {
    it('has weightUnit as lbs by default', () => {
      expect(useSettingsStore.getState().weightUnit).toBe('lbs')
    })

    it('has setWeightUnit as a function', () => {
      expect(typeof useSettingsStore.getState().setWeightUnit).toBe('function')
    })
  })

  describe('setWeightUnit - edge cases', () => {
    it('setting the same unit twice does not cause issues', () => {
      const { setWeightUnit } = useSettingsStore.getState()
      setWeightUnit('lbs')
      setWeightUnit('lbs')
      expect(useSettingsStore.getState().weightUnit).toBe('lbs')
    })

    it('toggling back and forth preserves correct state', () => {
      const { setWeightUnit } = useSettingsStore.getState()
      setWeightUnit('kg')
      expect(useSettingsStore.getState().weightUnit).toBe('kg')
      setWeightUnit('lbs')
      expect(useSettingsStore.getState().weightUnit).toBe('lbs')
      setWeightUnit('kg')
      expect(useSettingsStore.getState().weightUnit).toBe('kg')
    })

    it('multiple rapid changes settle on the last value', () => {
      const { setWeightUnit } = useSettingsStore.getState()
      for (let i = 0; i < 100; i++) {
        setWeightUnit(i % 2 === 0 ? 'kg' : 'lbs')
      }
      // 100 iterations, last is index 99 (odd) => 'lbs'
      expect(useSettingsStore.getState().weightUnit).toBe('lbs')
    })

    it('setState can be used to directly set the weight unit', () => {
      useSettingsStore.setState({ weightUnit: 'kg' })
      expect(useSettingsStore.getState().weightUnit).toBe('kg')
    })
  })

  describe('store subscription', () => {
    it('notifies subscribers on state change', () => {
      const listener = vi.fn()
      const unsub = useSettingsStore.subscribe(listener)

      useSettingsStore.getState().setWeightUnit('kg')
      expect(listener).toHaveBeenCalledTimes(1)

      useSettingsStore.getState().setWeightUnit('lbs')
      expect(listener).toHaveBeenCalledTimes(2)

      unsub()
    })

    it('does not notify after unsubscribe', () => {
      const listener = vi.fn()
      const unsub = useSettingsStore.subscribe(listener)
      unsub()

      useSettingsStore.getState().setWeightUnit('kg')
      expect(listener).not.toHaveBeenCalled()
    })
  })
})

describe('convertWeight - comprehensive edge cases', () => {
  describe('negative values', () => {
    it('handles negative lbs to kg', () => {
      const result = convertWeight(-100, 'lbs', 'kg')
      expect(result).toBe(-45.4)
    })

    it('handles negative kg to lbs', () => {
      const result = convertWeight(-50, 'kg', 'lbs')
      expect(result).toBe(-110.2)
    })

    it('returns negative value unchanged for same-unit conversion', () => {
      expect(convertWeight(-25, 'lbs', 'lbs')).toBe(-25)
      expect(convertWeight(-25, 'kg', 'kg')).toBe(-25)
    })
  })

  describe('very large values', () => {
    it('converts large lbs to kg', () => {
      const result = convertWeight(10000, 'lbs', 'kg')
      expect(result).toBe(4535.9)
    })

    it('converts large kg to lbs', () => {
      const result = convertWeight(10000, 'kg', 'lbs')
      expect(result).toBe(22046.2)
    })
  })

  describe('very small values', () => {
    it('converts fractional lbs to kg', () => {
      const result = convertWeight(0.5, 'lbs', 'kg')
      expect(result).toBe(0.2)
    })

    it('converts fractional kg to lbs', () => {
      const result = convertWeight(0.5, 'kg', 'lbs')
      expect(result).toBe(1.1)
    })

    it('converts very small values close to zero', () => {
      const result = convertWeight(0.1, 'lbs', 'kg')
      expect(result).toBeCloseTo(0, 1)
    })
  })

  describe('round-trip conversions', () => {
    it('lbs -> kg -> lbs is approximately the original value', () => {
      const original = 100
      const toKg = convertWeight(original, 'lbs', 'kg')
      const backToLbs = convertWeight(toKg, 'kg', 'lbs')
      // Due to rounding, it may not be exact
      expect(backToLbs).toBeCloseTo(original, 0)
    })

    it('kg -> lbs -> kg is approximately the original value', () => {
      const original = 50
      const toLbs = convertWeight(original, 'kg', 'lbs')
      const backToKg = convertWeight(toLbs, 'lbs', 'kg')
      expect(backToKg).toBeCloseTo(original, 0)
    })
  })

  describe('precision and rounding', () => {
    it('rounds down correctly for lbs to kg', () => {
      // 1 lbs = 0.453592 kg, rounds to 0.5
      expect(convertWeight(1, 'lbs', 'kg')).toBe(0.5)
    })

    it('rounds correctly at the boundary', () => {
      // 5 lbs = 2.26796 kg, rounds to 2.3
      expect(convertWeight(5, 'lbs', 'kg')).toBe(2.3)
    })

    it('preserves whole numbers when result is exact', () => {
      // 0 always stays 0
      expect(convertWeight(0, 'lbs', 'kg')).toBe(0)
      expect(convertWeight(0, 'kg', 'lbs')).toBe(0)
    })

    it('handles typical gym weights (lbs to kg)', () => {
      expect(convertWeight(135, 'lbs', 'kg')).toBe(61.2)
      expect(convertWeight(225, 'lbs', 'kg')).toBe(102.1)
      expect(convertWeight(315, 'lbs', 'kg')).toBe(142.9)
      expect(convertWeight(405, 'lbs', 'kg')).toBe(183.7)
    })

    it('handles typical gym weights (kg to lbs)', () => {
      expect(convertWeight(60, 'kg', 'lbs')).toBe(132.3)
      expect(convertWeight(100, 'kg', 'lbs')).toBe(220.5)
      expect(convertWeight(140, 'kg', 'lbs')).toBe(308.6)
    })
  })
})

describe('formatWeightWithUnit - comprehensive edge cases', () => {
  it('formats negative weight', () => {
    expect(formatWeightWithUnit(-10, 'lbs')).toBe('-10 lbs')
  })

  it('formats very large weight', () => {
    expect(formatWeightWithUnit(99999, 'kg')).toBe('99999 kg')
  })

  it('formats weight with many decimal places', () => {
    expect(formatWeightWithUnit(45.123456789, 'kg')).toBe('45.123456789 kg')
  })

  it('formats integer weight without trailing decimal', () => {
    expect(formatWeightWithUnit(100, 'lbs')).toBe('100 lbs')
  })

  it('returns em dash for null regardless of unit', () => {
    expect(formatWeightWithUnit(null, 'lbs')).toBe('—')
    expect(formatWeightWithUnit(null, 'kg')).toBe('—')
  })

  it('formats zero correctly for both units', () => {
    expect(formatWeightWithUnit(0, 'lbs')).toBe('0 lbs')
    expect(formatWeightWithUnit(0, 'kg')).toBe('0 kg')
  })

  it('handles weight of 0.0 (falsy but not null)', () => {
    expect(formatWeightWithUnit(0.0, 'kg')).toBe('0 kg')
  })
})
