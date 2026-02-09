import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMobilityCategories, useMobilityVariants } from '../useMobilityTemplates'
import * as scheduleService from '@/services/scheduleService'
import { ReactNode } from 'react'

// Mock dependencies
vi.mock('@/services/scheduleService', () => ({
  getMobilityCategories: vi.fn(),
  getMobilityTemplatesByCategory: vi.fn(),
}))

describe('useMobilityTemplates hooks', () => {
  const mockTemplate: scheduleService.WorkoutTemplate = {
    id: 'template-1',
    name: 'Full Body Stretch',
    type: 'mobility',
    category: 'Stretching',
    description: 'A full body stretching routine',
    icon: 'stretch',
    duration_minutes: 15,
    workout_day_id: null,
    created_at: '2024-01-01T00:00:00Z',
  }

  const mockTemplate2: scheduleService.WorkoutTemplate = {
    id: 'template-2',
    name: 'Hip Opener Flow',
    type: 'mobility',
    category: 'Yoga',
    description: 'Hip-focused yoga flow',
    icon: 'yoga',
    duration_minutes: 20,
    workout_day_id: null,
    created_at: '2024-01-02T00:00:00Z',
  }

  const mockTemplate3: scheduleService.WorkoutTemplate = {
    id: 'template-3',
    name: 'Quick Stretch',
    type: 'mobility',
    category: 'Stretching',
    description: 'Short stretching routine',
    icon: 'stretch',
    duration_minutes: 10,
    workout_day_id: null,
    created_at: '2024-01-03T00:00:00Z',
  }

  const mockCategories = [
    { category: 'Stretching', template: mockTemplate },
    { category: 'Yoga', template: mockTemplate2 },
  ]

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
        mutations: { retry: false },
      },
    })
  })

  // ─── useMobilityCategories ─────────────────────────────

  describe('useMobilityCategories', () => {
    it('fetches mobility categories', async () => {
      vi.mocked(scheduleService.getMobilityCategories).mockResolvedValue(mockCategories)

      const { result } = renderHook(() => useMobilityCategories(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(scheduleService.getMobilityCategories).toHaveBeenCalledTimes(1)
      expect(result.current.data).toEqual(mockCategories)
    })

    it('returns correct category and template structure', async () => {
      vi.mocked(scheduleService.getMobilityCategories).mockResolvedValue(mockCategories)

      const { result } = renderHook(() => useMobilityCategories(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toHaveLength(2)
      expect(result.current.data![0].category).toBe('Stretching')
      expect(result.current.data![0].template.id).toBe('template-1')
      expect(result.current.data![1].category).toBe('Yoga')
      expect(result.current.data![1].template.id).toBe('template-2')
    })

    it('returns empty array when no categories exist', async () => {
      vi.mocked(scheduleService.getMobilityCategories).mockResolvedValue([])

      const { result } = renderHook(() => useMobilityCategories(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual([])
    })

    it('uses correct query key', async () => {
      vi.mocked(scheduleService.getMobilityCategories).mockResolvedValue([])

      renderHook(() => useMobilityCategories(), { wrapper })

      await waitFor(() => {
        const queryState = queryClient.getQueryState(['mobility-categories'])
        expect(queryState).toBeDefined()
      })
    })

    it('handles service error as query error', async () => {
      const error = new Error('Database error')
      vi.mocked(scheduleService.getMobilityCategories).mockRejectedValue(error)

      const { result } = renderHook(() => useMobilityCategories(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })

    it('starts in loading state before data arrives', async () => {
      let resolveCategories: (value: { category: string; template: scheduleService.WorkoutTemplate }[]) => void
      vi.mocked(scheduleService.getMobilityCategories).mockImplementation(
        () => new Promise((resolve) => { resolveCategories = resolve })
      )

      const { result } = renderHook(() => useMobilityCategories(), { wrapper })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()

      await act(async () => {
        resolveCategories!(mockCategories)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
      expect(result.current.data).toEqual(mockCategories)
    })

    it('does not refetch on rerender when data is cached', async () => {
      vi.mocked(scheduleService.getMobilityCategories).mockResolvedValue(mockCategories)

      const { result, rerender } = renderHook(() => useMobilityCategories(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(scheduleService.getMobilityCategories).toHaveBeenCalledTimes(1)

      rerender()

      expect(scheduleService.getMobilityCategories).toHaveBeenCalledTimes(1)
    })

    it('handles non-Error rejection types', async () => {
      vi.mocked(scheduleService.getMobilityCategories).mockRejectedValue('string error')

      const { result } = renderHook(() => useMobilityCategories(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe('string error')
    })
  })

  // ─── useMobilityVariants ───────────────────────────────

  describe('useMobilityVariants', () => {
    it('fetches templates by category', async () => {
      vi.mocked(scheduleService.getMobilityTemplatesByCategory).mockResolvedValue([
        mockTemplate,
        mockTemplate3,
      ])

      const { result } = renderHook(() => useMobilityVariants('Stretching'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(scheduleService.getMobilityTemplatesByCategory).toHaveBeenCalledWith('Stretching')
      expect(result.current.data).toHaveLength(2)
    })

    it('is disabled when category is empty string', () => {
      const { result } = renderHook(() => useMobilityVariants(''), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(scheduleService.getMobilityTemplatesByCategory).not.toHaveBeenCalled()
    })

    it('fetches when category is provided', async () => {
      vi.mocked(scheduleService.getMobilityTemplatesByCategory).mockResolvedValue([mockTemplate2])

      const { result } = renderHook(() => useMobilityVariants('Yoga'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(scheduleService.getMobilityTemplatesByCategory).toHaveBeenCalledWith('Yoga')
      expect(result.current.data).toEqual([mockTemplate2])
    })

    it('uses correct query key containing category', async () => {
      vi.mocked(scheduleService.getMobilityTemplatesByCategory).mockResolvedValue([])

      renderHook(() => useMobilityVariants('Stretching'), { wrapper })

      await waitFor(() => {
        const queryState = queryClient.getQueryState(['mobility-variants', 'Stretching'])
        expect(queryState).toBeDefined()
      })
    })

    it('returns empty array when category has no templates', async () => {
      vi.mocked(scheduleService.getMobilityTemplatesByCategory).mockResolvedValue([])

      const { result } = renderHook(() => useMobilityVariants('Unknown'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual([])
    })

    it('handles service error as query error', async () => {
      const error = new Error('Category not found')
      vi.mocked(scheduleService.getMobilityTemplatesByCategory).mockRejectedValue(error)

      const { result } = renderHook(() => useMobilityVariants('Stretching'), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })

    it('starts in loading state before data arrives', async () => {
      let resolveVariants: (value: scheduleService.WorkoutTemplate[]) => void
      vi.mocked(scheduleService.getMobilityTemplatesByCategory).mockImplementation(
        () => new Promise((resolve) => { resolveVariants = resolve })
      )

      const { result } = renderHook(() => useMobilityVariants('Stretching'), { wrapper })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()

      await act(async () => {
        resolveVariants!([mockTemplate])
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
      expect(result.current.data).toEqual([mockTemplate])
    })

    it('has isPending true when query is disabled (empty category)', () => {
      const { result } = renderHook(() => useMobilityVariants(''), { wrapper })

      expect(result.current.isPending).toBe(true)
      expect(result.current.fetchStatus).toBe('idle')
    })

    it('refetches with different category', async () => {
      vi.mocked(scheduleService.getMobilityTemplatesByCategory).mockResolvedValue([mockTemplate])

      const { result, rerender } = renderHook(
        ({ category }) => useMobilityVariants(category),
        { wrapper, initialProps: { category: 'Stretching' } }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      vi.mocked(scheduleService.getMobilityTemplatesByCategory).mockResolvedValue([mockTemplate2])

      rerender({ category: 'Yoga' })

      await waitFor(() => {
        expect(result.current.data).toEqual([mockTemplate2])
      })

      expect(scheduleService.getMobilityTemplatesByCategory).toHaveBeenCalledWith('Yoga')
    })

    it('returns templates with all fields populated', async () => {
      vi.mocked(scheduleService.getMobilityTemplatesByCategory).mockResolvedValue([mockTemplate])

      const { result } = renderHook(() => useMobilityVariants('Stretching'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const template = result.current.data![0]
      expect(template.id).toBe('template-1')
      expect(template.name).toBe('Full Body Stretch')
      expect(template.type).toBe('mobility')
      expect(template.category).toBe('Stretching')
      expect(template.description).toBe('A full body stretching routine')
      expect(template.icon).toBe('stretch')
      expect(template.duration_minutes).toBe(15)
    })
  })
})
