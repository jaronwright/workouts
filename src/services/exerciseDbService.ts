// Using open source ExerciseDB API which includes GIF URLs
const BASE_URL = 'https://oss.exercisedb.dev/api/v1'
const CACHE_KEY = 'exercisedb_cache_v2'
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days (exercises don't change)

export interface ExerciseDbExercise {
  exerciseId: string
  name: string
  gifUrl: string
  targetMuscles: string[]
  bodyParts: string[]
  equipments: string[]
  secondaryMuscles: string[]
  instructions: string[]
}

interface CacheEntry {
  data: ExerciseDbExercise | null
  timestamp: number
}

interface CacheStorage {
  [key: string]: CacheEntry
}

function getCache(): CacheStorage {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : {}
  } catch {
    return {}
  }
}

function setCache(key: string, data: ExerciseDbExercise | null): void {
  try {
    const cache = getCache()
    cache[key] = { data, timestamp: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage might be full or unavailable
  }
}

function getCachedExercise(key: string): ExerciseDbExercise | null | undefined {
  const cache = getCache()
  const entry = cache[key]

  if (!entry) return undefined

  // Check if cache is expired
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    return undefined
  }

  return entry.data
}

function normalizeSearchName(name: string): string {
  // Convert exercise name to a search-friendly format
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical notes like "(each side)"
    .replace(/db\b/gi, 'dumbbell')
    .replace(/bb\b/gi, 'barbell')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function searchExerciseByName(exerciseName: string): Promise<ExerciseDbExercise | null> {
  const normalizedName = normalizeSearchName(exerciseName)
  const cacheKey = normalizedName.toLowerCase()

  // Check cache first
  const cached = getCachedExercise(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  try {
    // Search by name using the open source API
    const searchTerm = encodeURIComponent(normalizedName)
    const response = await fetch(
      `${BASE_URL}/exercises?search=${searchTerm}&limit=5`
    )

    if (!response.ok) {
      // If rate limited, try again after a short delay
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const retryResponse = await fetch(
          `${BASE_URL}/exercises?search=${searchTerm}&limit=5`
        )
        if (!retryResponse.ok) {
          throw new Error(`API error: ${retryResponse.status}`)
        }
        const retryData = await retryResponse.json()
        const exercise = retryData.data?.length > 0 ? findBestMatch(retryData.data, normalizedName) : null
        setCache(cacheKey, exercise)
        return exercise
      }
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const exercises: ExerciseDbExercise[] = data.data || []

    // Find best match - prefer exact or close matches
    const exercise = exercises.length > 0 ? findBestMatch(exercises, normalizedName) : null

    // Cache the result (even null to avoid repeated failed lookups)
    setCache(cacheKey, exercise)

    return exercise
  } catch (error) {
    console.error('Error fetching exercise from ExerciseDB:', error)
    return null
  }
}

function findBestMatch(exercises: ExerciseDbExercise[], searchName: string): ExerciseDbExercise | null {
  if (exercises.length === 0) return null

  const searchLower = searchName.toLowerCase()
  const searchWords = searchLower.split(' ')

  // First, try exact match
  const exact = exercises.find(e => e.name.toLowerCase() === searchLower)
  if (exact) return exact

  // Then try starts with
  const startsWith = exercises.find(e => e.name.toLowerCase().startsWith(searchLower))
  if (startsWith) return startsWith

  // Then try contains all words
  const containsAll = exercises.find(e => {
    const nameLower = e.name.toLowerCase()
    return searchWords.every(word => nameLower.includes(word))
  })
  if (containsAll) return containsAll

  // Then try contains the search term
  const contains = exercises.find(e => e.name.toLowerCase().includes(searchLower))
  if (contains) return contains

  // Return first result as fallback
  return exercises[0]
}

export function clearExerciseCache(): void {
  localStorage.removeItem(CACHE_KEY)
}
