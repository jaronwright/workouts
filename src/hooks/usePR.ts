import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  getPersonalRecord,
  getAllPersonalRecords,
  checkAndUpdatePR,
  getRecentPRs,
  type PersonalRecord,
  type PRCheckResult
} from '@/services/prService'

export function usePersonalRecord(exerciseId: string | undefined) {
  const user = useAuthStore((s) => s.user)

  return useQuery<PersonalRecord | null>({
    queryKey: ['personal-record', user?.id, exerciseId],
    queryFn: () => getPersonalRecord(user!.id, exerciseId!),
    enabled: !!user?.id && !!exerciseId
  })
}

export function useAllPersonalRecords() {
  const user = useAuthStore((s) => s.user)

  return useQuery<PersonalRecord[]>({
    queryKey: ['all-personal-records', user?.id],
    queryFn: () => getAllPersonalRecords(user!.id),
    enabled: !!user?.id
  })
}

export function useRecentPRs(limit = 5) {
  const user = useAuthStore((s) => s.user)

  return useQuery<Array<PersonalRecord & { exercise_name?: string }>>({
    queryKey: ['recent-prs', user?.id, limit],
    queryFn: () => getRecentPRs(user!.id, limit),
    enabled: !!user?.id
  })
}

export function useCheckPR() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation<PRCheckResult, Error, { exerciseId: string; exerciseName: string; weight: number; reps?: number }>({
    mutationFn: ({ exerciseId, exerciseName, weight, reps }) =>
      checkAndUpdatePR(user!.id, exerciseId, exerciseName, weight, reps),
    onSuccess: (result) => {
      if (result.isNewPR) {
        queryClient.invalidateQueries({ queryKey: ['personal-record'] })
        queryClient.invalidateQueries({ queryKey: ['all-personal-records'] })
        queryClient.invalidateQueries({ queryKey: ['recent-prs'] })
      }
    }
  })
}
