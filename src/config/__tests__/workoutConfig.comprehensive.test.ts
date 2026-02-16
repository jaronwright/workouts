import { describe, it, expect } from 'vitest'
import {
  getWorkoutDisplayName,
  getWeightsStyleByName,
  getCardioStyle,
  getMobilityStyle,
  getCategoryLabel,
  getWeightsStyleByDayNumber,
  getWeightsLabel,
  WEIGHTS_CONFIG,
  CARDIO_CONFIG,
  MOBILITY_CONFIG,
  CATEGORY_DEFAULTS
} from '@/config/workoutConfig'

describe('getWorkoutDisplayName', () => {
  describe('weights workouts', () => {
    it('maps "PUSH (Chest, Shoulders, Triceps)" to "Push"', () => {
      expect(getWorkoutDisplayName('PUSH (Chest, Shoulders, Triceps)')).toBe('Push')
    })

    it('maps "Pull (Back, Biceps, Rear Delts)" to "Pull"', () => {
      expect(getWorkoutDisplayName('Pull (Back, Biceps, Rear Delts)')).toBe('Pull')
    })

    it('maps "LEGS (Quads, Hamstrings, Calves)" to "Legs"', () => {
      expect(getWorkoutDisplayName('LEGS (Quads, Hamstrings, Calves)')).toBe('Legs')
    })

    it('maps "upper" to "Upper"', () => {
      expect(getWorkoutDisplayName('upper')).toBe('Upper')
    })

    it('maps "lower" to "Lower"', () => {
      expect(getWorkoutDisplayName('lower')).toBe('Lower')
    })
  })

  describe('new split workouts', () => {
    it('maps "Full Body A" to "Full Body A"', () => {
      expect(getWorkoutDisplayName('Full Body A')).toBe('Full Body A')
    })

    it('maps "full body b" to "Full Body B"', () => {
      expect(getWorkoutDisplayName('full body b')).toBe('Full Body B')
    })

    it('maps "chest" to "Chest"', () => {
      expect(getWorkoutDisplayName('chest')).toBe('Chest')
    })

    it('maps "back" to "Back"', () => {
      expect(getWorkoutDisplayName('back')).toBe('Back')
    })

    it('maps "shoulders" to "Shoulders"', () => {
      expect(getWorkoutDisplayName('shoulders')).toBe('Shoulders')
    })

    it('maps "arms" to "Arms"', () => {
      expect(getWorkoutDisplayName('arms')).toBe('Arms')
    })

    it('maps "Chest & Back" to "Chest & Back"', () => {
      expect(getWorkoutDisplayName('Chest & Back')).toBe('Chest & Back')
    })

    it('maps "Shoulders & Arms" to "Shoulders & Arms"', () => {
      expect(getWorkoutDisplayName('Shoulders & Arms')).toBe('Shoulders & Arms')
    })
  })

  describe('edge cases', () => {
    it('returns "Workout" for null', () => {
      expect(getWorkoutDisplayName(null)).toBe('Workout')
    })

    it('returns "Workout" for undefined', () => {
      expect(getWorkoutDisplayName(undefined)).toBe('Workout')
    })

    it('returns "Workout" for empty string', () => {
      // Empty string is falsy, so the guard returns 'Workout'
      expect(getWorkoutDisplayName('')).toBe('Workout')
    })

    it('handles unknown workout name with title case fallback', () => {
      const result = getWorkoutDisplayName('customWorkout')
      expect(result).toBe('Customworkout')
    })
  })

  describe('cardio and mobility workouts', () => {
    it('maps "Cycling" to "Cycling"', () => {
      expect(getWorkoutDisplayName('Cycling')).toBe('Cycling')
    })

    it('maps "Running" to "Running"', () => {
      expect(getWorkoutDisplayName('Running')).toBe('Running')
    })

    it('maps "Core Stability" to "Core Stability"', () => {
      expect(getWorkoutDisplayName('Core Stability')).toBe('Core Stability')
    })
  })
})

describe('getWeightsStyleByName', () => {
  it('returns style for "push"', () => {
    const style = getWeightsStyleByName('push')
    expect(style.color).toBe('#6366F1')
    expect(style.icon).toBeDefined()
  })

  it('returns style for "PUSH (Chest, Shoulders, Triceps)"', () => {
    const style = getWeightsStyleByName('PUSH (Chest, Shoulders, Triceps)')
    expect(style.color).toBe('#6366F1')
  })

  it('returns style for "Full Body A"', () => {
    const style = getWeightsStyleByName('Full Body A')
    expect(style.color).toBe('#10B981') // emerald
  })

  it('returns style for "Chest & Back"', () => {
    const style = getWeightsStyleByName('Chest & Back')
    expect(style.color).toBe('#F43F5E') // rose
  })

  it('returns style for "Shoulders & Arms"', () => {
    const style = getWeightsStyleByName('Shoulders & Arms')
    expect(style.color).toBe('#D946EF') // fuchsia
  })

  it('returns style for "chest"', () => {
    const style = getWeightsStyleByName('chest')
    expect(style.color).toBe('#E63B57') // rose
  })

  it('returns default style for unknown name', () => {
    const style = getWeightsStyleByName('totally unknown')
    expect(style).toEqual(CATEGORY_DEFAULTS.weights)
  })

  it('handles empty string', () => {
    const style = getWeightsStyleByName('')
    expect(style).toBeDefined()
    expect(style.color).toBeDefined()
  })
})

describe('getCardioStyle', () => {
  it('returns cycle style', () => {
    const style = getCardioStyle('cycle')
    expect(style.color).toBe('#14B8A6')
  })

  it('returns running style', () => {
    const style = getCardioStyle('running')
    expect(style).toBeDefined()
  })

  it('returns default for null', () => {
    const style = getCardioStyle(null)
    expect(style).toEqual(CATEGORY_DEFAULTS.cardio)
  })

  it('returns default for unknown category', () => {
    const style = getCardioStyle('unknown')
    expect(style).toEqual(CATEGORY_DEFAULTS.cardio)
  })
})

describe('getMobilityStyle', () => {
  it('returns core_stability style', () => {
    const style = getMobilityStyle('core_stability')
    expect(style).toBeDefined()
    expect(style.color).toBeDefined()
  })

  it('returns default for null', () => {
    const style = getMobilityStyle(null)
    expect(style).toEqual(CATEGORY_DEFAULTS.mobility)
  })

  it('returns default for unknown category', () => {
    const style = getMobilityStyle('unknown')
    expect(style).toEqual(CATEGORY_DEFAULTS.mobility)
  })
})

describe('getCategoryLabel', () => {
  it('returns "Weights" for "weights"', () => {
    expect(getCategoryLabel('weights')).toBe('Weights')
  })

  it('returns "Cardio" for "cardio"', () => {
    expect(getCategoryLabel('cardio')).toBe('Cardio')
  })

  it('returns "Mobility" for "mobility"', () => {
    expect(getCategoryLabel('mobility')).toBe('Mobility')
  })

  it('returns "Rest Day" for "rest"', () => {
    expect(getCategoryLabel('rest')).toBe('Rest Day')
  })

  it('returns input for unknown category', () => {
    expect(getCategoryLabel('unknown')).toBe('unknown')
  })

  it('is case-insensitive', () => {
    expect(getCategoryLabel('WEIGHTS')).toBe('Weights')
    expect(getCategoryLabel('Cardio')).toBe('Cardio')
  })
})

describe('getWeightsStyleByDayNumber', () => {
  it('returns push style for day 1', () => {
    expect(getWeightsStyleByDayNumber(1)).toEqual(WEIGHTS_CONFIG.push)
  })

  it('returns pull style for day 2', () => {
    expect(getWeightsStyleByDayNumber(2)).toEqual(WEIGHTS_CONFIG.pull)
  })

  it('returns legs style for day 3', () => {
    expect(getWeightsStyleByDayNumber(3)).toEqual(WEIGHTS_CONFIG.legs)
  })

  it('returns default for day 4+', () => {
    expect(getWeightsStyleByDayNumber(4)).toEqual(CATEGORY_DEFAULTS.weights)
    expect(getWeightsStyleByDayNumber(99)).toEqual(CATEGORY_DEFAULTS.weights)
  })
})

describe('getWeightsLabel', () => {
  it('returns "Push" for day 1', () => {
    expect(getWeightsLabel(1)).toBe('Push')
  })

  it('returns "Pull" for day 2', () => {
    expect(getWeightsLabel(2)).toBe('Pull')
  })

  it('returns "Legs" for day 3', () => {
    expect(getWeightsLabel(3)).toBe('Legs')
  })

  it('returns "Day N" for day 4+', () => {
    expect(getWeightsLabel(4)).toBe('Day 4')
    expect(getWeightsLabel(10)).toBe('Day 10')
  })
})

describe('Config objects have all required properties', () => {
  it('all WEIGHTS_CONFIG entries have color, bgColor, gradient, icon', () => {
    Object.entries(WEIGHTS_CONFIG).forEach(([key, style]) => {
      expect(style.color, `${key} missing color`).toBeDefined()
      expect(style.bgColor, `${key} missing bgColor`).toBeDefined()
      expect(style.gradient, `${key} missing gradient`).toBeDefined()
      expect(style.icon, `${key} missing icon`).toBeDefined()
    })
  })

  it('all CARDIO_CONFIG entries have color, bgColor, gradient, icon', () => {
    Object.entries(CARDIO_CONFIG).forEach(([key, style]) => {
      expect(style.color, `${key} missing color`).toBeDefined()
      expect(style.bgColor, `${key} missing bgColor`).toBeDefined()
      expect(style.gradient, `${key} missing gradient`).toBeDefined()
      expect(style.icon, `${key} missing icon`).toBeDefined()
    })
  })

  it('all MOBILITY_CONFIG entries have color, bgColor, gradient, icon', () => {
    Object.entries(MOBILITY_CONFIG).forEach(([key, style]) => {
      expect(style.color, `${key} missing color`).toBeDefined()
      expect(style.bgColor, `${key} missing bgColor`).toBeDefined()
      expect(style.gradient, `${key} missing gradient`).toBeDefined()
      expect(style.icon, `${key} missing icon`).toBeDefined()
    })
  })
})
