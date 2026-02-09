import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock zustand persist middleware as a passthrough to avoid localStorage issues in tests
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual<typeof import('zustand/middleware')>('zustand/middleware')
  return {
    ...actual,
    persist: (fn: unknown) => fn,
  }
})

import { useWeatherStore } from '../weatherStore'
import type { TemperatureUnit } from '../weatherStore'

describe('useWeatherStore', () => {
  beforeEach(() => {
    // Reset store to default state
    useWeatherStore.setState({
      cachedLatitude: null,
      cachedLongitude: null,
      cachedCityName: null,
      temperatureUnit: 'F',
      locationDenied: false,
    })
  })

  // ────────────────────────────────────────────────────────
  // Default state
  // ────────────────────────────────────────────────────────

  describe('default state', () => {
    it('defaults cachedLatitude to null', () => {
      const { cachedLatitude } = useWeatherStore.getState()
      expect(cachedLatitude).toBeNull()
    })

    it('defaults cachedLongitude to null', () => {
      const { cachedLongitude } = useWeatherStore.getState()
      expect(cachedLongitude).toBeNull()
    })

    it('defaults cachedCityName to null', () => {
      const { cachedCityName } = useWeatherStore.getState()
      expect(cachedCityName).toBeNull()
    })

    it('defaults temperatureUnit to F', () => {
      const { temperatureUnit } = useWeatherStore.getState()
      expect(temperatureUnit).toBe('F')
    })

    it('defaults locationDenied to false', () => {
      const { locationDenied } = useWeatherStore.getState()
      expect(locationDenied).toBe(false)
    })
  })

  // ────────────────────────────────────────────────────────
  // setCachedLocation
  // ────────────────────────────────────────────────────────

  describe('setCachedLocation', () => {
    it('sets latitude, longitude, and city name', () => {
      const { setCachedLocation } = useWeatherStore.getState()
      setCachedLocation(40.7128, -74.006, 'New York')

      const state = useWeatherStore.getState()
      expect(state.cachedLatitude).toBe(40.7128)
      expect(state.cachedLongitude).toBe(-74.006)
      expect(state.cachedCityName).toBe('New York')
    })

    it('overwrites previously cached location', () => {
      const { setCachedLocation } = useWeatherStore.getState()
      setCachedLocation(40.7128, -74.006, 'New York')
      setCachedLocation(51.5074, -0.1278, 'London')

      const state = useWeatherStore.getState()
      expect(state.cachedLatitude).toBe(51.5074)
      expect(state.cachedLongitude).toBe(-0.1278)
      expect(state.cachedCityName).toBe('London')
    })

    it('handles negative coordinates', () => {
      const { setCachedLocation } = useWeatherStore.getState()
      setCachedLocation(-33.8688, 151.2093, 'Sydney')

      const state = useWeatherStore.getState()
      expect(state.cachedLatitude).toBe(-33.8688)
      expect(state.cachedLongitude).toBe(151.2093)
      expect(state.cachedCityName).toBe('Sydney')
    })

    it('handles zero coordinates (Gulf of Guinea)', () => {
      const { setCachedLocation } = useWeatherStore.getState()
      setCachedLocation(0, 0, 'Null Island')

      const state = useWeatherStore.getState()
      expect(state.cachedLatitude).toBe(0)
      expect(state.cachedLongitude).toBe(0)
      expect(state.cachedCityName).toBe('Null Island')
    })

    it('handles empty city name', () => {
      const { setCachedLocation } = useWeatherStore.getState()
      setCachedLocation(40.7128, -74.006, '')

      const state = useWeatherStore.getState()
      expect(state.cachedCityName).toBe('')
    })

    it('does not affect other state fields', () => {
      useWeatherStore.setState({ temperatureUnit: 'C', locationDenied: true })
      const { setCachedLocation } = useWeatherStore.getState()
      setCachedLocation(40.7128, -74.006, 'New York')

      const state = useWeatherStore.getState()
      expect(state.temperatureUnit).toBe('C')
      expect(state.locationDenied).toBe(true)
    })
  })

  // ────────────────────────────────────────────────────────
  // setTemperatureUnit
  // ────────────────────────────────────────────────────────

  describe('setTemperatureUnit', () => {
    it('sets temperature unit to C', () => {
      const { setTemperatureUnit } = useWeatherStore.getState()
      setTemperatureUnit('C')

      expect(useWeatherStore.getState().temperatureUnit).toBe('C')
    })

    it('sets temperature unit to F', () => {
      useWeatherStore.setState({ temperatureUnit: 'C' })
      const { setTemperatureUnit } = useWeatherStore.getState()
      setTemperatureUnit('F')

      expect(useWeatherStore.getState().temperatureUnit).toBe('F')
    })

    it('setting same unit is idempotent', () => {
      const { setTemperatureUnit } = useWeatherStore.getState()
      setTemperatureUnit('F')
      setTemperatureUnit('F')

      expect(useWeatherStore.getState().temperatureUnit).toBe('F')
    })

    it('does not affect other state fields', () => {
      const { setCachedLocation } = useWeatherStore.getState()
      setCachedLocation(40.7128, -74.006, 'New York')

      const { setTemperatureUnit } = useWeatherStore.getState()
      setTemperatureUnit('C')

      const state = useWeatherStore.getState()
      expect(state.cachedLatitude).toBe(40.7128)
      expect(state.cachedLongitude).toBe(-74.006)
      expect(state.cachedCityName).toBe('New York')
    })
  })

  // ────────────────────────────────────────────────────────
  // toggleTemperatureUnit
  // ────────────────────────────────────────────────────────

  describe('toggleTemperatureUnit', () => {
    it('toggles from F to C', () => {
      expect(useWeatherStore.getState().temperatureUnit).toBe('F')

      const { toggleTemperatureUnit } = useWeatherStore.getState()
      toggleTemperatureUnit()

      expect(useWeatherStore.getState().temperatureUnit).toBe('C')
    })

    it('toggles from C to F', () => {
      useWeatherStore.setState({ temperatureUnit: 'C' })

      const { toggleTemperatureUnit } = useWeatherStore.getState()
      toggleTemperatureUnit()

      expect(useWeatherStore.getState().temperatureUnit).toBe('F')
    })

    it('double toggle returns to original value', () => {
      const { toggleTemperatureUnit } = useWeatherStore.getState()
      toggleTemperatureUnit() // F -> C
      toggleTemperatureUnit() // C -> F

      expect(useWeatherStore.getState().temperatureUnit).toBe('F')
    })

    it('triple toggle ends at opposite value', () => {
      const { toggleTemperatureUnit } = useWeatherStore.getState()
      toggleTemperatureUnit() // F -> C
      toggleTemperatureUnit() // C -> F
      toggleTemperatureUnit() // F -> C

      expect(useWeatherStore.getState().temperatureUnit).toBe('C')
    })

    it('does not affect other state fields', () => {
      const { setCachedLocation } = useWeatherStore.getState()
      setCachedLocation(35.6762, 139.6503, 'Tokyo')

      const { toggleTemperatureUnit } = useWeatherStore.getState()
      toggleTemperatureUnit()

      const state = useWeatherStore.getState()
      expect(state.cachedLatitude).toBe(35.6762)
      expect(state.cachedCityName).toBe('Tokyo')
      expect(state.locationDenied).toBe(false)
    })
  })

  // ────────────────────────────────────────────────────────
  // setLocationDenied
  // ────────────────────────────────────────────────────────

  describe('setLocationDenied', () => {
    it('sets locationDenied to true', () => {
      const { setLocationDenied } = useWeatherStore.getState()
      setLocationDenied(true)

      expect(useWeatherStore.getState().locationDenied).toBe(true)
    })

    it('sets locationDenied to false', () => {
      useWeatherStore.setState({ locationDenied: true })
      const { setLocationDenied } = useWeatherStore.getState()
      setLocationDenied(false)

      expect(useWeatherStore.getState().locationDenied).toBe(false)
    })

    it('setting same value is idempotent', () => {
      const { setLocationDenied } = useWeatherStore.getState()
      setLocationDenied(true)
      setLocationDenied(true)

      expect(useWeatherStore.getState().locationDenied).toBe(true)
    })

    it('can toggle denied state back and forth', () => {
      const { setLocationDenied } = useWeatherStore.getState()
      setLocationDenied(true)
      expect(useWeatherStore.getState().locationDenied).toBe(true)

      setLocationDenied(false)
      expect(useWeatherStore.getState().locationDenied).toBe(false)
    })

    it('does not affect other state fields', () => {
      const { setCachedLocation, setTemperatureUnit } = useWeatherStore.getState()
      setCachedLocation(48.8566, 2.3522, 'Paris')
      setTemperatureUnit('C')

      const { setLocationDenied } = useWeatherStore.getState()
      setLocationDenied(true)

      const state = useWeatherStore.getState()
      expect(state.cachedLatitude).toBe(48.8566)
      expect(state.cachedLongitude).toBe(2.3522)
      expect(state.cachedCityName).toBe('Paris')
      expect(state.temperatureUnit).toBe('C')
    })
  })

  // ────────────────────────────────────────────────────────
  // TemperatureUnit type
  // ────────────────────────────────────────────────────────

  describe('TemperatureUnit type', () => {
    it('accepts C as a valid unit', () => {
      const unit: TemperatureUnit = 'C'
      expect(unit).toBe('C')
    })

    it('accepts F as a valid unit', () => {
      const unit: TemperatureUnit = 'F'
      expect(unit).toBe('F')
    })
  })

  // ────────────────────────────────────────────────────────
  // State interactions (multiple actions)
  // ────────────────────────────────────────────────────────

  describe('state interactions', () => {
    it('all state changes are independent', () => {
      const state1 = useWeatherStore.getState()
      state1.setCachedLocation(40.7128, -74.006, 'New York')
      state1.setTemperatureUnit('C')
      state1.setLocationDenied(true)

      const state2 = useWeatherStore.getState()
      expect(state2.cachedLatitude).toBe(40.7128)
      expect(state2.cachedLongitude).toBe(-74.006)
      expect(state2.cachedCityName).toBe('New York')
      expect(state2.temperatureUnit).toBe('C')
      expect(state2.locationDenied).toBe(true)
    })

    it('resetting location does not affect temperature or denied state', () => {
      const { setCachedLocation, setTemperatureUnit, setLocationDenied } = useWeatherStore.getState()
      setCachedLocation(40.7128, -74.006, 'New York')
      setTemperatureUnit('C')
      setLocationDenied(true)

      // Set new location
      setCachedLocation(51.5074, -0.1278, 'London')

      const state = useWeatherStore.getState()
      expect(state.cachedCityName).toBe('London')
      expect(state.temperatureUnit).toBe('C')
      expect(state.locationDenied).toBe(true)
    })

    it('store provides all action functions', () => {
      const state = useWeatherStore.getState()
      expect(typeof state.setCachedLocation).toBe('function')
      expect(typeof state.setTemperatureUnit).toBe('function')
      expect(typeof state.toggleTemperatureUnit).toBe('function')
      expect(typeof state.setLocationDenied).toBe('function')
    })

    it('store starts in fully default state after reset', () => {
      // Mutate state
      const { setCachedLocation, setTemperatureUnit, setLocationDenied } = useWeatherStore.getState()
      setCachedLocation(1, 2, 'TestCity')
      setTemperatureUnit('C')
      setLocationDenied(true)

      // Reset to defaults (simulating beforeEach)
      useWeatherStore.setState({
        cachedLatitude: null,
        cachedLongitude: null,
        cachedCityName: null,
        temperatureUnit: 'F',
        locationDenied: false,
      })

      const state = useWeatherStore.getState()
      expect(state.cachedLatitude).toBeNull()
      expect(state.cachedLongitude).toBeNull()
      expect(state.cachedCityName).toBeNull()
      expect(state.temperatureUnit).toBe('F')
      expect(state.locationDenied).toBe(false)
    })
  })
})
