import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchUsersLeaderboard, type LeaderboardEntry, type LeaderboardSortBy } from "../api";

export function useUsersLeaderboard(params?: {
  by?: LeaderboardSortBy;
  hours?: number;
  limit?: number;
}) {
  const { by, hours, limit } = params ?? {};
  const { data, isLoading, error, refetch } = useDataFetching<LeaderboardEntry[]>({
    fetchFn: () => fetchUsersLeaderboard({ by, hours, limit }),
    dependencies: [by, hours, limit],
    refreshInterval: 60_000,
    maxRetries: 3,
  });
  return { data: data ?? [], isLoading, error, refetch };
}
