import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout'
import { Button, Input, Card, CardContent, Modal } from '@/components/ui'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator'
import { validatePassword } from '@/utils/validation'
import { deleteUserAccount } from '@/services/profileService'
import { Calendar, Shield, Mail, ChevronDown, ChevronUp, LogOut, Sun, Moon, Monitor } from 'lucide-react'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { useTheme } from '@/hooks/useTheme'

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
] as const

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const updatePassword = useAuthStore((s) => s.updatePassword)
  const updateEmail = useAuthStore((s) => s.updateEmail)
  const signOut = useAuthStore((s) => s.signOut)
  const signOutAllDevices = useAuthStore((s) => s.signOutAllDevices)
  const { data: profile, isLoading } = useProfile()
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile()
  const { theme, setTheme } = useTheme()
  const { success, error: showError } = useToast()

  const [displayName, setDisplayName] = useState('')
  const [gender, setGender] = useState<string>('')
  const [saved, setSaved] = useState(false)

  // Security section state
  const [securityExpanded, setSecurityExpanded] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Email section state
  const [emailExpanded, setEmailExpanded] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [isChangingEmail, setIsChangingEmail] = useState(false)

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Initialize form from profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setGender(profile.gender || '')
    }
  }, [profile])

  const handleSave = () => {
    updateProfile(
      {
        display_name: displayName || null,
        gender: (gender || null) as 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
      },
      {
        onSuccess: () => {
          setSaved(true)
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
      // The user will be redirected to auth page by the protected route
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

  if (isLoading) {
    return (
      <AppShell title="Profile">
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[var(--color-surface-hover)] animate-pulse rounded-lg" />
          ))}
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Profile">
      <div className="p-4 space-y-6">
        {/* User Info Card */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <AvatarUpload />
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {displayName || 'No name set'}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardContent className="py-4 space-y-4">
            <h3 className="font-semibold text-[var(--color-text)]">Edit Profile</h3>

            <Input
              label="Display Name"
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={handleSave} loading={isSaving} className="w-full">
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardContent className="py-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center">
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-[var(--color-primary)]" />
                ) : theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-[var(--color-primary)]" />
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
                <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
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

        {/* Security Section */}
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

            {securityExpanded && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-4 animate-fade-in">
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
            )}
          </CardContent>
        </Card>

        {/* Change Email Section */}
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

            {emailExpanded && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-4 animate-fade-in">
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
            )}
          </CardContent>
        </Card>

        {/* Workout Cycle Info */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Current Cycle Day</p>
                <p className="text-lg font-semibold text-[var(--color-text)]">
                  Day {profile?.current_cycle_day || 1} of 7
                </p>
              </div>
            </div>
            {profile?.last_workout_date && (
              <p className="text-sm text-[var(--color-text-muted)] mt-3">
                Last workout: {new Date(profile.last_workout_date).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Log Out */}
        <Button
          variant="secondary"
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </Button>
      </div>

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
