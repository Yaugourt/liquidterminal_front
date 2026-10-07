import { compactUsd } from "@/lib/formatters/numberFormatting";

/**
 * One factual sentence per market page, built on the server from the public
 * Hyperliquid info API (cached 5 min). Entity pages render their numbers on
 * the client, so the HTML a crawler receives had a heading and nothing else:
 * this gives it the same live facts the page shows. Fail-soft: null on any
 * API problem, and the page renders as before.
 */

const INFO_URL = "https://api.hyperliquid.xyz/info";
const REVALIDATE_S = 300;

async function info<T>(body: object): Promise<T | null> {
  try {
    const res = await fetch(INFO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      next: { revalidate: REVALIDATE_S },
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

const usd = (v: number) => compactUsd(v, { fallback: "-" });
const price = (v: number) =>
  `$${v.toLocaleString("en-US", { maximumSignificantDigits: v >= 1 ? 6 : 4, maximumFractionDigits: v >= 1 ? 2 : 8 })}`;
const change = (now: number, prev: number) => {
  if (!prev) return null;
  const pct = ((now - prev) / prev) * 100;
  return `${pct >= 0 ? "up" : "down"} ${Math.abs(pct).toFixed(1)}% over 24 hours`;
};
const asOf = () => `Data as of ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC.`;

interface SpotMeta {
  tokens: { name: string; index: number }[];
  universe: { name: string; index: number; tokens: [number, number] }[];
}
interface SpotCtx { markPx: string; prevDayPx: string; dayNtlVlm: string }

/** Spot token: price and 24h change of its main pair (USDC first, else the most traded), volume across pairs. */
export async function spotFacts(token: string): Promise<string | null> {
  const data = await info<[SpotMeta, SpotCtx[]]>({ type: "spotMetaAndAssetCtxs" });
  if (!data) return null;
  const [meta, ctxs] = data;
  const t = meta.tokens.find((x) => x.name.toUpperCase() === token.toUpperCase());
  if (!t) return null;
  const pairs = meta.universe
    .filter((u) => u.tokens[0] === t.index && ctxs[u.index])
    .map((u) => ({ u, c: ctxs[u.index] }));
  if (!pairs.length) return null;
  const main = pairs.find((p) => p.u.tokens[1] === 0) ?? pairs.sort((a, b) => Number(b.c.dayNtlVlm) - Number(a.c.dayNtlVlm))[0];
  const quote = meta.tokens.find((x) => x.index === main.u.tokens[1])?.name ?? "USDC";
  const px = Number(main.c.markPx);
  const prev = Number(main.c.prevDayPx);
  const vol = pairs.reduce((s, p) => s + Number(p.c.dayNtlVlm), 0);
  if (!Number.isFinite(px) || px <= 0) return null;
  const parts = [
    `${t.name} trades at ${price(px)} on the Hyperliquid spot market (${t.name}/${quote})`,
    change(px, prev),
  ].filter(Boolean);
  // No supply or market cap: bridged tokens (Unit assets, USDT0) report a
  // nominal HyperCore supply, which would publish a false market cap.
  return `${parts.join(", ")}, with ${usd(vol)} traded in the last 24 hours across ${pairs.length} pair${pairs.length > 1 ? "s" : ""}. ${asOf()}`;
}

interface PerpMeta { universe: { name: string; maxLeverage: number; isDelisted?: boolean }[] }
interface PerpCtx { markPx: string; prevDayPx: string; dayNtlVlm: string; funding: string; openInterest: string }

/** Perpetual: mark price, change, funding (hourly and annualized), open interest, volume. `dex:COIN` for HIP-3 markets. */
export async function perpFacts(coin: string): Promise<string | null> {
  const dex = coin.includes(":") ? coin.split(":")[0] : "";
  const data = await info<[PerpMeta, PerpCtx[]]>(dex ? { type: "metaAndAssetCtxs", dex } : { type: "metaAndAssetCtxs" });
  if (!data) return null;
  const [meta, ctxs] = data;
  const i = meta.universe.findIndex((u) => u.name.toUpperCase() === coin.toUpperCase());
  if (i < 0 || !ctxs[i]) return null;
  const u = meta.universe[i];
  const c = ctxs[i];
  const px = Number(c.markPx);
  if (!Number.isFinite(px) || px <= 0) return null;
  const funding = Number(c.funding);
  const oi = Number(c.openInterest);
  const parts = [`The ${u.name} perpetual on Hyperliquid${dex ? ` (HIP-3 DEX ${dex})` : ""} has a mark price of ${price(px)}`, change(px, Number(c.prevDayPx))].filter(Boolean);
  return [
    `${parts.join(", ")}.`,
    `Funding is ${(funding * 100).toFixed(4)}% per hour (${(funding * 24 * 365 * 100).toFixed(2)}% annualized), paid every hour.`,
    `Open interest is ${oi.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${u.name.split(":").pop()} (${usd(oi * px)}), with ${usd(Number(c.dayNtlVlm))} traded in 24 hours and up to ${u.maxLeverage}x leverage.`,
    asOf(),
  ].join(" ");
}
