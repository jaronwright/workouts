import { useEffect } from 'react'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { getCurrentCycleDay, detectUserTimezone } from '@/utils/cycleDay'

export function useCycleDay(): number {
  const { data: profile } = useProfile()
  const { mutate: updateProfile } = useUpdateProfile()

  // Auto-detect and save timezone if not set
  const hasProfile = !!profile
  const hasTimezone = !!profile?.timezone
  useEffect(() => {
    if (hasProfile && !hasTimezone) {
      updateProfile({ timezone: detectUserTimezone() })
    }
  }, [hasProfile, hasTimezone, updateProfile])

  if (!profile?.cycle_start_date) return 1
  const tz = profile.timezone || detectUserTimezone()
  return getCurrentCycleDay(profile.cycle_start_date, tz)
}
