import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWeatherStore } from '@/stores/weatherStore'
import {
  getCurrentPosition,
  fetchWeather,
  type WeatherData,
  type GeoLocation,
} from '@/services/weatherService'

export type WeatherErrorType = 'permission_denied' | 'position_unavailable' | 'network_error'

interface UseWeatherResult {
  weather: WeatherData | undefined
  isLoading: boolean
  isLocating: boolean
  error: WeatherErrorType | null
  retry: () => void
}

export function useWeather(): UseWeatherResult {
  const {
    cachedLatitude,
    cachedLongitude,
    locationDenied,
    setCachedLocation,
    setLocationDenied,
  } = useWeatherStore()

  const [location, setLocation] = useState<GeoLocation | null>(
    cachedLatitude && cachedLongitude
      ? { latitude: cachedLatitude, longitude: cachedLongitude }
      : null
  )
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<WeatherErrorType | null>(null)

  const requestLocation = () => {
    setIsLocating(true)
    setLocationError(null)
    setLocationDenied(false)

    getCurrentPosition()
      .then((pos) => {
        setLocation(pos)
        setIsLocating(false)
      })
      .catch((err) => {
        setIsLocating(false)
        if (err instanceof GeolocationPositionError) {
          if (err.code === err.PERMISSION_DENIED) {
            setLocationError('permission_denied')
            setLocationDenied(true)
          } else {
            setLocationError('position_unavailable')
          }
        } else {
          setLocationError('position_unavailable')
        }
      })
  }

  // Request location on mount (skip if denied)
  useEffect(() => {
    if (!locationDenied) {
      requestLocation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const weatherQuery = useQuery<WeatherData>({
    queryKey: ['weather', location?.latitude, location?.longitude],
    queryFn: () => fetchWeather(location!),
    enabled: !!location,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  })

  // Cache location info when weather data arrives
  useEffect(() => {
    if (weatherQuery.data?.location) {
      const { latitude, longitude, cityName } = weatherQuery.data.location
      setCachedLocation(latitude, longitude, cityName)
    }
  }, [weatherQuery.data, setCachedLocation])

  const error = locationError
    || (weatherQuery.error ? 'network_error' : null)

  return {
    weather: weatherQuery.data,
    isLoading: weatherQuery.isLoading && !!location,
    isLocating,
    error: weatherQuery.isSuccess ? null : error,
    retry: requestLocation,
  }
}
