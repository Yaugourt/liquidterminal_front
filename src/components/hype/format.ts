import { compactUsd, compactHype } from "@/lib/formatters/numberFormatting";

/** Compact USD — `$1.23M`. */
export const fmtUsd = (n: number | null | undefined): string => compactUsd(n);

/** Full USD with thousand separators — `$1,129,884,345`. */
export const fmtUsdFull = (n: number | null | undefined): string =>
  n != null && Number.isFinite(n) && n !== 0
    ? `$${Math.round(n).toLocaleString("en-US")}`
    : "—";

/** Compact HYPE amount with unit — `44.77M HYPE`. */
export const fmtHype = (
  n: number | null | undefined,
  decimals?: number,
): string =>
  n != null && Number.isFinite(n)
    ? `${compactHype(n, decimals != null ? { decimals } : {})} HYPE`
    : "—";

/** Full HYPE amount with separators and unit — `44,767,714 HYPE`. */
export const fmtHypeFull = (n: number | null | undefined): string =>
  n != null && Number.isFinite(n)
    ? `${Math.round(n).toLocaleString("en-US")} HYPE`
    : "—";

/** Unsigned percentage — `4.5%`. */
export const fmtPct = (n: number | null | undefined, d = 1): string =>
  n != null && Number.isFinite(n) ? `${n.toFixed(d)}%` : "—";

/** Signed percentage with typographic minus — `+12.3%` / `−4.1%`. */
export const fmtSignedPct = (n: number | null | undefined, d = 2): string =>
  n != null && Number.isFinite(n)
    ? `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(d)}%`
    : "—";
