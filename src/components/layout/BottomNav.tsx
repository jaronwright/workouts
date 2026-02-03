import { NavLink } from 'react-router-dom'
import { Home, History, User, Calendar } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/profile', icon: User, label: 'Profile' }
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-3 mb-3">
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[var(--color-border)]">
          <div className="flex items-center justify-around h-16 px-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `
                  relative flex flex-col items-center justify-center gap-0.5
                  w-16 py-2 rounded-[var(--radius-lg)]
                  transition-colors duration-100
                  active:scale-95
                  ${isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)]'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute inset-1 bg-[var(--color-primary)]/10 rounded-[var(--radius-md)]" />
                    )}
                    <Icon
                      className="relative w-5 h-5"
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={`relative text-[10px] tracking-wide ${
                      isActive ? 'font-semibold' : 'font-medium'
                    }`}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
