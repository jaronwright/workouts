import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { upsertProfile } from '@/services/profileService'

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender (optional)' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
] as const

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [gender, setGender] = useState<string>('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { signIn, signUp, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password)
        const user = useAuthStore.getState().user
        if (user && (gender || displayName)) {
          await upsertProfile(user.id, {
            display_name: displayName || null,
            gender: (gender || null) as 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null
          })
        }
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="
            w-16 h-16 mx-auto mb-4
            bg-gradient-to-br from-[var(--color-primary)] to-[#8B5CF6]
            rounded-[var(--radius-xl)]
            flex items-center justify-center
            shadow-md
          ">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Workout Tracker
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1 text-sm">
            Track your Push/Pull/Legs progress
          </p>
        </div>

        {/* Auth Card */}
        <Card variant="elevated">
          <CardContent className="p-5">
            {/* Tabs */}
            <div className="flex p-1 mb-5 bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)]">
              <button
                onClick={() => setIsLogin(true)}
                className={`
                  flex-1 py-2 text-center font-semibold text-sm
                  rounded-[var(--radius-md)]
                  transition-colors duration-100
                  ${isLogin
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                    : 'text-[var(--color-text-muted)]'
                  }
                `}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`
                  flex-1 py-2 text-center font-semibold text-sm
                  rounded-[var(--radius-md)]
                  transition-colors duration-100
                  ${!isLogin
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                    : 'text-[var(--color-text-muted)]'
                  }
                `}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              {!isLogin && (
                <div className="space-y-4 animate-fade-in">
                  <Input
                    type="text"
                    label="Display Name"
                    placeholder="Your name (optional)"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="
                        w-full px-4 py-3
                        rounded-[var(--radius-lg)]
                        border-2 border-[var(--color-border)]
                        bg-[var(--color-surface)]
                        text-[var(--color-text)] text-base
                        focus:outline-none focus:border-[var(--color-primary)]
                      "
                    >
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {error && (
                <div className="
                  flex items-center gap-2 px-3 py-2.5
                  rounded-[var(--radius-md)]
                  bg-[var(--color-danger)]/10
                  animate-fade-in
                ">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)]" />
                  <p className="text-sm font-medium text-[var(--color-danger)]">
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                size="lg"
                loading={loading}
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
