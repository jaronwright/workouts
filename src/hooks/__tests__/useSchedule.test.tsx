import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: { id: 'test-user-id', email: 'test@example.com' }
    }
    return selector(state)
  })
}))

// Mock the schedule service
vi.mock('@/services/scheduleService', () => ({
  getUserSchedule: vi.fn().mockResolvedValue([
    {
      id: 'schedule-1',
      user_id: 'test-user-id',
      day_number: 1,
      template_id: null,
      workout_day_id: 'day-1',
      is_rest_day: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      template: null,
      workout_day: { id: 'day-1', name: 'Push', day_number: 1 }
    }
  ]),
  getScheduleDay: vi.fn().mockResolvedValue(null),
  upsertScheduleDay: vi.fn().mockResolvedValue({}),
  deleteScheduleDay: vi.fn().mockResolvedValue(undefined),
  initializeDefaultSchedule: vi.fn().mockResolvedValue([]),
  getWorkoutTemplates: vi.fn().mockResolvedValue([
    { id: 'template-1', name: 'Swimming', type: 'cardio' }
  ]),
  getWorkoutTemplatesByType: vi.fn().mockResolvedValue([]),
  getTodaysScheduledWorkout: vi.fn().mockResolvedValue(null)
}))

import {
  useUserSchedule,
  useWorkoutTemplates,
  useUpsertScheduleDay,
  useDeleteScheduleDay,
  useInitializeSchedule
} from '../useSchedule'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useSchedule hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useUserSchedule', () => {
    it('fetches user schedule when user is authenticated', async () => {
      const { result } = renderHook(() => useUserSchedule(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data).toHaveLength(1)
      expect(result.current.data?.[0].day_number).toBe(1)
    })
  })

  describe('useWorkoutTemplates', () => {
    it('fetches workout templates', async () => {
      const { result } = renderHook(() => useWorkoutTemplates(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data).toHaveLength(1)
      expect(result.current.data?.[0].name).toBe('Swimming')
    })
  })

  describe('useUpsertScheduleDay', () => {
    it('provides mutation function', () => {
      const { result } = renderHook(() => useUpsertScheduleDay(), {
        wrapper: createWrapper()
      })

      expect(result.current.mutate).toBeDefined()
      expect(typeof result.current.mutate).toBe('function')
    })
  })

  describe('useDeleteScheduleDay', () => {
    it('provides mutation function', () => {
      const { result } = renderHook(() => useDeleteScheduleDay(), {
        wrapper: createWrapper()
      })

      expect(result.current.mutate).toBeDefined()
      expect(typeof result.current.mutate).toBe('function')
    })
  })

  describe('useInitializeSchedule', () => {
    it('provides mutation function', () => {
      const { result } = renderHook(() => useInitializeSchedule(), {
        wrapper: createWrapper()
      })

      expect(result.current.mutate).toBeDefined()
      expect(typeof result.current.mutate).toBe('function')
    })
  })
})
