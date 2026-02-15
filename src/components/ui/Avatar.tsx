import { useState, useMemo } from 'react'
import { User } from 'lucide-react'
import { isDefaultAvatar, getDefaultAvatarKey, getDefaultAvatarByKey } from '@/config/defaultAvatars'
import { getAvatarPublicUrl } from '@/services/avatarService'

const SIZES = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { container: 'w-16 h-16', icon: 'w-8 h-8' },
} as const

/**
 * Resolve an avatar_url value to a displayable URL.
 * - `default:bear` → returned as-is (handled by SVG branch)
 * - `userId/avatar-123.webp` (storage path) → resolved to full Supabase CDN URL
 * - `https://...` (already a full URL) → returned as-is
 */
function resolveAvatarSrc(src: string): string {
  if (isDefaultAvatar(src)) return src
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  return getAvatarPublicUrl(src)
}

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ src, alt = 'Avatar', size = 'md', className = '' }: AvatarProps) {
  const { container, icon } = SIZES[size]
  const [imgError, setImgError] = useState(false)

  const resolvedSrc = useMemo(() => (src ? resolveAvatarSrc(src) : null), [src])

  if (resolvedSrc && !imgError && isDefaultAvatar(resolvedSrc)) {
    const avatar = getDefaultAvatarByKey(getDefaultAvatarKey(resolvedSrc))
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

  if (resolvedSrc && !imgError) {
    return (
      <img
        src={resolvedSrc}
        alt={alt}
        className={`${container} rounded-full object-cover ${className}`}
        onError={() => setImgError(true)}
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
