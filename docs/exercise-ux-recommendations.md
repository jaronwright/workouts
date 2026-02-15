# Exercise UX Recommendations

## Core Principles

1. **Exercise data serves the workout, not the other way around.** Every piece of exercise info should answer: "Does this help me perform this exercise better RIGHT NOW?"
2. **Sweaty hands UX.** Mid-workout UI must be tappable with large targets, readable at arm's length, and dismissible with one gesture.
3. **Performance first.** GIFs are expensive. Only animate what's visible and important.

---

## GIF/Image Display Strategy

### In lists (workout view, browse results, search results)
- **Static thumbnail** — Use `loading="lazy"` on img tag, show first frame or low-res preview
- Size: 48x48 rounded-lg (not circular — exercise movements are rectangular)
- Tap opens full exercise detail
- Use Intersection Observer to only load when visible

### In exercise detail screen
- **Autoplay GIF, looping** — full-width hero, ~200px tall with aspect-ratio placeholder
- Show loading skeleton while GIF loads (prevent layout shift)
- Add "pause" capability for users who want to focus on a single frame

### In mid-workout overlay
- **Autoplay GIF** — prominent but not full-width (~280px), centered
- Must not block set logging controls
- Bottom sheet format — swipe down to dismiss

---

## Instructions Display

### Exercise Detail Screen
- Numbered steps with generous spacing (min 12px gap between steps)
- Step numbers in accent color circles (primary lime)
- Font size: --text-sm (14px) — readable at phone distance
- Strip "Step:N" prefix from API data (already done in current code)
- Show all steps — no collapsing needed on the detail screen

### Mid-Workout Overlay
- Show first 3 steps prominently
- "Show all N steps" expand toggle below
- Larger touch targets — each step should have at least 44px height
- High contrast text on surface background

---

## Muscle Targeting Display

### Visual hierarchy
- **Primary muscles**: Accent-colored (lime) pill badges, bold weight
- **Secondary muscles**: Muted/gray pill badges, normal weight
- Group under "Primary" and "Secondary" labels

### Layout
- Horizontal wrap of pill badges
- Primary section first, secondary below
- On detail screen: use body part icons from workoutConfig next to badges

---

## Contextual Exercise Info

### During rest timer (between sets)
- Show a "Form Tip" card below the timer
- Source: Pick one instruction step randomly (since we don't have dedicated tips from V1)
- Yellow/lime left-border accent to distinguish from regular UI
- Subtle fade-in when rest starts, fade-out when timer completes
- Cycle through instructions if user rests multiple times

### During set logging
- Small "?" button in top-right of exercise header
- Opens bottom sheet with GIF + instructions
- Must NOT reset or interrupt current set data
- Dismissible by swipe-down or backdrop tap

---

## Exercise Browse/Search UX

### Search
- Debounced input (400ms) to reduce API calls
- Show results as vertical list with GIF thumbnail, name, body part tag, equipment tag
- "No results" state with suggestion to try different terms
- Search icon animates to X when input has text

### Browse by category
- Three tabs: Body Part | Muscle | Equipment
- Each tab shows a grid of category cards with icons
- Tapping a category shows paginated exercise list
- "Load more" button at bottom (not infinite scroll — keeps control with user)

### Navigation
- Use route-based navigation (/exercises, /exercises/bodypart/chest, /exercises/:id)
- Browser back button must work correctly
- Breadcrumb trail: Library > Chest > Barbell Bench Press

---

## Exercise Swap UX

### When to show swap option
- On exercise detail screen: "Find Alternatives" button
- On workout exercise card: long-press or "..." menu > "Swap Exercise"

### Swap flow
1. Show exercises with same target muscle + equipment type
2. Fallback: same target muscle, any equipment
3. Each alternative shows: GIF thumbnail, name, equipment needed
4. Confirm before swapping: "Replace {current} with {new}?"
5. Swap updates the plan_exercise record in the database

---

## Performance Guidelines

- Max 6 GIF thumbnails visible at once — use Intersection Observer
- Preload exercise data for current workout on page mount (existing prefetch pattern)
- Cache GIF URLs in service worker for offline access
- Use skeleton loaders (not spinners) for exercise data loading
- Debounce search input, throttle browse requests
