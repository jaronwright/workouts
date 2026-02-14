import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Light', Icon: Sun },
  { value: 'dark' as const, label: 'Dark', Icon: Moon },
  { value: 'system' as const, label: 'System', Icon: Monitor },
]

export function ThemePicker() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="grid grid-cols-3 gap-2">
      {THEME_OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={`
            flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
            ${theme === value
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
              : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
            }
          `}
        >
          <Icon className={`w-6 h-6 ${theme === value ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
          <span className={`text-sm font-medium ${theme === value ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}
