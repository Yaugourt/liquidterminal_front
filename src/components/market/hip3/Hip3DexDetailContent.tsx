"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gavel, LineChart, Table2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuroraAreaChart, ChartEmpty, ChartError, ChartLoading, type ChartDataPoint } from "@/components/common/charts";
import { chartColors } from "@/components/common/charts/chartTheme";
import {
  useHip3DexById,
  useHip3Assets,
  useHip3Snapshots,
  useHip3Fills,
  useHip3Leaderboard,
  useHip3StatsTraders,
  useHip3Ohlcv,
  useHip3OracleStats,
  useHip3Auctions,
  useHip3AuctionCurrent,
  useHip3AuctionsHistory,
} from "@/services/indexer/hip3";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";

function formatUsd(n: number): string {
  return `$${formatLargeNumber(n, { decimals: 2 })}`;
}

export function Hip3DexDetailContent({ dexId }: { dexId: string }) {
  const dex = useHip3DexById(dexId);
  const assets = useHip3Assets({ dex_id: dexId, limit: 200, offset: 0 });
  const snaps = useHip3Snapshots({ dex_id: dexId });
  const fills = useHip3Fills({ dex_id: dexId, limit: 50, offset: 0 });
  const leaderboard = useHip3Leaderboard({ dex_id: dexId, limit: 25 });
  const statsTraders = useHip3StatsTraders({ dex_id: dexId, limit: 25 });

  const firstTicker = assets.data?.[0]?.ticker ?? "";
  const [chartCoin, setChartCoin] = useState<string>("");
  const coinForCharts = chartCoin || firstTicker;

  const ohlcv = useHip3Ohlcv(
    coinForCharts ? { coin: coinForCharts, dex_id: dexId, limit: 120 } : null
  );
  const oracle = useHip3OracleStats(coinForCharts ? { dex_id: dexId, limit: 120 } : null);

  const auctions = useHip3Auctions({ limit: 20, offset: 0 });
  const auctionCur = useHip3AuctionCurrent();
  const auctionHist = useHip3AuctionsHistory({ dex_id: dexId, limit: 30, offset: 0 });

  const closeSeries: ChartDataPoint[] = useMemo(() => {
    const rows = ohlcv.data ?? [];
    return rows
      .map((r) => ({
        time: Date.parse(r.time),
        value: r.close,
      }))
      .filter((p) => Number.isFinite(p.time));
  }, [ohlcv.data]);

  const markSeries: ChartDataPoint[] = useMemo(() => {
    const rows = oracle.data ?? [];
    return rows
      .map((r) => ({
        time: Date.parse(r.bucket),
        value: r.mark_close,
      }))
      .filter((p) => Number.isFinite(p.time));
  }, [oracle.data]);

  return (
    <div className="space-y-8">
      <Link
        href="/market/hip3"
        className="inline-flex items-center gap-2 text-sm text-brand-accent hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to HIP-3 hub
      </Link>

      {dex.error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
          {dex.error.message}
        </div>
      )}

      <div className="space-y-2">
        <h1 className="font-inter text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          {dex.data?.name ?? dexId}
        </h1>
        <p className="text-sm text-text-secondary font-mono">{dexId}</p>
        {dex.data && (
          <p className="text-sm text-text-muted max-w-3xl">
            Collateral {dex.data.collateral_asset} · Fee share {dex.data.fee_share_pct}% · Deployer{" "}
            <span className="text-text-secondary break-all">{dex.data.deployer_address}</span>
          </p>
        )}
      </div>

      <Tabs defaultValue="markets" className="space-y-6">
        <TabsList className="bg-brand-secondary/80 border border-border-subtle flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="markets" className="gap-1 data-[state=active]:bg-brand-tertiary">
            <Table2 className="h-3.5 w-3.5" />
            Markets
          </TabsTrigger>
          <TabsTrigger value="trading" className="gap-1 data-[state=active]:bg-brand-tertiary">
            Trading
          </TabsTrigger>
          <TabsTrigger value="charts" className="gap-1 data-[state=active]:bg-brand-tertiary">
            <LineChart className="h-3.5 w-3.5" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="auctions" className="gap-1 data-[state=active]:bg-brand-tertiary">
            <Gavel className="h-3.5 w-3.5" />
            Auctions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="markets" className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Assets</h2>
            <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
              {assets.error ? (
                <div className="p-4 text-sm text-rose-400">{assets.error.message}</div>
              ) : assets.isLoading ? (
                <div className="p-8 text-center text-text-muted text-sm">Loading…</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-subtle hover:bg-transparent">
                      <TableHead className="text-table-header">Ticker</TableHead>
                      <TableHead className="text-table-header">Symbol</TableHead>
                      <TableHead className="text-table-header text-right">Max lev</TableHead>
                      <TableHead className="text-table-header text-right">OI cap</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(assets.data ?? []).map((a) => (
                      <TableRow key={a.ticker} className="border-border-subtle">
                        <TableCell className="text-sm text-white font-medium">{a.ticker}</TableCell>
                        <TableCell className="text-sm text-text-secondary">{a.symbol}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{a.max_leverage}x</TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-text-secondary">
                          {formatUsd(a.oi_cap_usd)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Snapshots</h2>
            <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
              {snaps.error ? (
                <div className="p-4 text-sm text-rose-400">{snaps.error.message}</div>
              ) : snaps.isLoading ? (
                <div className="p-8 text-center text-text-muted text-sm">Loading…</div>
              ) : (snaps.data ?? []).length === 0 ? (
                <div className="p-6 text-sm text-text-muted">No snapshot rows for this filter.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-subtle hover:bg-transparent">
                      <TableHead className="text-table-header">Coin</TableHead>
                      <TableHead className="text-table-header text-right">Mark</TableHead>
                      <TableHead className="text-table-header text-right">OI</TableHead>
                      <TableHead className="text-table-header text-right">Vol 24h</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(snaps.data ?? []).map((s) => (
                      <TableRow key={s.coin} className="border-border-subtle">
                        <TableCell className="text-sm text-white">{s.coin}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{s.current_mark_price}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-text-secondary">
                          {formatLargeNumber(s.open_interest, { decimals: 0 })}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-text-secondary">
                          {formatUsd(s.volume_24h)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="trading" className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Recent fills</h2>
            <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
              {fills.error ? (
                <div className="p-4 text-sm text-rose-400">{fills.error.message}</div>
              ) : fills.isLoading ? (
                <div className="p-8 text-center text-text-muted text-sm">Loading…</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-subtle hover:bg-transparent">
                      <TableHead className="text-table-header">Time</TableHead>
                      <TableHead className="text-table-header">Coin</TableHead>
                      <TableHead className="text-table-header">Side</TableHead>
                      <TableHead className="text-table-header text-right">Px</TableHead>
                      <TableHead className="text-table-header text-right">Notional</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(fills.data ?? []).map((f) => (
                      <TableRow key={f.hash} className="border-border-subtle">
                        <TableCell className="text-xs text-text-secondary whitespace-nowrap">{f.time}</TableCell>
                        <TableCell className="text-sm text-white">{f.coin}</TableCell>
                        <TableCell className="text-sm text-text-secondary">{f.side}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{f.px}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{formatUsd(f.notional)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Leaderboard</h2>
            <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
              {leaderboard.error ? (
                <div className="p-4 text-sm text-rose-400">{leaderboard.error.message}</div>
              ) : leaderboard.isLoading ? (
                <div className="p-8 text-center text-text-muted text-sm">Loading…</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-subtle hover:bg-transparent">
                      <TableHead className="text-table-header">Trader</TableHead>
                      <TableHead className="text-table-header text-right">Volume</TableHead>
                      <TableHead className="text-table-header text-right">Fees</TableHead>
                      <TableHead className="text-table-header text-right">PnL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(leaderboard.data ?? []).map((r) => (
                      <TableRow key={r.trader} className="border-border-subtle">
                        <TableCell className="text-xs font-mono text-text-secondary break-all">{r.trader}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{formatUsd(r.total_volume)}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-text-secondary">
                          {formatUsd(r.total_fees)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-white">
                          {formatUsd(r.pnl_realized)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Trader stats</h2>
            <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
              {statsTraders.error ? (
                <div className="p-4 text-sm text-rose-400">{statsTraders.error.message}</div>
              ) : statsTraders.isLoading ? (
                <div className="p-8 text-center text-text-muted text-sm">Loading…</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-subtle hover:bg-transparent">
                      <TableHead className="text-table-header">Trader</TableHead>
                      <TableHead className="text-table-header">Coin</TableHead>
                      <TableHead className="text-table-header text-right">Volume</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(statsTraders.data ?? []).map((r, i) => (
                      <TableRow key={`${r.trader}-${r.coin}-${i}`} className="border-border-subtle">
                        <TableCell className="text-xs font-mono text-text-secondary break-all max-w-[140px]">
                          {r.trader}
                        </TableCell>
                        <TableCell className="text-sm text-white">{r.coin}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{formatUsd(r.total_volume)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Chart coin</span>
            {(assets.data ?? []).length === 0 ? (
              <span className="text-sm text-text-muted">Load assets first (Markets tab).</span>
            ) : (
              <Select value={coinForCharts || (assets.data ?? [])[0]?.ticker} onValueChange={setChartCoin}>
                <SelectTrigger className="glass-input w-full sm:w-72 max-w-md">
                  <SelectValue placeholder="Select ticker" />
                </SelectTrigger>
                <SelectContent>
                  {(assets.data ?? []).map((a) => (
                    <SelectItem key={a.ticker} value={a.ticker}>
                      {a.ticker}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-label">OHLCV close</h3>
            <div className="glass-panel rounded-2xl border border-border-subtle p-4 min-h-[240px]">
              {!coinForCharts ? (
                <ChartEmpty message="Select a coin or wait for assets to load." />
              ) : ohlcv.error ? (
                <ChartError message={ohlcv.error.message} />
              ) : ohlcv.isLoading ? (
                <ChartLoading />
              ) : closeSeries.length === 0 ? (
                <ChartEmpty message="No OHLCV bars for this selection." />
              ) : (
                <AuroraAreaChart
                  data={closeSeries}
                  height={260}
                  lineColor={chartColors.cyan}
                  formatValue={(v) => v.toFixed(4)}
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-label">Oracle mark close</h3>
            <div className="glass-panel rounded-2xl border border-border-subtle p-4 min-h-[240px]">
              {!coinForCharts ? (
                <ChartEmpty message="Select a coin or wait for assets to load." />
              ) : oracle.error ? (
                <ChartError message={oracle.error.message} />
              ) : oracle.isLoading ? (
                <ChartLoading />
              ) : markSeries.length === 0 ? (
                <ChartEmpty message="No oracle buckets for this DEX." />
              ) : (
                <AuroraAreaChart
                  data={markSeries}
                  height={260}
                  lineColor={chartColors.gold}
                  formatValue={(v) => v.toFixed(4)}
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="auctions" className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Current auction</h2>
            <div className="glass-panel rounded-2xl border border-border-subtle p-4">
              {auctionCur.error ? (
                <p className="text-sm text-rose-400">{auctionCur.error.message}</p>
              ) : auctionCur.isLoading ? (
                <p className="text-sm text-text-muted">Loading…</p>
              ) : !auctionCur.data ? (
                <p className="text-sm text-text-muted">No data.</p>
              ) : (
                <pre className="text-xs text-text-secondary overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(auctionCur.data, null, 2)}
                </pre>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Open &amp; recent</h2>
            <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
              {auctions.error ? (
                <div className="p-4 text-sm text-rose-400">{auctions.error.message}</div>
              ) : auctions.isLoading ? (
                <div className="p-8 text-sm text-text-muted">Loading…</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-subtle hover:bg-transparent">
                      <TableHead className="text-table-header">Status</TableHead>
                      <TableHead className="text-table-header text-right">Current gas</TableHead>
                      <TableHead className="text-table-header">End</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(auctions.data ?? []).map((a) => (
                      <TableRow key={a.auction_id} className="border-border-subtle">
                        <TableCell className="text-sm text-white">{a.status}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{a.current_gas}</TableCell>
                        <TableCell className="text-xs text-text-secondary">{a.end_time_scheduled}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
              History (this DEX)
            </h2>
            <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
              {auctionHist.error ? (
                <div className="p-4 text-sm text-rose-400">{auctionHist.error.message}</div>
              ) : auctionHist.isLoading ? (
                <div className="p-8 text-sm text-text-muted">Loading…</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-subtle hover:bg-transparent">
                      <TableHead className="text-table-header">Time</TableHead>
                      <TableHead className="text-table-header">Coin</TableHead>
                      <TableHead className="text-table-header">Status</TableHead>
                      <TableHead className="text-table-header text-right">Cleared px</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(auctionHist.data ?? []).map((h, i) => (
                      <TableRow key={`${h.auction_id}-${i}`} className="border-border-subtle">
                        <TableCell className="text-xs text-text-secondary whitespace-nowrap">{h.time}</TableCell>
                        <TableCell className="text-sm text-white">{h.coin}</TableCell>
                        <TableCell className="text-sm text-text-secondary">{h.status}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{h.cleared_px}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
