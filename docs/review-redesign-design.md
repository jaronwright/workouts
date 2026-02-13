# Review Page Redesign — Design Specification

## Overview

This document provides visual design, layout, and animation specifications for the Review page redesign. The page will feature two sub-tabs: **Calendar** and **Stats**, each optimized for mobile touch interaction.

**Target viewport**: 375-428px width, ~calc(100dvh - 112px) content height
**Design system**: Dark theme PWA with CSS variables, TailwindCSS 4, Framer Motion (motion/react)

---

## 1. Tab Switcher Design

### Visual Style: Floating Segmented Control

The tab switcher should be a **floating segmented control** with an animated pill indicator that slides between tabs. This provides a modern, tactile feel perfect for mobile.

**Location**: Fixed at the top of the content area, below the AppShell header (not inside the header to avoid crowding).

```tsx
// TailwindCSS classes for tab switcher container
className="sticky top-0 z-10 px-4 pt-4 pb-3 bg-[var(--color-background)]"
```

### Tab Switcher Component Structure

```tsx
<div className="relative flex gap-1 p-1 bg-[var(--color-surface)]/60 backdrop-blur-xl rounded-full border border-[var(--color-surface)]">
  {/* Animated pill indicator */}
  <motion.div
    className="absolute h-[calc(100%-8px)] bg-[var(--color-primary)] rounded-full"
    layoutId="activeTab" // Framer Motion shared layout
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  />

  {/* Calendar Tab */}
  <button className="relative z-10 flex-1 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors">
    Calendar
  </button>

  {/* Stats Tab */}
  <button className="relative z-10 flex-1 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors">
    Stats
  </button>
</div>
```

### Tab Button States

- **Inactive**: `text-[var(--color-text-muted)]`
- **Active**: `text-white` (contrasts against primary pill)
- **Hover**: `text-[var(--color-text)]` (desktop only)
- **Active scale**: `active:scale-95` for tactile feedback

### Animation: Pill Slide

Use Framer Motion's **layoutId** for the pill indicator. This creates a smooth, spring-based slide animation between tabs.

```tsx
<motion.div
  layoutId="activeTab"
  className="absolute h-[calc(100%-8px)] bg-[var(--color-primary)] rounded-full"
  style={{ width: '50%', left: activeTab === 'calendar' ? 4 : 'calc(50% - 4px)' }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
/>
```

---

## 2. Calendar Tab Layout

### Goal: Full-Screen, Breathable Calendar

Remove the Card wrapper entirely. The calendar should span edge-to-edge with generous padding, making cells larger and more tappable.

### Layout Structure

```tsx
<div className="px-4 pt-2 pb-6">
  {/* Month navigation (keep existing design) */}
  {/* Day-of-week headers */}
  {/* Calendar grid - LARGER CELLS */}
</div>
```

### Calendar Grid Specifications

**Current cell size**: `min-h-[52px]` (small, cramped)
**New cell size**: `min-h-[64px]` (8% larger, more breathing room)

```tsx
// CalendarDayCell updates
className="relative flex flex-col items-center justify-start gap-1 py-2 rounded-xl
  transition-all duration-150 min-h-[64px]
  active:scale-95"
```

**Grid gap**: Increase from `gap-px` to `gap-1.5` for visual separation

```tsx
// CalendarGrid updates
<motion.div
  key={monthKey}
  className="grid grid-cols-7 gap-1.5" // was gap-px
  // ... animations
>
```

**Icon size**: Keep `w-7 h-7` for the workout icon circles — this is already appropriately sized.

**Day number**: Increase from `text-[11px]` to `text-xs` for better legibility

```tsx
<span className="text-xs font-semibold leading-none
  ${isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}">
  {dayOfMonth}
</span>
```

### Month Header Design

**Option A: Compact** (recommended for vertical space efficiency)
Keep the existing design with minimal changes:

```tsx
<div className="flex items-center justify-between px-1 mb-4">
  {/* ChevronLeft button */}
  <h2 className="text-lg font-bold text-[var(--color-text)]">
    {format(currentMonth, 'MMMM yyyy')}
  </h2>
  {/* Today button + ChevronRight button */}
</div>
```

**Option B: Hero Month** (if vertical space allows)
Larger, more prominent month display:

```tsx
<div className="text-center mb-6">
  <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">
    {format(currentMonth, 'MMMM')}
  </h2>
  <p className="text-sm text-[var(--color-text-muted)]">
    {format(currentMonth, 'yyyy')}
  </p>
  {/* Navigation buttons below */}
</div>
```

**Recommendation**: Stick with **Option A** to maximize calendar visibility.

### Selected Day Bottom Sheet

Keep the existing BottomSheet implementation. The full-screen calendar already improves the interaction — no changes needed here.

### Edge Case: Empty State

When no workouts exist, show a centered empty state with the Calendar icon (already implemented in History.tsx).

---

## 3. Stats Tab Layout

### Goal: Asymmetric, Visually Engaging Grid

Break away from the uniform 3-column grid. Use an **asymmetric masonry-style layout** with varied card sizes to create visual hierarchy.

### Layout Pattern: Mixed Sizes

```
┌─────────┬─────────┐
│  Hero   │  Hero   │  ← Full-width hero stats (completion + streak)
│  (1×1)  │  (1×1)  │
├─────────┴─────────┤
│    Chart (2×1)    │  ← Weekly frequency bar chart
├─────────┬─────────┤
│ Medium  │ Medium  │  ← Total time + sessions
│  (1×1)  │  (1×1)  │
├─────────┴─────────┤
│    Chart (2×1)    │  ← Workout mix horizontal bar
├─────────┬─────────┤
│ Small   │ Small   │  ← Active days + per week + longest
│  (1×1)  │  (1×1)  │
└─────────┴─────────┘
```

### Grid Implementation

```tsx
<motion.div
  className="px-4 pt-2 pb-6 space-y-3"
  variants={staggerContainer}
  initial={prefersReduced ? false : 'hidden'}
  animate="visible"
>
  {/* Row 1: Hero Stats */}
  <div className="grid grid-cols-2 gap-3">
    <StatWidget>Completion Rate (ring chart)</StatWidget>
    <StatWidget>Current Streak (flame icon)</StatWidget>
  </div>

  {/* Row 2: Weekly Frequency Chart */}
  <StatWidget className="w-full">Bar chart (7 days)</StatWidget>

  {/* Row 3: Medium Stats */}
  <div className="grid grid-cols-2 gap-3">
    <StatWidget>Total Time (h/m)</StatWidget>
    <StatWidget>Sessions (#)</StatWidget>
  </div>

  {/* Row 4: Workout Mix Chart */}
  <StatWidget className="w-full">Horizontal stacked bar</StatWidget>

  {/* Row 5: Small Stats */}
  <div className="grid grid-cols-3 gap-2">
    <StatWidget>Active Days</StatWidget>
    <StatWidget>Per Week</StatWidget>
    <StatWidget>Longest</StatWidget>
  </div>

  {/* Row 6: Weekly Target (optional) */}
  <div className="grid grid-cols-2 gap-3">
    <StatWidget>This Week (dots)</StatWidget>
    <StatWidget>Best Streak (crown)</StatWidget>
  </div>
</motion.div>
```

### StatWidget Updates

**Padding**: Increase from `p-3` to `p-4` for better touch targets and breathing room

```tsx
<motion.div
  variants={staggerChild}
  className="relative overflow-hidden rounded-xl bg-[var(--color-surface)] p-4"
>
```

**Icon sizes**: Increase from `w-4 h-4` to `w-5 h-5` for hero stats, keep `w-4 h-4` for smaller cards

**Number sizes**:
- Hero stats: `text-3xl font-black` (was `text-xl font-bold`)
- Medium stats: `text-2xl font-bold`
- Small stats: `text-xl font-bold`

**Gradient overlays**: Keep the existing `bg-gradient-to-br from-{color}/10 to-transparent` pattern — it's subtle and effective.

### Chart Enhancements

#### Weekly Frequency Bar Chart

Increase bar height and add more vertical space:

```tsx
<div className="flex items-end gap-1.5" style={{ height: 56 }}> {/* was 40 */}
  {stats.dayOfWeekAvg.map((avg, i) => (
    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
      <motion.div
        className="w-full rounded-t-md bg-violet-500" // rounded-t for bar effect
        style={{ opacity: avg > 0 ? 1 : 0.2 }}
        initial={prefersReduced ? false : { height: 0 }}
        animate={{ height: avg > 0 ? Math.max((avg / stats.maxDayAvg) * 48, 6) : 3 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.05 }}
      />
    </div>
  ))}
</div>
```

#### Workout Mix Horizontal Bar

Increase bar height for better visibility:

```tsx
<div className="h-4 rounded-full overflow-hidden flex bg-[var(--color-text-muted)]/10 mb-2">
  {/* ... animated bars */}
</div>
```

#### Completion Rate Ring

Keep the existing conic-gradient ring — it's clean and performant. Consider increasing ring size:

```tsx
<div
  className="w-16 h-16 rounded-full flex items-center justify-center mb-2 mx-auto" // was w-12 h-12
  style={{
    background: `conic-gradient(#10B981 ${stats.completionRate * 3.6}deg, rgba(16,185,129,0.15) ${stats.completionRate * 3.6}deg)`,
  }}
>
  <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] flex items-center justify-center"> {/* was w-9 h-9 */}
    <Percent className="w-5 h-5 text-emerald-500" /> {/* was w-3.5 h-3.5 */}
  </div>
</div>
```

---

## 4. Animation Specifications

### Tab Switching Animation

**Transition type**: Crossfade with slight vertical slide (smooth, not jarring)

```tsx
// AnimatePresence wrapper for tab content
<AnimatePresence mode="wait" initial={false}>
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.25 }}
  >
    {activeTab === 'calendar' ? <CalendarTab /> : <StatsTab />}
  </motion.div>
</AnimatePresence>
```

**Why spring instead of tween?** Spring animations feel more natural and responsive, especially on touch devices.

### Stats Entry Animations

**Stagger timing**: Increase from `0.06` to `0.08` for more pronounced reveal

```tsx
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // was 0.06
      delayChildren: 0.1, // add small initial delay
    },
  },
}
```

**Child animation**: Increase y offset for more dramatic entrance

```tsx
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 16 }, // was y: 12
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
}
```

### Chart Drawing Animations

#### Bar Chart Bars

Use staggered spring animations with slight delay per bar:

```tsx
<motion.div
  className="w-full rounded-t-md bg-violet-500"
  initial={prefersReduced ? false : { height: 0, opacity: 0 }}
  animate={{ height: calculatedHeight, opacity: finalOpacity }}
  transition={{
    type: 'spring',
    stiffness: 200,
    damping: 20,
    delay: i * 0.06, // stagger by 60ms per bar
  }}
/>
```

#### Horizontal Stacked Bar

Animate width with cascading delays:

```tsx
<motion.div
  className="h-full"
  style={{ backgroundColor: CATEGORY_DEFAULTS.weights.color }}
  initial={prefersReduced ? { width: `${stats.mixPcts.weights}%` } : { width: 0, opacity: 0 }}
  animate={{ width: `${stats.mixPcts.weights}%`, opacity: 1 }}
  transition={{
    width: { type: 'spring', stiffness: 150, damping: 20 },
    opacity: { duration: 0.3 },
  }}
/>
```

#### Completion Ring

Animate the conic-gradient angle using Framer Motion's custom values:

```tsx
import { useMotionValue, useTransform, animate } from 'motion/react'

const angle = useMotionValue(0)
const conicGradient = useTransform(
  angle,
  (v) => `conic-gradient(#10B981 ${v}deg, rgba(16,185,129,0.15) ${v}deg)`
)

useEffect(() => {
  if (!prefersReduced) {
    animate(angle, stats.completionRate * 3.6, {
      type: 'spring',
      stiffness: 150,
      damping: 20,
    })
  } else {
    angle.set(stats.completionRate * 3.6)
  }
}, [stats.completionRate, prefersReduced, angle])

return (
  <motion.div
    className="w-16 h-16 rounded-full"
    style={{ background: conicGradient }}
  >
    {/* ... */}
  </motion.div>
)
```

### Respect `prefers-reduced-motion`

All animations already respect the `useReducedMotion` hook. When enabled:
- Skip stagger animations (render immediately with `initial={false}`)
- Skip chart drawing animations (set final values directly)
- Keep essential interactions like button active states

---

## 5. Color & Gradient System

### CSS Variables (Already Defined)

```css
--color-background: #0A0A0F
--color-surface: #1A1A24 (approximate)
--color-text: #FFFFFF
--color-text-muted: #9CA3AF
--color-primary: #6366F1 (indigo)
--color-success: #10B981 (emerald)
--color-danger: #EF4444 (red)
```

### Gradient Overlays

Each stat card uses a subtle gradient overlay matching its accent color:

```tsx
<div className="absolute inset-0 bg-gradient-to-br from-{color}-500/10 to-transparent" />
```

**Color mapping**:
- Completion Rate: `from-emerald-500/10`
- Streak: `from-orange-500/10`
- Weekly Frequency: `from-violet-500/10`
- Total Time: `from-sky-500/10`
- Workout Mix: `from-indigo-500/5` (more subtle for large chart)
- Sessions: `from-amber-500/10`
- Active Days: `from-blue-500/10`
- Per Week: `from-emerald-500/10`
- Longest: `from-rose-500/10`

### Icon Colors

Use saturated colors from the workout config (`CATEGORY_DEFAULTS`) for visual consistency across the app.

---

## 6. Touch Interaction Patterns

### Tap Targets

**Minimum size**: 44×44px per iOS Human Interface Guidelines

All interactive elements (tab buttons, calendar cells, info buttons) meet or exceed this threshold.

### Active States

Use `active:scale-95` for tactile feedback on all tappable elements:

```tsx
className="active:scale-95 transition-transform duration-150"
```

### Swipe Gestures

**Calendar month navigation**: Already supports swipe (via `onTouchStart` / `onTouchEnd` in CalendarGrid.tsx) — keep this!

**Stats tab**: No horizontal swipe needed (vertical scroll only)

**Tab switcher**: Consider adding swipe-to-switch between Calendar/Stats tabs:

```tsx
const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}

<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.2}
  onDragEnd={(e, { offset, velocity }) => {
    const swipe = swipePower(offset.x, velocity.x)
    if (swipe < -swipeConfidenceThreshold && activeTab === 'calendar') {
      setActiveTab('stats')
    } else if (swipe > swipeConfidenceThreshold && activeTab === 'stats') {
      setActiveTab('calendar')
    }
  }}
>
  {/* Tab content */}
</motion.div>
```

**Recommendation**: Implement swipe-to-switch for a more native app feel.

---

## 7. Responsive Considerations

### Viewport Widths

- **375px**: iPhone SE (smallest target)
- **390px**: iPhone 13/14 Pro
- **428px**: iPhone 14 Plus (largest)

The 3-column stat grid works well across all sizes. For the new asymmetric layout, ensure:

- Full-width charts maintain padding: `px-4` (16px each side = 343px content on 375px screen)
- 2-column grids use `gap-3` (12px) for balanced spacing
- 3-column grids use `gap-2` (8px) to fit smaller cards

### Dynamic Height

Use `calc(100dvh - 112px)` for content area height (accounts for bottom nav + header).

Enable vertical scroll with `overflow-y-auto` on the tab content containers.

---

## 8. Implementation Checklist

### Phase 1: Tab Switcher
- [ ] Create TabSwitcher component with floating segmented control
- [ ] Implement layoutId pill animation
- [ ] Add active/inactive state styling
- [ ] Test touch interaction (tap feedback)

### Phase 2: Calendar Tab
- [ ] Remove Card wrapper from calendar
- [ ] Update CalendarDayCell: min-h-[64px], gap-1, text-xs
- [ ] Update CalendarGrid: gap-1.5 instead of gap-px
- [ ] Test on 375px and 428px viewports
- [ ] Verify swipe-to-navigate still works

### Phase 3: Stats Tab
- [ ] Implement asymmetric grid layout (space-y-3)
- [ ] Increase StatWidget padding (p-4)
- [ ] Increase icon and number sizes (hero stats)
- [ ] Update Weekly Frequency chart height (56px)
- [ ] Update Workout Mix bar height (h-4)
- [ ] Increase Completion Ring size (w-16 h-16)
- [ ] Test vertical scroll on small screens

### Phase 4: Animations
- [ ] Implement tab switch animation (crossfade + slide)
- [ ] Update staggerContainer delay (0.08, delayChildren: 0.1)
- [ ] Update staggerChild y offset (16)
- [ ] Add completion ring animate() call
- [ ] Verify prefers-reduced-motion fallbacks
- [ ] Test on device (not just browser simulator)

### Phase 5: Polish
- [ ] Add swipe-to-switch tabs gesture (optional)
- [ ] Test info button flip animation on all stat cards
- [ ] Verify empty states (no data scenarios)
- [ ] Test loading skeletons during data fetch
- [ ] Cross-browser testing (Safari, Chrome mobile)

---

## 9. Example Code Snippets

### Tab Switcher Component

```tsx
import { motion } from 'motion/react'

type Tab = 'calendar' | 'stats'

interface TabSwitcherProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="sticky top-0 z-10 px-4 pt-4 pb-3 bg-[var(--color-background)]">
      <div className="relative flex gap-1 p-1 bg-[var(--color-surface)]/60 backdrop-blur-xl rounded-full border border-[var(--color-surface)]">
        {/* Animated pill */}
        <motion.div
          layoutId="activeTabPill"
          className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-[var(--color-primary)] rounded-full"
          initial={false}
          animate={{ x: activeTab === 'calendar' ? 0 : 'calc(100% + 4px)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {/* Calendar Tab */}
        <button
          onClick={() => onTabChange('calendar')}
          className={`
            relative z-10 flex-1 px-6 py-2.5 rounded-full text-sm font-semibold
            transition-colors active:scale-95
            ${activeTab === 'calendar' ? 'text-white' : 'text-[var(--color-text-muted)]'}
          `}
        >
          Calendar
        </button>

        {/* Stats Tab */}
        <button
          onClick={() => onTabChange('stats')}
          className={`
            relative z-10 flex-1 px-6 py-2.5 rounded-full text-sm font-semibold
            transition-colors active:scale-95
            ${activeTab === 'stats' ? 'text-white' : 'text-[var(--color-text-muted)]'}
          `}
        >
          Stats
        </button>
      </div>
    </div>
  )
}
```

### Tab Content Wrapper with Animation

```tsx
import { motion, AnimatePresence } from 'motion/react'

export function ReviewPage() {
  const [activeTab, setActiveTab] = useState<Tab>('calendar')

  return (
    <AppShell title="Review">
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {activeTab === 'calendar' ? (
            <CalendarTab />
          ) : (
            <StatsTab />
          )}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}
```

### Updated StatsGrid Layout

```tsx
export function StatsGrid({ calendarDays, allSessions }: StatsGridProps) {
  const prefersReduced = useReducedMotion()
  const stats = useMemo(() => {
    // ... existing stats calculation
  }, [calendarDays, allSessions])

  return (
    <motion.div
      className="px-4 pt-2 pb-6 space-y-3"
      variants={staggerContainer}
      initial={prefersReduced ? false : 'hidden'}
      animate="visible"
    >
      {/* Row 1: Hero Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatWidget info="% of scheduled workouts done this month">
          {/* Completion Rate with larger ring */}
          <div className="flex flex-col items-center justify-center h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
            <div className="relative">
              <CompletionRing percentage={stats.completionRate} size="large" />
              <AnimatedCounter
                value={stats.completionRate}
                className="text-3xl font-black text-[var(--color-text)] block text-center mt-2"
              />
              <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide font-medium block text-center">
                Completion
              </span>
            </div>
          </div>
        </StatWidget>

        <StatWidget info="Current and best streak this month">
          {/* Streak with larger icon and number */}
          <div className="flex flex-col items-center justify-center h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
            <div className="relative flex flex-col items-center">
              {stats.isAtBest ? (
                <Crown className="w-6 h-6 text-orange-500 mb-2" />
              ) : (
                <Flame className="w-6 h-6 text-orange-500 mb-2" />
              )}
              <AnimatedCounter
                value={stats.currentStreak}
                className="text-3xl font-black text-[var(--color-text)]"
              />
              <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide font-medium mt-1">
                Best: {stats.bestStreak}
              </span>
            </div>
          </div>
        </StatWidget>
      </div>

      {/* Row 2: Weekly Frequency Chart (full width) */}
      <StatWidget info="Avg workouts per day, all history" className="w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-violet-500" />
            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide font-medium">
              Weekly Frequency
            </span>
          </div>
          <WeeklyFrequencyChart data={stats.dayOfWeekAvg} max={stats.maxDayAvg} />
        </div>
      </StatWidget>

      {/* Row 3: Medium Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatWidget info="Total time trained this month">
          {/* Total Time */}
        </StatWidget>
        <StatWidget info="Completed sessions this month">
          {/* Sessions */}
        </StatWidget>
      </div>

      {/* Row 4: Workout Mix Chart (full width) */}
      <StatWidget info="Weights / cardio / mobility split" className="w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide font-medium">
              Workout Mix
            </span>
          </div>
          <WorkoutMixChart percentages={stats.mixPcts} />
        </div>
      </StatWidget>

      {/* Row 5: Small Stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatWidget info="Days with at least one workout">
          {/* Active Days */}
        </StatWidget>
        <StatWidget info="Avg sessions per week">
          {/* Per Week */}
        </StatWidget>
        <StatWidget info="Longest session this month">
          {/* Longest */}
        </StatWidget>
      </div>

      {/* Row 6: This Week & Best Streak */}
      <div className="grid grid-cols-2 gap-3">
        <StatWidget info="Done vs planned this week">
          {/* Weekly Target */}
        </StatWidget>
        <StatWidget info="Best streak this month">
          {/* Best Streak (if separated from current streak) */}
        </StatWidget>
      </div>
    </motion.div>
  )
}
```

---

## Summary

This design specification transforms the Review page from a cramped, uniform grid into a modern, asymmetric, full-screen experience optimized for mobile touch interaction. Key improvements:

1. **Floating segmented tab switcher** with animated pill indicator
2. **Full-screen calendar** with larger cells (64px min-height) and increased spacing
3. **Asymmetric stats grid** with varied card sizes and visual hierarchy
4. **Enhanced animations** with spring physics and staggered reveals
5. **Improved touch targets** and active states throughout

All designs respect the existing dark theme, CSS variables, and accessibility requirements (prefers-reduced-motion). The layout is mobile-first and tested across 375-428px viewport widths.

Implementation team can reference this document for exact TailwindCSS classes, Framer Motion configs, and component structure.
