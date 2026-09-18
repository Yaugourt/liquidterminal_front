"use client";

import { useEffect, useState, useMemo } from "react";
import { Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { AddressDisplay } from "@/components/ui/address-display";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton, StackedShareBar } from "@/components/common";
import { useWallets } from "@/store/use-wallets";
import { useAddressBalance } from "@/services/explorer/address";
import { useNumberFormat } from "@/store/number-format.store";
import { formatAssetValue, compactUsd } from "@/lib/formatters/numberFormatting";
import { PortfolioApiResponse } from "@/services/explorer/address/types";
import { HyperliquidPerpResponse } from "@/services/market/tracker/types";

interface PortfolioStatsProps {
  portfolioData?: PortfolioApiResponse | null;
  perpPositions?: HyperliquidPerpResponse | null;
  walletAddress?: string;  // Optional for public view
}

type VolumeTimeframe = "24h" | "7d" | "30d" | "all";

const VOLUME_TABS: { value: VolumeTimeframe; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "all", label: "All" },
];

// Portfolio API period keys, per tab.
const TIMEFRAME_KEY: Record<VolumeTimeframe, "day" | "week" | "month" | "allTime"> = {
  "24h": "day",
  "7d": "week",
  "30d": "month",
  all: "allTime",
};

/** One label/value line inside the card — no tile chrome, hairline dividers. */
function StatRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-xs ${emphasis ? "text-text-primary font-medium" : "text-text-secondary"}`}>
        {label}
      </span>
      <span className={`mono text-sm ${emphasis ? "font-semibold text-text-primary" : "text-text-primary"}`}>
        {value}
      </span>
    </div>
  );
}

/**
 * Portfolio card (tracker + public address view): V4 card-head with the
 * wallet address, then HyperCore/HyperEVM balances on the left and volume +
 * long/short exposure on the right.
 */
export function PortfolioStats({
  portfolioData,
  perpPositions,
  walletAddress: walletAddressProp,
}: PortfolioStatsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [volumeTimeframe, setVolumeTimeframe] = useState<VolumeTimeframe>("24h");
  const { getActiveWallet } = useWallets();
  const { format } = useNumberFormat();
  const activeWallet = getActiveWallet();

  // Use provided address or fall back to active wallet
  const walletAddress = walletAddressProp || activeWallet?.address || "";

  const { balances, isLoading, error, evmLoading, evmError } = useAddressBalance(walletAddress, {
    includeEvm: true,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fmt = (value: number) => formatAssetValue(value, format);

  // Long/short exposure from open perp positions.
  const longShort = useMemo(() => {
    let longValue = 0;
    let shortValue = 0;
    perpPositions?.assetPositions?.forEach(({ position }) => {
      const szi = parseFloat(position.szi);
      const positionValue = parseFloat(position.positionValue);
      if (szi > 0) longValue += positionValue;
      else if (szi < 0) shortValue += positionValue;
    });
    const totalValue = longValue + shortValue;
    const longPct = totalValue > 0 ? (longValue / totalValue) * 100 : 0;
    return { longValue, shortValue, totalValue, longPct };
  }, [perpPositions]);

  // Volume for the selected window, split perp vs spot+vault.
  const volume = useMemo(() => {
    const empty = { perp: 0, spotVault: 0, total: 0 };
    if (!portfolioData?.length) return empty;
    const key = TIMEFRAME_KEY[volumeTimeframe];
    const totalData = portfolioData.find(([period]) => period === key);
    const perpData = portfolioData.find(
      ([period]) => period === `perp${key.charAt(0).toUpperCase()}${key.slice(1)}`
    );
    if (!totalData || !perpData) return empty;
    const total = parseFloat(totalData[1].vlm);
    const perp = parseFloat(perpData[1].vlm);
    return { perp, spotVault: Math.max(0, total - perp), total };
  }, [portfolioData, volumeTimeframe]);

  const evmRows = [
    ["EVM balance", balances.evmBalance],
    ["DeFi balance", balances.defiBalance],
    ["NFT value", balances.nftBalance],
  ] as const;

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Wallet size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Portfolio</h3>
        {isMounted && walletAddress && (
          <AddressDisplay address={walletAddress} showCopy className="ml-auto text-[11px]" />
        )}
      </div>

      {!isMounted || isLoading ? (
        <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>
      ) : error ? (
        <ErrorState message="Error loading portfolio data" />
      ) : (
        <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1 min-w-0">
          {/* Left: balances */}
          <div className="flex flex-col min-w-0">
            <p className="text-[10.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1">
              Balances
            </p>
            <div className="divide-y divide-border-subtle">
              <StatRow label="Spot" value={fmt(balances.spotBalance)} />
              <StatRow label="Perp" value={fmt(balances.perpBalance)} />
              <StatRow label="Vault" value={fmt(balances.vaultBalance)} />
              <StatRow label="Staked" value={fmt(balances.stakedBalance)} />
              {/* HyperEVM side — Hyperfolio proxy. Streams in after the HyperCore rows. */}
              {evmRows.map(([label, value]) => (
                <StatRow
                  key={label}
                  label={label}
                  value={
                    evmLoading && value === 0 ? (
                      <Skeleton className="h-4 w-16" />
                    ) : evmError && value === 0 ? (
                      <span className="text-text-tertiary" title={evmError.message}>—</span>
                    ) : (
                      fmt(value)
                    )
                  }
                />
              ))}
            </div>
            <div className="mt-auto pt-2 border-t border-border-default">
              <StatRow label="Total" value={fmt(balances.totalBalance)} emphasis />
            </div>
          </div>

          {/* Right: volume + exposure */}
          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-1">
              <p className="text-[10.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
                Volume
              </p>
              <PillTabs
                variant="text"
                tabs={VOLUME_TABS}
                activeTab={volumeTimeframe}
                onTabChange={(v) => setVolumeTimeframe(v as VolumeTimeframe)}
              />
            </div>
            <div className="divide-y divide-border-subtle">
              <StatRow label="Perp" value={fmt(volume.perp)} />
              <StatRow label="Spot + Vault" value={fmt(volume.spotVault)} />
              <StatRow label="Total" value={fmt(volume.total)} emphasis />
            </div>

            <div className="mt-auto pt-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-success">Long {compactUsd(longShort.longValue)}</span>
                <span className="text-danger">Short {compactUsd(longShort.shortValue)}</span>
              </div>
              {longShort.totalValue > 0 ? (
                <StackedShareBar
                  height={6}
                  segments={[
                    { value: longShort.longValue, colorClass: "bg-success", label: "Long" },
                    { value: longShort.shortValue, colorClass: "bg-danger", label: "Short" },
                  ]}
                />
              ) : (
                <div className="h-1.5 rounded-full bg-surface-2" />
              )}
              <div className="flex justify-between text-[10px] text-text-tertiary mono">
                <span>{longShort.longPct.toFixed(1)}% long</span>
                <span>{(100 - longShort.longPct).toFixed(1)}% short</span>
              </div>
              {/* Withdrawable — from HL clearinghouseState.withdrawable (perp response). */}
              <div className="pt-1.5 border-t border-border-subtle">
                <StatRow
                  label="Withdrawable"
                  value={fmt(perpPositions?.withdrawable ? parseFloat(perpPositions.withdrawable) : 0)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
