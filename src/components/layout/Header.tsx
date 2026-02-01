import { useNavigate } from 'react-router-dom'
import { ChevronLeft, LogOut, Sun, Moon, Monitor } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/hooks/useTheme'

interface HeaderProps {
  title: string
  showBack?: boolean
  showLogout?: boolean
}

export function Header({ title, showBack = false, showLogout = false }: HeaderProps) {
  const navigate = useNavigate()
  const signOut = useAuthStore((s) => s.signOut)
  const { theme, toggleTheme } = useTheme()

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
  }

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

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
          <button
            onClick={toggleTheme}
            className="
              w-9 h-9 flex items-center justify-center
              text-[var(--color-text-muted)]
              rounded-[var(--radius-md)]
              active:scale-95 active:bg-[var(--color-surface-hover)]
              transition-transform duration-100
            "
            title={`Theme: ${theme}`}
          >
            <ThemeIcon className="w-5 h-5" />
          </button>
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
        </div>
      </div>
    </header>
  )
}
