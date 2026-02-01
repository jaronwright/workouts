/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useAuthStore } from '@/stores/authStore'
import { User, Calendar } from 'lucide-react'

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
] as const

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const { data: profile, isLoading } = useProfile()
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile()

  const [displayName, setDisplayName] = useState('')
  const [gender, setGender] = useState<string>('')
  const [saved, setSaved] = useState(false)

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
          setTimeout(() => setSaved(false), 2000)
        }
      }
    )
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
              <div className="w-16 h-16 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
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
      </div>
    </AppShell>
  )
}
