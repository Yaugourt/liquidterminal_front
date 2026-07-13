import type { SearchResult, SearchResultKind } from "./types";

/**
 * Query-side of the global search: exact-pattern detection (address, tx,
 * block) plus scored matching over the loaded index.
 */

/** Group render order in the palette. */
export const KIND_ORDER: SearchResultKind[] = [
  "address",
  "transaction",
  "block",
  "spot-token",
  "perp-market",
  "validator",
  "vault",
  "project",
  "wiki",
  "page",
];

export const KIND_LABELS: Record<SearchResultKind, string> = {
  address: "Addresses",
  transaction: "Transactions",
  block: "Blocks",
  "spot-token": "Spot tokens",
  "perp-market": "Perp markets",
  validator: "Validators",
  vault: "Vaults",
  project: "Projects",
  wiki: "Wiki",
  page: "Pages",
};

const MAX_PER_KIND = 5;

/** An exact on-chain identifier typed in the box beats every fuzzy match. */
export function detectPattern(rawQuery: string): SearchResult | null {
  const q = rawQuery.trim();
  if (/^\d{2,}$/.test(q)) {
    return {
      id: `block-${q}`,
      kind: "block",
      label: `Block #${q}`,
      sublabel: "Open in explorer",
      href: `/explorer/block/${q}`,
    };
  }
  if (/^0x[a-fA-F0-9]{64}$/.test(q)) {
    return {
      id: `tx-${q}`,
      kind: "transaction",
      label: `Transaction ${q.slice(0, 10)}…${q.slice(-6)}`,
      sublabel: "Open in explorer",
      href: `/explorer/transaction/${q}`,
    };
  }
  if (/^0x[a-fA-F0-9]{40}$/.test(q)) {
    return {
      id: `address-${q}`,
      kind: "address",
      label: `Address ${q.slice(0, 8)}…${q.slice(-6)}`,
      sublabel: "Open in explorer",
      href: `/explorer/address/${q}`,
    };
  }
  return null;
}

function scoreOf(result: SearchResult, q: string): number {
  const label = result.label.toLowerCase();
  if (label === q) return 4;
  if (label.startsWith(q)) return 3;
  if (label.includes(` ${q}`) || label.includes(`-${q}`)) return 2;
  if (label.includes(q)) return 1;
  if (result.sublabel?.toLowerCase().includes(q)) return 0.5;
  return 0;
}

export interface SearchGroup {
  kind: SearchResultKind;
  label: string;
  results: SearchResult[];
}

/** Score the index against the query and shape it into capped groups. */
export function searchIndex(index: SearchResult[], rawQuery: string): SearchGroup[] {
  const q = rawQuery.trim().toLowerCase();
  if (q.length < 1) return [];

  const scored = new Map<SearchResultKind, Array<{ result: SearchResult; score: number }>>();
  for (const result of index) {
    const score = scoreOf(result, q);
    if (score <= 0) continue;
    const bucket = scored.get(result.kind) ?? [];
    bucket.push({ result, score });
    scored.set(result.kind, bucket);
  }

  const groups: SearchGroup[] = [];
  for (const kind of KIND_ORDER) {
    const bucket = scored.get(kind);
    if (!bucket?.length) continue;
    bucket.sort((a, b) => b.score - a.score || a.result.label.length - b.result.label.length);
    groups.push({
      kind,
      label: KIND_LABELS[kind],
      results: bucket.slice(0, MAX_PER_KIND).map((entry) => entry.result),
    });
  }
  return groups;
}
