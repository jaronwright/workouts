import { useRef, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { AppShell } from '@/components/layout'
import { Button, Input, Card, CardContent, Modal, AnimatedCounter } from '@/components/ui'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useCycleDay } from '@/hooks/useCycleDay'
import { formatCycleStartDate } from '@/utils/cycleDay'
import { useClearSchedule } from '@/hooks/useSchedule'
import { useUserSessions } from '@/hooks/useWorkoutSession'
import { useUserTemplateWorkouts } from '@/hooks/useTemplateWorkout'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator'
import { validatePassword } from '@/utils/validation'
import { deleteUserAccount } from '@/services/profileService'
import { staggerContainer, staggerChild } from '@/config/animationConfig'
import { Calendar, Shield, Mail, ChevronDown, ChevronUp, LogOut, Sun, Moon as MoonIcon, Monitor, Dumbbell, Trophy, Flame, Star, ArrowLeftRight, ArrowUpDown, Heart, MessageSquarePlus, Bug, Lightbulb, Pencil, Check, X } from 'lucide-react'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { OnboardingWizard } from '@/components/onboarding'
import { NotificationSettings } from '@/components/profile/NotificationSettings'
import { useTheme } from '@/hooks/useTheme'
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
  const { theme, setTheme } = useTheme()
  const { success, error: showError } = useToast()
  const prefersReduced = useReducedMotion()
  const lifetimeStats = useLifetimeStats()

  const [displayName, setDisplayName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [, setSaved] = useState(false)

  // Security section state
  const [securityExpanded, setSecurityExpanded] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Email section state
  const [emailExpanded, setEmailExpanded] = useState(false)
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
  const [feedbackExpanded, setFeedbackExpanded] = useState(openFeedback)
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
          setSaved(true)
          setIsEditingName(false)
          success('Profile saved')
          setTimeout(() => setSaved(false), 2000)
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
      setSecurityExpanded(false)
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
      setEmailExpanded(false)
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
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[var(--color-surface-hover)] animate-pulse rounded-lg" />
          ))}
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Profile" showBack hideNav>
      <motion.div
        className="p-4 space-y-6"
        variants={staggerContainer}
        initial={prefersReduced ? false : 'hidden'}
        animate="visible"
      >
        {/* User Info Card */}
        <motion.div variants={staggerChild}>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <AvatarUpload />
                <div className="flex-1 min-w-0">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
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
                        className="text-lg font-semibold text-[var(--color-text)] bg-transparent border-b-2 border-[var(--color-primary)] outline-none w-full min-w-0"
                        placeholder="Enter your name"
                      />
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-md shrink-0"
                        aria-label="Save name"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setDisplayName(profile?.display_name || '')
                          setIsEditingName(false)
                        }}
                        className="p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] rounded-md shrink-0"
                        aria-label="Cancel editing"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="flex items-center gap-2 group text-left"
                    >
                      <h2 className="text-lg font-semibold text-[var(--color-text)] truncate">
                        {displayName || 'No name set'}
                      </h2>
                      <Pencil className="w-3.5 h-3.5 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  )}
                  <p className="text-sm text-[var(--color-text-muted)]">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lifetime Stats */}
        <motion.div variants={staggerChild}>
          <div className="grid grid-cols-3 gap-3">
            <Card className="overflow-hidden">
              <CardContent className="py-3 px-2 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                <div className="relative">
                  <Trophy className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                  <AnimatedCounter value={lifetimeStats.totalWorkouts} className="text-2xl font-bold text-[var(--color-text)] block" />
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Total</p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="py-3 px-2 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
                <div className="relative">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <AnimatedCounter value={lifetimeStats.longestStreak} className="text-2xl font-bold text-[var(--color-text)] block" />
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Best Streak</p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="py-3 px-2 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                <div className="relative">
                  <Star className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-[var(--color-text)] mt-1 truncate">{lifetimeStats.favoriteType}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide font-medium">Favorite</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Workout Split Section */}
        <motion.div variants={staggerChild}>
          <Card>
            <CardContent className="py-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text)]">Workout Split</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">Currently: {currentSplitName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {([
                  [PPL_PLAN_ID, 'Push/Pull/Legs', ArrowLeftRight],
                  [UPPER_LOWER_PLAN_ID, 'Upper/Lower', ArrowUpDown],
                  [FULL_BODY_PLAN_ID, 'Full Body', Dumbbell],
                  [BRO_SPLIT_PLAN_ID, 'Bro Split', Flame],
                  [ARNOLD_SPLIT_PLAN_ID, 'Arnold Split', Trophy],
                  [GLUTE_HYPERTROPHY_PLAN_ID, 'Glute Hypertrophy', Heart],
                ] as const).map(([planId, label, Icon]) => (
                  <button
                    key={planId}
                    onClick={() => handleSplitChange(planId)}
                    className={`
                      flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                      ${currentSplitId === planId
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                      }
                    `}
                  >
                    <Icon className={`w-6 h-6 ${currentSplitId === planId ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                    <span className={`text-sm font-medium text-center ${currentSplitId === planId ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Section */}
        <motion.div variants={staggerChild}>
          <Card>
            <CardContent className="py-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center">
                  {theme === 'light' ? (
                    <Sun className="w-5 h-5 text-[var(--color-primary)]" />
                  ) : theme === 'dark' ? (
                    <MoonIcon className="w-5 h-5 text-[var(--color-primary)]" />
                  ) : (
                    <Monitor className="w-5 h-5 text-[var(--color-primary)]" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text)]">Appearance</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">Choose your theme preference</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`
                    flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                    ${theme === 'light'
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                    }
                  `}
                >
                  <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                  <span className={`text-sm font-medium ${theme === 'light' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                    Light
                  </span>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`
                    flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                    ${theme === 'dark'
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                    }
                  `}
                >
                  <MoonIcon className={`w-6 h-6 ${theme === 'dark' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                    Dark
                  </span>
                </button>

                <button
                  onClick={() => setTheme('system')}
                  className={`
                    flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                    ${theme === 'system'
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                    }
                  `}
                >
                  <Monitor className={`w-6 h-6 ${theme === 'system' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                  <span className={`text-sm font-medium ${theme === 'system' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                    System
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div variants={staggerChild}>
          <NotificationSettings />
        </motion.div>

        {/* Security Section */}
        <motion.div variants={staggerChild}>
          <Card>
            <CardContent className="py-4">
              <button
                onClick={() => setSecurityExpanded(!securityExpanded)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-[var(--color-text)]">Security</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">Change password & sessions</p>
                  </div>
                </div>
                {securityExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[var(--color-text-muted)]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {securityExpanded && (
                  <motion.div
                    initial={prefersReduced ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-4">
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

                      <div className="pt-4 border-t border-[var(--color-border)]">
                        <h4 className="text-sm font-medium text-[var(--color-text)] mb-3">Session Management</h4>
                        <Button
                          variant="secondary"
                          onClick={handleSignOutAllDevices}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out All Devices
                        </Button>
                      </div>

                      <div className="pt-4 border-t border-[var(--color-border)]">
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="text-sm text-[var(--color-danger)] hover:underline"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Change Email Section */}
        <motion.div variants={staggerChild}>
          <Card>
            <CardContent className="py-4">
              <button
                onClick={() => setEmailExpanded(!emailExpanded)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-[var(--color-text)]">Email</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">Change your email address</p>
                  </div>
                </div>
                {emailExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[var(--color-text-muted)]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {emailExpanded && (
                  <motion.div
                    initial={prefersReduced ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-4">
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Workout Cycle Info */}
        <motion.div variants={staggerChild}>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Current Cycle Day</p>
                  <p className="text-lg font-semibold text-[var(--color-text)]">
                    Day {currentCycleDay} of 7
                  </p>
                </div>
              </div>
              <div className="relative flex items-center gap-2 mt-3">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Cycle started {formatCycleStartDate(profile?.cycle_start_date)}
                </p>
                <button
                  type="button"
                  className="text-sm font-semibold text-[var(--color-primary)] cursor-pointer"
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Feedback Section */}
        <motion.div variants={staggerChild} ref={feedbackRef}>
          <Card>
            <CardContent className="py-4">
              <button
                onClick={() => {
                  setFeedbackExpanded(!feedbackExpanded)
                  if (!feedbackExpanded) setFeedbackSubmitted(false)
                }}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <MessageSquarePlus className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-[var(--color-text)]">Feedback</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">Report a bug or request a feature</p>
                  </div>
                </div>
                {feedbackExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[var(--color-text-muted)]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {feedbackExpanded && (
                  <motion.div
                    initial={prefersReduced ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-4">
                      {feedbackSubmitted ? (
                        <div className="text-center py-4">
                          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageSquarePlus className="w-6 h-6 text-emerald-500" />
                          </div>
                          <p className="font-medium text-[var(--color-text)]">Thanks for your feedback!</p>
                          <p className="text-sm text-[var(--color-text-muted)] mt-1">We'll review it soon.</p>
                          <button
                            onClick={() => setFeedbackSubmitted(false)}
                            className="text-sm font-medium text-[var(--color-primary)] mt-3"
                          >
                            Submit another
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Type selector pills */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => setFeedbackType('bug')}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                feedbackType === 'bug'
                                  ? 'border-red-500 bg-red-500/10 text-red-500'
                                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]'
                              }`}
                            >
                              <Bug className="w-4 h-4" />
                              Bug Report
                            </button>
                            <button
                              onClick={() => setFeedbackType('feature')}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                feedbackType === 'feature'
                                  ? 'border-amber-500 bg-amber-500/10 text-amber-500'
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
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none text-sm"
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
                        <div className="pt-4 border-t border-[var(--color-border)]">
                          <h4 className="text-sm font-medium text-[var(--color-text)] mb-3">Past Submissions</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {pastFeedback.map((fb) => (
                              <div key={fb.id} className="p-3 rounded-lg bg-[var(--color-surface-hover)] text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    fb.type === 'bug'
                                      ? 'bg-red-500/10 text-red-500'
                                      : 'bg-amber-500/10 text-amber-500'
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Log Out */}
        <motion.div variants={staggerChild}>
          <Button
            variant="secondary"
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </motion.div>
      </motion.div>

      {/* Split Change Confirmation Modal */}
      <Modal
        isOpen={showSplitConfirm}
        onClose={() => {
          setShowSplitConfirm(false)
          setPendingSplitId(null)
        }}
        title="Change Workout Split"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Changing your workout split will reset your schedule. You'll be able to set up a new schedule for the selected split.
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Your existing workout history will not be affected.
          </p>
          <div className="flex gap-3">
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
        <div className="space-y-4">
          <div className="p-3 bg-[var(--color-danger)]/10 rounded-lg">
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
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Type <span className="font-bold">DELETE</span> to confirm
            </label>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE"
            />
          </div>

          <div className="flex gap-3">
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
