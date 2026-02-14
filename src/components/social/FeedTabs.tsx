import { motion } from 'motion/react'
import type { FeedMode } from '@/types/community'

interface FeedTabsProps {
  activeTab: FeedMode
  onTabChange: (tab: FeedMode) => void
  followingCount?: number
}

const TABS: { key: FeedMode; label: string }[] = [
  { key: 'following', label: 'Following' },
  { key: 'discover', label: 'Discover' },
]

export function FeedTabs({ activeTab, onTabChange, followingCount }: FeedTabsProps) {
  return (
    <div className="flex gap-1 p-1 rounded-[var(--radius-lg)] bg-[var(--color-surface-hover)]">
      {TABS.map(tab => {
        const isActive = activeTab === tab.key
        // If user follows nobody, disable the Following tab
        const isDisabled = tab.key === 'following' && followingCount === 0

        return (
          <button
            key={tab.key}
            onClick={() => !isDisabled && onTabChange(tab.key)}
            disabled={isDisabled}
            className={`
              relative flex-1 px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors
              ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              ${isActive ? 'text-[var(--color-primary-text)]' : 'text-[var(--color-text-muted)]'}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="feedTabIndicator"
                className="absolute inset-0 rounded-[var(--radius-md)] bg-[var(--color-primary)]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
