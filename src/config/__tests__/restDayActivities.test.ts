import { describe, it, expect } from 'vitest'
import { restDayActivities, type RestDayActivity } from '../restDayActivities'

describe('restDayActivities', () => {
  it('exports an array of activities', () => {
    expect(Array.isArray(restDayActivities)).toBe(true)
    expect(restDayActivities.length).toBeGreaterThan(0)
  })

  it('contains expected activities', () => {
    const activityIds = restDayActivities.map(a => a.id)
    expect(activityIds).toContain('walk')
    expect(activityIds).toContain('foam-roll')
    expect(activityIds).toContain('stretch')
    expect(activityIds).toContain('yoga')
    expect(activityIds).toContain('swim')
    expect(activityIds).toContain('hydrate')
    expect(activityIds).toContain('sleep')
    expect(activityIds).toContain('meditation')
  })

  describe('activity structure', () => {
    it('each activity has required fields', () => {
      restDayActivities.forEach((activity: RestDayActivity) => {
        expect(activity.id).toBeDefined()
        expect(typeof activity.id).toBe('string')

        expect(activity.name).toBeDefined()
        expect(typeof activity.name).toBe('string')

        expect(activity.description).toBeDefined()
        expect(typeof activity.description).toBe('string')

        expect(activity.icon).toBeDefined()
        expect(typeof activity.icon).toBe('string')

        expect(activity.benefits).toBeDefined()
        expect(Array.isArray(activity.benefits)).toBe(true)
        expect(activity.benefits.length).toBeGreaterThan(0)
      })
    })

    it('activities with duration have valid duration format', () => {
      const activitiesWithDuration = restDayActivities.filter(a => a.duration)

      activitiesWithDuration.forEach(activity => {
        // Duration should contain "min"
        expect(activity.duration).toMatch(/min/i)
      })
    })
  })

  describe('specific activities', () => {
    it('Light Walk has correct properties', () => {
      const walk = restDayActivities.find(a => a.id === 'walk')

      expect(walk).toBeDefined()
      expect(walk?.name).toBe('Light Walk')
      expect(walk?.duration).toBe('20-30 min')
      expect(walk?.benefits).toContain('Active recovery')
    })

    it('Foam Rolling has correct properties', () => {
      const foamRoll = restDayActivities.find(a => a.id === 'foam-roll')

      expect(foamRoll).toBeDefined()
      expect(foamRoll?.name).toBe('Foam Rolling')
      expect(foamRoll?.duration).toBe('10-15 min')
      expect(foamRoll?.benefits).toContain('Reduced muscle tension')
    })

    it('Hydration Focus has no duration', () => {
      const hydrate = restDayActivities.find(a => a.id === 'hydrate')

      expect(hydrate).toBeDefined()
      expect(hydrate?.duration).toBeUndefined()
    })

    it('Extra Sleep has special duration format', () => {
      const sleep = restDayActivities.find(a => a.id === 'sleep')

      expect(sleep).toBeDefined()
      expect(sleep?.duration).toBe('+30-60 min')
    })
  })

  describe('uniqueness', () => {
    it('all activity ids are unique', () => {
      const ids = restDayActivities.map(a => a.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(ids.length)
    })

    it('all activity names are unique', () => {
      const names = restDayActivities.map(a => a.name)
      const uniqueNames = new Set(names)

      expect(uniqueNames.size).toBe(names.length)
    })
  })
})
