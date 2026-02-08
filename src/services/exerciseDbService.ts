// Using open source ExerciseDB API which includes GIF URLs
const BASE_URL = 'https://oss.exercisedb.dev/api/v1'
const CACHE_KEY = 'exercisedb_cache_v3' // Bump version to clear old cache with improved matching
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days (exercises don't change)

// Map app exercise names to ExerciseDB API search terms for better matching
// These mappings help when our exercise names don't match the API's naming conventions
const EXERCISE_NAME_MAPPINGS: Record<string, string> = {
  // Push day exercises
  'incline db press': 'dumbbell incline bench press',
  'overhead db extension': 'dumbbell seated triceps extension',
  'overhead rope extension': 'cable overhead triceps extension',
  'weighted dips': 'weighted tricep dips',
  'cable fly': 'cable crossover',
  'rope pulldown crunches': 'cable crunch',
  'hanging leg raises': 'hanging leg raise',
  'band pull-aparts': 'band pull apart',
  'band shoulder dislocates': 'band shoulder press',

  // Pull day exercises
  'pull-ups': 'pull up',
  't-bar row': 'lever t bar row',
  'close grip lat pulldown': 'cable close grip lat pulldown',
  'single-arm cable row': 'cable one arm seated row',
  'face pulls': 'cable face pull',
  'ez bar curl': 'ez barbell curl',
  'hammer curls': 'dumbbell hammer curl',
  'dead hangs': 'dead hang',
  'scapular pull-ups': 'scapular pull-up',
  'band rows': 'resistance band seated row',
  'reverse crunches': 'reverse crunch',
  'ab wheel rollouts': 'wheel rollout',

  // Legs day exercises
  'hip thrusts': 'barbell hip thrust',
  'goblet squat': 'dumbbell goblet squat',
  'leg press': 'sled leg press',
  'leg extension': 'lever leg extension',
  'lying leg curl': 'lever lying leg curl',
  'hip abductor machine': 'lever seated hip abduction',
  'walking lunges': 'dumbbell walking lunge',
  'seated calf raises': 'lever seated calf raise',
  'air squats': 'bodyweight squat',
  'banded lateral walks': 'resistance band lateral walk',
  'deep squat hold': 'bodyweight squat',
  'zombie walks': 'bodyweight walking lunge',

  // Cardio/warm-up exercises
  'incline treadmill walk': 'walking on incline treadmill',
  'push-ups': 'push up',
  'rowing machine': 'rowing machine',
  'bike or stair stepper': 'stationary bike',
  'plank': 'plank',
}

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
  const normalized = name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical notes like "(each side)"
    .replace(/db\b/gi, 'dumbbell')
    .replace(/bb\b/gi, 'barbell')
    .replace(/\s+/g, ' ')
    .trim()

  // Check if we have a known mapping for this exercise
  if (EXERCISE_NAME_MAPPINGS[normalized]) {
    return EXERCISE_NAME_MAPPINGS[normalized]
  }

  return normalized
}

// Extract the main exercise type keyword for fallback searches
function getMainKeyword(name: string): string | null {
  const keywords = [
    'press', 'curl', 'row', 'squat', 'lunge', 'deadlift', 'fly', 'raise',
    'extension', 'pulldown', 'pull-up', 'pull up', 'dip', 'crunch', 'plank',
    'thrust', 'walk', 'step', 'bike', 'rowing'
  ]

  const nameLower = name.toLowerCase()
  for (const keyword of keywords) {
    if (nameLower.includes(keyword)) {
      return keyword
    }
  }
  return null
}

async function fetchExercises(searchTerm: string): Promise<ExerciseDbExercise[]> {
  const encoded = encodeURIComponent(searchTerm)
  const response = await fetch(`${BASE_URL}/exercises?search=${encoded}&limit=10`)

  if (response.status === 429) {
    // Rate limited - wait and retry once
    await new Promise(resolve => setTimeout(resolve, 1500))
    const retryResponse = await fetch(`${BASE_URL}/exercises?search=${encoded}&limit=10`)
    if (!retryResponse.ok) {
      throw new Error(`API error: ${retryResponse.status}`)
    }
    const retryData = await retryResponse.json()
    return retryData.data || []
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  return data.data || []
}

export async function searchExerciseByName(exerciseName: string): Promise<ExerciseDbExercise | null> {
  const normalizedName = normalizeSearchName(exerciseName)
  const cacheKey = exerciseName.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim()

  // Check cache first
  const cached = getCachedExercise(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  try {
    // First search with the normalized/mapped name
    let exercises = await fetchExercises(normalizedName)
    let exercise = exercises.length > 0 ? findBestMatch(exercises, normalizedName) : null

    // If no good match found, try with just the main keyword + equipment
    if (!exercise) {
      const mainKeyword = getMainKeyword(exerciseName)
      if (mainKeyword) {
        // Try to identify equipment type
        const hasBarbell = /barbell|bb\b/i.test(exerciseName)
        const hasDumbbell = /dumbbell|db\b/i.test(exerciseName)
        const hasCable = /cable|rope/i.test(exerciseName)
        const hasLever = /machine|lever/i.test(exerciseName)

        let fallbackSearch = mainKeyword
        if (hasBarbell) fallbackSearch = `barbell ${mainKeyword}`
        else if (hasDumbbell) fallbackSearch = `dumbbell ${mainKeyword}`
        else if (hasCable) fallbackSearch = `cable ${mainKeyword}`
        else if (hasLever) fallbackSearch = `lever ${mainKeyword}`

        exercises = await fetchExercises(fallbackSearch)
        exercise = exercises.length > 0 ? findBestMatch(exercises, exerciseName.toLowerCase()) : null
      }
    }

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
  const searchWords = searchLower.split(' ').filter(w => w.length > 2) // Filter short words

  // Score-based matching for better results
  let bestMatch: ExerciseDbExercise | null = null
  let bestScore = 0

  for (const exercise of exercises) {
    const nameLower = exercise.name.toLowerCase()
    let score = 0

    // Exact match - highest score
    if (nameLower === searchLower) {
      return exercise // Immediate return for exact match
    }

    // Starts with search term
    if (nameLower.startsWith(searchLower)) {
      score += 50
    }

    // Contains all search words
    const matchingWords = searchWords.filter(word => nameLower.includes(word))
    score += matchingWords.length * 10

    // Bonus for matching word count (similar length names)
    const nameWords = nameLower.split(' ').length
    const searchWordCount = searchWords.length
    if (Math.abs(nameWords - searchWordCount) <= 1) {
      score += 5
    }

    // Contains the search term
    if (nameLower.includes(searchLower)) {
      score += 20
    }

    // Penalize if name is very different length
    const lengthDiff = Math.abs(nameLower.length - searchLower.length)
    score -= Math.min(lengthDiff / 5, 10)

    if (score > bestScore) {
      bestScore = score
      bestMatch = exercise
    }
  }

  // Return best match if score is reasonable, otherwise first result
  return bestScore > 5 ? bestMatch : exercises[0]
}

export function clearExerciseCache(): void {
  localStorage.removeItem(CACHE_KEY)
}
