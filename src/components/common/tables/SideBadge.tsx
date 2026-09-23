import { StatusBadge } from "@/components/ui/status-badge";

export type TradeSide = "long" | "short" | "buy" | "sell";

const LABEL: Record<TradeSide, string> = {
  long: "Long",
  short: "Short",
  buy: "Buy",
  sell: "Sell",
};

/**
 * SideBadge — Long / Short / Buy / Sell pill. One label, one colour per side
 * (success for long/buy, danger for short/sell) across every table.
 *
 * `side` is case-insensitive; the API's `"Long"`, `"B"`/`"A"` (bid/ask) and
 * `"Open Long"`-style strings are normalised by {@link toTradeSide}.
 */
export function SideBadge({ side }: { side: TradeSide }) {
  const bullish = side === "long" || side === "buy";
  return <StatusBadge variant={bullish ? "buy" : "sell"}>{LABEL[side]}</StatusBadge>;
}

/**
 * Normalise an API side/direction to a {@link TradeSide}:
 * "long"/"Open Long" → long, "short" → short, "B"/"buy"/"bid" → buy,
 * "A"/"S"/"sell"/"ask" → sell. Returns null when unknown.
 * HL position flips ("Long > Short") resolve to the side after the arrow.
 */
export function toTradeSide(raw: string | null | undefined): TradeSide | null {
  if (!raw) return null;
  const v = (raw.includes(">") ? raw.slice(raw.lastIndexOf(">") + 1) : raw).trim().toLowerCase();
  if (v.includes("long")) return "long";
  if (v.includes("short")) return "short";
  if (v === "b" || v === "buy" || v === "bid") return "buy";
  if (v === "a" || v === "s" || v === "sell" || v === "ask") return "sell";
  return null;
}
