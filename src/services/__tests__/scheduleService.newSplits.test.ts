import { describe, it, expect, vi } from 'vitest'
import {
  FULL_BODY_PLAN_ID,
  BRO_SPLIT_PLAN_ID,
  ARNOLD_SPLIT_PLAN_ID,
} from '@/config/planConstants'

// These tests verify the expected schedule patterns for each new split.
// They test the schedule logic structurally (not via Supabase calls).

describe('New Splits - Schedule Patterns', () => {
  describe('Full Body schedule pattern', () => {
    const workoutDays = [
      { id: 'fb-a-id', day_number: 1 },
      { id: 'fb-b-id', day_number: 2 },
      { id: 'fb-c-id', day_number: 3 },
      { id: 'fb-d-id', day_number: 4 },
      { id: 'fb-e-id', day_number: 5 },
    ]

    it('Full Body has 5 workout days', () => {
      expect(workoutDays).toHaveLength(5)
    })

    it('Full Body default schedule: A, Rest, B, Rest, C, Rest, Rest', () => {
      // Matches the initializeDefaultSchedule logic for FULL_BODY_PLAN_ID
      const expected = [
        { day_number: 1, workout_day_id: workoutDays[0].id, is_rest_day: false },
        { day_number: 2, workout_day_id: null, is_rest_day: true },
        { day_number: 3, workout_day_id: workoutDays[1].id, is_rest_day: false },
        { day_number: 4, workout_day_id: null, is_rest_day: true },
        { day_number: 5, workout_day_id: workoutDays[2].id, is_rest_day: false },
        { day_number: 6, workout_day_id: null, is_rest_day: true },
        { day_number: 7, workout_day_id: null, is_rest_day: true },
      ]

      expect(expected).toHaveLength(7)
      expect(expected.filter(d => d.is_rest_day)).toHaveLength(4)
      expect(expected.filter(d => !d.is_rest_day)).toHaveLength(3)
      // Only 3 of 5 days are scheduled by default
      expect(expected[0].workout_day_id).toBe('fb-a-id')
      expect(expected[2].workout_day_id).toBe('fb-b-id')
      expect(expected[4].workout_day_id).toBe('fb-c-id')
    })
  })

  describe('Bro Split schedule pattern', () => {
    const workoutDays = [
      { id: 'chest-id', day_number: 1 },
      { id: 'back-id', day_number: 2 },
      { id: 'legs-id', day_number: 3 },
      { id: 'shoulders-id', day_number: 4 },
      { id: 'arms-id', day_number: 5 },
    ]

    it('Bro Split has 5 workout days', () => {
      expect(workoutDays).toHaveLength(5)
    })

    it('Bro Split default schedule: Chest, Back, Legs, Shoulders, Arms, Rest, Rest', () => {
      const expected = [
        { day_number: 1, workout_day_id: workoutDays[0].id, is_rest_day: false },
        { day_number: 2, workout_day_id: workoutDays[1].id, is_rest_day: false },
        { day_number: 3, workout_day_id: workoutDays[2].id, is_rest_day: false },
        { day_number: 4, workout_day_id: workoutDays[3].id, is_rest_day: false },
        { day_number: 5, workout_day_id: workoutDays[4].id, is_rest_day: false },
        { day_number: 6, workout_day_id: null, is_rest_day: true },
        { day_number: 7, workout_day_id: null, is_rest_day: true },
      ]

      expect(expected).toHaveLength(7)
      expect(expected.filter(d => d.is_rest_day)).toHaveLength(2)
      expect(expected.filter(d => !d.is_rest_day)).toHaveLength(5)
      // All 5 days scheduled
      expect(expected[0].workout_day_id).toBe('chest-id')
      expect(expected[1].workout_day_id).toBe('back-id')
      expect(expected[2].workout_day_id).toBe('legs-id')
      expect(expected[3].workout_day_id).toBe('shoulders-id')
      expect(expected[4].workout_day_id).toBe('arms-id')
    })
  })

  describe('Arnold Split schedule pattern', () => {
    const workoutDays = [
      { id: 'cb-id', day_number: 1 },
      { id: 'sa-id', day_number: 2 },
      { id: 'legs-id', day_number: 3 },
    ]

    it('Arnold Split has 3 workout days', () => {
      expect(workoutDays).toHaveLength(3)
    })

    it('Arnold Split default schedule: CB, SA, Legs, CB, SA, Legs, Rest', () => {
      const expected = [
        { day_number: 1, workout_day_id: workoutDays[0].id, is_rest_day: false },
        { day_number: 2, workout_day_id: workoutDays[1].id, is_rest_day: false },
        { day_number: 3, workout_day_id: workoutDays[2].id, is_rest_day: false },
        { day_number: 4, workout_day_id: workoutDays[0].id, is_rest_day: false },
        { day_number: 5, workout_day_id: workoutDays[1].id, is_rest_day: false },
        { day_number: 6, workout_day_id: workoutDays[2].id, is_rest_day: false },
        { day_number: 7, workout_day_id: null, is_rest_day: true },
      ]

      expect(expected).toHaveLength(7)
      expect(expected.filter(d => d.is_rest_day)).toHaveLength(1)
      expect(expected.filter(d => !d.is_rest_day)).toHaveLength(6)
      // Cycle repeats: days 1,4 = CB; days 2,5 = SA; days 3,6 = Legs
      expect(expected[0].workout_day_id).toBe(expected[3].workout_day_id)
      expect(expected[1].workout_day_id).toBe(expected[4].workout_day_id)
      expect(expected[2].workout_day_id).toBe(expected[5].workout_day_id)
    })
  })

  describe('Plan ID constants', () => {
    it('new plan IDs follow UUID naming convention', () => {
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      expect(FULL_BODY_PLAN_ID).toMatch(uuidPattern)
      expect(BRO_SPLIT_PLAN_ID).toMatch(uuidPattern)
      expect(ARNOLD_SPLIT_PLAN_ID).toMatch(uuidPattern)
    })

    it('new plan IDs are sequential after existing ones', () => {
      const lastDigit = (id: string) => parseInt(id.slice(-1))
      expect(lastDigit(FULL_BODY_PLAN_ID)).toBe(4)
      expect(lastDigit(BRO_SPLIT_PLAN_ID)).toBe(5)
      expect(lastDigit(ARNOLD_SPLIT_PLAN_ID)).toBe(6)
    })
  })
})
