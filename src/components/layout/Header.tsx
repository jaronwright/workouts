import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretLeft, SignOut } from '@phosphor-icons/react'
import { useAuthStore } from '@/stores/authStore'
import { PressableButton } from '@/components/motion'

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
    <header className="flex-shrink-0 z-40 glass">
      <div className="flex items-center justify-between h-16 px-[var(--space-4)]">
        <div className="flex items-center gap-[var(--space-2)]">
          {showBack && (
            <PressableButton
              onClick={() => navigate(-1)}
              className="
                w-9 h-9 flex items-center justify-center
                text-[var(--color-text-muted)]
                rounded-[var(--radius-md)]
                hover:bg-[var(--color-surface-hover)]
                transition-colors duration-150
              "
            >
              <CaretLeft className="w-6 h-6" />
            </PressableButton>
          )}
          <h1 className="text-[var(--text-lg)] font-bold tracking-[var(--tracking-tight)] text-[var(--color-text)]">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-[var(--space-1)]">
          {showLogout && (
            <PressableButton
              onClick={handleLogout}
              className="
                w-9 h-9 flex items-center justify-center
                text-[var(--color-text-muted)]
                rounded-[var(--radius-md)]
                hover:bg-[var(--color-danger-muted)] hover:text-[var(--color-danger)]
                transition-colors duration-150
              "
            >
              <SignOut className="w-5 h-5" />
            </PressableButton>
          )}
          {headerAction}
        </div>
      </div>
    </header>
  )
}
