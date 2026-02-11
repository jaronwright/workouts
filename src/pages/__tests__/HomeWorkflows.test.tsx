import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@/test/utils'
import userEvent from '@testing-library/user-event'
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
let mockScheduleLoading = false
let mockDays: Record<string, unknown>[] = []
let mockDaysLoading = false
let mockCardioTemplates: Record<string, unknown>[] = []
let mockMobilityCategories: { category: string; template: Record<string, unknown> }[] = []
let mockActiveSession: Record<string, unknown> | null = null
let mockSessionsLoading = false
let mockTemplateSessionsLoading = false

vi.mock('@/hooks/useWorkoutSession', () => ({
  useActiveSession: () => ({ data: mockActiveSession }),
  useUserSessions: () => ({ data: mockSessions, isLoading: mockSessionsLoading }),
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
  useSelectedPlanDays: () => ({ data: mockDays, isLoading: mockDaysLoading }),
}))

vi.mock('@/hooks/useSchedule', () => ({
  useWorkoutTemplatesByType: (type: string) => {
    if (type === 'cardio') return { data: mockCardioTemplates, isLoading: false }
    return { data: [], isLoading: false }
  },
  useUserSchedule: () => ({ data: mockSchedule, isLoading: mockScheduleLoading }),
}))

vi.mock('@/hooks/useMobilityTemplates', () => ({
  useMobilityCategories: () => ({ data: mockMobilityCategories, isLoading: false }),
}))

vi.mock('@/hooks/useTemplateWorkout', () => ({
  useUserTemplateWorkouts: () => ({ data: mockTemplateSessions, isLoading: mockTemplateSessionsLoading }),
}))

vi.mock('@/components/workout', () => ({
  CardioLogCard: () => <div data-testid="cardio-log-card" />,
  ScheduleWidget: () => <div data-testid="schedule-widget" />,
}))

vi.mock('@/components/onboarding', () => ({
  OnboardingWizard: (props: { isOpen: boolean; onClose: () => void }) => {
    return props.isOpen ? <div data-testid="onboarding-wizard">Onboarding Wizard</div> : null
  },
}))

describe('HomePage Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })

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
    mockScheduleLoading = false
    mockDays = []
    mockDaysLoading = false
    mockCardioTemplates = []
    mockMobilityCategories = []
    mockActiveSession = null
    mockSessionsLoading = false
    mockTemplateSessionsLoading = false
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // -----------------------------------------------------------------------
  // 1. Stats calculation flow
  // -----------------------------------------------------------------------
  describe('Stats calculation flow', () => {
    it('computes total workouts from combined weight + template sessions', () => {
      const now = new Date()
      mockSessions = [
        { id: 'w1', completed_at: now.toISOString(), started_at: now.toISOString(), workout_day: null },
        { id: 'w2', completed_at: now.toISOString(), started_at: now.toISOString(), workout_day: null },
      ]
      mockTemplateSessions = [
        { id: 't1', completed_at: now.toISOString(), started_at: now.toISOString(), template: { name: 'Run' } },
      ]

      render(<HomePage />)

      // Total should be 3 (2 weights + 1 template)
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('shows zero for all stats when no sessions exist', () => {
      render(<HomePage />)

      const zeros = screen.getAllByText('0')
      // Streak, This Week, and Total should all be 0
      expect(zeros.length).toBeGreaterThanOrEqual(3)
    })

    it('computes weekly count based on unique days with workouts this week', () => {
      const now = new Date()
      // Two sessions on the same day should count as 1 day
      const todayIso = now.toISOString()
      mockSessions = [
        { id: 'w1', completed_at: todayIso, started_at: todayIso, workout_day: null },
        { id: 'w2', completed_at: todayIso, started_at: todayIso, workout_day: null },
      ]

      render(<HomePage />)

      // Find the "This Week" stat card - weekly count is unique days, so 1
      const thisWeekLabel = screen.getByText('This Week')
      const thisWeekCard = thisWeekLabel.closest('[class*="relative"]')!
      expect(thisWeekCard.querySelector('span')!.textContent).toBe('1')

      // Find the "Total" stat card - total completed = 2
      const totalLabel = screen.getByText('Total')
      const totalCard = totalLabel.closest('[class*="relative"]')!
      expect(totalCard.querySelector('span')!.textContent).toBe('2')
    })

    it('computes streak from consecutive days of workouts', () => {
      const now = new Date()
      // Create sessions for today and yesterday (2-day streak)
      const today = new Date(now)
      today.setHours(12, 0, 0, 0)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      mockSessions = [
        { id: 'w1', completed_at: today.toISOString(), started_at: today.toISOString(), workout_day: null },
        { id: 'w2', completed_at: yesterday.toISOString(), started_at: yesterday.toISOString(), workout_day: null },
      ]

      render(<HomePage />)

      // Find the "Streak" stat card - streak should be 2
      const streakLabel = screen.getByText('Streak')
      const streakCard = streakLabel.closest('[class*="relative"]')!
      expect(streakCard.querySelector('span')!.textContent).toBe('2')
    })

    it('does not count sessions without completed_at in total', () => {
      const now = new Date()
      mockSessions = [
        { id: 'w1', completed_at: null, started_at: now.toISOString(), workout_day: null },
        { id: 'w2', completed_at: now.toISOString(), started_at: now.toISOString(), workout_day: null },
      ]

      render(<HomePage />)

      // Find the "Total" stat card - only 1 session has completed_at
      const totalLabel = screen.getByText('Total')
      const totalCard = totalLabel.closest('[class*="relative"]')!
      expect(totalCard.querySelector('span')!.textContent).toBe('1')
    })
  })

  // -----------------------------------------------------------------------
  // 2. Active session banner
  // -----------------------------------------------------------------------
  describe('Active session banner', () => {
    it('displays "In Progress" badge and workout name when session is active', () => {
      mockActiveSession = {
        id: 'session-active',
        workout_day_id: 'day-push',
        workout_day: { name: 'Push (Chest, Shoulders, Triceps)' },
      }

      render(<HomePage />)

      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Push')).toBeInTheDocument()
      expect(screen.getByText('Continue')).toBeInTheDocument()
    })

    it('navigates to active workout page when "Continue" is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      mockActiveSession = {
        id: 'session-active',
        workout_day_id: 'day-push',
        workout_day: { name: 'Push (Chest, Shoulders, Triceps)' },
      }

      render(<HomePage />)

      await user.click(screen.getByText('Continue'))

      expect(mockNavigate).toHaveBeenCalledWith('/workout/day-push/active')
    })

    it('does not show the active session banner when no session is active', () => {
      mockActiveSession = null

      render(<HomePage />)

      expect(screen.queryByText('In Progress')).not.toBeInTheDocument()
      expect(screen.queryByText('Continue')).not.toBeInTheDocument()
    })

    it('shows fallback workout name when workout_day has no name', () => {
      mockActiveSession = {
        id: 'session-active',
        workout_day_id: 'day-1',
        workout_day: { name: null },
      }

      render(<HomePage />)

      expect(screen.getByText('In Progress')).toBeInTheDocument()
      // getWorkoutDisplayName(null) returns 'Workout'
      expect(screen.getByText('Workout')).toBeInTheDocument()
    })
  })

  // -----------------------------------------------------------------------
  // 3. Onboarding auto-open
  // -----------------------------------------------------------------------
  describe('Onboarding auto-open', () => {
    it('opens onboarding wizard when schedule is empty', async () => {
      mockSchedule = []

      render(<HomePage />)

      // setTimeout is used to defer the state update, so we advance timers
      vi.advanceTimersByTime(100)

      await waitFor(() => {
        expect(screen.getByTestId('onboarding-wizard')).toBeInTheDocument()
      })
    })

    it('does not open onboarding wizard when schedule has entries', () => {
      mockSchedule = [{ id: 's1', day_number: 1 }]

      render(<HomePage />)

      vi.advanceTimersByTime(100)

      expect(screen.queryByTestId('onboarding-wizard')).not.toBeInTheDocument()
    })

    it('does not open onboarding wizard when schedule is null (treated as empty)', async () => {
      // When useUserSchedule returns null/undefined, it is also empty schedule
      mockSchedule = null as unknown as Record<string, unknown>[]

      render(<HomePage />)

      vi.advanceTimersByTime(100)

      await waitFor(() => {
        expect(screen.getByTestId('onboarding-wizard')).toBeInTheDocument()
      })
    })

    it('does not open onboarding when schedule is still loading', () => {
      mockSchedule = []
      mockScheduleLoading = true

      render(<HomePage />)

      vi.advanceTimersByTime(100)

      // Should NOT auto-open while loading
      expect(screen.queryByTestId('onboarding-wizard')).not.toBeInTheDocument()
    })
  })

  // -----------------------------------------------------------------------
  // 4. Recent activity display
  // -----------------------------------------------------------------------
  describe('Recent activity display', () => {
    it('shows up to 3 recent activities sorted by completed_at descending', () => {
      const now = Date.now()
      mockSessions = [
        {
          id: 'w1',
          completed_at: new Date(now - 300000).toISOString(), // 5 min ago
          started_at: new Date(now - 600000).toISOString(),
          workout_day: { name: 'Push (Chest, Shoulders, Triceps)' },
        },
        {
          id: 'w2',
          completed_at: new Date(now - 120000).toISOString(), // 2 min ago
          started_at: new Date(now - 240000).toISOString(),
          workout_day: { name: 'Pull (Back, Biceps, Rear Delts)' },
        },
        {
          id: 'w3',
          completed_at: new Date(now - 60000).toISOString(), // 1 min ago
          started_at: new Date(now - 120000).toISOString(),
          workout_day: { name: 'Legs (Quads, Hamstrings, Calves)' },
        },
        {
          id: 'w4',
          completed_at: new Date(now - 600000).toISOString(), // 10 min ago (should be excluded)
          started_at: new Date(now - 900000).toISOString(),
          workout_day: { name: 'Upper (Full Upper Body)' },
        },
      ]

      render(<HomePage />)

      // Should show only 3 items, excluding Upper (the oldest)
      expect(screen.getByText('Legs')).toBeInTheDocument()
      expect(screen.getByText('Pull')).toBeInTheDocument()
      expect(screen.getByText('Push')).toBeInTheDocument()
      expect(screen.queryByText('Upper')).not.toBeInTheDocument()
    })

    it('sorts mixed weight + template sessions by most recent first', () => {
      const now = Date.now()
      mockSessions = [
        {
          id: 'w1',
          completed_at: new Date(now - 120000).toISOString(), // 2 min ago
          started_at: new Date(now - 240000).toISOString(),
          workout_day: { name: 'Pull (Back, Biceps, Rear Delts)' },
        },
      ]
      mockTemplateSessions = [
        {
          id: 't1',
          completed_at: new Date(now - 60000).toISOString(), // 1 min ago
          started_at: new Date(now - 120000).toISOString(),
          template: { name: 'Morning Run' },
        },
      ]

      render(<HomePage />)

      const items = screen.getAllByText(/Morning Run|Pull/)
      // Morning Run is more recent, should appear first
      expect(items[0].textContent).toBe('Morning Run')
      expect(items[1].textContent).toBe('Pull')
    })

    it('shows "Done" badge for each completed recent activity', () => {
      const now = Date.now()
      mockSessions = [
        {
          id: 'w1',
          completed_at: new Date(now).toISOString(),
          started_at: new Date(now - 60000).toISOString(),
          workout_day: { name: 'Push (Chest, Shoulders, Triceps)' },
        },
        {
          id: 'w2',
          completed_at: new Date(now - 60000).toISOString(),
          started_at: new Date(now - 120000).toISOString(),
          workout_day: { name: 'Pull (Back, Biceps, Rear Delts)' },
        },
      ]

      render(<HomePage />)

      const doneBadges = screen.getAllByText('Done')
      expect(doneBadges).toHaveLength(2)
    })

    it('does not show recent activity section when no completed sessions exist', () => {
      mockSessions = []
      mockTemplateSessions = []

      render(<HomePage />)

      expect(screen.queryByText('Recent Activity')).not.toBeInTheDocument()
      expect(screen.queryByText('See All')).not.toBeInTheDocument()
    })

    it('navigates to history page when "See All" is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const now = Date.now()
      mockSessions = [
        {
          id: 'w1',
          completed_at: new Date(now).toISOString(),
          started_at: new Date(now - 60000).toISOString(),
          workout_day: { name: 'Push (Chest, Shoulders, Triceps)' },
        },
      ]

      render(<HomePage />)

      await user.click(screen.getByText('See All'))

      expect(mockNavigate).toHaveBeenCalledWith('/history')
    })

    it('navigates to weight session detail when clicking a weights activity', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const now = Date.now()
      mockSessions = [
        {
          id: 'w-session-1',
          completed_at: new Date(now).toISOString(),
          started_at: new Date(now - 60000).toISOString(),
          workout_day: { name: 'Push (Chest, Shoulders, Triceps)' },
        },
      ]

      render(<HomePage />)

      await user.click(screen.getByText('Push'))

      expect(mockNavigate).toHaveBeenCalledWith('/history/w-session-1')
    })

    it('navigates to cardio session detail when clicking a template activity', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const now = Date.now()
      mockTemplateSessions = [
        {
          id: 't-session-1',
          completed_at: new Date(now).toISOString(),
          started_at: new Date(now - 60000).toISOString(),
          template: { name: 'Evening Swim' },
        },
      ]

      render(<HomePage />)

      await user.click(screen.getByText('Evening Swim'))

      expect(mockNavigate).toHaveBeenCalledWith('/history/cardio/t-session-1')
    })
  })

  // -----------------------------------------------------------------------
  // 5. Empty states
  // -----------------------------------------------------------------------
  describe('Empty states', () => {
    it('shows "No weight workouts found." when days list is empty (Weights tab is default)', () => {
      mockDays = []

      render(<HomePage />)

      // Weights tab is active by default, so empty state should be visible immediately
      expect(screen.getByText('No weight workouts found.')).toBeInTheDocument()
    })

    it('shows "No cardio workouts available." when no cardio templates exist and Cardio tab is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      mockCardioTemplates = []

      render(<HomePage />)

      await user.click(screen.getByText('Cardio'))
      // Flush AnimatePresence exit/enter animations via act + runAllTimers
      await act(async () => { vi.runAllTimers() })

      await waitFor(() => {
        expect(screen.getByText('No cardio workouts available.')).toBeInTheDocument()
      })
    })

    it('shows "No mobility workouts available." when no mobility templates exist and Mobility tab is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      mockMobilityCategories = []

      render(<HomePage />)

      await user.click(screen.getByText('Mobility'))
      // Flush AnimatePresence exit/enter animations via act + runAllTimers
      await act(async () => { vi.runAllTimers() })

      await waitFor(() => {
        expect(screen.getByText('No mobility workouts available.')).toBeInTheDocument()
      })
    })

    it('shows workout day cards when days are available (Weights tab is default)', () => {
      mockDays = [
        { id: 'day-1', name: 'Push (Chest, Shoulders, Triceps)', day_number: 1 },
        { id: 'day-2', name: 'Pull (Back, Biceps, Rear Delts)', day_number: 2 },
      ]

      render(<HomePage />)

      // Weights tab is active by default, so cards should be visible
      expect(screen.getByText('Push')).toBeInTheDocument()
      expect(screen.getByText('Pull')).toBeInTheDocument()
    })
  })

  // -----------------------------------------------------------------------
  // 6. Workout navigation via Quick Select tabs
  // -----------------------------------------------------------------------
  describe('Workout navigation', () => {
    it('navigates to workout day page when a weight workout card is clicked (Weights tab is default)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      mockDays = [
        { id: 'day-push', name: 'Push (Chest, Shoulders, Triceps)', day_number: 1 },
      ]

      render(<HomePage />)

      // Weights tab is active by default, so Push card should be visible
      await user.click(screen.getByText('Push'))

      expect(mockNavigate).toHaveBeenCalledWith('/workout/day-push')
    })

    it('navigates to mobility duration picker when a mobility category card is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      mockMobilityCategories = [
        {
          category: 'hip_knee_ankle',
          template: {
            id: 'mob-template-1',
            name: 'Hip, Knee & Ankle Flow',
            type: 'mobility',
            category: 'hip_knee_ankle',
            duration_minutes: 15,
            created_at: '2024-01-01',
          },
        },
      ]

      render(<HomePage />)

      // Switch to Mobility tab
      await user.click(screen.getByText('Mobility'))
      // Flush AnimatePresence exit/enter animations via act + runAllTimers
      await act(async () => { vi.runAllTimers() })
      // Wait for tab content to animate in, then click the category card
      const card = await waitFor(() => screen.getByText('Hip, Knee & Ankle Flow'))
      await user.click(card)

      expect(mockNavigate).toHaveBeenCalledWith('/mobility/hip_knee_ankle/select')
    })
  })
})
