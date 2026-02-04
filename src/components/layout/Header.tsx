import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

interface HeaderProps {
  title: string
  showBack?: boolean
  showLogout?: boolean
  headerAction?: ReactNode
}

export function Header({ title, showBack = false, showLogout = false, headerAction }: HeaderProps) {
  const navigate = useNavigate()
  const signOut = useAuthStore((s) => s.signOut)

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-surface)]/95 border-b border-[var(--color-border)]">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="
                w-9 h-9 flex items-center justify-center
                text-[var(--color-text-muted)]
                rounded-[var(--radius-md)]
                active:scale-95 active:bg-[var(--color-surface-hover)]
                transition-transform duration-100
              "
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-lg font-bold tracking-tight text-[var(--color-text)]">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          {showLogout && (
            <button
              onClick={handleLogout}
              className="
                w-9 h-9 flex items-center justify-center
                text-[var(--color-text-muted)]
                rounded-[var(--radius-md)]
                active:scale-95 active:bg-[var(--color-danger)]/10 active:text-[var(--color-danger)]
                transition-transform duration-100
              "
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
          {headerAction}
        </div>
      </div>
    </header>
  )
}
