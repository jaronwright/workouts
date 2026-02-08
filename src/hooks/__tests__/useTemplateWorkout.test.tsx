import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
  useTemplate,
  useUserTemplateWorkouts,
  useStartTemplateWorkout,
  useCompleteTemplateWorkout,
  useQuickLogTemplateWorkout,
} from '../useTemplateWorkout'
import { useAuthStore } from '@/stores/authStore'
import * as templateWorkoutService from '@/services/templateWorkoutService'

// Mock dependencies
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/services/templateWorkoutService', () => ({
  getTemplateById: vi.fn(),
  getActiveTemplateWorkout: vi.fn(),
  getUserTemplateWorkouts: vi.fn(),
  startTemplateWorkout: vi.fn(),
  completeTemplateWorkout: vi.fn(),
  quickLogTemplateWorkout: vi.fn(),
}))

describe('useTemplateWorkout hooks', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }

  let queryClient: QueryClient

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    })

    // Default: authenticated user
    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = { user: mockUser }
      if (typeof selector === 'function') {
        return selector(state as Parameters<typeof selector>[0])
      }
      return state
    })
  })

  // ============================================
  // useTemplate
  // ============================================

  describe('useTemplate', () => {
    it('fetches template when templateId is provided', async () => {
      const mockTemplate = {
        id: 'template-1',
        name: 'Morning Run',
        type: 'cardio',
        description: 'A steady morning run',
        icon: 'running',
        color: '#FF5733',
        created_at: '2024-01-01T00:00:00Z',
      }
      vi.mocked(templateWorkoutService.getTemplateById).mockResolvedValue(mockTemplate)

      const { result } = renderHook(() => useTemplate('template-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(templateWorkoutService.getTemplateById).toHaveBeenCalledWith('template-1')
      expect(result.current.data).toEqual(mockTemplate)
    })

    it('does not fetch when templateId is undefined', () => {
      const { result } = renderHook(() => useTemplate(undefined), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(templateWorkoutService.getTemplateById).not.toHaveBeenCalled()
    })

    it('returns null when template does not exist', async () => {
      vi.mocked(templateWorkoutService.getTemplateById).mockResolvedValue(null)

      const { result } = renderHook(() => useTemplate('nonexistent'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeNull()
    })
  })

  // ============================================
  // useUserTemplateWorkouts
  // ============================================

  describe('useUserTemplateWorkouts', () => {
    it('fetches user template workouts when user is authenticated', async () => {
      const mockWorkouts: templateWorkoutService.TemplateWorkoutSession[] = [
        {
          id: 'tw-1',
          user_id: 'user-123',
          template_id: 'template-1',
          started_at: '2024-01-15T08:00:00Z',
          completed_at: '2024-01-15T08:30:00Z',
          duration_minutes: 30,
          distance_value: 5.0,
          distance_unit: 'km',
          notes: null,
        },
      ]
      vi.mocked(templateWorkoutService.getUserTemplateWorkouts).mockResolvedValue(mockWorkouts)

      const { result } = renderHook(() => useUserTemplateWorkouts(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(templateWorkoutService.getUserTemplateWorkouts).toHaveBeenCalledWith('user-123')
      expect(result.current.data).toEqual(mockWorkouts)
    })

    it('does not fetch when user is not authenticated', () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = { user: null }
        if (typeof selector === 'function') {
          return selector(state as Parameters<typeof selector>[0])
        }
        return state
      })

      const { result } = renderHook(() => useUserTemplateWorkouts(), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(templateWorkoutService.getUserTemplateWorkouts).not.toHaveBeenCalled()
    })
  })

  // ============================================
  // useStartTemplateWorkout
  // ============================================

  describe('useStartTemplateWorkout', () => {
    it('calls startTemplateWorkout with user id and template id', async () => {
      const mockSession: templateWorkoutService.TemplateWorkoutSession = {
        id: 'tw-new',
        user_id: 'user-123',
        template_id: 'template-1',
        started_at: '2024-01-15T08:00:00Z',
        completed_at: null,
        duration_minutes: null,
        distance_value: null,
        distance_unit: null,
        notes: null,
      }
      vi.mocked(templateWorkoutService.startTemplateWorkout).mockResolvedValue(mockSession)

      const { result } = renderHook(() => useStartTemplateWorkout(), { wrapper })

      await result.current.mutateAsync('template-1')

      expect(templateWorkoutService.startTemplateWorkout).toHaveBeenCalledWith(
        'user-123',
        'template-1'
      )
    })

    it('invalidates relevant queries on success', async () => {
      const mockSession: templateWorkoutService.TemplateWorkoutSession = {
        id: 'tw-new',
        user_id: 'user-123',
        template_id: 'template-1',
        started_at: '2024-01-15T08:00:00Z',
        completed_at: null,
        duration_minutes: null,
        distance_value: null,
        distance_unit: null,
        notes: null,
      }
      vi.mocked(templateWorkoutService.startTemplateWorkout).mockResolvedValue(mockSession)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useStartTemplateWorkout(), { wrapper })

      await result.current.mutateAsync('template-1')

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['active-template-workout'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user-template-workouts'] })
    })
  })

  // ============================================
  // useCompleteTemplateWorkout
  // ============================================

  describe('useCompleteTemplateWorkout', () => {
    it('calls completeTemplateWorkout with session data', async () => {
      const mockCompleted: templateWorkoutService.TemplateWorkoutSession = {
        id: 'tw-1',
        user_id: 'user-123',
        template_id: 'template-1',
        started_at: '2024-01-15T08:00:00Z',
        completed_at: '2024-01-15T08:30:00Z',
        duration_minutes: 30,
        distance_value: 5.0,
        distance_unit: 'km',
        notes: 'Good run',
      }
      vi.mocked(templateWorkoutService.completeTemplateWorkout).mockResolvedValue(mockCompleted)

      const { result } = renderHook(() => useCompleteTemplateWorkout(), { wrapper })

      await result.current.mutateAsync({
        sessionId: 'tw-1',
        durationMinutes: 30,
        distanceValue: 5.0,
        distanceUnit: 'km',
        notes: 'Good run',
      })

      expect(templateWorkoutService.completeTemplateWorkout).toHaveBeenCalledWith('tw-1', {
        durationMinutes: 30,
        distanceValue: 5.0,
        distanceUnit: 'km',
        notes: 'Good run',
      })
    })

    it('invalidates relevant queries on success', async () => {
      const mockCompleted: templateWorkoutService.TemplateWorkoutSession = {
        id: 'tw-1',
        user_id: 'user-123',
        template_id: 'template-1',
        started_at: '2024-01-15T08:00:00Z',
        completed_at: '2024-01-15T08:30:00Z',
        duration_minutes: 30,
        distance_value: null,
        distance_unit: null,
        notes: null,
      }
      vi.mocked(templateWorkoutService.completeTemplateWorkout).mockResolvedValue(mockCompleted)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useCompleteTemplateWorkout(), { wrapper })

      await result.current.mutateAsync({ sessionId: 'tw-1' })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['active-template-workout'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user-template-workouts'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todays-workout'] })
    })
  })

  // ============================================
  // useQuickLogTemplateWorkout
  // ============================================

  describe('useQuickLogTemplateWorkout', () => {
    it('calls quickLogTemplateWorkout with user id and params', async () => {
      const mockSession: templateWorkoutService.TemplateWorkoutSession = {
        id: 'tw-quick',
        user_id: 'user-123',
        template_id: 'template-1',
        started_at: '2024-01-15T08:00:00Z',
        completed_at: '2024-01-15T08:30:00Z',
        duration_minutes: 30,
        distance_value: 5.0,
        distance_unit: 'km',
        notes: null,
      }
      vi.mocked(templateWorkoutService.quickLogTemplateWorkout).mockResolvedValue(mockSession)

      const { result } = renderHook(() => useQuickLogTemplateWorkout(), { wrapper })

      await result.current.mutateAsync({
        templateId: 'template-1',
        durationMinutes: 30,
        distanceValue: 5.0,
        distanceUnit: 'km',
      })

      expect(templateWorkoutService.quickLogTemplateWorkout).toHaveBeenCalledWith(
        'user-123',
        'template-1',
        {
          durationMinutes: 30,
          distanceValue: 5.0,
          distanceUnit: 'km',
        }
      )
    })

    it('invalidates relevant queries on success', async () => {
      const mockSession: templateWorkoutService.TemplateWorkoutSession = {
        id: 'tw-quick',
        user_id: 'user-123',
        template_id: 'template-1',
        started_at: '2024-01-15T08:00:00Z',
        completed_at: '2024-01-15T08:30:00Z',
        duration_minutes: 30,
        distance_value: null,
        distance_unit: null,
        notes: null,
      }
      vi.mocked(templateWorkoutService.quickLogTemplateWorkout).mockResolvedValue(mockSession)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useQuickLogTemplateWorkout(), { wrapper })

      await result.current.mutateAsync({
        templateId: 'template-1',
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['active-template-workout'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user-template-workouts'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todays-workout'] })
    })
  })
})
