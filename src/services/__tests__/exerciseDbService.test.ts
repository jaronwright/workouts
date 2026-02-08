import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  searchExerciseByName,
  clearExerciseCache,
  _resetForTesting,
  ExerciseDbExercise,
} from '../exerciseDbService'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key]
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {}
  }),
}
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage })

describe('exerciseDbService', () => {
  const mockExercise: ExerciseDbExercise = {
    exerciseId: '1',
    name: 'barbell bench press',
    gifUrl: 'https://example.com/bench.gif',
    targetMuscles: ['chest'],
    bodyParts: ['chest'],
    equipments: ['barbell'],
    secondaryMuscles: ['triceps', 'shoulders'],
    instructions: ['Lie on bench', 'Lower bar to chest', 'Press up'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.store = {}
    mockFetch.mockReset()
    // Disable V2 by default — no API key
    vi.stubEnv('VITE_RAPIDAPI_KEY', '')
    // Reset serial queue and set delays to 0 for fast tests
    _resetForTesting()
  })

  afterEach(() => {
    clearExerciseCache()
    vi.unstubAllEnvs()
  })

  describe('searchExerciseByName', () => {
    it('fetches exercise from API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [mockExercise] }),
      })

      const result = await searchExerciseByName('bench press')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('exercises?search=bench%20press'),
        expect.anything()
      )
      expect(result).toEqual(mockExercise)
    })

    it('caches results in localStorage', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [mockExercise] }),
      })

      await searchExerciseByName('bench press')

      expect(mockLocalStorage.setItem).toHaveBeenCalled()
      const cacheCall = mockLocalStorage.setItem.mock.calls[0]
      expect(cacheCall[0]).toBe('exercisedb_cache_v4')
      const cached = JSON.parse(cacheCall[1])
      expect(cached['bench press'].data).toEqual(mockExercise)
    })

    it('returns cached result on subsequent calls', async () => {
      // Setup cache
      const cacheData = {
        'bench press': {
          data: mockExercise,
          timestamp: Date.now(),
        },
      }
      mockLocalStorage.store['exercisedb_cache_v4'] = JSON.stringify(cacheData)

      const result = await searchExerciseByName('bench press')

      expect(mockFetch).not.toHaveBeenCalled()
      expect(result).toEqual(mockExercise)
    })

    it('ignores expired cache', async () => {
      // Setup expired cache (8 days old)
      const cacheData = {
        'bench press': {
          data: mockExercise,
          timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
        },
      }
      mockLocalStorage.store['exercisedb_cache_v4'] = JSON.stringify(cacheData)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [mockExercise] }),
      })

      await searchExerciseByName('bench press')

      expect(mockFetch).toHaveBeenCalled()
    })

    it('returns null when no exercises found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [] }),
      })

      const result = await searchExerciseByName('nonexistent exercise')

      expect(result).toBeNull()
    })

    it('caches null results to prevent repeated lookups', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [] }),
      })

      await searchExerciseByName('nonexistent exercise')

      expect(mockLocalStorage.setItem).toHaveBeenCalled()
      const cacheCall = mockLocalStorage.setItem.mock.calls[0]
      const cached = JSON.parse(cacheCall[1])
      expect(cached['nonexistent exercise'].data).toBeNull()
    })

    it('handles API errors gracefully without caching', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const result = await searchExerciseByName('bench press')

      expect(result).toBeNull()
      // Should NOT cache the error result
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('retries on rate limit (429) with exponential backoff', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: [mockExercise] }),
        })

      const result = await searchExerciseByName('bench press')

      // 3 fetch calls: initial 429, retry 429, retry success
      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(result).toEqual(mockExercise)
    }, 15000) // Backoff delays: 2s + 4s = 6s minimum

    describe('exercise name mapping', () => {
      it('expands "db" to "dumbbell" in search term', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: [mockExercise] }),
        })

        await searchExerciseByName('incline db press')

        // "incline db press" → "db" expands to "dumbbell" → "incline dumbbell press"
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('search=incline%20dumbbell%20press'),
          expect.anything()
        )
      })

      it('maps "pull-ups" to "pull up"', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: [mockExercise] }),
        })

        await searchExerciseByName('pull-ups')

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('search=pull%20up'),
          expect.anything()
        )
      })

      it('removes parenthetical notes from exercise names', async () => {
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: [] }),
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: [] }),
          })

        await searchExerciseByName('lunges (each side)')

        // First call should be with 'lunges' without the parenthetical
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('search=lunges'),
          expect.anything()
        )
      })
    })

    describe('best match selection', () => {
      it('returns exact match when found', async () => {
        const exercises = [
          { ...mockExercise, name: 'bench press assisted' },
          { ...mockExercise, name: 'bench press', exerciseId: '2' },
          { ...mockExercise, name: 'incline bench press' },
        ]
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: exercises }),
        })

        const result = await searchExerciseByName('bench press')

        expect(result?.exerciseId).toBe('2')
      })

      it('prefers exercises that start with search term', async () => {
        const exercises = [
          { ...mockExercise, name: 'dumbbell bench press', exerciseId: '1' },
          { ...mockExercise, name: 'bench press with bands', exerciseId: '2' },
        ]
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: exercises }),
        })

        const result = await searchExerciseByName('bench press')

        expect(result?.exerciseId).toBe('2')
      })
    })

    describe('fallback search', () => {
      it('performs fallback search with main keyword when no match found', async () => {
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: [] }),
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: [mockExercise] }),
          })

        await searchExerciseByName('fancy barbell press')

        expect(mockFetch).toHaveBeenCalledTimes(2)
        // Second call should include equipment type
        expect(mockFetch).toHaveBeenLastCalledWith(
          expect.stringContaining('barbell%20press'),
          expect.anything()
        )
      })
    })

    describe('V2 RapidAPI support', () => {
      const mockV2Response = [
        {
          id: '100',
          name: 'barbell bench press',
          bodyPart: 'chest',
          target: 'pectorals',
          equipment: 'barbell',
          secondaryMuscles: ['triceps', 'shoulders'],
          instructions: ['Lie on bench', 'Press up'],
        },
      ]

      it('uses V2 API when RAPIDAPI_KEY is set', async () => {
        vi.stubEnv('VITE_RAPIDAPI_KEY', 'test-key-123')

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockV2Response),
        })

        const result = await searchExerciseByName('bench press')

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('exercisedb.p.rapidapi.com'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-RapidAPI-Key': 'test-key-123',
            }),
          })
        )
        expect(result).not.toBeNull()
      })

      it('normalizes V2 singular fields to arrays', async () => {
        vi.stubEnv('VITE_RAPIDAPI_KEY', 'test-key-123')

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockV2Response),
        })

        const result = await searchExerciseByName('bench press')

        expect(result).not.toBeNull()
        expect(result!.bodyParts).toEqual(['chest'])
        expect(result!.targetMuscles).toEqual(['pectorals'])
        expect(result!.equipments).toEqual(['barbell'])
        expect(result!.gifUrl).toContain('exercisedb.p.rapidapi.com/image')
        expect(result!.gifUrl).toContain('exerciseId=100')
      })

      it('falls back to V1 when V2 returns empty results', async () => {
        vi.stubEnv('VITE_RAPIDAPI_KEY', 'test-key-123')

        mockFetch
          // V2 returns empty
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve([]),
          })
          // V1 returns result
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ data: [mockExercise] }),
          })

        const result = await searchExerciseByName('bench press')

        expect(mockFetch).toHaveBeenCalledTimes(2)
        // First call: V2
        expect(mockFetch.mock.calls[0][0]).toContain('exercisedb.p.rapidapi.com')
        // Second call: V1
        expect(mockFetch.mock.calls[1][0]).toContain('oss.exercisedb.dev')
        expect(result).toEqual(mockExercise)
      })
    })
  })

  describe('clearExerciseCache', () => {
    it('removes cache from localStorage', () => {
      mockLocalStorage.store['exercisedb_cache_v4'] = JSON.stringify({})

      clearExerciseCache()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'exercisedb_cache_v4'
      )
    })
  })
})
