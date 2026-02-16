import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { WeatherCard } from '../WeatherCard'
import type { WeatherData } from '@/services/weatherService'

// Mock framer-motion
vi.mock('motion/react', () => ({
  motion: {
    div: (props: any) => {
      const { initial, animate, exit, variants, whileHover, whileTap, layout, layoutId, transition, ...rest } = props
      return createElement('div', rest)
    },
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock useReducedMotion
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}))

// Mock useWeather hook
const mockRetry = vi.fn()
const mockUseWeather = vi.fn()
vi.mock('@/hooks/useWeather', () => ({
  useWeather: () => mockUseWeather(),
}))

// Mock weather store
const mockToggleTemperatureUnit = vi.fn()
const mockUseWeatherStore = vi.fn()
vi.mock('@/stores/weatherStore', () => ({
  useWeatherStore: () => mockUseWeatherStore(),
}))

// Mock weather service
vi.mock('@/services/weatherService', () => ({
  celsiusToFahrenheit: (c: number) => Math.round(c * 9 / 5 + 32),
  getWeatherGradient: () => 'from-sky-400/15 to-blue-500/5',
  kmhToMph: (kmh: number) => Math.round(kmh * 0.621371),
  getUvLabel: (uv: number) => {
    if (uv < 3) return 'Low'
    if (uv < 6) return 'Moderate'
    if (uv < 8) return 'High'
    if (uv < 11) return 'Very High'
    return 'Extreme'
  },
  getUvColor: (uv: number) => {
    if (uv < 3) return '#22C55E'
    if (uv < 6) return '#EAB308'
    if (uv < 8) return '#F97316'
    if (uv < 11) return '#E63B57'
    return '#A855F7'
  },
  formatSunTime: (iso: string) => {
    const date = new Date(iso)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const h = hours % 12 || 12
    const m = minutes.toString().padStart(2, '0')
    return `${h}:${m} ${ampm}`
  },
}))

const mockWeatherData: WeatherData = {
  current: {
    temperature: 22,
    feelsLike: 20,
    weatherCode: 0,
    description: 'Clear sky',
    emoji: 'sun-emoji',
    windSpeed: 15,
    humidity: 65,
    uvIndex: 5,
  },
  daily: [
    { date: '2025-01-15', dayName: 'Wed', weatherCode: 0, emoji: 'sun-emoji', tempHigh: 25, tempLow: 15, precipitationProbability: 10, sunrise: '2025-01-15T06:42', sunset: '2025-01-15T17:30' },
    { date: '2025-01-16', dayName: 'Thu', weatherCode: 2, emoji: 'cloud-emoji', tempHigh: 20, tempLow: 12, precipitationProbability: 30, sunrise: '2025-01-16T06:41', sunset: '2025-01-16T17:31' },
    { date: '2025-01-17', dayName: 'Fri', weatherCode: 61, emoji: 'rain-emoji', tempHigh: 18, tempLow: 10, precipitationProbability: 80, sunrise: '2025-01-17T06:40', sunset: '2025-01-17T17:32' },
  ],
  location: {
    latitude: 40.7128,
    longitude: -74.006,
    cityName: 'New York',
  },
}

describe('WeatherCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseWeatherStore.mockReturnValue({
      temperatureUnit: 'C',
      toggleTemperatureUnit: mockToggleTemperatureUnit,
      cachedCityName: null,
    })
  })

  describe('loading state', () => {
    it('renders skeleton when locating', () => {
      mockUseWeather.mockReturnValue({
        weather: undefined,
        isLoading: false,
        isLocating: true,
        error: null,
        retry: mockRetry,
      })

      const { container } = render(<WeatherCard />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('renders skeleton when loading', () => {
      mockUseWeather.mockReturnValue({
        weather: undefined,
        isLoading: true,
        isLocating: false,
        error: null,
        retry: mockRetry,
      })

      const { container } = render(<WeatherCard />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('permission denied state', () => {
    it('shows location permission message', () => {
      mockUseWeather.mockReturnValue({
        weather: undefined,
        isLoading: false,
        isLocating: false,
        error: 'permission_denied',
        retry: mockRetry,
      })

      render(<WeatherCard />)
      expect(screen.getByText('Enable location to see weather')).toBeInTheDocument()
    })

    it('shows retry button on permission denied', () => {
      mockUseWeather.mockReturnValue({
        weather: undefined,
        isLoading: false,
        isLocating: false,
        error: 'permission_denied',
        retry: mockRetry,
      })

      render(<WeatherCard />)
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })

    it('calls retry when retry button is clicked on permission denied', () => {
      mockUseWeather.mockReturnValue({
        weather: undefined,
        isLoading: false,
        isLocating: false,
        error: 'permission_denied',
        retry: mockRetry,
      })

      render(<WeatherCard />)
      fireEvent.click(screen.getByText('Retry'))
      expect(mockRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('position unavailable error', () => {
    it('shows unable to get location message', () => {
      mockUseWeather.mockReturnValue({
        weather: undefined,
        isLoading: false,
        isLocating: false,
        error: 'position_unavailable',
        retry: mockRetry,
      })

      render(<WeatherCard />)
      expect(screen.getByText('Unable to get location')).toBeInTheDocument()
    })

    it('shows retry button on position error', () => {
      mockUseWeather.mockReturnValue({
        weather: undefined,
        isLoading: false,
        isLocating: false,
        error: 'position_unavailable',
        retry: mockRetry,
      })

      render(<WeatherCard />)
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })

    it('calls retry when retry button is clicked on position error', () => {
      mockUseWeather.mockReturnValue({
        weather: undefined,
        isLoading: false,
        isLocating: false,
        error: 'position_unavailable',
        retry: mockRetry,
      })

      render(<WeatherCard />)
      fireEvent.click(screen.getByText('Retry'))
      expect(mockRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('network error', () => {
    it('shows weather unavailable message', () => {
      mockUseWeather.mockReturnValue({
        weather: undefined,
        isLoading: false,
        isLocating: false,
        error: 'network_error',
        retry: mockRetry,
      })

      render(<WeatherCard />)
      expect(screen.getByText('Weather unavailable')).toBeInTheDocument()
    })
  })

  describe('no data state', () => {
    it('returns null when no weather data and no error', () => {
      mockUseWeather.mockReturnValue({
        weather: undefined,
        isLoading: false,
        isLocating: false,
        error: null,
        retry: mockRetry,
      })

      const { container } = render(<WeatherCard />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('weather data display - Celsius', () => {
    beforeEach(() => {
      mockUseWeather.mockReturnValue({
        weather: mockWeatherData,
        isLoading: false,
        isLocating: false,
        error: null,
        retry: mockRetry,
      })
      mockUseWeatherStore.mockReturnValue({
        temperatureUnit: 'C',
        toggleTemperatureUnit: mockToggleTemperatureUnit,
        cachedCityName: null,
      })
    })

    it('shows the current temperature in Celsius', () => {
      render(<WeatherCard />)
      expect(screen.getByText('22\u00B0')).toBeInTheDocument()
    })

    it('shows the weather description', () => {
      render(<WeatherCard />)
      expect(screen.getByText('Clear sky')).toBeInTheDocument()
    })

    it('shows feels like temperature', () => {
      render(<WeatherCard />)
      expect(screen.getByText(/Feels 20\u00B0/)).toBeInTheDocument()
    })

    it('shows the city name', () => {
      render(<WeatherCard />)
      expect(screen.getByText('New York')).toBeInTheDocument()
    })

    it('shows the weather emoji', () => {
      render(<WeatherCard />)
      // Current emoji appears in the main display and first forecast day
      const emojis = screen.getAllByText('sun-emoji')
      expect(emojis.length).toBeGreaterThanOrEqual(1)
      // The main current emoji has text-lg class (condensed layout)
      const mainEmoji = emojis.find(el => el.className.includes('text-lg'))
      expect(mainEmoji).toBeTruthy()
    })

    it('renders daily forecast items', () => {
      render(<WeatherCard />)
      // First day shows "Now" instead of day label
      expect(screen.getByText('Now')).toBeInTheDocument()
      // Rolling layout uses single-char day labels (S, M, T, W, T, F, S)
      // The exact labels depend on the current day of the week
      // Just verify the forecast emojis are rendered
      expect(screen.getByText('cloud-emoji')).toBeInTheDocument()
      expect(screen.getByText('rain-emoji')).toBeInTheDocument()
    })

    it('shows high and low temperatures in forecast', () => {
      render(<WeatherCard />)
      expect(screen.getByText('25\u00B0')).toBeInTheDocument()
      expect(screen.getByText('15\u00B0')).toBeInTheDocument()
    })
  })

  describe('weather data display - Fahrenheit', () => {
    beforeEach(() => {
      mockUseWeather.mockReturnValue({
        weather: mockWeatherData,
        isLoading: false,
        isLocating: false,
        error: null,
        retry: mockRetry,
      })
      mockUseWeatherStore.mockReturnValue({
        temperatureUnit: 'F',
        toggleTemperatureUnit: mockToggleTemperatureUnit,
        cachedCityName: null,
      })
    })

    it('shows the current temperature in Fahrenheit', () => {
      render(<WeatherCard />)
      // 22C = 72F
      expect(screen.getByText('72\u00B0')).toBeInTheDocument()
    })

    it('shows feels like temperature in Fahrenheit', () => {
      render(<WeatherCard />)
      // 20C = 68F
      expect(screen.getByText(/Feels 68\u00B0/)).toBeInTheDocument()
    })
  })

  describe('temperature toggle', () => {
    it('calls toggleTemperatureUnit when current temperature is clicked', () => {
      mockUseWeather.mockReturnValue({
        weather: mockWeatherData,
        isLoading: false,
        isLocating: false,
        error: null,
        retry: mockRetry,
      })

      render(<WeatherCard />)
      const tempButton = screen.getByTitle(/Switch to/)
      fireEvent.click(tempButton)
      expect(mockToggleTemperatureUnit).toHaveBeenCalledTimes(1)
    })

    it('shows switch to F hint when in Celsius mode', () => {
      mockUseWeather.mockReturnValue({
        weather: mockWeatherData,
        isLoading: false,
        isLocating: false,
        error: null,
        retry: mockRetry,
      })

      render(<WeatherCard />)
      expect(screen.getByTitle('Switch to \u00B0F')).toBeInTheDocument()
    })

    it('shows switch to C hint when in Fahrenheit mode', () => {
      mockUseWeather.mockReturnValue({
        weather: mockWeatherData,
        isLoading: false,
        isLocating: false,
        error: null,
        retry: mockRetry,
      })
      mockUseWeatherStore.mockReturnValue({
        temperatureUnit: 'F',
        toggleTemperatureUnit: mockToggleTemperatureUnit,
        cachedCityName: null,
      })

      render(<WeatherCard />)
      expect(screen.getByTitle('Switch to \u00B0C')).toBeInTheDocument()
    })
  })

  describe('city name fallback', () => {
    it('uses cachedCityName when location cityName is Unknown', () => {
      const weatherWithUnknownCity: WeatherData = {
        ...mockWeatherData,
        location: { ...mockWeatherData.location, cityName: 'Unknown' },
      }
      mockUseWeather.mockReturnValue({
        weather: weatherWithUnknownCity,
        isLoading: false,
        isLocating: false,
        error: null,
        retry: mockRetry,
      })
      mockUseWeatherStore.mockReturnValue({
        temperatureUnit: 'C',
        toggleTemperatureUnit: mockToggleTemperatureUnit,
        cachedCityName: 'Cached City',
      })

      render(<WeatherCard />)
      expect(screen.getByText('Cached City')).toBeInTheDocument()
    })

    it('does not display city when both cityName and cachedCityName are empty', () => {
      const weatherWithUnknownCity: WeatherData = {
        ...mockWeatherData,
        location: { ...mockWeatherData.location, cityName: 'Unknown' },
      }
      mockUseWeather.mockReturnValue({
        weather: weatherWithUnknownCity,
        isLoading: false,
        isLocating: false,
        error: null,
        retry: mockRetry,
      })
      mockUseWeatherStore.mockReturnValue({
        temperatureUnit: 'C',
        toggleTemperatureUnit: mockToggleTemperatureUnit,
        cachedCityName: null,
      })

      render(<WeatherCard />)
      expect(screen.queryByText('Unknown')).not.toBeInTheDocument()
    })
  })

  describe('forecast section', () => {
    it('renders correct number of forecast days', () => {
      mockUseWeather.mockReturnValue({
        weather: mockWeatherData,
        isLoading: false,
        isLocating: false,
        error: null,
        retry: mockRetry,
      })

      render(<WeatherCard />)
      // 3 days of forecast
      const emojis = screen.getAllByText(/emoji/)
      // 1 current emoji + 3 daily emojis = 4 total
      expect(emojis.length).toBe(4)
    })

    it('labels the first forecast day as Now', () => {
      mockUseWeather.mockReturnValue({
        weather: mockWeatherData,
        isLoading: false,
        isLocating: false,
        error: null,
        retry: mockRetry,
      })

      render(<WeatherCard />)
      expect(screen.getByText('Now')).toBeInTheDocument()
    })

    it('renders day emojis in forecast', () => {
      mockUseWeather.mockReturnValue({
        weather: mockWeatherData,
        isLoading: false,
        isLocating: false,
        error: null,
        retry: mockRetry,
      })

      render(<WeatherCard />)
      expect(screen.getByText('cloud-emoji')).toBeInTheDocument()
      expect(screen.getByText('rain-emoji')).toBeInTheDocument()
    })
  })

  describe('expandable details', () => {
    beforeEach(() => {
      mockUseWeather.mockReturnValue({
        weather: mockWeatherData,
        isLoading: false,
        isLocating: false,
        error: null,
        retry: mockRetry,
      })
      mockUseWeatherStore.mockReturnValue({
        temperatureUnit: 'C',
        toggleTemperatureUnit: mockToggleTemperatureUnit,
        cachedCityName: null,
      })
    })

    it('does not show details by default', () => {
      render(<WeatherCard />)
      expect(screen.queryByText('Wind')).not.toBeInTheDocument()
      expect(screen.queryByText('Humidity')).not.toBeInTheDocument()
      expect(screen.queryByText('UV Index')).not.toBeInTheDocument()
    })

    it('shows details after clicking the card', () => {
      render(<WeatherCard />)
      // Click the card to expand
      fireEvent.click(screen.getByText('Clear sky').closest('[class*="overflow-hidden"]')!)
      expect(screen.getByText('Wind')).toBeInTheDocument()
      expect(screen.getByText('Humidity')).toBeInTheDocument()
      expect(screen.getByText('Rain Chance')).toBeInTheDocument()
      expect(screen.getByText('Sun Times')).toBeInTheDocument()
      // UV Index shown as static fallback (no hourly data in mock)
      expect(screen.getByText('UV Index')).toBeInTheDocument()
    })

    it('shows correct wind speed in km/h when Celsius', () => {
      render(<WeatherCard />)
      fireEvent.click(screen.getByText('Clear sky').closest('[class*="overflow-hidden"]')!)
      expect(screen.getByText('15 km/h')).toBeInTheDocument()
    })

    it('shows correct wind speed in mph when Fahrenheit', () => {
      mockUseWeatherStore.mockReturnValue({
        temperatureUnit: 'F',
        toggleTemperatureUnit: mockToggleTemperatureUnit,
        cachedCityName: null,
      })
      render(<WeatherCard />)
      fireEvent.click(screen.getByText('Clear sky').closest('[class*="overflow-hidden"]')!)
      // 15 * 0.621371 = 9.32 → 9
      expect(screen.getByText('9 mph')).toBeInTheDocument()
    })

    it('shows humidity percentage', () => {
      render(<WeatherCard />)
      fireEvent.click(screen.getByText('Clear sky').closest('[class*="overflow-hidden"]')!)
      expect(screen.getByText('65%')).toBeInTheDocument()
    })

    it('shows UV index with label', () => {
      render(<WeatherCard />)
      fireEvent.click(screen.getByText('Clear sky').closest('[class*="overflow-hidden"]')!)
      expect(screen.getByText('5 · Moderate')).toBeInTheDocument()
    })

    it('shows precipitation probability', () => {
      render(<WeatherCard />)
      fireEvent.click(screen.getByText('Clear sky').closest('[class*="overflow-hidden"]')!)
      expect(screen.getByText('10%')).toBeInTheDocument()
    })

    it('collapses on second click', () => {
      render(<WeatherCard />)
      const card = screen.getByText('Clear sky').closest('[class*="overflow-hidden"]')!
      fireEvent.click(card)
      expect(screen.getByText('Wind')).toBeInTheDocument()
      fireEvent.click(card)
      expect(screen.queryByText('Wind')).not.toBeInTheDocument()
    })

    it('does not toggle expand when temperature button is clicked', () => {
      render(<WeatherCard />)
      const tempButton = screen.getByTitle(/Switch to/)
      fireEvent.click(tempButton)
      // Should NOT expand — details should still be hidden
      expect(screen.queryByText('Wind')).not.toBeInTheDocument()
      expect(mockToggleTemperatureUnit).toHaveBeenCalledTimes(1)
    })
  })
})
