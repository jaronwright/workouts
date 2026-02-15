// ─── Badge Definitions ──────────────────────────────
// Config-driven: add new badges here without needing migrations.
// badge_key must match user_badges.badge_key in the database.

export interface BadgeDefinition {
  key: string
  name: string
  description: string
  emoji: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  category: 'streak' | 'volume' | 'consistency' | 'social' | 'milestone' | 'challenge'
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ─── Streak badges
  { key: 'streak_3', name: 'On Fire', description: '3-day workout streak', emoji: '🔥', rarity: 'common', category: 'streak' },
  { key: 'streak_7', name: 'Week Warrior', description: '7-day workout streak', emoji: '⚡', rarity: 'uncommon', category: 'streak' },
  { key: 'streak_14', name: 'Unstoppable', description: '14-day workout streak', emoji: '💎', rarity: 'rare', category: 'streak' },
  { key: 'streak_30', name: 'Iron Will', description: '30-day workout streak', emoji: '🏆', rarity: 'epic', category: 'streak' },
  { key: 'streak_100', name: 'Legend', description: '100-day workout streak', emoji: '👑', rarity: 'legendary', category: 'streak' },

  // ─── Milestone badges
  { key: 'first_workout', name: 'First Step', description: 'Complete your first workout', emoji: '🎯', rarity: 'common', category: 'milestone' },
  { key: 'workouts_10', name: 'Getting Started', description: 'Complete 10 workouts', emoji: '💪', rarity: 'common', category: 'milestone' },
  { key: 'workouts_50', name: 'Dedicated', description: 'Complete 50 workouts', emoji: '🏋️', rarity: 'uncommon', category: 'milestone' },
  { key: 'workouts_100', name: 'Century Club', description: 'Complete 100 workouts', emoji: '💯', rarity: 'rare', category: 'milestone' },
  { key: 'workouts_500', name: 'Iron Veteran', description: 'Complete 500 workouts', emoji: '⭐', rarity: 'epic', category: 'milestone' },

  // ─── Social badges
  { key: 'first_follow', name: 'Social Butterfly', description: 'Follow your first person', emoji: '🦋', rarity: 'common', category: 'social' },
  { key: 'followers_10', name: 'Rising Star', description: 'Gain 10 followers', emoji: '🌟', rarity: 'uncommon', category: 'social' },
  { key: 'followers_50', name: 'Influencer', description: 'Gain 50 followers', emoji: '📢', rarity: 'rare', category: 'social' },
  { key: 'first_reaction', name: 'Cheerleader', description: 'React to someone\'s workout', emoji: '📣', rarity: 'common', category: 'social' },

  // ─── Volume badges
  { key: 'volume_10k', name: 'Heavy Lifter', description: 'Lift 10,000 lbs in one session', emoji: '🏗️', rarity: 'uncommon', category: 'volume' },
  { key: 'volume_25k', name: 'Powerhouse', description: 'Lift 25,000 lbs in one session', emoji: '💥', rarity: 'rare', category: 'volume' },

  // ─── PR badges
  { key: 'first_pr', name: 'PR Crusher', description: 'Set your first personal record', emoji: '🎉', rarity: 'common', category: 'milestone' },
  { key: 'prs_10', name: 'Record Breaker', description: 'Set 10 personal records', emoji: '📈', rarity: 'uncommon', category: 'milestone' },

  // ─── Challenge badges (awarded on challenge completion)
  { key: 'week_warrior', name: 'Week Warrior', description: 'Complete the Week Warrior challenge', emoji: '⚔️', rarity: 'uncommon', category: 'challenge' },
  { key: 'iron_month', name: 'Iron Month', description: 'Complete the Iron Month challenge', emoji: '🛡️', rarity: 'rare', category: 'challenge' },
  { key: 'streak_master', name: 'Streak Master', description: 'Complete the Streak Master challenge', emoji: '🧘', rarity: 'rare', category: 'challenge' },
  { key: 'volume_king', name: 'Volume King', description: 'Complete the Volume King challenge', emoji: '👑', rarity: 'epic', category: 'challenge' },
]

export const BADGE_MAP: Record<string, BadgeDefinition> = Object.fromEntries(
  BADGE_DEFINITIONS.map(b => [b.key, b])
)

export const RARITY_COLORS: Record<BadgeDefinition['rarity'], string> = {
  common: '#9CA3AF',     // gray
  uncommon: '#10B981',   // green
  rare: '#3B82F6',       // blue
  epic: '#8B5CF6',       // purple
  legendary: '#F59E0B',  // gold
}

export const RARITY_LABELS: Record<BadgeDefinition['rarity'], string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
}
