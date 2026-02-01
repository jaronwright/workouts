import type { ReactNode } from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: ReactNode
  title: string
  showBack?: boolean
  showLogout?: boolean
  hideNav?: boolean
}

export function AppShell({
  children,
  title,
  showBack = false,
  showLogout = false,
  hideNav = false
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={title} showBack={showBack} showLogout={showLogout} />
      <main className={`${hideNav ? 'pb-4' : 'pb-20'}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
