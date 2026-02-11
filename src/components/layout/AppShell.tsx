import type { ReactNode } from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { VerificationBanner } from '@/components/auth/VerificationBanner'
import { OfflineBanner } from './OfflineBanner'

interface AppShellProps {
  children: ReactNode
  title: string
  showBack?: boolean
  showLogout?: boolean
  hideNav?: boolean
  headerAction?: ReactNode
}

export function AppShell({
  children,
  title,
  showBack = false,
  showLogout = false,
  hideNav = false,
  headerAction
}: AppShellProps) {
  return (
    <div className="h-[100dvh] flex flex-col bg-[var(--color-background)]">
      <VerificationBanner />
      <OfflineBanner />
      <Header title={title} showBack={showBack} showLogout={showLogout} headerAction={headerAction} />
      <main className="flex-1 overflow-y-auto overscroll-contain pb-6">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
