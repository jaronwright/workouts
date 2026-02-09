import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useWeather } from '../useWeather'
import * as weatherService from '@/services/weatherService'
import { useWeatherStore } from '@/stores/weatherStore'
import { ReactNode } from 'react'

// Polyfill GeolocationPositionError for jsdom (not available in jsdom by default)
class GeolocationPositionErrorPolyfill {
  static readonly PERMISSION_DENIED = 1
  static readonly POSITION_UNAVAILABLE = 2
  static readonly TIMEOUT = 3

  readonly PERMISSION_DENIED = 1
  readonly POSITION_UNAVAILABLE = 2
  readonly TIMEOUT = 3

  readonly code: number
  readonly message: string

  constructor(code: number = 0, message: string = '') {
    this.code = code
    this.message = message
  }
}

// Set it on globalThis so `instanceof GeolocationPositionError` works in the hook
globalThis.GeolocationPositionError = GeolocationPositionErrorPolyfill as unknown as typeof GeolocationPositionError

// Mock dependencies
vi.mock('@/stores/weatherStore', () => ({
  useWeatherStore: vi.fn(),
}))

vi.mock('@/services/weatherService', () => ({
  getCurrentPosition: vi.fn(),
  fetchWeather: vi.fn(),
}))

describe('useWeather', () => {
  const mockLocation: weatherService.GeoLocation = {
    latitude: 40.7128,
    longitude: -74.006,
  }

  const mockWeatherData: weatherService.WeatherData = {
    current: {
      temperature: 22,
      feelsLike: 20,
      weatherCode: 0,
      description: 'Clear sky',
      emoji: '☀️',
    },
    daily: [
      {
        date: '2024-06-01',
        dayName: 'Sat',
        weatherCode: 0,
        emoji: '☀️',
        tempHigh: 25,
        tempLow: 18,
      },
    ],
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      cityName: 'New York',
    },
  }

  let queryClient: QueryClient
  let mockSetCachedLocation: ReturnType<typeof vi.fn>
  let mockSetLocationDenied: ReturnType<typeof vi.fn>

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  function mockWeatherStoreState(overrides: {
    cachedLatitude?: number | null
    cachedLongitude?: number | null
    locationDenied?: boolean
  } = {}) {
    const state = {
      cachedLatitude: overrides.cachedLatitude ?? null,
      cachedLongitude: overrides.cachedLongitude ?? null,
      cachedCityName: null,
      temperatureUnit: 'F' as const,
      locationDenied: overrides.locationDenied ?? false,
      setCachedLocation: mockSetCachedLocation,
      setTemperatureUnit: vi.fn(),
      toggleTemperatureUnit: vi.fn(),
      setLocationDenied: mockSetLocationDenied,
    }

    vi.mocked(useWeatherStore).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(state as Parameters<typeof selector>[0])
      }
      return state
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSetCachedLocation = vi.fn()
    mockSetLocationDenied = vi.fn()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0, staleTime: 0 },
        mutations: { retry: false },
      },
    })
    mockWeatherStoreState()
  })

  // ─── Geolocation flow ────────────────────────────────

  it('requests geolocation on mount when not denied', async () => {
    vi.mocked(weatherService.getCurrentPosition).mockResolvedValue(mockLocation)
    vi.mocked(weatherService.fetchWeather).mockResolvedValue(mockWeatherData)

    renderHook(() => useWeather(), { wrapper })

    expect(weatherService.getCurrentPosition).toHaveBeenCalledTimes(1)
  })

  it('does not request geolocation when location is denied', () => {
    mockWeatherStoreState({ locationDenied: true })

    renderHook(() => useWeather(), { wrapper })

    expect(weatherService.getCurrentPosition).not.toHaveBeenCalled()
  })

  it('fetches weather after geolocation succeeds', async () => {
    vi.mocked(weatherService.getCurrentPosition).mockResolvedValue(mockLocation)
    vi.mocked(weatherService.fetchWeather).mockResolvedValue(mockWeatherData)

    const { result } = renderHook(() => useWeather(), { wrapper })

    await waitFor(() => {
      expect(result.current.weather).toBeDefined()
    })

    expect(weatherService.fetchWeather).toHaveBeenCalledWith(mockLocation)
    expect(result.current.weather).toEqual(mockWeatherData)
  })

  it('returns isLocating true while getting position', async () => {
    let resolvePosition: (value: weatherService.GeoLocation) => void
    vi.mocked(weatherService.getCurrentPosition).mockImplementation(
      () => new Promise((resolve) => { resolvePosition = resolve })
    )

    const { result } = renderHook(() => useWeather(), { wrapper })

    // isLocating should be true during geolocation
    expect(result.current.isLocating).toBe(true)

    await act(async () => {
      resolvePosition!(mockLocation)
    })

    await waitFor(() => {
      expect(result.current.isLocating).toBe(false)
    })
  })

  // ─── Cached location ─────────────────────────────────

  it('uses cached location from store on mount', async () => {
    mockWeatherStoreState({
      cachedLatitude: 40.7128,
      cachedLongitude: -74.006,
    })
    vi.mocked(weatherService.getCurrentPosition).mockResolvedValue(mockLocation)
    vi.mocked(weatherService.fetchWeather).mockResolvedValue(mockWeatherData)

    const { result } = renderHook(() => useWeather(), { wrapper })

    // With cached location, weather query should start immediately
    await waitFor(() => {
      expect(result.current.weather).toBeDefined()
    })

    expect(result.current.weather).toEqual(mockWeatherData)
  })

  // ─── Error handling ───────────────────────────────────

  it('sets permission_denied error when geolocation is denied', async () => {
    const permissionError = new GeolocationPositionErrorPolyfill(1, 'User denied')
    vi.mocked(weatherService.getCurrentPosition).mockRejectedValue(permissionError)

    const { result } = renderHook(() => useWeather(), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBe('permission_denied')
    })

    expect(mockSetLocationDenied).toHaveBeenCalledWith(true)
  })

  it('sets position_unavailable error for other geolocation errors', async () => {
    const positionError = new GeolocationPositionErrorPolyfill(2, 'Position unavailable')
    vi.mocked(weatherService.getCurrentPosition).mockRejectedValue(positionError)

    const { result } = renderHook(() => useWeather(), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBe('position_unavailable')
    })
  })

  it('sets position_unavailable for non-GeolocationPositionError', async () => {
    vi.mocked(weatherService.getCurrentPosition).mockRejectedValue(new Error('Unknown error'))

    const { result } = renderHook(() => useWeather(), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBe('position_unavailable')
    })
  })

  it('sets network_error when weather fetch fails', async () => {
    // The hook sets retry: 1 on the weather query, so we need a longer timeout
    // to allow the retry to complete before the error state is set
    vi.mocked(weatherService.getCurrentPosition).mockResolvedValue(mockLocation)
    vi.mocked(weatherService.fetchWeather).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useWeather(), { wrapper })

    await waitFor(
      () => {
        expect(result.current.error).toBe('network_error')
      },
      { timeout: 5000 }
    )
  })

  // ─── Loading states ───────────────────────────────────

  it('returns isLoading true while fetching weather (after location obtained)', async () => {
    vi.mocked(weatherService.getCurrentPosition).mockResolvedValue(mockLocation)
    let resolveWeather: (value: weatherService.WeatherData) => void
    vi.mocked(weatherService.fetchWeather).mockImplementation(
      () => new Promise((resolve) => { resolveWeather = resolve })
    )

    const { result } = renderHook(() => useWeather(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLocating).toBe(false)
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })

    await act(async () => {
      resolveWeather!(mockWeatherData)
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('returns isLoading false when location is not yet available', () => {
    // When getCurrentPosition is still pending, location is null,
    // so weatherQuery is disabled and isLoading should be false
    vi.mocked(weatherService.getCurrentPosition).mockImplementation(
      () => new Promise(() => {})
    )

    const { result } = renderHook(() => useWeather(), { wrapper })

    // isLoading is false because the weather query is not enabled yet (no location)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isLocating).toBe(true)
  })

  // ─── Success state ────────────────────────────────────

  it('clears error on successful weather fetch', async () => {
    vi.mocked(weatherService.getCurrentPosition).mockResolvedValue(mockLocation)
    vi.mocked(weatherService.fetchWeather).mockResolvedValue(mockWeatherData)

    const { result } = renderHook(() => useWeather(), { wrapper })

    await waitFor(() => {
      expect(result.current.weather).toBeDefined()
    })

    expect(result.current.error).toBeNull()
  })

  it('caches location info from weather data', async () => {
    vi.mocked(weatherService.getCurrentPosition).mockResolvedValue(mockLocation)
    vi.mocked(weatherService.fetchWeather).mockResolvedValue(mockWeatherData)

    const { result } = renderHook(() => useWeather(), { wrapper })

    await waitFor(() => {
      expect(result.current.weather).toBeDefined()
    })

    expect(mockSetCachedLocation).toHaveBeenCalledWith(40.7128, -74.006, 'New York')
  })

  // ─── Retry ────────────────────────────────────────────

  it('provides retry function that re-requests location', async () => {
    vi.mocked(weatherService.getCurrentPosition).mockRejectedValueOnce(new Error('fail'))

    const { result } = renderHook(() => useWeather(), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBe('position_unavailable')
    })

    // Now set up success for retry
    vi.mocked(weatherService.getCurrentPosition).mockResolvedValue(mockLocation)
    vi.mocked(weatherService.fetchWeather).mockResolvedValue(mockWeatherData)

    act(() => {
      result.current.retry()
    })

    // Should reset locationDenied to false
    expect(mockSetLocationDenied).toHaveBeenCalledWith(false)

    await waitFor(() => {
      expect(result.current.weather).toBeDefined()
    })
  })

  it('retry clears previous errors', async () => {
    vi.mocked(weatherService.getCurrentPosition).mockRejectedValueOnce(new Error('fail'))

    const { result } = renderHook(() => useWeather(), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBe('position_unavailable')
    })

    vi.mocked(weatherService.getCurrentPosition).mockResolvedValue(mockLocation)
    vi.mocked(weatherService.fetchWeather).mockResolvedValue(mockWeatherData)

    act(() => {
      result.current.retry()
    })

    // During retry, isLocating should be true
    expect(result.current.isLocating).toBe(true)
  })

  // ─── Return shape ─────────────────────────────────────

  it('returns all expected fields', async () => {
    vi.mocked(weatherService.getCurrentPosition).mockResolvedValue(mockLocation)
    vi.mocked(weatherService.fetchWeather).mockResolvedValue(mockWeatherData)

    const { result } = renderHook(() => useWeather(), { wrapper })

    // Check shape immediately
    expect(result.current).toHaveProperty('weather')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('isLocating')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('retry')
    expect(typeof result.current.retry).toBe('function')
  })

  it('returns weather as undefined before data arrives', () => {
    vi.mocked(weatherService.getCurrentPosition).mockImplementation(
      () => new Promise(() => {})
    )

    const { result } = renderHook(() => useWeather(), { wrapper })

    expect(result.current.weather).toBeUndefined()
  })

  it('returns correct weather data structure', async () => {
    vi.mocked(weatherService.getCurrentPosition).mockResolvedValue(mockLocation)
    vi.mocked(weatherService.fetchWeather).mockResolvedValue(mockWeatherData)

    const { result } = renderHook(() => useWeather(), { wrapper })

    await waitFor(() => {
      expect(result.current.weather).toBeDefined()
    })

    expect(result.current.weather!.current.temperature).toBe(22)
    expect(result.current.weather!.current.description).toBe('Clear sky')
    expect(result.current.weather!.daily).toHaveLength(1)
    expect(result.current.weather!.location.cityName).toBe('New York')
  })

  // ─── Edge cases ───────────────────────────────────────

  it('handles location denied on mount', () => {
    mockWeatherStoreState({ locationDenied: true })

    const { result } = renderHook(() => useWeather(), { wrapper })

    expect(weatherService.getCurrentPosition).not.toHaveBeenCalled()
    expect(result.current.weather).toBeUndefined()
    expect(result.current.isLocating).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('does not call fetchWeather when no location is available', () => {
    vi.mocked(weatherService.getCurrentPosition).mockImplementation(
      () => new Promise(() => {})
    )

    renderHook(() => useWeather(), { wrapper })

    expect(weatherService.fetchWeather).not.toHaveBeenCalled()
  })
})
