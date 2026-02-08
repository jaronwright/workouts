import { User } from 'lucide-react'
import { isDefaultAvatar, getDefaultAvatarKey, getDefaultAvatarByKey } from '@/config/defaultAvatars'

const SIZES = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { container: 'w-16 h-16', icon: 'w-8 h-8' },
} as const

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ src, alt = 'Avatar', size = 'md', className = '' }: AvatarProps) {
  const { container, icon } = SIZES[size]

  if (src && isDefaultAvatar(src)) {
    const avatar = getDefaultAvatarByKey(getDefaultAvatarKey(src))
    if (avatar) {
      return (
        <div
          className={`${container} bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center ${className}`}
        >
          <svg
            viewBox={avatar.viewBox}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${icon} text-[var(--color-primary)]`}
          >
            <path d={avatar.svgPath} />
          </svg>
        </div>
      )
    }
  }

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${container} rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`${container} bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center ${className}`}
    >
      <User className={`${icon} text-[var(--color-primary)]`} />
    </div>
  )
}
