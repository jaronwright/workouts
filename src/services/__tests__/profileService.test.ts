import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { UserProfile, UpdateProfileData } from '../profileService'

// Build a chainable mock where each terminal method (single / maybeSingle)
// can be reconfigured per-test via mockResult / mockMaybeSingleResult.
let mockResult = { data: null as unknown, error: null as unknown }
let mockMaybeSingleResult = { data: null as unknown, error: null as unknown }
let mockRpcResult = { error: null as unknown }

const chainable = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(() => Promise.resolve(mockResult)),
  maybeSingle: vi.fn(() => Promise.resolve(mockMaybeSingleResult)),
}

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => chainable),
    rpc: vi.fn(() => Promise.resolve(mockRpcResult)),
  },
}))

// Import after mocking
import { supabase } from '../supabase'
import {
  getProfile,
  updateProfile,
  upsertProfile,
  deleteUserAccount,
} from '../profileService'

const baseProfile: UserProfile = {
  id: 'user-123',
  display_name: 'Test User',
  gender: 'male' as const,
  avatar_url: null,
  selected_plan_id: null,
  current_cycle_day: 1,
  last_workout_date: null,
  cycle_start_date: null,
  timezone: null,
  theme: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResult = { data: null, error: null }
    mockMaybeSingleResult = { data: null, error: null }
    mockRpcResult = { error: null }
  })

  // ────────────────────────────────────────────────────────
  // Type definitions (kept from original)
  // ────────────────────────────────────────────────────────

  describe('type definitions', () => {
    it('UserProfile type has correct shape', () => {
      const profile: UserProfile = { ...baseProfile }

      expect(profile.id).toBe('user-123')
      expect(profile.display_name).toBe('Test User')
      expect(profile.gender).toBe('male')
      expect(profile.current_cycle_day).toBe(1)
    })

    it('UserProfile supports null values', () => {
      const profile: UserProfile = {
        ...baseProfile,
        display_name: null,
        gender: null,
      }

      expect(profile.display_name).toBeNull()
      expect(profile.gender).toBeNull()
    })

    it('UserProfile includes theme field', () => {
      const profile: UserProfile = {
        ...baseProfile,
        theme: 'dark',
      }
      expect(profile.theme).toBe('dark')
    })

    it('UpdateProfileData supports partial updates', () => {
      const displayNameOnly: UpdateProfileData = {
        display_name: 'New Name',
      }
      expect(displayNameOnly.display_name).toBe('New Name')

      const cycleDayOnly: UpdateProfileData = {
        current_cycle_day: 3,
      }
      expect(cycleDayOnly.current_cycle_day).toBe(3)
    })

    it('UpdateProfileData can be empty object', () => {
      const empty: UpdateProfileData = {}
      expect(Object.keys(empty)).toHaveLength(0)
    })

    it('UpdateProfileData supports theme field', () => {
      const themeOnly: UpdateProfileData = { theme: 'light' }
      expect(themeOnly.theme).toBe('light')
    })

    it('UpdateProfileData supports setting nullable fields to null', () => {
      const nulled: UpdateProfileData = {
        display_name: null,
        avatar_url: null,
        selected_plan_id: null,
        last_workout_date: null,
        cycle_start_date: null,
        timezone: null,
        theme: null,
      }
      expect(nulled.display_name).toBeNull()
      expect(nulled.theme).toBeNull()
    })
  })

  // ────────────────────────────────────────────────────────
  // Cycle day wrapping (kept from original)
  // ────────────────────────────────────────────────────────

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

  // ────────────────────────────────────────────────────────
  // Gender options (kept from original)
  // ────────────────────────────────────────────────────────

  describe('gender options', () => {
    it('supports all gender variants', () => {
      const genders: UserProfile['gender'][] = ['male', 'female', 'non-binary', 'prefer-not-to-say', null]
      genders.forEach((g) => {
        const profile: UserProfile = { ...baseProfile, gender: g }
        expect(profile.gender).toBe(g)
      })
    })
  })

  // ────────────────────────────────────────────────────────
  // getProfile
  // ────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('returns profile when found', async () => {
      mockMaybeSingleResult = { data: baseProfile, error: null }

      const result = await getProfile('user-123')

      expect(supabase.from).toHaveBeenCalledWith('user_profiles')
      expect(chainable.select).toHaveBeenCalledWith('*')
      expect(chainable.eq).toHaveBeenCalledWith('id', 'user-123')
      expect(chainable.maybeSingle).toHaveBeenCalled()
      expect(result).toEqual(baseProfile)
    })

    it('returns null when no profile exists (data is null)', async () => {
      mockMaybeSingleResult = { data: null, error: null }

      const result = await getProfile('nonexistent-user')
      expect(result).toBeNull()
    })

    it('returns null for PGRST116 error code (not found)', async () => {
      mockMaybeSingleResult = {
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      }

      const result = await getProfile('missing-user')
      expect(result).toBeNull()
    })

    it('throws on non-PGRST116 errors', async () => {
      const dbError = { code: '42P01', message: 'relation does not exist' }
      mockMaybeSingleResult = { data: null, error: dbError }

      await expect(getProfile('user-123')).rejects.toEqual(dbError)
    })

    it('throws on generic database error', async () => {
      const dbError = { code: 'PGRST000', message: 'connection refused' }
      mockMaybeSingleResult = { data: null, error: dbError }

      await expect(getProfile('user-123')).rejects.toEqual(dbError)
    })

    it('passes the userId correctly to the eq chain', async () => {
      mockMaybeSingleResult = { data: null, error: null }

      await getProfile('specific-uuid-456')
      expect(chainable.eq).toHaveBeenCalledWith('id', 'specific-uuid-456')
    })

    it('returns profile with all fields populated', async () => {
      const fullProfile: UserProfile = {
        ...baseProfile,
        display_name: 'Full User',
        gender: 'non-binary',
        avatar_url: 'https://example.com/avatar.png',
        selected_plan_id: '00000000-0000-0000-0000-000000000001',
        current_cycle_day: 5,
        last_workout_date: '2024-06-15',
        cycle_start_date: '2024-06-01',
        timezone: 'America/New_York',
        theme: 'dark',
      }
      mockMaybeSingleResult = { data: fullProfile, error: null }

      const result = await getProfile('user-123')
      expect(result).toEqual(fullProfile)
      expect(result!.theme).toBe('dark')
      expect(result!.selected_plan_id).toBe('00000000-0000-0000-0000-000000000001')
    })
  })

  // ────────────────────────────────────────────────────────
  // updateProfile
  // ────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('updates a profile with partial data', async () => {
      const updated: UserProfile = { ...baseProfile, display_name: 'Updated' }
      mockResult = { data: updated, error: null }

      const result = await updateProfile('user-123', { display_name: 'Updated' })

      expect(supabase.from).toHaveBeenCalledWith('user_profiles')
      expect(chainable.update).toHaveBeenCalledWith({ display_name: 'Updated' })
      expect(chainable.eq).toHaveBeenCalledWith('id', 'user-123')
      expect(chainable.select).toHaveBeenCalled()
      expect(chainable.single).toHaveBeenCalled()
      expect(result).toEqual(updated)
    })

    it('updates multiple fields at once', async () => {
      const updateData: UpdateProfileData = {
        display_name: 'Multi',
        avatar_url: 'https://img.com/a.png',
        theme: 'dark',
        timezone: 'Europe/London',
      }
      const updated: UserProfile = { ...baseProfile, ...updateData }
      mockResult = { data: updated, error: null }

      const result = await updateProfile('user-123', updateData)

      expect(chainable.update).toHaveBeenCalledWith(updateData)
      expect(result.display_name).toBe('Multi')
      expect(result.theme).toBe('dark')
    })

    it('can set nullable fields to null', async () => {
      const updateData: UpdateProfileData = {
        display_name: null,
        avatar_url: null,
        timezone: null,
      }
      const updated: UserProfile = {
        ...baseProfile,
        display_name: null,
        avatar_url: null,
        timezone: null,
      }
      mockResult = { data: updated, error: null }

      const result = await updateProfile('user-123', updateData)

      expect(chainable.update).toHaveBeenCalledWith(updateData)
      expect(result.display_name).toBeNull()
    })

    it('throws on database error', async () => {
      const dbError = { code: 'PGRST204', message: 'no rows updated' }
      mockResult = { data: null, error: dbError }

      await expect(
        updateProfile('nonexistent', { display_name: 'Nope' })
      ).rejects.toEqual(dbError)
    })

    it('throws when user is not found (RLS restriction)', async () => {
      const rlsError = { code: 'PGRST116', message: 'Row not found' }
      mockResult = { data: null, error: rlsError }

      await expect(
        updateProfile('wrong-user', { display_name: 'Hack' })
      ).rejects.toEqual(rlsError)
    })

    it('updates theme field independently', async () => {
      const updated: UserProfile = { ...baseProfile, theme: 'light' }
      mockResult = { data: updated, error: null }

      const result = await updateProfile('user-123', { theme: 'light' })

      expect(chainable.update).toHaveBeenCalledWith({ theme: 'light' })
      expect(result.theme).toBe('light')
    })

    it('updates current_cycle_day and last_workout_date together', async () => {
      const updateData: UpdateProfileData = {
        current_cycle_day: 4,
        last_workout_date: '2024-07-01',
      }
      const updated: UserProfile = { ...baseProfile, ...updateData }
      mockResult = { data: updated, error: null }

      const result = await updateProfile('user-123', updateData)

      expect(chainable.update).toHaveBeenCalledWith(updateData)
      expect(result.current_cycle_day).toBe(4)
      expect(result.last_workout_date).toBe('2024-07-01')
    })
  })

  // ────────────────────────────────────────────────────────
  // upsertProfile
  // ────────────────────────────────────────────────────────

  describe('upsertProfile', () => {
    it('upserts with userId and data merged', async () => {
      const upsertData: UpdateProfileData = { display_name: 'Upserted' }
      const upserted: UserProfile = { ...baseProfile, display_name: 'Upserted' }
      mockResult = { data: upserted, error: null }

      const result = await upsertProfile('user-123', upsertData)

      expect(supabase.from).toHaveBeenCalledWith('user_profiles')
      expect(chainable.upsert).toHaveBeenCalledWith({
        id: 'user-123',
        display_name: 'Upserted',
      })
      expect(chainable.select).toHaveBeenCalled()
      expect(chainable.single).toHaveBeenCalled()
      expect(result).toEqual(upserted)
    })

    it('creates new profile when none exists (upsert behavior)', async () => {
      const data: UpdateProfileData = {
        display_name: 'Brand New',
        theme: 'dark',
      }
      const created: UserProfile = { ...baseProfile, ...data }
      mockResult = { data: created, error: null }

      const result = await upsertProfile('new-user', data)

      expect(chainable.upsert).toHaveBeenCalledWith({
        id: 'new-user',
        display_name: 'Brand New',
        theme: 'dark',
      })
      expect(result.display_name).toBe('Brand New')
    })

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' }
      mockResult = { data: null, error: dbError }

      await expect(
        upsertProfile('user-123', { display_name: 'Fail' })
      ).rejects.toEqual(dbError)
    })

    it('includes all UpdateProfileData fields in upsert payload', async () => {
      const allFields: UpdateProfileData = {
        display_name: 'All',
        avatar_url: 'https://img.com/all.png',
        selected_plan_id: '00000000-0000-0000-0000-000000000002',
        current_cycle_day: 7,
        last_workout_date: '2024-12-31',
        cycle_start_date: '2024-12-01',
        timezone: 'Asia/Tokyo',
        theme: 'dark',
      }
      mockResult = { data: { ...baseProfile, ...allFields }, error: null }

      await upsertProfile('user-123', allFields)

      expect(chainable.upsert).toHaveBeenCalledWith({
        id: 'user-123',
        ...allFields,
      })
    })
  })

  // ────────────────────────────────────────────────────────
  // deleteUserAccount
  // ────────────────────────────────────────────────────────

  describe('deleteUserAccount', () => {
    it('calls rpc delete_user_account successfully', async () => {
      mockRpcResult = { error: null }

      await deleteUserAccount()

      expect(supabase.rpc).toHaveBeenCalledWith('delete_user_account')
    })

    it('throws on RPC error', async () => {
      const rpcError = { code: 'P0001', message: 'deletion failed' }
      mockRpcResult = { error: rpcError }

      await expect(deleteUserAccount()).rejects.toEqual(rpcError)
    })

    it('returns void on success', async () => {
      mockRpcResult = { error: null }

      const result = await deleteUserAccount()
      expect(result).toBeUndefined()
    })
  })
})
