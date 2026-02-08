import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { ProfilePage } from '../Profile'

// ---------------------------------------------------------------------------
// Top-level mock function references
// ---------------------------------------------------------------------------
const mockUpdateProfile = vi.fn()
const mockUpdateProfileAsync = vi.fn()
const mockClearSchedule = vi.fn()
const mockSignOut = vi.fn()
const mockUpdatePassword = vi.fn()
const mockUpdateEmail = vi.fn()
const mockSignOutAllDevices = vi.fn()
const mockSuccess = vi.fn()
const mockShowError = vi.fn()
const mockSetTheme = vi.fn()
const mockDeleteUserAccount = vi.fn()

// ---------------------------------------------------------------------------
// Mocks: animation / motion
// ---------------------------------------------------------------------------
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const filteredProps = Object.fromEntries(
        Object.entries(props).filter(
          ([k]) =>
            ![
              'variants',
              'initial',
              'animate',
              'exit',
              'transition',
              'style',
              'whileHover',
              'whileTap',
            ].includes(k),
        ),
      )
      return <div {...filteredProps}>{children as React.ReactNode}</div>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}))

vi.mock('@/config/animationConfig', () => ({
  staggerContainer: {},
  staggerChild: {},
}))

// ---------------------------------------------------------------------------
// Mocks: layout & UI components
// ---------------------------------------------------------------------------
vi.mock('@/components/layout', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}))

vi.mock('@/components/ui', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    loading,
    className,
    variant,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    loading?: boolean
    className?: string
    variant?: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      data-variant={variant}
    >
      {children}
    </button>
  ),
  Input: ({
    label,
    value,
    onChange,
    placeholder,
    type,
    disabled,
    autoComplete,
  }: {
    label?: string
    value?: string
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    placeholder?: string
    type?: string
    disabled?: boolean
    autoComplete?: string
  }) => (
    <div>
      {label && <label>{label}</label>}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-label={label}
      />
    </div>
  ),
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => <div className={className}>{children}</div>,
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => <div className={className}>{children}</div>,
  Modal: ({
    children,
    isOpen,
    title,
  }: {
    children: React.ReactNode
    isOpen: boolean
    onClose?: () => void
    title?: string
  }) =>
    isOpen ? (
      <div data-testid="modal">
        {title && <h2>{title}</h2>}
        {children}
      </div>
    ) : null,
  AnimatedCounter: ({
    value,
    className,
  }: {
    value: number
    className?: string
  }) => (
    <span data-testid="animated-counter" className={className}>
      {value}
    </span>
  ),
}))

vi.mock('@/components/auth/PasswordStrengthIndicator', () => ({
  PasswordStrengthIndicator: () => <div data-testid="password-strength" />,
}))

vi.mock('@/components/profile/AvatarUpload', () => ({
  AvatarUpload: () => <div data-testid="avatar-upload" />,
}))

vi.mock('@/components/onboarding', () => ({
  OnboardingWizard: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="onboarding-wizard" /> : null,
}))

// ---------------------------------------------------------------------------
// Mocks: hooks
// ---------------------------------------------------------------------------
vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({
    data: {
      id: 'user-123',
      display_name: 'Test User',
      gender: null,
      avatar_url: null,
      selected_plan_id: '00000000-0000-0000-0000-000000000001',
      current_cycle_day: 1,
      last_workout_date: null,
      cycle_start_date: '2024-01-01',
      timezone: 'America/New_York',
      created_at: '',
      updated_at: '',
    },
    isLoading: false,
  }),
  useUpdateProfile: () => ({
    mutate: mockUpdateProfile,
    mutateAsync: mockUpdateProfileAsync,
    isPending: false,
  }),
}))

vi.mock('@/hooks/useCycleDay', () => ({
  useCycleDay: () => 3,
}))

vi.mock('@/hooks/useSchedule', () => ({
  useClearSchedule: () => ({ mutateAsync: mockClearSchedule }),
}))

vi.mock('@/hooks/useWorkoutSession', () => ({
  useUserSessions: () => ({
    data: [
      {
        id: 'session-1',
        completed_at: '2024-06-01T10:00:00Z',
        workout_day: { name: 'Push' },
      },
      {
        id: 'session-2',
        completed_at: '2024-06-02T10:00:00Z',
        workout_day: { name: 'Pull' },
      },
      {
        id: 'session-3',
        completed_at: '2024-06-03T10:00:00Z',
        workout_day: { name: 'Push' },
      },
      {
        id: 'session-4',
        completed_at: '2024-06-05T10:00:00Z',
        workout_day: { name: 'Legs' },
      },
      {
        id: 'session-5',
        completed_at: null,
        workout_day: { name: 'Push' },
      },
    ],
  }),
}))

vi.mock('@/hooks/useTemplateWorkout', () => ({
  useUserTemplateWorkouts: () => ({
    data: [
      {
        id: 'tmpl-1',
        completed_at: '2024-06-04T10:00:00Z',
        template: { name: 'Morning Run' },
      },
    ],
  }),
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockShowError,
  }),
}))

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'system',
    setTheme: mockSetTheme,
  }),
}))

// ---------------------------------------------------------------------------
// Mocks: stores
// ---------------------------------------------------------------------------
vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      user: { id: 'user-123', email: 'test@example.com' },
      updatePassword: mockUpdatePassword,
      updateEmail: mockUpdateEmail,
      signOut: mockSignOut,
      signOutAllDevices: mockSignOutAllDevices,
    }
    return typeof selector === 'function' ? selector(state) : state
  },
}))

// ---------------------------------------------------------------------------
// Mocks: utils / services / config
// ---------------------------------------------------------------------------
vi.mock('@/utils/cycleDay', () => ({
  formatCycleStartDate: () => 'Jan 1, 2024',
}))

vi.mock('@/utils/validation', () => ({
  validatePassword: (password: string) => {
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*]/.test(password)
    const minLen = password.length >= 8
    const valid = hasUpper && hasLower && hasNumber && hasSpecial && minLen
    return {
      valid,
      errors: valid ? [] : ['Password does not meet requirements'],
      strength: valid ? 'strong' : 'weak',
      checks: {
        minLength: minLen,
        hasUppercase: hasUpper,
        hasLowercase: hasLower,
        hasNumber,
        hasSpecialChar: hasSpecial,
      },
    }
  },
}))

vi.mock('@/services/profileService', () => ({
  deleteUserAccount: (...args: unknown[]) => mockDeleteUserAccount(...args),
}))

vi.mock('@/config/workoutConfig', () => ({
  getWorkoutDisplayName: (name: string | null | undefined) => name || 'Workout',
}))

// ---------------------------------------------------------------------------
// Lucide icons: render as simple spans so text is visible
// ---------------------------------------------------------------------------
vi.mock('lucide-react', () => {
  const icon = () => <span />
  return {
    Calendar: icon,
    Shield: icon,
    Mail: icon,
    ChevronDown: icon,
    ChevronUp: icon,
    LogOut: icon,
    Sun: icon,
    Moon: icon,
    Monitor: icon,
    Dumbbell: icon,
    Trophy: icon,
    Flame: icon,
    Star: icon,
  }
})

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.clearAllMocks()
})

// ===== 1. Profile save flow =====
describe('ProfilePage - Profile Save Flow', () => {
  it('calls updateProfile with correct data structure on Save Changes', async () => {
    const user = userEvent.setup()
    mockUpdateProfile.mockImplementation(
      (_data: unknown, opts: { onSuccess?: () => void }) => {
        opts?.onSuccess?.()
      },
    )

    render(<ProfilePage />)

    // Verify the initial display name is populated from profile
    const nameInput = screen.getByPlaceholderText('Enter your name') as HTMLInputElement
    expect(nameInput.value).toBe('Test User')

    // Click Save Changes - should send current state values
    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveBtn)

    // updateProfile is called with the current display_name and gender values,
    // plus onSuccess and onError callbacks
    expect(mockUpdateProfile).toHaveBeenCalledTimes(1)
    const [data, callbacks] = mockUpdateProfile.mock.calls[0]
    expect(data).toHaveProperty('display_name')
    expect(data).toHaveProperty('gender')
    expect(callbacks).toHaveProperty('onSuccess')
    expect(callbacks).toHaveProperty('onError')
  })

  it('pre-populates form with profile data and saves current state', async () => {
    const user = userEvent.setup()

    render(<ProfilePage />)

    // The form is pre-populated from the profile data via useEffect
    const nameInput = screen.getByPlaceholderText('Enter your name') as HTMLInputElement
    expect(nameInput.value).toBe('Test User')

    // Gender defaults to '' (Select gender) since profile.gender is null
    const genderSelect = screen.getByDisplayValue('Select gender')
    expect(genderSelect).toBeInTheDocument()

    // Click Save - sends the current form state
    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveBtn)

    expect(mockUpdateProfile).toHaveBeenCalledTimes(1)
    const [data] = mockUpdateProfile.mock.calls[0]
    // display_name is 'Test User' from the populated profile
    expect(data.display_name).toBe('Test User')
    // gender state is '' so ('' || null) = null
    expect(data.gender).toBeNull()
  })

  it('shows "Saved!" text temporarily after successful save', async () => {
    const user = userEvent.setup()
    mockUpdateProfile.mockImplementation(
      (_data: unknown, opts: { onSuccess?: () => void }) => {
        opts?.onSuccess?.()
      },
    )

    render(<ProfilePage />)

    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveBtn)

    expect(screen.getByText('Saved!')).toBeInTheDocument()
    expect(mockSuccess).toHaveBeenCalledWith('Profile saved')
  })

  it('shows error toast when save fails', async () => {
    const user = userEvent.setup()
    mockUpdateProfile.mockImplementation(
      (_data: unknown, opts: { onError?: () => void }) => {
        opts?.onError?.()
      },
    )

    render(<ProfilePage />)

    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveBtn)

    expect(mockShowError).toHaveBeenCalledWith('Failed to save profile')
  })
})

// ===== 2. Password change flow =====
describe('ProfilePage - Password Change Flow', () => {
  async function expandSecurity() {
    const user = userEvent.setup()
    render(<ProfilePage />)
    const securityBtn = screen.getByText('Security')
    await user.click(securityBtn)
    return user
  }

  it('calls updatePassword with the new password on success', async () => {
    const user = await expandSecurity()
    mockUpdatePassword.mockResolvedValue(undefined)

    const pwInput = screen.getByPlaceholderText('Enter new password')
    const confirmInput = screen.getByPlaceholderText('Confirm new password')

    await user.type(pwInput, 'Str0ng!Pass')
    await user.type(confirmInput, 'Str0ng!Pass')

    const updateBtn = screen.getByRole('button', { name: /update password/i })
    await user.click(updateBtn)

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith('Str0ng!Pass')
    })
    expect(mockSuccess).toHaveBeenCalledWith('Password updated successfully')
  })

  it('shows error when passwords do not match', async () => {
    const user = await expandSecurity()

    const pwInput = screen.getByPlaceholderText('Enter new password')
    const confirmInput = screen.getByPlaceholderText('Confirm new password')

    await user.type(pwInput, 'Str0ng!Pass')
    await user.type(confirmInput, 'Different1!')

    const updateBtn = screen.getByRole('button', { name: /update password/i })
    await user.click(updateBtn)

    expect(mockShowError).toHaveBeenCalledWith('Passwords do not match')
    expect(mockUpdatePassword).not.toHaveBeenCalled()
  })

  it('shows error when password is empty', async () => {
    const user = await expandSecurity()

    // The Update Password button should be disabled when fields are empty
    const updateBtn = screen.getByRole('button', {
      name: /update password/i,
    })
    expect(updateBtn).toBeDisabled()

    // Type only in confirm - password still empty
    const confirmInput = screen.getByPlaceholderText('Confirm new password')
    await user.type(confirmInput, 'something')

    // Button is still disabled because password field is empty
    expect(updateBtn).toBeDisabled()
  })

  it('shows error when password is weak (does not meet requirements)', async () => {
    const user = await expandSecurity()

    const pwInput = screen.getByPlaceholderText('Enter new password')
    const confirmInput = screen.getByPlaceholderText('Confirm new password')

    await user.type(pwInput, 'weak')
    await user.type(confirmInput, 'weak')

    const updateBtn = screen.getByRole('button', { name: /update password/i })
    await user.click(updateBtn)

    expect(mockShowError).toHaveBeenCalledWith(
      'Password does not meet requirements',
    )
    expect(mockUpdatePassword).not.toHaveBeenCalled()
  })

  it('shows error toast when updatePassword rejects', async () => {
    const user = await expandSecurity()
    mockUpdatePassword.mockRejectedValue(new Error('Server failure'))

    const pwInput = screen.getByPlaceholderText('Enter new password')
    const confirmInput = screen.getByPlaceholderText('Confirm new password')

    await user.type(pwInput, 'Str0ng!Pass')
    await user.type(confirmInput, 'Str0ng!Pass')

    const updateBtn = screen.getByRole('button', { name: /update password/i })
    await user.click(updateBtn)

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Server failure')
    })
  })
})

// ===== 3. Email change flow =====
describe('ProfilePage - Email Change Flow', () => {
  async function expandEmail() {
    const user = userEvent.setup()
    render(<ProfilePage />)
    const emailBtn = screen.getByText('Email')
    await user.click(emailBtn)
    return user
  }

  it('calls updateEmail with the new email on success', async () => {
    const user = await expandEmail()
    mockUpdateEmail.mockResolvedValue(undefined)

    const emailInput = screen.getByPlaceholderText('Enter new email address')
    await user.type(emailInput, 'new@example.com')

    const updateBtn = screen.getByRole('button', { name: /update email/i })
    await user.click(updateBtn)

    await waitFor(() => {
      expect(mockUpdateEmail).toHaveBeenCalledWith('new@example.com')
    })
    expect(mockSuccess).toHaveBeenCalledWith(
      'Confirmation email sent! Check your new email to confirm the change.',
    )
  })

  it('shows error for invalid email format', async () => {
    const user = await expandEmail()

    const emailInput = screen.getByPlaceholderText('Enter new email address')
    await user.type(emailInput, 'not-an-email')

    const updateBtn = screen.getByRole('button', { name: /update email/i })
    await user.click(updateBtn)

    expect(mockShowError).toHaveBeenCalledWith(
      'Please enter a valid email address',
    )
    expect(mockUpdateEmail).not.toHaveBeenCalled()
  })

  it('shows error when new email is the same as current email', async () => {
    const user = await expandEmail()

    const emailInput = screen.getByPlaceholderText('Enter new email address')
    await user.type(emailInput, 'test@example.com')

    const updateBtn = screen.getByRole('button', { name: /update email/i })
    await user.click(updateBtn)

    expect(mockShowError).toHaveBeenCalledWith(
      'New email must be different from current email',
    )
    expect(mockUpdateEmail).not.toHaveBeenCalled()
  })

  it('shows error toast when updateEmail rejects', async () => {
    const user = await expandEmail()
    mockUpdateEmail.mockRejectedValue(new Error('Email change failed'))

    const emailInput = screen.getByPlaceholderText('Enter new email address')
    await user.type(emailInput, 'valid@other.com')

    const updateBtn = screen.getByRole('button', { name: /update email/i })
    await user.click(updateBtn)

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Email change failed')
    })
  })

  it('disables Update Email button when email field is empty', async () => {
    await expandEmail()

    const updateBtn = screen.getByRole('button', { name: /update email/i })
    expect(updateBtn).toBeDisabled()
  })
})

// ===== 4. Theme switching =====
describe('ProfilePage - Theme Switching', () => {
  it('calls setTheme("light") when Light button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)

    await user.click(screen.getByText('Light'))
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('calls setTheme("dark") when Dark button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)

    await user.click(screen.getByText('Dark'))
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('calls setTheme("system") when System button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)

    await user.click(screen.getByText('System'))
    expect(mockSetTheme).toHaveBeenCalledWith('system')
  })
})

// ===== 5. Workout split change =====
describe('ProfilePage - Workout Split Change', () => {
  it('shows confirmation modal and calls updateProfileAsync + clearSchedule on confirm', async () => {
    const user = userEvent.setup()
    mockUpdateProfileAsync.mockResolvedValue({})
    mockClearSchedule.mockResolvedValue(undefined)

    render(<ProfilePage />)

    await user.click(screen.getByText('Upper/Lower'))

    await waitFor(() => {
      expect(screen.getByText('Change Workout Split')).toBeInTheDocument()
    })

    const changeSplitBtn = screen.getByRole('button', {
      name: /change split/i,
    })
    await user.click(changeSplitBtn)

    await waitFor(() => {
      expect(mockUpdateProfileAsync).toHaveBeenCalledWith({
        selected_plan_id: '00000000-0000-0000-0000-000000000002',
      })
    })
    expect(mockClearSchedule).toHaveBeenCalled()
  })

  it('does not call anything when clicking the already-selected split', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)

    // PPL is already selected, clicking it again should be a no-op
    await user.click(screen.getByText('Push/Pull/Legs'))

    // Modal should not appear
    expect(
      screen.queryByText('Change Workout Split'),
    ).not.toBeInTheDocument()
    expect(mockUpdateProfileAsync).not.toHaveBeenCalled()
  })

  it('shows error toast when split change fails and does not clear schedule', async () => {
    const user = userEvent.setup()
    mockUpdateProfileAsync.mockRejectedValue(new Error('Server error'))

    render(<ProfilePage />)

    await user.click(screen.getByText('Upper/Lower'))

    await waitFor(() => {
      expect(screen.getByText('Change Workout Split')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /change split/i }))

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Failed to change workout split. Please try again.',
      )
    })
    expect(mockClearSchedule).not.toHaveBeenCalled()
  })

  it('opens onboarding wizard after successful split change', async () => {
    const user = userEvent.setup()
    mockUpdateProfileAsync.mockResolvedValue({})
    mockClearSchedule.mockResolvedValue(undefined)

    render(<ProfilePage />)

    await user.click(screen.getByText('Upper/Lower'))

    await waitFor(() => {
      expect(screen.getByText('Change Workout Split')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /change split/i }))

    await waitFor(() => {
      expect(screen.getByTestId('onboarding-wizard')).toBeInTheDocument()
    })
  })
})

// ===== 6. Delete account flow =====
describe('ProfilePage - Delete Account Flow', () => {
  async function openDeleteModal() {
    const user = userEvent.setup()
    render(<ProfilePage />)

    // Expand security section
    await user.click(screen.getByText('Security'))

    // Click "Delete Account" text link in the security section (it's a plain
    // button styled as a link, not the modal's button)
    const deleteLink = screen.getByRole('button', { name: 'Delete Account' })
    await user.click(deleteLink)

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    return user
  }

  it('calls deleteUserAccount and signOut after typing DELETE and confirming', async () => {
    const user = await openDeleteModal()
    mockDeleteUserAccount.mockResolvedValue(undefined)
    mockSignOut.mockResolvedValue(undefined)

    const modal = screen.getByTestId('modal')

    const confirmInput = within(modal).getByPlaceholderText('Type DELETE')
    await user.type(confirmInput, 'DELETE')

    // Find the danger Delete Account button inside the modal
    const deleteBtn = within(modal).getByRole('button', {
      name: /delete account/i,
    })
    await user.click(deleteBtn)

    await waitFor(() => {
      expect(mockDeleteUserAccount).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  it('disables Delete Account button when DELETE is not typed correctly', async () => {
    const user = await openDeleteModal()

    const modal = screen.getByTestId('modal')

    const confirmInput = within(modal).getByPlaceholderText('Type DELETE')
    await user.type(confirmInput, 'WRONG')

    // The delete button should be disabled because input !== "DELETE"
    const deleteBtn = within(modal).getByRole('button', {
      name: /delete account/i,
    })
    expect(deleteBtn).toBeDisabled()
  })

  it('shows error toast when deleteUserAccount fails', async () => {
    const user = await openDeleteModal()
    mockDeleteUserAccount.mockRejectedValue(new Error('Deletion failed'))

    const modal = screen.getByTestId('modal')

    const confirmInput = within(modal).getByPlaceholderText('Type DELETE')
    await user.type(confirmInput, 'DELETE')

    const deleteBtn = within(modal).getByRole('button', {
      name: /delete account/i,
    })
    await user.click(deleteBtn)

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Deletion failed')
    })
    expect(mockSignOut).not.toHaveBeenCalled()
  })
})

// ===== 7. Sign out =====
describe('ProfilePage - Sign Out', () => {
  it('calls signOut when Log Out button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)

    const logOutBtn = screen.getByRole('button', { name: /log out/i })
    await user.click(logOutBtn)

    expect(mockSignOut).toHaveBeenCalled()
  })
})

// ===== 8. Lifetime stats display =====
describe('ProfilePage - Lifetime Stats Display', () => {
  it('displays totalWorkouts count correctly', () => {
    render(<ProfilePage />)

    // 5 completed sessions total:
    //   weight: session-1 (June 1), session-2 (June 2), session-3 (June 3), session-4 (June 5)
    //   template: tmpl-1 (June 4)
    //   session-5 has completed_at: null so it is excluded
    const counters = screen.getAllByTestId('animated-counter')
    // The first counter is Total, the second is Best Streak
    expect(counters[0]).toHaveTextContent('5')
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('displays longestStreak correctly', () => {
    render(<ProfilePage />)

    // Completed sessions on: June 1, 2, 3, 4, 5 (5 consecutive days)
    // Longest streak = 5
    const counters = screen.getAllByTestId('animated-counter')
    // Second counter is Best Streak
    expect(counters[1]).toHaveTextContent('5')
    expect(screen.getByText('Best Streak')).toBeInTheDocument()
  })

  it('displays favoriteType correctly', () => {
    render(<ProfilePage />)

    // Push appears 2 times (session 1 & 3), Pull 1, Legs 1, Morning Run 1
    // Favorite = Push
    expect(screen.getByText('Push')).toBeInTheDocument()
    expect(screen.getByText('Favorite')).toBeInTheDocument()
  })
})
