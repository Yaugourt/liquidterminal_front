import type { Hip4MarketEnrichedRow } from "@/services/indexer/hip4";
import { isPlaceholderMarketName } from "./market-formatter";

/** How the fills tape names a coin. `sideName` is only set when the market is
 * provably binary (two parsed sides), so no Yes/No chip is made up. */
export interface Hip4FillLabel {
  name: string;
  sideName: string | null;
  isBinary: boolean;
}

// Every coin this tab has labelled. A market Hyperliquid has just delisted can
// still have fills in the tape: they keep the name they had. Grows by the
// markets the tab sees (a few hundred coins a day).
const seen: Record<string, Hip4FillLabel> = {};

/**
 * Fill labels for the live markets (outcomeMeta, keyed by side coin), plus
 * the ones this tab saw before they were delisted.
 */
export function rememberFillLabels(
  marketsByCoin: Record<string, Hip4MarketEnrichedRow>
): Record<string, Hip4FillLabel> {
  for (const m of Object.values(marketsByCoin)) {
    if (!m.coin) continue;
    const isBinary = (m.parsed_sides?.length ?? 0) === 2;
    seen[m.coin] = {
      // Skip upstream placeholder names ("Recurring Named Outcome"); the coin
      // ticker is a more honest label.
      name: [m.short_name, m.display_name].find((n) => !isPlaceholderMarketName(n)) ?? m.coin,
      sideName:
        m.side_name ?? (isBinary && m.side != null ? m.parsed_sides?.[m.side]?.name ?? null : null),
      isBinary,
    };
  }
  return { ...seen };
}
