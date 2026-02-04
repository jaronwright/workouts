import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  usePersonalRecord,
  useAllPersonalRecords,
  useRecentPRs,
  useCheckPR,
} from '../usePR'
import { useAuthStore } from '@/stores/authStore'
import * as prService from '@/services/prService'
import { ReactNode } from 'react'

// Mock dependencies
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/services/prService', () => ({
  getPersonalRecord: vi.fn(),
  getAllPersonalRecords: vi.fn(),
  checkAndUpdatePR: vi.fn(),
  getRecentPRs: vi.fn(),
}))

describe('usePR hooks', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }
  const mockPR = {
    id: 'pr-123',
    user_id: 'user-123',
    plan_exercise_id: 'exercise-123',
    weight: 225,
    reps: 8,
    achieved_at: '2024-01-15T10:00:00Z',
  }

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
        },
      },
    })

    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = { user: mockUser }
      if (typeof selector === 'function') {
        return selector(state as any)
      }
      return state
    })
  })

  describe('usePersonalRecord', () => {
    it('fetches personal record for exercise when authenticated', async () => {
      vi.mocked(prService.getPersonalRecord).mockResolvedValue(mockPR)

      const { result } = renderHook(() => usePersonalRecord('exercise-123'), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(prService.getPersonalRecord).toHaveBeenCalledWith(
        'user-123',
        'exercise-123'
      )
      expect(result.current.data).toEqual(mockPR)
    })

    it('does not fetch when user is not authenticated', () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = { user: null }
        if (typeof selector === 'function') {
          return selector(state as any)
        }
        return state
      })

      const { result } = renderHook(() => usePersonalRecord('exercise-123'), {
        wrapper,
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(prService.getPersonalRecord).not.toHaveBeenCalled()
    })

    it('does not fetch when exerciseId is undefined', () => {
      const { result } = renderHook(() => usePersonalRecord(undefined), {
        wrapper,
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(prService.getPersonalRecord).not.toHaveBeenCalled()
    })

    it('returns null when no PR exists', async () => {
      vi.mocked(prService.getPersonalRecord).mockResolvedValue(null)

      const { result } = renderHook(() => usePersonalRecord('exercise-123'), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeNull()
    })
  })

  describe('useAllPersonalRecords', () => {
    it('fetches all personal records when authenticated', async () => {
      const mockPRs = [mockPR, { ...mockPR, id: 'pr-124', weight: 245 }]
      vi.mocked(prService.getAllPersonalRecords).mockResolvedValue(mockPRs)

      const { result } = renderHook(() => useAllPersonalRecords(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(prService.getAllPersonalRecords).toHaveBeenCalledWith('user-123')
      expect(result.current.data).toEqual(mockPRs)
    })

    it('does not fetch when user is not authenticated', () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = { user: null }
        if (typeof selector === 'function') {
          return selector(state as any)
        }
        return state
      })

      const { result } = renderHook(() => useAllPersonalRecords(), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(prService.getAllPersonalRecords).not.toHaveBeenCalled()
    })
  })

  describe('useRecentPRs', () => {
    it('fetches recent PRs with default limit', async () => {
      const mockPRsWithNames = [
        { ...mockPR, exercise_name: 'Bench Press' },
        { ...mockPR, id: 'pr-124', exercise_name: 'Squat' },
      ]
      vi.mocked(prService.getRecentPRs).mockResolvedValue(mockPRsWithNames)

      const { result } = renderHook(() => useRecentPRs(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(prService.getRecentPRs).toHaveBeenCalledWith('user-123', 5)
      expect(result.current.data).toEqual(mockPRsWithNames)
    })

    it('fetches recent PRs with custom limit', async () => {
      vi.mocked(prService.getRecentPRs).mockResolvedValue([])

      const { result } = renderHook(() => useRecentPRs(10), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(prService.getRecentPRs).toHaveBeenCalledWith('user-123', 10)
    })

    it('does not fetch when user is not authenticated', () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = { user: null }
        if (typeof selector === 'function') {
          return selector(state as any)
        }
        return state
      })

      const { result } = renderHook(() => useRecentPRs(), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(prService.getRecentPRs).not.toHaveBeenCalled()
    })
  })

  describe('useCheckPR', () => {
    it('checks and updates PR', async () => {
      const checkResult = {
        isNewPR: true,
        previousPR: 200,
        newWeight: 225,
        improvement: 25,
        exerciseName: 'Bench Press',
      }
      vi.mocked(prService.checkAndUpdatePR).mockResolvedValue(checkResult)

      const { result } = renderHook(() => useCheckPR(), { wrapper })

      const mutateResult = await result.current.mutateAsync({
        exerciseId: 'exercise-123',
        exerciseName: 'Bench Press',
        weight: 225,
        reps: 8,
      })

      expect(prService.checkAndUpdatePR).toHaveBeenCalledWith(
        'user-123',
        'exercise-123',
        'Bench Press',
        225,
        8
      )
      expect(mutateResult).toEqual(checkResult)
    })

    it('invalidates PR queries when new PR is achieved', async () => {
      const checkResult = {
        isNewPR: true,
        previousPR: 200,
        newWeight: 225,
        improvement: 25,
        exerciseName: 'Bench Press',
      }
      vi.mocked(prService.checkAndUpdatePR).mockResolvedValue(checkResult)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useCheckPR(), { wrapper })

      await result.current.mutateAsync({
        exerciseId: 'exercise-123',
        exerciseName: 'Bench Press',
        weight: 225,
      })

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['personal-record'],
      })
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['all-personal-records'],
      })
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['recent-prs'],
      })
    })

    it('does not invalidate queries when no new PR', async () => {
      const checkResult = {
        isNewPR: false,
        previousPR: 225,
        newWeight: 200,
        improvement: null,
        exerciseName: 'Bench Press',
      }
      vi.mocked(prService.checkAndUpdatePR).mockResolvedValue(checkResult)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useCheckPR(), { wrapper })

      await result.current.mutateAsync({
        exerciseId: 'exercise-123',
        exerciseName: 'Bench Press',
        weight: 200,
      })

      expect(invalidateSpy).not.toHaveBeenCalled()
    })
  })
})
