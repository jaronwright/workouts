import { useEffect } from 'react'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { getCurrentCycleDay, detectUserTimezone } from '@/utils/cycleDay'

export function useCycleDay(): number {
  const { data: profile } = useProfile()
  const { mutate: updateProfile } = useUpdateProfile()

  // Auto-detect and save timezone if not set
  useEffect(() => {
    if (profile && !profile.timezone) {
      updateProfile({ timezone: detectUserTimezone() })
    }
  }, [profile, updateProfile])

  if (!profile?.cycle_start_date) return 1
  const tz = profile.timezone || detectUserTimezone()
  return getCurrentCycleDay(profile.cycle_start_date, tz)
}
