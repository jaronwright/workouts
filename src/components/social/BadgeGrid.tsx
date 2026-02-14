import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Award } from 'lucide-react'
import { BADGE_MAP, RARITY_COLORS, RARITY_LABELS, type BadgeDefinition } from '@/config/badgeConfig'
import type { UserBadge } from '@/types/community'

interface BadgeGridProps {
  badges: UserBadge[]
  maxDisplay?: number
}

export function BadgeGrid({ badges, maxDisplay }: BadgeGridProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null)

  if (badges.length === 0) return null

  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges
  const remaining = maxDisplay ? Math.max(0, badges.length - maxDisplay) : 0

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {displayBadges.map(badge => {
          const def = BADGE_MAP[badge.badge_key]
          if (!def) return null

          return (
            <motion.button
              key={badge.id}
              onClick={() => setSelectedBadge(def)}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: `${RARITY_COLORS[def.rarity]}18` }}
              title={def.name}
            >
              {def.emoji}
            </motion.button>
          )
        })}
        {remaining > 0 && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-[var(--color-text-muted)] bg-[var(--color-surface-hover)]">
            +{remaining}
          </div>
        )}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedBadge(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative bg-[var(--color-surface)] rounded-[var(--radius-xl)] p-6 mx-4 max-w-xs w-full text-center"
            >
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
              >
                <X className="w-4 h-4" />
              </button>

              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl"
                style={{ backgroundColor: `${RARITY_COLORS[selectedBadge.rarity]}18` }}
              >
                {selectedBadge.emoji}
              </div>

              <h3 className="text-lg font-bold text-[var(--color-text)]">{selectedBadge.name}</h3>

              <span
                className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5"
                style={{
                  color: RARITY_COLORS[selectedBadge.rarity],
                  backgroundColor: `${RARITY_COLORS[selectedBadge.rarity]}15`,
                }}
              >
                {RARITY_LABELS[selectedBadge.rarity]}
              </span>

              <p className="text-sm text-[var(--color-text-muted)] mt-3 leading-relaxed">
                {selectedBadge.description}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

// Compact inline badge display (for profile headers, workout cards)
export function BadgeRow({ badges, max = 5 }: { badges: UserBadge[]; max?: number }) {
  if (badges.length === 0) return null

  return (
    <div className="flex items-center gap-1">
      <Award className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
      <div className="flex gap-0.5">
        {badges.slice(0, max).map(badge => {
          const def = BADGE_MAP[badge.badge_key]
          return def ? (
            <span key={badge.id} className="text-sm" title={def.name}>
              {def.emoji}
            </span>
          ) : null
        })}
        {badges.length > max && (
          <span className="text-xs text-[var(--color-text-muted)] ml-0.5">
            +{badges.length - max}
          </span>
        )}
      </div>
    </div>
  )
}
