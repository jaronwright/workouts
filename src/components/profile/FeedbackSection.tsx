import { useRef, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Button, CollapsibleSection } from '@/components/ui'
import { useSubmitFeedback, useUserFeedback } from '@/hooks/useFeedback'
import { useToast } from '@/hooks/useToast'
import { ChatTeardropText, Bug, Lightbulb } from '@phosphor-icons/react'

export function FeedbackSection() {
  const location = useLocation()
  const { success, error: showError } = useToast()
  const feedbackRef = useRef<HTMLDivElement>(null)

  const openFeedback = (location.state as { openFeedback?: boolean } | null)?.openFeedback ?? false

  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature'>('bug')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const { mutate: submitFeedback, isPending: isSubmittingFeedback } = useSubmitFeedback()
  const { data: pastFeedback } = useUserFeedback()

  // Scroll to feedback section when navigated with openFeedback state
  useEffect(() => {
    if (openFeedback && feedbackRef.current) {
      setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
    }
  }, [openFeedback])

  return (
    <div ref={feedbackRef} className="px-[var(--space-4)] pt-[var(--space-2)]">
      <CollapsibleSection
        icon={ChatTeardropText}
        iconColor="bg-[var(--color-warning-muted)] text-[var(--color-warning)]"
        title="Feedback"
        subtitle="Report a bug or request a feature"
        defaultOpen={openFeedback}
        onToggle={(isOpen) => { if (isOpen) setFeedbackSubmitted(false) }}
      >
        {feedbackSubmitted ? (
          <div className="text-center py-[var(--space-4)]">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-[var(--space-3)]" style={{ background: 'var(--color-success-muted)' }}>
              <ChatTeardropText className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
            </div>
            <p className="font-medium text-[var(--color-text)]">Thanks for your feedback!</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">We'll review it soon.</p>
            <button
              onClick={() => setFeedbackSubmitted(false)}
              className="text-sm font-medium text-[var(--color-primary)] mt-[var(--space-3)]"
            >
              Submit another
            </button>
          </div>
        ) : (
          <>
            {/* Type selector pills */}
            <div className="flex gap-[var(--space-2)]">
              <button
                onClick={() => setFeedbackType('bug')}
                className={`flex-1 flex items-center justify-center gap-[var(--space-2)] py-2 px-[var(--space-3)] rounded-[var(--radius-md)] border-2 transition-all text-sm font-medium ${
                  feedbackType === 'bug'
                    ? 'border-[var(--color-danger)] bg-[var(--color-danger-muted)] text-[var(--color-danger)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                <Bug className="w-4 h-4" />
                Bug Report
              </button>
              <button
                onClick={() => setFeedbackType('feature')}
                className={`flex-1 flex items-center justify-center gap-[var(--space-2)] py-2 px-[var(--space-3)] rounded-[var(--radius-md)] border-2 transition-all text-sm font-medium ${
                  feedbackType === 'feature'
                    ? 'border-[var(--color-warning)] bg-[var(--color-warning-muted)] text-[var(--color-warning)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                Feature Request
              </button>
            </div>

            {/* Message textarea */}
            <textarea
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder={feedbackType === 'bug' ? 'Describe the bug...' : 'Describe the feature you\'d like...'}
              rows={3}
              className="w-full px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none text-sm"
            />

            {/* Submit */}
            <Button
              onClick={() => {
                submitFeedback(
                  { type: feedbackType, message: feedbackMessage },
                  {
                    onSuccess: () => {
                      setFeedbackMessage('')
                      setFeedbackSubmitted(true)
                      success('Feedback submitted!')
                    },
                    onError: (err: Error) => showError(err.message || 'Failed to submit feedback'),
                  }
                )
              }}
              loading={isSubmittingFeedback}
              disabled={!feedbackMessage.trim()}
              className="w-full"
            >
              Submit Feedback
            </Button>
          </>
        )}

        {/* Past submissions */}
        {pastFeedback && pastFeedback.length > 0 && (
          <div className="pt-[var(--space-4)] border-t border-[var(--color-border)]">
            <h4 className="text-sm font-medium text-[var(--color-text)] mb-[var(--space-3)]">Past Submissions</h4>
            <div className="space-y-[var(--space-2)] max-h-48 overflow-y-auto">
              {pastFeedback.map((fb) => (
                <div key={fb.id} className="p-[var(--space-3)] rounded-[var(--radius-md)] bg-[var(--color-surface-hover)] text-sm">
                  <div className="flex items-center gap-[var(--space-2)] mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      fb.type === 'bug'
                        ? 'bg-[var(--color-danger-muted)] text-[var(--color-danger)]'
                        : 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]'
                    }`}>
                      {fb.type === 'bug' ? <Bug className="w-3 h-3" /> : <Lightbulb className="w-3 h-3" />}
                      {fb.type === 'bug' ? 'Bug' : 'Feature'}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[var(--color-text)] line-clamp-2">{fb.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CollapsibleSection>
    </div>
  )
}
