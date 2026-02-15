/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Loader2,
  AlertCircle,
  Target,
  Dumbbell,
  Info,
  Zap,
  RefreshCw,
} from 'lucide-react'
import { AppShell } from '@/components/layout'
import { Card, CardContent } from '@/components/ui'
import { FadeIn, ShimmerSkeleton } from '@/components/motion'
import { useExerciseDetail, useExerciseAlternatives } from '@/hooks/useExerciseLibrary'
import type { ExerciseDbExercise } from '@/services/exerciseDbService'

type TabId = 'instructions' | 'muscles'

const TABS: { id: TabId; label: string; icon: typeof Info }[] = [
  { id: 'instructions', label: 'Instructions', icon: Info },
  { id: 'muscles', label: 'Muscles', icon: Zap },
]

function ExerciseGifHero({ exercise }: { exercise: ExerciseDbExercise }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoaded(false)
    setError(false)
  }, [exercise.gifUrl])

  if (error || !exercise.gifUrl) {
    return (
      <div className="w-full aspect-[4/3] bg-[var(--color-surface-hover)] rounded-[var(--radius-xl)] flex items-center justify-center">
        <Dumbbell className="w-16 h-16 text-[var(--color-text-muted)] opacity-30" />
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-[4/3] bg-[var(--color-surface-hover)] rounded-[var(--radius-xl)] overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
        </div>
      )}
      <img
        src={exercise.gifUrl}
        alt={`${exercise.name} demonstration`}
        className={`w-full h-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  )
}

function TagPills({ exercise }: { exercise: ExerciseDbExercise }) {
  return (
    <div className="flex flex-wrap gap-2">
      {exercise.bodyParts?.map((part) => (
        <span
          key={part}
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] px-2.5 py-1 rounded-full capitalize"
        >
          <Target className="w-3 h-3" />
          {part}
        </span>
      ))}
      {exercise.equipments?.map((equip) => (
        <span
          key={equip}
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-hover)] px-2.5 py-1 rounded-full capitalize"
        >
          <Dumbbell className="w-3 h-3" />
          {equip}
        </span>
      ))}
    </div>
  )
}

function InstructionsTab({ instructions }: { instructions: string[] }) {
  if (instructions.length === 0) {
    return (
      <div className="text-center py-8">
        <Info className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2 opacity-50" />
        <p className="text-sm text-[var(--color-text-muted)]">No instructions available.</p>
      </div>
    )
  }

  return (
    <ol className="space-y-3">
      {instructions.map((instruction, index) => {
        const clean = instruction.replace(/^Step:\d+\s*/i, '')
        return (
          <li key={index} className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold rounded-full mt-0.5">
              {index + 1}
            </span>
            <span className="text-sm text-[var(--color-text-secondary)] leading-relaxed pt-1">
              {clean}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function MusclesTab({ exercise }: { exercise: ExerciseDbExercise }) {
  const hasPrimary = exercise.targetMuscles?.length > 0
  const hasSecondary = exercise.secondaryMuscles?.length > 0

  if (!hasPrimary && !hasSecondary) {
    return (
      <div className="text-center py-8">
        <Zap className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2 opacity-50" />
        <p className="text-sm text-[var(--color-text-muted)]">No muscle data available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {hasPrimary && (
        <div>
          <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
            Primary
          </h4>
          <div className="flex flex-wrap gap-2">
            {exercise.targetMuscles.map((muscle) => (
              <span
                key={muscle}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-full capitalize"
              >
                <Zap className="w-3.5 h-3.5" />
                {muscle}
              </span>
            ))}
          </div>
        </div>
      )}
      {hasSecondary && (
        <div>
          <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
            Secondary
          </h4>
          <div className="flex flex-wrap gap-2">
            {exercise.secondaryMuscles.map((muscle) => (
              <span
                key={muscle}
                className="text-sm font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-3 py-1.5 rounded-full capitalize"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AlternativesSection({ exercise }: { exercise: ExerciseDbExercise }) {
  const primaryMuscle = exercise.targetMuscles?.[0]
  const navigate = useNavigate()
  const { data: alternatives, isLoading } = useExerciseAlternatives(
    primaryMuscle,
    exercise.exerciseId,
    6
  )

  if (!primaryMuscle || (alternatives?.length === 0 && !isLoading)) return null

  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)] mb-3">
        <RefreshCw className="w-4 h-4" />
        Alternatives
      </h3>
      {isLoading ? (
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <ShimmerSkeleton key={i} width={160} height={120} rounded="lg" />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
          {alternatives?.map((alt) => (
            <button
              key={alt.exerciseId}
              onClick={() => navigate(`/exercises/${alt.exerciseId}`)}
              className="flex-shrink-0 w-40 snap-start"
            >
              <Card interactive className="h-full">
                <div className="aspect-square bg-[var(--color-surface-hover)] rounded-t-[var(--radius-lg)] overflow-hidden">
                  {alt.gifUrl ? (
                    <img
                      src={alt.gifUrl}
                      alt={alt.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Dumbbell className="w-8 h-8 text-[var(--color-text-muted)] opacity-30" />
                    </div>
                  )}
                </div>
                <CardContent className="py-2 px-2.5">
                  <p className="text-xs font-medium text-[var(--color-text)] capitalize line-clamp-2 leading-tight">
                    {alt.name}
                  </p>
                  {alt.equipments?.[0] && (
                    <p className="text-[10px] text-[var(--color-text-muted)] capitalize mt-0.5">
                      {alt.equipments[0]}
                    </p>
                  )}
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <ShimmerSkeleton width="100%" height={240} rounded="xl" />
      <ShimmerSkeleton width="70%" height={28} rounded="md" />
      <div className="flex gap-2">
        <ShimmerSkeleton width={80} height={28} rounded="full" />
        <ShimmerSkeleton width={100} height={28} rounded="full" />
      </div>
      <ShimmerSkeleton width="100%" height={200} rounded="lg" />
    </div>
  )
}

export function ExerciseDetailPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const { data: exercise, isLoading, error } = useExerciseDetail(exerciseId)
  const [activeTab, setActiveTab] = useState<TabId>('instructions')

  if (isLoading) {
    return (
      <AppShell title="Exercise" showBack hideNav>
        <DetailSkeleton />
      </AppShell>
    )
  }

  if (error || !exercise) {
    return (
      <AppShell title="Exercise" showBack hideNav>
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <AlertCircle className="w-12 h-12 text-[var(--color-text-muted)] mb-3 opacity-50" />
          <p className="text-base font-semibold text-[var(--color-text)] mb-1">
            Exercise not found
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            This exercise may have been removed or is temporarily unavailable.
          </p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title={exercise.name} showBack hideNav>
      <div className="p-4 space-y-5">
        {/* GIF Hero */}
        <FadeIn>
          <ExerciseGifHero exercise={exercise} />
        </FadeIn>

        {/* Name & Tags */}
        <FadeIn delay={0.05}>
          <h1 className="text-xl font-bold text-[var(--color-text)] capitalize leading-tight">
            {exercise.name}
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <TagPills exercise={exercise} />
        </FadeIn>

        {/* Tabbed Content */}
        <FadeIn delay={0.15}>
          <Card>
            <CardContent className="p-0">
              {/* Tab bar */}
              <div className="flex border-b border-[var(--color-border)]">
                {TABS.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium
                        transition-colors relative
                        ${isActive
                          ? 'text-[var(--color-primary)]'
                          : 'text-[var(--color-text-muted)]'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {isActive && (
                        <motion.div
                          layoutId="exercise-tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Tab content */}
              <div className="p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {activeTab === 'instructions' && (
                      <InstructionsTab instructions={exercise.instructions || []} />
                    )}
                    {activeTab === 'muscles' && (
                      <MusclesTab exercise={exercise} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Alternatives */}
        <FadeIn delay={0.2}>
          <AlternativesSection exercise={exercise} />
        </FadeIn>
      </div>
    </AppShell>
  )
}
