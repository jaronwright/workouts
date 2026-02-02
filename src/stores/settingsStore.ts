import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WeightUnit = 'lbs' | 'kg'

interface SettingsState {
  weightUnit: WeightUnit
  setWeightUnit: (unit: WeightUnit) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      weightUnit: 'lbs', // Default to pounds

      setWeightUnit: (unit) => set({ weightUnit: unit })
    }),
    {
      name: 'workout-settings',
      partialize: (state) => ({ weightUnit: state.weightUnit })
    }
  )
)

// Utility functions for weight conversion
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value
  if (from === 'lbs' && to === 'kg') {
    return Math.round(value * 0.453592 * 10) / 10 // Round to 1 decimal
  }
  if (from === 'kg' && to === 'lbs') {
    return Math.round(value * 2.20462 * 10) / 10 // Round to 1 decimal
  }
  return value
}

export function formatWeightWithUnit(weight: number | null, unit: WeightUnit): string {
  if (weight === null) return '—'
  return `${weight} ${unit}`
}
