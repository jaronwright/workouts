import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { OnboardingWizard } from '../OnboardingWizard'

// Mock all hooks used by OnboardingWizard
const mockUpdateProfile = vi.fn()
const mockUploadAvatar = vi.fn()
const mockSaveWorkouts = vi.fn()
const mockClearSchedule = vi.fn()

vi.mock('@/hooks/useSchedule', () => ({
  useWorkoutTemplates: () => ({ data: [] }),
  useSaveScheduleDayWorkouts: () => ({ mutateAsync: mockSaveWorkouts, isPending: false }),
  useClearSchedule: () => ({ mutateAsync: mockClearSchedule }),
}))

vi.mock('@/hooks/useWorkoutPlan', () => ({
  useWorkoutPlans: () => ({ data: [] }),
  useWorkoutDays: () => ({ data: [] }),
}))

vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({ data: { display_name: '', selected_plan_id: null } }),
  useUpdateProfile: () => ({ mutateAsync: mockUpdateProfile }),
}))

vi.mock('@/hooks/useAvatar', () => ({
  useUploadAvatar: () => ({ mutateAsync: mockUploadAvatar }),
}))

describe('OnboardingWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state on Continue button during profile save', async () => {
    const user = userEvent.setup()
    // Make updateProfile hang so we can observe the loading state
    let resolveUpdate!: () => void
    mockUpdateProfile.mockImplementation(() => new Promise<void>(r => { resolveUpdate = r }))

    render(<OnboardingWizard isOpen={true} onClose={() => {}} />)

    const input = screen.getByPlaceholderText('Your name')
    await user.type(input, 'Test User')

    const continueBtn = screen.getByRole('button', { name: /continue/i })
    expect(continueBtn).not.toBeDisabled()

    await user.click(continueBtn)

    // While saving, button should be disabled (loading prop disables it)
    expect(continueBtn).toBeDisabled()

    // Resolve the promise
    resolveUpdate()

    // After resolving, step 2 should appear
    await waitFor(() => {
      expect(screen.getByText(/choose your training split/i)).toBeInTheDocument()
    })
  })

  it('shows error and re-enables button when profile save fails', async () => {
    const user = userEvent.setup()
    mockUpdateProfile.mockRejectedValue(new Error('Network error'))

    render(<OnboardingWizard isOpen={true} onClose={() => {}} />)

    const input = screen.getByPlaceholderText('Your name')
    await user.type(input, 'Test User')

    const continueBtn = screen.getByRole('button', { name: /continue/i })
    await user.click(continueBtn)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    // Button should be re-enabled after error
    expect(continueBtn).not.toBeDisabled()
  })

  it('advances to step 2 on successful profile save', async () => {
    const user = userEvent.setup()
    mockUpdateProfile.mockResolvedValue({})

    render(<OnboardingWizard isOpen={true} onClose={() => {}} />)

    const input = screen.getByPlaceholderText('Your name')
    await user.type(input, 'Test User')

    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByText(/choose your training split/i)).toBeInTheDocument()
    })
  })
})
