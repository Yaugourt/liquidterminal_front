"use client";

import { PageHeader, DataStatus, ShareTile } from "@/components/common";
import { useLiquidationsContext } from "./LiquidationsContext";

/**
 * Page header for /explorer/liquidations. The whole page shares one live
 * source (the liquidation WS), so the single "Live" indicator sits here
 * (DS §6.10: one indicator per live surface), next to the copy-as-image tile.
 */
export function LiquidationsPageHeader() {
  const { isConnected } = useLiquidationsContext();

  return (
    <PageHeader
      title="Liquidations"
      titleQualifier="on Hyperliquid"
      description="Liquidation events on Hyperliquid — aggregate stats, history, and a real-time feed of forced position closures."
      actions={
        <>
          <DataStatus variant="live" connected={isConnected} />
          <ShareTile
            src="/api/tile/liquidations"
            filename="liquidations-24h"
            label="Copy liquidations as image"
          />
        </>
      }
    />
  );
}
