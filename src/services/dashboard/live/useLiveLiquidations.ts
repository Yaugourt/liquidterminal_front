"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchRecentLiquidations } from "@/services/explorer/liquidation/api";
import { useLiquidationWSStore } from "@/services/explorer/liquidation/websocket.store";
import type { Liquidation } from "@/services/explorer/liquidation/types";

/**
 * Liquidations as they happen: seeded from the REST recent list, then kept
 * current by the backend `/ws` liquidation push. Rows are keyed by `tid` and
 * ordered on `time_ms` (the `time` string carries no timezone).
 */
export function useLiveLiquidations(limit = 12): { rows: Liquidation[]; connected: boolean } {
  const [seed, setSeed] = useState<Liquidation[]>([]);
  const pushed = useLiquidationWSStore((s) => s.recentLiquidations);
  const connected = useLiquidationWSStore((s) => s.isSubscribed);

  useEffect(() => {
    let cancelled = false;
    fetchRecentLiquidations({ limit: 60 })
      .then((res) => {
        if (!cancelled && res?.success) setSeed(res.data ?? []);
      })
      .catch(() => {
        // The live push still fills the list; the seed is a head start only.
      });

    const store = useLiquidationWSStore.getState();
    store.connect();
    return () => {
      cancelled = true;
      useLiquidationWSStore.getState().disconnect();
    };
  }, []);

  const rows = useMemo(() => {
    const byTid = new Map<number, Liquidation>();
    for (const l of [...pushed, ...seed]) {
      // Events not yet filled carry no notional or direction; they add noise, not signal.
      if (!(l.notional_total > 0) || !l.liq_dir) continue;
      if (!byTid.has(l.tid)) byTid.set(l.tid, l);
    }
    return [...byTid.values()].sort((a, b) => b.time_ms - a.time_ms).slice(0, limit);
  }, [pushed, seed, limit]);

  return { rows, connected };
}
