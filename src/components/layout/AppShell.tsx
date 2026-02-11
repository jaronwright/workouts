import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { VerificationBanner } from '@/components/auth/VerificationBanner'
import { OfflineBanner } from './OfflineBanner'
import { Avatar } from '@/components/ui'
import { useAvatarUrl } from '@/hooks/useAvatar'

interface AppShellProps {
  children: ReactNode
  title: string
  showBack?: boolean
  showLogout?: boolean
  hideNav?: boolean
  headerAction?: ReactNode
}

function ProfileHeaderAction() {
  const navigate = useNavigate()
  const avatarUrl = useAvatarUrl()

  return (
    <button
      onClick={() => navigate('/profile')}
      className="rounded-full active:opacity-70 transition-opacity"
      aria-label="Profile"
    >
      <Avatar src={avatarUrl} size="sm" alt="Profile" />
    </button>
  )
}

export function AppShell({
  children,
  title,
  showBack = false,
  showLogout = false,
  hideNav = false,
  headerAction
}: AppShellProps) {
  // Tab pages (with bottom nav) get the profile avatar button by default
  const resolvedAction = headerAction ?? (!hideNav ? <ProfileHeaderAction /> : undefined)

  return (
    <div className="h-[100dvh] flex flex-col bg-[var(--color-background)]">
      <VerificationBanner />
      <OfflineBanner />
      <Header title={title} showBack={showBack} showLogout={showLogout} headerAction={resolvedAction} />
      <main className="flex-1 overflow-y-auto overscroll-contain pb-6">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
