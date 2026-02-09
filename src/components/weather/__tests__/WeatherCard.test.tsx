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
}))

const mockWeatherData: WeatherData = {
  current: {
    temperature: 22,
    feelsLike: 20,
    weatherCode: 0,
    description: 'Clear sky',
    emoji: 'sun-emoji',
  },
  daily: [
    { date: '2025-01-15', dayName: 'Wed', weatherCode: 0, emoji: 'sun-emoji', tempHigh: 25, tempLow: 15 },
    { date: '2025-01-16', dayName: 'Thu', weatherCode: 2, emoji: 'cloud-emoji', tempHigh: 20, tempLow: 12 },
    { date: '2025-01-17', dayName: 'Fri', weatherCode: 61, emoji: 'rain-emoji', tempHigh: 18, tempLow: 10 },
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
      expect(screen.getByText(/Feels like 20\u00B0/)).toBeInTheDocument()
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
      // The main current emoji has text-4xl class
      const mainEmoji = emojis.find(el => el.className.includes('text-4xl'))
      expect(mainEmoji).toBeTruthy()
    })

    it('renders daily forecast items', () => {
      render(<WeatherCard />)
      // First day shows "Now" instead of day name
      expect(screen.getByText('Now')).toBeInTheDocument()
      // Subsequent days show day name
      expect(screen.getByText('Thu')).toBeInTheDocument()
      expect(screen.getByText('Fri')).toBeInTheDocument()
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
      expect(screen.getByText(/Feels like 68\u00B0/)).toBeInTheDocument()
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
})
