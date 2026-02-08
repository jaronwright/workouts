import { useEffect, useRef } from 'react'
import { useThemeStore, type Theme } from '@/stores/themeStore'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'

export function useTheme() {
  const { theme, resolvedTheme, setTheme: storeSetTheme, setThemeFromProfile, initializeTheme } = useThemeStore()
  const { data: profile } = useProfile()
  const { mutate: updateProfile } = useUpdateProfile()
  const profileLoadedRef = useRef(false)

  // Load theme from profile when profile data becomes available
  useEffect(() => {
    if (profile && !profileLoadedRef.current) {
      profileLoadedRef.current = true
      setThemeFromProfile(profile.theme)
    }
  }, [profile, setThemeFromProfile])

  // Reset the ref when profile is cleared (logout)
  useEffect(() => {
    if (!profile) {
      profileLoadedRef.current = false
    }
  }, [profile])

  // Wrapper that saves to both store and profile
  const setTheme = (newTheme: Theme) => {
    storeSetTheme(newTheme)
    updateProfile({ theme: newTheme })
  }

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const isDark = resolvedTheme === 'dark'

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark,
    initializeTheme
  }
}
