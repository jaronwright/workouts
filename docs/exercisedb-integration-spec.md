# ExerciseDB Integration — Product Spec

## Vision
Make every exercise in the app feel like it comes with a personal trainer. When users see an exercise, they should immediately know what it looks like, how to do it, what muscles it works, and what alternatives exist.

---

## P0 — Must Have (This Round)

### 1. Exercise Detail Screen
**Why**: Users need to understand exercises before performing them. Currently they see only a name.

**What**:
- Full-width GIF hero (autoplay, looping)
- Exercise name in large heading
- Tag pills: body part, equipment
- Tabbed content: Instructions | Muscles
- Instructions: numbered steps, generous spacing, readable mid-workout
- Muscles: primary (lime accent) vs secondary (muted) pill badges
- Navigate here from: exercise card info button, GIF thumbnail tap, browse results

**Route**: `/exercises/:exerciseId`

### 2. Inline GIF Thumbnails in Workout View
**Why**: Visual context helps users identify exercises at a glance without reading names.

**What**:
- 48x48 rounded thumbnail next to each exercise name in workout view
- Static image (NOT animated GIF) for performance
- Lazy-loaded via Intersection Observer
- Tap opens Exercise Detail Screen
- Graceful fallback: show exercise icon if GIF unavailable

### 3. Mid-Workout Form Guide (Instruction Overlay)
**Why**: Users need form checks during sets without leaving the logging screen.

**What**:
- "?" button on exercise header during active workout
- Opens bottom sheet overlay with GIF + instructions
- Does NOT interrupt set logging state
- Swipe-down to dismiss
- Shows: GIF (autoplaying), numbered instructions, muscle tags

---

## P1 — High Value

### 4. Exercise Search & Browse
**Why**: Users want to discover new exercises and find alternatives.

**What**:
- New page at `/exercises`
- Search bar with debounced name search
- Category tabs: Body Part | Muscle | Equipment
- Category selection shows paginated exercise list
- Each result: GIF thumbnail, name, body part tag, equipment tag
- Tap result opens Exercise Detail Screen
- Pagination with "Load more" button
- Accessible from bottom nav or home page

### 5. Exercise Swap / Find Alternatives
**Why**: Users may not have specific equipment or want variety.

**What**:
- "Find Alternatives" button on Exercise Detail Screen
- Shows exercises with same target muscle
- Option to filter by available equipment
- Confirm swap dialog
- Updates plan_exercise in database

### 6. Muscle Group Display Enhancement
**Why**: Visual muscle information helps users understand exercise purpose.

**What**:
- Primary muscles: lime-accented pill badges
- Secondary muscles: muted pill badges
- Displayed in Muscles tab of Exercise Detail Screen
- Also shown in compact form on mid-workout overlay

---

## P2 — Nice to Have

### 7. Rest Period Form Tips
- Show a random instruction step during rest timer
- Yellow accent border card below timer
- Fades in when rest starts, out when it ends

### 8. Exercise Discovery on Home
- "Explore Exercises" section on home page
- Horizontal scroll of body part category cards
- Tapping opens Exercise Browse filtered to that body part

---

## Integration Points

| Existing Feature | Integration |
|-----------------|-------------|
| Workout page exercise list | Add GIF thumbnails, info button opens detail |
| Active workout / set logging | Add "?" form guide button, opens instruction overlay |
| Rest timer | Show form tip card |
| Home page | Add exercise discovery section |
| Bottom nav | Add "Exercises" tab (or accessible via menu) |

---

## Success Metrics
- Users can see GIF/image for every exercise in their workout
- Users can access form instructions with one tap during a workout
- Users can browse and search the full exercise database
- Zero performance degradation in workout view (lazy loading, static thumbnails)
- Graceful degradation when API is unavailable (cached data or fallback UI)
