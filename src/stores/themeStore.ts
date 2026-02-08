import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  setThemeFromProfile: (theme: string | null) => void
  initializeTheme: () => void
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

function isValidTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

let themeListenerAttached = false

/** Reset listener guard — for testing only */
export function _resetThemeListenerForTesting(): void {
  themeListenerAttached = false
}

export const useThemeStore = create<ThemeState>()(
  (set, get) => ({
    theme: 'dark',
    resolvedTheme: 'dark',

    setTheme: (theme) => {
      const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
      applyTheme(resolvedTheme)
      set({ theme, resolvedTheme })
    },

    setThemeFromProfile: (profileTheme) => {
      const theme: Theme = isValidTheme(profileTheme) ? profileTheme : 'dark'
      const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
      applyTheme(resolvedTheme)
      set({ theme, resolvedTheme })
    },

    initializeTheme: () => {
      const { theme } = get()
      const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
      applyTheme(resolvedTheme)
      set({ resolvedTheme })

      // Listen for system theme changes (only attach once)
      if (typeof window !== 'undefined' && !themeListenerAttached) {
        themeListenerAttached = true
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = () => {
          const currentTheme = get().theme
          if (currentTheme === 'system') {
            const newResolvedTheme = getSystemTheme()
            applyTheme(newResolvedTheme)
            set({ resolvedTheme: newResolvedTheme })
          }
        }
        mediaQuery.addEventListener('change', handleChange)
      }
    }
  })
)
