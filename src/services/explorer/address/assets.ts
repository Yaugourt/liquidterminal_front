import { postExternal } from '../../api/axios-config';
import { API_URLS } from '../../api/constants';

/**
 * Resolves HyperCore asset ids and coin strings to readable markets, with the
 * current mid price and validator names, for the activity decoder.
 *
 * Asset ids (Hyperliquid docs, "Asset IDs"):
 *   perps            index in `meta.universe`
 *   spot             10000 + index in `spotMeta.universe`
 *   builder perps    100000 + dex index * 10000 + index in that dex's meta
 * Coin strings in fills and TWAPs: "BTC", "@107" (spot pair 107), "PURR/USDC",
 * "xyz:SKHX" (HIP-3).
 */

export type MarketKind = 'perp' | 'spot' | 'hip3';

export interface ResolvedAsset {
  /** Coin string as Hyperliquid writes it ("@107", "xyz:SKHX"). */
  coin: string;
  /** What a reader expects: "HYPE", "SKHX". */
  label: string;
  market: MarketKind;
  /** HIP-3 dex name ("xyz") or undefined. */
  dex?: string;
  /** Mid price at load time, 0 when unknown. */
  mid: number;
}

export interface AssetResolver {
  byId(id: number): ResolvedAsset | null;
  byCoin(coin: string): ResolvedAsset;
  /** "HYPE:0x0d01…" or "HYPE" → token label and its USD mid when it has a USDC pair. */
  token(token: string): { label: string; mid: number };
  validatorName(address: string): string | null;
}

interface PerpMeta {
  universe: { name: string }[];
}
interface SpotMeta {
  universe: { name: string; tokens: [number, number]; index: number }[];
  tokens: { name: string; index: number }[];
}

const info = <T>(body: unknown) => postExternal<T>(`${API_URLS.HYPERLIQUID_API}/info`, body);

async function build(): Promise<AssetResolver> {
  const [perpMetas, spot, mids, validators] = await Promise.all([
    info<(PerpMeta | null)[]>({ type: 'allPerpMetas' }).catch(() => [] as (PerpMeta | null)[]),
    info<SpotMeta>({ type: 'spotMeta' }).catch(() => ({ universe: [], tokens: [] }) as SpotMeta),
    info<Record<string, string>>({ type: 'allMids' }).catch(() => ({}) as Record<string, string>),
    info<{ validator: string; name: string }[]>({ type: 'validatorSummaries' }).catch(() => []),
  ]);

  const dexNames = perpMetas.map((m) => (m?.universe?.[0]?.name.includes(':') ? m.universe[0].name.split(':')[0] : ''));
  const hip3Mids = new Map<string, number>();
  await Promise.all(
    dexNames.filter(Boolean).map(async (dex) => {
      const m = await info<Record<string, string>>({ type: 'allMids', dex }).catch(() => ({}) as Record<string, string>);
      for (const [k, v] of Object.entries(m)) hip3Mids.set(k, Number(v));
    })
  );
  const mid = (coin: string) => Number(mids[coin] ?? hip3Mids.get(coin) ?? 0) || 0;

  const tokenName = new Map(spot.tokens.map((t) => [t.index, t.name]));
  const spotPairs = new Map(spot.universe.map((u) => [u.index, u]));
  const spotLabel = (index: number) => {
    const u = spotPairs.get(index);
    if (!u) return `@${index}`;
    const base = tokenName.get(u.tokens[0]) ?? u.name;
    return base === 'USDT_USDC' ? 'USDT0' : base;
  };
  // USD mid of a spot token through its USDC pair (quote token index 0).
  const tokenMid = new Map<string, number>();
  for (const u of spot.universe) {
    if (u.tokens[1] !== 0) continue;
    const name = tokenName.get(u.tokens[0]);
    const m = mid(u.name.startsWith('@') ? u.name : `@${u.index}`) || mid(u.name);
    if (name && m) tokenMid.set(name, m);
  }
  tokenMid.set('USDC', 1);

  const validatorNames = new Map(validators.map((v) => [v.validator.toLowerCase(), v.name]));

  const byCoin = (coin: string): ResolvedAsset => {
    if (coin.includes(':')) {
      const [dex, label] = coin.split(':');
      return { coin, label, market: 'hip3', dex, mid: mid(coin) };
    }
    if (coin.startsWith('@')) return { coin, label: spotLabel(Number(coin.slice(1))), market: 'spot', mid: mid(coin) };
    if (coin.includes('/')) return { coin, label: coin.split('/')[0], market: 'spot', mid: mid(coin) };
    return { coin, label: coin, market: 'perp', mid: mid(coin) };
  };

  return {
    byId(id) {
      if (id >= 100_000) {
        const dex = Math.floor((id - 100_000) / 10_000);
        const local = (id - 100_000) % 10_000;
        const name = perpMetas[dex]?.universe?.[local]?.name;
        return name ? byCoin(name) : null;
      }
      if (id >= 10_000) return byCoin(`@${id - 10_000}`);
      const name = perpMetas[0]?.universe?.[id]?.name;
      return name ? byCoin(name) : null;
    },
    byCoin,
    token(token) {
      const label = token.split(':')[0];
      const shown = label === 'USDT_USDC' ? 'USDT0' : label;
      return { label: shown, mid: tokenMid.get(label) ?? 0 };
    },
    validatorName: (address) => validatorNames.get(address.toLowerCase()) ?? null,
  };
}

let cached: { at: number; value: Promise<AssetResolver> } | null = null;

/** Shared for 5 minutes: market lists change rarely, mids are only used for estimates. */
export function loadAssetResolver(): Promise<AssetResolver> {
  if (cached && Date.now() - cached.at < 300_000) return cached.value;
  const value = build();
  cached = { at: Date.now(), value };
  value.catch(() => {
    if (cached?.value === value) cached = null;
  });
  return value;
}
