import { useState, useEffect } from 'react'
import { FadeIn, ScaleIn, AnimatedNumber } from '@/components/motion'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useLifetimeStats } from '@/hooks/useLifetimeStats'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'
import { AvatarUpload } from './AvatarUpload'
import { PencilSimple, Check, X } from '@phosphor-icons/react'

export function ProfileHero() {
  const user = useAuthStore((s) => s.user)
  const { data: profile } = useProfile()
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile()
  const { success, error: showError } = useToast()
  const lifetimeStats = useLifetimeStats()

  const [displayName, setDisplayName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)

  // Initialize form from profile data (skip if user is actively editing)
  useEffect(() => {
    if (profile && !isEditingName) {
      setDisplayName(profile.display_name || '')
    }
  }, [profile, isEditingName])

  const handleSave = () => {
    updateProfile(
      { display_name: displayName || null },
      {
        onSuccess: () => {
          setIsEditingName(false)
          success('Profile saved')
        },
        onError: () => {
          showError('Failed to save profile')
        }
      }
    )
  }

  return (
    <FadeIn direction="up">
      <div className="relative px-[var(--space-5)] pt-[var(--space-6)] pb-[var(--space-5)]">
        {/* Warm glow behind avatar */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'var(--gradient-warm-glow)' }}
        />

        {/* Avatar + Name row */}
        <div className="relative flex items-center gap-[var(--space-5)]">
          <ScaleIn>
            <div className="w-20 h-20 shrink-0">
              <AvatarUpload />
            </div>
          </ScaleIn>

          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-[var(--space-2)]">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave()
                    if (e.key === 'Escape') {
                      setDisplayName(profile?.display_name || '')
                      setIsEditingName(false)
                    }
                  }}
                  autoFocus
                  className="text-[clamp(1.25rem,5.5vw,2rem)] font-bold text-[var(--color-text)] bg-transparent border-b-2 border-[var(--color-primary)] outline-none w-full"
                  style={{ fontFamily: 'var(--font-heading)' }}
                  placeholder="Enter your name"
                />
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="p-1 rounded-[var(--radius-sm)] shrink-0 hover:bg-[var(--color-success-muted)]"
                  style={{ color: 'var(--color-success)' }}
                  aria-label="Save name"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setDisplayName(profile?.display_name || '')
                    setIsEditingName(false)
                  }}
                  className="p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] rounded-[var(--radius-sm)] shrink-0"
                  aria-label="Cancel editing"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-[var(--space-2)] group text-left min-w-0 max-w-full"
              >
                <h2
                  className="text-[clamp(1.25rem,5.5vw,2rem)] text-[var(--color-text)] truncate"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}
                >
                  {displayName || 'No name set'}
                  <span className="text-[var(--color-primary)]">.</span>
                </h2>
                <PencilSimple className="w-3.5 h-3.5 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            )}
            <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] mt-[var(--space-1)] truncate">{user?.email}</p>
          </div>
        </div>

        {/* Trophy Stats */}
        <div className="relative flex gap-[var(--space-3)] mt-[var(--space-5)]">
          <div className="flex-1 bg-[var(--color-surface)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)] text-center border border-[var(--color-border)]">
            <AnimatedNumber
              value={lifetimeStats.totalWorkouts}
              className="text-[var(--text-2xl)] font-bold text-[var(--color-text)] font-mono-stats block leading-none"
            />
            <p
              className="text-[10px] text-[var(--color-text-muted)] mt-1 uppercase font-medium"
              style={{ letterSpacing: 'var(--tracking-widest)' }}
            >
              total
            </p>
          </div>

          <div
            className="flex-1 bg-[var(--color-surface)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)] text-center border border-[var(--color-border)]"
            style={lifetimeStats.longestStreak > 0 ? { boxShadow: 'var(--shadow-primary)', borderColor: 'var(--color-primary-glow)' } : undefined}
          >
            <AnimatedNumber
              value={lifetimeStats.longestStreak}
              className="text-[var(--text-2xl)] font-bold text-[var(--color-text)] font-mono-stats block leading-none"
            />
            <p
              className="text-[10px] text-[var(--color-text-muted)] mt-1 uppercase font-medium"
              style={{ letterSpacing: 'var(--tracking-widest)' }}
            >
              best streak
            </p>
          </div>

          <div className="flex-1 bg-[var(--color-surface)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)] text-center border border-[var(--color-border)]">
            <p className="text-[var(--text-sm)] font-bold text-[var(--color-text)] font-mono-stats truncate leading-none">{lifetimeStats.favoriteType}</p>
            <p
              className="text-[10px] text-[var(--color-text-muted)] mt-1 uppercase font-medium"
              style={{ letterSpacing: 'var(--tracking-widest)' }}
            >
              favorite
            </p>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}
