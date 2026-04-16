/**
 * Deterministic mock datasets for the chart design showcase (/labs/charts).
 *
 * These are NOT fetched from the API. They are shaped to look like realistic
 * HyperLiquid data so the visual design can be evaluated in isolation.
 */

const ONE_DAY = 24 * 60 * 60 * 1000;

/** Simple seeded PRNG so the preview is stable across reloads. */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Chart 1: candles + volume ────────────────────────────────────────────
export interface CandlePoint {
  time: number; // ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function buildCandles(count = 90, startPrice = 36): CandlePoint[] {
  const rng = mulberry32(12345);
  const now = Date.now();
  const out: CandlePoint[] = [];
  let price = startPrice;

  for (let i = count - 1; i >= 0; i--) {
    const drift = (rng() - 0.48) * 1.4;
    const open = price;
    const close = Math.max(8, open + drift);
    const range = Math.abs(close - open) + rng() * 1.2 + 0.3;
    const high = Math.max(open, close) + rng() * range;
    const low = Math.min(open, close) - rng() * range;
    const volume = 400_000 + rng() * 2_400_000 + Math.abs(drift) * 600_000;
    out.push({
      time: now - i * 6 * 60 * 60 * 1000, // 6h candles
      open,
      high,
      low,
      close,
      volume,
    });
    price = close;
  }
  return out;
}

// ── Chart 2: multi-series TVL ────────────────────────────────────────────
export interface AuroraPoint {
  time: number;
  spotTvl: number;
  perpOi: number;
  staked: number;
}

export function buildAuroraSeries(days = 120): AuroraPoint[] {
  const rng = mulberry32(99);
  const now = Date.now();
  const out: AuroraPoint[] = [];
  let spot = 1_850_000_000;
  let perp = 3_200_000_000;
  let staked = 640_000_000;
  for (let i = days - 1; i >= 0; i--) {
    spot += (rng() - 0.45) * 28_000_000;
    perp += (rng() - 0.42) * 55_000_000;
    staked += (rng() - 0.35) * 12_000_000;
    out.push({
      time: now - i * ONE_DAY,
      spotTvl: Math.max(1_000_000_000, spot),
      perpOi: Math.max(1_500_000_000, perp),
      staked: Math.max(400_000_000, staked),
    });
  }
  return out;
}

// ── Chart 3: liquidation buckets ─────────────────────────────────────────
export interface LiquidationBucket {
  price: number; // center price of the bucket
  longs: number; // USD of long liqs at that level
  shorts: number; // USD of short liqs at that level
}

export function buildLiquidations(): LiquidationBucket[] {
  const rng = mulberry32(7);
  const buckets: LiquidationBucket[] = [];
  const lastPrice = 3847;
  for (let i = -12; i <= 12; i++) {
    const price = lastPrice + i * 120;
    // long liqs cluster below the price, shorts above
    const distance = i;
    const longs =
      distance <= 0
        ? Math.max(0, (1 - Math.abs(distance) / 14)) *
          (6_000_000 + rng() * 22_000_000) *
          (distance === -3 ? 2.1 : 1)
        : rng() * 500_000;
    const shorts =
      distance >= 0
        ? Math.max(0, (1 - Math.abs(distance) / 14)) *
          (5_000_000 + rng() * 20_000_000) *
          (distance === 4 ? 1.8 : 1)
        : rng() * 500_000;
    buckets.push({ price, longs, shorts });
  }
  return buckets;
}

// ── Chart 4: portfolio composition ───────────────────────────────────────
export interface Allocation {
  symbol: string;
  name: string;
  value: number; // USD
  change24h: number; // percent
  color: string;
}

export const PORTFOLIO: Allocation[] = [
  { symbol: "HYPE", name: "Hyperliquid", value: 428_500, change24h: 4.82, color: "#83E9FF" },
  { symbol: "ETH", name: "Ether", value: 312_400, change24h: 1.94, color: "#f9e370" },
  { symbol: "BTC", name: "Bitcoin", value: 284_700, change24h: -0.65, color: "#a78bfa" },
  { symbol: "USDC", name: "USD Coin", value: 168_900, change24h: 0.01, color: "#34d399" },
  { symbol: "SOL", name: "Solana", value: 94_200, change24h: 6.41, color: "#f472b6" },
  { symbol: "OTHER", name: "12 assets", value: 64_180, change24h: -1.12, color: "#64748b" },
];
