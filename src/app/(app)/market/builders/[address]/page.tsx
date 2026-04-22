"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePageTitle } from "@/store/use-page-title";
import { AddressDisplay } from "@/components/ui/address-display";
import {
  useBuilderStats,
  useBuilderUsers,
  type BuildersTimeframe,
} from "@/services/indexer/builders";
import {
  BuilderDetailStatsGrid,
  BuilderUsersTable,
  formatBuilderDisplayName,
} from "@/components/market/builders";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

const TIMEFRAMES: BuildersTimeframe[] = ["1h", "24h", "7d", "30d"];
const ETH = /^0x[a-fA-F0-9]{40}$/i;

export default function BuilderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { setTitle } = usePageTitle();
  const { format } = useNumberFormat();
  const raw = typeof params.address === "string" ? decodeURIComponent(params.address) : "";
  const address = raw.trim();
  const valid = ETH.test(address);
  const [tf, setTf] = useState<BuildersTimeframe>("24h");

  const stats = useBuilderStats(valid ? address : undefined, tf);
  const users = useBuilderUsers(valid ? address : undefined, { timeframe: tf, limit: 25 });

  const displayName = useMemo(
    () => (stats.stats ? formatBuilderDisplayName(stats.stats.builderName) : null),
    [stats.stats]
  );

  useEffect(() => {
    if (displayName && displayName !== "—") setTitle(`${displayName} · Builder`);
    else if (valid) setTitle(`${address.slice(0, 8)}… · Builder`);
    else setTitle("Builder");
  }, [setTitle, displayName, address, valid]);

  if (!valid) {
    return (
      <div className="glass-panel p-8 text-center max-w-lg mx-auto">
        <h2 className="text-lg font-medium text-white mb-2">Invalid address</h2>
        <p className="text-text-secondary text-sm mb-4">Use a checksummed 0x address (40 hex chars).</p>
        <Button variant="ghost" className="text-brand-accent" onClick={() => router.push("/market/builders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Builders
        </Button>
      </div>
    );
  }

  const isFirstLoad = stats.isLoading && !stats.stats;

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Nav */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button
          variant="ghost" size="sm"
          onClick={() => router.push("/market/builders")}
          className="text-text-secondary hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />Back
        </Button>
        <div className="flex flex-wrap gap-2">
          {TIMEFRAMES.map((t) => (
            <Button
              key={t} type="button" size="sm"
              onClick={() => setTf(t)}
              className={
                tf === t
                  ? "bg-brand-accent/20 text-brand-accent border border-brand-accent/40 hover:bg-brand-accent/30"
                  : "border border-border-subtle text-text-secondary hover:bg-white/5 hover:text-white bg-transparent"
              }
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      {/* Builder header */}
      {isFirstLoad ? (
        <div className="glass-panel p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-white/5 rounded" />
              <div className="h-4 w-48 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-2xl font-bold text-brand-accent shrink-0">
              {(displayName && displayName !== "—" ? displayName.charAt(0) : address.slice(2, 3)).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-white">
                  {displayName && displayName !== "—" ? displayName : "Builder"}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                  {tf}
                </span>
              </div>
              <AddressDisplay address={address} truncate showExternalLink={false} className="text-sm mt-1" />
            </div>
            {stats.stats && (
              <div className="flex gap-6 shrink-0">
                <div className="text-center">
                  <p className="text-text-muted text-[10px] uppercase tracking-wider">Volume</p>
                  <p className="text-white font-bold text-sm tabular-nums">
                    {formatNumber(stats.stats.current.totalVolume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-text-muted text-[10px] uppercase tracking-wider">Builder fees</p>
                  <p className="text-brand-gold font-bold text-sm tabular-nums">
                    {formatNumber(stats.stats.current.totalBuilderFees, format, { maximumFractionDigits: 2, currency: "$", showCurrency: true })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-text-muted text-[10px] uppercase tracking-wider">Users</p>
                  <p className="text-white font-bold text-sm tabular-nums">
                    {formatNumber(stats.stats.current.uniqueUsers, format, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats détaillées */}
      <section className="space-y-3">
        <h2 className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider px-1">
          Performance ({tf})
        </h2>
        <BuilderDetailStatsGrid stats={stats.stats} isLoading={stats.isLoading} error={stats.error} />
      </section>

      {/* Coin breakdown */}
      {stats.stats?.coinBreakdown && stats.stats.coinBreakdown.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider px-1">
            Top coins ({tf})
          </h2>
          <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-px bg-border-subtle">
              {stats.stats.coinBreakdown.slice(0, 10).map((coin, i) => (
                <div key={coin.coin ?? i} className="bg-brand-secondary/60 p-3 text-center">
                  <p className="text-brand-accent font-medium text-sm">{coin.coin ?? "—"}</p>
                  {coin.totalVolume !== undefined && (
                    <p className="text-text-muted text-xs tabular-nums">
                      {formatNumber(coin.totalVolume as number, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top users */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
            Top users ({tf})
          </h2>
          {users.data?.users && (
            <span className="text-text-muted text-xs">{users.data.users.length} users</span>
          )}
        </div>
        <BuilderUsersTable
          users={users.data?.users ?? []}
          isLoading={users.isLoading}
          error={users.error}
        />
      </section>
    </motion.div>
  );
}
