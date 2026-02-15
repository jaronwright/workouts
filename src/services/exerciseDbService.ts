// ExerciseDB API service with V2 RapidAPI (primary) and V1 OSS (fallback)
const V1_BASE_URL = 'https://oss.exercisedb.dev/api/v1'
const V2_BASE_URL = 'https://exercisedb.p.rapidapi.com'
const CACHE_KEY = 'exercisedb_cache_v5' // Bump version to clear stale null entries
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days (exercises don't change)
const NULL_CACHE_DURATION = 60 * 60 * 1000 // 1 hour for failed lookups

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
  'ab wheel rollout': 'wheel rollout',

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
  'banded lateral walk': 'resistance band lateral walk',
  'deep squat hold': 'bodyweight squat',
  'zombie walks': 'bodyweight walking lunge',

  // Cardio/warm-up exercises
  'incline treadmill walk': 'walking on incline treadmill',
  'push-ups': 'push up',
  'rowing machine': 'rowing machine',
  'bike or stair stepper': 'stationary bike',
  'bike': 'stationary bike',
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

  // Full Body plan
  'leg curl': 'lever lying leg curl',
  'single-arm dumbbell row': 'dumbbell one arm row',
  'single leg rdl': 'dumbbell single leg deadlift',
  'barbell back squat': 'barbell squat',
  'barbell row': 'barbell bent over row',
  'cable row': 'cable seated row',

  // Bro Split plan
  'pec deck machine': 'pec deck fly',
  'decline dumbbell press': 'dumbbell decline bench press',
  'straight arm pulldown': 'cable straight arm pulldown',
  'seated dumbbell shoulder press': 'dumbbell seated shoulder press',
  'rear delt fly machine': 'lever rear delt fly',
  'incline dumbbell curl': 'dumbbell incline curl',
  'close grip bench press': 'close grip barbell bench press',
  'band curl': 'resistance band bicep curl',
  'dumbbell front raise': 'dumbbell front raise',
  'cable lateral raise': 'cable lateral raise',

  // Glute Hypertrophy plan
  'romanian deadlift': 'barbell romanian deadlift',
  'glute-focused hyperextension': 'hyperextension',
  'seated leg curl': 'lever seated leg curl',
  'single-leg hip thrust': 'single leg hip thrust',
  'cable pull-through': 'cable pull through',
  'incline dumbbell press': 'dumbbell incline bench press',
  'banded glute bridge': 'resistance band glute bridge',
  'banded monster walk': 'resistance band monster walk',
  'jump rope or jumping jacks': 'jumping jack',
  'scapula push-ups': 'scapular push up',
  'bicep curl': 'dumbbell bicep curl',
  'overhead tricep extension': 'dumbbell overhead tricep extension',
  'rear delt fly': 'dumbbell rear delt fly',
  'banded clamshell': 'resistance band hip abduction',
  'banded fire hydrant': 'resistance band fire hydrant',
  'glute bridge hold': 'glute bridge',
  'cable glute kickback': 'cable kickback',
  'abductor machine': 'lever seated hip abduction',
  'step-ups': 'dumbbell step up',
  'step-up': 'dumbbell step up',
  'smith machine hip thrust': 'smith machine hip thrust',
  'walking quad stretch': 'quad stretch',
  'band dislocate': 'band pull apart',

  // Mobility - CARs (Controlled Articular Rotations)
  'shoulder cars': 'shoulder circles',
  'ankle cars': 'ankle circles',
  'wrist cars': 'wrist circles',
  'hip cars': 'hip circles',
  'elbow cars': 'elbow circles',

  // Mobility - Core Stability
  'dead bug': 'dead bug',
  'pallof press hold': 'pallof press',
  'pallof press': 'pallof press',
  'hanging knee raise': 'hanging knee raise',
  'side plank': 'side plank',
  'hollow body hold': 'hollow body',
  'plank with shoulder tap': 'plank',
  'turkish get-up': 'turkish get up',
  'bear crawl hold': 'bear crawl',
  'banded dead bug': 'dead bug',
  'copenhagen plank': 'copenhagen side bridge',

  // Mobility - Hip, Knee & Ankle
  'cossack squat': 'cossack squat',
  '90/90 hip switches': '90 90 hip switch',
  '90/90 hip switch': '90 90 hip switch',
  'walking knee hug': 'knee hug',
  'lateral lunge hold': 'lateral lunge',
  'shin box transition': 'shin box',
  'half kneeling hip flexor stretch': 'hip flexor stretch',

  // Mobility - Spine
  'cat-cow': 'cat cow stretch',
  'thoracic rotation': 'thoracic spine rotation',
  'side-lying windmill': 'windmill',
  'prone press-up': 'cobra stretch',
  "child's pose with lateral reach": "child's pose",
  'supine spinal twist': 'supine twist',

  // Mobility - Upper Body
  'wall slides': 'wall slide',
  'prone y-t-w raise': 'prone y raise',
  'side-lying external rotation': 'side lying external rotation',

  // Mobility - Full Body Recovery
  'supine figure-4 stretch': 'figure 4 stretch',
  'prone quad stretch': 'lying quad stretch',
  'neck half circle': 'neck circles',
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

  // Use shorter expiration for null entries (failed lookups) so they retry sooner
  const maxAge = entry.data === null ? NULL_CACHE_DURATION : CACHE_DURATION
  if (Date.now() - entry.timestamp > maxAge) {
    return undefined
  }

  return entry.data
}

function normalizeSearchName(name: string): string {
  let normalized = name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical notes like "(each side)"
    .replace(/db\b/gi, 'dumbbell')
    .replace(/bb\b/gi, 'barbell')
    .replace(/\s+/g, ' ')
    .trim()

  // Check mapping before stripping plurals (some mapped names are plural)
  if (EXERCISE_NAME_MAPPINGS[normalized]) {
    return EXERCISE_NAME_MAPPINGS[normalized]
  }

  // Strip trailing 's' from last word to handle plurals:
  // "mountain climbers" → "mountain climber", "walking lunges" → "walking lunge"
  // Avoid stripping from words ending in 'ss' (e.g., "press") or short words
  normalized = normalized.replace(/(?<=[a-z]{2}[^s])s$/, '')

  // Check mapping again after stripping plural
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
    'rotation', 'stretch', 'hang', 'slide', 'circle', 'bug', 'kickback',
    'bridge', 'kick', 'climber', 'twist', 'hyperextension', 'shrug',
    'calf', 'hip', 'glute', 'ab', 'pullover',
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

  const data = await response.json()
  if (!Array.isArray(data)) return []
  return data.map(normalizeV2Exercise)
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
  localStorage.removeItem(BROWSE_CACHE_KEY)
  localStorage.removeItem(LIST_CACHE_KEY)
}

// ═══════════════════════════════════════════════════════════════
// Browse, Search & Filter — V1 OSS API (primary for library)
// ═══════════════════════════════════════════════════════════════

const BROWSE_CACHE_KEY = 'exercisedb_browse_v1'
const BROWSE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days
const LIST_CACHE_KEY = 'exercisedb_lists_v1'
const LIST_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days — categories rarely change
const MAX_BROWSE_CACHE_ENTRIES = 200

// --- V1 response types ---

export interface V1PaginationMeta {
  totalExercises: number
  totalPages: number
  currentPage: number
  previousPage: string | null
  nextPage: string | null
}

export interface V1Response {
  success: boolean
  metadata: V1PaginationMeta
  data: ExerciseDbExercise[]
}

export interface ExerciseBrowseResult {
  exercises: ExerciseDbExercise[]
  pagination: V1PaginationMeta
}

// --- Browse cache (separate from individual exercise cache) ---

interface BrowseCacheEntry {
  data: ExerciseBrowseResult
  timestamp: number
}

interface BrowseCacheStorage {
  [key: string]: BrowseCacheEntry
}

function getBrowseCache(): BrowseCacheStorage {
  try {
    const cached = localStorage.getItem(BROWSE_CACHE_KEY)
    return cached ? JSON.parse(cached) : {}
  } catch {
    return {}
  }
}

function setBrowseCache(key: string, data: ExerciseBrowseResult): void {
  try {
    const cache = getBrowseCache()
    // Enforce size limit with LRU eviction
    const entries = Object.entries(cache)
    if (entries.length >= MAX_BROWSE_CACHE_ENTRIES) {
      // Remove oldest 20% of entries
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      const toRemove = Math.ceil(entries.length * 0.2)
      for (let i = 0; i < toRemove; i++) {
        delete cache[entries[i][0]]
      }
    }
    cache[key] = { data, timestamp: Date.now() }
    localStorage.setItem(BROWSE_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage might be full
  }
}

function getCachedBrowse(key: string): ExerciseBrowseResult | undefined {
  const cache = getBrowseCache()
  const entry = cache[key]
  if (!entry) return undefined
  if (Date.now() - entry.timestamp > BROWSE_CACHE_DURATION) return undefined
  return entry.data
}

// --- Category list cache ---

interface ListCacheStorage {
  [key: string]: { data: string[]; timestamp: number }
}

function getListCache(): ListCacheStorage {
  try {
    const cached = localStorage.getItem(LIST_CACHE_KEY)
    return cached ? JSON.parse(cached) : {}
  } catch {
    return {}
  }
}

function setListCache(key: string, data: string[]): void {
  try {
    const cache = getListCache()
    cache[key] = { data, timestamp: Date.now() }
    localStorage.setItem(LIST_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage might be full
  }
}

function getCachedList(key: string): string[] | undefined {
  const cache = getListCache()
  const entry = cache[key]
  if (!entry) return undefined
  if (Date.now() - entry.timestamp > LIST_CACHE_DURATION) return undefined
  return entry.data
}

// --- Category list endpoints ---

export async function fetchBodyPartList(): Promise<string[]> {
  const cached = getCachedList('bodyparts')
  if (cached) return cached

  try {
    const response = await throttledFetch(`${V1_BASE_URL}/bodyparts`)
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    const json = await response.json()
    const data: string[] = json.data || json || []
    setListCache('bodyparts', data)
    return data
  } catch (error) {
    console.error('Failed to fetch body parts:', error)
    return []
  }
}

export async function fetchTargetMuscleList(): Promise<string[]> {
  const cached = getCachedList('muscles')
  if (cached) return cached

  try {
    const response = await throttledFetch(`${V1_BASE_URL}/muscles`)
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    const json = await response.json()
    const data: string[] = json.data || json || []
    setListCache('muscles', data)
    return data
  } catch (error) {
    console.error('Failed to fetch target muscles:', error)
    return []
  }
}

export async function fetchEquipmentList(): Promise<string[]> {
  const cached = getCachedList('equipments')
  if (cached) return cached

  try {
    const response = await throttledFetch(`${V1_BASE_URL}/equipments`)
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    const json = await response.json()
    const data: string[] = json.data || json || []
    setListCache('equipments', data)
    return data
  } catch (error) {
    console.error('Failed to fetch equipment:', error)
    return []
  }
}

// --- Browse exercises by category ---

export async function fetchExercisesByBodyPart(
  bodyPart: string,
  offset = 0,
  limit = 20
): Promise<ExerciseBrowseResult> {
  const cacheKey = `bp:${bodyPart}:${offset}:${limit}`
  const cached = getCachedBrowse(cacheKey)
  if (cached) return cached

  try {
    const encoded = encodeURIComponent(bodyPart)
    const response = await throttledFetch(
      `${V1_BASE_URL}/bodyparts/${encoded}/exercises?offset=${offset}&limit=${limit}`
    )
    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const json: V1Response = await response.json()
    const result: ExerciseBrowseResult = {
      exercises: json.data || [],
      pagination: json.metadata || { totalExercises: 0, totalPages: 0, currentPage: 1, previousPage: null, nextPage: null },
    }
    setBrowseCache(cacheKey, result)
    return result
  } catch (error) {
    console.error(`Failed to fetch exercises for body part "${bodyPart}":`, error)
    return { exercises: [], pagination: { totalExercises: 0, totalPages: 0, currentPage: 1, previousPage: null, nextPage: null } }
  }
}

export async function fetchExercisesByMuscle(
  muscle: string,
  offset = 0,
  limit = 20,
  includeSecondary = false
): Promise<ExerciseBrowseResult> {
  const cacheKey = `mu:${muscle}:${offset}:${limit}:${includeSecondary}`
  const cached = getCachedBrowse(cacheKey)
  if (cached) return cached

  try {
    const encoded = encodeURIComponent(muscle)
    const url = `${V1_BASE_URL}/muscles/${encoded}/exercises?offset=${offset}&limit=${limit}${includeSecondary ? '&includeSecondary=true' : ''}`
    const response = await throttledFetch(url)
    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const json: V1Response = await response.json()
    const result: ExerciseBrowseResult = {
      exercises: json.data || [],
      pagination: json.metadata || { totalExercises: 0, totalPages: 0, currentPage: 1, previousPage: null, nextPage: null },
    }
    setBrowseCache(cacheKey, result)
    return result
  } catch (error) {
    console.error(`Failed to fetch exercises for muscle "${muscle}":`, error)
    return { exercises: [], pagination: { totalExercises: 0, totalPages: 0, currentPage: 1, previousPage: null, nextPage: null } }
  }
}

export async function fetchExercisesByEquipment(
  equipment: string,
  offset = 0,
  limit = 20
): Promise<ExerciseBrowseResult> {
  const cacheKey = `eq:${equipment}:${offset}:${limit}`
  const cached = getCachedBrowse(cacheKey)
  if (cached) return cached

  try {
    const encoded = encodeURIComponent(equipment)
    const response = await throttledFetch(
      `${V1_BASE_URL}/equipments/${encoded}/exercises?offset=${offset}&limit=${limit}`
    )
    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const json: V1Response = await response.json()
    const result: ExerciseBrowseResult = {
      exercises: json.data || [],
      pagination: json.metadata || { totalExercises: 0, totalPages: 0, currentPage: 1, previousPage: null, nextPage: null },
    }
    setBrowseCache(cacheKey, result)
    return result
  } catch (error) {
    console.error(`Failed to fetch exercises for equipment "${equipment}":`, error)
    return { exercises: [], pagination: { totalExercises: 0, totalPages: 0, currentPage: 1, previousPage: null, nextPage: null } }
  }
}

// --- Fuzzy search ---

export async function searchExercises(
  query: string,
  offset = 0,
  limit = 20
): Promise<ExerciseBrowseResult> {
  const cacheKey = `search:${query.toLowerCase()}:${offset}:${limit}`
  const cached = getCachedBrowse(cacheKey)
  if (cached) return cached

  try {
    const encoded = encodeURIComponent(query)
    const response = await throttledFetch(
      `${V1_BASE_URL}/exercises/search?q=${encoded}&offset=${offset}&limit=${limit}`
    )
    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const json: V1Response = await response.json()
    const result: ExerciseBrowseResult = {
      exercises: json.data || [],
      pagination: json.metadata || { totalExercises: 0, totalPages: 0, currentPage: 1, previousPage: null, nextPage: null },
    }
    setBrowseCache(cacheKey, result)
    return result
  } catch (error) {
    console.error(`Failed to search exercises for "${query}":`, error)
    return { exercises: [], pagination: { totalExercises: 0, totalPages: 0, currentPage: 1, previousPage: null, nextPage: null } }
  }
}

// --- Get single exercise by ID ---

export async function fetchExerciseById(exerciseId: string): Promise<ExerciseDbExercise | null> {
  // Check individual cache first
  const cached = getCachedExercise(`id:${exerciseId}`)
  if (cached !== undefined) return cached

  try {
    const response = await throttledFetch(`${V1_BASE_URL}/exercises/${encodeURIComponent(exerciseId)}`)
    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const json = await response.json()
    const exercise: ExerciseDbExercise = json.data || json
    setCache(`id:${exerciseId}`, exercise)
    return exercise
  } catch (error) {
    console.error(`Failed to fetch exercise ${exerciseId}:`, error)
    return null
  }
}

// --- Find alternatives (same target muscle) ---

export async function fetchAlternativeExercises(
  targetMuscle: string,
  excludeId?: string,
  limit = 10
): Promise<ExerciseDbExercise[]> {
  const result = await fetchExercisesByMuscle(targetMuscle, 0, limit + 1)
  let exercises = result.exercises
  if (excludeId) {
    exercises = exercises.filter(e => e.exerciseId !== excludeId)
  }
  return exercises.slice(0, limit)
}
