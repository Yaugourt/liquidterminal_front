"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { CardHead, DataStatus, KpiRibbon, PageHeader } from "@/components/common";
import { usePerpDexWithMarketData } from "@/services/market/perpDex/hooks";
import { formatNumber, truncateAddress, formatFunding } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { PerpDexMarketsTable } from "@/components/market/perpDex";
import { AddressDisplay } from "@/components/ui/address-display";
import { toast } from "sonner";
import {
  sortPerpDexMarketsAssets,
  type PerpDexMarketsSortField,
} from "@/lib/perpDexMarketsSort";

function formatFeeScale(range: { min: number; max: number } | null): string {
  if (!range) return "—";
  const pct = (v: number) => `${(v * 100).toFixed(0)}%`;
  return range.min === range.max ? pct(range.min) : `${pct(range.min)}–${pct(range.max)}`;
}

export default function PerpDexDetailPage() {
  const params = useParams();
  const dexName = typeof params.dex === 'string' ? decodeURIComponent(params.dex) : '';
  const { format } = useNumberFormat();

  const { dex, isLoading, error, wsConnected } = usePerpDexWithMarketData(dexName);

  const [marketsSortField, setMarketsSortField] =
    useState<PerpDexMarketsSortField>("dayNtlVlm");
  const [marketsSortOrder, setMarketsSortOrder] = useState<"asc" | "desc">("desc");

  const sortedMarketsAssets = useMemo(() => {
    if (!dex) return [];
    return sortPerpDexMarketsAssets(
      dex.assetsWithMarketData,
      marketsSortField,
      marketsSortOrder
    );
  }, [dex, marketsSortField, marketsSortOrder]);

  const handleMarketsSort = useCallback((field: PerpDexMarketsSortField) => {
    setMarketsSortField((prevField) => {
      if (prevField === field) {
        setMarketsSortOrder((o) => (o === "asc" ? "desc" : "asc"));
        return prevField;
      }
      setMarketsSortOrder("desc");
      return field;
    });
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isLoading && !dex) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingState size="sm" withCard={false} />
      </div>
    );
  }

  // `error` is set by any failed refresh, even with the DEX list still in hand:
  // "not found" only when the list loaded and has no such DEX, a load failure
  // otherwise.
  if (!dex) {
    const backAction = (
      <Button asChild variant="outline" size="sm">
        <Link href="/market/perpdex">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to PerpDexs
        </Link>
      </Button>
    );
    return error ? (
      <div className="space-y-3">
        <ErrorState
          title="DEX data unavailable"
          message={`Couldn't load the PerpDex "${dexName}". Retrying shortly.`}
        />
        <div className="flex justify-center">{backAction}</div>
      </div>
    ) : (
      <EmptyState
        title="DEX Not Found"
        description={`The PerpDex "${dexName}" was not found.`}
        action={backAction}
      />
    );
  }

  const labelClass =
    "text-[10.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold";


  const usd = (value: number) =>
    formatNumber(value, format, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      currency: '$',
      showCurrency: true
    });

  return (
    <>
      <PageHeader
        back={{ href: "/market/perpdex", label: "PerpDexs" }}
        title={dex.fullName}
        titleQualifier={dex.name}
        actions={<DataStatus variant="live" connected={wsConnected} />}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/25 bg-warning/10 px-3 py-2 text-[12px] text-warning">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Couldn&apos;t refresh DEX metadata — showing the last loaded data.
        </div>
      )}

      <KpiRibbon
        cells={[
          { key: "volume", label: "24h Volume", value: dex.totalVolume24h > 0 ? usd(dex.totalVolume24h) : '-' },
          { key: "oi", label: "Open Interest", value: dex.totalOpenInterest > 0 ? usd(dex.totalOpenInterest) : '-' },
          {
            key: "funding",
            label: "Avg Funding",
            value: formatFunding(dex.avgFunding),
            tone: dex.avgFunding >= 0 ? "success" : "danger",
          },
          {
            key: "markets",
            label: "Active Markets",
            value: dex.activeAssets,
            sub: dex.activeAssets !== dex.totalAssets ? `of ${dex.totalAssets}` : undefined,
          },
          { key: "oicap", label: "OI Cap", value: usd(dex.totalOiCap) },
          { key: "fee", label: "Fee Scale", value: formatFeeScale(dex.feeScaleRange) },
        ]}
      />

      {/* Addresses */}
      <Card>
        <CardHead title="Addresses" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          <div className="min-w-0 space-y-1.5">
            <div className={labelClass}>Deployer</div>
            <AddressDisplay
              address={dex.deployer}
              showExternalLink={true}
              externalLinkHref={`/explorer/address/${dex.deployer}`}
              copyMessage="Deployer address copied"
              className="text-brand text-sm"
            />
          </div>

          <div className="min-w-0 space-y-1.5">
            <div className={labelClass}>Fee Recipient</div>
            <AddressDisplay
              address={dex.feeRecipient}
              showExternalLink={true}
              externalLinkHref={`/explorer/address/${dex.feeRecipient}`}
              copyMessage="Fee recipient address copied"
              className="text-brand text-sm"
            />
          </div>

          {/* Oracle Updater or Sub Deployers */}
          {dex.oracleUpdater ? (
            <div className="min-w-0 space-y-1.5">
              <div className={labelClass}>Oracle Updater</div>
              <AddressDisplay
                address={dex.oracleUpdater}
                copyMessage="Oracle updater address copied"
                className="text-text-secondary text-sm"
              />
            </div>
          ) : dex.subDeployers.length > 0 ? (
            <div className="min-w-0 space-y-1.5">
              <div className={labelClass}>Sub-Deployers ({dex.subDeployers.length})</div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-brand">
                {dex.subDeployers.slice(0, 4).map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="text-brand shrink-0">{sub.permission}</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {sub.addresses.slice(0, 2).map((addr, addrIdx) => (
                        <div
                          key={addrIdx}
                          className="cursor-pointer"
                          onClick={() => copyToClipboard(addr, "Sub-deployer address")}
                        >
                          <span className="mono text-text-secondary text-label hover:text-brand transition-colors bg-surface-2 px-1.5 py-0.5 rounded-md">
                            {truncateAddress(addr)}
                          </span>
                        </div>
                      ))}
                      {sub.addresses.length > 2 && (
                        <span className="text-text-tertiary text-label">+{sub.addresses.length - 2}</span>
                      )}
                    </div>
                  </div>
                ))}
                {dex.subDeployers.length > 4 && (
                  <span className="text-text-tertiary text-xs">+{dex.subDeployers.length - 4} more permissions</span>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      {/* Markets table with live data */}
      <PerpDexMarketsTable
        assets={sortedMarketsAssets}
        totalAssets={dex.totalAssets}
        activeAssets={dex.activeAssets}
        sortField={marketsSortField}
        sortOrder={marketsSortOrder}
        onSort={handleMarketsSort}
      />
    </>
  );
}
