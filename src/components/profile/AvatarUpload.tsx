import { useRef, useState } from 'react'
import { Camera, SpinnerGap } from '@phosphor-icons/react'
import { Avatar } from '@/components/ui'
import { useAvatarUrl, useUploadAvatar, useRemoveAvatar } from '@/hooks/useAvatar'
import { useToast } from '@/hooks/useToast'

const ACCEPT = 'image/jpeg,image/png,image/webp'

export function AvatarUpload() {
  const avatarUrl = useAvatarUrl()
  const uploadAvatar = useUploadAvatar()
  const removeAvatar = useRemoveAvatar()
  const { success, error: showError } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const isUploading = uploadAvatar.isPending
  const isRemoving = removeAvatar.isPending
  const busy = isUploading || isRemoving

  const displaySrc = preview ?? avatarUrl

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show instant preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    uploadAvatar.mutate(file, {
      onSuccess: () => {
        success('Photo updated')
        setPreview(null)
        URL.revokeObjectURL(objectUrl)
      },
      onError: (err) => {
        showError(err instanceof Error ? err.message : 'Failed to upload photo')
        setPreview(null)
        URL.revokeObjectURL(objectUrl)
      },
    })

    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  const handleRemove = () => {
    removeAvatar.mutate(undefined, {
      onSuccess: () => success('Photo removed'),
      onError: () => showError('Failed to remove photo'),
    })
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Avatar src={displaySrc} size="lg" alt="Your avatar" />

        {/* Camera button overlay */}
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-md border-2 border-[var(--color-surface)] disabled:opacity-50"
        >
          {isUploading ? (
            <SpinnerGap className="w-3.5 h-3.5 text-[var(--color-primary-text)] animate-spin" />
          ) : (
            <Camera className="w-3.5 h-3.5 text-[var(--color-primary-text)]" />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {avatarUrl && !isRemoving && (
        <button
          type="button"
          disabled={busy}
          onClick={handleRemove}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors disabled:opacity-50"
        >
          Remove photo
        </button>
      )}
      {isRemoving && (
        <span className="text-xs text-[var(--color-text-muted)]">Removing...</span>
      )}
    </div>
  )
}
