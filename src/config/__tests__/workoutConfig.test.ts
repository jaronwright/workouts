import { describe, it, expect } from 'vitest'
import {
  WEIGHTS_CONFIG,
  WORKOUT_DISPLAY_NAMES,
  CATEGORY_DEFAULTS,
  getWeightsStyleByName,
  getWeightsStyleByDayNumber,
  getWorkoutDisplayName,
  getWeightsLabel,
  getCardioStyle,
  getMobilityStyle,
  getCategoryLabel,
  CARDIO_CONFIG,
  MOBILITY_CONFIG
} from '../workoutConfig'

describe('workoutConfig', () => {
  describe('WEIGHTS_CONFIG', () => {
    it('has push, pull, legs entries (PPL)', () => {
      expect(WEIGHTS_CONFIG.push).toBeDefined()
      expect(WEIGHTS_CONFIG.pull).toBeDefined()
      expect(WEIGHTS_CONFIG.legs).toBeDefined()
    })

    it('has upper and lower entries (Upper/Lower)', () => {
      expect(WEIGHTS_CONFIG.upper).toBeDefined()
      expect(WEIGHTS_CONFIG.lower).toBeDefined()
    })

    it('each entry has required WorkoutStyle fields', () => {
      const keys = ['push', 'pull', 'legs', 'upper', 'lower']
      keys.forEach(key => {
        const style = WEIGHTS_CONFIG[key]
        expect(style.color).toBeDefined()
        expect(typeof style.color).toBe('string')
        expect(style.bgColor).toBeDefined()
        expect(typeof style.bgColor).toBe('string')
        expect(style.gradient).toBeDefined()
        expect(typeof style.gradient).toBe('string')
        expect(style.icon).toBeDefined()
      })
    })

    it('upper uses indigo theme', () => {
      expect(WEIGHTS_CONFIG.upper.color).toBe('#6366F1')
      expect(WEIGHTS_CONFIG.upper.gradient).toContain('indigo')
    })

    it('lower uses violet theme', () => {
      expect(WEIGHTS_CONFIG.lower.color).toBe('#8B5CF6')
      expect(WEIGHTS_CONFIG.lower.gradient).toContain('violet')
    })

    it('has Glute Hypertrophy day entries', () => {
      const gluteKeys = ['lower a', 'upper a', 'lower b', 'upper b', 'lower c']
      gluteKeys.forEach(key => {
        const style = WEIGHTS_CONFIG[key]
        expect(style).toBeDefined()
        expect(style.color).toBeDefined()
        expect(style.bgColor).toBeDefined()
        expect(style.gradient).toBeDefined()
        expect(style.icon).toBeDefined()
      })
    })

    it('Glute Hypertrophy lower days use warm pink/rose tones', () => {
      expect(WEIGHTS_CONFIG['lower a'].gradient).toContain('rose')
      expect(WEIGHTS_CONFIG['lower b'].gradient).toContain('pink')
      expect(WEIGHTS_CONFIG['lower c'].gradient).toContain('fuchsia')
    })

    it('PPL entries use indigo/violet/pink theme', () => {
      expect(WEIGHTS_CONFIG.push.color).toBe('#6366F1')
      expect(WEIGHTS_CONFIG.pull.color).toBe('#8B5CF6')
      expect(WEIGHTS_CONFIG.legs.color).toBe('#EC4899')
    })
  })

  describe('WORKOUT_DISPLAY_NAMES', () => {
    it('has PPL display names', () => {
      expect(WORKOUT_DISPLAY_NAMES['push']).toBe('Push')
      expect(WORKOUT_DISPLAY_NAMES['pull']).toBe('Pull')
      expect(WORKOUT_DISPLAY_NAMES['legs']).toBe('Legs')
    })

    it('has Upper/Lower display names', () => {
      expect(WORKOUT_DISPLAY_NAMES['upper']).toBe('Upper')
      expect(WORKOUT_DISPLAY_NAMES['lower']).toBe('Lower')
    })

    it('has cardio display names', () => {
      expect(WORKOUT_DISPLAY_NAMES['cycling']).toBe('Cycling')
      expect(WORKOUT_DISPLAY_NAMES['running']).toBe('Running')
    })

    it('has mobility display names', () => {
      expect(WORKOUT_DISPLAY_NAMES['core stability']).toBe('Core Stability')
      expect(WORKOUT_DISPLAY_NAMES['spine mobility']).toBe('Spine Mobility')
    })

    it('has Glute Hypertrophy display names', () => {
      expect(WORKOUT_DISPLAY_NAMES['lower a']).toBe('Lower A')
      expect(WORKOUT_DISPLAY_NAMES['upper a']).toBe('Upper A')
      expect(WORKOUT_DISPLAY_NAMES['lower b']).toBe('Lower B')
      expect(WORKOUT_DISPLAY_NAMES['upper b']).toBe('Upper B')
      expect(WORKOUT_DISPLAY_NAMES['lower c']).toBe('Lower C')
    })
  })

  describe('getWeightsStyleByName', () => {
    it('returns push style for names containing "push"', () => {
      expect(getWeightsStyleByName('PUSH (Chest, Shoulders, Triceps)')).toBe(WEIGHTS_CONFIG.push)
      expect(getWeightsStyleByName('Push Day')).toBe(WEIGHTS_CONFIG.push)
    })

    it('returns pull style for names containing "pull"', () => {
      expect(getWeightsStyleByName('Pull (Back, Biceps, Rear Delts)')).toBe(WEIGHTS_CONFIG.pull)
      expect(getWeightsStyleByName('PULL')).toBe(WEIGHTS_CONFIG.pull)
    })

    it('returns legs style for names containing "leg"', () => {
      expect(getWeightsStyleByName('LEGS (Quads, Hamstrings, Calves)')).toBe(WEIGHTS_CONFIG.legs)
      expect(getWeightsStyleByName('Leg Day')).toBe(WEIGHTS_CONFIG.legs)
    })

    it('returns upper style for names containing "upper"', () => {
      expect(getWeightsStyleByName('Upper (Chest, Back, Shoulders, Arms)')).toBe(WEIGHTS_CONFIG.upper)
      expect(getWeightsStyleByName('UPPER BODY')).toBe(WEIGHTS_CONFIG.upper)
    })

    it('returns lower style for names containing "lower"', () => {
      expect(getWeightsStyleByName('Lower (Quads, Glutes, Hamstrings, Calves)')).toBe(WEIGHTS_CONFIG.lower)
      expect(getWeightsStyleByName('lower body')).toBe(WEIGHTS_CONFIG.lower)
    })

    it('returns default weights style for unknown names', () => {
      expect(getWeightsStyleByName('Full Body')).toBe(CATEGORY_DEFAULTS.weights)
      expect(getWeightsStyleByName('Unknown Workout')).toBe(CATEGORY_DEFAULTS.weights)
    })

    it('is case-insensitive', () => {
      expect(getWeightsStyleByName('PUSH')).toBe(WEIGHTS_CONFIG.push)
      expect(getWeightsStyleByName('push')).toBe(WEIGHTS_CONFIG.push)
      expect(getWeightsStyleByName('Push')).toBe(WEIGHTS_CONFIG.push)
      expect(getWeightsStyleByName('UPPER')).toBe(WEIGHTS_CONFIG.upper)
      expect(getWeightsStyleByName('upper')).toBe(WEIGHTS_CONFIG.upper)
    })

    it('prioritizes earlier matches (push before pull in compound names)', () => {
      // "push" check comes before "pull" in the function
      const result = getWeightsStyleByName('push-pull hybrid')
      expect(result).toBe(WEIGHTS_CONFIG.push)
    })

    it('returns lower a style for Glute Hypertrophy day names', () => {
      expect(getWeightsStyleByName('Lower A (Glutes & Hamstrings)')).toBe(WEIGHTS_CONFIG['lower a'])
    })

    it('returns upper a style for Glute Hypertrophy upper day names', () => {
      expect(getWeightsStyleByName('Upper A (Push & Pull)')).toBe(WEIGHTS_CONFIG['upper a'])
    })

    it('returns lower b style and not generic lower', () => {
      expect(getWeightsStyleByName('Lower B (Quads & Glutes)')).toBe(WEIGHTS_CONFIG['lower b'])
    })

    it('returns upper b style and not generic upper', () => {
      expect(getWeightsStyleByName('Upper B (Shoulders & Back)')).toBe(WEIGHTS_CONFIG['upper b'])
    })

    it('returns lower c style for Glute Hypertrophy isolation day', () => {
      expect(getWeightsStyleByName('Lower C (Glute Isolation)')).toBe(WEIGHTS_CONFIG['lower c'])
    })

    it('still returns generic upper for non-Glute Hypertrophy upper names', () => {
      expect(getWeightsStyleByName('UPPER BODY')).toBe(WEIGHTS_CONFIG.upper)
      expect(getWeightsStyleByName('Upper (Chest, Back, Shoulders, Arms)')).toBe(WEIGHTS_CONFIG.upper)
    })

    it('still returns generic lower for non-Glute Hypertrophy lower names', () => {
      expect(getWeightsStyleByName('lower body')).toBe(WEIGHTS_CONFIG.lower)
      expect(getWeightsStyleByName('Lower (Quads, Glutes, Hamstrings, Calves)')).toBe(WEIGHTS_CONFIG.lower)
    })
  })

  describe('getWorkoutDisplayName', () => {
    it('returns "Push" for push workout names', () => {
      expect(getWorkoutDisplayName('PUSH (Chest, Shoulders, Triceps)')).toBe('Push')
    })

    it('returns "Pull" for pull workout names', () => {
      expect(getWorkoutDisplayName('Pull (Back, Biceps, Rear Delts)')).toBe('Pull')
    })

    it('returns "Legs" for legs workout names', () => {
      expect(getWorkoutDisplayName('LEGS (Quads, Hamstrings, Calves)')).toBe('Legs')
    })

    it('returns "Upper" for upper workout names', () => {
      expect(getWorkoutDisplayName('Upper (Chest, Back, Shoulders, Arms)')).toBe('Upper')
    })

    it('returns "Lower" for lower workout names', () => {
      expect(getWorkoutDisplayName('Lower (Quads, Glutes, Hamstrings, Calves)')).toBe('Lower')
    })

    it('handles exact lowercase matches', () => {
      expect(getWorkoutDisplayName('cycling')).toBe('Cycling')
      expect(getWorkoutDisplayName('core stability')).toBe('Core Stability')
    })

    it('returns "Workout" for null/undefined input', () => {
      expect(getWorkoutDisplayName(null)).toBe('Workout')
      expect(getWorkoutDisplayName(undefined)).toBe('Workout')
    })

    it('falls back to title-cased first word for unknown names', () => {
      expect(getWorkoutDisplayName('Something Unknown')).toBe('Something')
    })

    it('returns correct display names for Glute Hypertrophy days', () => {
      expect(getWorkoutDisplayName('Lower A (Glutes & Hamstrings)')).toBe('Lower A')
      expect(getWorkoutDisplayName('Upper A (Push & Pull)')).toBe('Upper A')
      expect(getWorkoutDisplayName('Lower B (Quads & Glutes)')).toBe('Lower B')
      expect(getWorkoutDisplayName('Upper B (Shoulders & Back)')).toBe('Upper B')
      expect(getWorkoutDisplayName('Lower C (Glute Isolation)')).toBe('Lower C')
    })
  })

  describe('getWeightsStyleByDayNumber', () => {
    it('returns push for day 1', () => {
      expect(getWeightsStyleByDayNumber(1)).toBe(WEIGHTS_CONFIG.push)
    })

    it('returns pull for day 2', () => {
      expect(getWeightsStyleByDayNumber(2)).toBe(WEIGHTS_CONFIG.pull)
    })

    it('returns legs for day 3', () => {
      expect(getWeightsStyleByDayNumber(3)).toBe(WEIGHTS_CONFIG.legs)
    })

    it('returns default for unknown day numbers', () => {
      expect(getWeightsStyleByDayNumber(4)).toBe(CATEGORY_DEFAULTS.weights)
      expect(getWeightsStyleByDayNumber(99)).toBe(CATEGORY_DEFAULTS.weights)
    })
  })

  describe('getWeightsLabel', () => {
    it('returns Push/Pull/Legs for days 1-3', () => {
      expect(getWeightsLabel(1)).toBe('Push')
      expect(getWeightsLabel(2)).toBe('Pull')
      expect(getWeightsLabel(3)).toBe('Legs')
    })

    it('returns "Day N" for unknown day numbers', () => {
      expect(getWeightsLabel(4)).toBe('Day 4')
      expect(getWeightsLabel(99)).toBe('Day 99')
    })
  })

  describe('getCardioStyle', () => {
    it('returns specific style for known cardio categories', () => {
      expect(getCardioStyle('cycle')).toBe(CARDIO_CONFIG.cycle)
      expect(getCardioStyle('run')).toBe(CARDIO_CONFIG.run)
      expect(getCardioStyle('swim')).toBe(CARDIO_CONFIG.swim)
    })

    it('returns default cardio style for null/unknown', () => {
      expect(getCardioStyle(null)).toBe(CATEGORY_DEFAULTS.cardio)
      expect(getCardioStyle('unknown')).toBe(CATEGORY_DEFAULTS.cardio)
    })
  })

  describe('getMobilityStyle', () => {
    it('returns specific style for known mobility categories', () => {
      expect(getMobilityStyle('core')).toBe(MOBILITY_CONFIG.core)
      expect(getMobilityStyle('spine')).toBe(MOBILITY_CONFIG.spine)
    })

    it('returns default mobility style for null/unknown', () => {
      expect(getMobilityStyle(null)).toBe(CATEGORY_DEFAULTS.mobility)
      expect(getMobilityStyle('unknown')).toBe(CATEGORY_DEFAULTS.mobility)
    })
  })

  describe('getCategoryLabel', () => {
    it('returns labels for known categories', () => {
      expect(getCategoryLabel('weights')).toBe('Weights')
      expect(getCategoryLabel('cardio')).toBe('Cardio')
      expect(getCategoryLabel('mobility')).toBe('Mobility')
      expect(getCategoryLabel('rest')).toBe('Rest Day')
    })

    it('is case-insensitive', () => {
      expect(getCategoryLabel('Weights')).toBe('Weights')
      expect(getCategoryLabel('CARDIO')).toBe('Cardio')
    })

    it('returns input for unknown categories', () => {
      expect(getCategoryLabel('unknown')).toBe('unknown')
    })
  })
})
