import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, MessageSquare, ThumbsUp, Target } from 'lucide-react'
import { springs } from '@/config/animationConfig'

interface ReflectionFormProps {
  reflection: string
  highlights: string
  improvements: string
  onReflectionChange: (value: string) => void
  onHighlightsChange: (value: string) => void
  onImprovementsChange: (value: string) => void
}

interface SectionProps {
  title: string
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
  placeholder: string
  maxLength?: number
  defaultOpen?: boolean
}

function CollapsibleSection({
  title,
  icon,
  value,
  onChange,
  placeholder,
  maxLength = 500,
  defaultOpen = false,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors"
      >
        <span className="text-[var(--color-text-muted)]">{icon}</span>
        <span className="text-sm font-medium text-[var(--color-text)] flex-1 text-left">
          {title}
        </span>
        {value.length > 0 && (
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {value.length}/{maxLength}
          </span>
        )}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={springs.default}
        >
          <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springs.default}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
                placeholder={placeholder}
                rows={3}
                className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {value.length}/{maxLength}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ReflectionForm({
  reflection,
  highlights,
  improvements,
  onReflectionChange,
  onHighlightsChange,
  onImprovementsChange,
}: ReflectionFormProps) {
  return (
    <div className="flex flex-col gap-3">
      <CollapsibleSection
        title="Reflection"
        icon={<MessageSquare className="w-4 h-4" />}
        value={reflection}
        onChange={onReflectionChange}
        placeholder="How did the workout go overall? Any thoughts..."
        defaultOpen
      />
      <CollapsibleSection
        title="What went well"
        icon={<ThumbsUp className="w-4 h-4" />}
        value={highlights}
        onChange={onHighlightsChange}
        placeholder="Highlight the best parts of your session..."
      />
      <CollapsibleSection
        title="What to improve"
        icon={<Target className="w-4 h-4" />}
        value={improvements}
        onChange={onImprovementsChange}
        placeholder="What would you do differently next time..."
      />
    </div>
  )
}
