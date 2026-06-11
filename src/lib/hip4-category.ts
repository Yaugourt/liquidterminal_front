/**
 * HIP-4 category derivation — maps (class_normalized, underlying, side_specs)
 * to a user-facing category for filtering the market grid.
 *
 * Rules (in order):
 *   - priceBinary + underlying ∈ {BTC, ETH, HYPE, SOL, PURR, ARB, …}  → "crypto"
 *   - priceBinary + any other underlying                              → "macro"
 *   - class_normalized === "custom" && has named sides                → "custom"
 *   - anything else                                                    → "other"
 */

export type Hip4Category = "all" | "crypto" | "macro" | "custom" | "other";

const CRYPTO_UNDERLYINGS = new Set<string>([
  "BTC", "ETH", "HYPE", "SOL", "PURR", "ARB", "OP", "DOGE", "AVAX", "MATIC",
  "LINK", "TRX", "LTC", "BCH", "NEAR", "APT", "SUI", "TON", "PEPE", "SHIB",
  "WLD", "TIA", "SEI", "INJ", "JUP", "JTO", "BONK", "WIF", "FTM", "XRP",
]);

/** Derive a category from a grouped question + its first outcome's raw class. */
export function categorizeQuestion(
  q: { class: string | null; underlying: string | null },
  fallbackSides: { name: string }[] | null
): Exclude<Hip4Category, "all"> {
  const cls = (q.class ?? "").toLowerCase() || "custom";
  const underlying = (q.underlying ?? "").toUpperCase();

  if (cls === "pricebinary") {
    if (underlying && CRYPTO_UNDERLYINGS.has(underlying)) return "crypto";
    return "macro";
  }
  if (fallbackSides && fallbackSides.length > 0) return "custom";
  if (cls === "custom") return "custom";
  return "other";
}

/** Human-facing label for a category. */
export const CATEGORY_LABELS: Record<Hip4Category, string> = {
  all: "All",
  crypto: "Crypto",
  macro: "Macro",
  custom: "Custom",
  other: "Other",
};

/** Display order in the tabs UI. */
export const CATEGORY_ORDER: Hip4Category[] = ["all", "crypto", "macro", "custom", "other"];
