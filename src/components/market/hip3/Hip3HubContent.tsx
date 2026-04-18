"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Coins, Flame, LayoutDashboard, LineChart, Sparkles, Wallet } from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHip3Overview, useHip3Dexs, useHip3TopMovers, useHip3UserOverview, useHip3UserCoins, useHip3UserFills } from "@/services/indexer/hip3";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";

function formatUsd(n: number): string {
  return `$${formatLargeNumber(n, { decimals: 2 })}`;
}

export function Hip3HubContent() {
  const overview = useHip3Overview();
  const dexs = useHip3Dexs({ limit: 100, offset: 0 });
  const movers = useHip3TopMovers(12);
  const [walletInput, setWalletInput] = useState("");
  const [walletQuery, setWalletQuery] = useState("");

  const userOverview = useHip3UserOverview(walletQuery);
  const userCoins = useHip3UserCoins(walletQuery, { limit: 20 });
  const userFills = useHip3UserFills(walletQuery, { limit: 25 });

  const o = overview.data;

  const kpi = useMemo(() => {
    if (!o) return [];
    return [
      { title: "HIP-3 DEXs", value: String(o.total_dexs), icon: <Building2 className="h-4 w-4 text-brand-accent" /> },
      { title: "Assets", value: String(o.total_assets), icon: <Coins className="h-4 w-4 text-emerald-400" /> },
      { title: "24h volume", value: formatUsd(o.total_volume_24h), icon: <LineChart className="h-4 w-4 text-brand-gold" /> },
      { title: "24h fees", value: formatUsd(o.total_fees_24h), icon: <Sparkles className="h-4 w-4 text-brand-accent" /> },
      { title: "24h trades", value: formatLargeNumber(o.total_trades_24h, { decimals: 0 }), icon: <LayoutDashboard className="h-4 w-4 text-text-secondary" /> },
      { title: "Open interest", value: formatUsd(o.total_open_interest), icon: <Flame className="h-4 w-4 text-orange-400" /> },
      { title: "Active auctions", value: String(o.active_auctions), icon: <Sparkles className="h-4 w-4 text-brand-gold" /> },
    ];
  }, [o]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-inter text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          HIP-3 (indexer)
        </h1>
        <p className="text-sm text-text-secondary max-w-2xl">
          Builder perp DEX metrics from the LiquidTerminal indexer (HypeDexer). Explore DEXs, liquidity, and
          on-chain activity — complementary to the Hyperliquid-native PerpDex view.
        </p>
      </div>

      {overview.error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
          {overview.error.message}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpi.map((card) => (
          <StatsCard
            key={card.title}
            className="glass-panel rounded-2xl border border-border-subtle bg-brand-secondary/40"
            title={card.title}
            value={card.value}
            icon={card.icon}
            isLoading={overview.isLoading}
          />
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Top movers (24h)</h2>
        <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
          {movers.error ? (
            <div className="p-4 text-sm text-rose-400">{movers.error.message}</div>
          ) : movers.isLoading ? (
            <div className="p-8 flex justify-center text-text-muted text-sm">Loading…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border-subtle hover:bg-transparent">
                  <TableHead className="text-table-header">Coin</TableHead>
                  <TableHead className="text-table-header">DEX</TableHead>
                  <TableHead className="text-table-header text-right">Mark</TableHead>
                  <TableHead className="text-table-header text-right">Vol 24h</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(movers.data ?? []).slice(0, 12).map((row) => (
                  <TableRow key={`${row.dex_id}-${row.coin}`} className="border-border-subtle">
                    <TableCell className="text-table-cell font-medium text-white">{row.coin}</TableCell>
                    <TableCell className="text-table-cell text-text-secondary">{row.dex_id}</TableCell>
                    <TableCell className="text-table-cell text-right tabular-nums">
                      {row.current_mark_price.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-table-cell text-right tabular-nums text-text-secondary">
                      {formatUsd(row.volume_24h)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">All DEXs</h2>
        <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
          {dexs.error ? (
            <div className="p-4 text-sm text-rose-400">{dexs.error.message}</div>
          ) : dexs.isLoading ? (
            <div className="p-8 flex justify-center text-text-muted text-sm">Loading…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border-subtle hover:bg-transparent">
                  <TableHead className="text-table-header">DEX</TableHead>
                  <TableHead className="text-table-header">Name</TableHead>
                  <TableHead className="text-table-header">Collateral</TableHead>
                  <TableHead className="text-table-header text-right">Fee share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(dexs.data ?? []).map((d) => (
                  <TableRow key={d.dex_id} className="border-border-subtle">
                    <TableCell className="text-table-cell">
                      <Link
                        href={`/market/hip3/${encodeURIComponent(d.dex_id)}`}
                        className="text-brand-accent hover:underline font-medium"
                      >
                        {d.dex_id}
                      </Link>
                    </TableCell>
                    <TableCell className="text-table-cell text-white">{d.name}</TableCell>
                    <TableCell className="text-table-cell text-text-secondary">{d.collateral_asset}</TableCell>
                    <TableCell className="text-table-cell text-right tabular-nums">{d.fee_share_pct}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-brand-accent" />
          <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
            Explore wallet (manual)
          </h2>
        </div>
        <p className="text-xs text-text-muted max-w-2xl">
          Enter a checksummed or lowercase <code className="text-[10px] text-text-secondary">0x</code> address.
          Nothing is sent until you click Load.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <Input
            value={walletInput}
            onChange={(e) => setWalletInput(e.target.value)}
            placeholder="0x…"
            className="glass-input font-mono text-sm"
          />
          <Button type="button" className="glass-button shrink-0" onClick={() => setWalletQuery(walletInput.trim())}>
            Load
          </Button>
        </div>
        {walletQuery && (
          <div className="space-y-4">
            {userOverview.error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
                {userOverview.error.message}
              </div>
            )}
            <div className="glass-panel rounded-2xl border border-border-subtle p-4">
              <h3 className="text-label mb-2">Overview</h3>
              {userOverview.isLoading ? (
                <p className="text-sm text-text-muted">Loading…</p>
              ) : userOverview.data === null || userOverview.data === undefined ? (
                <p className="text-sm text-text-muted">No overview data.</p>
              ) : (
                <pre className="text-xs text-text-secondary overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(userOverview.data, null, 2)}
                </pre>
              )}
            </div>
            <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
              <h3 className="text-label px-4 pt-4">Top coins</h3>
              {userCoins.isLoading ? (
                <p className="p-4 text-sm text-text-muted">Loading…</p>
              ) : (userCoins.data ?? []).length === 0 ? (
                <p className="p-4 text-sm text-text-muted">No coin rows.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-subtle">
                      <TableHead className="text-table-header">Row</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(userCoins.data ?? []).map((row, i) => (
                      <TableRow key={i} className="border-border-subtle">
                        <TableCell className="text-xs text-text-secondary font-mono">
                          {JSON.stringify(row)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
              <h3 className="text-label px-4 pt-4">Recent fills</h3>
              {userFills.isLoading ? (
                <p className="p-4 text-sm text-text-muted">Loading…</p>
              ) : (userFills.data ?? []).length === 0 ? (
                <p className="p-4 text-sm text-text-muted">No fills.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-subtle">
                      <TableHead className="text-table-header">Time</TableHead>
                      <TableHead className="text-table-header">Coin</TableHead>
                      <TableHead className="text-table-header text-right">Px</TableHead>
                      <TableHead className="text-table-header text-right">Sz</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(userFills.data ?? []).map((f) => (
                      <TableRow key={f.hash} className="border-border-subtle">
                        <TableCell className="text-xs text-text-secondary whitespace-nowrap">{f.time}</TableCell>
                        <TableCell className="text-sm text-white">{f.coin}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{f.px}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-text-secondary">{f.sz}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
