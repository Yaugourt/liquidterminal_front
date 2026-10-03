import { useDataFetching } from "@/hooks/useDataFetching";
import type { ReserveYieldSnapshot } from "@/lib/reserve-yield";

export type {
  ReserveYieldSnapshot,
  ReserveYieldInterval,
  ReserveYieldFlow,
} from "@/lib/reserve-yield";

/** Same-origin route: the snapshot needs ~60 historical RPC reads, done once server-side. */
export async function fetchReserveYield(signal?: AbortSignal): Promise<ReserveYieldSnapshot> {
  const res = await fetch("/api/reserve-yield", { signal });
  if (!res.ok) throw Object.assign(new Error(`reserve yield ${res.status}`), { status: res.status });
  const json = (await res.json()) as { data: ReserveYieldSnapshot };
  return json.data;
}

export function useReserveYield() {
  return useDataFetching<ReserveYieldSnapshot>({
    fetchFn: fetchReserveYield,
    refreshInterval: 5 * 60_000,
    maxRetries: 2,
  });
}
