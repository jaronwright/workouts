# V2 Implementation Plan

> Synthesized from discovery.md and research.md.
> This is the source of truth for what we're building, in what order, and why.
> Updated as decisions are made and scope is refined.

**Status**: DRAFT - Awaiting discovery answers to finalize scope

---

## V2 Vision Statement

_To be written after discovery — one sentence describing what v2 is._

---

## Architecture Decisions

_Key technical decisions that shape the v2 implementation._

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Platform | TBD (PWA vs Native vs Capacitor) | | |
| State management | Keep TanStack Query + Zustand | Proven in v1, no reason to change | |
| Styling | Keep TailwindCSS 4 | | |
| Charting | TBD | | |
| Code splitting | Add React.lazy + Suspense | V1 is a single 939KB chunk | |
| CI/CD | TBD | | |

---

## Phases

### Phase 0: Foundation & Tech Debt
> Clean up v1 before adding v2 features.

- [ ] Code-split routes with React.lazy + Suspense (reduce initial bundle)
- [ ] Fix test file TS errors or configure tsconfig to skip them properly
- [ ] Add error monitoring (Sentry or similar)
- [ ] Set up CI pipeline (GitHub Actions: lint, test, build)
- [ ] Audit and optimize Supabase RLS policies
- [ ] Review and clean up unused code/dead features

### Phase 1: Core V2 Features
> The features that define v2. Order TBD based on discovery.

_Placeholder sections — to be filled after discovery:_

#### Custom Workout Plans (if confirmed)
- [ ] Schema: `custom_plans`, `custom_days`, `custom_exercises` tables
- [ ] UI: Plan builder (add days, add exercises, set order)
- [ ] Import: Clone a pre-built plan as starting point
- [ ] Integration: Schedule page works with custom plans

#### Progress Charts & Analytics (if confirmed)
- [ ] Weight progression charts per exercise (line chart over time)
- [ ] Volume tracking (total sets x reps x weight per session/week)
- [ ] Body measurements tracking (optional)
- [ ] PR celebration page with history

#### Enhanced Workout Experience (if confirmed)
- [ ] Superset/circuit grouping
- [ ] RPE/RIR per-set tracking
- [ ] Improved rest timer (auto-start, per-exercise config, haptics)
- [ ] Workout notes (per session and per exercise)
- [ ] Exercise substitution within a plan

### Phase 2: Social & Community
> Build on the v1 Community shell.

- [ ] _TBD based on discovery answers_

### Phase 3: Polish & Platform
> Final refinements before v2 launch.

- [ ] Performance audit and optimization
- [ ] Accessibility audit (WCAG AA)
- [ ] Onboarding flow updates for new features
- [ ] Migration path for existing v1 users
- [ ] App store submission (if going native)

---

## Database Migration Strategy

_V1 has 19 migrations. V2 additions must be backward-compatible._

```
Migration numbering: 20240XXX_v2_*.sql
Strategy: Additive only — no dropping existing tables/columns
RLS: All new tables get user-scoped RLS policies
```

---

## Open Questions

_Questions that block plan finalization. These get answered in discovery.md._

1. Custom plans scope — how much flexibility?
2. Social features scope — feed vs challenges vs both?
3. Platform decision — stay PWA or go native?
4. Monetization — affects which features are gated
5. AI features — in scope for v2 or v3?

---

## Success Metrics

_How we'll know v2 is successful._

- [ ] _TBD — e.g., user retention, session completion rate, feature adoption_
