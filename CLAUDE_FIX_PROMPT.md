# Bug Fix Prompt for Claude Code

## Usage

```bash
cd /Users/jaronwright/src/workouts
claude --dangerously-skip-permissions "$(cat CLAUDE_FIX_PROMPT.md)"
```

---

## Prompt

You are an autonomous senior frontend engineer. Your job is to fix every bug listed below in this workout-tracker React app. Do NOT ask for any user input. Make minimal, surgical fixes — don't refactor or rewrite unless necessary to fix the bug. After each fix, run `npx vitest run` to make sure you haven't broken existing tests. If a fix breaks a test, update the test to match the corrected behavior (not the buggy behavior).

IMPORTANT RULES:
- Read each file before editing it. Understand the full context.
- Make the smallest change that fixes the bug.
- If a fix requires changing a test, change the test.
- After ALL fixes are done, run `npm run build`, `npm run lint`, and `npx vitest run` — all three must pass cleanly.
- Do NOT ask for input. Make all decisions yourself.

---

## BUG 1 — CRITICAL: PWA caches auth endpoints and error responses

**File:** `vite.config.ts`, lines ~45-59
**What's wrong:** The Workbox runtimeCaching config caches ALL Supabase REST API calls (`/rest/v1/.*`) with `NetworkFirst` and `statuses: [0, 200]`. This means:
- Auth tokens and session data get cached and served stale
- Status `0` (network errors / opaque responses) get cached permanently, making the app appear offline even after recovery
- Deleted workouts and profile changes still show from cache

**Fix:**
1. Change the URL pattern to EXCLUDE auth endpoints. Only cache read-only data endpoints.
2. Remove status `0` from `cacheableResponse.statuses` — only cache `[200]`.
3. Add `expiration` with `maxEntries: 50` and `maxAgeSeconds: 3600` (1 hour, not 24 hours).
4. Add a separate entry for static assets (images, fonts) that CAN be cached longer.

---

## BUG 2 — HIGH: Auth listener memory leak

**File:** `src/stores/authStore.ts`, lines ~217-222
**What's wrong:** `supabase.auth.onAuthStateChange()` is called inside `initialize()` but the returned subscription is never stored or unsubscribed. Each call to `initialize()` adds another listener. Listeners accumulate and fire stale callbacks.

**Fix:**
1. Store the subscription reference at module level or in the store state.
2. Before registering a new listener, unsubscribe the previous one.
3. Example pattern:
```typescript
let authSubscription: { unsubscribe: () => void } | null = null

// Inside initialize():
if (authSubscription) {
  authSubscription.unsubscribe()
}
const { data: { subscription } } = supabase.auth.onAuthStateChange(...)
authSubscription = subscription
```

---

## BUG 3 — HIGH: Auth listener registered AFTER session fetch (race condition)

**File:** `src/stores/authStore.ts`, lines ~210-222
**What's wrong:** `getSession()` is called first (line ~210), then `onAuthStateChange()` is registered (line ~217). If an auth event fires between these two calls, it's missed, leaving the UI with stale auth state.

**Fix:** Reverse the order. Register the `onAuthStateChange` listener FIRST, then call `getSession()`. This ensures no auth events are missed during the network round trip.

---

## BUG 4 — HIGH: ExerciseCard stale closure in handleToggleUnit

**File:** `src/components/workout/ExerciseCard.tsx`, lines ~61-77
**What's wrong:** In `handleToggleUnit`, when an error occurs, the code reverts with `setLocalWeightUnit(localWeightUnit)` — but `localWeightUnit` is the OLD value captured in the closure at the time the function was created. On rapid toggles, this reverts to the wrong value.

**Fix:** Store the old value in a local variable at the top of the function before changing state:
```typescript
const handleToggleUnit = async (e: React.MouseEvent) => {
  e.stopPropagation()
  const oldUnit = localWeightUnit
  const newUnit = oldUnit === 'lbs' ? 'kg' : 'lbs'
  setLocalWeightUnit(newUnit)
  try {
    // ... API call
  } catch {
    setLocalWeightUnit(oldUnit) // Use the saved value, not closure
  }
}
```
Actually — since `setLocalWeightUnit` is a React state setter, the value may already have changed by the time the catch runs. The safest fix is to use a functional update:
```typescript
// On error, toggle back:
setLocalWeightUnit(prev => prev === 'lbs' ? 'kg' : 'lbs')
```
Or simply use the local `oldUnit` variable since it's captured correctly at function start.

---

## BUG 5 — HIGH: templateWorkoutService silently falls back to memory

**File:** `src/services/templateWorkoutService.ts`, lines ~67-82
**What's wrong:** When `startTemplateWorkout()` fails (e.g., table doesn't exist), it silently creates a fake session object in memory with `crypto.randomUUID()`. This session is never persisted to Supabase. If the user refreshes, the session is lost — data gone, no error shown.

**Fix:**
1. If the Supabase insert fails, throw the error instead of silently creating a fake session.
2. Let the calling component handle the error and show a toast.
3. If you need a fallback for offline mode, use `localStorage` to persist the session and sync later. But the simplest fix is: throw the error.

Also fix lines ~122-125 and ~157-159 where catch blocks return empty arrays/null, masking real errors. Pattern:
```typescript
catch (error: any) {
  // Only silence "table not found" errors, rethrow everything else
  if (error?.code === '42P01') { // PostgreSQL: undefined table
    return []
  }
  throw error
}
```

---

## BUG 6 — HIGH: Missing onError handlers on CardioWorkout mutations

**File:** `src/pages/CardioWorkout.tsx`, lines ~74-82 and ~141-149
**What's wrong:** `startWorkout.mutate()` and `completeWorkout.mutate()` have `onSuccess` callbacks but no `onError`. If the mutation fails, the UI still shows "timer running" or "completing" state with no feedback to the user.

**Fix:** Add `onError` callbacks to both mutations:
```typescript
startWorkout.mutate(templateId, {
  onSuccess: (session) => { /* existing code */ },
  onError: () => {
    setIsRunning(false)
    // Show error toast
    showToast('Failed to start workout. Please try again.', 'error')
  }
})
```
Do the same for `completeWorkout.mutate()`.

Then audit ALL other `.mutate()` calls across the entire codebase — every mutation that optimistically updates local state needs an `onError` handler to roll it back. Check these files:
- `src/pages/Workout.tsx`
- `src/pages/MobilityWorkout.tsx`
- `src/pages/Profile.tsx`
- `src/pages/Schedule.tsx`
- `src/components/workout/ExerciseCard.tsx`
- `src/components/profile/AvatarUpload.tsx`

---

## BUG 7 — MEDIUM: Double initialization

**File:** `src/App.tsx`, lines ~208-212, and `src/hooks/useAuth.ts`, lines ~17-19
**What's wrong:** `initialize()` is called in two places:
1. In the `useAuth` hook's `useEffect` (useAuth.ts line ~17)
2. In `AppRoutes` component's `useEffect` (App.tsx line ~212)

This causes `initialize()` to run twice on app startup. The guard (`if (get().initialized) return`) prevents real damage, but it's wasteful and makes control flow confusing.

**Fix:** Remove ONE of the two calls. The cleanest approach: keep the call in `useAuth.ts` (since it's the auth hook's job) and remove the explicit `initialize()` call from `AppRoutes` in `App.tsx`. Just keep `initializeTheme()` there.

---

## BUG 8 — MEDIUM: CardioWorkout timer stale closure

**File:** `src/pages/CardioWorkout.tsx`, lines ~79-81 and ~97
**What's wrong:** The timer interval calculates elapsed time as `Math.floor((Date.now() - startTimeRef.current!) / 1000)`. When the user pauses and resumes, `handleTimerResume()` recalculates `startTimeRef` but the existing interval may still be running with the old reference. This can cause time jumps.

Additionally, if the browser suspends the tab (mobile background, laptop sleep), `Date.now()` jumps forward when resumed, corrupting elapsed time.

**Fix:**
1. Track `accumulatedSeconds` as a ref that stores elapsed time at each pause.
2. On pause: `accumulatedSecondsRef.current = elapsedSeconds`
3. On resume: set `startTimeRef.current = Date.now()`, then the interval calculates `accumulatedSecondsRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000)`
4. Always clear the old interval before creating a new one.
5. Cap the maximum delta per tick (e.g., if delta > 2 seconds, use 1 second) to handle browser suspension gracefully.

---

## BUG 9 — MEDIUM: CardioWorkout unsafe non-null assertion

**File:** `src/pages/CardioWorkout.tsx`, line ~80
**What's wrong:** `startTimeRef.current!` uses TypeScript non-null assertion. If the interval fires before `handleTimerStart` sets the ref, or after a race condition, this crashes.

**Fix:** Add a null guard:
```typescript
setInterval(() => {
  if (startTimeRef.current === null) return
  setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
}, 1000)
```

---

## BUG 10 — MEDIUM: profileService silently swallows all errors

**File:** `src/services/profileService.ts`, lines ~28-40
**What's wrong:** `getProfile()` catches all errors and returns `null`. Callers can't tell the difference between "user has no profile" and "network is down."

**Fix:** Only return `null` for "not found" cases. Re-throw actual errors:
```typescript
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // "not found" — user has no profile yet
      return null
    }
    throw error // Network errors, permission errors — let caller handle
  }
  return data
}
```
Then check callers of `getProfile()` to ensure they handle thrown errors (try/catch or React Query's error state).

---

## BUG 11 — MEDIUM: templateWorkoutService error masking

**File:** `src/services/templateWorkoutService.ts`, lines ~122-125, ~157-159
**What's wrong:** Multiple functions catch ALL errors and return empty arrays or null. This masks real database errors, permission failures, and network issues.

**Fix:** Same pattern as Bug 5 — only silence known expected errors (like missing table), re-throw everything else. For each catch block:
```typescript
catch (error: any) {
  if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
    console.warn('Table not found, returning empty')
    return []
  }
  throw error
}
```

---

## BUG 12 — MEDIUM: Home.tsx setTimeout without cleanup

**File:** `src/pages/Home.tsx`, lines ~251-259
**What's wrong:** A `setTimeout(() => setShowOnboarding(true), 0)` is called inside a useEffect but the timeout ID is never stored or cleared. If the component unmounts before the timeout fires, React gets a state update on an unmounted component.

**Fix:**
```typescript
useEffect(() => {
  // ... existing logic
  const timeoutId = setTimeout(() => setShowOnboarding(true), 0)
  return () => clearTimeout(timeoutId)
}, [/* deps */])
```

---

## BUG 13 — MEDIUM: Home.tsx nullable workout_day access

**File:** `src/pages/Home.tsx`, line ~350
**What's wrong:** `getWorkoutDisplayName(activeSession.workout_day?.name)` passes potentially `undefined` to `getWorkoutDisplayName()`. If the Supabase join fails or returns null for `workout_day`, this could show "undefined" in the UI or crash.

**Fix:** Add a fallback:
```typescript
getWorkoutDisplayName(activeSession.workout_day?.name ?? 'Workout')
```
Also check line ~298-299 for similar `workout_day_id` access and add fallbacks.

---

## BUG 14 — LOW: workoutStore Map not serializable

**File:** `src/stores/workoutStore.ts`, line ~28
**What's wrong:** `completedSets: new Map()` uses JavaScript Map. While this store is NOT currently persisted (so no active bug), if anyone adds persistence later, Maps don't serialize to JSON and the data will be silently lost.

**Fix:** Replace `Map` with a plain object `Record<string, Set[]>`:
```typescript
completedSets: {} as Record<string, any[]>
```
And update all `.get()`, `.set()`, `.has()` calls to use object bracket notation. This future-proofs the store.

Alternatively, if you want to keep Map, add a comment warning against persistence:
```typescript
// WARNING: This store uses Map. Do NOT add Zustand persist middleware without custom serialization.
completedSets: new Map()
```

---

## FINAL VERIFICATION

After all bugs are fixed:

1. Run `npx vitest run --reporter=verbose` — ALL tests must pass. Zero failures.
2. Run `npm run build` — clean build, zero errors, zero warnings.
3. Run `npm run lint` — clean lint.
4. Start dev server (`npm run dev`) in background, curl `http://localhost:5173` to verify it serves HTML, then kill it.
5. Write tests for the bugs you fixed. For each bug, write at least one test that would have caught it. Add these to the existing test files or create new ones as appropriate.

Then update `TEST_REPORT.md` with a new section called "## Bug Fix Run" that lists:
- Each bug fixed (number and title)
- The exact files and lines changed
- How many new tests were added
- Final test count and pass/fail status
- Final coverage numbers

Do NOT skip any bug. Do NOT ask for input. Fix them all, verify, and report.
