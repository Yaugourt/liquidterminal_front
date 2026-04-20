"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import {
  useBuildersList,
  useBuilderStats,
  useBuilderUsers,
  type BuildersTimeframe,
} from "@/services/indexer/builders";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { formatBuilderDisplayName } from "@/components/market/builders/formatBuilderDisplayName";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Users,
  TrendingUp,
  TrendingDown,
  Coins,
  BarChart3,
  ChevronDown,
} from "lucide-react";

const TIMEFRAMES: BuildersTimeframe[] = ["1h", "24h", "7d", "30d"];
const ETH = /^0x[a-fA-F0-9]{40}$/i;

function VariationBadge({ pct }: { pct?: number | null }) {
  if (pct === undefined || pct === null || !Number.isFinite(pct)) return null;
  const positive = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
        positive
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-rose-500/10 text-rose-400"
      }`}
    >
      {positive ? (
        <TrendingUp className="w-2.5 h-2.5" />
      ) : (
        <TrendingDown className="w-2.5 h-2.5" />
      )}
      {positive ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

export default function BuildersIntelligencePage() {
  const { setTitle } = usePageTitle();
  const { format } = useNumberFormat();
  const [tf, setTf] = useState<BuildersTimeframe>("24h");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  const list = useBuildersList();
  const stats = useBuilderStats(
    ETH.test(selectedAddress) ? selectedAddress : undefined,
    tf
  );
  const users = useBuilderUsers(
    ETH.test(selectedAddress) ? selectedAddress : undefined,
    { timeframe: tf, limit: 50 }
  );

  // Auto-select first builder in the list
  useEffect(() => {
    if (!selectedAddress && list.builders.length > 0) {
      setSelectedAddress(list.builders[0].address);
    }
  }, [list.builders, selectedAddress]);

  useEffect(() => {
    setTitle("Builder Intelligence");
  }, [setTitle]);

  const selectedBuilder = useMemo(
    () => list.builders.find((b) => b.address === selectedAddress),
    [list.builders, selectedAddress]
  );

  const filteredBuilders = useMemo(() => {
    const s = search.toLowerCase();
    return list.builders.filter(
      (b) =>
        b.name.toLowerCase().includes(s) ||
        b.address.toLowerCase().includes(s)
    );
  }, [list.builders, search]);

  // Computed KPIs
  const kpis = useMemo(() => {
    if (!stats.stats) return null;
    const c = stats.stats.current;
    const totalUsers = c.uniqueUsers;
    const avgFeesPerUser = totalUsers > 0 ? c.totalBuilderFees / totalUsers : 0;
    const avgVolumePerUser = totalUsers > 0 ? c.totalVolume / totalUsers : 0;
    const avgFillsPerUser = totalUsers > 0 ? c.fillCount / totalUsers : 0;
    return { c, avgFeesPerUser, avgVolumePerUser, avgFillsPerUser };
  }, [stats.stats]);

  // Coin breakdown sorted by volume
  const topCoins = useMemo(() => {
    if (!stats.stats?.coinBreakdown) return [];
    return [...stats.stats.coinBreakdown]
      .sort(
        (a, b) =>
          ((b.totalVolume as number) ?? 0) - ((a.totalVolume as number) ?? 0)
      )
      .slice(0, 10);
  }, [stats.stats]);

  const maxCoinVolume = useMemo(
    () => Math.max(...topCoins.map((c) => (c.totalVolume as number) ?? 0), 1),
    [topCoins]
  );

  // Top users with total fees for share calculation
  const userRows = users.data?.users ?? [];
  const totalUserFees = useMemo(
    () =>
      userRows.reduce(
        (acc, u) => acc + ((u.totalBuilderFees as number) ?? 0),
        0
      ),
    [userRows]
  );

  const displayName = selectedBuilder
    ? formatBuilderDisplayName(selectedBuilder.name)
    : "—";

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Builder Intelligence
          </h1>
          <p className="text-text-secondary text-sm mt-1 max-w-2xl">
            Deep analytics on users trading via builder codes — revenue,
            behavior, and coin exposure.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {TIMEFRAMES.map((t) => (
            <Button
              key={t}
              type="button"
              size="sm"
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

      {/* Builder selector */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="glass-panel px-4 py-3 flex items-center gap-3 min-w-64 hover:border-border-hover transition-all text-left"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-xs font-bold text-brand-accent shrink-0">
            {displayName !== "—" ? displayName.charAt(0).toUpperCase() : "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {displayName}
            </p>
            <p className="text-text-muted text-xs font-mono truncate">
              {selectedAddress ? `${selectedAddress.slice(0, 10)}…` : "—"}
            </p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-text-muted transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-80 glass-panel border border-border-hover z-50 shadow-2xl">
            <div className="p-2 border-b border-border-subtle">
              <input
                className="w-full bg-transparent text-sm text-white placeholder:text-text-muted outline-none px-2 py-1"
                placeholder="Search builder…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredBuilders.slice(0, 50).map((b) => (
                <button
                  key={b.address}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left ${
                    b.address === selectedAddress ? "bg-brand-accent/10" : ""
                  }`}
                  onClick={() => {
                    setSelectedAddress(b.address);
                    setDropdownOpen(false);
                    setSearch("");
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-brand-accent/10 flex items-center justify-center text-[10px] font-bold text-brand-accent shrink-0">
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{b.name}</p>
                    <p className="text-text-muted text-xs font-mono">
                      {b.address.slice(0, 12)}…
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* KPI strip */}
      {stats.isLoading && !kpis ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card animate-pulse h-24 rounded-xl" />
          ))}
        </div>
      ) : kpis ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Builder revenue",
              value: formatNumber(kpis.c.totalBuilderFees, format, {
                maximumFractionDigits: 2,
                currency: "$",
                showCurrency: true,
              }),
              icon: <TrendingUp className="w-4 h-4 text-brand-gold" />,
              pct: stats.stats?.variations?.totalBuilderFeesPct,
              color: "text-brand-gold",
            },
            {
              label: "Active users",
              value: formatNumber(kpis.c.uniqueUsers, format, {
                maximumFractionDigits: 0,
              }),
              icon: <Users className="w-4 h-4 text-brand-accent" />,
              pct: stats.stats?.variations?.uniqueUsersPct,
              color: "text-brand-accent",
            },
            {
              label: "Avg rev / user",
              value: formatNumber(kpis.avgFeesPerUser, format, {
                maximumFractionDigits: 4,
                currency: "$",
                showCurrency: true,
              }),
              icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
              pct: null,
              color: "text-emerald-400",
            },
            {
              label: "Avg volume / user",
              value: formatNumber(kpis.avgVolumePerUser, format, {
                maximumFractionDigits: 0,
                currency: "$",
                showCurrency: true,
              }),
              icon: <Coins className="w-4 h-4 text-text-secondary" />,
              pct: null,
              color: "text-white",
            },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="stat-card p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                  {item.label}
                </span>
                {item.icon}
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className={`text-lg font-bold tabular-nums ${item.color}`}>
                  {item.value}
                </p>
                <VariationBadge pct={item.pct} />
              </div>
            </motion.div>
          ))}
        </div>
      ) : null}

      {/* Top coins + Top users in 2-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Coins */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">
              Top Coins ({tf})
            </h2>
            <span className="text-text-muted text-xs">
              {topCoins.length} coins
            </span>
          </div>
          {stats.isLoading && !topCoins.length ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-brand-accent" />
            </div>
          ) : (
            <div className="space-y-3">
              {topCoins.map((coin, i) => {
                const vol = (coin.totalVolume as number) ?? 0;
                const fees = (coin.totalBuilderFees as number) ?? 0;
                const pct = (vol / maxCoinVolume) * 100;
                return (
                  <motion.div
                    key={coin.coin ?? i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-text-muted text-xs w-4 tabular-nums">
                          {i + 1}
                        </span>
                        <span className="text-white text-sm font-medium">
                          {coin.coin ?? "—"}
                        </span>
                        {coin.uniqueUsers !== undefined && (
                          <span className="text-text-muted text-xs">
                            {coin.uniqueUsers} users
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm tabular-nums">
                          {formatNumber(vol, format, {
                            maximumFractionDigits: 0,
                            currency: "$",
                            showCurrency: true,
                          })}
                        </p>
                        {fees > 0 && (
                          <p className="text-brand-gold text-xs tabular-nums">
                            {formatNumber(fees, format, {
                              maximumFractionDigits: 2,
                              currency: "$",
                              showCurrency: true,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.04 + 0.1, duration: 0.4 }}
                        className="h-full bg-brand-accent/50 rounded-full"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Users */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">
              Top Users ({tf})
            </h2>
            <span className="text-text-muted text-xs">
              {userRows.length} users
            </span>
          </div>
          {users.isLoading && !userRows.length ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-brand-accent" />
            </div>
          ) : userRows.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">
              No data for this window.
            </p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border-subtle">
                    <TableHead className="py-2 px-2 w-8">
                      <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                        #
                      </span>
                    </TableHead>
                    <TableHead className="py-2 px-2">
                      <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                        User
                      </span>
                    </TableHead>
                    <TableHead className="py-2 px-2 text-right">
                      <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                        Rev
                      </span>
                    </TableHead>
                    <TableHead className="py-2 px-2 text-right hidden sm:table-cell">
                      <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                        Volume
                      </span>
                    </TableHead>
                    <TableHead className="py-2 px-2 text-right hidden md:table-cell">
                      <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                        Share
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRows.slice(0, 15).map((u, idx) => {
                    const addr = (u.user ?? u.address ?? "—") as string;
                    const fees =
                      (u.totalBuilderFees as number) ??
                      (u.builderFees as number) ??
                      0;
                    const vol = (u.totalVolume as number) ?? 0;
                    const share =
                      totalUserFees > 0 ? (fees / totalUserFees) * 100 : 0;
                    return (
                      <TableRow
                        key={addr + idx}
                        className="border-border-subtle hover:bg-white/[0.02] transition-colors"
                      >
                        <TableCell className="py-2 px-2 text-text-muted text-xs font-bold">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[9px] text-text-muted shrink-0">
                              {addr.slice(2, 3).toUpperCase()}
                            </div>
                            <span className="text-xs text-text-secondary font-mono truncate max-w-[100px]">
                              {addr.slice(0, 8)}…{addr.slice(-4)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-2 text-right text-sm text-brand-gold tabular-nums">
                          {formatNumber(fees, format, {
                            maximumFractionDigits: 2,
                            currency: "$",
                            showCurrency: true,
                          })}
                        </TableCell>
                        <TableCell className="py-2 px-2 text-right text-sm text-text-secondary tabular-nums hidden sm:table-cell">
                          {vol > 0
                            ? formatNumber(vol, format, {
                                maximumFractionDigits: 0,
                                currency: "$",
                                showCurrency: true,
                              })
                            : "—"}
                        </TableCell>
                        <TableCell className="py-2 px-2 hidden md:table-cell">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-accent/50 rounded-full"
                                style={{
                                  width: `${Math.min(share, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-text-muted text-xs w-8 text-right tabular-nums">
                              {share.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Additional stats */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total fills",
              value: formatNumber(kpis.c.fillCount, format, {
                maximumFractionDigits: 0,
              }),
            },
            {
              label: "Avg fills / user",
              value: formatNumber(kpis.avgFillsPerUser, format, {
                maximumFractionDigits: 1,
              }),
            },
            {
              label: "Coins traded",
              value: formatNumber(kpis.c.uniqueCoins, format, {
                maximumFractionDigits: 0,
              }),
            },
            {
              label: "Total volume",
              value: formatNumber(kpis.c.totalVolume, format, {
                maximumFractionDigits: 0,
                currency: "$",
                showCurrency: true,
              }),
            },
          ].map((item) => (
            <div key={item.label} className="stat-card flex flex-col gap-1">
              <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                {item.label}
              </span>
              <p className="text-white text-base font-semibold tabular-nums">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
