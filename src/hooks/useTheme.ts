import { useThemeStore } from '@/stores/themeStore'

export function useTheme() {
  const { theme, resolvedTheme, setTheme, initializeTheme } = useThemeStore()

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
