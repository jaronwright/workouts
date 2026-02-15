import { useQuery } from '@tanstack/react-query'
import { getLeaderboard, type LeaderboardMetric } from '@/services/leaderboardService'

export function useLeaderboard(metric: LeaderboardMetric, limit = 10) {
  return useQuery({
    queryKey: ['leaderboard', metric, limit],
    queryFn: () => getLeaderboard(metric, limit),
    staleTime: 2 * 60 * 1000,
  })
}
