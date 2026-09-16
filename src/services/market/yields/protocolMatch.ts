import type { YieldFacet } from './types';

/**
 * Hyperfolio protocol ids that do not derive from the project's name.
 * Keys are normalised project titles / DefiLlama slugs, values Hyperfolio ids.
 */
const OVERRIDES: Record<string, string> = {
  kittenswap: 'kittenswap-v3',
  kittenswapfinance: 'kittenswap-v3',
  hypurrfi: 'hypurrfi',
  felixprotocol: 'felix',
  hyperbeat: 'hyperbeat',
};

const MIN_MATCH_LENGTH = 4;

/** Lowercase alphanumerics only, so "Kittenswap V3", "kittenswap-v3" and "KittenSwap" collide. */
export const normalizeProtocolKey = (value: string | null | undefined): string =>
  (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Resolve a LiquidTerminal project (title + DefiLlama slug) to a Hyperfolio
 * protocol id present in the yield facets. Prefix matching in both directions
 * covers versioned ids (`kittenswap-v3`) and suffixed titles (`Felix Protocol`).
 * Returns null when nothing matches — the caller then renders nothing.
 */
export function matchHyperfolioProtocol(
  candidates: { title?: string | null; defillamaSlug?: string | null },
  facets: YieldFacet[]
): YieldFacet | null {
  if (facets.length === 0) return null;
  const keys = [normalizeProtocolKey(candidates.title), normalizeProtocolKey(candidates.defillamaSlug)].filter(
    (k) => k.length >= MIN_MATCH_LENGTH
  );
  if (keys.length === 0) return null;

  const byId = new Map(facets.map((f) => [normalizeProtocolKey(f.value), f]));

  for (const key of keys) {
    const override = OVERRIDES[key];
    if (override && byId.has(normalizeProtocolKey(override))) return byId.get(normalizeProtocolKey(override))!;
    const exact = byId.get(key);
    if (exact) return exact;
  }

  for (const key of keys) {
    for (const facet of facets) {
      const id = normalizeProtocolKey(facet.value);
      const label = normalizeProtocolKey(facet.label);
      const hit = [id, label].some(
        (k) => k.length >= MIN_MATCH_LENGTH && (k.startsWith(key) || key.startsWith(k))
      );
      if (hit) return facet;
    }
  }
  return null;
}
