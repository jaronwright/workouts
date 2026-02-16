import { motion } from 'motion/react'
import { springPresets } from '@/config/animationConfig'

export interface SegmentedTab {
  key: string
  label: string
}

interface SegmentedControlProps {
  tabs: SegmentedTab[]
  activeTab: string
  onTabChange: (key: string) => void
  /** Keys of tabs that should be disabled */
  disabledKeys?: string[]
  /** Unique layout ID prefix — avoids conflicts when multiple controls exist on screen */
  id?: string
}

export function SegmentedControl({
  tabs,
  activeTab,
  onTabChange,
  disabledKeys = [],
  id = 'segmented',
}: SegmentedControlProps) {
  const activeIndex = tabs.findIndex(t => t.key === activeTab)
  const count = tabs.length
  // Width of each segment as a fraction, minus gap allowance (4px on each side)
  // The pill is positioned absolutely inside the container's 4px padding
  const pillWidth = `calc(${100 / count}% - ${4 * (count - 1) / count}px)`

  return (
    <div
      className="relative flex p-1 rounded-full bg-[var(--color-surface-sunken)]"
    >
      {/* Animated pill indicator */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-full"
        style={{
          width: pillWidth,
          background: 'var(--color-surface-elevated)',
          boxShadow: 'var(--shadow-sm)',
        }}
        initial={false}
        animate={{
          x: activeIndex === 0
            ? 0
            : `calc(${activeIndex * 100}% + ${activeIndex * 4}px)`,
        }}
        transition={springPresets.smooth}
      />

      {tabs.map(tab => {
        const isActive = tab.key === activeTab
        const isDisabled = disabledKeys.includes(tab.key)

        return (
          <button
            key={tab.key}
            onClick={() => !isDisabled && onTabChange(tab.key)}
            disabled={isDisabled}
            className={`
              relative z-10 flex-1 py-2 rounded-full text-sm font-semibold transition-colors
              ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              ${isActive ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}
            `}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
