# Workout App — Full UI/UX Redesign Prompt

> **Context:** This is a React web app (mobile-first) for workout tracking. It currently has 4 tabs: Home, Schedule, History, and Profile. The current UI is functional but dated — white cards with green accents, no animations, and a generic feel. We want a complete visual overhaul that feels premium, fluid, and modern.

---

## 1. Design Philosophy & Guiding Principles

Before writing any code, internalize these principles (sourced from UX research). Every decision should trace back to one of these:

### White Space & Visual Breathing Room
- Use white space as a deliberate design tool, not empty filler. Isolate key elements (CTAs, active workout cards) with generous padding to draw focus.
- Replace separator lines with spacing. Use consistent margins to group related items and separate categories — users mentally cluster nearby objects.
- Simplify page structure: eliminate decorative borders, extra lines, and unnecessary frames. Let spacing do the work.

### UX Fundamentals
- **Real user needs first:** Every screen should answer "what do I do next?" within 2 seconds of looking at it.
- **Show system status:** Always give feedback — loading states, completed animations, progress indicators. Users should never wonder "did that work?"
- **Follow patterns, don't invent:** Use familiar navigation patterns (bottom tabs, pull-to-refresh gestures, swipe actions). Innovation should be in the polish, not the paradigms.
- **Prevent mistakes:** Confirm destructive actions (deleting workout history). Undo where possible.
- **Progressive disclosure:** Don't dump everything on one screen. Show summary first, detail on tap.
- **Recognition over recall:** Labels + icons together. Don't make users memorize what icons mean.
- **Visual hierarchy:** Use size, weight, color, and spacing to create a clear reading order on every screen.
- **Accessibility:** Maintain WCAG AA contrast ratios (4.5:1 for text). Touch targets ≥ 44px. Support reduced-motion preferences.

---

## 2. Visual Design System

### Design Direction: "Soft UI / Elevated Clean"
Blend a soft, tactile neumorphic aesthetic with clean modern minimalism. Think: the precision of Apple's Health app meets the warmth of a premium fitness brand. NOT flat/corporate, NOT skeuomorphic. Subtle depth, soft shadows, and generous whitespace.

### Color Palette
```
--bg-primary:        #F5F5F7;      /* Light warm gray — main background */
--bg-secondary:      #FFFFFF;      /* Card backgrounds */
--bg-elevated:       #FAFAFA;      /* Slightly elevated surfaces */

--accent-primary:    #4F46E5;      /* Indigo — primary actions, active states */
--accent-secondary:  #818CF8;      /* Lighter indigo — secondary actions, hovers */
--accent-success:    #10B981;      /* Emerald — completed, positive states */
--accent-warning:    #F59E0B;      /* Amber — warnings, rest days */
--accent-danger:     #EF4444;      /* Red — destructive actions only */

--text-primary:      #1F2937;      /* Near-black — headings, primary text */
--text-secondary:    #6B7280;      /* Gray — secondary info, timestamps */
--text-tertiary:     #9CA3AF;      /* Light gray — placeholders, disabled */

--shadow-soft:       0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
--shadow-medium:     0 4px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.08);
--shadow-elevated:   0 8px 32px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.1);

--radius-sm:         8px;
--radius-md:         12px;
--radius-lg:         16px;
--radius-xl:         24px;
```

### Typography
Use **one** font family with clear weight hierarchy. Suggested: `"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` — or install and use **"Plus Jakarta Sans"** from Google Fonts for a more distinctive feel.

```
--font-display:     700, 28px/1.2;    /* Screen titles */
--font-heading:     600, 20px/1.3;    /* Section headings */
--font-subheading:  600, 16px/1.4;    /* Card titles */
--font-body:        400, 15px/1.5;    /* Body text */
--font-caption:     500, 12px/1.4;    /* Labels, metadata */
--font-micro:       500, 10px/1.3;    /* Tiny labels, badges */
```

### Workout Type Color Coding
Each workout type gets a distinct color used consistently across the entire app (icons, calendar dots, cards, charts):

```
Push:     #6366F1  (Indigo)
Pull:     #8B5CF6  (Violet)
Legs:     #EC4899  (Pink)
Rest:     #9CA3AF  (Gray)
Cycling:  #14B8A6  (Teal)
Running:  #F97316  (Orange)
Rower:    #3B82F6  (Blue)
```

### Iconography
Use **Lucide React** icons throughout. Each workout type should have a consistent icon:
- Push: `Dumbbell` or `ArrowUp`
- Pull: `ArrowDown` or `Cable` (custom)
- Legs: `Footprints` or a custom leg icon
- Rest: `Moon`
- Cycling: `Bike`
- Running: `Zap` or `PersonRunning` (custom)
- Rower: `Waves`

These icons appear everywhere: schedule bar, calendar cells, workout cards, history entries. Consistency is critical.

---

## 3. Animation & Motion System

### Install Motion (formerly Framer Motion)
```bash
npm install motion
```

### Animation Principles
- **Purposeful motion:** Every animation must serve a function — guide attention, show cause/effect, provide feedback, or create spatial continuity.
- **Respect `prefers-reduced-motion`:** Wrap all animations in a check. Provide instant transitions as fallback.
- **Performance:** Use `transform` and `opacity` only for animations (GPU-composited). Never animate `width`, `height`, `top`, `left`, or `margin`.
- **Consistent easing:** Use a single spring config across the app for cohesion.

### Spring Configuration (Global)
```javascript
const springConfig = {
  default: { type: "spring", stiffness: 300, damping: 30 },
  gentle: { type: "spring", stiffness: 200, damping: 25 },
  snappy: { type: "spring", stiffness: 400, damping: 35 },
  slow: { type: "spring", stiffness: 150, damping: 20 },
};
```

### Required Animations

#### Page & Tab Transitions
- **Tab switching:** Crossfade with subtle horizontal slide (content slides in the direction of the tab). Duration: 200-300ms.
- **Screen push/pop:** New screens slide in from the right with a slight scale-up (0.95 → 1.0). Exiting screen slides left and fades.
- Use `AnimatePresence` with `mode="wait"` for clean enter/exit orchestration.

#### Card & List Animations
- **Staggered entry:** When a list of cards loads, each card fades in and slides up with a 50ms stagger delay.
  ```jsx
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.05, ...springConfig.default }
    })
  };
  ```
- **Card press:** On tap/click, card scales to 0.98 and shadow reduces. On release, springs back. (`whileTap={{ scale: 0.98 }}`)
- **Swipe to delete:** Cards slide left to reveal a red delete zone. Spring-based with velocity tracking.

#### Micro-Interactions
- **Workout completion:** When a workout is marked complete, a checkmark animates in (scale from 0 + rotate), the card briefly pulses green, and a confetti burst (optional) appears.
- **Button press feedback:** All buttons scale to 0.95 on press with a quick spring back.
- **Toggle animations:** Switches and toggles animate with spring physics, not linear easing.
- **Number counters:** When displaying stats (total workouts, streaks), numbers should count up from 0 with an eased animation.

#### Layout Animations
- Use Motion's `layout` prop on cards and list items so reordering, filtering, and adding/removing items animates smoothly.
- Calendar month transitions should crossfade with a subtle directional slide.

#### Loading & Skeleton States
- Shimmer/skeleton loading screens for any data-fetching state. Use a gradient animation across placeholder shapes.
- Never show a blank screen. Always show structure immediately, then populate.

---

## 4. Screen-by-Screen Redesign

### 4A. Bottom Navigation Bar
- Frosted glass background: `backdrop-filter: blur(20px); background: rgba(255,255,255,0.85);`
- Active tab: Icon fills with accent color + label appears with a spring animation. Inactive tabs show outline icons in gray.
- Subtle top border: `1px solid rgba(0,0,0,0.05)`
- Safe area padding on bottom for mobile viewports.
- Tab switch triggers content animation (see above).

### 4B. Home Screen
**Purpose:** "What am I doing today?" — answered in < 2 seconds.

**Layout (top to bottom):**
1. **Greeting header:** "Good morning, [Name]" with current date. Subtle fade-in on load.
2. **Today's workout card (HERO):** Large, prominent card showing today's scheduled workout type. Icon, workout name, estimated duration. Color-coded left border matching workout type. If completed, show green checkmark overlay. Tap → starts or views the workout. This is the single most important element on the screen.
3. **Weekly streak bar:** Horizontal row of 7 circles (Mon–Sun). Completed days filled with workout-type color. Today pulsates subtly. Future days are outlined/dashed. This gives instant "am I on track?" feedback.
4. **Quick stats row:** 2-3 cards in a horizontal scroll or grid: "Current Streak: X days", "This Week: X/7", "Total Workouts: XXX". Numbers animate on load (count up).
5. **Recent activity:** Last 2-3 completed workouts as compact cards. Tapping opens full workout detail.

### 4C. Schedule Screen
**Purpose:** "What's my weekly rotation?" — view and modify.

**Layout:**
1. **Horizontal scrollable day selector** (current design's pill bar — keep this, but polish it). Each day shows its workout type icon + abbreviated name. Active day has filled background with workout color. Others are outlined.
2. **Selected day detail card:** Shows the full workout plan for the selected day — exercises, sets/reps targets. Clean list with subtle separators (spacing, not lines).
3. **Edit mode:** Tap an edit button to enter a drag-and-drop reorder mode for the 7-day cycle. Cards lift with a shadow increase and become draggable. Satisfying drop animation.
4. **Schedule preview strip:** A compact row showing the next 7 days with mini workout-type icons, so users see what's coming up.

### 4D. History Screen (Calendar Tracker)
**Purpose:** "What have I done, and what's ahead?" — the big-picture view.

**This is the most complex screen. Build it carefully.**

**Layout:**
1. **Month/year header** with left/right navigation arrows. Tapping month name opens a month picker. Smooth slide transition between months.

2. **Calendar grid:**
   - Standard 7-column grid (S M T W T F S headers).
   - **Each day cell contains:**
     - Day number (top-left, small).
     - Workout type icon (centered, small ~20px).
     - **Completed past days:** Icon in full workout-type color. Subtle green dot or checkmark in corner.
     - **Scheduled future days:** Icon in a muted/gray version of the workout-type color (≈30% opacity).
     - **Today:** Highlighted ring/circle around the cell (accent-primary color). If workout is done, full color icon + check. If not yet done, pulsing outline.
     - **Rest days:** Moon icon in gray.
     - **Days before user started:** Empty, slightly dimmed.
     - **Missed workouts (past, not completed):** Show the expected icon with a subtle red-ish tint or strikethrough indicator.
   - Tapping any day opens a detail panel (see below).

3. **Day detail panel (bottom sheet):**
   - When a day is tapped, a bottom sheet slides up with spring physics.
   - **For completed workouts:** Full workout summary — exercises performed, sets × reps × weight, total duration, timestamp. "View Full Workout" button to drill deeper.
   - **For future scheduled days:** Shows the planned workout type and template. "Start Early" or "Preview" option.
   - **For today:** If not done, shows the plan with a prominent "Start Workout" button. If done, shows the summary.

4. **Schedule projection logic:**
   - Read the user's current 7-day rotation (Push, Pull, Legs, Rest, Cycling, Running, Rower — or whatever they've configured).
   - Starting from their first recorded workout date, project the cycle forward through the entire visible calendar.
   - Past days show actual recorded data (overriding the projection if workout was different than scheduled).
   - Future days show projected schedule in muted icons.
   - If the user changes their rotation, only future projections update. Past data is immutable.

5. **Monthly summary strip** (below calendar): "Workouts completed: 22/28 | Streak: 14 days | Most trained: Push (5x)"

### 4E. Profile Screen
**Purpose:** Settings, stats overview, and personalization.

**Layout:**
1. **Avatar + name section** at top.
2. **Lifetime stats cards:** Total workouts, longest streak, favorite workout type, total time trained. Animate numbers on screen entry.
3. **Settings list:** Clean grouped list (iOS Settings style). Items: Edit Schedule Rotation, Notification Preferences, Theme (Light/Dark — future), Export Data, About.
4. **Schedule rotation config:** Accessible from here or from Schedule screen. Shows the 7-day cycle as a reorderable list.

---

## 5. Component Architecture

Build these as reusable, well-encapsulated components:

```
src/
├── components/
│   ├── layout/
│   │   ├── BottomNav.jsx           # Frosted glass tab bar
│   │   ├── ScreenTransition.jsx    # AnimatePresence wrapper for tab content
│   │   └── BottomSheet.jsx         # Reusable spring-animated bottom sheet
│   ├── common/
│   │   ├── WorkoutIcon.jsx         # Renders correct icon + color for a workout type
│   │   ├── AnimatedCard.jsx        # Card with press/hover/tap animations
│   │   ├── AnimatedCounter.jsx     # Number that counts up on mount
│   │   ├── SkeletonLoader.jsx      # Shimmer loading placeholders
│   │   ├── StreakBar.jsx           # 7-day weekly progress dots
│   │   └── Badge.jsx              # "Completed", "Scheduled", "Missed" badges
│   ├── home/
│   │   ├── GreetingHeader.jsx
│   │   ├── TodayWorkoutCard.jsx    # Hero card for today's workout
│   │   ├── QuickStats.jsx
│   │   └── RecentActivity.jsx
│   ├── schedule/
│   │   ├── DaySelector.jsx         # Horizontal scrollable pills
│   │   ├── WorkoutPlanCard.jsx
│   │   └── ScheduleEditor.jsx      # Drag-and-drop rotation editor
│   ├── history/
│   │   ├── CalendarGrid.jsx        # Month calendar with workout icons
│   │   ├── CalendarCell.jsx        # Individual day cell
│   │   ├── MonthNavigator.jsx      # Month/year header with arrows
│   │   ├── DayDetailSheet.jsx      # Bottom sheet for day details
│   │   └── MonthlySummary.jsx      # Stats strip below calendar
│   └── profile/
│       ├── LifetimeStats.jsx
│       └── SettingsList.jsx
├── hooks/
│   ├── useWorkoutSchedule.js       # Schedule projection logic
│   ├── useAnimatedValue.js         # Spring-based number animation
│   └── useReducedMotion.js         # prefers-reduced-motion check
├── styles/
│   ├── tokens.css                  # CSS custom properties (colors, spacing, typography)
│   ├── animations.css              # Keyframe animations (shimmer, pulse)
│   └── global.css                  # Reset, base styles
└── utils/
    ├── scheduleProjection.js       # Calculate projected workout for any date
    └── workoutTypes.js             # Type definitions: name, icon, color mapping
```

---

## 6. Technical Implementation Notes

### Motion (Framer Motion) Patterns to Use
```jsx
// Page transitions
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, x: direction * 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: direction * -20 }}
    transition={springConfig.default}
  >
    {tabContent}
  </motion.div>
</AnimatePresence>

// Staggered list
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item, i) => (
    <motion.div key={item.id} variants={itemVariants} custom={i}>
      <WorkoutCard {...item} />
    </motion.div>
  ))}
</motion.div>

// Layout animations for reordering
<motion.div layout layoutId={`workout-${id}`} transition={springConfig.gentle}>
  ...
</motion.div>

// Bottom sheet
<motion.div
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "100%" }}
  drag="y"
  dragConstraints={{ top: 0 }}
  dragElastic={0.1}
  onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
  transition={springConfig.snappy}
>
```

### CSS Architecture
- Use CSS custom properties (defined in `tokens.css`) for all colors, spacing, radii, and shadows.
- Use CSS modules or a utility approach — avoid global class pollution.
- Frosted glass effect for nav bar and bottom sheets:
  ```css
  .frosted {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }
  ```
- Soft shadow system (neumorphic-lite):
  ```css
  .card {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-soft);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }
  .card:active {
    box-shadow: var(--shadow-medium);
    transform: scale(0.98);
  }
  ```

### Reduced Motion Support
```javascript
// useReducedMotion.js
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return prefersReduced;
}

// Usage: conditionally disable spring animations
const transition = prefersReduced
  ? { duration: 0 }
  : springConfig.default;
```

---

## 7. Implementation Order

Execute in this order to build incrementally with visible progress:

1. **Design tokens & global styles** — Set up `tokens.css`, `global.css`, install fonts. This is the foundation everything builds on.
2. **Bottom navigation bar** — Frosted glass, animated active states. This immediately makes the app feel different.
3. **Component primitives** — `WorkoutIcon`, `AnimatedCard`, `Badge`, `SkeletonLoader`. These are used everywhere.
4. **Home screen** — Greeting, hero card, streak bar, quick stats. The screen users see first.
5. **Schedule screen** — Day selector polish, workout plan cards, edit mode.
6. **History/Calendar screen** — Calendar grid, schedule projection, day detail bottom sheet. Most complex — do this after patterns are established.
7. **Profile screen** — Stats, settings.
8. **Animation polish pass** — Go through every screen and add staggered entries, page transitions, micro-interactions. Tune spring values until everything feels cohesive.
9. **Loading states** — Add skeleton loaders for every data-fetching moment.
10. **Accessibility audit** — Contrast ratios, touch targets, reduced motion, screen reader labels.

---

## 8. Quality Checklist

Before considering any screen "done," verify:

- [ ] No screen ever shows blank/empty — always skeleton or placeholder state
- [ ] Every interactive element has press/tap feedback (scale, shadow change, or color shift)
- [ ] Tab switching animates smoothly with direction-aware transitions
- [ ] All workout types use their designated color consistently everywhere
- [ ] Calendar correctly shows completed (full color) vs scheduled (muted) vs missed (tinted)
- [ ] Bottom sheet drags to dismiss with spring physics
- [ ] Numbers and stats animate on screen entry
- [ ] Lists stagger their entry animation
- [ ] `prefers-reduced-motion` is respected — all animations have a no-motion fallback
- [ ] Touch targets are ≥ 44px
- [ ] Text contrast passes WCAG AA (4.5:1)
- [ ] Cards have consistent border radius, shadow, and spacing
- [ ] No orphaned/inconsistent spacing — all spacing uses token values
- [ ] Fonts load correctly with proper fallbacks
