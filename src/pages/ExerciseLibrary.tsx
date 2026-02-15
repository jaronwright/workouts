/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react'
import { AppShell } from '@/components/layout'
import { FadeIn } from '@/components/motion'
import {
  Search,
  Dumbbell,
  Target,
  Activity,
  ChevronRight,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Zap,
  X,
} from 'lucide-react'
import {
  useBodyPartList,
  useTargetList,
  useEquipmentList,
  useExercisesByCategory,
  type BrowseCategory,
} from '@/hooks/useExerciseLibrary'
import { useExerciseInfo } from '@/hooks/useExerciseGif'
import type { ExerciseDbExercise } from '@/services/exerciseDbService'

type ViewState =
  | { type: 'home' }
  | { type: 'category-list'; category: BrowseCategory }
  | { type: 'exercise-list'; category: BrowseCategory; value: string }
  | { type: 'exercise-detail'; exercise: ExerciseDbExercise }
  | { type: 'search' }

const CATEGORY_CONFIG: Record<BrowseCategory, { label: string; icon: typeof Target; color: string }> = {
  bodyPart: { label: 'Body Part', icon: Target, color: 'var(--color-accent)' },
  target: { label: 'Target Muscle', icon: Activity, color: 'var(--color-primary)' },
  equipment: { label: 'Equipment', icon: Dumbbell, color: 'var(--color-tertiary)' },
}

function capitalize(s: string): string {
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// ─── Search View ────────────────────────────────────────────
function SearchView({ onSelectExercise }: { onSelectExercise: (e: ExerciseDbExercise) => void }) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(timer)
  }, [query])

  const { exercise, isLoading } = useExerciseInfo(
    debouncedQuery.length >= 2 ? debouncedQuery : undefined
  )

  return (
    <div className="px-[var(--space-4)] pt-[var(--space-4)]">
      <div className="relative mb-[var(--space-4)]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="
            w-full pl-10 pr-10 py-3
            bg-[var(--color-surface)] border border-[var(--color-border)]
            rounded-[var(--radius-lg)]
            text-sm text-[var(--color-text)]
            placeholder:text-[var(--color-text-muted)]
            focus:outline-none focus:border-[var(--color-primary)]
            transition-colors
          "
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
        </div>
      )}

      {!isLoading && exercise && (
        <button
          onClick={() => onSelectExercise(exercise)}
          className="w-full text-left"
        >
          <ExerciseListItem exercise={exercise} />
        </button>
      )}

      {!isLoading && debouncedQuery.length >= 2 && !exercise && (
        <div className="flex flex-col items-center py-12 text-center">
          <AlertCircle className="w-8 h-8 text-[var(--color-text-muted)] mb-2" />
          <p className="text-sm text-[var(--color-text-muted)]">
            No exercises found for &ldquo;{debouncedQuery}&rdquo;
          </p>
        </div>
      )}

      {!debouncedQuery && (
        <p className="text-center text-sm text-[var(--color-text-muted)] py-12">
          Type an exercise name to search
        </p>
      )}
    </div>
  )
}

// ─── Exercise List Item ─────────────────────────────────────
function ExerciseListItem({ exercise }: { exercise: ExerciseDbExercise }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <div className="
      flex items-center gap-3 p-3
      bg-[var(--color-surface)] border border-[var(--color-border)]
      rounded-[var(--radius-lg)]
      active:bg-[var(--color-surface-hover)] transition-colors
    ">
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-surface-hover)] flex-shrink-0">
        {exercise.gifUrl && !imgError ? (
          <>
            {!imgLoaded && (
              <div className="w-14 h-14 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-[var(--color-text-muted)] animate-pulse" />
              </div>
            )}
            <img
              src={exercise.gifUrl}
              alt={exercise.name}
              className={`w-14 h-14 object-cover ${imgLoaded ? 'block' : 'hidden'}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-14 h-14 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-[var(--color-text-muted)]" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text)] truncate">
          {capitalize(exercise.name)}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {exercise.targetMuscles?.slice(0, 1).map(m => (
            <span key={m} className="text-[10px] font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded-full">
              {m}
            </span>
          ))}
          {exercise.equipments?.slice(0, 1).map(e => (
            <span key={e} className="text-[10px] font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded-full">
              {e}
            </span>
          ))}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
    </div>
  )
}

// ─── Exercise Detail View ───────────────────────────────────
function ExerciseDetailView({ exercise }: { exercise: ExerciseDbExercise }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <div className="px-[var(--space-4)] pt-[var(--space-2)] space-y-5">
      {/* GIF */}
      {exercise.gifUrl && !imgError && (
        <div className="relative rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-surface-hover)]">
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
            </div>
          )}
          <img
            src={exercise.gifUrl}
            alt={`${exercise.name} demonstration`}
            className={`w-full ${imgLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        </div>
      )}

      {/* Name */}
      <h2
        className="text-xl font-bold text-[var(--color-text)]"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {capitalize(exercise.name)}
      </h2>

      {/* Quick badges */}
      <div className="flex flex-wrap gap-2">
        {exercise.bodyParts?.map(part => (
          <span key={part} className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] px-2.5 py-1.5 rounded-full">
            <Target className="w-3 h-3" />
            {part}
          </span>
        ))}
        {exercise.equipments?.map(equip => (
          <span key={equip} className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] px-2.5 py-1.5 rounded-full">
            <Dumbbell className="w-3 h-3" />
            {equip}
          </span>
        ))}
      </div>

      {/* Muscles Worked */}
      {(exercise.targetMuscles?.length > 0 || exercise.secondaryMuscles?.length > 0) && (
        <div className="bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)] p-4">
          <h4 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text)] mb-3">
            <Activity className="w-4 h-4 text-[var(--color-primary)]" />
            Muscles Worked
          </h4>
          {exercise.targetMuscles?.length > 0 && (
            <div className="mb-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-1.5 block">
                Primary
              </span>
              <div className="flex flex-wrap gap-1.5">
                {exercise.targetMuscles.map(m => (
                  <span key={m} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/15 px-2.5 py-1.5 rounded-full">
                    <Zap className="w-3 h-3" />
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
          {exercise.secondaryMuscles?.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-1.5 block">
                Secondary
              </span>
              <div className="flex flex-wrap gap-1.5">
                {exercise.secondaryMuscles.map(m => (
                  <span key={m} className="inline-flex items-center text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface)] px-2.5 py-1.5 rounded-full border border-[var(--color-border)]">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {exercise.instructions?.length > 0 && (
        <div>
          <h4 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text)] mb-3">
            <svg className="w-4 h-4 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            How to Perform
          </h4>
          <ol className="space-y-2.5">
            {exercise.instructions.map((step, i) => {
              const clean = step.replace(/^Step:\d+\s*/i, '')
              return (
                <li key={i} className="flex gap-3 text-sm text-[var(--color-text-secondary)]">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold rounded-full mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{clean}</span>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  )
}

// ─── Inner Back Nav ─────────────────────────────────────────
function InnerBackNav({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-1)]">
      <button
        onClick={onClick}
        className="
          flex items-center gap-1 text-xs font-medium text-[var(--color-primary)]
          active:opacity-70 transition-opacity
        "
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {label}
      </button>
    </div>
  )
}

// ─── Main Page Component ────────────────────────────────────
export function ExerciseLibraryPage() {
  const [view, setView] = useState<ViewState>({ type: 'home' })

  const bodyParts = useBodyPartList()
  const targets = useTargetList()
  const equipment = useEquipmentList()

  const browseCategory = view.type === 'exercise-list' ? view.category : null
  const browseValue = view.type === 'exercise-list' ? view.value : null
  const { data: exercises, isLoading: exercisesLoading } = useExercisesByCategory(
    browseCategory,
    browseValue,
  )

  const getCategoryList = useCallback((cat: BrowseCategory): string[] => {
    switch (cat) {
      case 'bodyPart': return bodyParts.data || []
      case 'target': return targets.data || []
      case 'equipment': return equipment.data || []
    }
  }, [bodyParts.data, targets.data, equipment.data])

  const getCategoryLoading = useCallback((cat: BrowseCategory): boolean => {
    switch (cat) {
      case 'bodyPart': return bodyParts.isLoading
      case 'target': return targets.isLoading
      case 'equipment': return equipment.isLoading
    }
  }, [bodyParts.isLoading, targets.isLoading, equipment.isLoading])

  const getTitle = (): string => {
    switch (view.type) {
      case 'home': return 'Exercise Library'
      case 'search': return 'Exercise Library'
      case 'category-list': return 'Exercise Library'
      case 'exercise-list': return 'Exercise Library'
      case 'exercise-detail': return 'Exercise Library'
    }
  }

  const handleBack = () => {
    switch (view.type) {
      case 'search':
      case 'category-list':
        setView({ type: 'home' })
        break
      case 'exercise-list':
        setView({ type: 'category-list', category: view.category })
        break
      case 'exercise-detail':
        setView({ type: 'home' })
        break
    }
  }

  return (
    <AppShell
      title={getTitle()}
      showBack
    >
      {/* ═══ HOME VIEW ═══ */}
      {view.type === 'home' && (
        <FadeIn direction="up">
          <div className="px-[var(--space-4)] pt-[var(--space-4)] space-y-[var(--space-5)]">
            {/* Search bar */}
            <button
              onClick={() => setView({ type: 'search' })}
              className="
                w-full flex items-center gap-3 px-4 py-3
                bg-[var(--color-surface)] border border-[var(--color-border)]
                rounded-[var(--radius-lg)]
                text-sm text-[var(--color-text-muted)]
                active:bg-[var(--color-surface-hover)] transition-colors
              "
            >
              <Search className="w-4.5 h-4.5" />
              Search exercises...
            </button>

            {/* Browse categories */}
            <div>
              <h3
                className="text-[var(--text-xs)] font-bold text-[var(--color-text-secondary)] uppercase mb-[var(--space-3)] px-1"
                style={{ letterSpacing: 'var(--tracking-widest)' }}
              >
                Browse by
              </h3>
              <div className="space-y-[var(--space-2)]">
                {(Object.keys(CATEGORY_CONFIG) as BrowseCategory[]).map((cat) => {
                  const config = CATEGORY_CONFIG[cat]
                  const Icon = config.icon
                  const count = getCategoryList(cat).length
                  const loading = getCategoryLoading(cat)

                  return (
                    <button
                      key={cat}
                      onClick={() => setView({ type: 'category-list', category: cat })}
                      className="
                        w-full flex items-center gap-4 p-4
                        bg-[var(--color-surface)] border border-[var(--color-border)]
                        rounded-[var(--radius-xl)]
                        active:bg-[var(--color-surface-hover)] transition-colors
                        shadow-[var(--shadow-xs)]
                      "
                    >
                      <div
                        className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center"
                        style={{ backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-[var(--color-text)]">
                          {config.label}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {loading ? 'Loading...' : `${count} categories`}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quick body part chips */}
            {bodyParts.data && bodyParts.data.length > 0 && (
              <div>
                <h3
                  className="text-[var(--text-xs)] font-bold text-[var(--color-text-secondary)] uppercase mb-[var(--space-3)] px-1"
                  style={{ letterSpacing: 'var(--tracking-widest)' }}
                >
                  Popular body parts
                </h3>
                <div className="flex flex-wrap gap-2">
                  {bodyParts.data.slice(0, 6).map(part => (
                    <button
                      key={part}
                      onClick={() => setView({ type: 'exercise-list', category: 'bodyPart', value: part })}
                      className="
                        px-3.5 py-2 rounded-full
                        bg-[var(--color-surface)] border border-[var(--color-border)]
                        text-xs font-medium text-[var(--color-text-secondary)]
                        active:bg-[var(--color-primary)]/10 active:text-[var(--color-primary)]
                        active:border-[var(--color-primary)]/30
                        transition-colors
                      "
                    >
                      {capitalize(part)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {/* ═══ SEARCH VIEW ═══ */}
      {view.type === 'search' && (
        <>
          <InnerBackNav label="Back" onClick={handleBack} />
          <SearchView
            onSelectExercise={(e) => setView({ type: 'exercise-detail', exercise: e })}
          />
        </>
      )}

      {/* ═══ CATEGORY LIST VIEW ═══ */}
      {view.type === 'category-list' && (
        <FadeIn direction="up">
          <InnerBackNav label="Back" onClick={handleBack} />
          <div className="px-[var(--space-4)]">
            <h2
              className="text-lg font-bold text-[var(--color-text)] mb-[var(--space-3)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              By {CATEGORY_CONFIG[view.category].label}
            </h2>
            {getCategoryLoading(view.category) ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
              </div>
            ) : (
              <div className="space-y-[var(--space-2)]">
                {getCategoryList(view.category).map(value => (
                  <button
                    key={value}
                    onClick={() => setView({ type: 'exercise-list', category: view.category, value })}
                    className="
                      w-full flex items-center justify-between p-4
                      bg-[var(--color-surface)] border border-[var(--color-border)]
                      rounded-[var(--radius-lg)]
                      active:bg-[var(--color-surface-hover)] transition-colors
                    "
                  >
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      {capitalize(value)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {/* ═══ EXERCISE LIST VIEW ═══ */}
      {view.type === 'exercise-list' && (
        <FadeIn direction="up">
          <InnerBackNav label={`By ${CATEGORY_CONFIG[view.category].label}`} onClick={handleBack} />
          <div className="px-[var(--space-4)]">
            <h2
              className="text-lg font-bold text-[var(--color-text)] mb-[var(--space-3)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {capitalize(view.value)}
            </h2>
            {exercisesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
              </div>
            ) : exercises && exercises.length > 0 ? (
              <div className="space-y-[var(--space-2)]">
                {exercises.map(ex => (
                  <button
                    key={ex.exerciseId}
                    onClick={() => setView({ type: 'exercise-detail', exercise: ex })}
                    className="w-full text-left"
                  >
                    <ExerciseListItem exercise={ex} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-center">
                <AlertCircle className="w-8 h-8 text-[var(--color-text-muted)] mb-2" />
                <p className="text-sm text-[var(--color-text-muted)]">
                  No exercises found for this category.
                </p>
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {/* ═══ EXERCISE DETAIL VIEW ═══ */}
      {view.type === 'exercise-detail' && (
        <FadeIn direction="up">
          <InnerBackNav label="Back" onClick={handleBack} />
          <ExerciseDetailView exercise={view.exercise} />
        </FadeIn>
      )}
    </AppShell>
  )
}
