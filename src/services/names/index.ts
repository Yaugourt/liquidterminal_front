import { useEffect, useState } from "react";
import { create } from "zustand";
import { get, post } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import { useDataFetching } from "@/hooks/useDataFetching";

/**
 * Hyperliquid Names (.hl) on the site. Components ask for the name of the
 * addresses they render; requests made within FLUSH_MS are merged into one
 * backend call (which caches upstream), and answers are kept for the visit.
 */

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
export const HL_NAME_RE = /^[^\s/?#.]+(\.[^\s/?#.]+)*\.hl$/i;
const FLUSH_MS = 40;
const MAX_BATCH = 500;

interface NamesState {
  /** address (lowercase) → name, null = no name. Missing = not asked yet. */
  names: Record<string, string | null>;
  merge: (entries: Record<string, string | null>) => void;
}

export const useHlNameStore = create<NamesState>((set) => ({
  names: {},
  merge: (entries) => set((s) => ({ names: { ...s.names, ...entries } })),
}));

const queued = new Set<string>();
const inFlight = new Set<string>();
let timer: ReturnType<typeof setTimeout> | null = null;

async function flush() {
  timer = null;
  const batch = [...queued].slice(0, MAX_BATCH);
  batch.forEach((a) => {
    queued.delete(a);
    inFlight.add(a);
  });
  if (queued.size) timer = setTimeout(flush, FLUSH_MS);
  try {
    const res = await post<{ success: boolean; data: Record<string, string | null> }>("/names/primary", { addresses: batch }, { useCache: false });
    useHlNameStore.getState().merge(res.data ?? {});
  } catch {
    // Name service down: addresses stay as they are; asked again next visit.
  } finally {
    batch.forEach((a) => inFlight.delete(a));
  }
}

/** Ask for the names of these addresses (deduplicated, batched). */
export function requestHlNames(addresses: (string | null | undefined)[]) {
  const known = useHlNameStore.getState().names;
  for (const raw of addresses) {
    if (!raw || !ADDRESS_RE.test(raw)) continue;
    const a = raw.toLowerCase();
    if (a in known || queued.has(a) || inFlight.has(a)) continue;
    queued.add(a);
  }
  if (queued.size && !timer) timer = setTimeout(flush, FLUSH_MS);
}

/** The .hl name of one address (null while unknown or when it has none). */
export function useHlName(address: string | null | undefined): string | null {
  const key = address?.toLowerCase() ?? "";
  const name = useHlNameStore((s) => (key ? s.names[key] ?? null : null));
  useEffect(() => {
    if (key) requestHlNames([key]);
  }, [key]);
  return name;
}

/** Names for a list of addresses, as a map (lowercase keys). */
export function useHlNames(addresses: (string | null | undefined)[]): Record<string, string | null> {
  const key = addresses.filter(Boolean).map((a) => a!.toLowerCase()).sort().join(",");
  const names = useHlNameStore((s) => s.names);
  useEffect(() => {
    if (key) requestHlNames(key.split(","));
  }, [key]);
  return names;
}

export interface HlProfile {
  address: string;
  name: string | null;
  avatar: string | null;
  records: Record<string, string>;
}

/** Name, avatar and public links of an address (wallet headers). */
export const fetchHlProfile = (address: string) =>
  withErrorHandling(async () => {
    const res = await get<{ success: boolean; data: HlProfile }>(`/names/profile/${address}`, undefined, { useCache: true });
    return res.data;
  }, "fetching .hl profile");

export function useHlProfile(address: string | null | undefined) {
  const valid = !!address && ADDRESS_RE.test(address);
  return useDataFetching<HlProfile | null>({
    fetchFn: () => (valid ? fetchHlProfile(address!) : Promise.resolve(null)),
    refreshInterval: 0,
    maxRetries: 1,
    dependencies: [address],
  });
}

/** Address a .hl name points to (null if unregistered). */
export const resolveHlName = (name: string) =>
  withErrorHandling(async () => {
    const res = await get<{ success: boolean; data: { name: string; address: string | null } }>(
      `/names/resolve/${encodeURIComponent(name.toLowerCase())}`,
      undefined,
      { useCache: true }
    );
    return res.data.address;
  }, "resolving .hl name");

/** Debounced forward resolution for a search box value. */
export function useResolveHlName(value: string): { address: string | null; loading: boolean } {
  const [state, setState] = useState<{ address: string | null; loading: boolean }>({ address: null, loading: false });
  useEffect(() => {
    const v = value.trim();
    if (!HL_NAME_RE.test(v)) {
      setState({ address: null, loading: false });
      return;
    }
    setState({ address: null, loading: true });
    let cancelled = false;
    const t = setTimeout(() => {
      resolveHlName(v)
        .then((address) => !cancelled && setState({ address, loading: false }))
        .catch(() => !cancelled && setState({ address: null, loading: false }));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [value]);
  return state;
}
