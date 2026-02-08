import { describe, it, expect } from 'vitest'
import {
  WEIGHTS_CONFIG,
  WORKOUT_DISPLAY_NAMES,
  getWeightsStyleByName,
  getWorkoutDisplayName,
  CATEGORY_DEFAULTS,
} from '@/config/workoutConfig'

describe('New Splits - WEIGHTS_CONFIG', () => {
  it('has all Full Body day entries', () => {
    expect(WEIGHTS_CONFIG['full body a']).toBeDefined()
    expect(WEIGHTS_CONFIG['full body b']).toBeDefined()
    expect(WEIGHTS_CONFIG['full body c']).toBeDefined()
    expect(WEIGHTS_CONFIG['full body d']).toBeDefined()
    expect(WEIGHTS_CONFIG['full body e']).toBeDefined()
  })

  it('has all Bro Split day entries', () => {
    expect(WEIGHTS_CONFIG['chest']).toBeDefined()
    expect(WEIGHTS_CONFIG['back']).toBeDefined()
    expect(WEIGHTS_CONFIG['shoulders']).toBeDefined()
    expect(WEIGHTS_CONFIG['arms']).toBeDefined()
    // 'legs' already exists from PPL
    expect(WEIGHTS_CONFIG['legs']).toBeDefined()
  })

  it('has all Arnold Split day entries', () => {
    expect(WEIGHTS_CONFIG['chest & back']).toBeDefined()
    expect(WEIGHTS_CONFIG['shoulders & arms']).toBeDefined()
    // 'legs' reused from PPL
  })

  it('each entry has required properties', () => {
    const newKeys = [
      'full body a', 'full body b', 'full body c', 'full body d', 'full body e',
      'chest', 'back', 'shoulders', 'arms',
      'chest & back', 'shoulders & arms',
    ]
    for (const key of newKeys) {
      const config = WEIGHTS_CONFIG[key]
      expect(config.color).toBeTruthy()
      expect(config.bgColor).toBeTruthy()
      expect(config.gradient).toBeTruthy()
      expect(config.icon).toBeTruthy()
    }
  })
})

describe('New Splits - WORKOUT_DISPLAY_NAMES', () => {
  it('has display names for Full Body days', () => {
    expect(WORKOUT_DISPLAY_NAMES['full body a']).toBe('Full Body A')
    expect(WORKOUT_DISPLAY_NAMES['full body e']).toBe('Full Body E')
  })

  it('has display names for Bro Split days', () => {
    expect(WORKOUT_DISPLAY_NAMES['chest']).toBe('Chest')
    expect(WORKOUT_DISPLAY_NAMES['back']).toBe('Back')
    expect(WORKOUT_DISPLAY_NAMES['shoulders']).toBe('Shoulders')
    expect(WORKOUT_DISPLAY_NAMES['arms']).toBe('Arms')
  })

  it('has display names for Arnold Split days', () => {
    expect(WORKOUT_DISPLAY_NAMES['chest & back']).toBe('Chest & Back')
    expect(WORKOUT_DISPLAY_NAMES['shoulders & arms']).toBe('Shoulders & Arms')
  })
})

describe('New Splits - getWeightsStyleByName', () => {
  it('returns correct style for Full Body days', () => {
    expect(getWeightsStyleByName('Full Body A')).toBe(WEIGHTS_CONFIG['full body a'])
    expect(getWeightsStyleByName('Full Body B')).toBe(WEIGHTS_CONFIG['full body b'])
    expect(getWeightsStyleByName('Full Body C')).toBe(WEIGHTS_CONFIG['full body c'])
    expect(getWeightsStyleByName('Full Body D')).toBe(WEIGHTS_CONFIG['full body d'])
    expect(getWeightsStyleByName('Full Body E')).toBe(WEIGHTS_CONFIG['full body e'])
  })

  it('returns correct style for Bro Split days', () => {
    expect(getWeightsStyleByName('Chest')).toBe(WEIGHTS_CONFIG['chest'])
    expect(getWeightsStyleByName('Back')).toBe(WEIGHTS_CONFIG['back'])
    expect(getWeightsStyleByName('Shoulders')).toBe(WEIGHTS_CONFIG['shoulders'])
    expect(getWeightsStyleByName('Arms')).toBe(WEIGHTS_CONFIG['arms'])
  })

  it('returns correct style for Arnold Split days', () => {
    expect(getWeightsStyleByName('Chest & Back')).toBe(WEIGHTS_CONFIG['chest & back'])
    expect(getWeightsStyleByName('Shoulders & Arms')).toBe(WEIGHTS_CONFIG['shoulders & arms'])
  })

  it('is case-insensitive', () => {
    expect(getWeightsStyleByName('FULL BODY A')).toBe(WEIGHTS_CONFIG['full body a'])
    expect(getWeightsStyleByName('chest')).toBe(WEIGHTS_CONFIG['chest'])
    expect(getWeightsStyleByName('CHEST & BACK')).toBe(WEIGHTS_CONFIG['chest & back'])
  })

  it('still returns fallback for unknown names', () => {
    expect(getWeightsStyleByName('Unknown Workout')).toBe(CATEGORY_DEFAULTS.weights)
  })
})

describe('New Splits - getWorkoutDisplayName', () => {
  it('returns correct display names for Full Body days', () => {
    expect(getWorkoutDisplayName('Full Body A')).toBe('Full Body A')
    expect(getWorkoutDisplayName('Full Body E')).toBe('Full Body E')
  })

  it('returns correct display names for Bro Split days', () => {
    expect(getWorkoutDisplayName('Chest')).toBe('Chest')
    expect(getWorkoutDisplayName('Back')).toBe('Back')
    expect(getWorkoutDisplayName('Shoulders')).toBe('Shoulders')
    expect(getWorkoutDisplayName('Arms')).toBe('Arms')
    expect(getWorkoutDisplayName('Legs')).toBe('Legs')
  })

  it('returns correct display names for Arnold Split days', () => {
    expect(getWorkoutDisplayName('Chest & Back')).toBe('Chest & Back')
    expect(getWorkoutDisplayName('Shoulders & Arms')).toBe('Shoulders & Arms')
  })
})
