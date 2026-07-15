import { fetchSpotTokens } from "@/services/market/spot/api";
import { fetchPerpMarkets } from "@/services/market/perp/api";
import { fetchAllValidators } from "@/services/explorer/validator/validators";
import { fetchVaults } from "@/services/explorer/vault/api";
import { fetchGlobalAliases } from "@/services/explorer/api";
import { fetchProjects } from "@/services/ecosystem/project/api";
import { fetchAllWikiResources } from "@/services/wiki/api";
import type { SearchResult } from "./types";

/**
 * Global-search index: every corpus the palette can match against.
 * Loaded in parallel on first open, cached in-module for a few minutes;
 * a source that fails just contributes nothing (the palette never breaks).
 */

const INDEX_TTL_MS = 5 * 60 * 1000;

let cachedIndex: SearchResult[] | null = null;
let cachedAt = 0;
let inflight: Promise<SearchResult[]> | null = null;

/** Curated static destinations, always available even if every API is down. */
export const PAGE_RESULTS: SearchResult[] = [
  { id: "page-market", kind: "page", label: "Market overview", sublabel: "/market/spot", href: "/market/spot" },
  { id: "page-spot", kind: "page", label: "Spot markets", sublabel: "/market/spot", href: "/market/spot" },
  { id: "page-perp", kind: "page", label: "Perpetuals", sublabel: "/market/perp", href: "/market/perp" },
  { id: "page-spot-auctions", kind: "page", label: "Spot auctions", sublabel: "/market/spot/auction", href: "/market/spot/auction" },
  { id: "page-perpdex", kind: "page", label: "Perp DEXs (HIP-3)", sublabel: "/market/perpdex", href: "/market/perpdex" },
  { id: "page-builders", kind: "page", label: "Builders", sublabel: "/market/builders", href: "/market/builders" },
  { id: "page-hip4", kind: "page", label: "HIP-4 prediction markets", sublabel: "/market/hip4", href: "/market/hip4" },
  { id: "page-tracker", kind: "page", label: "Wallet tracker", sublabel: "/market/tracker", href: "/market/tracker" },
  { id: "page-explorer", kind: "page", label: "Explorer", sublabel: "/explorer", href: "/explorer" },
  { id: "page-vaults", kind: "page", label: "Vaults", sublabel: "/explorer/vaults", href: "/explorer/vaults" },
  { id: "page-validators", kind: "page", label: "Validators", sublabel: "/explorer/validator", href: "/explorer/validator" },
  { id: "page-liquidations", kind: "page", label: "Liquidations", sublabel: "/explorer/liquidations", href: "/explorer/liquidations" },
  { id: "page-priority-fees", kind: "page", label: "Priority fees", sublabel: "/explorer/priority-fees", href: "/explorer/priority-fees" },
  { id: "page-hype", kind: "page", label: "HYPE", sublabel: "/hype", href: "/hype" },
  { id: "page-ecosystem", kind: "page", label: "Ecosystem projects", sublabel: "/ecosystem/project", href: "/ecosystem/project" },
  { id: "page-publicgoods", kind: "page", label: "Public goods", sublabel: "/ecosystem/publicgoods", href: "/ecosystem/publicgoods" },
  { id: "page-wiki", kind: "page", label: "Wiki", sublabel: "/wiki", href: "/wiki" },
  { id: "page-readlists", kind: "page", label: "Read lists", sublabel: "/wiki/readlists", href: "/wiki/readlists" },
  { id: "page-dashboard", kind: "page", label: "Dashboard", sublabel: "/dashboard", href: "/dashboard" },
];

function truncateAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

async function loadSpotTokens(): Promise<SearchResult[]> {
  const res = await fetchSpotTokens({ limit: 250, sortBy: "volume", sortOrder: "desc" });
  return (res.data ?? []).map((t) => ({
    id: `spot-${t.name}`,
    kind: "spot-token" as const,
    label: t.name,
    sublabel: "Spot token",
    href: `/market/spot/${encodeURIComponent(t.name)}`,
  }));
}

async function loadPerpMarkets(): Promise<SearchResult[]> {
  const res = await fetchPerpMarkets({ limit: 250, sortBy: "volume", sortOrder: "desc" });
  return (res.data ?? []).map((m) => ({
    id: `perp-${m.name}`,
    kind: "perp-market" as const,
    label: m.name,
    sublabel: "Perp market",
    href: `/market/perp/${encodeURIComponent(m.name)}`,
  }));
}

async function loadValidators(): Promise<SearchResult[]> {
  const { validators } = await fetchAllValidators();
  return (validators ?? [])
    .filter((v) => v.name)
    .map((v) => ({
      id: `validator-${v.validator}`,
      kind: "validator" as const,
      label: v.name,
      sublabel: truncateAddress(v.validator),
      href: `/explorer/address/${v.validator}`,
    }));
}

async function loadVaults(): Promise<SearchResult[]> {
  const res = await fetchVaults({ limit: 150, sortBy: "tvl", sortOrder: "desc" });
  return (res.data ?? [])
    .filter((v) => v.summary?.name && v.summary?.vaultAddress)
    .map((v) => ({
      id: `vault-${v.summary.vaultAddress}`,
      kind: "vault" as const,
      label: v.summary.name,
      sublabel: truncateAddress(v.summary.vaultAddress),
      href: `/explorer/vaults/${v.summary.vaultAddress}`,
    }));
}

async function loadAliases(): Promise<SearchResult[]> {
  const aliases = await fetchGlobalAliases();
  return Object.entries(aliases ?? {}).map(([address, name]) => ({
    id: `alias-${address}`,
    kind: "address" as const,
    label: String(name),
    sublabel: truncateAddress(address),
    href: `/explorer/address/${address}`,
  }));
}

async function loadProjects(): Promise<SearchResult[]> {
  // The API rejects limit > 100 with a 500.
  const res = await fetchProjects({ limit: 100 });
  return (res.data ?? []).map((p) => ({
    id: `project-${p.id}`,
    kind: "project" as const,
    label: p.title,
    sublabel: p.desc ? p.desc.slice(0, 80) : "Ecosystem project",
    href: `/ecosystem/project/${p.id}`,
  }));
}

async function loadWikiResources(): Promise<SearchResult[]> {
  const res = await fetchAllWikiResources();
  return (res.data ?? [])
    .filter((r) => r.linkPreview?.title)
    .map((r) => ({
      id: `wiki-${r.id}`,
      kind: "wiki" as const,
      label: r.linkPreview!.title!,
      sublabel: r.linkPreview?.siteName ?? "Wiki resource",
      href: r.url,
      external: true,
    }));
}

/** Load (or reuse) the whole index. Failures degrade per-source. */
export async function loadSearchIndex(): Promise<SearchResult[]> {
  const now = Date.now();
  if (cachedIndex && now - cachedAt < INDEX_TTL_MS) return cachedIndex;
  if (inflight) return inflight;

  inflight = (async () => {
    // A slow source must never hold the palette hostage.
    const withTimeout = (p: Promise<SearchResult[]>): Promise<SearchResult[]> =>
      Promise.race([
        p,
        new Promise<SearchResult[]>((_, reject) => setTimeout(() => reject(new Error("search source timeout")), 8000)),
      ]);
    const settled = await Promise.allSettled([
      withTimeout(loadSpotTokens()),
      withTimeout(loadPerpMarkets()),
      withTimeout(loadValidators()),
      withTimeout(loadVaults()),
      withTimeout(loadAliases()),
      withTimeout(loadProjects()),
      withTimeout(loadWikiResources()),
    ]);
    const dynamic = settled.flatMap((s) => (s.status === "fulfilled" ? s.value : []));
    // Some APIs return the same name on several rows: keep the first only.
    const seen = new Set<string>();
    cachedIndex = [...PAGE_RESULTS, ...dynamic].filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
    cachedAt = Date.now();
    inflight = null;
    return cachedIndex;
  })();

  return inflight;
}
