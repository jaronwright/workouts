// ExerciseDB API service with V2 RapidAPI (primary) and V1 OSS (fallback)
const V1_BASE_URL = 'https://oss.exercisedb.dev/api/v1'
const V2_BASE_URL = 'https://exercisedb.p.rapidapi.com'
const CACHE_KEY = 'exercisedb_cache_v4' // Bump version to clear stale null entries
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days (exercises don't change)

// Read API key dynamically so tests can stub import.meta.env
function getRapidApiKey(): string | undefined {
  return import.meta.env.VITE_RAPIDAPI_KEY as string | undefined
}

// Map app exercise names to ExerciseDB API search terms for better matching
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

  // Upper/Lower plan
  'arm circles': 'arm circles',
  'bent over barbell row': 'barbell bent over row',
  'overhead press': 'barbell overhead press',
  'lat pulldown': 'cable lat pulldown',
  'lateral raises': 'dumbbell lateral raise',
  'tricep pushdown': 'cable pushdown',
  'bodyweight squats': 'bodyweight squat',
  'hip circles': 'hip circles',
  'hip thrust': 'barbell hip thrust',
  'rdl': 'barbell romanian deadlift',
  'leg abduction': 'lever seated hip abduction',
  'bulgarian split squats': 'dumbbell bulgarian split squat',
  'leg cable kickback': 'cable kickback',

  // Mobility plan
  'dead bug': 'dead bug',
  'pallof press hold': 'pallof press',
  'hanging knee raise': 'hanging knee raise',
  'side plank': 'side plank',
  'cossack squat': 'cossack squat',
  'cat-cow': 'cat cow stretch',
  'wall slides': 'wall slide',
  'shoulder cars': 'shoulder circles',
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

// V2 API returns singular fields instead of arrays
interface V2Exercise {
  id: string
  name: string
  bodyPart: string
  target: string
  equipment: string
  secondaryMuscles: string[]
  instructions: string[]
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
  const normalized = name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical notes like "(each side)"
    .replace(/db\b/gi, 'dumbbell')
    .replace(/bb\b/gi, 'barbell')
    .replace(/\s+/g, ' ')
    .trim()

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
    'thrust', 'walk', 'step', 'bike', 'rowing',
    'rotation', 'stretch', 'hang', 'slide', 'circle', 'bug', 'kickback'
  ]

  const nameLower = name.toLowerCase()
  for (const keyword of keywords) {
    if (nameLower.includes(keyword)) {
      return keyword
    }
  }
  return null
}

// --- Exponential backoff fetch ---

async function fetchWithRetry(url: string, headers?: Record<string, string>): Promise<Response> {
  const MAX_RETRIES = 3
  const BASE_DELAY = 2000 // 2s

  const options: RequestInit = headers ? { headers } : {}
  let lastResponse: Response | undefined

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, options)

    if (response.status !== 429 || attempt === MAX_RETRIES) {
      return response
    }

    lastResponse = response
    const delay = BASE_DELAY * Math.pow(2, attempt) // 2s, 4s, 8s
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  // Should not reach here, but satisfy TypeScript
  return lastResponse!
}

// --- Serial request queue ---
// Ensures only 1 API call at a time with minimum gap between calls

let requestQueue: Promise<unknown> = Promise.resolve()
let minGap = 2000

function throttledFetch(url: string, headers?: Record<string, string>): Promise<Response> {
  const task = requestQueue.then(async () => {
    const result = await fetchWithRetry(url, headers)
    if (minGap > 0) {
      await new Promise(resolve => setTimeout(resolve, minGap))
    }
    return result
  })

  // Chain onto queue (ignore errors so queue doesn't break)
  requestQueue = task.catch(() => {})

  return task
}

/** Reset internal queue and delays — for testing only */
export function _resetForTesting(): void {
  requestQueue = Promise.resolve()
  minGap = 0
}

// --- V2 RapidAPI support ---

function normalizeV2Exercise(v2: V2Exercise): ExerciseDbExercise {
  return {
    exerciseId: v2.id,
    name: v2.name,
    gifUrl: `${V2_BASE_URL}/image?exerciseId=${v2.id}&resolution=360&rapidapi-key=${getRapidApiKey()}`,
    targetMuscles: [v2.target],
    bodyParts: [v2.bodyPart],
    equipments: [v2.equipment],
    secondaryMuscles: v2.secondaryMuscles,
    instructions: v2.instructions,
  }
}

async function fetchExercisesV2(searchTerm: string): Promise<ExerciseDbExercise[]> {
  const apiKey = getRapidApiKey()
  if (!apiKey) return []

  const encoded = encodeURIComponent(searchTerm)
  const response = await throttledFetch(
    `${V2_BASE_URL}/exercises/name/${encoded}?limit=10`,
    {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
    }
  )

  if (!response.ok) {
    throw new Error(`V2 API error: ${response.status}`)
  }

  const data: V2Exercise[] = await response.json()
  return (data || []).map(normalizeV2Exercise)
}

async function fetchExercisesV1(searchTerm: string): Promise<ExerciseDbExercise[]> {
  const encoded = encodeURIComponent(searchTerm)
  const response = await throttledFetch(`${V1_BASE_URL}/exercises?search=${encoded}&limit=10`)

  if (!response.ok) {
    throw new Error(`V1 API error: ${response.status}`)
  }

  const data = await response.json()
  return data.data || []
}

async function fetchExercises(searchTerm: string): Promise<ExerciseDbExercise[]> {
  // Try V2 first if API key exists
  if (getRapidApiKey()) {
    try {
      const v2Results = await fetchExercisesV2(searchTerm)
      if (v2Results.length > 0) return v2Results
    } catch {
      // V2 failed, fall through to V1
    }
  }

  // Fall back to V1
  return fetchExercisesV1(searchTerm)
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
    // Don't cache on API errors — allow retries on next attempt
    console.error('Error fetching exercise from ExerciseDB:', error)
    return null
  }
}

function findBestMatch(exercises: ExerciseDbExercise[], searchName: string): ExerciseDbExercise | null {
  if (exercises.length === 0) return null

  const searchLower = searchName.toLowerCase()
  const searchWords = searchLower.split(' ').filter(w => w.length > 2)

  let bestMatch: ExerciseDbExercise | null = null
  let bestScore = 0

  for (const exercise of exercises) {
    const nameLower = exercise.name.toLowerCase()
    let score = 0

    // Exact match - highest score
    if (nameLower === searchLower) {
      return exercise
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

  return bestScore > 5 ? bestMatch : exercises[0]
}

export function clearExerciseCache(): void {
  localStorage.removeItem(CACHE_KEY)
}
