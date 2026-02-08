import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import { HomePage } from '../Home'

// Track navigate calls
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// Configurable mock return values
let mockSessions: Record<string, unknown>[] = []
let mockTemplateSessions: Record<string, unknown>[] = []
let mockProfile: Record<string, unknown> | null = null
let mockProfileLoading = false
let mockSchedule: Record<string, unknown>[] = []
let mockDays: Record<string, unknown>[] = []
let mockCardioTemplates: Record<string, unknown>[] = []
let mockMobilityTemplates: Record<string, unknown>[] = []
let mockActiveSession: Record<string, unknown> | null = null

vi.mock('@/hooks/useWorkoutSession', () => ({
  useActiveSession: () => ({ data: mockActiveSession }),
  useUserSessions: () => ({ data: mockSessions, isLoading: false }),
  useDeleteSession: () => ({ mutate: vi.fn() }),
}))

vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({ data: mockProfile, isLoading: mockProfileLoading }),
  useUpdateProfile: () => ({ mutateAsync: vi.fn() }),
}))

vi.mock('@/hooks/useCycleDay', () => ({
  useCycleDay: () => 1,
}))

vi.mock('@/hooks/useAvatar', () => ({
  useAvatarUrl: () => null,
}))

vi.mock('@/hooks/useWorkoutPlan', () => ({
  useSelectedPlanDays: () => ({ data: mockDays, isLoading: false }),
}))

vi.mock('@/hooks/useSchedule', () => ({
  useWorkoutTemplatesByType: (type: string) => {
    if (type === 'cardio') return { data: mockCardioTemplates, isLoading: false }
    return { data: mockMobilityTemplates, isLoading: false }
  },
  useUserSchedule: () => ({ data: mockSchedule, isLoading: false }),
}))

vi.mock('@/hooks/useTemplateWorkout', () => ({
  useUserTemplateWorkouts: () => ({ data: mockTemplateSessions }),
}))

vi.mock('@/components/workout', () => ({
  CardioLogCard: () => <div data-testid="cardio-log-card" />,
  ScheduleWidget: () => <div data-testid="schedule-widget" />,
}))

vi.mock('@/components/onboarding', () => ({
  OnboardingWizard: () => null,
}))

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessions = []
    mockTemplateSessions = []
    mockProfile = {
      id: 'user-123',
      display_name: 'Jaron',
      gender: null,
      avatar_url: null,
      selected_plan_id: '00000000-0000-0000-0000-000000000001',
      cycle_start_date: '2024-01-01',
      timezone: 'America/Chicago',
      created_at: '',
      updated_at: '',
    }
    mockProfileLoading = false
    mockSchedule = [{ id: 's1', day_number: 1 }]
    mockDays = []
    mockCardioTemplates = []
    mockMobilityTemplates = []
    mockActiveSession = null
  })

  describe('Greeting', () => {
    it('shows user display name in greeting', () => {
      render(<HomePage />)
      expect(screen.getByText(/Jaron!/)).toBeInTheDocument()
    })

    it('shows loading skeleton when profile is loading', () => {
      mockProfileLoading = true
      mockProfile = null
      const { container } = render(<HomePage />)
      // Should show a skeleton placeholder, not "there!"
      expect(screen.queryByText(/there!/)).not.toBeInTheDocument()
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('shows fallback "there" when profile has no display name', () => {
      mockProfile = { ...mockProfile!, display_name: null }
      render(<HomePage />)
      expect(screen.getByText(/there!/)).toBeInTheDocument()
    })
  })

  describe('Quick Stats with merged sessions', () => {
    it('counts weights-only sessions in total', () => {
      mockSessions = [
        { id: '1', completed_at: new Date().toISOString(), started_at: new Date().toISOString(), workout_day: null },
        { id: '2', completed_at: new Date().toISOString(), started_at: new Date().toISOString(), workout_day: null },
      ]
      render(<HomePage />)
      // Total should show "2"
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('counts template sessions in total', () => {
      mockTemplateSessions = [
        { id: 't1', completed_at: new Date().toISOString(), started_at: new Date().toISOString(), template: { name: 'Running' } },
        { id: 't2', completed_at: new Date().toISOString(), started_at: new Date().toISOString(), template: { name: 'Swimming' } },
      ]
      render(<HomePage />)
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('merges weights + template sessions in total count', () => {
      mockSessions = [
        { id: '1', completed_at: new Date().toISOString(), started_at: new Date().toISOString(), workout_day: null },
      ]
      mockTemplateSessions = [
        { id: 't1', completed_at: new Date().toISOString(), started_at: new Date().toISOString(), template: { name: 'Running' } },
      ]
      render(<HomePage />)
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('shows zero stats when no sessions', () => {
      render(<HomePage />)
      const zeros = screen.getAllByText('0')
      // Streak, This Week, and Total should all be 0
      expect(zeros.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Recent Activity', () => {
    it('shows weights sessions in recent activity', () => {
      mockSessions = [
        {
          id: 'w1',
          completed_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          workout_day: { name: 'Push (Chest, Shoulders, Triceps)' },
        },
      ]
      render(<HomePage />)
      expect(screen.getByText('Push')).toBeInTheDocument()
    })

    it('shows template sessions in recent activity', () => {
      mockTemplateSessions = [
        {
          id: 't1',
          completed_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          template: { name: 'Morning Run' },
        },
      ]
      render(<HomePage />)
      expect(screen.getByText('Morning Run')).toBeInTheDocument()
    })

    it('sorts mixed sessions by most recent first', () => {
      const now = Date.now()
      mockSessions = [
        {
          id: 'w1',
          completed_at: new Date(now - 60000).toISOString(),
          started_at: new Date(now - 120000).toISOString(),
          workout_day: { name: 'Push (Chest, Shoulders, Triceps)' },
        },
      ]
      mockTemplateSessions = [
        {
          id: 't1',
          completed_at: new Date(now).toISOString(),
          started_at: new Date(now - 30000).toISOString(),
          template: { name: 'Morning Run' },
        },
      ]
      render(<HomePage />)
      const items = screen.getAllByText(/Push|Morning Run/)
      // Morning Run (more recent) should appear before Push
      expect(items[0].textContent).toBe('Morning Run')
      expect(items[1].textContent).toBe('Push')
    })

    it('limits recent activity to 3 items', () => {
      const now = Date.now()
      mockSessions = Array.from({ length: 5 }, (_, i) => ({
        id: `w${i}`,
        completed_at: new Date(now - i * 60000).toISOString(),
        started_at: new Date(now - i * 60000 - 30000).toISOString(),
        workout_day: { name: `Push (Chest, Shoulders, Triceps)` },
      }))
      render(<HomePage />)
      const doneLabels = screen.getAllByText('Done')
      expect(doneLabels.length).toBe(3)
    })
  })

  describe('Mobility routing', () => {
    it('renders mobility templates with correct click handler', async () => {
      const userEvent = (await import('@testing-library/user-event')).default
      mockMobilityTemplates = [
        {
          id: 'mob-1',
          name: 'Hip Flow',
          type: 'mobility',
          category: 'hip_knee_ankle',
          workout_day_id: 'day-1', // Should be IGNORED for mobility
          duration_minutes: 15,
          created_at: '2024-01-01',
        },
      ]
      render(<HomePage />)

      // Open the Mobility section first
      const mobilityButton = screen.getByText('Mobility')
      await userEvent.click(mobilityButton)

      // Click the Hip Flow template
      const template = screen.getByText('Hip Flow')
      await userEvent.click(template)

      // Should navigate to /mobility/mob-1, NOT /workout/day-1
      expect(mockNavigate).toHaveBeenCalledWith('/mobility/mob-1')
    })
  })

  describe('Active session banner', () => {
    it('shows continue button when there is an active session', () => {
      mockActiveSession = {
        id: 'session-1',
        workout_day_id: 'day-1',
        workout_day: { name: 'Push (Chest, Shoulders, Triceps)' },
      }
      render(<HomePage />)
      expect(screen.getByText('Continue')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })
  })
})
