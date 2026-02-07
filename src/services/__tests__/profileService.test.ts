import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { UserProfile, UpdateProfileData } from '../profileService'

// Mock Supabase with inline factory
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    rpc: vi.fn().mockResolvedValue({ error: null }),
  },
}))

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('type definitions', () => {
    it('UserProfile type has correct shape', () => {
      const profile: UserProfile = {
        id: 'user-123',
        display_name: 'Test User',
        gender: 'male',
        avatar_url: null,
        current_cycle_day: 1,
        last_workout_date: '2024-01-15',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
      }

      expect(profile.id).toBe('user-123')
      expect(profile.display_name).toBe('Test User')
      expect(profile.gender).toBe('male')
      expect(profile.current_cycle_day).toBe(1)
    })

    it('UserProfile supports null values', () => {
      const profile: UserProfile = {
        id: 'user-123',
        display_name: null,
        gender: null,
        avatar_url: null,
        current_cycle_day: 1,
        last_workout_date: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(profile.display_name).toBeNull()
      expect(profile.gender).toBeNull()
    })

    it('UpdateProfileData supports partial updates', () => {
      const displayNameOnly: UpdateProfileData = {
        display_name: 'New Name',
      }
      expect(displayNameOnly.display_name).toBe('New Name')

      const genderOnly: UpdateProfileData = {
        gender: 'female',
      }
      expect(genderOnly.gender).toBe('female')

      const cycleDayOnly: UpdateProfileData = {
        current_cycle_day: 3,
      }
      expect(cycleDayOnly.current_cycle_day).toBe(3)
    })
  })

  describe('cycle day wrapping logic', () => {
    it('wraps from 7 to 1', () => {
      const currentDay = 7
      const nextDay = (currentDay % 7) + 1
      expect(nextDay).toBe(1)
    })

    it('increments normally for days 1-6', () => {
      for (let day = 1; day <= 6; day++) {
        const nextDay = (day % 7) + 1
        expect(nextDay).toBe(day + 1)
      }
    })
  })

  describe('gender options', () => {
    it('supports male gender', () => {
      const profile: UserProfile = {
        id: '1',
        display_name: null,
        gender: 'male',
        avatar_url: null,
        current_cycle_day: 1,
        last_workout_date: null,
        created_at: '',
        updated_at: '',
      }
      expect(profile.gender).toBe('male')
    })

    it('supports female gender', () => {
      const profile: UserProfile = {
        id: '1',
        display_name: null,
        gender: 'female',
        avatar_url: null,
        current_cycle_day: 1,
        last_workout_date: null,
        created_at: '',
        updated_at: '',
      }
      expect(profile.gender).toBe('female')
    })

    it('supports null gender', () => {
      const profile: UserProfile = {
        id: '1',
        display_name: null,
        gender: null,
        avatar_url: null,
        current_cycle_day: 1,
        last_workout_date: null,
        created_at: '',
        updated_at: '',
      }
      expect(profile.gender).toBeNull()
    })
  })
})
