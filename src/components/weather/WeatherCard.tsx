import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MapPin, ArrowClockwise, CaretDown, Wind, Drop, Sun, CloudRain } from '@phosphor-icons/react'
import { Card, CardContent, Button } from '@/components/ui'
import { useWeather } from '@/hooks/useWeather'
import { useWeatherStore } from '@/stores/weatherStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import {
  celsiusToFahrenheit,
  getWeatherGradient,
  kmhToMph,
  getUvLabel,
  formatSunTime,
} from '@/services/weatherService'
import { UvIndexChart } from './UvIndexChart'

function formatTemp(tempC: number, unit: 'C' | 'F'): string {
  return unit === 'C' ? `${tempC}°` : `${celsiusToFahrenheit(tempC)}°`
}

function WeatherDetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-[var(--color-text-muted)]">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">{label}</p>
        <p className="text-xs font-medium text-[var(--color-text)]">{value}</p>
      </div>
    </div>
  )
}

function WeatherSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="py-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-hover)] animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-20 rounded bg-[var(--color-surface-hover)] animate-pulse" />
            <div className="h-4 w-32 rounded bg-[var(--color-surface-hover)] animate-pulse" />
          </div>
          <div className="space-y-2 text-right">
            <div className="h-4 w-16 rounded bg-[var(--color-surface-hover)] animate-pulse ml-auto" />
            <div className="h-3 w-20 rounded bg-[var(--color-surface-hover)] animate-pulse ml-auto" />
          </div>
        </div>
        <div className="border-t border-[var(--color-border)] pt-3">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="h-3 w-6 rounded bg-[var(--color-surface-hover)] animate-pulse" />
                <div className="h-5 w-5 rounded bg-[var(--color-surface-hover)] animate-pulse" />
                <div className="h-3 w-6 rounded bg-[var(--color-surface-hover)] animate-pulse" />
                <div className="h-3 w-6 rounded bg-[var(--color-surface-hover)] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function WeatherCard() {
  const { weather, isLoading, isLocating, error, retry } = useWeather()
  const { temperatureUnit, toggleTemperatureUnit, cachedCityName } = useWeatherStore()
  const prefersReduced = useReducedMotion()
  const [isExpanded, setIsExpanded] = useState(false)

  // Loading state
  if (isLocating || isLoading) {
    return (
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <WeatherSkeleton />
      </motion.div>
    )
  }

  // Permission denied state
  if (error === 'permission_denied') {
    return (
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Card variant="outlined">
          <CardContent className="py-4 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
            <p className="text-sm text-[var(--color-text-muted)] flex-1">
              Enable location to see weather
            </p>
            <Button size="sm" variant="secondary" onClick={retry}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Network/position error state
  if (error && !weather) {
    return (
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Card variant="outlined">
          <CardContent className="py-4 flex items-center gap-3">
            <ArrowClockwise className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
            <p className="text-sm text-[var(--color-text-muted)] flex-1">
              {error === 'position_unavailable' ? 'Unable to get location' : 'Weather unavailable'}
            </p>
            <Button size="sm" variant="secondary" onClick={retry}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // No data and no cache — return nothing (fresh install, no permission prompt yet)
  if (!weather) return null

  const { current, daily, location } = weather
  const gradient = getWeatherGradient(current.weatherCode)
  const displayCity = location.cityName !== 'Unknown' ? location.cityName : cachedCityName || ''
  const today = daily[0]
  const windDisplay = temperatureUnit === 'F'
    ? `${kmhToMph(current.windSpeed)} mph`
    : `${current.windSpeed} km/h`
  const reducedTransition = prefersReduced ? { duration: 0 } : undefined

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card className="overflow-hidden cursor-pointer" onClick={() => setIsExpanded(prev => !prev)}>
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} pointer-events-none`} />

        <CardContent className="py-3 relative">
          {/* Condensed current conditions — one line */}
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{current.emoji}</span>
            <button
              onClick={(e) => { e.stopPropagation(); toggleTemperatureUnit() }}
              className="text-sm font-bold text-[var(--color-text)] active:opacity-70 transition-opacity"
              title={`Switch to °${temperatureUnit === 'C' ? 'F' : 'C'}`}
            >
              {formatTemp(current.temperature, temperatureUnit)}
            </button>
            <span className="text-xs text-[var(--color-text-muted)]">{current.description}</span>
            <span className="text-xs text-[var(--color-text-muted)]">·</span>
            <span className="text-xs text-[var(--color-text-muted)]">
              Feels {formatTemp(current.feelsLike, temperatureUnit)}
            </span>
            {displayCity && (
              <>
                <span className="text-xs text-[var(--color-text-muted)]">·</span>
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {displayCity}
                </span>
              </>
            )}
          </div>

          {/* Rolling 7-day forecast starting from today (matches schedule widget) */}
          {(() => {
            const todayDow = new Date().getDay() // 0=Sun
            const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
            return (
              <div className="mt-3">
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }, (_, i) => {
                    const dow = (todayDow + i) % 7
                    const forecast = daily[i]
                    const isToday = i === 0
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-medium uppercase tracking-wide ${isToday ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>
                          {isToday ? 'Now' : DAY_LABELS[dow]}
                        </span>
                        {forecast ? (
                          <>
                            <span className="text-base leading-none">{forecast.emoji}</span>
                            <span className="text-xs font-semibold text-[var(--color-text)]">
                              {formatTemp(forecast.tempHigh, temperatureUnit)}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-muted)]">
                              {formatTemp(forecast.tempLow, temperatureUnit)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-base leading-none">—</span>
                            <span className="text-xs font-semibold text-[var(--color-text-muted)]">—</span>
                            <span className="text-[10px] text-[var(--color-text-muted)]">—</span>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* Expand indicator */}
          <div className="flex justify-center mt-2">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={reducedTransition ?? { type: 'spring', stiffness: 300, damping: 25 }}
            >
              <CaretDown className="w-4 h-4 text-[var(--color-text-muted)]" />
            </motion.div>
          </div>

          {/* Expandable details (wind, humidity, etc.) */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={reducedTransition ?? { type: 'spring', stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="border-t border-[var(--color-border)] mt-2 pt-3 grid grid-cols-2 gap-3">
                  <WeatherDetailItem
                    icon={<Wind className="w-4 h-4" />}
                    label="Wind"
                    value={windDisplay}
                  />
                  <WeatherDetailItem
                    icon={<Drop className="w-4 h-4" />}
                    label="Humidity"
                    value={`${current.humidity}%`}
                  />
                  <WeatherDetailItem
                    icon={<CloudRain className="w-4 h-4" />}
                    label="Rain Chance"
                    value={`${today?.precipitationProbability ?? 0}%`}
                  />
                  <WeatherDetailItem
                    icon={<Sun className="w-4 h-4" />}
                    label="Sun Times"
                    value={today?.sunrise && today?.sunset
                      ? `${formatSunTime(today.sunrise)}  ${formatSunTime(today.sunset)}`
                      : '--'}
                  />
                  {/* UV Index Chart (full width) */}
                  <div className="col-span-2 pt-1">
                    {weather.hourly?.uvIndex ? (
                      <UvIndexChart
                        data={weather.hourly.uvIndex}
                        sunrise={today?.sunrise}
                        sunset={today?.sunset}
                      />
                    ) : (
                      <WeatherDetailItem
                        icon={<Sun className="w-4 h-4" />}
                        label="UV Index"
                        value={`${current.uvIndex} · ${getUvLabel(current.uvIndex)}`}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
