import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useBodyPartList,
  useTargetMuscleList,
  useEquipmentList,
  useExerciseBrowse,
  useExerciseSearch,
  useExerciseDetail,
  useExerciseAlternatives,
} from '../useExerciseLibrary'
import * as exerciseDbService from '@/services/exerciseDbService'
import { ReactNode } from 'react'

vi.mock('@/services/exerciseDbService', () => ({
  fetchBodyPartList: vi.fn(),
  fetchTargetMuscleList: vi.fn(),
  fetchEquipmentList: vi.fn(),
  fetchExercisesByBodyPart: vi.fn(),
  fetchExercisesByMuscle: vi.fn(),
  fetchExercisesByEquipment: vi.fn(),
  searchExercises: vi.fn(),
  fetchExerciseById: vi.fn(),
  fetchAlternativeExercises: vi.fn(),
}))

const mockExercise: exerciseDbService.ExerciseDbExercise = {
  exerciseId: 'abc123',
  name: 'barbell bench press',
  gifUrl: 'https://example.com/bench.gif',
  targetMuscles: ['chest'],
  bodyParts: ['chest'],
  equipments: ['barbell'],
  secondaryMuscles: ['triceps', 'shoulders'],
  instructions: ['Lie down', 'Press up'],
}

const mockBrowseResult: exerciseDbService.ExerciseBrowseResult = {
  exercises: [mockExercise],
  pagination: {
    totalExercises: 50,
    totalPages: 3,
    currentPage: 1,
    previousPage: null,
    nextPage: 'http://api.example.com/page2',
  },
}

const mockLastPageResult: exerciseDbService.ExerciseBrowseResult = {
  exercises: [mockExercise],
  pagination: {
    totalExercises: 50,
    totalPages: 3,
    currentPage: 3,
    previousPage: 'http://api.example.com/page2',
    nextPage: null,
  },
}

describe('useExerciseLibrary hooks', () => {
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
        queries: { retry: false },
      },
    })
  })

  // --- Category list hooks ---

  describe('useBodyPartList', () => {
    it('fetches body parts', async () => {
      const parts = ['chest', 'back', 'shoulders']
      vi.mocked(exerciseDbService.fetchBodyPartList).mockResolvedValue(parts)

      const { result } = renderHook(() => useBodyPartList(), { wrapper })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.data).toEqual(parts)
      expect(exerciseDbService.fetchBodyPartList).toHaveBeenCalledOnce()
    })
  })

  describe('useTargetMuscleList', () => {
    it('fetches target muscles', async () => {
      const muscles = ['pectorals', 'lats', 'delts']
      vi.mocked(exerciseDbService.fetchTargetMuscleList).mockResolvedValue(muscles)

      const { result } = renderHook(() => useTargetMuscleList(), { wrapper })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.data).toEqual(muscles)
    })
  })

  describe('useEquipmentList', () => {
    it('fetches equipment list', async () => {
      const equip = ['barbell', 'dumbbell', 'cable']
      vi.mocked(exerciseDbService.fetchEquipmentList).mockResolvedValue(equip)

      const { result } = renderHook(() => useEquipmentList(), { wrapper })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.data).toEqual(equip)
    })
  })

  // --- Browse hook ---

  describe('useExerciseBrowse', () => {
    it('fetches exercises by body part', async () => {
      vi.mocked(exerciseDbService.fetchExercisesByBodyPart).mockResolvedValue(mockBrowseResult)

      const { result } = renderHook(
        () => useExerciseBrowse('bodyPart', 'chest'),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.data?.pages[0]).toEqual(mockBrowseResult)
      expect(exerciseDbService.fetchExercisesByBodyPart).toHaveBeenCalledWith('chest', 0, 20)
    })

    it('fetches exercises by muscle', async () => {
      vi.mocked(exerciseDbService.fetchExercisesByMuscle).mockResolvedValue(mockBrowseResult)

      const { result } = renderHook(
        () => useExerciseBrowse('muscle', 'pectorals'),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(exerciseDbService.fetchExercisesByMuscle).toHaveBeenCalledWith('pectorals', 0, 20)
    })

    it('fetches exercises by equipment', async () => {
      vi.mocked(exerciseDbService.fetchExercisesByEquipment).mockResolvedValue(mockBrowseResult)

      const { result } = renderHook(
        () => useExerciseBrowse('equipment', 'barbell'),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(exerciseDbService.fetchExercisesByEquipment).toHaveBeenCalledWith('barbell', 0, 20)
    })

    it('does not fetch when value is undefined', () => {
      const { result } = renderHook(
        () => useExerciseBrowse('bodyPart', undefined),
        { wrapper }
      )

      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeUndefined()
      expect(exerciseDbService.fetchExercisesByBodyPart).not.toHaveBeenCalled()
    })

    it('has next page when pagination.nextPage is present', async () => {
      vi.mocked(exerciseDbService.fetchExercisesByBodyPart).mockResolvedValue(mockBrowseResult)

      const { result } = renderHook(
        () => useExerciseBrowse('bodyPart', 'chest'),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.hasNextPage).toBe(true)
    })

    it('has no next page on last page', async () => {
      vi.mocked(exerciseDbService.fetchExercisesByBodyPart).mockResolvedValue(mockLastPageResult)

      const { result } = renderHook(
        () => useExerciseBrowse('bodyPart', 'chest'),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.hasNextPage).toBe(false)
    })
  })

  // --- Search hook ---

  describe('useExerciseSearch', () => {
    it('searches exercises when query is >= 2 chars', async () => {
      vi.mocked(exerciseDbService.searchExercises).mockResolvedValue(mockBrowseResult)

      const { result } = renderHook(
        () => useExerciseSearch('bench'),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.data?.pages[0]).toEqual(mockBrowseResult)
      expect(exerciseDbService.searchExercises).toHaveBeenCalledWith('bench', 0, 20)
    })

    it('does not search when query is < 2 chars', () => {
      const { result } = renderHook(
        () => useExerciseSearch('b'),
        { wrapper }
      )

      expect(result.current.isLoading).toBe(false)
      expect(exerciseDbService.searchExercises).not.toHaveBeenCalled()
    })

    it('does not search with empty query', () => {
      const { result } = renderHook(
        () => useExerciseSearch(''),
        { wrapper }
      )

      expect(result.current.isLoading).toBe(false)
      expect(exerciseDbService.searchExercises).not.toHaveBeenCalled()
    })

    it('trims whitespace from query', async () => {
      vi.mocked(exerciseDbService.searchExercises).mockResolvedValue(mockBrowseResult)

      const { result } = renderHook(
        () => useExerciseSearch('  bench  '),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(exerciseDbService.searchExercises).toHaveBeenCalledWith('bench', 0, 20)
    })
  })

  // --- Detail hook ---

  describe('useExerciseDetail', () => {
    it('fetches exercise by ID', async () => {
      vi.mocked(exerciseDbService.fetchExerciseById).mockResolvedValue(mockExercise)

      const { result } = renderHook(
        () => useExerciseDetail('abc123'),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.data).toEqual(mockExercise)
      expect(exerciseDbService.fetchExerciseById).toHaveBeenCalledWith('abc123')
    })

    it('does not fetch when ID is undefined', () => {
      const { result } = renderHook(
        () => useExerciseDetail(undefined),
        { wrapper }
      )

      expect(result.current.isLoading).toBe(false)
      expect(exerciseDbService.fetchExerciseById).not.toHaveBeenCalled()
    })

    it('returns null for not-found exercise', async () => {
      vi.mocked(exerciseDbService.fetchExerciseById).mockResolvedValue(null)

      const { result } = renderHook(
        () => useExerciseDetail('nonexistent'),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.data).toBeNull()
    })
  })

  // --- Alternatives hook ---

  describe('useExerciseAlternatives', () => {
    it('fetches alternatives for a target muscle', async () => {
      const alts = [mockExercise]
      vi.mocked(exerciseDbService.fetchAlternativeExercises).mockResolvedValue(alts)

      const { result } = renderHook(
        () => useExerciseAlternatives('chest', 'abc123', 6),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.data).toEqual(alts)
      expect(exerciseDbService.fetchAlternativeExercises).toHaveBeenCalledWith('chest', 'abc123', 6)
    })

    it('does not fetch when muscle is undefined', () => {
      const { result } = renderHook(
        () => useExerciseAlternatives(undefined),
        { wrapper }
      )

      expect(result.current.isLoading).toBe(false)
      expect(exerciseDbService.fetchAlternativeExercises).not.toHaveBeenCalled()
    })
  })
})
