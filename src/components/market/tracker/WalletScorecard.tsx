"use client";

import { useMemo } from "react";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  KpiRibbon,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
  Skeleton,
  type KpiCell,
} from "@/components/common";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import {
  useWalletPerformance,
  useWalletCoins,
  useWalletOverview,
} from "@/services/market/tracker/wallet-performance";

interface WalletScorecardProps {
  address: string;
}

const signedUsd = (v: number) => `${v >= 0 ? "+" : "-"}${compactUsd(Math.abs(v))}`;

/**
 * Trading scorecard for a wallet — win rate, profit factor, drawdown, realized
 * PnL, plus a per-coin breakdown. Every figure is aggregated server-side by the
 * indexer, so this component only formats validated numbers; it runs no
 * client-side performance maths. Hidden for wallets with no HL trades.
 */
export function WalletScorecard({ address }: WalletScorecardProps) {
  const { performance: perf, isLoading: perfLoading, error: perfError } =
    useWalletPerformance(address);
  const { coins } = useWalletCoins(address, 8);
  const { overview } = useWalletOverview(address);

  const cells = useMemo<KpiCell[]>(() => {
    if (!perf) return [];
    return [
      {
        key: "pnl",
        label: "Realized PnL",
        value: signedUsd(perf.total_pnl),
        sub: "all-time",
        tone: perf.total_pnl >= 0 ? "success" : "danger",
      },
      {
        key: "winrate",
        label: "Win rate",
        value: `${(perf.win_rate * 100).toFixed(1)}%`,
        sub: `${compactCount(perf.wins)}W / ${compactCount(perf.losses)}L`,
      },
      {
        key: "pf",
        label: "Profit factor",
        value: `${perf.profit_factor.toFixed(2)}x`,
        sub: "gross W / L",
        tone: perf.profit_factor >= 1 ? "success" : "danger",
      },
      {
        key: "avgwl",
        label: "Avg win / loss",
        value: `$${perf.avg_win.toFixed(2)} / $${perf.avg_loss.toFixed(2)}`,
        sub: "per trade",
      },
      {
        key: "dd",
        label: "Max drawdown",
        value: compactUsd(perf.max_drawdown),
        sub: "peak-to-trough",
        tone: "danger",
      },
      {
        key: "trades",
        label: "Trades",
        value: compactCount(perf.total_trades),
        sub: `avg ${compactUsd(perf.avg_trade_size)}`,
      },
    ];
  }, [perf]);

  // Loading skeleton (first paint only).
  if (perfLoading && !perf) {
    return (
      <Card className="p-4">
        <Skeleton className="h-24 rounded" />
      </Card>
    );
  }

  // No HL trading history (or the endpoint failed) — stay out of the way rather
  // than showing an empty card, since this layout is shared with on-chain-only
  // addresses.
  if (perfError || !perf || perf.total_trades === 0) return null;

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Trophy size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Trading scorecard</h3>
        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          all-time
        </span>
      </div>

      {overview && (
        <div className="px-3.5 py-2 border-b border-border-subtle text-[11px] text-text-tertiary flex flex-wrap gap-x-3 gap-y-0.5">
          <span>
            <span className="mono text-text-secondary">{compactCount(overview.unique_coins)}</span> markets
          </span>
          <span>·</span>
          <span>
            <span className="mono text-text-secondary">{compactUsd(overview.total_volume)}</span> lifetime volume
          </span>
          <span>·</span>
          <span>
            <span className="mono text-text-secondary">{compactUsd(overview.total_fees)}</span> fees paid
          </span>
        </div>
      )}

      <KpiRibbon cells={cells} />

      {coins.length > 0 && (
        <div className="border-t border-border-subtle">
          <div className="px-3.5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
            By coin · top {coins.length}
          </div>
          <ModuleTable
            density="compact"
            columns={[
              { header: "Coin", align: "left" },
              { header: "Volume", align: "right" },
              { header: "Realized PnL", align: "right" },
              { header: "Fills", align: "right" },
            ]}
          >
            {coins.map((c) => (
              <ModuleTableRow
                key={c.coin}
                cells={[
                  <ModuleAsset key="c" tone="neutral" assetName={c.coin} kind="auto" name={c.coin} />,
                  <span key="v" className="mono text-text-secondary">
                    {compactUsd(c.total_volume)}
                  </span>,
                  <span
                    key="p"
                    className={`mono font-medium ${c.total_pnl >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {signedUsd(c.total_pnl)}
                  </span>,
                  <span key="f" className="mono text-text-tertiary">
                    {compactCount(c.fill_count)}
                  </span>,
                ]}
              />
            ))}
          </ModuleTable>
        </div>
      )}

      <div className="px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        Aggregated server-side from the wallet&apos;s full fill history.
      </div>
    </Card>
  );
}
