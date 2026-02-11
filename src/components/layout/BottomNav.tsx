import { NavLink } from 'react-router-dom'
import { Home, History, Calendar, Users } from 'lucide-react'
import { motion } from 'motion/react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/history', icon: History, label: 'Review' },
]

export function BottomNav() {
  return (
    <nav className="flex-shrink-0 z-50 pb-safe">
      <div className="mx-3 mb-3">
        <div className="frosted-glass rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-around h-16 px-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `
                  relative flex flex-col items-center justify-center gap-1
                  min-w-14 px-2 py-1.5
                  transition-colors duration-150
                  ${isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)]'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <div className="relative flex items-center justify-center w-10 h-7">
                      {isActive && (
                        <motion.div
                          layoutId="nav-active-pill"
                          className="absolute inset-0 bg-[var(--color-primary)]/12 rounded-full"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon
                        className="relative w-[18px] h-[18px]"
                        strokeWidth={isActive ? 2.5 : 1.8}
                      />
                    </div>
                    <span className={`relative text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
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
