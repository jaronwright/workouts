import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import type { Toast as ToastType } from '@/stores/toastStore'

interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const styles = {
  success: {
    bg: 'bg-green-500/10 border-green-500/20',
    icon: 'text-green-500',
    text: 'text-green-500'
  },
  error: {
    bg: 'bg-[var(--color-danger)]/10 border-[var(--color-danger)]/20',
    icon: 'text-[var(--color-danger)]',
    text: 'text-[var(--color-danger)]'
  },
  warning: {
    bg: 'bg-amber-500/10 border-amber-500/20',
    icon: 'text-amber-500',
    text: 'text-amber-500'
  },
  info: {
    bg: 'bg-blue-500/10 border-blue-500/20',
    icon: 'text-blue-500',
    text: 'text-blue-500'
  }
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const Icon = icons[toast.type]
  const style = styles[toast.type]

  useEffect(() => {
    // Trigger enter animation
    const enterTimeout = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(enterTimeout)
  }, [])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => onDismiss(toast.id), 200)
  }

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3
        rounded-[var(--radius-lg)] border
        shadow-lg backdrop-blur-sm
        transition-all duration-200
        ${style.bg}
        ${isVisible && !isExiting ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${style.icon}`} />
      <p className={`flex-1 text-sm font-medium ${style.text}`}>
        {toast.message}
      </p>
      <button
        onClick={handleDismiss}
        className={`
          p-1 rounded-full
          transition-colors
          hover:bg-[var(--color-surface-hover)]
          ${style.icon}
        `}
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
