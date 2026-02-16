import { useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BatteryMedium, BatteryHigh, Lightning } from '@phosphor-icons/react'
import { ENERGY_LABELS, ENERGY_COLORS } from '@/config/reviewConfig'

interface EnergyLevelProps {
  value: number | null
  onChange: (level: number) => void
}

const LEVELS = [1, 2, 3, 4, 5] as const
const SPARK_COUNT = 8

// Interpolate between two hex colors
function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.replace('#', ''), 16)
  const bh = parseInt(b.replace('#', ''), 16)
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff
  const rr = Math.round(ar + (br - ar) * t)
  const rg = Math.round(ag + (bg - ag) * t)
  const rb = Math.round(ab + (bb - ab) * t)
  return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, '0')}`
}

function getGradientColor(fraction: number): string {
  const stops = [
    { at: 0, color: ENERGY_COLORS[1] },
    { at: 0.25, color: ENERGY_COLORS[2] },
    { at: 0.5, color: ENERGY_COLORS[3] },
    { at: 0.75, color: ENERGY_COLORS[4] },
    { at: 1, color: ENERGY_COLORS[5] },
  ]
  for (let i = 0; i < stops.length - 1; i++) {
    if (fraction <= stops[i + 1].at) {
      const local = (fraction - stops[i].at) / (stops[i + 1].at - stops[i].at)
      return lerpColor(stops[i].color, stops[i + 1].color, local)
    }
  }
  return stops[stops.length - 1].color
}

// Generate spark particle positions (evenly spaced with jitter)
function generateSparks() {
  return Array.from({ length: SPARK_COUNT }, (_, i) => {
    const baseAngle = (i / SPARK_COUNT) * Math.PI * 2
    const jitter = (Math.random() - 0.5) * 0.4
    const angle = baseAngle + jitter
    const distance = 20 + Math.random() * 15 // 20-35px
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      delay: Math.random() * 0.05,
    }
  })
}

export function EnergyLevel({ value, onChange }: EnergyLevelProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const prevValueRef = useRef<number | null>(null)
  const label = value ? ENERGY_LABELS[value] : null
  const color = value ? ENERGY_COLORS[value] : null

  // Fraction for fill width (0-1)
  const fraction = value ? (value - 1) / 4 : 0

  // Build a CSS gradient string for the filled portion
  const fillGradient = value
    ? `linear-gradient(to right, ${ENERGY_COLORS[1]}, ${value >= 2 ? ENERGY_COLORS[2] : ENERGY_COLORS[1]}${value >= 3 ? `, ${ENERGY_COLORS[3]}` : ''}${value >= 4 ? `, ${ENERGY_COLORS[4]}` : ''}${value >= 5 ? `, ${ENERGY_COLORS[5]}` : ''})`
    : 'transparent'

  const handleChange = (level: number) => {
    prevValueRef.current = value
    onChange(level)
    // E. Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(level >= 4 ? [30, 20, 30] : 15)
    }
  }

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, x / rect.width))
    const level = Math.round(pct * 4) + 1
    handleChange(Math.max(1, Math.min(5, level)))
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <motion.div
          animate={value ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
          key={value}
        >
          {value && value >= 4 ? (
            <BatteryHigh className="w-4 h-4" style={{ color: color || undefined }} />
          ) : (
            <BatteryMedium className="w-4 h-4 text-[var(--color-text-muted)]" />
          )}
        </motion.div>
        <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
          Energy Level
        </span>
      </div>

      {/* Slider track */}
      <div className="w-full max-w-xs px-1">
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative h-10 flex items-center cursor-pointer group"
          role="slider"
          aria-valuemin={1}
          aria-valuemax={5}
          aria-valuenow={value ?? undefined}
          aria-label="Energy level"
          tabIndex={0}
          onKeyDown={(e) => {
            if (!value) {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') handleChange(1)
              return
            }
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
              handleChange(Math.min(5, value + 1))
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
              handleChange(Math.max(1, value - 1))
            }
          }}
        >
          {/* Track background */}
          <div className="absolute inset-x-0 h-2.5 rounded-full bg-[var(--color-border)] overflow-hidden">
            {/* Animated fill with D. Track Glow */}
            <motion.div
              className="h-full rounded-full"
              initial={false}
              animate={{
                width: value ? `${fraction * 100}%` : '0%',
                boxShadow: value && color ? `0 0 8px 2px ${color}30` : '0 0 0px 0px transparent',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{
                background: fillGradient,
                minWidth: value ? '10%' : 0,
              }}
            />
          </div>

          {/* B. Tick marks with staggered color wave */}
          {LEVELS.map((level) => {
            const pos = ((level - 1) / 4) * 100
            const isActive = value !== null && level <= value
            // Stagger delay based on distance from selected level
            const staggerDelay = value ? Math.abs(level - value) * 0.05 : 0
            return (
              <motion.button
                key={level}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleChange(level)
                }}
                className="absolute -translate-x-1/2 z-10"
                style={{ left: `${pos}%` }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  className="w-4 h-4 rounded-full border-2"
                  initial={false}
                  animate={{
                    backgroundColor: isActive
                      ? ENERGY_COLORS[level]
                      : 'var(--color-surface)',
                    borderColor: isActive
                      ? ENERGY_COLORS[level]
                      : 'var(--color-border)',
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                    delay: staggerDelay,
                  }}
                />
              </motion.button>
            )
          })}

          {/* Animated thumb */}
          <AnimatePresence>
            {value && (
              <motion.div
                className="absolute -translate-x-1/2 z-20 pointer-events-none"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  left: `${fraction * 100}%`,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              >
                {/* Glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: `0 0 12px 4px ${color}40`,
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                />
                {/* Thumb */}
                <motion.div
                  className="w-6 h-6 rounded-full border-[3px] border-white dark:border-[var(--color-surface)] shadow-lg"
                  animate={{
                    backgroundColor: color || '#888',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
                {/* Pulse ring on change */}
                <motion.div
                  key={value}
                  className="absolute inset-[-4px] rounded-full"
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ border: `2px solid ${color}` }}
                />

                {/* A. Spark particles on level change */}
                <div key={`sparks-${value}`} className="absolute inset-0 flex items-center justify-center">
                  {generateSparks().map((spark, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: color || '#888' }}
                      initial={{ x: 0, y: 0, scale: 1, opacity: 0.8 }}
                      animate={{ x: spark.x, y: spark.y, scale: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut', delay: spark.delay }}
                    />
                  ))}
                </div>

                {/* C. Lightning bolt flash at high energy (4-5) */}
                {value >= 4 && (
                  <motion.div
                    key={`zap-${value}`}
                    className="absolute -top-5 left-1/2 -translate-x-1/2 pointer-events-none"
                    initial={{ scale: 0, opacity: 1, rotate: -15 }}
                    animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0], rotate: [-15, 0, 15] }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <Lightning className="w-4 h-4" style={{ color: color || undefined, fill: color || undefined }} />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Labels row */}
        <div className="flex justify-between mt-2">
          {LEVELS.map((level) => {
            const isActive = value !== null && level <= value
            const isSelected = value === level
            return (
              <motion.button
                key={level}
                type="button"
                onClick={() => handleChange(level)}
                className="text-[10px] font-medium transition-colors px-0.5"
                style={{
                  color: isSelected
                    ? ENERGY_COLORS[level]
                    : isActive
                      ? `${ENERGY_COLORS[level]}99`
                      : 'var(--color-text-muted)',
                }}
                animate={isSelected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {ENERGY_LABELS[level]}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Current value label */}
      <AnimatePresence mode="wait">
        {label && (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex items-center gap-1.5"
          >
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color || undefined }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: color || undefined }}
            >
              {label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
