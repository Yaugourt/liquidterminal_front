"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft } from "lucide-react";
import { usePageTitle } from "@/store/use-page-title";
import { AddressDisplay } from "@/components/ui/address-display";
import {
  useBuilderStats,
  useBuilderUsers,
  type BuildersTimeframe,
} from "@/services/indexer/builders";
import {
  BuilderAvatar,
  BuilderDetailStatsGrid,
  BuilderUsersTable,
  resolveBuilderLabel,
} from "@/components/market/builders";
import { KpiRibbon, PageHeader, Skeleton, TimeframeTabs, DataStatus, SourceBadge, combinedSourceStatus } from "@/components/common";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

const TIMEFRAMES: BuildersTimeframe[] = ["1h", "24h", "7d", "30d"];
const ETH = /^0x[a-fA-F0-9]{40}$/i;

export default function BuilderDetailPage() {
  const params = useParams();
  const { setTitle } = usePageTitle();
  const { format } = useNumberFormat();
  const raw = typeof params.address === "string" ? decodeURIComponent(params.address) : "";
  const address = raw.trim();
  const valid = ETH.test(address);
  const [tf, setTf] = useState<BuildersTimeframe>("24h");

  const stats = useBuilderStats(valid ? address : undefined, tf);
  const users = useBuilderUsers(valid ? address : undefined, { timeframe: tf, limit: 25 });

  // Curated brand when we know it (PURPS → Phantom), raw builder code otherwise.
  const { displayName, builderCode } = useMemo(() => {
    if (!stats.stats) return { displayName: null, builderCode: null };
    const { label, code, isAnonymous } = resolveBuilderLabel(address, stats.stats.builderName);
    return { displayName: isAnonymous ? "—" : label, builderCode: code };
  }, [stats.stats, address]);

  useEffect(() => {
    if (displayName && displayName !== "—") setTitle(`${displayName} · Builder`);
    else if (valid) setTitle(`${address.slice(0, 8)}… · Builder`);
    else setTitle("Builder");
  }, [setTitle, displayName, address, valid]);


  if (!valid) {
    return (
      <EmptyState
        title="Invalid address"
        description="Use a checksummed 0x address (40 hex chars)."
        action={
          <Link
            href="/market/builders"
            className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-text-primary"
          >
            <ArrowLeft size={14} /> Back to Builders
          </Link>
        }
      />
    );
  }

  const isFirstLoad = stats.isLoading && !stats.stats;

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Builder header */}
      <PageHeader
        back={{ href: "/market/builders", label: "Builders" }}
        title={displayName && displayName !== "—" ? displayName : "Builder"}
        actions={
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <SourceBadge source="hypedexer" status={combinedSourceStatus(stats, users)} />
            <DataStatus
              variant="polled"
              updatedAt={stats.dataUpdatedAt}
              isRefreshing={stats.isRefreshing}
              onRefresh={stats.refetch}
            />
            <TimeframeTabs
              options={TIMEFRAMES}
              value={tf}
              onChange={(v) => setTf(v as BuildersTimeframe)}
            />
          </div>
        }
      >
        {isFirstLoad ? (
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-md" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <BuilderAvatar
              address={address}
              label={displayName ?? "—"}
              size={40}
              className="rounded-md"
            />
            {/* On-chain builder code, kept visible next to the brand name. */}
            {builderCode && (
              <span className="mono text-[10px] px-2 py-0.5 rounded-md bg-surface-2 text-text-tertiary">
                {builderCode}
              </span>
            )}
            <span className="mono text-[10px] px-2 py-0.5 rounded-md bg-surface-2 text-text-secondary">
              {tf}
            </span>
            <AddressDisplay address={address} truncate showExternalLink={false} className="text-sm" />
          </div>
        )}
      </PageHeader>

      {/* Stats détaillées */}
      <section className="space-y-3">
        <h2 className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider px-1">
          Performance ({tf})
        </h2>
        <BuilderDetailStatsGrid
          stats={stats.stats}
          isLoading={stats.isLoading}
          error={stats.error}
          onRetry={stats.refetch}
        />
      </section>

      {/* Coin breakdown */}
      {stats.stats?.coinBreakdown && stats.stats.coinBreakdown.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider px-1">
            Top coins ({tf})
          </h2>
          <Card className="rounded-lg overflow-hidden">
            <KpiRibbon
              bordered={false}
              columns="grid-cols-1 sm:grid-cols-5"
              cells={(() => {
                const base = stats.stats.coinBreakdown.slice(0, 10).map((coin, i) => ({
                  key: coin.coin ?? String(i),
                  label: <span className="text-brand">{coin.coin ?? "—"}</span>,
                  value:
                    coin.totalVolume !== undefined
                      ? formatNumber(coin.totalVolume as number, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
                      : "—",
                }));
                // Pad to a multiple of 5 so the 5-col grid never shows orphan tracks.
                const pad = (5 - (base.length % 5)) % 5;
                for (let k = 0; k < pad; k++) base.push({ key: `pad-${k}`, label: <span />, value: "" });
                return base;
              })()}
            />
          </Card>
        </section>
      )}

      {/* Top users */}
      <BuilderUsersTable
        users={users.data?.users ?? []}
        isLoading={users.isLoading}
        error={users.error}
        timeframe={tf}
      />
    </motion.div>
  );
}
