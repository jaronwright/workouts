import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getWeatherDescription,
  getWeatherEmoji,
  getWeatherGradient,
  celsiusToFahrenheit,
  kmhToMph,
  getUvLabel,
  formatSunTime,
  getCurrentPosition,
  reverseGeocode,
  fetchWeather,
} from '../weatherService'
import type { GeoLocation, WeatherData } from '../weatherService'

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('weatherService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ────────────────────────────────────────────────────────
  // getWeatherDescription
  // ────────────────────────────────────────────────────────

  describe('getWeatherDescription', () => {
    it('returns "Clear sky" for code 0', () => {
      expect(getWeatherDescription(0)).toBe('Clear sky')
    })

    it('returns "Mainly clear" for code 1', () => {
      expect(getWeatherDescription(1)).toBe('Mainly clear')
    })

    it('returns "Partly cloudy" for code 2', () => {
      expect(getWeatherDescription(2)).toBe('Partly cloudy')
    })

    it('returns "Overcast" for code 3', () => {
      expect(getWeatherDescription(3)).toBe('Overcast')
    })

    it('returns "Foggy" for code 45', () => {
      expect(getWeatherDescription(45)).toBe('Foggy')
    })

    it('returns "Icy fog" for code 48', () => {
      expect(getWeatherDescription(48)).toBe('Icy fog')
    })

    it('returns correct descriptions for drizzle codes', () => {
      expect(getWeatherDescription(51)).toBe('Light drizzle')
      expect(getWeatherDescription(53)).toBe('Drizzle')
      expect(getWeatherDescription(55)).toBe('Heavy drizzle')
    })

    it('returns correct descriptions for rain codes', () => {
      expect(getWeatherDescription(61)).toBe('Light rain')
      expect(getWeatherDescription(63)).toBe('Rain')
      expect(getWeatherDescription(65)).toBe('Heavy rain')
    })

    it('returns correct descriptions for snow codes', () => {
      expect(getWeatherDescription(71)).toBe('Light snow')
      expect(getWeatherDescription(73)).toBe('Snow')
      expect(getWeatherDescription(75)).toBe('Heavy snow')
    })

    it('returns correct descriptions for thunderstorm codes', () => {
      expect(getWeatherDescription(95)).toBe('Thunderstorm')
      expect(getWeatherDescription(96)).toBe('Thunderstorm with hail')
      expect(getWeatherDescription(99)).toBe('Severe thunderstorm')
    })

    it('returns correct descriptions for freezing precipitation', () => {
      expect(getWeatherDescription(56)).toBe('Freezing drizzle')
      expect(getWeatherDescription(57)).toBe('Heavy freezing drizzle')
      expect(getWeatherDescription(66)).toBe('Freezing rain')
      expect(getWeatherDescription(67)).toBe('Heavy freezing rain')
    })

    it('returns correct descriptions for shower codes', () => {
      expect(getWeatherDescription(80)).toBe('Light showers')
      expect(getWeatherDescription(81)).toBe('Showers')
      expect(getWeatherDescription(82)).toBe('Heavy showers')
    })

    it('returns correct descriptions for snow shower codes', () => {
      expect(getWeatherDescription(85)).toBe('Light snow showers')
      expect(getWeatherDescription(86)).toBe('Heavy snow showers')
    })

    it('returns "Snow grains" for code 77', () => {
      expect(getWeatherDescription(77)).toBe('Snow grains')
    })

    it('returns "Unknown" for unrecognized code', () => {
      expect(getWeatherDescription(999)).toBe('Unknown')
    })

    it('returns "Unknown" for negative code', () => {
      expect(getWeatherDescription(-1)).toBe('Unknown')
    })

    it('returns "Unknown" for code not in the map', () => {
      expect(getWeatherDescription(50)).toBe('Unknown')
    })
  })

  // ────────────────────────────────────────────────────────
  // getWeatherEmoji
  // ────────────────────────────────────────────────────────

  describe('getWeatherEmoji', () => {
    it('returns sun emoji for clear sky (code 0)', () => {
      expect(getWeatherEmoji(0)).toBe('☀️')
    })

    it('returns partly sunny emoji for mainly clear (code 1)', () => {
      expect(getWeatherEmoji(1)).toBe('🌤️')
    })

    it('returns partly cloudy emoji for code 2', () => {
      expect(getWeatherEmoji(2)).toBe('⛅')
    })

    it('returns cloud emoji for overcast (code 3)', () => {
      expect(getWeatherEmoji(3)).toBe('☁️')
    })

    it('returns fog emoji for foggy codes', () => {
      expect(getWeatherEmoji(45)).toBe('🌫️')
      expect(getWeatherEmoji(48)).toBe('🌫️')
    })

    it('returns rain emoji for rain codes', () => {
      expect(getWeatherEmoji(61)).toBe('🌧️')
      expect(getWeatherEmoji(63)).toBe('🌧️')
      expect(getWeatherEmoji(65)).toBe('🌧️')
    })

    it('returns snow emoji for snow codes', () => {
      expect(getWeatherEmoji(71)).toBe('🌨️')
      expect(getWeatherEmoji(73)).toBe('🌨️')
      expect(getWeatherEmoji(75)).toBe('🌨️')
    })

    it('returns thunderstorm emoji for storm codes', () => {
      expect(getWeatherEmoji(95)).toBe('⛈️')
      expect(getWeatherEmoji(96)).toBe('⛈️')
      expect(getWeatherEmoji(99)).toBe('⛈️')
    })

    it('returns default thermometer emoji for unrecognized code', () => {
      expect(getWeatherEmoji(999)).toBe('🌡️')
    })

    it('returns default emoji for negative code', () => {
      expect(getWeatherEmoji(-1)).toBe('🌡️')
    })
  })

  // ────────────────────────────────────────────────────────
  // getWeatherGradient
  // ────────────────────────────────────────────────────────

  describe('getWeatherGradient', () => {
    it('returns sky gradient for clear sky (code 0)', () => {
      expect(getWeatherGradient(0)).toBe('from-sky-400/15 to-blue-500/5')
    })

    it('returns slate gradient for overcast (code 3)', () => {
      expect(getWeatherGradient(3)).toBe('from-slate-400/12 to-slate-500/5')
    })

    it('returns purple gradient for thunderstorms', () => {
      expect(getWeatherGradient(95)).toBe('from-purple-500/15 to-slate-600/8')
      expect(getWeatherGradient(99)).toBe('from-purple-700/20 to-slate-800/12')
    })

    it('returns default gradient for unrecognized code', () => {
      expect(getWeatherGradient(999)).toBe('from-sky-400/10 to-blue-500/5')
    })

    it('returns default gradient for negative code', () => {
      expect(getWeatherGradient(-1)).toBe('from-sky-400/10 to-blue-500/5')
    })

    it('returns slate/blue gradient for snow codes', () => {
      expect(getWeatherGradient(71)).toBe('from-slate-300/15 to-blue-200/8')
      expect(getWeatherGradient(75)).toBe('from-slate-400/20 to-blue-300/10')
    })

    it('returns fog gradient for fog codes', () => {
      expect(getWeatherGradient(45)).toBe('from-slate-400/15 to-slate-500/8')
      expect(getWeatherGradient(48)).toBe('from-slate-400/15 to-slate-500/8')
    })
  })

  // ────────────────────────────────────────────────────────
  // celsiusToFahrenheit
  // ────────────────────────────────────────────────────────

  describe('celsiusToFahrenheit', () => {
    it('converts 0°C to 32°F', () => {
      expect(celsiusToFahrenheit(0)).toBe(32)
    })

    it('converts 100°C to 212°F', () => {
      expect(celsiusToFahrenheit(100)).toBe(212)
    })

    it('converts -40°C to -40°F (where scales meet)', () => {
      expect(celsiusToFahrenheit(-40)).toBe(-40)
    })

    it('converts 20°C to 68°F', () => {
      expect(celsiusToFahrenheit(20)).toBe(68)
    })

    it('converts 37°C (body temp) to 99°F', () => {
      // 37 * 9/5 + 32 = 98.6, rounded = 99
      expect(celsiusToFahrenheit(37)).toBe(99)
    })

    it('rounds the result to nearest integer', () => {
      // 15 * 9/5 + 32 = 59
      expect(celsiusToFahrenheit(15)).toBe(59)
    })

    it('handles negative temperatures', () => {
      // -10 * 9/5 + 32 = 14
      expect(celsiusToFahrenheit(-10)).toBe(14)
    })

    it('handles decimal input and rounds output', () => {
      // 22.5 * 9/5 + 32 = 72.5 → 73
      expect(celsiusToFahrenheit(22.5)).toBe(73)
    })
  })

  // ────────────────────────────────────────────────────────
  // kmhToMph
  // ────────────────────────────────────────────────────────

  describe('kmhToMph', () => {
    it('converts 0 km/h to 0 mph', () => {
      expect(kmhToMph(0)).toBe(0)
    })

    it('converts 10 km/h to 6 mph', () => {
      expect(kmhToMph(10)).toBe(6)
    })

    it('converts 100 km/h to 62 mph', () => {
      expect(kmhToMph(100)).toBe(62)
    })

    it('rounds the result', () => {
      // 15 * 0.621371 = 9.320565 → 9
      expect(kmhToMph(15)).toBe(9)
    })
  })

  // ────────────────────────────────────────────────────────
  // getUvLabel
  // ────────────────────────────────────────────────────────

  describe('getUvLabel', () => {
    it('returns "Low" for UV index 0', () => {
      expect(getUvLabel(0)).toBe('Low')
    })

    it('returns "Low" for UV index 2', () => {
      expect(getUvLabel(2)).toBe('Low')
    })

    it('returns "Moderate" for UV index 3', () => {
      expect(getUvLabel(3)).toBe('Moderate')
    })

    it('returns "Moderate" for UV index 5', () => {
      expect(getUvLabel(5)).toBe('Moderate')
    })

    it('returns "High" for UV index 6', () => {
      expect(getUvLabel(6)).toBe('High')
    })

    it('returns "High" for UV index 7', () => {
      expect(getUvLabel(7)).toBe('High')
    })

    it('returns "Very High" for UV index 8', () => {
      expect(getUvLabel(8)).toBe('Very High')
    })

    it('returns "Very High" for UV index 10', () => {
      expect(getUvLabel(10)).toBe('Very High')
    })

    it('returns "Extreme" for UV index 11', () => {
      expect(getUvLabel(11)).toBe('Extreme')
    })

    it('returns "Extreme" for UV index 15', () => {
      expect(getUvLabel(15)).toBe('Extreme')
    })
  })

  // ────────────────────────────────────────────────────────
  // formatSunTime
  // ────────────────────────────────────────────────────────

  describe('formatSunTime', () => {
    it('formats morning time correctly', () => {
      expect(formatSunTime('2025-01-15T06:42')).toBe('6:42 AM')
    })

    it('formats afternoon time correctly', () => {
      expect(formatSunTime('2025-01-15T17:30')).toBe('5:30 PM')
    })

    it('formats noon as 12:00 PM', () => {
      expect(formatSunTime('2025-01-15T12:00')).toBe('12:00 PM')
    })

    it('formats midnight as 12:00 AM', () => {
      expect(formatSunTime('2025-01-15T00:00')).toBe('12:00 AM')
    })

    it('pads minutes with leading zero', () => {
      expect(formatSunTime('2025-01-15T07:05')).toBe('7:05 AM')
    })
  })

  // ────────────────────────────────────────────────────────
  // getCurrentPosition
  // ────────────────────────────────────────────────────────

  describe('getCurrentPosition', () => {
    const originalNavigator = globalThis.navigator

    afterEach(() => {
      // Restore navigator
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      })
    })

    it('resolves with latitude and longitude on success', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success) => {
          success({
            coords: {
              latitude: 40.7128,
              longitude: -74.006,
            },
          })
        }),
      }
      Object.defineProperty(globalThis, 'navigator', {
        value: { geolocation: mockGeolocation },
        writable: true,
        configurable: true,
      })

      const result = await getCurrentPosition()

      expect(result).toEqual({ latitude: 40.7128, longitude: -74.006 })
    })

    it('rejects when geolocation is not supported', async () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { geolocation: undefined },
        writable: true,
        configurable: true,
      })

      await expect(getCurrentPosition()).rejects.toThrow('Geolocation not supported')
    })

    it('rejects when user denies permission', async () => {
      const permissionError = new Error('User denied Geolocation')
      const mockGeolocation = {
        getCurrentPosition: vi.fn((_success, error) => {
          error(permissionError)
        }),
      }
      Object.defineProperty(globalThis, 'navigator', {
        value: { geolocation: mockGeolocation },
        writable: true,
        configurable: true,
      })

      await expect(getCurrentPosition()).rejects.toEqual(permissionError)
    })

    it('calls getCurrentPosition with correct options', async () => {
      const mockGetCurrentPosition = vi.fn((success) => {
        success({ coords: { latitude: 0, longitude: 0 } })
      })
      Object.defineProperty(globalThis, 'navigator', {
        value: { geolocation: { getCurrentPosition: mockGetCurrentPosition } },
        writable: true,
        configurable: true,
      })

      await getCurrentPosition()

      expect(mockGetCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 10 * 60 * 1000,
        }
      )
    })
  })

  // ────────────────────────────────────────────────────────
  // reverseGeocode
  // ────────────────────────────────────────────────────────

  describe('reverseGeocode', () => {
    it('returns city name from geocoding response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          address: {
            city: 'New York',
            county: 'New York County',
          },
        }),
      })

      const result = await reverseGeocode(40.7128, -74.006)

      expect(result).toBe('New York')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/reverse?lat=40.7128&lon=-74.006&format=json&zoom=10',
        { headers: { 'Accept-Language': 'en' } }
      )
    })

    it('falls back to town when city is not available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          address: {
            town: 'Springfield',
            county: 'Hampden County',
          },
        }),
      })

      const result = await reverseGeocode(42.1015, -72.5898)
      expect(result).toBe('Springfield')
    })

    it('falls back to village when city and town are not available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          address: {
            village: 'Small Town',
            county: 'Rural County',
          },
        }),
      })

      const result = await reverseGeocode(35.0, -85.0)
      expect(result).toBe('Small Town')
    })

    it('falls back to county when city, town, and village are not available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          address: {
            county: 'Some County',
          },
        }),
      })

      const result = await reverseGeocode(35.0, -85.0)
      expect(result).toBe('Some County')
    })

    it('returns "Unknown" when no address fields match', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          address: {
            country: 'Nowhere',
          },
        }),
      })

      const result = await reverseGeocode(0, 0)
      expect(result).toBe('Unknown')
    })

    it('returns "Unknown" when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const result = await reverseGeocode(40.7128, -74.006)
      expect(result).toBe('Unknown')
    })

    it('returns "Unknown" when fetch throws an error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await reverseGeocode(40.7128, -74.006)
      expect(result).toBe('Unknown')
    })

    it('returns "Unknown" when address is missing from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })

      const result = await reverseGeocode(0, 0)
      expect(result).toBe('Unknown')
    })

    it('constructs URL with correct lat/lon parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ address: { city: 'Test' } }),
      })

      await reverseGeocode(51.5074, -0.1278)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/reverse?lat=51.5074&lon=-0.1278&format=json&zoom=10',
        { headers: { 'Accept-Language': 'en' } }
      )
    })
  })

  // ────────────────────────────────────────────────────────
  // fetchWeather
  // ────────────────────────────────────────────────────────

  describe('fetchWeather', () => {
    const mockLocation: GeoLocation = { latitude: 40.7128, longitude: -74.006 }

    const mockWeatherApiResponse = {
      current: {
        temperature_2m: 22.3,
        apparent_temperature: 20.1,
        weather_code: 0,
        wind_speed_10m: 12.5,
        relative_humidity_2m: 65,
        uv_index: 5.2,
      },
      daily: {
        time: ['2024-06-01', '2024-06-02', '2024-06-03'],
        weather_code: [0, 2, 61],
        temperature_2m_max: [25.5, 23.1, 18.9],
        temperature_2m_min: [15.2, 14.8, 12.3],
        precipitation_probability_max: [10, 30, 80],
        sunrise: ['2024-06-01T05:30', '2024-06-02T05:29', '2024-06-03T05:28'],
        sunset: ['2024-06-01T20:15', '2024-06-02T20:16', '2024-06-03T20:17'],
      },
    }

    const mockGeocodingResponse = {
      address: { city: 'New York' },
    }

    it('fetches weather data and returns formatted WeatherData', async () => {
      // First call: weather API, second call: geocoding
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockWeatherApiResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })

      const result = await fetchWeather(mockLocation)

      expect(result.current.temperature).toBe(22)
      expect(result.current.feelsLike).toBe(20)
      expect(result.current.weatherCode).toBe(0)
      expect(result.current.description).toBe('Clear sky')
      expect(result.current.emoji).toBe('☀️')
      expect(result.current.windSpeed).toBe(13) // Math.round(12.5)
      expect(result.current.humidity).toBe(65)
      expect(result.current.uvIndex).toBe(5) // Math.round(5.2)
      expect(result.location.latitude).toBe(40.7128)
      expect(result.location.longitude).toBe(-74.006)
      expect(result.location.cityName).toBe('New York')
      expect(result.daily).toHaveLength(3)
    })

    it('formats daily forecast correctly', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockWeatherApiResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })

      const result = await fetchWeather(mockLocation)

      // Check first day forecast
      const day1 = result.daily[0]
      expect(day1.date).toBe('2024-06-01')
      expect(day1.weatherCode).toBe(0)
      expect(day1.emoji).toBe('☀️')
      expect(day1.tempHigh).toBe(26) // Math.round(25.5)
      expect(day1.tempLow).toBe(15) // Math.round(15.2)
      expect(day1.precipitationProbability).toBe(10)
      expect(day1.sunrise).toBe('2024-06-01T05:30')
      expect(day1.sunset).toBe('2024-06-01T20:15')

      // Check second day
      const day2 = result.daily[1]
      expect(day2.weatherCode).toBe(2)
      expect(day2.emoji).toBe('⛅')
      expect(day2.precipitationProbability).toBe(30)

      // Check third day (rain)
      const day3 = result.daily[2]
      expect(day3.weatherCode).toBe(61)
      expect(day3.emoji).toBe('🌧️')
      expect(day3.precipitationProbability).toBe(80)
    })

    it('rounds temperature values', async () => {
      const response = {
        ...mockWeatherApiResponse,
        current: {
          temperature_2m: 22.7,
          apparent_temperature: 19.2,
          weather_code: 1,
        },
      }
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(response),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })

      const result = await fetchWeather(mockLocation)

      expect(result.current.temperature).toBe(23) // Math.round(22.7)
      expect(result.current.feelsLike).toBe(19) // Math.round(19.2)
    })

    it('calls the Open-Meteo API with correct parameters', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockWeatherApiResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })

      await fetchWeather(mockLocation)

      const weatherCall = mockFetch.mock.calls[0][0] as string
      expect(weatherCall).toContain('https://api.open-meteo.com/v1/forecast')
      expect(weatherCall).toContain('latitude=40.7128')
      expect(weatherCall).toContain('longitude=-74.006')
      expect(weatherCall).toContain('current=temperature_2m')
      expect(weatherCall).toContain('apparent_temperature')
      expect(weatherCall).toContain('weather_code')
      expect(weatherCall).toContain('wind_speed_10m')
      expect(weatherCall).toContain('relative_humidity_2m')
      expect(weatherCall).toContain('uv_index')
      expect(weatherCall).toContain('precipitation_probability_max')
      expect(weatherCall).toContain('sunrise')
      expect(weatherCall).toContain('sunset')
      expect(weatherCall).toContain('wind_speed_unit=kmh')
      expect(weatherCall).toContain('temperature_unit=celsius')
      expect(weatherCall).toContain('timezone=auto')
      expect(weatherCall).toContain('forecast_days=7')
    })

    it('throws when weather API returns non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(fetchWeather(mockLocation)).rejects.toThrow('Failed to fetch weather data')
    })

    it('assigns day names correctly based on date', async () => {
      const response = {
        ...mockWeatherApiResponse,
        daily: {
          // Monday, June 3, 2024
          time: ['2024-06-03'],
          weather_code: [0],
          temperature_2m_max: [25],
          temperature_2m_min: [15],
        },
      }
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(response),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })

      const result = await fetchWeather(mockLocation)

      expect(result.daily[0].dayName).toBe('Mon')
    })

    it('handles geocoding failure gracefully (city becomes "Unknown")', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockWeatherApiResponse),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })

      const result = await fetchWeather(mockLocation)

      expect(result.location.cityName).toBe('Unknown')
      // Weather data should still be present
      expect(result.current.temperature).toBe(22)
    })

    it('works with different geolocations', async () => {
      const londonLocation: GeoLocation = { latitude: 51.5074, longitude: -0.1278 }
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockWeatherApiResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ address: { city: 'London' } }),
        })

      const result = await fetchWeather(londonLocation)

      expect(result.location.latitude).toBe(51.5074)
      expect(result.location.longitude).toBe(-0.1278)
      expect(result.location.cityName).toBe('London')
    })

    it('uses getWeatherDescription and getWeatherEmoji for current weather', async () => {
      const response = {
        ...mockWeatherApiResponse,
        current: {
          temperature_2m: 10,
          apparent_temperature: 5,
          weather_code: 95,
        },
      }
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(response),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })

      const result = await fetchWeather(mockLocation)

      expect(result.current.description).toBe('Thunderstorm')
      expect(result.current.emoji).toBe('⛈️')
      expect(result.current.weatherCode).toBe(95)
    })

    it('maps daily forecasts with correct emojis', async () => {
      const response = {
        ...mockWeatherApiResponse,
        daily: {
          time: ['2024-06-01', '2024-06-02'],
          weather_code: [71, 45],
          temperature_2m_max: [2, 5],
          temperature_2m_min: [-3, -1],
        },
      }
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(response),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeocodingResponse),
        })

      const result = await fetchWeather(mockLocation)

      expect(result.daily[0].emoji).toBe('🌨️') // snow
      expect(result.daily[1].emoji).toBe('🌫️') // fog
    })
  })
})
