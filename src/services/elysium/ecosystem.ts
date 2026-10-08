import { useDataFetching } from "@/hooks/useDataFetching";
import type { EcoSnapshot } from "@/lib/elysium-eco";

export type { EcoSnapshot, EcoProject, EcoToken, EcoProjectStatus } from "@/lib/elysium-eco";
export { ELYSIUM_ECO_URL } from "@/lib/elysium-eco";

/** Same-origin route: the directory is parsed server-side and cached 5 minutes. */
export async function fetchElysiumEcosystem(signal?: AbortSignal): Promise<EcoSnapshot> {
  const res = await fetch("/api/elysium-eco", { signal });
  if (!res.ok) throw Object.assign(new Error(`elysium ecosystem ${res.status}`), { status: res.status });
  const json = (await res.json()) as { data: EcoSnapshot };
  return json.data;
}

export function useElysiumEcosystem() {
  return useDataFetching<EcoSnapshot>({
    fetchFn: fetchElysiumEcosystem,
    refreshInterval: 300_000,
    maxRetries: 2,
  });
}
