interface ShimmerSkeletonProps {
  width?: string | number
  height?: string | number
  /** Border radius preset (default 'md') */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

const radiusMap = {
  none: 'var(--radius-none)',
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  full: 'var(--radius-full)',
} as const

export function ShimmerSkeleton({
  width,
  height,
  rounded = 'md',
  className = '',
}: ShimmerSkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: radiusMap[rounded],
      }}
    />
  )
}
