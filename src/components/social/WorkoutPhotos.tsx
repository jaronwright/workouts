import { useState, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'motion/react'
import { Camera, X, SpinnerGap, Trash } from '@phosphor-icons/react'


import { uploadWorkoutPhoto, deleteWorkoutPhoto, getPhotosForSession } from '@/services/photoService'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'
import type { WorkoutPhoto } from '@/types/community'

interface WorkoutPhotosProps {
  sessionId?: string
  templateSessionId?: string
}

export function WorkoutPhotos({ sessionId, templateSessionId }: WorkoutPhotosProps) {
  const user = useAuthStore(s => s.user)
  const queryClient = useQueryClient()
  const { success, error: showError } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [viewingPhoto, setViewingPhoto] = useState<WorkoutPhoto | null>(null)

  const queryKey = ['workout-photos', sessionId, templateSessionId]

  const { data: photos = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => getPhotosForSession(sessionId, templateSessionId),
    enabled: !!(sessionId || templateSessionId),
  })

  const { mutate: upload, isPending: isUploading } = useMutation({
    mutationFn: (file: File) => {
      if (!user) throw new Error('Not authenticated')
      return uploadWorkoutPhoto(user.id, file, sessionId, templateSessionId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      success('Photo uploaded')
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : 'Failed to upload photo')
    },
  })

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: (photo: WorkoutPhoto) => deleteWorkoutPhoto(photo.id, photo.photo_url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      setViewingPhoto(null)
      success('Photo removed')
    },
    onError: () => showError('Failed to remove photo'),
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showError('Photo must be under 10MB')
      return
    }

    upload(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  if (isLoading) {
    return (
      <div className="h-24 bg-[var(--color-surface-hover)] animate-pulse rounded-[var(--radius-lg)]" />
    )
  }

  return (
    <div>
      {/* Photo grid + upload button */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {photos.map(photo => (
          <button
            key={photo.id}
            onClick={() => setViewingPhoto(photo)}
            className="flex-shrink-0 active:scale-95 transition-transform"
          >
            <img
              src={photo.photo_url}
              alt={photo.caption || 'Workout photo'}
              className="w-24 h-24 rounded-xl object-cover"
            />
          </button>
        ))}

        {/* Add photo button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-24 h-24 rounded-xl border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-1 text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors flex-shrink-0"
        >
          {isUploading ? (
            <SpinnerGap className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Camera className="w-5 h-5" />
              <span className="text-[10px] font-medium">Add Photo</span>
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Photo viewer modal */}
      <AnimatePresence>
        {viewingPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80"
              onClick={() => setViewingPhoto(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative z-10 max-w-sm w-full mx-4"
            >
              <img
                src={viewingPhoto.photo_url}
                alt={viewingPhoto.caption || 'Workout photo'}
                className="w-full rounded-2xl object-contain max-h-[60vh]"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => remove(viewingPhoto)}
                  disabled={isDeleting}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-[var(--color-danger)]/80 transition-colors"
                >
                  {isDeleting ? (
                    <SpinnerGap className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setViewingPhoto(null)}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {viewingPhoto.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl">
                  <p className="text-sm text-white">{viewingPhoto.caption}</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
