// Weather service using Open-Meteo API (free, no API key required)

export interface GeoLocation {
  latitude: number
  longitude: number
}

export interface LocationInfo {
  latitude: number
  longitude: number
  cityName: string
}

export interface CurrentWeather {
  temperature: number
  feelsLike: number
  weatherCode: number
  description: string
  emoji: string
  windSpeed: number
  humidity: number
  uvIndex: number
}

export interface DailyForecast {
  date: string
  dayName: string
  weatherCode: number
  emoji: string
  tempHigh: number
  tempLow: number
  precipitationProbability: number
  sunrise: string
  sunset: string
}

export interface WeatherData {
  current: CurrentWeather
  daily: DailyForecast[]
  location: LocationInfo
}

// WMO Weather interpretation codes
// https://open-meteo.com/en/docs#weathervariables
const weatherDescriptions: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Icy fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Heavy freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Heavy freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Heavy showers',
  85: 'Light snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm',
}

const weatherEmojis: Record<number, string> = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌧️',
  55: '🌧️',
  56: '🌧️',
  57: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  66: '🌧️',
  67: '🌧️',
  71: '🌨️',
  73: '🌨️',
  75: '🌨️',
  77: '🌨️',
  80: '🌦️',
  81: '🌧️',
  82: '🌧️',
  85: '🌨️',
  86: '🌨️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
}

// Gradient classes for weather card overlay
const weatherGradients: Record<number, string> = {
  0: 'from-sky-400/15 to-blue-500/5',
  1: 'from-sky-400/12 to-blue-400/5',
  2: 'from-sky-300/10 to-slate-400/5',
  3: 'from-slate-400/12 to-slate-500/5',
  45: 'from-slate-400/15 to-slate-500/8',
  48: 'from-slate-400/15 to-slate-500/8',
  51: 'from-blue-400/10 to-slate-400/5',
  53: 'from-blue-500/12 to-slate-500/5',
  55: 'from-blue-500/15 to-slate-500/8',
  56: 'from-blue-400/12 to-cyan-400/5',
  57: 'from-blue-500/15 to-cyan-500/8',
  61: 'from-blue-500/12 to-slate-500/5',
  63: 'from-blue-500/15 to-slate-500/8',
  65: 'from-blue-600/18 to-slate-600/8',
  66: 'from-blue-500/15 to-cyan-500/8',
  67: 'from-blue-600/18 to-cyan-600/8',
  71: 'from-slate-300/15 to-blue-200/8',
  73: 'from-slate-300/18 to-blue-200/10',
  75: 'from-slate-400/20 to-blue-300/10',
  77: 'from-slate-300/15 to-blue-200/8',
  80: 'from-blue-400/10 to-slate-400/5',
  81: 'from-blue-500/15 to-slate-500/8',
  82: 'from-blue-600/18 to-slate-600/8',
  85: 'from-slate-300/15 to-blue-200/8',
  86: 'from-slate-400/18 to-blue-300/10',
  95: 'from-purple-500/15 to-slate-600/8',
  96: 'from-purple-600/18 to-slate-700/10',
  99: 'from-purple-700/20 to-slate-800/12',
}

export function getWeatherDescription(code: number): string {
  return weatherDescriptions[code] || 'Unknown'
}

export function getWeatherEmoji(code: number): string {
  return weatherEmojis[code] || '🌡️'
}

export function getWeatherGradient(code: number): string {
  return weatherGradients[code] || 'from-sky-400/10 to-blue-500/5'
}

export function celsiusToFahrenheit(c: number): number {
  return Math.round(c * 9 / 5 + 32)
}

export function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371)
}

export function getUvLabel(uvIndex: number): string {
  if (uvIndex < 3) return 'Low'
  if (uvIndex < 6) return 'Moderate'
  if (uvIndex < 8) return 'High'
  if (uvIndex < 11) return 'Very High'
  return 'Extreme'
}

export function formatSunTime(isoString: string): string {
  const date = new Date(isoString)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  const m = minutes.toString().padStart(2, '0')
  return `${h}:${m} ${ampm}`
}

export function getCurrentPosition(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 10 * 60 * 1000, // 10 minutes
      }
    )
  })
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
      { headers: { 'Accept-Language': 'en' } }
    )
    if (!res.ok) return 'Unknown'
    const data = await res.json()
    return data.address?.city
      || data.address?.town
      || data.address?.village
      || data.address?.county
      || 'Unknown'
  } catch {
    return 'Unknown'
  }
}

export async function fetchWeather(location: GeoLocation): Promise<WeatherData> {
  const { latitude, longitude } = location

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,uv_index',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
    forecast_days: '7',
  })

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error('Failed to fetch weather data')

  const data = await res.json()

  const cityName = await reverseGeocode(latitude, longitude)

  const daily: DailyForecast[] = data.daily.time.map((date: string, i: number) => {
    const d = new Date(date + 'T00:00:00')
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const code = data.daily.weather_code[i]
    return {
      date,
      dayName: dayNames[d.getDay()],
      weatherCode: code,
      emoji: getWeatherEmoji(code),
      tempHigh: Math.round(data.daily.temperature_2m_max[i]),
      tempLow: Math.round(data.daily.temperature_2m_min[i]),
      precipitationProbability: data.daily.precipitation_probability_max?.[i] ?? 0,
      sunrise: data.daily.sunrise?.[i] ?? '',
      sunset: data.daily.sunset?.[i] ?? '',
    }
  })

  const currentCode = data.current.weather_code

  return {
    current: {
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      weatherCode: currentCode,
      description: getWeatherDescription(currentCode),
      emoji: getWeatherEmoji(currentCode),
      windSpeed: Math.round(data.current.wind_speed_10m ?? 0),
      humidity: Math.round(data.current.relative_humidity_2m ?? 0),
      uvIndex: Math.round(data.current.uv_index ?? 0),
    },
    daily,
    location: {
      latitude,
      longitude,
      cityName,
    },
  }
}
