import { useCallback } from 'react'
import { useToast } from '@/hooks/useToast'

interface ShareData {
  title: string
  text: string
}

export function useShare() {
  const toast = useToast()

  const share = useCallback(
    async (data: ShareData) => {
      if (navigator.share) {
        try {
          await navigator.share(data)
        } catch (err) {
          // User cancelled — not an error
          if (err instanceof Error && err.name === 'AbortError') return
        }
      } else {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(data.text)
          toast.success('Copied to clipboard')
        } catch {
          toast.error('Unable to share')
        }
      }
    },
    [toast]
  )

  return { share }
}
