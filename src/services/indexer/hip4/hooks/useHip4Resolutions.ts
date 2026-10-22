import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchHip4Resolutions } from "../api";
import type { Hip4Resolutions, UseHip4ResolutionsResult } from "../types";

const NONE: Hip4Resolutions["coins"] = {};

/** How the markets that no longer trade ended. The backend recomputes it at
 * most hourly, so a slow poll is enough. */
export function useHip4Resolutions(): UseHip4ResolutionsResult {
  const { data, isLoading, error } = useDataFetching<Hip4Resolutions>({
    fetchFn: fetchHip4Resolutions,
    refreshInterval: 600000,
    maxRetries: 3,
  });

  return {
    coins: data?.coins ?? NONE,
    isLoading,
    error,
  };
}
