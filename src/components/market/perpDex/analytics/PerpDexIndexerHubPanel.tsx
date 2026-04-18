"use client";

import { motion } from "framer-motion";
import { Activity, BarChart2, Flame, Gavel, TrendingUp, Wallet } from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";
import { DataTable } from "@/components/common/DataTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableHeadLabel,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import {
  useHip3IndexerOverview,
  useHip3IndexerTopMovers,
  useHip3IndexerAuctionCurrent,
  useHip3GossipStatus,
} from "@/services/indexer/hip3";
import { IndexerSourceBanner } from "./IndexerSourceBanner";

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.32 },
  }),
} as const;

export function PerpDexIndexerHubPanel() {
  const { format } = useNumberFormat();
  const overview = useHip3IndexerOverview();
  const movers = useHip3IndexerTopMovers(10);
  const auction = useHip3IndexerAuctionCurrent();
  const gossip = useHip3GossipStatus();

  const o = overview.data;
  const loadingHub = overview.isInitialLoading || movers.isInitialLoading;

  const gossipSummary =
    gossip.data && typeof gossip.data === "object"
      ? Object.entries(gossip.data)
          .slice(0, 4)
          .map(([k, v]) => `${k}: ${String(v)}`)
          .join(" · ")
      : null;

  const cards = [
    {
      title: "DEXs (indexed)",
      value: o ? String(o.total_dexs) : "—",
      icon: <Wallet className="h-4 w-4 text-brand-accent" />,
    },
    {
      title: "Assets",
      value: o ? String(o.total_assets) : "—",
      icon: <BarChart2 className="h-4 w-4 text-emerald-400" />,
    },
    {
      title: "24h volume (indexed)",
      value:
        o && o.total_volume_24h != null
          ? formatNumber(o.total_volume_24h, format, {
              maximumFractionDigits: 0,
              currency: "$",
              showCurrency: true,
            })
          : "—",
      icon: <TrendingUp className="h-4 w-4 text-brand-accent" />,
    },
    {
      title: "24h trades",
      value: o ? formatNumber(o.total_trades_24h, format, { maximumFractionDigits: 0 }) : "—",
      icon: <Activity className="h-4 w-4 text-brand-gold" />,
    },
    {
      title: "Open interest (indexed)",
      value:
        o && o.total_open_interest != null
          ? formatNumber(o.total_open_interest, format, {
              maximumFractionDigits: 0,
              currency: "$",
              showCurrency: true,
            })
          : "—",
      icon: <Flame className="h-4 w-4 text-emerald-400" />,
    },
    {
      title: "Active auctions",
      value: o != null ? String(o.active_auctions) : "—",
      icon: <Gavel className="h-4 w-4 text-brand-gold" />,
    },
  ];

  return (
    <div className="space-y-4">
      <IndexerSourceBanner subtitle="Indexer aggregates (HypeDexer). Refreshes about every minute." />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card, i) => (
          <motion.div key={card.title} custom={i} initial="hidden" animate="visible" variants={cardVariants}>
            <StatsCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              isLoading={loadingHub}
              className="glass-panel h-full"
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="glass-panel overflow-hidden"
        >
          <div className="border-b border-border-subtle px-4 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Top movers (24h, indexed)
            </h2>
          </div>
          <DataTable
            isLoading={movers.isInitialLoading}
            error={movers.error}
            isEmpty={!movers.data?.length && !movers.isInitialLoading}
            emptyState={{ title: "No mover data", description: "Indexer returned an empty set." }}
            className="!border-none !bg-transparent !shadow-none backdrop-blur-none"
          >
            <Table className="w-full min-w-[480px]">
              <TableHeader>
                <TableRow className="border-b border-border-subtle hover:bg-transparent">
                  <TableHead className="py-3 px-3">
                    <TableHeadLabel>Coin</TableHeadLabel>
                  </TableHead>
                  <TableHead className="py-3 px-3">
                    <TableHeadLabel>DEX</TableHeadLabel>
                  </TableHead>
                  <TableHead className="py-3 px-3 text-right">
                    <TableHeadLabel align="right">Vol 24h</TableHeadLabel>
                  </TableHead>
                  <TableHead className="py-3 px-3 text-right">
                    <TableHeadLabel align="right">OI</TableHeadLabel>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(movers.data ?? []).map((row) => (
                  <TableRow
                    key={`${row.coin}-${row.dex_id}`}
                    className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="py-3 px-3 text-table-cell">{row.coin}</TableCell>
                    <TableCell className="py-3 px-3 text-table-cell">{row.dex_id}</TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(row.volume_24h, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right text-table-cell tabular-nums">
                      {formatNumber(row.open_interest, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTable>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.35 }}
          className="glass-panel p-4 space-y-4"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Current HIP-3 auction</h2>
          <DataTable
            isLoading={auction.isInitialLoading}
            error={auction.error}
            isEmpty={!auction.data && !auction.isInitialLoading}
            emptyState={{ title: "No current auction", description: "Indexer has no active auction row." }}
            className="!border-none !bg-transparent !shadow-none"
          >
            {auction.data ? (
              <dl className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">Status</dt>
                  <dd className="text-white font-medium">{auction.data.status}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">Current gas</dt>
                  <dd className="text-table-cell tabular-nums">{auction.data.current_gas}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">Floor HYPE</dt>
                  <dd className="text-table-cell tabular-nums">{auction.data.floor_price_hype}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">Winner</dt>
                  <dd className="text-brand-accent truncate max-w-[200px]">
                    {auction.data.winner_address ?? "—"}
                  </dd>
                </div>
              </dl>
            ) : null}
          </DataTable>

          <div className="border-t border-border-subtle pt-3 space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              Gossip priority fees (status)
            </h3>
            <DataTable
              isLoading={gossip.isInitialLoading}
              error={gossip.error}
              isEmpty={!gossipSummary && !gossip.isInitialLoading}
              emptyState={{ title: "No gossip status", description: "Upstream returned an empty payload." }}
              className="!border-none !bg-transparent !shadow-none"
            >
              {gossipSummary ? (
                <p className="text-xs text-text-muted break-words">{gossipSummary}</p>
              ) : null}
            </DataTable>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
