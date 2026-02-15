# PR #2 Review Notes — Exercise Library Integration

## Overview
PR: `claude/exercisedb-api-integration-V8Mmy` | +1269 / -40 lines | 11 files

---

## API Researcher Assessment

### What the PR uses
- V2 RapidAPI: `/exercises/name/{name}`, `/exercises/bodyPart/{bodyPart}`, `/exercises/target/{target}`, `/exercises/equipment/{equipment}`, `/exercises/bodyPartList`, `/exercises/targetList`, `/exercises/equipmentList`, `/image`
- V1 OSS fallback: `/exercises?search=` for name search, attempted browse fallback

### What the PR ignores
- V1 `/exercises/search` endpoint with fuzzy `threshold` parameter
- V1 `/exercises/filter` endpoint for multi-criteria filtering (body part + muscle + equipment simultaneously)
- V1 `includeSecondary` parameter on muscle filter endpoint
- V1 `sortBy` / `sortOrder` parameters
- V1 pagination metadata (totalExercises, totalPages, nextPage, previousPage)

### Critical finding
The premium V2 fields mentioned in the prompt (exerciseTips, variations, relatedExerciseIds, videoUrl, overview, keywords, gender, exerciseType) are **NOT available** through the standard RapidAPI endpoints. They require purchasing the full V2 Premium Dataset (~$50+). Our integration must work with what V1 OSS provides: exerciseId, name, gifUrl, targetMuscles[], bodyParts[], equipments[], secondaryMuscles[], instructions[].

---

## Product Manager Assessment

### What the PR got right
- Exercise detail view with GIF, muscles, instructions
- Category browsing by body part, target, equipment
- GIF thumbnails inline on exercise cards
- Prefetch hook to warm cache on workout page load

### What the PR got wrong
- **Search returns a single exercise** — `SearchView` uses `useExerciseInfo` (returns one match), not a proper list search
- **No pagination** — browse views hardcoded to 20 results with no "load more"
- **Navigation is broken** — back from exercise-detail goes to home, not the previous list
- **`getTitle()` is dead code** — returns same string for every view state
- **No route-based navigation** — browser back button doesn't work within the library

### What's missing
- Mid-workout form guide (instruction overlay during set logging)
- Exercise swap/alternatives feature
- Integration into rest timer (show tips between sets)
- Bottom nav entry — page is buried behind a home screen link

---

## Exercise Expert Assessment

### What works
- GIF autoplay on detail view is correct
- Primary/secondary muscle distinction is a genuine UX win
- Collapsible instructions reduce clutter

### What doesn't work
- **GIF thumbnails play in lists** — 20 animated GIFs in a scrolling list kills performance. Should be static images.
- **Instructions aren't readable mid-workout** — no quick-access overlay during logging
- **No "how-to" button on the exercise logging screen** — the one place users NEED form guidance
- **Tips/coaching cues not surfaced** — V1 doesn't have tips, but instructions could be shown contextually during rest periods
- **Muscles section is just text badges** — effective but could be more visual

---

## Frontend Dev Assessment

### Good patterns
- Discriminated union `ViewState` type is type-safe and clean
- `CATEGORY_CONFIG` centralizes icons/labels/colors
- Consistent CSS variable usage throughout
- `FadeIn` motion wrappers for view transitions

### Problems
- **582-line monolithic page component** — 5 sub-components crammed into one file
- **Duplicate UI code** — `ExerciseDetailView` in library page duplicates `ExerciseDetailModal`
- **No animations on collapsible instructions** — abrupt show/hide, no AnimatePresence
- **Inline SVG instead of lucide icon** — breaks consistency
- **No keyboard accessibility** — interactive divs without onKeyDown handlers

### Missing
- Separate component files in `components/exercises/` directory
- Skeleton/shimmer loading states matching the rest of the app
- Proper entrance/exit animations on view transitions

---

## Backend Dev Assessment

### Good patterns
- Dual-API (V2 primary, V1 fallback) strategy maintained consistently
- Three separate caches with appropriate TTLs (30d lists, 7d browse, 7d individual)
- Graceful degradation — catch blocks return empty arrays
- Uses existing `throttledFetch` queue for rate limiting

### Problems
- **Massive code duplication** — `fetchBodyPartList`/`fetchTargetList`/`fetchEquipmentList` are identical except for strings. Same with the three `fetchExercisesBy*` functions.
- **V1 browse endpoint construction likely wrong** — builds URL with `?bodyPart=chest` which may not be a valid V1 parameter
- **Silent failures** — every catch returns `[]`, making API errors indistinguishable from empty results
- **No cache size limits** — localStorage can grow unbounded
- **No cache cleanup** — expired entries stay forever

### Missing
- Cache eviction strategy
- Error types that propagate to UI
- Unit tests for new functions
- `clearBrowseCache()` function

---

## QA Assessment

### Issues identified (from code review — branch not checked out)
- Search UX is broken (single result instead of list)
- No pagination means large categories show incomplete results
- Navigation stack doesn't work (back always goes home)
- GIF thumbnails cause performance concerns (20 animated GIFs simultaneously)
- No error states shown for API failures (shows "no results" instead)
- No tests added for 1269 new lines of code

---

## Summary: Our Improvement Plan

1. **Use V1 OSS as primary API** — it has better search (fuzzy, multi-criteria), pagination metadata, and no API key requirement. Use V2 only for GIF resolution options.
2. **Build proper list search** — return paginated results, not single match
3. **Component architecture** — separate files, no monolithic pages
4. **Static thumbnails** — use first-frame images or low-res static previews in lists
5. **Mid-workout integration** — form guide overlay during set logging
6. **Navigation** — proper route-based navigation with browser back button support
7. **Performance** — lazy loading, intersection observer, cache size limits
8. **Error handling** — propagate errors to UI, show proper error states
