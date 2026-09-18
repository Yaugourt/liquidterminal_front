"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { DataStatus, SourceBadge, type SourceBadgeStatus } from "@/components/common";
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

interface HyperEvmCardProps {
  address: string;
}

/**
 * "On-chain · HyperEVM" block of the wallet page — everything Hyperfolio knows
 * about the EVM side of a wallet, behind the same pill tabs as the HyperCore
 * panels. Tabs mount on first visit and stay alive (hidden) afterwards so
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
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px] flex-wrap">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Layers size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">On-chain · HyperEVM</h3>
        {headline && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono">
            {headline}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <SourceBadge source="hyperfolio" status={sourceStatus} />
          <DataStatus
            variant="polled"
            updatedAt={defi.updatedAt ?? dataUpdatedAt}
            isRefreshing={isRefreshing || defi.status === "streaming"}
            onRefresh={refreshAll}
          />
        </div>
      </div>

      <div className="px-3.5 py-2 border-b border-border-subtle overflow-x-auto scrollbar-brand">
        <PillTabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {TABS.map(({ value }) =>
        visited.has(value) ? (
          <div key={value} className={value === activeTab ? "" : "hidden"}>
            {panels[value]()}
          </div>
        ) : null
      )}
    </Card>
  );
}
