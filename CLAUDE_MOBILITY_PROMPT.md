# Mobility Expansion Prompt for Claude Code

## Usage

```bash
cd /Users/jaronwright/src/workouts
claude --dangerously-skip-permissions "$(cat CLAUDE_MOBILITY_PROMPT.md)"
```

---

## Prompt

You are an autonomous senior full-stack engineer. Your job is to expand the mobility section of this workout-tracker app. Currently there are 4 mobility types, each with a single 15-minute variant. You will:

1. Add a **duration selection screen** so users pick 15, 30, 45, or 60 minutes before starting any mobility workout
2. Create **4 duration variants** for each of the existing 4 mobility types (scaling exercises progressively)
3. Add **2 new mobility types** with all 4 duration variants each
4. Update the UI, database, services, and config to support everything

Do NOT ask for any user input. Make all decisions yourself. Read every referenced file before editing.

---

## ARCHITECTURE DECISION: Duration Variants

Each mobility type will have 4 separate `workout_day` entries in the database (one per duration). Each `workout_day` has its own `exercise_sections` and `plan_exercises`. The `workout_templates` table will get a new `duration_minutes` that varies per variant, and a `parent_template_id` or we can simply have multiple templates per category with different durations.

**Simplest approach (use this one):** Create 4 separate `workout_templates` rows per mobility type, each with a different `duration_minutes` and its own `workout_day_id` pointing to a unique `workout_day` with the right number of exercises. The category stays the same across all 4 durations for a given type.

This means:
- 6 mobility types × 4 durations = 24 templates total (replacing the current 4)
- 24 workout_days (replacing the current 4)
- 24 exercise_sections (one "Main" section per day)
- Progressively more exercises as duration increases

**Template naming convention:** `"Core Stability"` becomes `"Core Stability — 15 min"`, `"Core Stability — 30 min"`, etc.

---

## UI FLOW CHANGE

Currently: Home → tap mobility card → exercise list → complete

New flow: Home → tap mobility card → **duration picker screen** → exercise list → complete

The duration picker should be a clean intermediate screen (or modal) that shows 4 options: 15 min, 30 min, 45 min, 60 min. Each option shows how many exercises are in that variant. Once selected, it navigates to the specific variant's exercise list page (same MobilityWorkout.tsx page, just with a different template ID).

---

## THE 6 MOBILITY TYPES AND THEIR EXERCISES

### Existing Type 1: Core Stability
Category: `core`

**15 min (4 exercises):**
1. Dead Bug — 3×10/side | Anti-extension, low back pressed to floor
2. Pallof Press Hold — 3×20 sec/side | Anti-rotation, resist rotation
3. Hanging Knee Raise — 3×12 | Core flexion, curl pelvis up
4. Side Plank — 2×30 sec/side | Lateral stability, straight line

**30 min (7 exercises):** Everything from 15 min, plus:
5. Bird Dog — 3×10/side | Contralateral stability, keep hips level
6. Hollow Body Hold — 3×30 sec | Full anterior chain engagement, low back flat
7. Plank with Shoulder Tap — 3×10/side | Anti-rotation under load, minimal hip shift

**45 min (10 exercises):** Everything from 30 min, plus:
8. Ab Wheel Rollout — 3×8 | From knees, full extension, brace hard
9. Copenhagen Plank — 2×20 sec/side | Adductor and oblique stability
10. Bear Crawl Hold — 3×30 sec | Knees 1 inch off ground, breathe, resist collapse

**60 min (13 exercises):** Everything from 45 min, plus:
11. Turkish Get-Up (Bodyweight) — 2×3/side | Full-body stabilization through every plane
12. Stability Ball Stir the Pot — 3×8/direction | Anti-extension with rotary challenge
13. Banded Dead Bug — 3×8/side | Resisted anti-extension, maintain tension throughout

---

### Existing Type 2: Hip, Knee & Ankle Flow
Category: `hip_knee_ankle`

**15 min (4 exercises):**
1. 90/90 Hip Switches — 2×8/side | Hip internal/external rotation
2. Deep Squat Hold — 3×30 sec | Hip/knee/ankle, pry knees with elbows
3. Cossack Squat — 2×8/side | Lateral hip mobility + knee flexion
4. Ankle CARs — 2×8/side | Controlled articular rotations

**30 min (7 exercises):** Everything from 15 min, plus:
5. Pigeon Stretch — 2×45 sec/side | Hip external rotation and flexor lengthening
6. Walking Knee Hugs — 2×10/side | Dynamic hip flexion and glute activation
7. Lateral Lunge Hold — 2×30 sec/side | Adductor lengthening under load

**45 min (10 exercises):** Everything from 30 min, plus:
8. Single Leg Glute Bridge — 3×10/side | Unilateral glute activation + hip stability
9. Hip CARs (Standing) — 2×5/side | Full hip ROM, controlled articular rotations
10. Shin Box Transitions — 2×8/side | Hip internal/external rotation with lift

**60 min (13 exercises):** Everything from 45 min, plus:
11. Tactical Frog — 3×30 sec | Deep adductor stretch, rock forward and back
12. Half Kneeling Hip Flexor Stretch — 2×45 sec/side | Psoas and rectus femoris lengthening
13. Terminal Knee Extension — 2×12/side | Banded, full lockout, VMO activation

---

### Existing Type 3: Spine Mobility
Category: `spine`

**15 min (4 exercises):**
1. Cat-Cow — 2×10 | Spinal flexion/extension
2. Thoracic Rotations — 2×8/side | Quadruped, hand behind head, rotate up
3. Jefferson Curl — 2×8 | Segmental spinal flexion, bodyweight only
4. Prone Scorpion — 2×8/side | Thoracic extension + rotation

**30 min (7 exercises):** Everything from 15 min, plus:
5. Thread the Needle — 2×8/side | T-spine rotation from quadruped
6. Segmental Bridge — 3×6 | Roll up one vertebra at a time, slow control
7. Side-Lying Windmill — 2×6/side | Thoracic rotation with reach, open chest

**45 min (10 exercises):** Everything from 30 min, plus:
8. Prone Press-Up — 2×10 | Lumbar extension, keep hips on floor
9. Seated Spinal Twist — 2×30 sec/side | Gentle end-range rotation hold
10. Quadruped Rock Back — 3×10 | Sit hips to heels, maintain spinal position

**60 min (13 exercises):** Everything from 45 min, plus:
11. Foam Roller Thoracic Extension — 2×10 | Roller under upper back, hands behind head
12. Child's Pose with Lateral Reach — 2×30 sec/side | Lat and QL stretch, breathe into side
13. Supine Spinal Twist — 2×45 sec/side | Passive rotation, let gravity do the work

---

### Existing Type 4: Upper Body Flow
Category: `shoulder_elbow_wrist`

**15 min (4 exercises):**
1. Shoulder CARs — 2×5/side | Full shoulder ROM, slow circles
2. Wall Slides — 2×10 | Shoulder flexion + scapular upward rotation
3. Thread the Needle — 2×8/side | T-spine rotation + shoulder mobility
4. Wrist CARs — 2×5/side | Full wrist circles both directions

**30 min (7 exercises):** Everything from 15 min, plus:
5. Band Pull-Aparts — 2×15 | Rear delt and scapular retraction
6. Prone Y-T-W Raises — 2×8 each | Scapular stabilizer activation in three planes
7. Forearm Pronation/Supination — 2×10/side | Elbow and forearm mobility

**45 min (10 exercises):** Everything from 30 min, plus:
8. Sleeper Stretch — 2×30 sec/side | Internal rotation, posterior capsule
9. Cross-Body Shoulder Stretch — 2×30 sec/side | Posterior deltoid and infraspinatus
10. Wrist Flexor/Extensor Stretch — 2×20 sec each | On all fours, fingers forward then backward

**60 min (13 exercises):** Everything from 45 min, plus:
11. Band Shoulder Dislocates — 2×10 | Slow and controlled, wide grip
12. Hanging Lat Stretch — 2×30 sec | Dead hang, let lats open up
13. Elbow CARs — 2×8/side | Full elbow ROM circles, slow and controlled

---

### NEW Type 5: Full Body Recovery Flow
Category: `recovery`
Description: "Full-body stretching, foam rolling cues, and release work for rest days and deload weeks"
Icon suggestion: `Heart` from lucide-react (recovery/health theme)

**15 min (4 exercises):**
1. Child's Pose — 2×45 sec | Arms extended, sink hips, breathe into back
2. World's Greatest Stretch — 2×5/side | Lunge, rotate, reach — opens everything
3. Supine Figure-4 Stretch — 2×30 sec/side | Piriformis and deep glute release
4. Standing Forward Fold — 2×30 sec | Hamstring and posterior chain release, relax neck

**30 min (8 exercises):** Everything from 15 min, plus:
5. Prone Quad Stretch — 2×30 sec/side | Grab ankle, press hip into floor
6. Supine Spinal Twist — 2×30 sec/side | Passive rotation, let gravity do the work
7. Lat Stretch on Door Frame — 2×30 sec/side | Reach high, lean away, breathe into lat
8. Neck Half Circles — 2×5/direction | Slow controlled arcs, ear to shoulder to chest

**45 min (11 exercises):** Everything from 30 min, plus:
9. Pigeon Stretch — 2×45 sec/side | Deep hip opener, fold forward over front leg
10. Doorway Chest Stretch — 2×30 sec/side | Arm at 90°, step through, open pec
11. Seated Straddle Reach — 2×30 sec | Wide legs, walk hands forward, breathe

**60 min (14 exercises):** Everything from 45 min, plus:
12. Foam Roll IT Band — 2×45 sec/side | Slow roll from hip to knee, pause on tender spots
13. Foam Roll Upper Back — 2×30 sec | Roll between shoulder blades, arms across chest
14. Cat-Cow — 2×10 | Gentle spinal flexion/extension, wind down the session

---

### NEW Type 6: Shoulder & Rotator Cuff Prehab
Category: `shoulder_prehab`
Description: "Targeted rotator cuff strengthening and scapular stability for injury prevention"
Icon suggestion: `Shield` from lucide-react (protection/prehab theme)

**15 min (4 exercises):**
1. Band External Rotation — 3×12/side | Elbow at side, 90° angle, rotate out slowly
2. Band Pull-Aparts — 3×15 | Shoulder height, pinch shoulder blades
3. Prone Y Raise — 2×10 | Face down on bench, thumbs up, lift to Y
4. Scapular Push-Ups — 2×12 | Plank position, protract and retract shoulder blades

**30 min (7 exercises):** Everything from 15 min, plus:
5. Band Internal Rotation — 3×12/side | Same setup as external, rotate inward with control
6. Side-Lying External Rotation — 2×12/side | Light DB, elbow on hip, rotate up
7. Prone T Raise — 2×10 | Face down, arms to sides, thumbs up, squeeze mid-back

**45 min (10 exercises):** Everything from 30 min, plus:
8. Wall Slides — 2×10 | Back against wall, arms overhead, maintain contact
9. Face Pulls (Light Band) — 3×15 | Pull to forehead, external rotate at end range
10. Shoulder CARs — 2×5/side | Full ROM circles, slow and deliberate

**60 min (13 exercises):** Everything from 45 min, plus:
11. Band W Raise — 2×10 | Pull band apart into W shape, squeeze rear delts
12. Turkish Get-Up (Light) — 2×3/side | Full shoulder stabilization through all positions
13. Sleeper Stretch — 2×30 sec/side | Side-lying, press forearm toward floor gently

---

## IMPLEMENTATION STEPS

### STEP 1: Create the database migration

Create file: `supabase/migrations/20240215000000_expand_mobility.sql`

Read the existing mobility migration first (`supabase/migrations/20240212000000_mobility_exercises.sql`) to match the exact INSERT format.

**What to do:**

1. First, **delete the existing 4 mobility templates and their linked data**:
```sql
-- Remove old template-to-day links, old exercises, old sections, old days, and old templates
-- Delete in correct FK order: plan_exercises → exercise_sections → workout_days (mobility ones)
-- Delete workout_templates WHERE type = 'mobility'
-- Be careful not to delete user data — only delete plan data
DELETE FROM plan_exercises WHERE section_id IN (
  SELECT id FROM exercise_sections WHERE workout_day_id IN (
    SELECT id FROM workout_days WHERE plan_id = '00000000-0000-0000-0000-000000000003'
  )
);
DELETE FROM exercise_sections WHERE workout_day_id IN (
  SELECT id FROM workout_days WHERE plan_id = '00000000-0000-0000-0000-000000000003'
);
DELETE FROM workout_days WHERE plan_id = '00000000-0000-0000-0000-000000000003';
DELETE FROM workout_templates WHERE type = 'mobility';
```

2. Then **insert 24 new workout_days** under the existing Mobility plan (`00000000-0000-0000-0000-000000000003`):

Use this UUID scheme for workout_day IDs:
```
Core Stability 15:        00000000-0000-0000-0000-000000000101
Core Stability 30:        00000000-0000-0000-0000-000000000102
Core Stability 45:        00000000-0000-0000-0000-000000000103
Core Stability 60:        00000000-0000-0000-0000-000000000104
Hip/Knee/Ankle 15:        00000000-0000-0000-0000-000000000111
Hip/Knee/Ankle 30:        00000000-0000-0000-0000-000000000112
Hip/Knee/Ankle 45:        00000000-0000-0000-0000-000000000113
Hip/Knee/Ankle 60:        00000000-0000-0000-0000-000000000114
Spine Mobility 15:        00000000-0000-0000-0000-000000000121
Spine Mobility 30:        00000000-0000-0000-0000-000000000122
Spine Mobility 45:        00000000-0000-0000-0000-000000000123
Spine Mobility 60:        00000000-0000-0000-0000-000000000124
Upper Body Flow 15:       00000000-0000-0000-0000-000000000131
Upper Body Flow 30:       00000000-0000-0000-0000-000000000132
Upper Body Flow 45:       00000000-0000-0000-0000-000000000133
Upper Body Flow 60:       00000000-0000-0000-0000-000000000134
Full Body Recovery 15:    00000000-0000-0000-0000-000000000141
Full Body Recovery 30:    00000000-0000-0000-0000-000000000142
Full Body Recovery 45:    00000000-0000-0000-0000-000000000143
Full Body Recovery 60:    00000000-0000-0000-0000-000000000144
Shoulder Prehab 15:       00000000-0000-0000-0000-000000000151
Shoulder Prehab 30:       00000000-0000-0000-0000-000000000152
Shoulder Prehab 45:       00000000-0000-0000-0000-000000000153
Shoulder Prehab 60:       00000000-0000-0000-0000-000000000154
```

Workout day names should be: `"Core Stability — 15 min"`, `"Core Stability — 30 min"`, etc.

3. **Insert 24 exercise_sections** (one "Main" section per workout_day):
Use IDs derived from the day IDs with a suffix, e.g., `00000000-0000-0000-0001-000000000101` for Core 15's section.

4. **Insert all exercises** per the lists above. Use auto-generated IDs (don't specify exercise IDs).

5. **Insert 24 workout_templates** — one per type+duration combo:
```sql
INSERT INTO workout_templates (name, type, category, description, icon, duration_minutes, workout_day_id)
VALUES
  ('Core Stability', 'mobility', 'core', 'Core activation and stability exercises', 'target', 15, '00000000-0000-0000-0000-000000000101'),
  ('Core Stability', 'mobility', 'core', 'Core activation and stability exercises', 'target', 30, '00000000-0000-0000-0000-000000000102'),
  -- ... etc for all 24
```

Note: template names stay the SAME within a type (just "Core Stability", not "Core Stability — 15 min"). The `duration_minutes` field differentiates them. The UI will group by category and show duration options.

### STEP 2: Update workoutConfig.ts

**File:** `src/config/workoutConfig.ts`

Add entries to `MOBILITY_CONFIG` for the 2 new categories:
```typescript
recovery: {
  color: '#F472B6',  // pink
  bgColor: 'rgba(244, 114, 182, 0.15)',
  gradient: 'from-pink-400 to-pink-300',
  icon: Heart  // import from lucide-react
},
shoulder_prehab: {
  color: '#60A5FA',  // blue
  bgColor: 'rgba(96, 165, 250, 0.15)',
  gradient: 'from-blue-400 to-blue-300',
  icon: Shield  // import from lucide-react
}
```

Add display names:
```typescript
'Full Body Recovery Flow': 'Full Body Recovery',
'Shoulder & Rotator Cuff Prehab': 'Shoulder Prehab',
```

### STEP 3: Create duration picker UI

This is the biggest UI change. You need a screen (or modal) that appears BETWEEN tapping a mobility card on Home and seeing the exercise list.

**Option A (New Page — recommended):** Create a new page `src/pages/MobilityDurationPicker.tsx`

- Route: `/mobility/:category/select` (e.g., `/mobility/core/select`)
- This page receives the mobility category from the URL
- It fetches all templates for that category: `useWorkoutTemplatesByCategory(category)`
- It displays 4 duration cards (15, 30, 45, 60 min)
- Each card shows: duration, number of exercises, and a brief label
- Tapping a card navigates to `/mobility/${templateId}` (the existing MobilityWorkout page)

**Card design for each duration:**
```
┌─────────────────────────┐
│  ⏱  15 min              │
│  4 exercises · Quick     │
└─────────────────────────┘
┌─────────────────────────┐
│  ⏱  30 min              │
│  7 exercises · Standard  │
└─────────────────────────┘
┌─────────────────────────┐
│  ⏱  45 min              │
│  10 exercises · Extended │
└─────────────────────────┘
┌─────────────────────────┐
│  ⏱  60 min              │
│  13 exercises · Full     │
└─────────────────────────┘
```

Labels: 15 min = "Quick", 30 min = "Standard", 45 min = "Extended", 60 min = "Full Session"

**Header:** Show the mobility type name and icon (same style as the MobilityWorkout page header).

### STEP 4: Update routing

**File:** `src/App.tsx`

Add the new route:
```typescript
<Route path="/mobility/:category/select" element={<ProtectedRoute><MobilityDurationPicker /></ProtectedRoute>} />
```

Keep the existing `/mobility/:templateId` route for the actual workout page.

### STEP 5: Update Home page navigation

**File:** `src/pages/Home.tsx`

Currently, tapping a mobility template card navigates directly to `/mobility/${template.id}`.

Change this: Instead of showing individual templates on the Home page, show one card PER MOBILITY TYPE (6 cards total). Each card should navigate to the new duration picker: `/mobility/${template.category}/select`.

To do this:
1. Group mobility templates by category
2. For each category, show ONE card with the category name, icon, and description
3. On click, navigate to `/mobility/${category}/select`

This means the Home page shows: Core Stability, Hip/Knee/Ankle Flow, Spine Mobility, Upper Body Flow, Full Body Recovery, Shoulder Prehab — and tapping any of them opens the duration picker.

### STEP 6: Create new hook for fetching templates by category

**File:** Create `src/hooks/useMobilityTemplates.ts` or add to existing hooks.

```typescript
// Fetch all mobility templates grouped by category
export function useMobilityCategories() {
  // Returns unique categories with one representative template per category
}

// Fetch all duration variants for a specific category
export function useMobilityVariants(category: string) {
  // Returns templates for this category, sorted by duration_minutes
  // Each template has its own workout_day_id with the right exercises
}
```

### STEP 7: Update MobilityWorkout.tsx

**File:** `src/pages/MobilityWorkout.tsx`

The existing page works fine for rendering exercises — it uses `template.workout_day_id` to load exercises. The main change:

1. **Remove the hardcoded 15-minute duration** from the `quickLog()` call. Instead, use `template.duration_minutes`.
2. Update the header to show the actual duration from the template.
3. Add a "back to duration picker" link in the header or as a breadcrumb.

### STEP 8: Update schedule integration

**File:** `src/services/scheduleService.ts` and `src/components/schedule/ScheduleDayEditor.tsx`

When users assign a mobility workout to a schedule day, they currently pick from the 4 templates. Now they need to:
1. Pick the mobility TYPE (category)
2. Pick the duration

Check how the schedule day editor presents mobility options and update it to show the 6 categories. When a category is selected, show the 4 duration options. Store the specific template_id (which encodes both type and duration) in the schedule.

If the schedule editor is too complex to add a two-step picker, just default to the 15-min variant when assigning mobility to a schedule day. Users can always pick a different duration when they actually start the workout.

### STEP 9: Update any template-fetching logic

Search for all calls to `useWorkoutTemplatesByType('mobility')` and ensure they handle the expanded list of 24 templates correctly. The Home page grouping (Step 5) is the main consumer.

Also check `templateWorkoutService.ts` for any hardcoded assumptions about 4 mobility templates.

### STEP 10: Build & test

1. Run `npm run build` — must pass with zero errors.
2. Run `npm run lint` — must pass.
3. Run `npx vitest run` — all existing tests must pass. Update any tests that reference the old 4 mobility templates or hardcoded 15-min duration.

### STEP 11: Write new tests

Write tests that verify:
1. All 6 mobility categories have exactly 4 duration variants each (15, 30, 45, 60)
2. Each variant has the correct number of exercises (verify against the lists above)
3. The duration picker page renders 4 cards for a given category
4. Tapping a duration card navigates to the correct template
5. MobilityWorkout page logs the correct duration (not hardcoded 15)
6. Home page shows 6 mobility category cards (not 24 individual templates)
7. New categories (recovery, shoulder_prehab) have correct config styles

### STEP 12: Final verification

1. `npm run build` — zero errors.
2. `npm run lint` — zero warnings.
3. `npx vitest run --reporter=verbose` — all tests pass.
4. Start dev server, verify it starts, kill it.
5. Write a summary of changes to `MOBILITY_CHANGELOG.md`.

Do NOT skip any step. Do NOT ask for input. Work through everything systematically.
