# ExerciseDB Teardown Audit

## Date: 2026-02-15
## Reason: Hobby plan hard cap (2,000 calls/month) burned through in days

---

## Complete Touchpoint Inventory

### API Service Layer

| Item | File Path | API Calls Made | Can Remove? | Notes |
|------|-----------|----------------|-------------|-------|
| V2 RapidAPI client | `src/services/exerciseDbService.ts:351-371` | 1+ per search | REPLACE | Keep name mappings for edge function |
| V1 OSS fallback | `src/services/exerciseDbService.ts:373-398` | 1+ per search | REPLACE | Falls back when no RapidAPI key |
| Name search function | `src/services/exerciseDbService.ts:400-444` | 1-2 per exercise | REPLACE | Core lookup — move to edge function |
| Body part list | `src/services/exerciseDbService.ts:626-641` | 1 per call | REMOVE | Powers Explore Exercises / Library |
| Target muscle list | `src/services/exerciseDbService.ts:643-658` | 1 per call | REMOVE | Powers Library muscle filter |
| Equipment list | `src/services/exerciseDbService.ts:660-675` | 1 per call | REMOVE | Powers Library equipment filter |
| Browse by body part | `src/services/exerciseDbService.ts:679-706` | 1 per page | REMOVE | Library category browsing |
| Browse by muscle | `src/services/exerciseDbService.ts:708-735` | 1 per page | REMOVE | Library muscle browsing |
| Browse by equipment | `src/services/exerciseDbService.ts:737-764` | 1 per page | REMOVE | Library equipment browsing |
| Fuzzy search | `src/services/exerciseDbService.ts:768-795` | 1 per query | REMOVE | Library search bar |
| Fetch by ID | `src/services/exerciseDbService.ts:799-816` | 1 per exercise | REMOVE | Exercise detail page |
| Fetch alternatives | `src/services/exerciseDbService.ts:820-831` | 1 per request | REMOVE | Swap sheet + detail alternatives |
| Exercise name mappings | `src/services/exerciseDbService.ts:14-170` | 0 (data only) | PRESERVE | 130+ mappings for edge function |
| localStorage cache (exercises) | `exercisedb_cache_v5` | 0 | REMOVE | Replaced by Supabase cache |
| localStorage cache (browse) | `exercisedb_browse_v1` | 0 | REMOVE | Feature removed |
| localStorage cache (lists) | `exercisedb_lists_v2` | 0 | REMOVE | Feature removed |
| API key in frontend | `.env.local:VITE_RAPIDAPI_KEY` | 0 | REMOVE | Moves to Supabase edge function secret |

### Hooks

| Item | File Path | API Calls Made | Can Remove? | Notes |
|------|-----------|----------------|-------------|-------|
| `useExerciseInfo` | `src/hooks/useExerciseGif.ts` | 1 per exercise per render | REPLACE | Rewire to Supabase cache |
| `useBodyPartList` | `src/hooks/useExerciseLibrary.ts:21-28` | 1 | REMOVE | Powers Home + Library |
| `useTargetMuscleList` | `src/hooks/useExerciseLibrary.ts:30-37` | 1 | REMOVE | Powers Library |
| `useEquipmentList` | `src/hooks/useExerciseLibrary.ts:39-46` | 1 | REMOVE | Powers Library |
| `useExerciseBrowse` | `src/hooks/useExerciseLibrary.ts:63-81` | 1 per page | REMOVE | Powers Library |
| `useExerciseSearch` | `src/hooks/useExerciseLibrary.ts:85-104` | 1 per query | REMOVE | Powers Library |
| `useExerciseDetail` | `src/hooks/useExerciseLibrary.ts:108-116` | 1 per exercise | REMOVE | Powers ExerciseDetail page |
| `useExerciseAlternatives` | `src/hooks/useExerciseLibrary.ts:120-132` | 1 per exercise | REMOVE | Powers swap + detail alternatives |

### Components

| Item | File Path | API Calls Made | Can Remove? | Notes |
|------|-----------|----------------|-------------|-------|
| `ExerciseGifThumb` | `src/components/workout/ExerciseCard.tsx:51-80` | 1 per visible exercise | REMOVE | Inline thumbnail in workout list |
| `ExerciseCard` swap button | `src/components/workout/ExerciseCard.tsx:264-275` | 0 (opens sheet) | REMOVE | Swap arrow button |
| `ExerciseCard` info button | `src/components/workout/ExerciseCard.tsx:278-293` | 0 (opens modal) | KEEP | Entry point for new integration |
| `ExerciseSwapSheet` | `src/components/workout/ExerciseSwapSheet.tsx` | 2+ per open (info + alternatives) | REMOVE | Entire component |
| `ExerciseDetailModal` | `src/components/workout/ExerciseDetailModal.tsx` | 1 per open | REMOVE | Replaced by FormGuideSheet |
| `FormGuideSheet` | `src/components/workout/FormGuideSheet.tsx` | 1 per open | REBUILD | Currently auto-loads — will use on-demand pattern |

### Pages

| Item | File Path | API Calls Made | Can Remove? | Notes |
|------|-----------|----------------|-------------|-------|
| `ExerciseLibraryPage` | `src/pages/ExerciseLibrary.tsx` | 3+ on load (category lists) + 1/browse | DELETE | Entire page |
| `ExerciseDetailPage` | `src/pages/ExerciseDetail.tsx` | 2+ per view (detail + alternatives) | DELETE | Entire page |

### Routes / Navigation

| Item | File Path | API Calls Made | Can Remove? | Notes |
|------|-----------|----------------|-------------|-------|
| Exercises tab in BottomNav | `src/components/layout/BottomNav.tsx:9` | 0 | REMOVE | `{ to: '/exercises', icon: Dumbbell, label: 'Exercises' }` |
| `/exercises` route | `src/App.tsx:154-159` | Triggered by page | REMOVE | Route to ExerciseLibraryPage |
| `/exercises/:exerciseId` route | `src/App.tsx:160-167` | Triggered by page | REMOVE | Route to ExerciseDetailPage |
| Page exports | `src/pages/index.ts:18-19` | 0 | REMOVE | `ExerciseDetailPage`, `ExerciseLibraryPage` |
| Page imports | `src/App.tsx:29-30` | 0 | REMOVE | Import statements |

### Home Screen

| Item | File Path | API Calls Made | Can Remove? | Notes |
|------|-----------|----------------|-------------|-------|
| "Explore Exercises" section | `src/pages/Home.tsx:293-335` | 1 (`useBodyPartList`) | REMOVE | Category cards + Browse All link |
| `useBodyPartList` import | `src/pages/Home.tsx:16` | 0 | REMOVE | Import statement |
| `bodyParts` data usage | `src/pages/Home.tsx:161` | 0 | REMOVE | `const { data: bodyParts } = useBodyPartList()` |

### Workout Screen

| Item | File Path | API Calls Made | Can Remove? | Notes |
|------|-----------|----------------|-------------|-------|
| `ExerciseGifThumb` per exercise | `ExerciseCard.tsx:187-189` | 1 per exercise | REMOVE | Inline thumbnail |
| Swap button per exercise | `ExerciseCard.tsx:264-275` | 0 | REMOVE | Opens ExerciseSwapSheet |
| `useExerciseInfo` import | `ExerciseCard.tsx:8` | 0 | MODIFY | Change to new on-demand hook |
| `ExerciseSwapSheet` usage | `ExerciseCard.tsx:327-333` | 0 | REMOVE | Rendered per exercise |
| `FormGuideSheet` usage | `ExerciseCard.tsx:320-324` | 0 | KEEP | Will be rebuilt |

### Tests

| Item | File Path | Can Remove? | Notes |
|------|-----------|-------------|-------|
| Service tests | `src/services/__tests__/exerciseDbService.test.ts` | DELETE | Tests the old service |
| useExerciseGif tests | `src/hooks/__tests__/useExerciseGif.test.tsx` | REPLACE | Tests old hook |
| useExerciseLibrary tests | `src/hooks/__tests__/useExerciseLibrary.test.tsx` | DELETE | Tests removed hooks |
| ExerciseDetailModal tests | `src/components/workout/__tests__/ExerciseDetailModal.test.tsx` | DELETE | Tests removed component |
| ExerciseCard tests | `src/components/workout/__tests__/ExerciseCard.test.tsx` | UPDATE | Remove thumbnail/swap references |

### Barrel Exports

| Item | File Path | Can Remove? | Notes |
|------|-----------|-------------|-------|
| `ExerciseDetailModal` export | `src/components/workout/index.ts:4` | REMOVE | Component being removed |
| `ExerciseSwapSheet` export | `src/components/workout/index.ts:5` | REMOVE | Component being removed |
| `FormGuideSheet` export | `src/components/workout/index.ts:6` | KEEP | Being rebuilt |

---

## API Call Budget Analysis (Current State)

| Feature | Calls per Use | Monthly Est. (1 active user) | Hobby Viable? |
|---------|--------------|------------------------------|---------------|
| Exercise Library browse | 3 (category lists) + 1/page | 500+ | NO |
| Exercise Library search | 1 per query | 100+ | NO |
| Explore Exercises (Home) | 1 (body parts list) | 30 | BORDERLINE |
| Inline thumbnails | 1 per exercise visible | 200+ | NO |
| Exercise swap | 2 per open (info + alternatives) | 50+ | NO |
| Form guide (on-demand) | 1 per unique exercise | 30-50 | YES |
| Exercise detail page | 2 per view (detail + alternatives) | 100+ | NO |
| **TOTAL** | | **1,000+ calls/month** | **EXCEEDS LIMIT** |

## Summary

**Files to DELETE entirely:** 4 (ExerciseLibrary.tsx, ExerciseDetail.tsx, ExerciseSwapSheet.tsx, ExerciseDetailModal.tsx)
**Files to MODIFY:** 5 (BottomNav.tsx, App.tsx, Home.tsx, ExerciseCard.tsx, index.ts for pages + components)
**Files to REBUILD:** 2 (FormGuideSheet.tsx, useExerciseGif.ts → new exerciseGuideService.ts + useExerciseGuide.ts)
**Files to REPLACE:** 1 (exerciseDbService.ts → exerciseGuideService.ts)
**Test files to handle:** 5 (delete 3, update 2)

**After teardown: ZERO ExerciseDB API calls from frontend. All lookups via Supabase edge function.**
