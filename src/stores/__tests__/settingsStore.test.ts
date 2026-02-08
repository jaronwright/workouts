import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore, convertWeight, formatWeightWithUnit } from '../settingsStore'

describe('useSettingsStore', () => {
  beforeEach(() => {
    // Reset store to default state
    useSettingsStore.setState({ weightUnit: 'lbs' })
  })

  describe('default state', () => {
    it('defaults to lbs as weight unit', () => {
      const { weightUnit } = useSettingsStore.getState()
      expect(weightUnit).toBe('lbs')
    })
  })

  describe('setWeightUnit', () => {
    it('changes weight unit to kg', () => {
      const { setWeightUnit } = useSettingsStore.getState()
      setWeightUnit('kg')

      expect(useSettingsStore.getState().weightUnit).toBe('kg')
    })

    it('changes weight unit back to lbs', () => {
      useSettingsStore.setState({ weightUnit: 'kg' })
      const { setWeightUnit } = useSettingsStore.getState()
      setWeightUnit('lbs')

      expect(useSettingsStore.getState().weightUnit).toBe('lbs')
    })
  })
})

describe('convertWeight', () => {
  describe('same unit conversion', () => {
    it('returns same value when converting lbs to lbs', () => {
      expect(convertWeight(100, 'lbs', 'lbs')).toBe(100)
    })

    it('returns same value when converting kg to kg', () => {
      expect(convertWeight(50, 'kg', 'kg')).toBe(50)
    })
  })

  describe('lbs to kg conversion', () => {
    it('converts pounds to kilograms correctly', () => {
      // 100 lbs = 45.3592 kg, rounded to 1 decimal = 45.4
      expect(convertWeight(100, 'lbs', 'kg')).toBe(45.4)
    })

    it('converts small weight correctly', () => {
      // 10 lbs = 4.53592 kg, rounded to 1 decimal = 4.5
      expect(convertWeight(10, 'lbs', 'kg')).toBe(4.5)
    })

    it('handles zero weight', () => {
      expect(convertWeight(0, 'lbs', 'kg')).toBe(0)
    })
  })

  describe('kg to lbs conversion', () => {
    it('converts kilograms to pounds correctly', () => {
      // 50 kg = 110.231 lbs, rounded to 1 decimal = 110.2
      expect(convertWeight(50, 'kg', 'lbs')).toBe(110.2)
    })

    it('converts small weight correctly', () => {
      // 10 kg = 22.0462 lbs, rounded to 1 decimal = 22
      expect(convertWeight(10, 'kg', 'lbs')).toBe(22)
    })

    it('handles zero weight', () => {
      expect(convertWeight(0, 'kg', 'lbs')).toBe(0)
    })
  })

  describe('precision', () => {
    it('rounds to one decimal place', () => {
      // 45 lbs = 20.41164 kg, should round to 20.4
      expect(convertWeight(45, 'lbs', 'kg')).toBe(20.4)
    })
  })
})

describe('formatWeightWithUnit', () => {
  it('formats weight with lbs unit', () => {
    expect(formatWeightWithUnit(135, 'lbs')).toBe('135 lbs')
  })

  it('formats weight with kg unit', () => {
    expect(formatWeightWithUnit(60, 'kg')).toBe('60 kg')
  })

  it('returns em dash for null weight', () => {
    expect(formatWeightWithUnit(null, 'lbs')).toBe('—')
    expect(formatWeightWithUnit(null, 'kg')).toBe('—')
  })

  it('handles zero weight', () => {
    expect(formatWeightWithUnit(0, 'lbs')).toBe('0 lbs')
  })

  it('handles decimal weights', () => {
    expect(formatWeightWithUnit(45.5, 'kg')).toBe('45.5 kg')
  })
})
