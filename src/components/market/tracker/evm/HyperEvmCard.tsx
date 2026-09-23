"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { DataStatus, SourceBadge, TableStat, type SourceBadgeStatus } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { useDefiPositions, useEvmComposition } from "@/services/market/tracker/hyperfolio";
import { DefiPositionsTab } from "./DefiPositionsTab";
import { EvmTokensTab } from "./EvmTokensTab";
import { EvmActivityTab } from "./EvmActivityTab";
import { NftsTab } from "./NftsTab";
import { PointsTab } from "./PointsTab";

type EvmTabId = "positions" | "tokens" | "activity" | "nfts" | "points";

const TABS: { value: EvmTabId; label: string }[] = [
  { value: "positions", label: "DeFi Positions" },
  { value: "tokens", label: "Tokens" },
  { value: "activity", label: "Activity" },
  { value: "nfts", label: "NFTs" },
  { value: "points", label: "Points" },
];

/** Panels that are a `TypedDataTable` (own card); the others get one here. */
const TABLE_PANELS: ReadonlySet<EvmTabId> = new Set(["tokens", "activity"]);

interface HyperEvmCardProps {
  address: string;
}

/**
 * "On-chain · HyperEVM" block of the wallet page — everything Hyperfolio knows
 * about the EVM side of a wallet, behind the same pill tabs as the HyperCore
 * panels. Table panels (Tokens, Activity) render their own card; the others
 * are wrapped in one here. Tabs mount on first visit and stay alive (hidden) afterwards so
 * switching back never re-fires their fetches (see AddressAnalyticsLayout).
 */
export function HyperEvmCard({ address }: HyperEvmCardProps) {
  const [activeTab, setActiveTab] = useState<EvmTabId>("positions");
  const [visited, setVisited] = useState<Set<EvmTabId>>(() => new Set(["positions"]));

  const { composition, isLoading, isRefreshing, error, dataUpdatedAt, refetch } = useEvmComposition(address);
  const defi = useDefiPositions(address);

  // Upstream health for the source badge: red as soon as either Hyperfolio
  // route (composition or DeFi stream) failed, muted until one has answered.
  const sourceStatus: SourceBadgeStatus =
    error || defi.status === "error" || defi.status === "rate-limited"
      ? "error"
      : isLoading && defi.isLoading
        ? "loading"
        : "ok";

  const handleTabChange = useCallback((value: string) => {
    const id = value as EvmTabId;
    setActiveTab(id);
    setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const headline = useMemo(() => {
    const defiValue = defi.protocols.reduce((sum, p) => sum + p.totalValue, 0);
    const tokensValue = composition?.totalValue ?? 0;
    if (!composition && defi.protocols.length === 0) return null;
    return compactUsd(defiValue + tokensValue);
  }, [composition, defi.protocols]);

  const refreshAll = useCallback(() => {
    refetch();
    defi.refresh();
  }, [refetch, defi]);

  const panels: Record<EvmTabId, () => ReactNode> = {
    positions: () => <DefiPositionsTab address={address} />,
    tokens: () => <EvmTokensTab address={address} />,
    activity: () => <EvmActivityTab address={address} />,
    nfts: () => <NftsTab address={address} />,
    points: () => <PointsTab address={address} />,
  };

  return (
    <div className="space-y-3">
      {/* Panel nav + HyperEVM-wide freshness. Kept outside the panel cards so
          it stays usable while a table panel shows its loading state. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-0 max-w-full overflow-x-auto scrollbar-brand">
          <PillTabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1">
          {headline && <TableStat label="HyperEVM" value={headline} />}
          <SourceBadge source="hyperfolio" status={sourceStatus} />
          <DataStatus
            variant="polled"
            updatedAt={defi.updatedAt ?? dataUpdatedAt}
            isRefreshing={isRefreshing || defi.status === "streaming"}
            onRefresh={refreshAll}
          />
        </div>
      </div>

      {TABS.map(({ value }) =>
        visited.has(value) ? (
          <div key={value} className={value === activeTab ? "" : "hidden"}>
            {TABLE_PANELS.has(value) ? (
              panels[value]()
            ) : (
              <Card className="flex flex-col overflow-hidden">{panels[value]()}</Card>
            )}
          </div>
        ) : null
      )}
    </div>
  );
}
