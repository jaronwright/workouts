import { useState } from 'react'
import { Button, Input, Modal, CollapsibleSection } from '@/components/ui'
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator'
import { validatePassword } from '@/utils/validation'
import { deleteUserAccount } from '@/services/profileService'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'
import { Shield, SignOut, Envelope } from '@phosphor-icons/react'

export function SecuritySection() {
  const user = useAuthStore((s) => s.user)
  const updatePassword = useAuthStore((s) => s.updatePassword)
  const updateEmail = useAuthStore((s) => s.updateEmail)
  const signOut = useAuthStore((s) => s.signOut)
  const signOutAllDevices = useAuthStore((s) => s.signOutAllDevices)
  const { success, error: showError } = useToast()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [newEmail, setNewEmail] = useState('')
  const [isChangingEmail, setIsChangingEmail] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleSignOutAllDevices = async () => {
    try {
      await signOutAllDevices()
      success('Signed out from all devices')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out'
      showError(message)
    }
  }

  const handleChangeEmail = async () => {
    if (!newEmail) {
      showError('Please enter a new email')
      return
    }
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

  return (
    <>
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
              <SignOut className="w-4 h-4" />
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

      {/* ── EMAIL ── */}
      <div className="px-[var(--space-4)] pt-[var(--space-2)]">
        <CollapsibleSection
          icon={Envelope}
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
    </>
  )
}
