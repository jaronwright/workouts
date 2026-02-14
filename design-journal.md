# Design Journal — V4 Electric Volt Layout Restructuring

## Iteration 0: Before Assessment

### Home Screen
- **Layout**: Greeting (GOOD MORNING, Alex) → hero card (Core Stability) → schedule strip → stat pills (5 streak, 5 week, 5 total) → weather → quick select (Weights/Cardio/Mobility) → workout list → recent activity
- **What's weak**: Too many equal-weight sections crammed together. The hero card doesn't dominate — it's just another card. Schedule strip inside the hero card feels cluttered. Stat pills are decent but generic. Weather takes up too much premium real estate. Quick Select + workout list is redundant (why both?). Recent section is buried at the bottom.
- **What's boring**: Everything is the same visual weight. No drama. No hierarchy. The greeting is fine but not impactful. No yellow accent used for emphasis.
- **Opportunities**: Make the hero card CINEMATIC (40%+ viewport). Kill the weather from home or shrink to one line. Use yellow as a glowing "Start" CTA. Make stat pills horizontal scroll with JetBrains Mono numbers. The schedule strip is useful — keep but make more compact.
- **Rating**: Layout 4/10, Visual Impact 3/10, Animation 5/10, Polish 5/10

### Profile Screen
- **Layout**: Avatar (centered, yellow circle) → name + email → stat chips (Total, Best Streak, Favorite) → workout split grid → settings sections
- **What's weak**: The avatar section feels generic. Stats are horizontal scroll but not visually exciting. Workout split grid is functional but flat — all cards look the same except the active one.
- **What's boring**: Standard centered profile layout. Nothing surprising or memorable.
- **Opportunities**: Make it feel like a PLAYER CARD. Big bold name. Stats as trophy-like elements. Active split could glow with yellow accent.
- **Rating**: Layout 4/10, Visual Impact 4/10, Animation 4/10, Polish 5/10

### History/Review Screen
- **Layout**: Calendar/Stats tab switcher → monthly calendar grid → workout day cells with icons
- **What's weak**: The calendar is functional but dense. Yellow contribution-graph tinting is nice but subtle. The tab switcher pill is good.
- **What's boring**: Standard calendar grid. No visual surprise.
- **Opportunities**: The yellow-tinted workout cells are a good start. Could add more dramatic yellow glow on today. The Stats tab has great bento widgets already.
- **Rating**: Layout 5/10, Visual Impact 5/10, Animation 5/10, Polish 6/10

### Schedule Screen
- **Layout**: Day indicator (Day 2 · Feb 13) → horizontal day picker → "7-DAY CYCLE" heading → workout list
- **What's weak**: EXTREMELY sparse. The page is mostly empty black space. The day picker is tiny and hard to read. The workout items below "7-DAY CYCLE" are barely visible.
- **What's boring**: Nothing stands out. The most functional screen but the least visually interesting.
- **Opportunities**: Make the active day dramatically bigger. Show workout details inline. Add visual rhythm to the 7-day cycle. Use yellow accent on the active day.
- **Rating**: Layout 2/10, Visual Impact 2/10, Animation 3/10, Polish 3/10

### Workout Detail Screen (Pull)
- **Layout**: Header (Pull) → Rest Timer → exercise sections (Warm-up → Main Lifting) → exercise cards with icons
- **What's weak**: The workout name "Pull" is tiny in the header bar — not editorial at all. Rest timer is functional but not dramatic. Exercise cards all look the same — circular progress + name + sets.
- **What's boring**: Every exercise looks identical. No visual hierarchy between warm-up exercises and main lifts. The section headers (WARM-UP, MAIN LIFTING) are too subtle.
- **Opportunities**: Make workout name MASSIVE (40px+). Make rest timer dramatic when active. Differentiate warm-up from main lifts visually. Add yellow accent to the active/current exercise.
- **Rating**: Layout 4/10, Visual Impact 3/10, Animation 4/10, Polish 5/10

### Priority Order for Restructuring
1. **Home** — highest impact, first screen users see
2. **Workout Detail** — where users spend the most time
3. **Schedule** — desperately needs layout work (most empty)
4. **Profile** — player card opportunity
5. **History** — already decent, needs refinement

---
