import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useExerciseInfo } from '../useExerciseGif'
import * as exerciseDbService from '@/services/exerciseDbService'
import { ReactNode } from 'react'

// Mock dependencies
vi.mock('@/services/exerciseDbService', () => ({
  searchExerciseByName: vi.fn(),
}))

describe('useExerciseGif hooks', () => {
  const mockExercise = {
    exerciseId: '1',
    name: 'barbell bench press',
    gifUrl: 'https://example.com/bench.gif',
    targetMuscles: ['chest'],
    bodyParts: ['chest'],
    equipments: ['barbell'],
    secondaryMuscles: ['triceps', 'shoulders'],
    instructions: ['Lie on bench', 'Lower bar to chest', 'Press up'],
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
  })

  describe('useExerciseInfo', () => {
    it('fetches exercise info when name is provided', async () => {
      vi.mocked(exerciseDbService.searchExerciseByName).mockResolvedValue(
        mockExercise
      )

      const { result } = renderHook(() => useExerciseInfo('bench press'), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(exerciseDbService.searchExerciseByName).toHaveBeenCalledWith(
        'bench press'
      )
      expect(result.current.exercise).toEqual(mockExercise)
      expect(result.current.gifUrl).toBe('https://example.com/bench.gif')
      expect(result.current.instructions).toEqual([
        'Lie on bench',
        'Lower bar to chest',
        'Press up',
      ])
    })

    it('does not fetch when name is undefined', () => {
      const { result } = renderHook(() => useExerciseInfo(undefined), {
        wrapper,
      })

      expect(result.current.isLoading).toBe(false)
      expect(exerciseDbService.searchExerciseByName).not.toHaveBeenCalled()
      expect(result.current.exercise).toBeNull()
      expect(result.current.gifUrl).toBeNull()
      expect(result.current.instructions).toEqual([])
    })

    it('returns null exercise when not found', async () => {
      vi.mocked(exerciseDbService.searchExerciseByName).mockResolvedValue(null)

      const { result } = renderHook(
        () => useExerciseInfo('nonexistent exercise'),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.exercise).toBeNull()
      expect(result.current.gifUrl).toBeNull()
      expect(result.current.instructions).toEqual([])
    })

    it('handles fetch returning null gracefully', async () => {
      // When the API returns null (not found), the hook should handle it
      vi.mocked(exerciseDbService.searchExerciseByName).mockResolvedValue(null)

      const { result } = renderHook(() => useExerciseInfo('unknown exercise'), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.exercise).toBeNull()
      expect(result.current.gifUrl).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('shows loading state while fetching', () => {
      vi.mocked(exerciseDbService.searchExerciseByName).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(() => useExerciseInfo('bench press'), {
        wrapper,
      })

      expect(result.current.isLoading).toBe(true)
    })
  })
})
