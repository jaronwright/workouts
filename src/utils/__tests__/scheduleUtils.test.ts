import { describe, it, expect, vi } from 'vitest'
import { Calendar, Moon } from 'lucide-react'
import type { ScheduleDay } from '@/services/scheduleService'

// Mock workoutConfig before importing the module under test
const mockPushStyle = { color: '#6366F1', bgColor: 'rgba(99, 102, 241, 0.15)', gradient: 'from-indigo-500 to-indigo-400', icon: Calendar }
const mockCardioStyle = { color: '#14B8A6', bgColor: 'rgba(20, 184, 166, 0.15)', gradient: 'from-teal-500 to-teal-400', icon: Calendar }
const mockMobilityStyle = { color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)', gradient: 'from-emerald-500 to-emerald-400', icon: Calendar }

vi.mock('@/config/workoutConfig', () => ({
  getWeightsStyleByName: vi.fn(() => mockPushStyle),
  getCardioStyle: vi.fn(() => mockCardioStyle),
  getMobilityStyle: vi.fn(() => mockMobilityStyle),
  getWorkoutDisplayName: vi.fn((name: string) => {
    const map: Record<string, string> = {
      'PUSH (Chest, Shoulders, Triceps)': 'Push',
      'Pull (Back, Biceps, Rear Delts)': 'Pull',
      'LEGS (Quads, Hamstrings, Calves)': 'Legs'
    }
    return map[name] || null
  })
}))

import { getDayInfo } from '../scheduleUtils'
import { getWeightsStyleByName, getCardioStyle, getMobilityStyle, getWorkoutDisplayName } from '@/config/workoutConfig'

function makeScheduleDay(overrides: Partial<ScheduleDay> = {}): ScheduleDay {
  return {
    id: 'sched-1',
    user_id: 'user-1',
    day_number: 1,
    template_id: null,
    workout_day_id: null,
    is_rest_day: false,
    sort_order: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  }
}

describe('getDayInfo', () => {
  it('returns rest day with Moon icon when schedule is undefined', () => {
    const result = getDayInfo(undefined, 3)

    expect(result.dayNumber).toBe(3)
    expect(result.icon).toBe(Moon)
    expect(result.color).toBe('#6B7280')
    expect(result.bgColor).toBe('rgba(107, 114, 128, 0.15)')
    expect(result.name).toBe('Rest')
    expect(result.isRest).toBe(true)
    expect(result.workoutDayId).toBeUndefined()
    expect(result.templateId).toBeUndefined()
    expect(result.templateType).toBeUndefined()
  })

  it('returns rest day info when schedule is a rest day', () => {
    const schedule = makeScheduleDay({ is_rest_day: true })
    const result = getDayInfo(schedule, 2)

    expect(result.dayNumber).toBe(2)
    expect(result.icon).toBe(Moon)
    expect(result.color).toBe('#6B7280')
    expect(result.bgColor).toBe('rgba(107, 114, 128, 0.15)')
    expect(result.name).toBe('Rest')
    expect(result.isRest).toBe(true)
  })

  it('returns weights workout info when schedule has a workout_day', () => {
    const schedule = makeScheduleDay({
      workout_day_id: 'day-1',
      workout_day: {
        id: 'day-1',
        name: 'PUSH (Chest, Shoulders, Triceps)',
        day_number: 1
      }
    })

    const result = getDayInfo(schedule, 1)

    expect(getWeightsStyleByName).toHaveBeenCalledWith('PUSH (Chest, Shoulders, Triceps)')
    expect(getWorkoutDisplayName).toHaveBeenCalledWith('PUSH (Chest, Shoulders, Triceps)')
    expect(result.dayNumber).toBe(1)
    expect(result.icon).toBe(mockPushStyle.icon)
    expect(result.color).toBe(mockPushStyle.color)
    expect(result.bgColor).toBe(`${mockPushStyle.color}20`)
    expect(result.name).toBe('Push')
    expect(result.isRest).toBe(false)
    expect(result.workoutDayId).toBe('day-1')
  })

  it('falls back to workout_day.name when getWorkoutDisplayName returns null', () => {
    vi.mocked(getWorkoutDisplayName).mockReturnValueOnce('')

    const schedule = makeScheduleDay({
      workout_day_id: 'day-custom',
      workout_day: {
        id: 'day-custom',
        name: 'Custom Workout',
        day_number: 4
      }
    })

    const result = getDayInfo(schedule, 4)

    expect(result.name).toBe('Custom Workout')
  })

  it('returns cardio template info when schedule has a cardio template', () => {
    const schedule = makeScheduleDay({
      template_id: 'tmpl-1',
      template: {
        id: 'tmpl-1',
        name: 'Cycling',
        type: 'cardio',
        category: 'cycle',
        description: null,
        icon: null,
        duration_minutes: 30,
        workout_day_id: null,
        created_at: '2024-01-01T00:00:00Z'
      }
    })

    const result = getDayInfo(schedule, 5)

    expect(getCardioStyle).toHaveBeenCalledWith('cycle')
    expect(result.dayNumber).toBe(5)
    expect(result.icon).toBe(mockCardioStyle.icon)
    expect(result.color).toBe(mockCardioStyle.color)
    expect(result.bgColor).toBe(`${mockCardioStyle.color}20`)
    expect(result.name).toBe('Cycling')
    expect(result.isRest).toBe(false)
    expect(result.templateId).toBe('tmpl-1')
    expect(result.templateType).toBe('cardio')
    expect(result.workoutDayId).toBeUndefined()
  })

  it('returns mobility template info when schedule has a mobility template without workout_day_id', () => {
    const schedule = makeScheduleDay({
      template_id: 'tmpl-2',
      template: {
        id: 'tmpl-2',
        name: 'Core Stability',
        type: 'mobility',
        category: 'core',
        description: null,
        icon: null,
        duration_minutes: 20,
        workout_day_id: null,
        created_at: '2024-01-01T00:00:00Z'
      }
    })

    const result = getDayInfo(schedule, 6)

    expect(getMobilityStyle).toHaveBeenCalledWith('core')
    expect(result.dayNumber).toBe(6)
    expect(result.icon).toBe(mockMobilityStyle.icon)
    expect(result.color).toBe(mockMobilityStyle.color)
    expect(result.bgColor).toBe(`${mockMobilityStyle.color}20`)
    expect(result.name).toBe('Core Stability')
    expect(result.isRest).toBe(false)
    expect(result.templateId).toBe('tmpl-2')
    expect(result.templateType).toBe('mobility')
    expect(result.workoutDayId).toBeUndefined()
  })

  it('returns mobility template info with workoutDayId when template has workout_day_id', () => {
    const schedule = makeScheduleDay({
      template_id: 'tmpl-3',
      template: {
        id: 'tmpl-3',
        name: 'Spine Mobility',
        type: 'mobility',
        category: 'spine',
        description: null,
        icon: null,
        duration_minutes: 15,
        workout_day_id: 'wd-linked',
        created_at: '2024-01-01T00:00:00Z'
      }
    })

    const result = getDayInfo(schedule, 7)

    expect(result.workoutDayId).toBe('wd-linked')
    expect(result.templateId).toBeUndefined()
    expect(result.templateType).toBeUndefined()
  })

  it('returns rest day when schedule has no rest, workout_day, or template', () => {
    const schedule = makeScheduleDay({
      is_rest_day: false,
      workout_day: null,
      template: null
    })

    const result = getDayInfo(schedule, 4)

    expect(result.dayNumber).toBe(4)
    expect(result.icon).toBe(Moon)
    expect(result.color).toBe('#6B7280')
    expect(result.bgColor).toBe('rgba(107, 114, 128, 0.15)')
    expect(result.name).toBe('Rest')
    expect(result.isRest).toBe(true)
  })

  it('preserves the provided dayNumber in all return paths', () => {
    expect(getDayInfo(undefined, 1).dayNumber).toBe(1)
    expect(getDayInfo(makeScheduleDay({ is_rest_day: true }), 5).dayNumber).toBe(5)
    expect(getDayInfo(makeScheduleDay({
      workout_day_id: 'd1',
      workout_day: { id: 'd1', name: 'Push', day_number: 1 }
    }), 99).dayNumber).toBe(99)
  })
})
