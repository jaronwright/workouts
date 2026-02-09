import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import { ActivityFeed } from '../ActivityFeed'
import type { SocialWorkout } from '@/services/socialService'

// Mock the useSocialFeed hook
const mockUseSocialFeed = vi.fn()
vi.mock('@/hooks/useSocial', () => ({
  useSocialFeed: () => mockUseSocialFeed(),
}))

// Mock formatRelativeTime
vi.mock('@/utils/formatters', () => ({
  formatRelativeTime: (date: string) => `mocked time for ${date}`,
}))

// Mock workoutConfig
vi.mock('@/config/workoutConfig', () => ({
  getWorkoutDisplayName: (name: string | null | undefined) => name || 'Workout',
}))

function createMockWorkout(overrides: Partial<SocialWorkout> = {}): SocialWorkout {
  return {
    id: 'workout-1',
    user_id: 'user-1',
    started_at: '2025-01-15T10:00:00Z',
    completed_at: '2025-01-15T11:00:00Z',
    notes: null,
    is_public: true,
    type: 'weights',
    user_profile: { display_name: 'Test User' },
    workout_day: { name: 'Push Day' },
    ...overrides,
  }
}

describe('ActivityFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('renders loading skeletons when data is loading', () => {
      mockUseSocialFeed.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      const { container } = render(<ActivityFeed />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(3)
    })

    it('renders exactly 3 loading placeholders', () => {
      mockUseSocialFeed.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      const { container } = render(<ActivityFeed />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons).toHaveLength(3)
    })
  })

  describe('error state', () => {
    it('renders empty state message when there is an error', () => {
      mockUseSocialFeed.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      })

      render(<ActivityFeed />)
      expect(screen.getByText('No recent community activity')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('renders empty state when workouts array is empty', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText('No recent community activity')).toBeInTheDocument()
    })

    it('renders empty state when data is null', () => {
      mockUseSocialFeed.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText('No recent community activity')).toBeInTheDocument()
    })
  })

  describe('rendering workouts', () => {
    it('renders a single workout item', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [createMockWorkout()],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('Push Day')).toBeInTheDocument()
    })

    it('renders multiple workout items', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [
          createMockWorkout({ id: '1', user_profile: { display_name: 'User One' } }),
          createMockWorkout({ id: '2', user_profile: { display_name: 'User Two' } }),
          createMockWorkout({ id: '3', user_profile: { display_name: 'User Three' } }),
        ],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText('User One')).toBeInTheDocument()
      expect(screen.getByText('User Two')).toBeInTheDocument()
      expect(screen.getByText('User Three')).toBeInTheDocument()
    })

    it('shows "Completed" text with workout name', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [createMockWorkout({ workout_day: { name: 'Push Day' } })],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText(/Completed/)).toBeInTheDocument()
      expect(screen.getByText('Push Day')).toBeInTheDocument()
    })

    it('shows "Anonymous" when user has no display name', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [createMockWorkout({ user_profile: null })],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText('Anonymous')).toBeInTheDocument()
    })

    it('shows "Anonymous" when display_name is null', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [createMockWorkout({ user_profile: { display_name: null } })],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText('Anonymous')).toBeInTheDocument()
    })

    it('shows relative time for completed_at', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [createMockWorkout({ completed_at: '2025-01-15T11:00:00Z' })],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText('mocked time for 2025-01-15T11:00:00Z')).toBeInTheDocument()
    })

    it('falls back to started_at when completed_at is null', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [createMockWorkout({ completed_at: null, started_at: '2025-01-15T10:00:00Z' })],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText('mocked time for 2025-01-15T10:00:00Z')).toBeInTheDocument()
    })
  })

  describe('workout types', () => {
    it('renders weights workout with correct name from workout_day', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [createMockWorkout({ type: 'weights', workout_day: { name: 'Push' } })],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText('Push')).toBeInTheDocument()
    })

    it('renders cardio workout with name from template', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [createMockWorkout({
          type: 'cardio',
          workout_day: null,
          template: { name: 'Running', type: 'cardio', category: 'run' },
        })],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText('Running')).toBeInTheDocument()
    })

    it('renders mobility workout with name from template', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [createMockWorkout({
          type: 'mobility',
          workout_day: null,
          template: { name: 'Spine Mobility', type: 'mobility', category: 'spine' },
        })],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText('Spine Mobility')).toBeInTheDocument()
    })

    it('falls back to "Workout" when no workout_day or template', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [createMockWorkout({ workout_day: null, template: undefined })],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText('Workout')).toBeInTheDocument()
    })
  })

  describe('cardio-specific details', () => {
    it('shows duration in minutes when provided', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [createMockWorkout({ duration_minutes: 45 })],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText('45 min')).toBeInTheDocument()
    })

    it('shows distance when provided along with duration', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [createMockWorkout({
          duration_minutes: 30,
          distance_value: 5.0,
          distance_unit: 'km',
        })],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText(/30 min/)).toBeInTheDocument()
      expect(screen.getByText(/5 km/)).toBeInTheDocument()
    })

    it('does not show duration section when duration_minutes is null', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [createMockWorkout({ duration_minutes: null })],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.queryByText(/min/)).not.toBeInTheDocument()
    })
  })

  describe('limit prop', () => {
    it('limits the displayed workouts when limit is specified', () => {
      const workouts = Array.from({ length: 5 }, (_, i) =>
        createMockWorkout({
          id: `workout-${i}`,
          user_profile: { display_name: `User ${i}` },
        })
      )

      mockUseSocialFeed.mockReturnValue({
        data: workouts,
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed limit={3} />)
      expect(screen.getByText('User 0')).toBeInTheDocument()
      expect(screen.getByText('User 1')).toBeInTheDocument()
      expect(screen.getByText('User 2')).toBeInTheDocument()
      expect(screen.queryByText('User 3')).not.toBeInTheDocument()
      expect(screen.queryByText('User 4')).not.toBeInTheDocument()
    })

    it('shows all workouts when no limit is specified', () => {
      const workouts = Array.from({ length: 4 }, (_, i) =>
        createMockWorkout({
          id: `workout-${i}`,
          user_profile: { display_name: `Person ${i}` },
        })
      )

      mockUseSocialFeed.mockReturnValue({
        data: workouts,
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed />)
      expect(screen.getByText('Person 0')).toBeInTheDocument()
      expect(screen.getByText('Person 1')).toBeInTheDocument()
      expect(screen.getByText('Person 2')).toBeInTheDocument()
      expect(screen.getByText('Person 3')).toBeInTheDocument()
    })

    it('handles limit larger than data length', () => {
      mockUseSocialFeed.mockReturnValue({
        data: [createMockWorkout()],
        isLoading: false,
        error: null,
      })

      render(<ActivityFeed limit={10} />)
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })
  })
})
