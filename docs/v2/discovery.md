# V2 Discovery - Questions & Decisions

> This document captures all questions asked during discovery and the answers/decisions made.
> Updated as we refine the v2 vision together.

---

## Product Vision

- [ ] **What is the core thesis for v2?** What's the single biggest thing v1 doesn't do that v2 should?
- [ ] **Who is the target user?** Same audience as v1 (self-tracking gym-goers) or expanding (coaches, group fitness, beginners)?
- [ ] **What's the launch goal?** MVP with core new features, or full parity + new features?
- [ ] **What platforms?** Stay as PWA, or go native (React Native / Expo)? Or both?

---

## Features & Scope

### Workout Experience
- [ ] **Custom workout plans?** V1 has 7 pre-built splits. Should users be able to create their own plans, days, and exercises?
- [ ] **Exercise substitutions?** Allow swapping exercises within a plan (e.g., swap barbell bench for dumbbell bench)?
- [ ] **Progressive overload tracking?** Auto-suggest weight increases based on history? V1 has `useProgression` hook — how far should this go?
- [ ] **Supersets / circuits?** V1 exercise sections are linear. Support grouped exercises with shared rest timers?
- [ ] **Warm-up sets?** Distinguish warm-up from working sets? Auto-calculate warm-up weights?
- [ ] **RPE / RIR tracking?** Add perceived exertion or reps-in-reserve per set?
- [ ] **Rest timer improvements?** Auto-start between sets? Configurable per exercise? Vibration/sound alerts?
- [ ] **Workout notes?** Per-session or per-exercise text notes?

### Social & Community
- [ ] **What does Community v2 look like?** V1 has a basic Community page. Expand to feed, challenges, leaderboards?
- [ ] **Workout sharing?** Share completed workouts as cards/images to social media or within the app?
- [ ] **Training partners?** Follow friends, see their activity, compare progress?
- [ ] **Coach mode?** One user creates plans for another?

### Analytics & Progress
- [ ] **Charts & graphs?** V1 has basic stats. Add line charts for weight progression per exercise? Volume over time?
- [ ] **Body measurements?** Track bodyweight, body fat %, measurements (arms, chest, waist)?
- [ ] **PR board?** V1 has `usePR` hook. Make it a dedicated, celebratory page?
- [ ] **Streak & gamification?** V1 shows streaks. Expand with badges, achievements, milestones?
- [ ] **Export data?** CSV/JSON export of workout history?

### Content & Education
- [ ] **Exercise library?** V1 fetches from ExerciseDB on demand. Build a built-in browsable library?
- [ ] **Form tips / video guides?** Beyond GIFs, add form cues or short video tutorials?
- [ ] **AI-powered suggestions?** Use an LLM to suggest workouts, answer form questions, or adjust plans?

### Technical & Platform
- [ ] **Offline-first priority?** V1 has `useSyncEngine` and `offlineStore`. How robust should offline be in v2?
- [ ] **Notifications?** V1 has push notification infrastructure. Use it for reminders, rest timer alerts, streak warnings?
- [ ] **Apple Health / Google Fit integration?** Sync workout data to/from health platforms?
- [ ] **Wearable support?** Apple Watch, Wear OS companion?
- [ ] **Multi-device sync?** Already handled by Supabase, but any edge cases to address?
- [ ] **Dark mode improvements?** V1 has dark mode via `themeStore`. Any design refresh needed?

---

## Design & UX

- [ ] **Design refresh or full redesign?** V1 already went through a "Soft UI / Elevated Clean" redesign. Keep that direction or evolve it?
- [ ] **Navigation model?** Keep 5-tab bottom nav (Home, Schedule, History, Community, Profile)? Add/remove tabs?
- [ ] **Onboarding v2?** V1 has a 4-step wizard. Simplify, expand, or personalize?
- [ ] **Animation & micro-interactions?** V1 uses Framer Motion. More? Less? Specific interactions to add?

---

## Business & Infrastructure

- [ ] **Monetization?** Free with premium tier? Which features gate behind premium?
- [ ] **Analytics/telemetry?** Add usage tracking (PostHog, Mixpanel, etc.)?
- [ ] **Error monitoring?** Add Sentry or similar for production error tracking?
- [ ] **CI/CD?** Currently deployed to Vercel. Add automated testing in CI pipeline?
- [ ] **Database migrations strategy?** V1 has 19 migrations. Plan for backward compatibility?

---

## Answered Questions

_Move questions here once answered, with the decision and rationale._

| Question | Decision | Rationale | Date |
|----------|----------|-----------|------|
| _example_ | _example_ | _example_ | _--_ |
