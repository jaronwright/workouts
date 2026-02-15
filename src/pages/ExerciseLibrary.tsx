import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search,
  X,
  Dumbbell,
  Target,
  Loader2,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { AppShell } from '@/components/layout'
import { Card, CardContent } from '@/components/ui'
import { FadeIn, ShimmerSkeleton } from '@/components/motion'
import {
  useBodyPartList,
  useTargetMuscleList,
  useEquipmentList,
  useExerciseBrowse,
  useExerciseSearch,
} from '@/hooks/useExerciseLibrary'
import type { ExerciseDbExercise } from '@/services/exerciseDbService'

type BrowseTab = 'bodyPart' | 'muscle' | 'equipment'

const TABS: { id: BrowseTab; label: string; icon: typeof Target }[] = [
  { id: 'bodyPart', label: 'Body Part', icon: Target },
  { id: 'muscle', label: 'Muscle', icon: Zap },
  { id: 'equipment', label: 'Equipment', icon: Dumbbell },
]

// Category display icons/colors
const BODY_PART_ICONS: Record<string, string> = {
  back: '🔙', cardio: '❤️', chest: '💪', 'lower arms': '🤲',
  'lower legs': '🦵', neck: '🦒', shoulders: '🏔️',
  'upper arms': '💪', 'upper legs': '🦿', waist: '🔥',
}

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function ExerciseListItem({
  exercise,
  onClick,
}: {
  exercise: ExerciseDbExercise
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left"
    >
      <Card interactive>
        <CardContent className="flex items-center gap-3 py-3">
          {/* Thumbnail */}
          <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-surface-hover)] overflow-hidden flex-shrink-0">
            {exercise.gifUrl ? (
              <img
                src={exercise.gifUrl}
                alt={exercise.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-[var(--color-text-muted)] opacity-30" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text)] capitalize line-clamp-1">
              {exercise.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {exercise.bodyParts?.[0] && (
                <span className="text-[11px] text-[var(--color-text-muted)] capitalize">
                  {exercise.bodyParts[0]}
                </span>
              )}
              {exercise.equipments?.[0] && (
                <>
                  <span className="text-[var(--color-text-muted)]">·</span>
                  <span className="text-[11px] text-[var(--color-text-muted)] capitalize">
                    {exercise.equipments[0]}
                  </span>
                </>
              )}
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
        </CardContent>
      </Card>
    </button>
  )
}

function CategoryChip({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-medium
        transition-colors capitalize whitespace-nowrap
        ${isActive
          ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
          : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
        }
      `}
    >
      {BODY_PART_ICONS[label] ? `${BODY_PART_ICONS[label]} ` : ''}{label}
    </button>
  )
}

function SearchResults({ query }: { query: string }) {
  const navigate = useNavigate()
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExerciseSearch(query)

  const exercises = data?.pages.flatMap((p) => p.exercises) ?? []
  const total = data?.pages[0]?.pagination.totalExercises ?? 0

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <ShimmerSkeleton key={i} width="100%" height={72} rounded="lg" />
        ))}
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
        <p className="text-sm font-medium text-[var(--color-text)]">No exercises found</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Try a different search term
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs text-[var(--color-text-muted)] mb-2">{total} results</p>
      {exercises.map((exercise) => (
        <ExerciseListItem
          key={exercise.exerciseId}
          exercise={exercise}
          onClick={() => navigate(`/exercises/${exercise.exerciseId}`)}
        />
      ))}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-3 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 rounded-[var(--radius-lg)] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isFetchingNextPage ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Load more'
          )}
        </button>
      )}
    </div>
  )
}

function BrowseResults({
  tab,
  selectedCategory,
}: {
  tab: BrowseTab
  selectedCategory: string
}) {
  const navigate = useNavigate()
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExerciseBrowse(tab, selectedCategory)

  const exercises = data?.pages.flatMap((p) => p.exercises) ?? []
  const total = data?.pages[0]?.pagination.totalExercises ?? 0

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <ShimmerSkeleton key={i} width="100%" height={72} rounded="lg" />
        ))}
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <Dumbbell className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
        <p className="text-sm font-medium text-[var(--color-text)]">No exercises found</p>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs text-[var(--color-text-muted)] mb-2">
        {total} exercises
      </p>
      {exercises.map((exercise) => (
        <ExerciseListItem
          key={exercise.exerciseId}
          exercise={exercise}
          onClick={() => navigate(`/exercises/${exercise.exerciseId}`)}
        />
      ))}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-3 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 rounded-[var(--radius-lg)] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isFetchingNextPage ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Load more'
          )}
        </button>
      )}
    </div>
  )
}

export function ExerciseLibraryPage() {
  const [searchParams] = useSearchParams()
  const initialBodyPart = searchParams.get('bodyPart') || ''
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<BrowseTab>('bodyPart')
  const [selectedCategory, setSelectedCategory] = useState<string>(initialBodyPart)

  const debouncedSearch = useDebounce(searchQuery, 400)
  const isSearching = debouncedSearch.trim().length >= 2

  const { data: bodyParts, isLoading: loadingBP } = useBodyPartList()
  const { data: muscles, isLoading: loadingMuscles } = useTargetMuscleList()
  const { data: equipment, isLoading: loadingEquip } = useEquipmentList()

  const categories = useMemo(() => {
    switch (activeTab) {
      case 'bodyPart': return bodyParts ?? []
      case 'muscle': return muscles ?? []
      case 'equipment': return equipment ?? []
    }
  }, [activeTab, bodyParts, muscles, equipment])

  const handleTabChange = useCallback((tab: BrowseTab) => {
    setActiveTab(tab)
    setSelectedCategory('')
  }, [])

  return (
    <AppShell title="Exercise Library">
      <div className="p-4 space-y-4">
        {/* Search bar */}
        <FadeIn>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full h-11 pl-10 pr-10
                bg-[var(--color-surface)]
                border border-[var(--color-border)]
                rounded-[var(--radius-lg)]
                text-sm text-[var(--color-text)]
                placeholder:text-[var(--color-text-muted)]
                focus:outline-none focus:border-[var(--color-primary)]
                transition-colors
              "
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--color-surface-hover)]"
              >
                <X className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              </button>
            )}
          </div>
        </FadeIn>

        {/* Search results mode */}
        {isSearching ? (
          <SearchResults query={debouncedSearch} />
        ) : (
          <>
            {/* Browse tabs */}
            <FadeIn delay={0.05}>
              <div className="flex border-b border-[var(--color-border)] -mx-4 px-4">
                {TABS.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`
                        flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium
                        transition-colors relative
                        ${isActive
                          ? 'text-[var(--color-primary)]'
                          : 'text-[var(--color-text-muted)]'
                        }
                      `}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                      {isActive && (
                        <motion.div
                          layoutId="library-tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </FadeIn>

            {/* Category chips */}
            <FadeIn delay={0.1}>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 snap-x">
                {(loadingBP || loadingMuscles || loadingEquip) && categories.length === 0 ? (
                  [1, 2, 3, 4].map((i) => (
                    <ShimmerSkeleton key={i} width={90} height={36} rounded="full" />
                  ))
                ) : (
                  categories.map((cat) => (
                    <CategoryChip
                      key={cat}
                      label={cat}
                      isActive={selectedCategory === cat}
                      onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                    />
                  ))
                )}
              </div>
            </FadeIn>

            {/* Browse results */}
            <AnimatePresence mode="wait">
              {selectedCategory ? (
                <motion.div
                  key={`${activeTab}-${selectedCategory}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <BrowseResults tab={activeTab} selectedCategory={selectedCategory} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Dumbbell className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3 opacity-30" />
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Select a category to browse exercises
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </AppShell>
  )
}
