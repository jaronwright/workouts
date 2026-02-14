import { useSpring, motion, useReducedMotion } from 'motion/react'

interface ProgressRingProps {
  /** Progress value from 0 to 1 */
  progress: number
  /** Diameter in pixels (default 48) */
  size?: number
  /** Stroke width in pixels (default 3) */
  strokeWidth?: number
  /** Stroke color for the filled portion */
  color?: string
  /** Stroke color for the unfilled track */
  trackColor?: string
  className?: string
}

export function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 3,
  color = 'var(--color-primary)',
  trackColor = 'var(--color-border)',
  className,
}: ProgressRingProps) {
  const prefersReduced = useReducedMotion()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, progress))

  const springOffset = useSpring(circumference * (1 - clamped), {
    stiffness: 300,
    damping: 30,
  })

  const staticOffset = circumference * (1 - clamped)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* Animated progress arc */}
      {prefersReduced ? (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={staticOffset}
          strokeLinecap="round"
        />
      ) : (
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: springOffset }}
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}
