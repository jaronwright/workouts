import { SegmentedControl } from '@/components/ui'
import type { FeedMode } from '@/types/community'

interface FeedTabsProps {
  activeTab: FeedMode
  onTabChange: (tab: FeedMode) => void
  followingCount?: number
}

const TABS = [
  { key: 'following', label: 'Feed' },
  { key: 'discover', label: 'Discover' },
]

export function FeedTabs({ activeTab, onTabChange, followingCount }: FeedTabsProps) {
  const disabledKeys = followingCount === 0 ? ['following'] : []

  return (
    <SegmentedControl
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(key) => onTabChange(key as FeedMode)}
      disabledKeys={disabledKeys}
      id="feedTabs"
    />
  )
}
