import { useMemo } from "react";
import { useSpotGlobalStats } from "@/services/market/spot/hooks/useSpotGlobalStats";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useHypeOverview } from "@/services/market/hype/hooks/useHypeOverview";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useValidators } from "@/services/explorer/validator/hooks/validator/useValidators";
import { useProjects } from "@/services/ecosystem/project/hooks/useProjects";
import { compactCount, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/**
 * One end-of-row value. `tone` colours `text` (muted count vs signed price
 * move); the optional `prefix` renders ahead of it in a neutral tone — used to
 * show the HYPE price next to its coloured 24h change.
 */
export interface SidebarBadgeValue {
  text: string;
  tone: "muted" | "up" | "down";
  prefix?: string;
}

/**
 * Live counts for the sidebar entries, keyed by href.
 *
 * The sidebar mounts on every page, so this stays deliberately light: it reads
 * the same aggregate stats hooks the pages already use (so `useDataFetching`'s
 * cache is shared and no double fetch happens on the matching page), and asks
 * the list endpoints for a single row (`limit: 1`) — the pagination total is
 * all we need. A value is emitted only once its source has loaded; until then
 * the entry shows no number rather than a zero (DS rule: no data → no metric).
 *
 * Wiki has no cheap total endpoint, so it carries no count.
 */
export function useSidebarBadges(): Record<string, SidebarBadgeValue> {
  const { stats: spot } = useSpotGlobalStats();
  const { stats: perp } = usePerpGlobalStats();
  const { overview: hype } = useHypeOverview();
  const { totalCount: vaultsTotal } = useVaults({ limit: 1 });
  const { stats: validatorStats } = useValidators();
  const { pagination: projectsPage } = useProjects({ limit: 1 });
  const { format } = useNumberFormat();

  return useMemo(() => {
    const out: Record<string, SidebarBadgeValue> = {};

    const spotPairs = spot?.totalPairs ?? null;
    const perpPairs = perp?.totalPairs ?? null;
    if (spotPairs !== null || perpPairs !== null) {
      out["/market"] = { text: compactCount((spotPairs ?? 0) + (perpPairs ?? 0)), tone: "muted" };
    }

    if (vaultsTotal > 0) {
      out["/explorer/vaults"] = { text: compactCount(vaultsTotal), tone: "muted" };
    }

    const validatorsTotal = validatorStats?.total ?? 0;
    if (validatorsTotal > 0) {
      out["/explorer/validator"] = { text: compactCount(validatorsTotal), tone: "muted" };
    }

    const projectsTotal = projectsPage?.total ?? 0;
    if (projectsTotal > 0) {
      out["/ecosystem/project"] = { text: compactCount(projectsTotal), tone: "muted" };
    }

    const chg = hype?.change24hPct ?? null;
    const price = hype?.price ?? null;
    if (chg !== null && Number.isFinite(chg)) {
      out["/hype"] = {
        prefix: price && price > 0 ? formatPrice(price, format) : undefined,
        text: `${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%`,
        tone: chg >= 0 ? "up" : "down",
      };
    }

    return out;
  }, [spot, perp, hype, vaultsTotal, validatorStats, projectsPage, format]);
}
