import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TemperatureUnit = 'C' | 'F'

interface WeatherState {
  cachedLatitude: number | null
  cachedLongitude: number | null
  cachedCityName: string | null
  temperatureUnit: TemperatureUnit
  locationDenied: boolean

  setCachedLocation: (lat: number, lon: number, city: string) => void
  setTemperatureUnit: (unit: TemperatureUnit) => void
  toggleTemperatureUnit: () => void
  setLocationDenied: (denied: boolean) => void
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set, get) => ({
      cachedLatitude: null,
      cachedLongitude: null,
      cachedCityName: null,
      temperatureUnit: 'F',
      locationDenied: false,

      setCachedLocation: (lat, lon, city) => set({
        cachedLatitude: lat,
        cachedLongitude: lon,
        cachedCityName: city,
      }),

      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),

      toggleTemperatureUnit: () => set({
        temperatureUnit: get().temperatureUnit === 'C' ? 'F' : 'C',
      }),

      setLocationDenied: (denied) => set({ locationDenied: denied }),
    }),
    {
      name: 'workout-weather',
      partialize: (state) => ({
        cachedLatitude: state.cachedLatitude,
        cachedLongitude: state.cachedLongitude,
        cachedCityName: state.cachedCityName,
        temperatureUnit: state.temperatureUnit,
        locationDenied: state.locationDenied,
      }),
    }
  )
)
