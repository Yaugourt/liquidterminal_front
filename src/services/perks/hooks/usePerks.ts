import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchMemberPerks, fetchPublicPerks } from "../api";
import type { Perk } from "../types";

/** Partner offers: in full when signed in, members offers locked otherwise. */
export function usePerks(authenticated: boolean) {
  const { data, isLoading, error, refetch } = useDataFetching<Perk[]>({
    fetchFn: () => (authenticated ? fetchMemberPerks() : fetchPublicPerks()),
    refreshInterval: 0,
    dependencies: [authenticated],
    maxRetries: 2,
  });
  return { perks: data ?? [], isLoading, error: error?.message ?? null, refetch };
}
