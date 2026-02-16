import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { PaperPlaneTilt, Trash, ChatCircle } from '@phosphor-icons/react'
import { Avatar } from '@/components/ui'
import { useComments, useAddComment, useDeleteComment } from '@/hooks/useComments'
import { useAuthStore } from '@/stores/authStore'
import { formatRelativeTime } from '@/utils/formatters'
import type { ActivityComment } from '@/types/community'

interface CommentSectionProps {
  sessionId?: string
  templateSessionId?: string
  workoutOwnerId: string
}

export function CommentSection({ sessionId, templateSessionId, workoutOwnerId }: CommentSectionProps) {
  const user = useAuthStore(s => s.user)
  const { data: comments, isLoading } = useComments(sessionId, templateSessionId)
  const addComment = useAddComment()
  const deleteComment = useDeleteComment()
  const [newComment, setNewComment] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    const content = newComment.trim()
    if (!content || !user) return

    addComment.mutate({
      content,
      sessionId,
      templateSessionId,
      workoutOwnerId,
    })
    setNewComment('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleDelete = (comment: ActivityComment) => {
    deleteComment.mutate({
      commentId: comment.id,
      sessionId: comment.session_id ?? undefined,
      templateSessionId: comment.template_session_id ?? undefined,
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ChatCircle className="w-4 h-4 text-[var(--color-text-muted)]" />
        <h4 className="text-sm font-semibold text-[var(--color-text)]">
          Comments {comments && comments.length > 0 && `(${comments.length})`}
        </h4>
      </div>

      {/* Comment list */}
      {isLoading ? (
        <div className="space-y-2">
          {[0, 1].map(i => (
            <div key={i} className="h-12 bg-[var(--color-surface-hover)] animate-pulse rounded-[var(--radius-md)]" />
          ))}
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {comments && comments.length > 0 ? (
            <div className="space-y-2">
              {comments.map(comment => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="flex gap-2.5 group"
                >
                  <Avatar
                    src={comment.user_profile?.avatar_url}
                    alt={comment.user_profile?.display_name || 'User'}
                    size="sm"
                    className="w-7 h-7 flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-[var(--color-text)]">
                        {comment.user_profile?.display_name || 'Anonymous'}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] opacity-70">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] break-words">
                      {comment.content}
                    </p>
                  </div>
                  {/* Delete own comment */}
                  {user && comment.user_id === user.id && (
                    <button
                      onClick={() => handleDelete(comment)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-all flex-shrink-0"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-2">
              Be the first to comment
            </p>
          )}
        </AnimatePresence>
      )}

      {/* Comment input */}
      {user && (
        <div className="flex items-center gap-2">
          <Avatar
            src={null}
            alt="You"
            size="sm"
            className="w-7 h-7 flex-shrink-0"
          />
          <div className="flex-1 flex items-center gap-2 bg-[var(--color-surface-hover)] rounded-full px-3 py-1.5">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment..."
              maxLength={500}
              className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || addComment.isPending}
              className="p-1 text-[var(--color-primary)] disabled:opacity-30 transition-opacity"
            >
              <PaperPlaneTilt className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
