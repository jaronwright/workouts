import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { ProfilePage } from '../Profile'

const mockUpdateProfile = vi.fn()
const mockUpdateProfileAsync = vi.fn()
const mockClearSchedule = vi.fn()
const mockSignOut = vi.fn()
const mockSuccess = vi.fn()
const mockShowError = vi.fn()

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      user: { id: 'user-123', email: 'test@example.com' },
      updatePassword: vi.fn(),
      updateEmail: vi.fn(),
      signOut: mockSignOut,
      signOutAllDevices: vi.fn(),
    }
    return typeof selector === 'function' ? selector(state) : state
  },
}))

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

vi.mock('@/utils/cycleDay', () => ({
  formatCycleStartDate: () => 'Jan 1, 2024',
}))

vi.mock('@/hooks/useSchedule', () => ({
  useClearSchedule: () => ({ mutateAsync: mockClearSchedule }),
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
    setTheme: vi.fn(),
  }),
}))

vi.mock('@/services/profileService', () => ({
  deleteUserAccount: vi.fn(),
}))

vi.mock('@/components/profile/AvatarUpload', () => ({
  AvatarUpload: () => <div data-testid="avatar-upload" />,
}))

vi.mock('@/components/onboarding', () => ({
  OnboardingWizard: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="onboarding-wizard" /> : null,
}))

describe('ProfilePage - Split Change', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls mutateAsync when confirming split change', async () => {
    const user = userEvent.setup()
    mockUpdateProfileAsync.mockResolvedValue({})
    mockClearSchedule.mockResolvedValue(undefined)

    render(<ProfilePage />)

    // Click Upper/Lower split button to trigger change
    const upperLowerBtn = screen.getByText('Upper/Lower')
    await user.click(upperLowerBtn)

    // Confirmation modal should appear
    await waitFor(() => {
      expect(screen.getByText('Change Workout Split')).toBeInTheDocument()
    })

    // Click "Change Split" button
    const changeSplitBtn = screen.getByRole('button', { name: /change split/i })
    await user.click(changeSplitBtn)

    await waitFor(() => {
      expect(mockUpdateProfileAsync).toHaveBeenCalledWith({
        selected_plan_id: '00000000-0000-0000-0000-000000000002',
      })
    })

    expect(mockClearSchedule).toHaveBeenCalled()
  })

  it('shows error toast when split change fails', async () => {
    const user = userEvent.setup()
    mockUpdateProfileAsync.mockRejectedValue(new Error('Server error'))

    render(<ProfilePage />)

    // Click Upper/Lower split button
    await user.click(screen.getByText('Upper/Lower'))

    await waitFor(() => {
      expect(screen.getByText('Change Workout Split')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /change split/i }))

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Failed to change workout split')
    })

    // clearSchedule should NOT have been called since updateProfile failed
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
