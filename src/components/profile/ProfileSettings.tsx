import { useRef } from 'react'
import { ThemePicker, SectionLabel } from '@/components/ui'
import { FadeInOnScroll } from '@/components/motion'
import { NotificationSettings } from './NotificationSettings'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useCycleDay } from '@/hooks/useCycleDay'
import { formatCycleStartDate } from '@/utils/cycleDay'
import { useToast } from '@/hooks/useToast'
import { Monitor, Eye, EyeSlash, Calendar } from '@phosphor-icons/react'

export function ProfileSettings() {
  const { data: profile } = useProfile()
  const { mutate: updateProfile } = useUpdateProfile()
  const currentCycleDay = useCycleDay()
  const dateInputRef = useRef<HTMLInputElement>(null)
  const { success, error: showError } = useToast()

  return (
    <>
      {/* ── APPEARANCE ── */}
      <div className="px-[var(--space-4)] pt-[var(--space-8)]">
        <SectionLabel className="mb-[var(--space-4)]">Appearance</SectionLabel>
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-[var(--space-4)]">
          <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-4)]">
            <Monitor className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="text-[var(--text-sm)] text-[var(--color-text)]">Theme</span>
          </div>
          <ThemePicker />
        </div>
      </div>

      {/* ── NOTIFICATIONS ── */}
      <div className="px-[var(--space-4)] pt-[var(--space-4)]">
        <NotificationSettings />
      </div>

      {/* ── PRIVACY ── */}
      <FadeInOnScroll direction="up">
        <div className="px-[var(--space-4)] pt-[var(--space-8)]">
          <SectionLabel className="mb-[var(--space-4)]">Privacy</SectionLabel>
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-[var(--space-4)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[var(--space-3)] flex-1 pr-[var(--space-4)]">
                {profile?.hide_weight_details ? (
                  <EyeSlash className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
                ) : (
                  <Eye className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
                )}
                <div>
                  <p className="text-[var(--text-sm)] font-medium text-[var(--color-text)]">Hide weight details</p>
                  <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-0.5">
                    Others will see your exercises but not weights
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  updateProfile(
                    { hide_weight_details: !profile?.hide_weight_details },
                    {
                      onSuccess: () => success(profile?.hide_weight_details ? 'Weights now visible' : 'Weights hidden from community'),
                      onError: (err: Error) => showError(err.message || 'Failed to update privacy setting')
                    }
                  )
                }}
                className={`
                  relative w-11 h-6 rounded-full transition-colors duration-200
                  focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]
                  ${profile?.hide_weight_details
                    ? 'bg-[var(--color-primary)]'
                    : 'bg-[var(--color-border)]'
                  }
                `}
                role="switch"
                aria-checked={profile?.hide_weight_details || false}
              >
                <span
                  className={`
                    absolute top-0.5 left-0.5 w-5 h-5 bg-[var(--color-surface-elevated)] rounded-full
                    transition-transform duration-200
                    ${profile?.hide_weight_details ? 'translate-x-5' : 'translate-x-0'}
                  `}
                  style={{ boxShadow: 'var(--shadow-xs)' }}
                />
              </button>
            </div>
          </div>
        </div>
      </FadeInOnScroll>

      {/* ── WORKOUT CYCLE ── */}
      <FadeInOnScroll direction="up" delay={0.05}>
        <div className="px-[var(--space-4)] pt-[var(--space-8)]">
          <SectionLabel className="mb-[var(--space-4)]">Workout Cycle</SectionLabel>
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-[var(--space-4)]">
            <div className="flex items-center gap-[var(--space-3)]">
              <Calendar className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
              <div>
                <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">Current Cycle Day</p>
                <p className="font-mono-stats text-[var(--text-lg)] font-semibold text-[var(--color-text)]">
                  Day {currentCycleDay} of 7
                </p>
              </div>
            </div>
            <div className="relative flex items-center gap-[var(--space-2)] mt-[var(--space-3)] ml-8">
              <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                Cycle started {formatCycleStartDate(profile?.cycle_start_date)}
              </p>
              <button
                type="button"
                className="text-[var(--text-sm)] font-semibold text-[var(--color-primary)] cursor-pointer"
                onClick={() => dateInputRef.current?.showPicker()}
              >
                Change
              </button>
              <input
                ref={dateInputRef}
                type="date"
                className="absolute opacity-0 pointer-events-none"
                value={profile?.cycle_start_date || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    updateProfile(
                      { cycle_start_date: e.target.value },
                      {
                        onSuccess: () => success('Cycle start date updated'),
                        onError: () => showError('Failed to update cycle start date')
                      }
                    )
                  }
                }}
              />
            </div>
          </div>
        </div>
      </FadeInOnScroll>
    </>
  )
}
