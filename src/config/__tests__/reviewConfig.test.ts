import { describe, it, expect } from 'vitest'
import {
  MOOD_OPTIONS,
  MOOD_MAP,
  PERFORMANCE_TAG_OPTIONS,
  TAG_MAP,
  RATING_LABELS,
  DIFFICULTY_LABELS,
  ENERGY_LABELS,
  RATING_COLORS,
  DIFFICULTY_COLORS,
  ENERGY_COLORS,
  type MoodOption,
  type TagOption,
} from '../reviewConfig'
import type { MoodValue, PerformanceTag } from '@/services/reviewService'

describe('reviewConfig', () => {
  // ────────────────────────────────────────────────────────
  // MOOD_OPTIONS
  // ────────────────────────────────────────────────────────

  describe('MOOD_OPTIONS', () => {
    it('has exactly 5 mood options', () => {
      expect(MOOD_OPTIONS).toHaveLength(5)
    })

    it('covers all MoodValue types', () => {
      const values = MOOD_OPTIONS.map((m) => m.value)
      const expectedMoods: MoodValue[] = ['great', 'good', 'neutral', 'tired', 'stressed']

      expect(values).toEqual(expect.arrayContaining(expectedMoods))
      expect(expectedMoods).toEqual(expect.arrayContaining(values))
    })

    it('each option has required fields', () => {
      for (const option of MOOD_OPTIONS) {
        expect(option.value).toBeTruthy()
        expect(option.emoji).toBeTruthy()
        expect(option.label).toBeTruthy()
        expect(option.color).toBeTruthy()
        expect(option.bgColor).toBeTruthy()
      }
    })

    it('each option has a valid hex color', () => {
      for (const option of MOOD_OPTIONS) {
        expect(option.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      }
    })

    it('each option has an rgba bgColor', () => {
      for (const option of MOOD_OPTIONS) {
        expect(option.bgColor).toMatch(/^rgba\(/)
      }
    })
  })

  // ────────────────────────────────────────────────────────
  // MOOD_MAP
  // ────────────────────────────────────────────────────────

  describe('MOOD_MAP', () => {
    it('maps all MoodValue keys', () => {
      const expectedKeys: MoodValue[] = ['great', 'good', 'neutral', 'tired', 'stressed']

      for (const key of expectedKeys) {
        expect(MOOD_MAP[key]).toBeDefined()
        expect(MOOD_MAP[key].value).toBe(key)
      }
    })

    it('each mapped value matches a MOOD_OPTIONS entry', () => {
      for (const option of MOOD_OPTIONS) {
        expect(MOOD_MAP[option.value]).toEqual(option)
      }
    })
  })

  // ────────────────────────────────────────────────────────
  // PERFORMANCE_TAG_OPTIONS
  // ────────────────────────────────────────────────────────

  describe('PERFORMANCE_TAG_OPTIONS', () => {
    it('has exactly 12 tag options', () => {
      expect(PERFORMANCE_TAG_OPTIONS).toHaveLength(12)
    })

    it('covers all PerformanceTag types', () => {
      const values = PERFORMANCE_TAG_OPTIONS.map((t) => t.value)
      const expectedTags: PerformanceTag[] = [
        'felt_strong', 'new_pr', 'tired', 'pumped', 'rushed',
        'sore', 'focused', 'distracted', 'good_form', 'heavy',
        'light_day', 'breakthrough',
      ]

      expect(values).toEqual(expect.arrayContaining(expectedTags))
      expect(expectedTags).toEqual(expect.arrayContaining(values))
    })

    it('each option has required fields', () => {
      for (const option of PERFORMANCE_TAG_OPTIONS) {
        expect(option.value).toBeTruthy()
        expect(option.label).toBeTruthy()
        expect(option.icon).toBeDefined()
        expect(option.color).toBeTruthy()
      }
    })

    it('each option has a valid hex color', () => {
      for (const option of PERFORMANCE_TAG_OPTIONS) {
        expect(option.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      }
    })

    it('each option has a Lucide icon component', () => {
      for (const option of PERFORMANCE_TAG_OPTIONS) {
        // Lucide icons are React forwardRef components (object with $$typeof or render)
        expect(option.icon).toBeDefined()
        expect(['function', 'object']).toContain(typeof option.icon)
      }
    })

    it('has unique values (no duplicates)', () => {
      const values = PERFORMANCE_TAG_OPTIONS.map((t) => t.value)
      const unique = new Set(values)
      expect(unique.size).toBe(values.length)
    })
  })

  // ────────────────────────────────────────────────────────
  // TAG_MAP
  // ────────────────────────────────────────────────────────

  describe('TAG_MAP', () => {
    it('maps all PerformanceTag keys', () => {
      const expectedKeys: PerformanceTag[] = [
        'felt_strong', 'new_pr', 'tired', 'pumped', 'rushed',
        'sore', 'focused', 'distracted', 'good_form', 'heavy',
        'light_day', 'breakthrough',
      ]

      for (const key of expectedKeys) {
        expect(TAG_MAP[key]).toBeDefined()
        expect(TAG_MAP[key].value).toBe(key)
      }
    })

    it('each mapped value matches a PERFORMANCE_TAG_OPTIONS entry', () => {
      for (const option of PERFORMANCE_TAG_OPTIONS) {
        expect(TAG_MAP[option.value]).toEqual(option)
      }
    })
  })

  // ────────────────────────────────────────────────────────
  // RATING_LABELS
  // ────────────────────────────────────────────────────────

  describe('RATING_LABELS', () => {
    it('covers ratings 1 through 5', () => {
      for (let i = 1; i <= 5; i++) {
        expect(RATING_LABELS[i]).toBeDefined()
        expect(typeof RATING_LABELS[i]).toBe('string')
        expect(RATING_LABELS[i].length).toBeGreaterThan(0)
      }
    })

    it('has correct label for each rating', () => {
      expect(RATING_LABELS[1]).toBe('Poor')
      expect(RATING_LABELS[2]).toBe('Fair')
      expect(RATING_LABELS[3]).toBe('Good')
      expect(RATING_LABELS[4]).toBe('Great')
      expect(RATING_LABELS[5]).toBe('Amazing')
    })
  })

  // ────────────────────────────────────────────────────────
  // DIFFICULTY_LABELS
  // ────────────────────────────────────────────────────────

  describe('DIFFICULTY_LABELS', () => {
    it('covers ratings 1 through 5', () => {
      for (let i = 1; i <= 5; i++) {
        expect(DIFFICULTY_LABELS[i]).toBeDefined()
        expect(typeof DIFFICULTY_LABELS[i]).toBe('string')
        expect(DIFFICULTY_LABELS[i].length).toBeGreaterThan(0)
      }
    })

    it('has correct label for each difficulty', () => {
      expect(DIFFICULTY_LABELS[1]).toBe('Easy')
      expect(DIFFICULTY_LABELS[2]).toBe('Moderate')
      expect(DIFFICULTY_LABELS[3]).toBe('Challenging')
      expect(DIFFICULTY_LABELS[4]).toBe('Hard')
      expect(DIFFICULTY_LABELS[5]).toBe('Brutal')
    })
  })

  // ────────────────────────────────────────────────────────
  // ENERGY_LABELS
  // ────────────────────────────────────────────────────────

  describe('ENERGY_LABELS', () => {
    it('covers ratings 1 through 5', () => {
      for (let i = 1; i <= 5; i++) {
        expect(ENERGY_LABELS[i]).toBeDefined()
        expect(typeof ENERGY_LABELS[i]).toBe('string')
        expect(ENERGY_LABELS[i].length).toBeGreaterThan(0)
      }
    })

    it('has correct label for each energy level', () => {
      expect(ENERGY_LABELS[1]).toBe('Drained')
      expect(ENERGY_LABELS[2]).toBe('Low')
      expect(ENERGY_LABELS[3]).toBe('Normal')
      expect(ENERGY_LABELS[4]).toBe('High')
      expect(ENERGY_LABELS[5]).toBe('Energized')
    })
  })

  // ────────────────────────────────────────────────────────
  // Color maps
  // ────────────────────────────────────────────────────────

  describe('color maps', () => {
    it('RATING_COLORS covers ratings 1-5 with hex colors', () => {
      for (let i = 1; i <= 5; i++) {
        expect(RATING_COLORS[i]).toMatch(/^#[0-9A-Fa-f]{6}$/)
      }
    })

    it('DIFFICULTY_COLORS covers ratings 1-5 with hex colors', () => {
      for (let i = 1; i <= 5; i++) {
        expect(DIFFICULTY_COLORS[i]).toMatch(/^#[0-9A-Fa-f]{6}$/)
      }
    })

    it('ENERGY_COLORS covers ratings 1-5 with hex colors', () => {
      for (let i = 1; i <= 5; i++) {
        expect(ENERGY_COLORS[i]).toMatch(/^#[0-9A-Fa-f]{6}$/)
      }
    })
  })

})
