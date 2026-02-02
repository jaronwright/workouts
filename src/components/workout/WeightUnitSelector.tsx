import { useSettingsStore, type WeightUnit } from '@/stores/settingsStore'

export function WeightUnitSelector() {
  const weightUnit = useSettingsStore((s) => s.weightUnit)
  const setWeightUnit = useSettingsStore((s) => s.setWeightUnit)

  return (
    <select
      value={weightUnit}
      onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
      className="
        px-2 py-1.5
        text-xs font-semibold
        rounded-[var(--radius-md)]
        bg-[var(--color-surface-hover)]
        border border-[var(--color-border)]
        text-[var(--color-text)]
        focus:outline-none focus:border-[var(--color-primary)]
        cursor-pointer
      "
    >
      <option value="lbs">lbs</option>
      <option value="kg">kg</option>
    </select>
  )
}
