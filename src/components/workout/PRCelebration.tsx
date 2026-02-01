/* eslint-disable react-hooks/purity */
import { useEffect, useState, useMemo } from 'react'
import { Trophy } from 'lucide-react'
import type { PRCheckResult } from '@/services/prService'

interface PRCelebrationProps {
  result: PRCheckResult
  onComplete: () => void
}

export function PRCelebration({ result, onComplete }: PRCelebrationProps) {
  const [visible, setVisible] = useState(true)

  // Generate confetti particles once on mount
  const confetti = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 1
    })),
  [])

  useEffect(() => {
    // Vibrate on mount
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200])
    }

    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onComplete, 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-3 h-3 animate-fall"
            style={{
              left: `${particle.left}%`,
              top: '-20px',
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][particle.id % 5]
            }}
          />
        ))}
      </div>

      {/* PR Card */}
      <div
        className="bg-[var(--color-surface)] rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full animate-bounce-in pointer-events-auto"
        onClick={onComplete}
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            New PR!
          </h2>

          <p className="text-lg font-semibold text-[var(--color-primary)] mb-1">
            {result.exerciseName}
          </p>

          <p className="text-3xl font-bold text-[var(--color-text)] mb-2">
            {result.newWeight} lbs
          </p>

          {result.improvement !== null && (
            <p className="text-[var(--color-success)] font-medium">
              +{result.improvement} lbs from previous best!
            </p>
          )}

          <p className="text-sm text-[var(--color-text-muted)] mt-4">
            Tap to dismiss
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
