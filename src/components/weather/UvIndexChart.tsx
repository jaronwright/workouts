import { useMemo } from 'react'
import { motion } from 'motion/react'
import { Sun } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getUvLabel, getUvColor } from '@/services/weatherService'
import type { HourlyUvEntry } from '@/services/weatherService'

interface UvIndexChartProps {
  data: HourlyUvEntry[]
  sunrise?: string
  sunset?: string
}

const CHART_W = 300
const CHART_H = 70
const PADDING_TOP = 4
const PADDING_BOTTOM = 2

// Build a smooth SVG path using midpoint bezier curves
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  let d = `M ${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const mx = (p0.x + p1.x) / 2
    const my = (p0.y + p1.y) / 2
    d += ` Q ${p0.x},${p0.y} ${mx},${my}`
  }
  // End at the last point
  const last = points[points.length - 1]
  d += ` T ${last.x},${last.y}`
  return d
}

function getHourFromIso(iso: string): number {
  return new Date(iso).getHours()
}

export function UvIndexChart({ data, sunrise, sunset }: UvIndexChartProps) {
  const prefersReduced = useReducedMotion()

  const { points, linePath, areaPath, maxUv, currentHour, nowX, nowY, sunriseHour, sunsetHour, lastIdx } = useMemo(() => {
    const now = new Date()
    const currentHour = now.getHours()
    const maxUv = Math.max(3, ...data.map(d => d.uvIndex)) // min 3 so low UV days still show
    const usableH = CHART_H - PADDING_TOP - PADDING_BOTTOM

    const lastIdx = Math.max(1, data.length - 1)
    const pts = data.map((entry, i) => ({
      x: (i / lastIdx) * CHART_W,
      y: PADDING_TOP + usableH - (entry.uvIndex / maxUv) * usableH,
    }))

    const line = buildSmoothPath(pts)
    // Area: same path but close to bottom
    const area = pts.length > 0
      ? `${line} L ${pts[pts.length - 1].x},${CHART_H} L ${pts[0].x},${CHART_H} Z`
      : ''

    // "Now" indicator position (interpolate between hours)
    const fraction = currentHour + now.getMinutes() / 60
    const nx = (fraction / lastIdx) * CHART_W
    // Interpolate Y between current and next hour
    const floorH = Math.min(Math.floor(fraction), lastIdx)
    const ceilH = Math.min(lastIdx, floorH + 1)
    const t = fraction - Math.floor(fraction)
    const ny = pts.length > 0
      ? pts[floorH].y + (pts[ceilH].y - pts[floorH].y) * t
      : CHART_H / 2

    const srH = sunrise ? getHourFromIso(sunrise) : 6
    const ssH = sunset ? getHourFromIso(sunset) : 18

    return { points: pts, linePath: line, areaPath: area, maxUv, currentHour, nowX: nx, nowY: ny, sunriseHour: srH, sunsetHour: ssH, lastIdx }
  }, [data, sunrise, sunset])

  const currentUv = data[Math.min(currentHour, data.length - 1)]?.uvIndex ?? 0
  const currentUvRounded = Math.round(currentUv)

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">UV Index</span>
        </div>
        <span className="text-xs font-medium" style={{ color: getUvColor(currentUvRounded) }}>
          Now: {currentUvRounded} · {getUvLabel(currentUvRounded)}
        </span>
      </div>

      {/* Chart */}
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H + 14}`}
        className="w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`UV index chart showing hourly values, currently ${currentUvRounded} (${getUvLabel(currentUvRounded)})`}
      >
        <defs>
          {/* Vertical gradient for area fill */}
          <linearGradient id="uvAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.35" />
            <stop offset="40%" stopColor="#F97316" stopOpacity="0.25" />
            <stop offset="65%" stopColor="#EAB308" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0.08" />
          </linearGradient>
          {/* Now indicator dashed line */}
          <pattern id="uvDash" patternUnits="userSpaceOnUse" width="4" height="4">
            <line x1="0" y1="0" x2="0" y2="4" stroke="var(--color-text-muted)" strokeWidth="0.8" strokeOpacity="0.5" />
          </pattern>
        </defs>

        {/* Night shading (before sunrise / after sunset) */}
        {sunriseHour > 0 && (
          <rect
            x={0}
            y={0}
            width={(sunriseHour / lastIdx) * CHART_W}
            height={CHART_H}
            fill="var(--color-text)"
            opacity={0.06}
            rx={2}
          />
        )}
        {sunsetHour < lastIdx && (
          <rect
            x={(sunsetHour / lastIdx) * CHART_W}
            y={0}
            width={((lastIdx - sunsetHour) / lastIdx) * CHART_W}
            height={CHART_H}
            fill="var(--color-text)"
            opacity={0.06}
            rx={2}
          />
        )}

        {/* Area fill */}
        {prefersReduced ? (
          <path d={areaPath} fill="url(#uvAreaGrad)" />
        ) : (
          <motion.path
            d={areaPath}
            fill="url(#uvAreaGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
        )}

        {/* Line stroke */}
        {prefersReduced ? (
          <path d={linePath} fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
        ) : (
          <motion.path
            d={linePath}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        )}

        {/* "Now" vertical dashed line */}
        <line
          x1={nowX}
          y1={0}
          x2={nowX}
          y2={CHART_H}
          stroke="var(--color-text-muted)"
          strokeWidth="0.8"
          strokeDasharray="2 2"
          strokeOpacity="0.4"
        />

        {/* "Now" dot */}
        {prefersReduced ? (
          <circle cx={nowX} cy={nowY} r={3.5} fill={getUvColor(currentUvRounded)} stroke="white" strokeWidth="1.5" />
        ) : (
          <motion.circle
            cx={nowX}
            cy={nowY}
            r={3.5}
            fill={getUvColor(currentUvRounded)}
            stroke="white"
            strokeWidth="1.5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 20 }}
          />
        )}

        {/* Time labels */}
        <text x={(6 / lastIdx) * CHART_W} y={CHART_H + 11} textAnchor="middle" className="fill-[var(--color-text-muted)]" fontSize="8" fontWeight="500">
          6AM
        </text>
        <text x={(12 / lastIdx) * CHART_W} y={CHART_H + 11} textAnchor="middle" className="fill-[var(--color-text-muted)]" fontSize="8" fontWeight="500">
          12PM
        </text>
        <text x={(18 / lastIdx) * CHART_W} y={CHART_H + 11} textAnchor="middle" className="fill-[var(--color-text-muted)]" fontSize="8" fontWeight="500">
          6PM
        </text>
      </svg>
    </div>
  )
}
