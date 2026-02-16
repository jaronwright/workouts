import { NavLink } from 'react-router-dom'
import { House, ClockCounterClockwise, Calendar, Users } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useUnreadNotificationCount } from '@/hooks/useCommunityNotifications'
import { springPresets } from '@/config/animationConfig'

const navItems = [
  { to: '/', icon: House, label: 'Home' },
  { to: '/community', icon: Users, label: 'Community', showBadge: true },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/history', icon: ClockCounterClockwise, label: 'Review' },
]

export function BottomNav() {
  const { data: unreadCount } = useUnreadNotificationCount()

  return (
    <nav className="flex-shrink-0 z-50 pb-safe">
      <div className="mx-[var(--space-3)] mb-[var(--space-3)]">
        <div
          className="rounded-[var(--radius-xl)] border border-[var(--glass-border)]"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div className="flex items-center justify-around h-16 px-1">
            {navItems.map(({ to, icon: Icon, label, showBadge }) => (
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
                          className="absolute inset-0 rounded-full"
                          style={{ background: 'var(--color-primary-muted)' }}
                          transition={springPresets.snappy}
                        />
                      )}
                      <motion.div
                        whileTap={{ scale: 0.9 }}
                        transition={springPresets.snappy}
                        className="relative"
                      >
                        <Icon
                          className="relative w-[18px] h-[18px]"
                          weight={isActive ? 'fill' : 'regular'}
                        />
                      </motion.div>
                      {showBadge && (unreadCount ?? 0) > 0 && !isActive && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />
                      )}
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
