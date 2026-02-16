/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AppShell } from '@/components/layout'
import { Modal, Button } from '@/components/ui'
import { FadeIn, StaggerList, StaggerItem, PressableButton } from '@/components/motion'
import { ReviewSummaryCard } from '@/components/review/ReviewSummaryCard'
import { useDeleteSession, useUpdateSession, useUpdateSet, useDeleteSet } from '@/hooks/useWorkoutSession'
import { useSessionReview } from '@/hooks/useReview'
import { formatDate, formatTime, formatDuration } from '@/utils/formatters'
import { getWorkoutDisplayName, getWeightsStyleByName } from '@/config/workoutConfig'
import {
  Clock, CheckCircle, Barbell, Trash, PencilSimple, X, FloppyDisk, DotsThreeVertical, ShareNetwork, Stack, Note, Camera
} from '@phosphor-icons/react'
import { WorkoutPhotos } from '@/components/social/WorkoutPhotos'
import { useShare } from '@/hooks/useShare'
import { formatSessionShareText } from '@/utils/shareFormatters'
import { supabase } from '@/services/supabase'

interface SetWithExercise {
  id: string
  set_number: number
  reps_completed: number | null
  weight_used: number | null
  completed: boolean
  plan_exercise: {
    id: string
    name: string
    sets: number | null
    reps_min: number | null
    reps_max: number | null
    reps_unit: string | null
    weight_unit: string | null
    section: {
      name: string
      sort_order: number
    }
  }
}

interface SessionDetail {
  id: string
  started_at: string
  completed_at: string | null
  notes: string | null
  workout_day: {
    id: string
    name: string
  } | null
}

async function getSessionDetail(sessionId: string) {
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      workout_day:workout_days(id, name)
    `)
    .eq('id', sessionId)
    .single()

  if (sessionError) throw sessionError

  const { data: sets, error: setsError } = await supabase
    .from('exercise_sets')
    .select(`
      *,
      plan_exercise:plan_exercises(
        id,
        name,
        sets,
        reps_min,
        reps_max,
        reps_unit,
        weight_unit,
        section:exercise_sections(name, sort_order)
      )
    `)
    .eq('session_id', sessionId)
    .order('created_at')

  if (setsError) throw setsError

  return {
    session: session as SessionDetail,
    sets: sets as SetWithExercise[]
  }
}

// Edit Set Modal Component
interface EditSetModalProps {
  set: SetWithExercise | null
  isOpen: boolean
  onClose: () => void
  onSave: (setId: string, reps: number | null, weight: number | null) => void
  onDelete: (setId: string) => void
  isLoading: boolean
}

function EditSetModal({ set, isOpen, onClose, onSave, onDelete, isLoading }: EditSetModalProps) {
  const [reps, setReps] = useState<string>('')
  const [weight, setWeight] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Reset form when set changes
  useEffect(() => {
    if (set) {
      setReps(set.reps_completed?.toString() || '')
      setWeight(set.weight_used?.toString() || '')
      setShowDeleteConfirm(false)
    }
  }, [set])

  const handleSave = () => {
    if (!set) return
    onSave(
      set.id,
      reps ? parseInt(reps, 10) : null,
      weight ? parseFloat(weight) : null
    )
  }

  const handleDelete = () => {
    if (!set) return
    onDelete(set.id)
  }

  if (!set) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Set ${set.set_number}`}>
      {showDeleteConfirm ? (
        <div className="space-y-4">
          <p className="text-[var(--color-text-muted)]">
            Delete this set? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isLoading}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
              {set.plan_exercise.reps_unit || 'Reps'}
            </label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
              placeholder="0"
            />
          </div>
          {set.plan_exercise.weight_unit !== null && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                Weight ({set.plan_exercise.weight_unit || 'lbs'})
              </label>
              <input
                type="number"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
                placeholder="0"
              />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-12"
            >
              <Trash className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isLoading}
              className="flex-1"
            >
              <FloppyDisk className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  // CRUD Hooks
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession()
  const { mutate: updateSession, isPending: isUpdatingNotes } = useUpdateSession()
  const { mutate: updateSet, isPending: isUpdatingSet } = useUpdateSet()
  const { mutate: deleteSet, isPending: isDeletingSet } = useDeleteSet()

  const { share } = useShare()

  // State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [editedNotes, setEditedNotes] = useState('')
  const [editingSet, setEditingSet] = useState<SetWithExercise | null>(null)
  const [showActionsMenu, setShowActionsMenu] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: () => getSessionDetail(sessionId!),
    enabled: !!sessionId
  })

  // Fetch review for this session
  const { data: review } = useSessionReview(sessionId)

  // Handlers
  const handleDeleteSession = () => {
    if (!sessionId) return
    deleteSession(sessionId, {
      onSuccess: () => {
        navigate('/history', { replace: true })
      }
    })
  }

  const handleStartEditNotes = () => {
    setEditedNotes(data?.session.notes || '')
    setIsEditingNotes(true)
    setShowActionsMenu(false)
  }

  const handleSaveNotes = () => {
    if (!sessionId) return
    updateSession(
      { sessionId, notes: editedNotes || null },
      {
        onSuccess: () => {
          setIsEditingNotes(false)
          refetch()
        }
      }
    )
  }

  const handleSaveSet = (setId: string, reps: number | null, weight: number | null) => {
    updateSet(
      { setId, updates: { reps_completed: reps, weight_used: weight } },
      {
        onSuccess: () => {
          setEditingSet(null)
          refetch()
        }
      }
    )
  }

  const handleDeleteSet = (setId: string) => {
    deleteSet(setId, {
      onSuccess: () => {
        setEditingSet(null)
        refetch()
      }
    })
  }

  // Group sets by exercise
  const exerciseGroups = data?.sets.reduce((acc, set) => {
    const exerciseId = set.plan_exercise.id
    if (!acc[exerciseId]) {
      acc[exerciseId] = {
        exercise: set.plan_exercise,
        sets: []
      }
    }
    acc[exerciseId].sets.push(set)
    return acc
  }, {} as Record<string, { exercise: SetWithExercise['plan_exercise']; sets: SetWithExercise[] }>)

  // Sort by section order
  const sortedExercises = exerciseGroups
    ? Object.values(exerciseGroups).sort(
        (a, b) => a.exercise.section.sort_order - b.exercise.section.sort_order
      )
    : []

  // Group by section
  const sections = sortedExercises.reduce((acc, item) => {
    const sectionName = item.exercise.section.name
    if (!acc[sectionName]) {
      acc[sectionName] = []
    }
    acc[sectionName].push(item)
    return acc
  }, {} as Record<string, typeof sortedExercises>)

  // Calculate workout duration
  const getDuration = () => {
    if (!data?.session.started_at || !data?.session.completed_at) return null
    const start = new Date(data.session.started_at).getTime()
    const end = new Date(data.session.completed_at).getTime()
    const seconds = Math.floor((end - start) / 1000)
    return formatDuration(seconds)
  }

  // Get workout style for theming
  const workoutName = getWorkoutDisplayName(data?.session.workout_day?.name)
  const workoutStyle = data?.session.workout_day?.name
    ? getWeightsStyleByName(data.session.workout_day.name)
    : null
  const accentColor = workoutStyle?.color || 'var(--color-primary)'

  return (
    <AppShell
      title={workoutName || 'Workout Details'}
      showBack
      headerAction={
        data && (
          <div className="relative">
            <PressableButton
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
            >
              <DotsThreeVertical className="w-5 h-5" />
            </PressableButton>
            {showActionsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowActionsMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-lg border border-[var(--color-border)] z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowActionsMenu(false)
                      if (data) {
                        share({
                          title: workoutName || 'Workout',
                          text: formatSessionShareText({
                            workoutName: workoutName || 'Workout',
                            date: data.session.started_at,
                            duration: getDuration(),
                            exerciseCount: sortedExercises.length
                          })
                        })
                      }
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2"
                  >
                    <ShareNetwork className="w-4 h-4" />
                    Share Workout
                  </button>
                  <button
                    onClick={handleStartEditNotes}
                    className="w-full px-4 py-3 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2"
                  >
                    <PencilSimple className="w-4 h-4" />
                    Edit Notes
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(true)
                      setShowActionsMenu(false)
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-surface-hover)] flex items-center gap-2"
                  >
                    <Trash className="w-4 h-4" />
                    Delete Workout
                  </button>
                </div>
              </>
            )}
          </div>
        )
      }
    >
      {isLoading ? (
        <div className="p-[var(--space-4)] space-y-[var(--space-3)]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 skeleton rounded-[var(--radius-xl)]" />
          ))}
        </div>
      ) : data ? (
        <div className="pb-[var(--space-8)]">
          {/* Hero Section — gradient background with workout info */}
          <div className="relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, ${accentColor}15 0%, transparent 100%)`
              }}
            />
            <FadeIn direction="up" className="relative px-[var(--space-6)] pt-[var(--space-4)] pb-[var(--space-6)] flex flex-col items-center text-center">
              {/* Workout icon */}
              <div
                className="w-16 h-16 rounded-[var(--radius-xl)] flex items-center justify-center mb-[var(--space-3)]"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                {workoutStyle?.icon ? (
                  <workoutStyle.icon className="w-8 h-8" style={{ color: accentColor }} />
                ) : (
                  <Barbell className="w-8 h-8" style={{ color: accentColor }} />
                )}
              </div>

              {/* Date & time */}
              <p className="text-sm text-[var(--color-text-muted)]">
                {formatDate(data.session.started_at)} · {formatTime(data.session.started_at)}
              </p>

              {/* Status */}
              {data.session.completed_at && (
                <div className="flex items-center gap-1.5 mt-[var(--space-2)] text-[var(--color-success)] text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </div>
              )}
            </FadeIn>
          </div>

          {/* Metrics Row */}
          <div className="flex justify-around px-[var(--space-4)] -mt-1 mb-[var(--space-4)]">
            {getDuration() && (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center mb-1.5" style={{ background: 'var(--color-info-muted)' }}>
                  <Clock className="w-5 h-5 text-[var(--color-info)]" />
                </div>
                <span className="text-sm font-bold text-[var(--color-text)]">{getDuration()}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Duration</span>
              </div>
            )}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center mb-1.5" style={{ background: 'var(--color-tertiary-muted)' }}>
                <Stack className="w-5 h-5 text-[var(--color-tertiary)]" />
              </div>
              <span className="text-sm font-bold text-[var(--color-text)]">{sortedExercises.length}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Exercises</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center mb-1.5" style={{ background: 'var(--color-accent-muted)' }}>
                <Barbell className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
              <span className="text-sm font-bold text-[var(--color-text)]">{data.sets.length}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Sets</span>
            </div>
          </div>

          {/* Notes Section */}
          {isEditingNotes ? (
            <div className="px-[var(--space-4)] mb-[var(--space-4)]">
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] p-[var(--space-4)] space-y-[var(--space-3)]">
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Add notes about this workout..."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] text-sm resize-none"
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsEditingNotes(false)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveNotes}
                    loading={isUpdatingNotes}
                  >
                    <FloppyDisk className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : data.session.notes ? (
            <div className="px-[var(--space-4)] mb-[var(--space-4)]">
              <button
                onClick={handleStartEditNotes}
                className="w-full text-left bg-[var(--color-surface)] rounded-[var(--radius-xl)] p-[var(--space-4)] active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <Note className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{data.session.notes}</p>
                    <span className="text-xs text-[var(--color-primary)] mt-1 block">Tap to edit</span>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="px-[var(--space-4)] mb-[var(--space-4)]">
              <button
                onClick={handleStartEditNotes}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm text-[var(--color-primary)] bg-[var(--color-surface)] rounded-[var(--radius-xl)] active:scale-[0.98] transition-transform"
              >
                <Note className="w-4 h-4" />
                Add notes
              </button>
            </div>
          )}

          {/* Workout Review */}
          {review && (
            <div className="px-[var(--space-4)] mb-[var(--space-4)]">
              <ReviewSummaryCard review={review} />
            </div>
          )}

          {/* Photos */}
          {data.session.completed_at && (
            <div className="px-[var(--space-4)] mb-[var(--space-4)]">
              <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-[var(--space-2)] px-1 flex items-center gap-1.5">
                <Camera className="w-3 h-3" />
                Photos
              </h3>
              <WorkoutPhotos sessionId={sessionId} />
            </div>
          )}

          {/* Exercises by Section — iOS grouped list style */}
          <div className="px-[var(--space-4)] space-y-[var(--space-5)]">
            <StaggerList>
            {Object.entries(sections).map(([sectionName, exercises]) => (
              <StaggerItem key={sectionName}>
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-[var(--space-2)] px-1">
                  {sectionName}
                </h3>
                <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] overflow-hidden divide-y divide-[var(--color-border)]">
                  {exercises.map(({ exercise, sets }) => (
                    <div key={exercise.id} className="px-[var(--space-4)] py-[var(--space-3)]">
                      <div className="flex items-center gap-[var(--space-3)]">
                        <div
                          className="w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${accentColor}15` }}
                        >
                          <Barbell className="w-4 h-4" style={{ color: accentColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-[var(--color-text)]">{exercise.name}</h4>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {(() => {
                              if (sets.length === 0) return null
                              const allSameReps = sets.every(s => s.reps_completed === sets[0].reps_completed)
                              const allSameWeight = sets.every(s => s.weight_used === sets[0].weight_used)

                              if (allSameReps && allSameWeight) {
                                const reps = sets[0].reps_completed
                                const weight = sets[0].weight_used
                                return (
                                  <button
                                    onClick={() => setEditingSet(sets[0])}
                                    className="text-xs bg-[var(--color-background)] px-2.5 py-1 rounded-lg active:scale-95 transition-transform"
                                  >
                                    <span className="font-medium text-[var(--color-text)]">
                                      {sets.length} {sets.length === 1 ? 'set' : 'sets'}
                                    </span>
                                    {reps != null && (
                                      <span className="text-[var(--color-text-muted)]">
                                        , {reps} {exercise.reps_unit || 'reps'}
                                      </span>
                                    )}
                                    {weight != null && (
                                      <span className="text-[var(--color-text-muted)]">
                                        {' '}@ {weight} {exercise.weight_unit || 'lbs'}
                                      </span>
                                    )}
                                  </button>
                                )
                              } else {
                                return sets.map((set, index) => (
                                  <button
                                    key={set.id}
                                    onClick={() => setEditingSet(set)}
                                    className="text-xs bg-[var(--color-background)] px-2.5 py-1 rounded-lg active:scale-95 transition-transform"
                                  >
                                    <span className="font-medium text-[var(--color-text)]">S{index + 1}</span>
                                    {set.reps_completed != null && (
                                      <span className="text-[var(--color-text-muted)]">
                                        : {set.reps_completed} {exercise.reps_unit || 'reps'}
                                      </span>
                                    )}
                                    {set.weight_used != null && (
                                      <span className="text-[var(--color-text-muted)]">
                                        {' '}@ {set.weight_used} {exercise.weight_unit || 'lbs'}
                                      </span>
                                    )}
                                  </button>
                                ))
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </StaggerItem>
            ))}
            </StaggerList>

            {sortedExercises.length === 0 && (
              <div className="text-center py-12">
                <Barbell className="w-10 h-10 text-[var(--color-text-muted)] opacity-30 mx-auto mb-3" />
                <p className="text-sm text-[var(--color-text-muted)]">No exercises logged for this session.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-[var(--color-text-muted)]">Session not found.</p>
        </div>
      )}

      {/* Delete Session Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Workout"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-text-muted)]">
            Are you sure you want to delete this workout session?
          </p>
          <p className="text-sm font-medium text-[var(--color-text)]">
            {workoutName} - {data && formatDate(data.session.started_at)}
          </p>
          <p className="text-sm text-[var(--color-danger)]">
            This will permanently delete all logged sets and cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteSession}
              loading={isDeleting}
              className="flex-1"
            >
              <Trash className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Set Modal */}
      <EditSetModal
        set={editingSet}
        isOpen={!!editingSet}
        onClose={() => setEditingSet(null)}
        onSave={handleSaveSet}
        onDelete={handleDeleteSet}
        isLoading={isUpdatingSet || isDeletingSet}
      />
    </AppShell>
  )
}
