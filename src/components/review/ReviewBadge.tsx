import { Star } from '@phosphor-icons/react'
import { RATING_COLORS } from '@/config/reviewConfig'

interface ReviewBadgeProps {
  rating: number
  size?: 'sm' | 'md'
}

const sizeMap = {
  sm: { icon: 'w-3 h-3', text: 'text-[10px]', gap: 'gap-0.5', padding: 'px-1 py-0.5' },
  md: { icon: 'w-3.5 h-3.5', text: 'text-xs', gap: 'gap-0.5', padding: 'px-1.5 py-0.5' },
}

export function ReviewBadge({ rating, size = 'sm' }: ReviewBadgeProps) {
  const roundedRating = Math.round(rating)
  const color = RATING_COLORS[roundedRating] || RATING_COLORS[3]
  const s = sizeMap[size]

  return (
    <span
      className={`inline-flex items-center ${s.gap} ${s.padding} rounded-full font-semibold ${s.text}`}
      style={{
        color,
        backgroundColor: `${color}15`,
      }}
    >
      <Star className={`${s.icon} fill-current`} />
      {rating % 1 === 0 ? rating : rating.toFixed(1)}
    </span>
  )
}
