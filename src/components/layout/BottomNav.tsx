import { NavLink } from 'react-router-dom'
import { Home, History, User, Calendar, Users } from 'lucide-react'
import { motion } from 'motion/react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/profile', icon: User, label: 'Profile' }
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-3 mb-3">
        <div className="frosted-glass rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.06)]">
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
                  ${isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)]'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-indicator"
                        className="absolute inset-1 bg-[var(--color-primary)]/10 rounded-[var(--radius-md)]"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon
                      className="relative w-5 h-5"
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {isActive ? (
                      <motion.span
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        className="relative text-[10px] tracking-wide font-semibold"
                      >
                        {label}
                      </motion.span>
                    ) : (
                      <span className="relative text-[10px] tracking-wide font-medium">
                        {label}
                      </span>
                    )}
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
