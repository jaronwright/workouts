import type { ReactNode } from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { VerificationBanner } from '@/components/auth/VerificationBanner'

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
    <div className="min-h-screen bg-[var(--color-background)]">
      <VerificationBanner />
      <Header title={title} showBack={showBack} showLogout={showLogout} headerAction={headerAction} />
      <main className={`${hideNav ? 'pb-6' : 'pb-28'}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
