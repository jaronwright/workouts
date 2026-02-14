import { useRef, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { Button, Input, Modal, ThemePicker, CollapsibleSection } from '@/components/ui'
import { FadeIn, StaggerList, StaggerItem, AnimatedNumber, ScaleIn, PressableCard } from '@/components/motion'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useCycleDay } from '@/hooks/useCycleDay'
import { formatCycleStartDate } from '@/utils/cycleDay'
import { useClearSchedule } from '@/hooks/useSchedule'
import { useUserSessions } from '@/hooks/useWorkoutSession'
import { useUserTemplateWorkouts } from '@/hooks/useTemplateWorkout'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator'
import { validatePassword } from '@/utils/validation'
import { deleteUserAccount } from '@/services/profileService'
import { Calendar, Shield, Mail, LogOut, Monitor, Dumbbell, Trophy, Flame, Star, ArrowLeftRight, ArrowUpDown, Heart, MessageSquarePlus, Bug, Lightbulb, Pencil, Check, X, Eye, EyeOff } from 'lucide-react'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { OnboardingWizard } from '@/components/onboarding'
import { NotificationSettings } from '@/components/profile/NotificationSettings'
import { useSubmitFeedback, useUserFeedback } from '@/hooks/useFeedback'
import { getWorkoutDisplayName } from '@/config/workoutConfig'
import type { SessionWithDay } from '@/services/workoutService'
import {
  PPL_PLAN_ID,
  UPPER_LOWER_PLAN_ID,
  FULL_BODY_PLAN_ID,
  BRO_SPLIT_PLAN_ID,
  ARNOLD_SPLIT_PLAN_ID,
  GLUTE_HYPERTROPHY_PLAN_ID,
  SPLIT_NAMES,
} from '@/config/planConstants'

// Calculate lifetime stats
function useLifetimeStats() {
  const { data: weightsSessions } = useUserSessions()
  const { data: templateSessions } = useUserTemplateWorkouts()

  const allSessions = [
    ...(weightsSessions || []),
    ...(templateSessions || [])
  ].filter(s => s.completed_at)

  const totalWorkouts = allSessions.length

  // Longest streak
  const completedDates = allSessions
    .map(s => {
      const d = new Date(s.completed_at!)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
    .sort((a, b) => a - b)

  const uniqueDates = [...new Set(completedDates)]
  let longestStreak = 0
  let currentStreak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = uniqueDates[i] - uniqueDates[i - 1]
    if (diff <= 86400000) { // 1 day
      currentStreak++
    } else {
      longestStreak = Math.max(longestStreak, currentStreak)
      currentStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak)
  if (uniqueDates.length === 0) longestStreak = 0

  // Favorite workout type
  const typeCounts = new Map<string, number>()
  ;(weightsSessions || []).forEach((s: SessionWithDay) => {
    if (!s.completed_at) return
    const name = getWorkoutDisplayName(s.workout_day?.name)
    typeCounts.set(name, (typeCounts.get(name) || 0) + 1)
  })
  ;(templateSessions || []).forEach(s => {
    if (!s.completed_at) return
    const name = s.template?.name || 'Other'
    typeCounts.set(name, (typeCounts.get(name) || 0) + 1)
  })

  let favoriteType = 'None'
  let maxCount = 0
  typeCounts.forEach((count, name) => {
    if (count > maxCount) {
      maxCount = count
      favoriteType = name
    }
  })

  return { totalWorkouts, longestStreak, favoriteType }
}

export function ProfilePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const updatePassword = useAuthStore((s) => s.updatePassword)
  const updateEmail = useAuthStore((s) => s.updateEmail)
  const signOut = useAuthStore((s) => s.signOut)
  const signOutAllDevices = useAuthStore((s) => s.signOutAllDevices)
  const { data: profile, isLoading } = useProfile()
  const { mutate: updateProfile, mutateAsync: updateProfileAsync, isPending: isSaving } = useUpdateProfile()
  const currentCycleDay = useCycleDay()
  const dateInputRef = useRef<HTMLInputElement>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const { success, error: showError } = useToast()
  const lifetimeStats = useLifetimeStats()

  const [displayName, setDisplayName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)

  // Security section state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Email section state
  const [newEmail, setNewEmail] = useState('')
  const [isChangingEmail, setIsChangingEmail] = useState(false)

  // Workout split state
  const [showSplitConfirm, setShowSplitConfirm] = useState(false)
  const [pendingSplitId, setPendingSplitId] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { mutateAsync: clearSchedule } = useClearSchedule()

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Feedback section state
  const openFeedback = (location.state as { openFeedback?: boolean } | null)?.openFeedback ?? false
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature'>('bug')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const { mutate: submitFeedback, isPending: isSubmittingFeedback } = useSubmitFeedback()
  const { data: pastFeedback } = useUserFeedback()

  // Initialize form from profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
    }
  }, [profile])

  // Scroll to feedback section when navigated with openFeedback state
  useEffect(() => {
    if (openFeedback && feedbackRef.current) {
      setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
    }
  }, [openFeedback])

  const handleSave = () => {
    updateProfile(
      {
        display_name: displayName || null
      },
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

  const handleChangePassword = async () => {
    if (!newPassword) {
      showError('Please enter a new password')
      return
    }

    const validation = validatePassword(newPassword)
    if (!validation.valid) {
      showError('Password does not meet requirements')
      return
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match')
      return
    }

    setIsChangingPassword(true)
    try {
      await updatePassword(newPassword)
      success('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update password'
      showError(message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleChangeEmail = async () => {
    if (!newEmail) {
      showError('Please enter a new email')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      showError('Please enter a valid email address')
      return
    }

    if (newEmail === user?.email) {
      showError('New email must be different from current email')
      return
    }

    setIsChangingEmail(true)
    try {
      await updateEmail(newEmail)
      success('Confirmation email sent! Check your new email to confirm the change.')
      setNewEmail('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update email'
      showError(message)
    } finally {
      setIsChangingEmail(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      showError('Please type DELETE to confirm')
      return
    }

    setIsDeleting(true)
    try {
      await deleteUserAccount()
      await signOut()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account'
      showError(message)
      setIsDeleting(false)
    }
  }

  const handleSignOutAllDevices = async () => {
    try {
      await signOutAllDevices()
      success('Signed out from all devices')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out'
      showError(message)
    }
  }

  const currentSplitId = profile?.selected_plan_id || PPL_PLAN_ID
  const currentSplitName = SPLIT_NAMES[currentSplitId] || 'Push / Pull / Legs'

  const handleSplitChange = (newPlanId: string) => {
    if (newPlanId === currentSplitId) return
    setPendingSplitId(newPlanId)
    setShowSplitConfirm(true)
  }

  const confirmSplitChange = async () => {
    if (!pendingSplitId) return
    try {
      await updateProfileAsync({ selected_plan_id: pendingSplitId })
    } catch (err) {
      console.error('Failed to update workout split:', err)
      showError('Failed to change workout split. Please try again.')
      setShowSplitConfirm(false)
      setPendingSplitId(null)
      return
    }
    try {
      await clearSchedule()
    } catch (err) {
      console.error('Failed to clear schedule after split change:', err)
      // Split was saved successfully, proceed to onboarding anyway
    }
    setShowSplitConfirm(false)
    setShowOnboarding(true)
  }

  if (isLoading) {
    return (
      <AppShell title="Profile" showBack hideNav>
        <div className="p-[var(--space-4)] space-y-[var(--space-4)]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[var(--color-surface-hover)] animate-pulse rounded-[var(--radius-lg)]" />
          ))}
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Profile" showBack hideNav>
      <StaggerList className="pb-[var(--space-8)]">
        {/* ── PLAYER CARD HERO ── */}
        <StaggerItem>
          <FadeIn direction="up">
            <div className="relative px-[var(--space-5)] pt-[var(--space-6)] pb-[var(--space-5)]">
              {/* Warm glow behind avatar */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'var(--gradient-warm-glow)' }}
              />

              {/* Avatar + Name row — left-aligned for editorial feel */}
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
                        className="text-[clamp(1.75rem,7vw,2.25rem)] font-bold text-[var(--color-text)] bg-transparent border-b-2 border-[var(--color-primary)] outline-none w-full"
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
                      className="flex items-center gap-[var(--space-2)] group text-left"
                    >
                      <h2
                        className="text-[clamp(1.75rem,7vw,2.25rem)] text-[var(--color-text)] truncate"
                        style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}
                      >
                        {displayName || 'No name set'}
                        <span className="text-[var(--color-primary)]">.</span>
                      </h2>
                      <Pencil className="w-3.5 h-3.5 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  )}
                  <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] mt-[var(--space-1)] truncate">{user?.email}</p>
                </div>
              </div>

              {/* ── TROPHY STATS ── */}
              <div className="relative flex gap-[var(--space-3)] mt-[var(--space-5)]">
                {/* Total workouts */}
                <div
                  className="flex-1 bg-[var(--color-surface)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)] text-center border border-[var(--color-border)]"
                >
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

                {/* Best streak — yellow glow */}
                <div
                  className="flex-1 bg-[var(--color-surface)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)] text-center border border-[var(--color-border)]"
                  style={lifetimeStats.longestStreak > 0 ? { boxShadow: '0 0 16px rgba(232, 255, 0, 0.08)', borderColor: 'rgba(232, 255, 0, 0.15)' } : undefined}
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

                {/* Favorite */}
                <div
                  className="flex-1 bg-[var(--color-surface)] rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)] text-center border border-[var(--color-border)]"
                >
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
        </StaggerItem>

        {/* ── WORKOUT SPLIT ── */}
        <StaggerItem>
          <div className="px-[var(--space-4)] pt-[var(--space-4)]">
            <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-4)]">
              <div className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
              <h3
                className="text-[var(--text-xs)] text-[var(--color-text-muted)] uppercase"
                style={{ letterSpacing: 'var(--tracking-widest)', fontWeight: 600 }}
              >
                Workout Split
              </h3>
              <span className="text-[var(--text-xs)] text-[var(--color-primary)] font-semibold ml-auto">{currentSplitName}</span>
            </div>

            <div className="grid grid-cols-2 gap-[var(--space-2)]">
              {([
                [PPL_PLAN_ID, 'Push/Pull/Legs', ArrowLeftRight],
                [UPPER_LOWER_PLAN_ID, 'Upper/Lower', ArrowUpDown],
                [FULL_BODY_PLAN_ID, 'Full Body', Dumbbell],
                [BRO_SPLIT_PLAN_ID, 'Bro Split', Flame],
                [ARNOLD_SPLIT_PLAN_ID, 'Arnold Split', Trophy],
                [GLUTE_HYPERTROPHY_PLAN_ID, 'Glute Hypertrophy', Heart],
              ] as const).map(([planId, label, Icon]) => {
                const isActive = currentSplitId === planId
                return (
                  <PressableCard key={planId} onClick={() => handleSplitChange(planId)}>
                    <div
                      className={`
                        flex items-center gap-[var(--space-3)] p-[var(--space-3)] rounded-[var(--radius-md)] transition-all
                        ${isActive
                          ? 'bg-[var(--color-primary-muted)] border-l-[3px] border-l-[var(--color-primary)]'
                          : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]'
                        }
                      `}
                      style={isActive ? { boxShadow: '0 0 16px rgba(232, 255, 0, 0.06)' } : undefined}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                      <span className={`text-[var(--text-sm)] font-medium ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                        {label}
                      </span>
                    </div>
                  </PressableCard>
                )
              })}
            </div>
          </div>
        </StaggerItem>

        {/* ── SETTINGS: APPEARANCE ── */}
        <StaggerItem>
          <div className="px-[var(--space-4)] pt-[var(--space-8)]">
            <h3
              className="text-[var(--text-xs)] text-[var(--color-text-muted)] uppercase tracking-[var(--tracking-widest)] mb-[var(--space-4)]"
              style={{ fontWeight: 'var(--weight-semibold)' }}
            >
              Appearance
            </h3>
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-[var(--space-4)]">
              <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-4)]">
                <Monitor className="w-5 h-5 text-[var(--color-primary)]" />
                <span className="text-[var(--text-sm)] text-[var(--color-text)]">Theme</span>
              </div>
              <ThemePicker />
            </div>
          </div>
        </StaggerItem>

        {/* ── NOTIFICATIONS ── */}
        <StaggerItem>
          <div className="px-[var(--space-4)] pt-[var(--space-4)]">
            <NotificationSettings />
          </div>
        </StaggerItem>

        {/* ── SETTINGS: PRIVACY ── */}
        <StaggerItem>
          <div className="px-[var(--space-4)] pt-[var(--space-8)]">
            <h3
              className="text-[var(--text-xs)] text-[var(--color-text-muted)] uppercase tracking-[var(--tracking-widest)] mb-[var(--space-4)]"
              style={{ fontWeight: 'var(--weight-semibold)' }}
            >
              Privacy
            </h3>
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-[var(--space-4)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[var(--space-3)] flex-1 pr-[var(--space-4)]">
                  {profile?.hide_weight_details ? (
                    <EyeOff className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
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
                        onError: () => showError('Failed to update privacy setting')
                      }
                    )
                  }}
                  className={`
                    relative w-11 h-6 rounded-full transition-colors duration-200
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
                      absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                      transition-transform duration-200
                      ${profile?.hide_weight_details ? 'translate-x-5' : 'translate-x-0'}
                    `}
                    style={{ boxShadow: 'var(--shadow-xs)' }}
                  />
                </button>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* ── WORKOUT CYCLE ── */}
        <StaggerItem>
          <div className="px-[var(--space-4)] pt-[var(--space-8)]">
            <h3
              className="text-[var(--text-xs)] text-[var(--color-text-muted)] uppercase tracking-[var(--tracking-widest)] mb-[var(--space-4)]"
              style={{ fontWeight: 'var(--weight-semibold)' }}
            >
              Workout Cycle
            </h3>
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
        </StaggerItem>

        {/* Gradient divider */}
        <StaggerItem>
          <div className="px-[var(--space-8)] py-[var(--space-2)]">
            <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, var(--color-border-strong), transparent)' }} />
          </div>
        </StaggerItem>

        {/* ── SECURITY ── */}
        <StaggerItem>
          <div className="px-[var(--space-4)]">
            <CollapsibleSection
              icon={Shield}
              iconColor="bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
              title="Security"
              subtitle="Change password & sessions"
            >
              <h4 className="text-sm font-medium text-[var(--color-text)]">Change Password</h4>
              <div>
                <Input
                  type="password"
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <PasswordStrengthIndicator password={newPassword} />
              </div>
              <Input
                type="password"
                label="Confirm Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Button
                onClick={handleChangePassword}
                loading={isChangingPassword}
                className="w-full"
                disabled={!newPassword || !confirmPassword}
              >
                Update Password
              </Button>

              <div className="pt-[var(--space-4)] border-t border-[var(--color-border)]">
                <h4 className="text-sm font-medium text-[var(--color-text)] mb-[var(--space-3)]">Session Management</h4>
                <Button
                  variant="secondary"
                  onClick={handleSignOutAllDevices}
                  className="w-full flex items-center justify-center gap-[var(--space-2)]"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out All Devices
                </Button>
              </div>

              <div className="pt-[var(--space-4)] border-t border-[var(--color-border)]">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="text-sm text-[var(--color-danger)] hover:underline"
                >
                  Delete Account
                </button>
              </div>
            </CollapsibleSection>
          </div>
        </StaggerItem>

        {/* ── EMAIL ── */}
        <StaggerItem>
          <div className="px-[var(--space-4)] pt-[var(--space-2)]">
            <CollapsibleSection
              icon={Mail}
              iconColor="bg-[var(--color-info-muted)] text-[var(--color-info)]"
              title="Email"
              subtitle="Change your email address"
            >
              <p className="text-sm text-[var(--color-text-muted)]">
                Current email: <span className="font-medium text-[var(--color-text)]">{user?.email}</span>
              </p>
              <Input
                type="email"
                label="New Email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                autoComplete="email"
              />
              <p className="text-xs text-[var(--color-text-muted)]">
                A confirmation link will be sent to your new email address.
              </p>
              <Button
                onClick={handleChangeEmail}
                loading={isChangingEmail}
                className="w-full"
                disabled={!newEmail}
              >
                Update Email
              </Button>
            </CollapsibleSection>
          </div>
        </StaggerItem>

        {/* ── FEEDBACK ── */}
        <StaggerItem>
          <div ref={feedbackRef} className="px-[var(--space-4)] pt-[var(--space-2)]">
            <CollapsibleSection
              icon={MessageSquarePlus}
              iconColor="bg-[var(--color-warning-muted)] text-[var(--color-warning)]"
              title="Feedback"
              subtitle="Report a bug or request a feature"
              defaultExpanded={openFeedback}
              onToggle={(expanded) => { if (expanded) setFeedbackSubmitted(false) }}
            >
              {feedbackSubmitted ? (
                <div className="text-center py-[var(--space-4)]">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-[var(--space-3)]" style={{ background: 'var(--color-success-muted)' }}>
                    <MessageSquarePlus className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
                  </div>
                  <p className="font-medium text-[var(--color-text)]">Thanks for your feedback!</p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">We'll review it soon.</p>
                  <button
                    onClick={() => setFeedbackSubmitted(false)}
                    className="text-sm font-medium text-[var(--color-primary)] mt-[var(--space-3)]"
                  >
                    Submit another
                  </button>
                </div>
              ) : (
                <>
                  {/* Type selector pills */}
                  <div className="flex gap-[var(--space-2)]">
                    <button
                      onClick={() => setFeedbackType('bug')}
                      className={`flex-1 flex items-center justify-center gap-[var(--space-2)] py-2 px-[var(--space-3)] rounded-[var(--radius-md)] border-2 transition-all text-sm font-medium ${
                        feedbackType === 'bug'
                          ? 'border-[var(--color-danger)] bg-[var(--color-danger-muted)] text-[var(--color-danger)]'
                          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]'
                      }`}
                    >
                      <Bug className="w-4 h-4" />
                      Bug Report
                    </button>
                    <button
                      onClick={() => setFeedbackType('feature')}
                      className={`flex-1 flex items-center justify-center gap-[var(--space-2)] py-2 px-[var(--space-3)] rounded-[var(--radius-md)] border-2 transition-all text-sm font-medium ${
                        feedbackType === 'feature'
                          ? 'border-[var(--color-warning)] bg-[var(--color-warning-muted)] text-[var(--color-warning)]'
                          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]'
                      }`}
                    >
                      <Lightbulb className="w-4 h-4" />
                      Feature Request
                    </button>
                  </div>

                  {/* Message textarea */}
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder={feedbackType === 'bug' ? 'Describe the bug...' : 'Describe the feature you\'d like...'}
                    rows={3}
                    className="w-full px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none text-sm"
                  />

                  {/* Submit */}
                  <Button
                    onClick={() => {
                      submitFeedback(
                        { type: feedbackType, message: feedbackMessage },
                        {
                          onSuccess: () => {
                            setFeedbackMessage('')
                            setFeedbackSubmitted(true)
                            success('Feedback submitted!')
                          },
                          onError: () => showError('Failed to submit feedback'),
                        }
                      )
                    }}
                    loading={isSubmittingFeedback}
                    disabled={!feedbackMessage.trim()}
                    className="w-full"
                  >
                    Submit Feedback
                  </Button>
                </>
              )}

              {/* Past submissions */}
              {pastFeedback && pastFeedback.length > 0 && (
                <div className="pt-[var(--space-4)] border-t border-[var(--color-border)]">
                  <h4 className="text-sm font-medium text-[var(--color-text)] mb-[var(--space-3)]">Past Submissions</h4>
                  <div className="space-y-[var(--space-2)] max-h-48 overflow-y-auto">
                    {pastFeedback.map((fb) => (
                      <div key={fb.id} className="p-[var(--space-3)] rounded-[var(--radius-md)] bg-[var(--color-surface-hover)] text-sm">
                        <div className="flex items-center gap-[var(--space-2)] mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            fb.type === 'bug'
                              ? 'bg-[var(--color-danger-muted)] text-[var(--color-danger)]'
                              : 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]'
                          }`}>
                            {fb.type === 'bug' ? <Bug className="w-3 h-3" /> : <Lightbulb className="w-3 h-3" />}
                            {fb.type === 'bug' ? 'Bug' : 'Feature'}
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {new Date(fb.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[var(--color-text)] line-clamp-2">{fb.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleSection>
          </div>
        </StaggerItem>

        {/* Gradient divider */}
        <StaggerItem>
          <div className="px-[var(--space-8)] py-[var(--space-2)]">
            <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, var(--color-border-strong), transparent)' }} />
          </div>
        </StaggerItem>

        {/* ── LOG OUT ── */}
        <StaggerItem>
          <div className="px-[var(--space-4)] pt-[var(--space-2)]">
            <Button
              variant="secondary"
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-[var(--space-2)]"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </Button>
          </div>
        </StaggerItem>
      </StaggerList>

      {/* Split Change Confirmation Modal */}
      <Modal
        isOpen={showSplitConfirm}
        onClose={() => {
          setShowSplitConfirm(false)
          setPendingSplitId(null)
        }}
        title="Change Workout Split"
      >
        <div className="space-y-[var(--space-4)]">
          <p className="text-sm text-[var(--color-text-muted)]">
            Changing your workout split will reset your schedule. You'll be able to set up a new schedule for the selected split.
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Your existing workout history will not be affected.
          </p>
          <div className="flex gap-[var(--space-3)]">
            <Button
              variant="secondary"
              onClick={() => {
                setShowSplitConfirm(false)
                setPendingSplitId(null)
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={confirmSplitChange} loading={isSaving} className="flex-1">
              Change Split
            </Button>
          </div>
        </div>
      </Modal>

      {/* Onboarding Wizard for schedule setup after split change */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => { setShowOnboarding(false); setPendingSplitId(null); navigate('/') }}
        initialStep={3}
        initialPlanId={pendingSplitId || currentSplitId}
      />

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteConfirmation('')
        }}
        title="Delete Account"
      >
        <div className="space-y-[var(--space-4)]">
          <div className="p-[var(--space-3)] bg-[var(--color-danger-muted)] rounded-[var(--radius-md)]">
            <p className="text-sm text-[var(--color-danger)] font-medium">
              This action cannot be undone. This will permanently delete your account and all associated data including:
            </p>
            <ul className="mt-2 text-sm text-[var(--color-danger)] list-disc list-inside">
              <li>Your profile information</li>
              <li>All workout sessions and history</li>
              <li>All exercise logs and progress</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-[var(--space-2)]">
              Type <span className="font-bold">DELETE</span> to confirm
            </label>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE"
            />
          </div>

          <div className="flex gap-[var(--space-3)]">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false)
                setDeleteConfirmation('')
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              loading={isDeleting}
              disabled={deleteConfirmation !== 'DELETE'}
              className="flex-1"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  )
}
