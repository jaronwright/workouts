import { describe, it, expect } from 'vitest'
import {
  DEFAULT_AVATARS,
  isDefaultAvatar,
  getDefaultAvatarKey,
  getDefaultAvatarByKey,
  getRandomDefaultAvatar,
} from '@/config/defaultAvatars'
import type { DefaultAvatar } from '@/config/defaultAvatars'

describe('defaultAvatars', () => {
  describe('DEFAULT_AVATARS', () => {
    it('is a non-empty array', () => {
      expect(Array.isArray(DEFAULT_AVATARS)).toBe(true)
      expect(DEFAULT_AVATARS.length).toBeGreaterThan(0)
    })

    it('contains exactly 8 avatars', () => {
      expect(DEFAULT_AVATARS).toHaveLength(8)
    })

    it('each avatar has the required DefaultAvatar shape', () => {
      DEFAULT_AVATARS.forEach((avatar) => {
        expect(typeof avatar.key).toBe('string')
        expect(typeof avatar.label).toBe('string')
        expect(typeof avatar.svgPath).toBe('string')
        expect(typeof avatar.viewBox).toBe('string')
      })
    })

    it('all keys are non-empty strings', () => {
      DEFAULT_AVATARS.forEach((avatar) => {
        expect(avatar.key.length).toBeGreaterThan(0)
      })
    })

    it('all labels are non-empty strings', () => {
      DEFAULT_AVATARS.forEach((avatar) => {
        expect(avatar.label.length).toBeGreaterThan(0)
      })
    })

    it('all svgPaths are non-empty strings', () => {
      DEFAULT_AVATARS.forEach((avatar) => {
        expect(avatar.svgPath.length).toBeGreaterThan(0)
      })
    })

    it('all keys are unique', () => {
      const keys = DEFAULT_AVATARS.map((a) => a.key)
      expect(new Set(keys).size).toBe(keys.length)
    })

    it('all labels are unique', () => {
      const labels = DEFAULT_AVATARS.map((a) => a.label)
      expect(new Set(labels).size).toBe(labels.length)
    })

    it('all keys are lowercase', () => {
      DEFAULT_AVATARS.forEach((avatar) => {
        expect(avatar.key).toBe(avatar.key.toLowerCase())
      })
    })

    it('all labels are title-cased (first letter uppercase)', () => {
      DEFAULT_AVATARS.forEach((avatar) => {
        expect(avatar.label[0]).toBe(avatar.label[0].toUpperCase())
      })
    })

    it('contains the expected animal avatars', () => {
      const keys = DEFAULT_AVATARS.map((a) => a.key)
      expect(keys).toContain('bear')
      expect(keys).toContain('cat')
      expect(keys).toContain('dog')
      expect(keys).toContain('fox')
      expect(keys).toContain('owl')
      expect(keys).toContain('rabbit')
      expect(keys).toContain('wolf')
      expect(keys).toContain('penguin')
    })

    it('all viewBox values follow the SVG viewBox format', () => {
      const viewBoxPattern = /^\d+ \d+ \d+ \d+$/
      DEFAULT_AVATARS.forEach((avatar) => {
        expect(avatar.viewBox).toMatch(viewBoxPattern)
      })
    })

    it('all viewBox values use the same dimensions', () => {
      DEFAULT_AVATARS.forEach((avatar) => {
        expect(avatar.viewBox).toBe('0 0 64 64')
      })
    })

    it('svgPaths contain valid SVG path commands', () => {
      // SVG path commands start with letters like M, L, C, A, Z, etc.
      const svgCommandPattern = /^[MLHVCSQTAZmlhvcsqtaz0-9\s.,\-]+$/
      DEFAULT_AVATARS.forEach((avatar) => {
        expect(avatar.svgPath).toMatch(svgCommandPattern)
      })
    })
  })

  describe('isDefaultAvatar', () => {
    it('returns true for strings starting with "default:"', () => {
      expect(isDefaultAvatar('default:bear')).toBe(true)
      expect(isDefaultAvatar('default:cat')).toBe(true)
      expect(isDefaultAvatar('default:anything')).toBe(true)
    })

    it('returns false for strings not starting with "default:"', () => {
      expect(isDefaultAvatar('bear')).toBe(false)
      expect(isDefaultAvatar('https://example.com/avatar.png')).toBe(false)
      expect(isDefaultAvatar('')).toBe(false)
    })

    it('returns false for null', () => {
      expect(isDefaultAvatar(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isDefaultAvatar(undefined)).toBe(false)
    })

    it('is case-sensitive (prefix must be lowercase)', () => {
      expect(isDefaultAvatar('Default:bear')).toBe(false)
      expect(isDefaultAvatar('DEFAULT:bear')).toBe(false)
    })

    it('returns true for "default:" with empty key', () => {
      expect(isDefaultAvatar('default:')).toBe(true)
    })
  })

  describe('getDefaultAvatarKey', () => {
    it('strips the "default:" prefix from a value', () => {
      expect(getDefaultAvatarKey('default:bear')).toBe('bear')
      expect(getDefaultAvatarKey('default:cat')).toBe('cat')
      expect(getDefaultAvatarKey('default:penguin')).toBe('penguin')
    })

    it('returns the full string when no "default:" prefix is present', () => {
      expect(getDefaultAvatarKey('bear')).toBe('bear')
      expect(getDefaultAvatarKey('some-url')).toBe('some-url')
    })

    it('handles empty string after prefix', () => {
      expect(getDefaultAvatarKey('default:')).toBe('')
    })

    it('only removes the first occurrence of the prefix', () => {
      expect(getDefaultAvatarKey('default:default:bear')).toBe('default:bear')
    })
  })

  describe('getDefaultAvatarByKey', () => {
    it('returns the avatar for each known key', () => {
      DEFAULT_AVATARS.forEach((avatar) => {
        const result = getDefaultAvatarByKey(avatar.key)
        expect(result).toBeDefined()
        expect(result).toBe(avatar)
      })
    })

    it('returns the bear avatar by key', () => {
      const bear = getDefaultAvatarByKey('bear')
      expect(bear).toBeDefined()
      expect(bear!.key).toBe('bear')
      expect(bear!.label).toBe('Bear')
    })

    it('returns the penguin avatar by key', () => {
      const penguin = getDefaultAvatarByKey('penguin')
      expect(penguin).toBeDefined()
      expect(penguin!.key).toBe('penguin')
      expect(penguin!.label).toBe('Penguin')
    })

    it('returns undefined for an unknown key', () => {
      expect(getDefaultAvatarByKey('unicorn')).toBeUndefined()
      expect(getDefaultAvatarByKey('')).toBeUndefined()
    })

    it('is case-sensitive', () => {
      expect(getDefaultAvatarByKey('Bear')).toBeUndefined()
      expect(getDefaultAvatarByKey('BEAR')).toBeUndefined()
    })

    it('returned avatar has the full DefaultAvatar shape', () => {
      const avatar = getDefaultAvatarByKey('fox') as DefaultAvatar
      expect(avatar.key).toBe('fox')
      expect(avatar.label).toBe('Fox')
      expect(avatar.svgPath).toBeDefined()
      expect(avatar.viewBox).toBe('0 0 64 64')
    })
  })

  describe('getRandomDefaultAvatar', () => {
    it('returns a valid DefaultAvatar object', () => {
      const avatar = getRandomDefaultAvatar()
      expect(avatar).toBeDefined()
      expect(typeof avatar.key).toBe('string')
      expect(typeof avatar.label).toBe('string')
      expect(typeof avatar.svgPath).toBe('string')
      expect(typeof avatar.viewBox).toBe('string')
    })

    it('always returns an avatar from the DEFAULT_AVATARS array', () => {
      // Run multiple times to increase confidence
      for (let i = 0; i < 20; i++) {
        const avatar = getRandomDefaultAvatar()
        expect(DEFAULT_AVATARS).toContain(avatar)
      }
    })

    it('returned avatar has a key that exists in DEFAULT_AVATARS', () => {
      const validKeys = DEFAULT_AVATARS.map((a) => a.key)
      const avatar = getRandomDefaultAvatar()
      expect(validKeys).toContain(avatar.key)
    })
  })

  describe('integration: isDefaultAvatar + getDefaultAvatarKey + getDefaultAvatarByKey', () => {
    it('full pipeline works for all avatars', () => {
      DEFAULT_AVATARS.forEach((avatar) => {
        const value = `default:${avatar.key}`
        expect(isDefaultAvatar(value)).toBe(true)
        const key = getDefaultAvatarKey(value)
        expect(key).toBe(avatar.key)
        const found = getDefaultAvatarByKey(key)
        expect(found).toBe(avatar)
      })
    })

    it('pipeline returns undefined for non-default avatar URLs', () => {
      const url = 'https://example.com/avatar.png'
      expect(isDefaultAvatar(url)).toBe(false)
      // getDefaultAvatarKey would return the full URL since no prefix
      const key = getDefaultAvatarKey(url)
      expect(getDefaultAvatarByKey(key)).toBeUndefined()
    })
  })
})
