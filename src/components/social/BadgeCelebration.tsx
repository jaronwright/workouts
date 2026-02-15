import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BADGE_MAP, RARITY_COLORS } from '@/config/badgeConfig'
import { springPresets } from '@/config/animationConfig'

interface BadgeCelebrationProps {
  badgeKeys: string[]
  onComplete: () => void
}

/**
 * Full-screen celebration overlay when user earns new badges.
 * Shows each badge with a satisfying scale-up + glow animation.
 */
export function BadgeCelebration({ badgeKeys, onComplete }: BadgeCelebrationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentKey = badgeKeys[currentIndex]
  const badge = currentKey ? BADGE_MAP[currentKey] : null

  // Cleanup dismiss timer on unmount
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!badge) {
      onComplete()
      return
    }

    // Auto-advance after 2.5s, or dismiss on tap
    const timer = setTimeout(() => {
      if (currentIndex < badgeKeys.length - 1) {
        setCurrentIndex(i => i + 1)
      } else {
        setVisible(false)
        dismissTimerRef.current = setTimeout(onComplete, 300)
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [currentIndex, badgeKeys.length, badge, onComplete])

  const handleTap = () => {
    if (currentIndex < badgeKeys.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setVisible(false)
      dismissTimerRef.current = setTimeout(onComplete, 300)
    }
  }

  if (!badge) return null

  const rarityColor = RARITY_COLORS[badge.rarity]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleTap}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
          <motion.div
            key={currentKey}
            initial={{ opacity: 0, scale: 0.3, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={springPresets.bouncy}
            className="flex flex-col items-center text-center px-8"
          >
            {/* Glow ring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ ...springPresets.gentle, delay: 0.2 }}
              className="absolute w-40 h-40 rounded-full"
              style={{
                background: `radial-gradient(circle, ${rarityColor}40 0%, transparent 70%)`,
              }}
            />

            {/* Badge emoji */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ ...springPresets.bouncy, delay: 0.1 }}
              className="relative text-6xl mb-4"
            >
              {badge.emoji}
            </motion.div>

            {/* "New Badge!" label */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: rarityColor }}
            >
              New Badge Earned!
            </motion.p>

            {/* Badge name */}
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-white mb-1"
            >
              {badge.name}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-white/70 max-w-xs"
            >
              {badge.description}
            </motion.p>

            {/* Tap to continue */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.5 }}
              className="text-[10px] text-white/40 mt-6 uppercase tracking-wider"
            >
              {currentIndex < badgeKeys.length - 1
                ? `Tap for next (${currentIndex + 1}/${badgeKeys.length})`
                : 'Tap to dismiss'}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
