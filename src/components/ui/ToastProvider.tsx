import { useToastStore } from '@/stores/toastStore'
import { Toast } from './Toast'

export function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  if (toasts.length === 0) {
    return null
  }

  return (
    <div
      className="
        fixed bottom-20 right-4 z-50
        flex flex-col gap-2
        w-full max-w-sm
        pointer-events-none
      "
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  )
}
